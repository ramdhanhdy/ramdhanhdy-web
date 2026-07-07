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

// Disc-throw hover: how far the card is flung toward the viewer
const THROW_Z = 240;      // px toward camera
const THROW_LIFT = 18;    // px upward
const THROW_YAW = 26;     // deg toward face-on
const THROW_PITCH = 6;    // deg toward face-on
const THROW_SPIN = 3;     // deg of disc-spin kick

export default function Overview3D() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const stackRef = useRef(null);
  const scrollPos = useRef(0);           // virtual scroll accumulator
  const targetScroll = useRef(0);        // target (for smooth lerp)
  const cardEls = useRef([]);
  const rafId = useRef(null);
  // Per-card hover factor (0..1). The rAF layout loop owns every transform,
  // so hover is folded into the layout math instead of tweening the element
  // directly (which the loop would overwrite each frame). `back.out` easing
  // overshoots past 1, which is what gives the throw its kinetic snap.
  const hoverAmts = useRef(projects.map(() => ({ v: 0 })));

  // Position all cards based on the current virtual scroll offset
  const layoutCards = useCallback(() => {
    const cards = cardEls.current;
    const total = cards.length;
    if (!total) return;

    const mid = (total - 1) / 2;

    cards.forEach((card, i) => {
      if (!card) return;

      // Base rotation — elevated bird's eye, cards upright
      const baseRotX = 8;
      const baseRotY = -38;
      const baseRotZ = -2;

      // The core math: the physical index minus the midpoint, shifted by the scroll amount.
      // When scrollPos increases (scrolling down), 'offset' becomes more negative
      let offset = (i - mid) - scrollPos.current;

      // INFINITE WRAP MAGIC:
      // We want the offset to forever loop between roughly -total/2 and +total/2
      const half = total / 2;
      // standard positive modulo hack
      offset = ((offset + half) % total + total) % total - half;

      // offset now smoothly sweeps from +4 down to -4, then snaps back to +4
      // -negative offset = close to camera (Z is positive)
      // +positive offset = deep in background (Z is negative)

      const zShift = offset * -280;
      const xShift = offset * 180;
      const yShift = offset * -55;

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
      let opacity = 1;
      // Fade out as it wraps to the back of the line
      if (offset > 2.5) opacity = 1 - (offset - 2.5) * 1.5;
      // Fade out as it passes behind the camera
      if (offset < -1.5) opacity = 1 - Math.abs(offset + 1.5) * 2;
      opacity = Math.max(0, opacity);

      const hover = hoverAmts.current[i]?.v ?? 0;

      gsap.set(card, {
        rotationX: baseRotX + compX - hover * THROW_PITCH,
        rotationY: baseRotY - compY + hover * THROW_YAW,
        rotationZ: baseRotZ + hover * THROW_SPIN,
        z: zShift + hover * THROW_Z,
        x: xShift,
        y: yShift - hover * THROW_LIFT,
        scale: 1 + hover * 0.04,
        opacity,
        // Faded-out cards must not swallow hover/clicks
        pointerEvents: opacity < 0.3 ? 'none' : 'auto',
        // z-index must be highest for cards closest to camera (most negative offset)
        zIndex: Math.round((half - offset) * 100 + hover * 1000),
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
    }

    // (Mouse parallax removed: cards stand completely static when cursor moves)

    return () => {
      if (container) container.removeEventListener('wheel', handleWheel);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, { scope: containerRef });

  // ── Disc-throw hover + callout ──
  const handleCardEnter = (index, card) => {
    const amt = hoverAmts.current[index];
    gsap.killTweensOf(amt);
    // Fast fling with overshoot — reads as "thrown", not "scaled up"
    gsap.to(amt, { v: 1, duration: 0.55, ease: 'back.out(2.4)' });

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
    const amt = hoverAmts.current[index];
    gsap.killTweensOf(amt);
    gsap.to(amt, { v: 0, duration: 0.5, ease: 'power3.out' });

    const callout = card.querySelector('.callout');
    gsap.killTweensOf(callout);
    gsap.to(callout, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden cursor-ns-resize"
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
            onClick={() => curtainTransition(() => navigate(`/work/${project.slug}`))}
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
            {/* Card face — clipping/rounding lives here so the callout can overflow the card */}
            <div
              className="relative w-full h-full rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl"
              style={{ transform: 'translateZ(0)' /* Mitigate Chrome/Safari border-radius rendering bugs */ }}
            >
              {project.image ? (
                <>
                  {/* Depth overlay — gets darker for deeper cards */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500 z-10" />

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

            {/* Floating callout — angular leader line + compact metadata tag.
                Lives in the card's 3D plane, so it tilts with the card and
                straightens as the throw turns the card toward the viewer. */}
            <div
              className="callout absolute -top-12 right-8 opacity-0 pointer-events-none"
              style={{ width: 200, height: 60 }}
            >
              <svg
                className="absolute inset-0 overflow-visible"
                width="200"
                height="60"
                viewBox="0 0 200 60"
                fill="none"
                aria-hidden="true"
              >
                {/* Bent-wire leader: vertical rise, 45° fold, horizontal run */}
                <path
                  className="callout-path"
                  d="M8 68 L8 42 L34 18 L196 18"
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
                  y="64"
                  width="8"
                  height="8"
                  transform="rotate(45 8 68)"
                  fill="#C6FF00"
                />
              </svg>
              <div
                className="callout-label absolute right-0 top-[18px] -translate-y-1/2 opacity-0 bg-black/85 backdrop-blur-sm border border-neon/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-neon whitespace-nowrap"
              >
                0{project.id} · {project.category}
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
