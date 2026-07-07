import { useMemo, useRef, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getProject, getAdjacentProjects } from '../lib/content';
import TransitionLink from '../components/TransitionLink';
import Meta from '../components/Meta';
import NotFound from './NotFound';

gsap.registerPlugin(useGSAP);

export default function ProjectDetail() {
  const { slug } = useParams();
  const containerRef = useRef(null);

  const project = getProject(slug);
  const { prev, next } = getAdjacentProjects(slug);

  // Each MDX body is its own chunk, loaded only when this route is visited.
  const Body = useMemo(
    () => (project ? lazy(project.load) : null),
    [project]
  );

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
    <div ref={containerRef} className="w-full h-screen overflow-hidden bg-black">
      <Meta
        title={project.title}
        description={project.summary}
        image={project.cover}
        type="article"
      />

      <div
        key={slug}
        className="w-full h-full overflow-y-auto no-scrollbar pt-32 pb-24 px-6 md:px-12"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
        }}
      >
        <article className="max-w-4xl mx-auto w-full">
          {/* Header */}
          <header className="detail-reveal flex flex-col gap-6 mb-12">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white">
              {project.title}
            </h1>
            {project.summary && (
              <p className="text-xl md:text-2xl text-zinc-400 leading-snug max-w-2xl">
                {project.summary}
              </p>
            )}
          </header>

          {/* Meta row */}
          <div className="detail-reveal grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-zinc-800 font-mono text-sm mb-12">
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

          {/* Cover */}
          <div className="detail-reveal w-full aspect-[3/2] rounded-xl overflow-hidden border border-white/[0.08] mb-16">
            <img
              src={project.cover}
              alt={project.title}
              className="w-full h-full object-cover"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          {/* MDX body */}
          <div className="detail-reveal case-prose">
            <Suspense fallback={null}>
              <Body />
            </Suspense>
          </div>

          {/* Prev / Next */}
          <nav className="detail-reveal flex justify-between items-center mt-24 pt-8 border-t border-zinc-800">
            {prev && prev.slug !== slug ? (
              <TransitionLink
                to={`/work/${prev.slug}`}
                className="group flex flex-col gap-1"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
                  Previous
                </span>
                <span className="text-xl md:text-2xl font-medium text-zinc-400 group-hover:text-neon transition-colors duration-300">
                  {prev.title}
                </span>
              </TransitionLink>
            ) : (
              <span />
            )}
            {next && next.slug !== slug ? (
              <TransitionLink
                to={`/work/${next.slug}`}
                className="group flex flex-col gap-1 text-right"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
                  Next
                </span>
                <span className="text-xl md:text-2xl font-medium text-zinc-400 group-hover:text-neon transition-colors duration-300">
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
