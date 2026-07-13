import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import TransitionLink from '../components/TransitionLink';
import Meta from '../components/Meta';

gsap.registerPlugin(useGSAP);

export default function NotFound() {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      gsap.from('.nf-reveal', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all',
      });
      gsap.to('.nf-star', {
        rotation: 360,
        duration: 24,
        repeat: -1,
        ease: 'none',
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-screen h-dvh bg-black flex flex-col items-center justify-center gap-8 sm:gap-10 px-6 sm:px-8 pt-16"
    >
      <Meta title="404" description="Nothing here." />

      <svg
        className="nf-star nf-reveal w-12 h-12 sm:w-16 sm:h-16 text-neon"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
      </svg>

      <h1 className="nf-reveal text-6xl sm:text-7xl md:text-9xl font-semibold tracking-tighter text-white">
        404
      </h1>
      <p className="nf-reveal font-mono text-sm uppercase tracking-widest text-zinc-500">
        Nothing here
      </p>
      <TransitionLink
        to="/"
        className="nf-reveal px-6 py-3 rounded-full border border-zinc-800 text-sm text-white hover:bg-neon hover:text-black hover:border-neon transition-colors duration-300"
      >
        Back to work
      </TransitionLink>
    </div>
  );
}
