import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const bioLines = [
  "I started my journey in theoretical physics,",
  "fascinated by the fundamental laws governing reality.",
  "That obsession with complex systems naturally evolved",
  "into AI Engineering and Data Science.",
  "Now, I build agentic workflows and machine learning models",
  "that bridge the gap between abstract mathematics",
  "and tangible, human-centric solutions."
];

export default function About() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Page Entrance
    gsap.from('.bio-line', {
      opacity: 0,
      y: 20,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.3
    });
  }, { scope: containerRef });

  const handleMouseEnter = (e) => {
    gsap.to(e.currentTarget, {
      opacity: 1,
      color: '#ffffff', // target white
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = (e) => {
    gsap.to(e.currentTarget, {
      opacity: 0.3, // return to dimmed
      color: '#a1a1aa', // target zinc-400
      duration: 0.5,
      ease: 'power2.inOut'
    });
  };

  return (
    <div ref={containerRef} className="w-full h-screen bg-black flex items-center justify-center px-8">
      <div className="max-w-4xl space-y-4 cursor-default">
        {bioLines.map((line, i) => (
          <div
            key={i}
            className="bio-line text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter opacity-30 text-zinc-400 transition-colors"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {line}
          </div>
        ))}
      </div>
      
      {/* Accent decorative element */}
      <div className="absolute bottom-12 right-12 text-neon text-sm font-mono tracking-widest uppercase">
        <span className="inline-block w-2 h-2 rounded-full bg-neon mr-3 animate-pulse"></span>
        Available for new opportunities
      </div>
    </div>
  );
}
