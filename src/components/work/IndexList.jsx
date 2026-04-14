import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { projects } from '../../lib/data';

gsap.registerPlugin(useGSAP);

export default function IndexList() {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [activeImage, setActiveImage] = useState(null);

  useGSAP(() => {
    // Entrance animation for list items
    gsap.from('.list-item', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.2
    });

    // Create highly performant GSAP setters for mouse tracking
    const xTo = gsap.quickTo(imageRef.current, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(imageRef.current, "y", { duration: 0.4, ease: "power3" });

    const handleMouseMove = (e) => {
      // Offset by half the image width/height so it centers on cursor
      xTo(e.clientX - 150); 
      yTo(e.clientY - 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, { scope: containerRef });

  const handleMouseEnter = (imgSrc) => {
    setActiveImage(imgSrc);
    gsap.to(imageRef.current, {
      opacity: 1,
      scale: 1,
      rotation: Math.random() * 10 - 5, // Slight random tilt
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    gsap.to(imageRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: "power2.in"
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center pt-24 pb-12 px-8 overflow-y-auto no-scrollbar">
      <div className="w-full max-w-5xl flex flex-col gap-2">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500 mb-4 list-item">
          <div className="col-span-1">ID</div>
          <div className="col-span-6">Title</div>
          <div className="col-span-4">Category</div>
          <div className="col-span-1 text-right">Year</div>
        </div>

        {/* List Items */}
        {projects.map((project) => (
          <div
            key={project.id}
            className="list-item group grid grid-cols-12 gap-4 py-6 border-b border-zinc-800/50 hover:border-neon items-center cursor-pointer transition-colors duration-300"
            onMouseEnter={() => handleMouseEnter(project.image)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="col-span-1 text-zinc-600 group-hover:text-neon transition-colors font-mono text-sm">
              0{project.id}
            </div>
            <div className="col-span-6 text-4xl sm:text-5xl lg:text-7xl font-medium tracking-tight text-zinc-400 group-hover:text-white transition-colors duration-300">
              {project.title}
            </div>
            <div className="col-span-4 text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">
              {project.category}
            </div>
            <div className="col-span-1 text-right text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">
              {project.year}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Image Preview */}
      <div 
        ref={imageRef}
        className="fixed top-0 left-0 w-[300px] h-[200px] pointer-events-none z-50 opacity-0 scale-75 shadow-2xl rounded-sm overflow-hidden bg-zinc-900 border border-zinc-800"
      >
        {activeImage ? (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-sm relative">
             <div className="absolute inset-0 bg-neon mix-blend-overlay opacity-20"></div>
             {activeImage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
