import { useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { projects } from '../../lib/data';

gsap.registerPlugin(useGSAP);

// ── Configuration ──────────────────────────────────────────
const CARD_W = 580;
const CARD_H = 380;

export default function Overview3D() {
  const containerRef = useRef(null);
  const stackRef = useRef(null);
  const scrollPos = useRef(0);           // virtual scroll accumulator
  const targetScroll = useRef(0);        // target (for smooth lerp)
  const cardEls = useRef([]);
  const rafId = useRef(null);

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

      // Smooth opacity fading at the absolute front and back of the queue
      let opacity = 1;
      // Fade out as it wraps to the back of the line
      if (offset > 2.5) opacity = 1 - (offset - 2.5) * 1.5;
      // Fade out as it passes behind the camera
      if (offset < -1.5) opacity = 1 - Math.abs(offset + 1.5) * 2;

      gsap.set(card, {
        rotationX: baseRotX,
        rotationY: baseRotY,
        rotationZ: baseRotZ,
        z: zShift,
        x: xShift,
        y: yShift,
        opacity: Math.max(0, opacity),
        // z-index must be highest for cards closest to camera (most negative offset)
        zIndex: Math.round((half - offset) * 100),
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

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden cursor-ns-resize"
      style={{ perspective: '1600px', perspectiveOrigin: '50% 15%' }}
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
            className="tunnel-card absolute rounded-xl overflow-hidden cursor-pointer group border border-white/[0.08] shadow-2xl"
            style={{
              width: `${CARD_W}px`,
              height: `${CARD_H}px`,
              top: 0,
              left: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)', // Mitigate Chrome/Safari border-radius rendering bugs
              transformOrigin: 'center center',
            }}
          >
            {/* Depth overlay — gets darker for deeper cards */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500 z-10" />

            {/* Project image */}
            <img
              src={project.image}
              alt={project.title}
              className="object-cover w-full h-full"
              loading="eager"
            />

            {/* Bottom-left text overlay */}
            <div className="absolute bottom-5 left-6 z-20 flex flex-col gap-1">
              <span className="text-neon/80 text-xs uppercase tracking-[0.2em] font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                {project.category}
              </span>
              <h2 className="text-xl font-semibold text-white drop-shadow-lg">
                {project.title}
              </h2>
            </div>

            {/* Year badge */}
            <div className="absolute bottom-5 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-xs text-zinc-400 font-mono">{project.year}</span>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
