import { useMemo, useRef, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getPost } from '../lib/content';
import TransitionLink from '../components/TransitionLink';
import Meta from '../components/Meta';
import NotFound from './NotFound';

gsap.registerPlugin(useGSAP);

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PostDetail() {
  const { slug } = useParams();
  const containerRef = useRef(null);

  const post = getPost(slug);

  const Body = useMemo(() => (post ? lazy(post.load) : null), [post]);

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

  if (!post) return <NotFound />;

  return (
    <div ref={containerRef} className="w-full h-screen overflow-hidden bg-black">
      <Meta title={post.title} description={post.summary} type="article" />

      <div
        key={slug}
        className="w-full h-full overflow-y-auto no-scrollbar pt-32 pb-24 px-6 md:px-12"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
        }}
      >
        <article className="max-w-3xl mx-auto w-full">
          <header className="detail-reveal flex flex-col gap-6 mb-12 pb-8 border-b border-zinc-800">
            <span className="font-mono text-sm text-neon/80">
              {formatDate(post.date)}
            </span>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white leading-[1.05]">
              {post.title}
            </h1>
            {post.summary && (
              <p className="text-lg md:text-xl text-zinc-400 leading-snug">
                {post.summary}
              </p>
            )}
          </header>

          <div className="detail-reveal case-prose">
            <Suspense fallback={null}>
              <Body />
            </Suspense>
          </div>

          <nav className="detail-reveal mt-24 pt-8 border-t border-zinc-800">
            <TransitionLink
              to="/blog"
              className="group flex flex-col gap-1"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
                Back
              </span>
              <span className="text-xl md:text-2xl font-medium text-zinc-400 group-hover:text-neon transition-colors duration-300">
                All writing
              </span>
            </TransitionLink>
          </nav>
        </article>
      </div>
    </div>
  );
}
