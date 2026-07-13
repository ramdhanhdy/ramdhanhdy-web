import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { projects } from '../../lib/content';
import { curtainTransition } from '../../lib/curtain';

gsap.registerPlugin(useGSAP);

// ── Configuration ──────────────────────────────────────────
const CARD_W = 580;
const CARD_H = 380;
const PERSPECTIVE = 1600;
const DEG = 180 / Math.PI;

// Card-draw hover: every non-front card slides right; the one visible card
// nearest the camera stays in place and responds with restrained depth only.
const DRAW_X = 240;       // px to the right for non-front cards
const DRAW_Z = 56;        // subtle lift toward the viewer
const DRAW_LIFT = 10;     // px upward
const DRAW_SCALE = 0.015;
const FRONT_DRAW_Z = 32;
const FRONT_DRAW_SCALE = 0.01;

const getCardOpacity = (offset) => {
  let opacity = 1;
  if (offset > 2.5) opacity = 1 - (offset - 2.5) * 1.5;
  if (offset < -1.5) opacity = 1 - Math.abs(offset + 1.5) * 2;
  return Math.max(0, opacity);
};

export default function Overview3D() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const stackRef = useRef(null);
  const scrollPos = useRef(0);           // virtual scroll accumulator
  const targetScroll = useRef(0);        // target (for smooth lerp)
  const cardEls = useRef([]);
  const rafId = useRef(null);
  const touchY = useRef(null);
  const touchStartY = useRef(null);
  const didTouchMove = useRef(false);
  // Per-card hover factor (0..1). The rAF layout loop owns every transform,
  // so hover is folded into the layout math instead of tweening the element
  // directly (which the loop would overwrite each frame).
  const hoverAmts = useRef(projects.map(() => ({ v: 0 })));

  // Position all cards based on the current virtual scroll offset
  const layoutCards = useCallback(() => {
    const cards = cardEls.current;
    const total = cards.length;
    if (!total) return;

    const mid = (total - 1) / 2;
    const half = total / 2;
    const viewportWidth = containerRef.current?.clientWidth ?? CARD_W + 48;
    const isMobile = viewportWidth < 640;
    const isResponsive = viewportWidth < 1100;
    const tabletProgress = Math.max(0, Math.min(1, (viewportWidth - 640) / 460));
    const cardScale = isMobile
      ? Math.min(0.62, Math.max(0.44, (viewportWidth - 48) / CARD_W))
      : isResponsive
        ? 0.68 + tabletProgress * 0.32
        : 1;
    const spacingScale = isMobile ? 0.64 : cardScale;
    const offsets = cards.map((_, i) => {
      const rawOffset = (i - mid) - scrollPos.current;
      return ((rawOffset + half) % total + total) % total - half;
    });

    // Exactly one card owns the front interaction: the visible card nearest
    // the camera. This matches the card the eye reads as the top of the deck,
    // while excluding cards that have already faded out near the camera.
    const frontIndex = offsets.reduce((closestIndex, offset, i) => {
      if (getCardOpacity(offset) < 0.3) return closestIndex;
      if (closestIndex === -1 || offset < offsets[closestIndex]) return i;
      return closestIndex;
    }, -1);

    cards.forEach((card, i) => {
      if (!card) return;
      const draw = card.querySelector('.tunnel-card-draw');
      if (!draw) return;

      // Base rotation — elevated bird's eye, cards upright
      const baseRotX = 8;
      const baseRotY = -38;
      const baseRotZ = -2;

      // The core math: the physical index minus the midpoint, shifted by the scroll amount.
      // When scrollPos increases (scrolling down), 'offset' becomes more negative
      const offset = offsets[i];

      // offset now smoothly sweeps from +4 down to -4, then snaps back to +4
      // -negative offset = close to camera (Z is positive)
      // +positive offset = deep in background (Z is negative)

      const zShift = offset * -280 * spacingScale;
      const xShift = offset * 180 * spacingScale;
      const yShift = offset * -55 * spacingScale;

      // PERSPECTIVE-SHEAR COMPENSATION:
      // Every card shares the same base rotation, but perspective projects
      // each one along a different sight line depending on its x/y position
      // relative to the perspective origin — cards far from the axis appear
      // more skewed ("tilted image") than cards near it. Compensate by the
      // angle each card subtends from the camera so the APPARENT angle is
      // uniform across the whole stack.
      const depth = PERSPECTIVE - zShift; // effective distance to camera
      const compY = Math.atan2(xShift, depth) * DEG;
      const compX = Math.atan2(yShift, depth) * DEG;

      // Smooth opacity fading at the absolute front and back of the queue
      const opacity = getCardOpacity(offset);

      const hover = hoverAmts.current[i]?.v ?? 0;
      const isFront = i === frontIndex;

      gsap.set(card, {
        rotationX: baseRotX + compX,
        rotationY: baseRotY - compY,
        rotationZ: baseRotZ,
        z: zShift,
        x: xShift,
        y: yShift,
        scale: cardScale,
        opacity,
        // Faded-out cards must not swallow hover/clicks
        pointerEvents: opacity < 0.3 ? 'none' : 'auto',
        // z-index must be highest for cards closest to camera (most negative offset)
        zIndex: Math.round((half - offset) * 100 + hover * 1000),
      });

      // The outer card remains a stable hover target while the visible face
      // and its callout draw out together in the card's local 3D plane.
      gsap.set(draw, {
        z: hover * (isFront ? FRONT_DRAW_Z : DRAW_Z),
        x: isFront ? 0 : hover * DRAW_X * cardScale,
        y: isFront ? 0 : -hover * DRAW_LIFT,
        scale: 1 + hover * (isFront ? FRONT_DRAW_SCALE : DRAW_SCALE),
      });
    });
  }, []);

  useGSAP(() => {
    cardEls.current = gsap.utils.toArray('.tunnel-card');

    // Initial layout
    layoutCards();

    // Entrance animation: fade everything in
    gsap.from(containerRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: 'power2.out',
    });

    // ── Scroll-driven traversal ──
    const handleWheel = (e) => {
      e.preventDefault(); // Explicitly block native scroll to prevent Edge wiggling
      // 100px wheel = 0.5 offset change. Tweak multiplier for scroll speed sensitivity.
      targetScroll.current += e.deltaY * 0.002;
    };

    const handleTouchStart = (e) => {
      const nextY = e.touches[0]?.clientY;
      if (nextY == null) return;
      touchY.current = nextY;
      touchStartY.current = nextY;
      didTouchMove.current = false;
    };

    const handleTouchMove = (e) => {
      const nextY = e.touches[0]?.clientY;
      if (nextY == null || touchY.current == null) return;
      e.preventDefault();
      if (Math.abs(nextY - touchStartY.current) > 6) didTouchMove.current = true;
      targetScroll.current += (touchY.current - nextY) * 0.006;
      touchY.current = nextY;
    };

    const handleTouchEnd = () => {
      touchY.current = null;
      touchStartY.current = null;
    };

    // Smooth animation loop: lerp toward target scroll
    const tick = () => {
      scrollPos.current += (targetScroll.current - scrollPos.current) * 0.08;
      layoutCards();
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    const container = containerRef.current;
    if (container) {
      // Use wheel event (passive: false is REQUIRED to use preventDefault and block native scroll)
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      container.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    }

    // (Mouse parallax removed: cards stand completely static when cursor moves)

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchEnd);
      }
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, { scope: containerRef });

  // ── Card-draw hover + callout ──
  const handleCardEnter = (index, card) => {
    if (window.matchMedia('(hover: none)').matches) return;
    const amt = hoverAmts.current[index];
    gsap.killTweensOf(amt);
    gsap.to(amt, { v: 1, duration: 0.45, ease: 'power3.out' });

    const callout = card.querySelector('.callout');
    const path = card.querySelector('.callout-path');
    const marker = card.querySelector('.callout-marker');
    const label = card.querySelector('.callout-label');
    gsap.killTweensOf([callout, path, marker, label]);

    gsap.set(callout, { autoAlpha: 1 });
    gsap.fromTo(
      marker,
      { scale: 0 },
      { scale: 1, duration: 0.25, ease: 'back.out(3)', transformOrigin: '50% 50%' }
    );
    // Leader line draws outward from the card, corner by corner
    gsap.fromTo(
      path,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.4, ease: 'power2.inOut' }
    );
    gsap.fromTo(
      label,
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.3, delay: 0.18, ease: 'power2.out' }
    );
  };

  const handleCardLeave = (index, card) => {
    if (window.matchMedia('(hover: none)').matches) return;
    const amt = hoverAmts.current[index];
    gsap.killTweensOf(amt);
    gsap.to(amt, { v: 0, duration: 0.4, ease: 'power3.out' });

    const callout = card.querySelector('.callout');
    gsap.killTweensOf(callout);
    gsap.to(callout, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' });
  };

  const handleCardClick = (slug) => {
    if (didTouchMove.current) {
      didTouchMove.current = false;
      return;
    }
    curtainTransition(() => navigate(`/work/${slug}`));
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden cursor-default md:cursor-ns-resize touch-none"
      style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: '50% 15%' }}
    >
      <div
        ref={stackRef}
        className="relative"
        style={{
          transformStyle: 'preserve-3d',
          width: `${CARD_W}px`,
          height: `${CARD_H}px`,
        }}
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            onClick={() => handleCardClick(project.slug)}
            onMouseEnter={(e) => handleCardEnter(index, e.currentTarget)}
            onMouseLeave={(e) => handleCardLeave(index, e.currentTarget)}
            className="tunnel-card absolute cursor-pointer group"
            style={{
              width: `${CARD_W}px`,
              height: `${CARD_H}px`,
              top: 0,
              left: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transformOrigin: 'center center',
            }}
          >
            <div
              className="tunnel-card-draw relative w-full h-full"
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
            >
              {/* Card face — clipping/rounding lives here so the callout can overflow the card */}
              <div
                className="relative w-full h-full rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl"
                style={{ transform: 'translateZ(0)' /* Mitigate Chrome/Safari border-radius rendering bugs */ }}
              >
              {project.image ? (
                <>
                  {/* Depth overlay — gets darker for deeper cards */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                  {/* Permanent contrast behind titles on bright cover art */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-10 pointer-events-none" />

                  {/* Project image */}
                  <img
                    src={project.image}
                    alt={project.title}
                    className="object-cover w-full h-full"
                    loading="eager"
                    decoding="async"
                    width={CARD_W}
                    height={CARD_H}
                  />

                  {/* Bottom-left text overlay */}
                  <div className="absolute bottom-5 left-6 z-20 flex flex-col gap-1">
                    <h2 className="text-xl font-semibold text-white drop-shadow-lg">
                      {project.title}
                    </h2>
                  </div>

                  {/* Year badge */}
                  <div className="absolute bottom-5 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-xs text-zinc-400 font-mono">{project.year}</span>
                  </div>
                </>
              ) : (
                /* Text-only card — typography is the hero, no image */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-10 bg-zinc-950">
                  {/* Subtle dot-grid texture */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  {/* Depth overlay for consistency with image cards */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500 z-10" />

                  {/* Neon diamond mark */}
                  <div className="relative z-20 w-2 h-2 rotate-45 bg-neon mb-2" />

                  {/* Project title — the hero */}
                  <h2 className="relative z-20 text-3xl md:text-4xl font-semibold tracking-tight text-white text-center leading-tight">
                    {project.title}
                  </h2>

                  {/* Category + role in mono */}
                  <div className="relative z-20 flex flex-col items-center gap-1">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-neon/80">
                      {project.category}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                      {project.role}
                    </span>
                  </div>

                  {/* Year badge */}
                  <div className="absolute bottom-5 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-xs text-zinc-400 font-mono">{project.year}</span>
                  </div>
                </div>
              )}
              </div>

            {/* Floating callout — angular leader line + project identity.
                Lives in the card's 3D plane so it preserves the card's angle. */}
              <div
                className="callout absolute -top-16 right-6 opacity-0 pointer-events-none"
                style={{ width: 280, height: 76 }}
              >
              <svg
                className="absolute inset-0 overflow-visible"
                width="280"
                height="76"
                viewBox="0 0 280 76"
                fill="none"
                aria-hidden="true"
              >
                {/* Bent-wire leader: vertical rise, 45° fold, horizontal run */}
                <path
                  className="callout-path"
                  d="M8 84 L8 50 L40 18 L276 18"
                  stroke="#C6FF00"
                  strokeWidth="1.5"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset="1"
                />
                {/* Diamond anchor pinned to the card */}
                <rect
                  className="callout-marker"
                  x="4"
                  y="80"
                  width="8"
                  height="8"
                  transform="rotate(45 8 84)"
                  fill="#C6FF00"
                />
              </svg>
              <div
                className="callout-label absolute right-0 top-[18px] -translate-y-1/2 opacity-0 min-w-[218px] bg-black/90 backdrop-blur-sm border border-neon/50 px-3 py-2 font-mono whitespace-nowrap"
              >
                <span className="block text-[11px] font-semibold tracking-[0.06em] text-white">
                  {project.title}
                </span>
                <span className="mt-1 block text-[9px] uppercase tracking-[0.2em] text-neon">
                  0{project.id} · {project.category}
                </span>
              </div>
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
