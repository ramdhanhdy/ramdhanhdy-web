import { useLayoutEffect, useRef, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import TransitionLink from './TransitionLink';
import HeaderHomeButton from './HeaderHomeButton';
import Meta from './Meta';

export default function Layout() {
  const curtainRef = useRef(null);
  const location = useLocation();

  // Helper to determine if a link is active
  const isActive = (path) => {
    if (path === '/' || path === '/?view=index') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  useLayoutEffect(() => {
    gsap.set(curtainRef.current, { yPercent: 100 });
  }, []);

  return (
    <div className="min-h-screen min-h-dvh flex flex-col relative w-full font-sans antialiased text-white bg-black">
      <Meta />

      {/* Global Header */}
      <header className="fixed top-0 left-0 w-full z-40 px-3 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 pointer-events-none mix-blend-difference">
        <div className="flex gap-1 sm:gap-4 pointer-events-auto items-center relative z-10 min-w-0">
          <HeaderHomeButton />
          <TransitionLink 
            to="/?view=index" 
            className={`px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm transition-colors duration-300 ${
              isActive('/') 
                ? 'border-white text-white bg-white/5' 
                : 'border-zinc-800 text-white hover:bg-neon hover:text-black hover:border-neon'
            }`}
          >
            Work
          </TransitionLink>
            <TransitionLink 
              to="/blog" 
              className={`px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm transition-colors duration-300 ${
                isActive('/blog') 
                  ? 'border-white text-white bg-white/5' 
                  : 'border-zinc-800 text-white hover:bg-neon hover:text-black hover:border-neon'
              }`}
            >
              Blog
            </TransitionLink>
        </div>
        <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto font-medium text-lg tracking-widest uppercase text-white/90 whitespace-nowrap">
          Ramdhan Hidayat
        </div>
        <div className="flex gap-1 sm:gap-4 pointer-events-auto relative z-10 shrink-0">
          <TransitionLink
            to="/about"
            className={`px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm transition-colors duration-300 ${
              isActive('/about')
                ? 'border-white text-white bg-white/5'
                : 'border-zinc-800 text-white hover:bg-neon hover:text-black hover:border-neon'
            }`}
          >
            About
          </TransitionLink>
          <TransitionLink 
            to="/contact" 
            className={`px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm transition-colors duration-300 ${
              isActive('/contact') 
                ? 'border-white text-white bg-white/5' 
                : 'border-zinc-800 text-white hover:bg-neon hover:text-black hover:border-neon'
            }`}
          >
            Contact
          </TransitionLink>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full">
        {/* Lazy route chunks resolve under the curtain; fallback stays black */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>

      {/* Global Transition Curtain */}
      <div 
        ref={curtainRef}
        id="global-curtain"
        className="fixed inset-0 z-50 bg-neon pointer-events-none"
      />
    </div>
  );
}
