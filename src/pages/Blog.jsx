import { motion } from 'framer-motion';

const posts = [
  { id: 1, title: 'Typography in Motion: Animated Text for Better Storytelling', year: '2025', link: '#' },
  { id: 2, title: 'Code as Art: Exploring Algorithmic Design in Front-End Development', year: '2025', link: '#' },
  { id: 3, title: 'Beyond Hover Effects: Unique Ways to Add Interaction to Websites', year: '2025', link: '#' },
  { id: 4, title: 'How Generative Art Influences Modern Web Design', year: '2025', link: '#' },
  { id: 5, title: 'Framer Motion vs GSAP', year: '2025', link: '#' },
  { id: 6, title: 'Motion design for creative development', year: '2025', link: '#' },
  { id: 7, title: 'The value of visual identity', year: '2025', link: '#' },
  { id: 8, title: 'Creative Coding with Trigonometry: Animating with Math', year: '2025', link: '#' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function Blog() {
  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <div 
        className="w-full h-full overflow-y-auto no-scrollbar pt-40 pb-20 px-4 md:px-8 lg:px-12"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)'
        }}
      >
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-12 md:gap-16 max-w-[90vw] mx-auto"
        >
          {posts.map((post) => (
            <motion.li key={post.id} variants={itemVariants} className="group relative">
              <a href={post.link} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6 w-full">
                {/* Year superscript style */}
                <span className="text-neon text-sm md:text-base font-mono mt-2 md:mt-3 flex-shrink-0 transition-opacity duration-300 opacity-60 group-hover:opacity-100">
                  {post.year}
                </span>
                
                {/* Oversized Title */}
                <h2 className="text-4xl md:text-5xl lg:text-[5vw] leading-[1.1] md:leading-[1.05] font-medium tracking-tight text-white transition-colors duration-500 ease-out group-hover:text-neon">
                  {post.title}
                </h2>
              </a>
              
              {/* Subtle separator */}
              {post.id !== posts[posts.length - 1].id && (
                <div className="w-full h-[1px] bg-white/10 mt-12 md:mt-16 group-hover:bg-neon/30 transition-colors duration-500" />
              )}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
