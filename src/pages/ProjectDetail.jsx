import { createElement, useRef, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getProject, getAdjacentProjects, projects } from '../lib/content';
import TransitionLink from '../components/TransitionLink';
import Meta from '../components/Meta';
import NotFound from './NotFound';

gsap.registerPlugin(useGSAP);

const projectBodyComponents = new Map(
  projects.map((project) => [project.slug, lazy(project.load)])
);

function ProjectBody({ slug }) {
  return createElement(projectBodyComponents.get(slug));
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const containerRef = useRef(null);

  const project = getProject(slug);
  const { prev, next } = getAdjacentProjects(slug);

  useGSAP(
    () => {
      gsap.from('.detail-reveal', {
        opacity: 0,
        y: 40,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.15,
        clearProps: 'all',
      });
    },
    { scope: containerRef, dependencies: [slug] }
  );

  if (!project) return <NotFound />;

  return (
    <div ref={containerRef} className="page-bg w-full h-screen h-dvh overflow-hidden bg-black">
      <Meta
        title={project.title}
        description={project.summary}
        image={project.cover}
        type="article"
      />

      <div
        key={slug}
        className="w-full h-full overflow-y-auto no-scrollbar pt-28 sm:pt-32 pb-20 sm:pb-24 px-5 sm:px-6 md:px-12"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
        }}
      >
        <article className="max-w-4xl mx-auto w-full">
          {/* Header */}
          <header className="detail-reveal flex flex-col gap-6 mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.02] font-semibold tracking-tighter text-white break-words">
              {project.title}
            </h1>
            {project.summary && (
              <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 leading-snug max-w-2xl">
                {project.summary}
              </p>
            )}
          </header>

          {/* Meta row */}
          <div className="detail-reveal grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 sm:gap-6 py-6 border-y border-zinc-800 font-mono text-xs sm:text-sm mb-10 sm:mb-12">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-600 uppercase tracking-widest text-xs">Year</span>
              <span className="text-zinc-300">{project.year}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-600 uppercase tracking-widest text-xs">Role</span>
              <span className="text-zinc-300">{project.role}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-600 uppercase tracking-widest text-xs">Category</span>
              <span className="text-zinc-300">{project.category}</span>
            </div>
            {project.stack && (
              <div className="flex flex-col gap-1">
                <span className="text-zinc-600 uppercase tracking-widest text-xs">Stack</span>
                <span className="text-zinc-300">{project.stack.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Cover — projects without cover art get the same typographic
              panel language as the carousel's text-only cards */}
          <div className="detail-reveal w-full aspect-[3/2] rounded-lg sm:rounded-xl overflow-hidden border border-white/[0.08] bg-black mb-12 sm:mb-16">
            {project.cover ? (
              <img
                src={project.cover}
                alt={project.title}
                className={`w-full h-full ${project.coverFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div className="relative w-full h-full bg-zinc-950 flex flex-col items-center justify-center gap-5 p-10">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, var(--dot-grid-color) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
                <div className="relative z-10 w-2 h-2 rotate-45 bg-neon" />
                <span className="relative z-10 font-mono text-xs uppercase tracking-[0.2em] text-neon/80 text-center">
                  {String(project.id).padStart(2, '0')} · {project.category}
                </span>
              </div>
            )}
          </div>

          {/* MDX body */}
          <div className="detail-reveal case-prose">
            <Suspense fallback={null}>
              <ProjectBody slug={project.slug} />
            </Suspense>
          </div>

          {/* Prev / Next */}
          <nav className="detail-reveal grid grid-cols-2 gap-6 items-start mt-20 sm:mt-24 pt-8 border-t border-zinc-800">
            {prev && prev.slug !== slug ? (
              <TransitionLink
                to={`/work/${prev.slug}`}
                className="group flex flex-col gap-1 min-w-0"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
                  Previous
                </span>
                <span className="text-base sm:text-xl md:text-2xl leading-snug font-medium text-zinc-400 break-words group-hover:text-neon transition-colors duration-300">
                  {prev.title}
                </span>
              </TransitionLink>
            ) : (
              <span />
            )}
            {next && next.slug !== slug ? (
              <TransitionLink
                to={`/work/${next.slug}`}
                className="group flex flex-col gap-1 text-right min-w-0"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
                  Next
                </span>
                <span className="text-base sm:text-xl md:text-2xl leading-snug font-medium text-zinc-400 break-words group-hover:text-neon transition-colors duration-300">
                  {next.title}
                </span>
              </TransitionLink>
            ) : (
              <span />
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}
