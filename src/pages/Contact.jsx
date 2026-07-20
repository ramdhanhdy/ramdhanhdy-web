import Meta from '../components/Meta';

export default function Contact() {
  return (
    <div className="page-bg w-full h-screen h-dvh overflow-hidden bg-black">
      <Meta title="Contact" description="Get in touch with Ramdhan Hidayat." />
      <div
        className="w-full h-full overflow-y-auto no-scrollbar flex items-center px-6 sm:px-8 pt-28 pb-16"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 96px)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 96px)',
        }}
      >
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-10 sm:gap-12">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-tighter text-white">
            Let's<br/>
            <span className="text-neon/90">connect.</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-800">
            <div className="min-w-0">
              <p className="text-zinc-500 text-xs sm:text-sm uppercase tracking-widest mb-4">Email</p>
              <a href="mailto:ramdhanhdy3@gmail.com" className="text-xl sm:text-2xl break-all hover:text-neon transition-colors duration-300">
                ramdhanhdy3@gmail.com
              </a>
            </div>
            <div>
              <p className="text-zinc-500 text-xs sm:text-sm uppercase tracking-widest mb-4">Socials</p>
              <div className="flex flex-col gap-2">
                <a href="https://x.com/ramdhanhdy" target="_blank" rel="noreferrer" className="text-xl sm:text-2xl hover:text-neon transition-colors duration-300">X (Twitter)</a>
                <a href="https://www.linkedin.com/in/ramdhanhdy" target="_blank" rel="noreferrer" className="text-xl sm:text-2xl hover:text-neon transition-colors duration-300">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
