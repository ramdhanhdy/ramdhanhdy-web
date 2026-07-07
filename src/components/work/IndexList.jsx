import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { projects } from '../../lib/content';
import { curtainTransition } from '../../lib/curtain';

gsap.registerPlugin(useGSAP);

export default function IndexList() {
  const navigate = useNavigate();
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
      delay: 0.2,
      clearProps: 'all'
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling;
    const handleScroll = () => {
      document.body.classList.add('disable-hover');
      
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        document.body.classList.remove('disable-hover');
      }, 100);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.clearTimeout(isScrolling);
      document.body.classList.remove('disable-hover');
    };
  }, []);

  const handleMouseEnter = (imgSrc) => {
    setActiveImage(imgSrc);
    gsap.to(imageRef.current, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    gsap.to(imageRef.current, {
      opacity: 0,
      scale: 0.8,
      rotation: 0,
      duration: 0.3,
      ease: "power2.in"
    });
  };

  const handleRowClick = (e, slug) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    handleMouseLeave();
    curtainTransition(() => navigate(`/work/${slug}`));
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-start justify-center pt-32 pb-24 px-8 overflow-y-auto no-scrollbar"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)'
      }}
    >
      <div className="w-full max-w-5xl flex flex-col gap-2 group/list">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 pb-4 px-4 border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500 mb-4 list-item">
          <div className="col-span-1 sm:col-span-1">ID</div>
          <div className="col-span-9 sm:col-span-10">Project</div>
          <div className="col-span-2 sm:col-span-1 text-right">Year</div>
        </div>

        {/* List Items */}
        {projects.map((project) => (
          <a
            key={project.id}
            href={`/work/${project.slug}`}
            className="list-item group grid grid-cols-12 gap-4 py-8 px-4 rounded-xl border-b border-zinc-800/50 hover:border-transparent hover:bg-neon items-start cursor-pointer transition-colors duration-300 group-hover/list:opacity-30 hover:!opacity-100"
            onClick={(e) => handleRowClick(e, project.slug)}
            onMouseEnter={() => handleMouseEnter(project.image)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="col-span-1 sm:col-span-1 text-zinc-600 group-hover:text-zinc-900 transition-colors font-mono text-sm pt-5">
              0{project.id}
            </div>
            <div className="col-span-9 sm:col-span-10 flex flex-col gap-3 sm:gap-5">
              <div className="text-4xl sm:text-5xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-zinc-400 group-hover:text-zinc-900 transition-colors duration-300">
                {project.title}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-1">
                <div className="text-sm text-zinc-500 group-hover:text-zinc-800 transition-colors uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon group-hover:bg-zinc-800 transition-colors"></div>
                  {project.category}
                </div>
                {project.role && (
                  <div className="text-sm text-zinc-500 group-hover:text-zinc-800 transition-colors uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-zinc-800/50 transition-colors"></div>
                    {project.role}
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 text-right text-sm text-zinc-500 group-hover:text-zinc-900 transition-colors pt-5">
              {project.year}
            </div>
          </a>
        ))}
      </div>

      {/* Floating Image Preview */}
      <div 
        ref={imageRef}
        className="fixed top-0 left-0 w-[300px] h-[200px] pointer-events-none z-50 opacity-0 scale-75 shadow-2xl rounded-sm overflow-hidden bg-zinc-900 border border-zinc-800"
      >
        {activeImage ? (
          <div className="w-full h-full relative">
            <img src={activeImage} alt="Project Preview" className="w-full h-full object-cover" decoding="async" />
            <div className="absolute inset-0 bg-neon mix-blend-overlay opacity-20 pointer-events-none"></div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
