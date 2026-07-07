import Meta from '../components/Meta';

export default function Contact() {
  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center pt-20 px-8">
      <Meta title="Contact" description="Get in touch with Ramdhan Hidayat." />
      <div className="max-w-2xl w-full flex flex-col gap-12">
        <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-white">
          Let's<br/>
          <span className="text-neon/90">connect.</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-800">
          <div>
            <p className="text-zinc-500 text-sm uppercase tracking-widest mb-4">Email</p>
            <a href="mailto:hello@example.com" className="text-2xl hover:text-neon transition-colors duration-300">
              hello@example.com
            </a>
          </div>
          <div>
            <p className="text-zinc-500 text-sm uppercase tracking-widest mb-4">Socials</p>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-2xl hover:text-neon transition-colors duration-300">Twitter</a>
              <a href="#" className="text-2xl hover:text-neon transition-colors duration-300">LinkedIn</a>
              <a href="#" className="text-2xl hover:text-neon transition-colors duration-300">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
