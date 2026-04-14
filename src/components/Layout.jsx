import { Outlet } from 'react-router-dom';
import TransitionLink from './TransitionLink';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative w-full font-sans antialiased text-white bg-black">
      {/* Global Header */}
      <header className="fixed top-0 left-0 w-full z-40 px-8 py-6 flex items-center justify-between pointer-events-none mix-blend-difference">
        <div className="flex gap-4 pointer-events-auto">
          <TransitionLink 
            to="/" 
            className="px-4 py-2 rounded-full border border-zinc-800 text-sm hover:bg-white hover:text-black transition-colors duration-300"
          >
            Work
          </TransitionLink>
          <TransitionLink 
            to="/about" 
            className="px-4 py-2 rounded-full border border-zinc-800 text-sm hover:bg-white hover:text-black transition-colors duration-300"
          >
            About
          </TransitionLink>
        </div>

        <div className="pointer-events-auto font-medium text-lg tracking-widest uppercase text-white/90">
          Ramdhan Hidayat
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <TransitionLink 
            to="/contact" 
            className="px-4 py-2 rounded-full border border-zinc-800 text-sm hover:bg-white hover:text-black transition-colors duration-300"
          >
            Contact
          </TransitionLink>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Global Transition Curtain */}
      <div 
        id="global-curtain"
        className="fixed inset-0 z-50 bg-neon pointer-events-none"
        style={{ transform: 'translateY(100%)' }} // Initial state hidden at bottom
      />
    </div>
  );
}
