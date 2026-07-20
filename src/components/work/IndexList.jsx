import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { projects } from '../../lib/content';
import { curtainTransition } from '../../lib/curtain';

gsap.registerPlugin(useGSAP);

const PREVIEW_WIDTH = 330;
const PREVIEW_HEIGHT = 220;
const PREVIEW_GAP = 28;
const PREVIEW_EDGE = 16;

export default function IndexList() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [activeProject, setActiveProject] = useState(null);

  useGSAP(() => {
    gsap.from('.list-item', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power4.out',
      delay: 0.15,
      clearProps: 'all',
    });

    const xTo = gsap.quickTo(imageRef.current, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(imageRef.current, 'y', { duration: 0.45, ease: 'power3' });

    const handleMouseMove = (e) => {
      const maxX = window.innerWidth - PREVIEW_WIDTH - PREVIEW_EDGE;
      const maxY = window.innerHeight - PREVIEW_HEIGHT - PREVIEW_EDGE;
      const preferredX = e.clientX + PREVIEW_GAP;
      const flippedX = e.clientX - PREVIEW_WIDTH - PREVIEW_GAP;

      xTo(Math.max(PREVIEW_EDGE, Math.min(
        preferredX <= maxX ? preferredX : flippedX,
        maxX,
      )));
      yTo(Math.max(PREVIEW_EDGE, Math.min(
        e.clientY - PREVIEW_HEIGHT / 2,
        maxY,
      )));
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

  const handleMouseEnter = (project) => {
    setActiveProject(project);
    gsap.killTweensOf(imageRef.current);
    gsap.to(imageRef.current, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.45,
      ease: 'power3.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.killTweensOf(imageRef.current);
    gsap.to(imageRef.current, {
      opacity: 0,
      scale: 0.85,
      rotation: 0,
      duration: 0.3,
      ease: 'power2.in',
    });
  };

  const handleRowClick = (e, slug) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    handleMouseLeave();
    curtainTransition(() => navigate(`/work/${slug}`));
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto no-scrollbar pt-32 sm:pt-40 pb-28 px-4 md:px-8 lg:px-12"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
        }}
      >
        <ul className="group/list mx-auto flex max-w-[90vw] flex-col border-y border-white/10">
          {projects.map((project, index) => (
            <li
              key={project.id}
              className="list-item group relative transition-none md:transition-opacity md:duration-500 md:ease-out md:group-hover/list:opacity-30 md:hover:!opacity-100"
            >
              <a
                href={`/work/${project.slug}`}
                className="relative grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-4 overflow-hidden px-3 py-6 transition-colors duration-500 ease-out hover:bg-neon sm:px-5 sm:py-8 md:grid-cols-[4.5rem_minmax(0,1fr)_auto] md:items-center md:gap-x-7 md:px-7 md:py-10"
                onClick={(e) => handleRowClick(e, project.slug)}
                onMouseEnter={() => handleMouseEnter(project)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex items-center gap-2 self-start font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 transition-colors duration-500 group-hover:text-zinc-900 sm:text-xs md:flex-col md:items-start md:gap-1 md:self-center">
                  <span>{String(project.id).padStart(2, '0')}</span>
                  <span className="h-px w-5 bg-zinc-700 transition-all duration-500 group-hover:w-8 group-hover:bg-zinc-900/50" />
                  <span>{project.year}</span>
                </div>

                <div className="col-span-2 min-w-0 md:col-span-1">
                  <h2 className="break-words text-[2rem] font-medium leading-[1.08] tracking-tight text-white transition-colors duration-500 ease-out group-hover:text-black sm:text-4xl md:text-5xl md:leading-[1.05] lg:text-[4.6vw]">
                    {project.title}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 transition-colors duration-500 group-hover:text-zinc-900/70 sm:mt-4 sm:text-xs">
                    <span>{project.category}</span>
                    {project.role && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-zinc-700 transition-colors duration-500 group-hover:bg-zinc-900/50" />
                        <span>{project.role}</span>
                      </>
                    )}
                  </div>
                </div>

                <span className="absolute right-4 top-6 flex h-9 w-9 -rotate-45 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 transition-all duration-500 ease-out group-hover:rotate-0 group-hover:border-black group-hover:bg-black group-hover:text-neon sm:right-5 sm:top-8 md:static md:h-11 md:w-11">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>

              {index !== projects.length - 1 && (
                <div className="h-px w-full bg-white/10 transition-colors duration-500 group-hover:bg-black/20" />
              )}
            </li>
          ))}
        </ul>
      </div>

      <div
        ref={imageRef}
        data-testid="project-preview"
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[220px] w-[330px] scale-75 overflow-hidden rounded-lg border border-white/15 bg-zinc-950 opacity-0 shadow-[0_30px_80px_-20px_var(--preview-shadow)] md:block"
      >
        {activeProject?.image ? (
          <div className="relative h-full w-full">
            <img
              src={activeProject.image}
              alt={activeProject.title}
              className={`h-full w-full ${activeProject.coverFit === 'contain' ? 'object-contain' : 'object-cover'}`}
              width="330"
              height="220"
              decoding="async"
            />
            <div className="absolute inset-0 bg-neon-media mix-blend-overlay opacity-15 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-scrim/80 to-transparent pointer-events-none" />
            <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.18em]">
              <span className="text-onmedia/80">{activeProject.category}</span>
              <span className="text-neon-media">{activeProject.year}</span>
            </div>
          </div>
        ) : activeProject ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 bg-zinc-950 light:bg-paper-card relative">
            <div
              className="absolute inset-0 opacity-[0.04] light:opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle, var(--dot-grid-color) 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />
            <div className="relative z-10 w-1.5 h-1.5 rotate-45 bg-neon mb-1" />
            <div className="relative z-10 text-lg font-semibold tracking-tight text-white text-center leading-tight">
              {activeProject.title}
            </div>
            <div className="relative z-10 font-mono text-[9px] uppercase tracking-[0.2em] text-neon/80">
              {activeProject.category}
            </div>
            <div className="relative z-10 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              {activeProject.role}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
