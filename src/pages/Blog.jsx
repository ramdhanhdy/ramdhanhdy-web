import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { posts } from '../lib/content';
import { curtainTransition } from '../lib/curtain';
import Meta from '../components/Meta';

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
  const navigate = useNavigate();

  const handleClick = (e, slug) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    curtainTransition(() => navigate(`/blog/${slug}`));
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <Meta
        title="Writing"
        description="Essays on data science, AI engineering, and communicating analysis to decision-makers."
      />
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
          {posts.map((post, index) => (
            <motion.li key={post.slug} variants={itemVariants} className="group relative">
              <a
                href={`/blog/${post.slug}`}
                onClick={(e) => handleClick(e, post.slug)}
                className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6 w-full"
              >
                {/* Year superscript style */}
                <span className="text-neon text-sm md:text-base font-mono mt-2 md:mt-3 flex-shrink-0 transition-opacity duration-300 opacity-60 group-hover:opacity-100">
                  {new Date(post.date).getFullYear()}
                </span>
                
                {/* Oversized Title */}
                <h2 className="text-4xl md:text-5xl lg:text-[5vw] leading-[1.1] md:leading-[1.05] font-medium tracking-tight text-white transition-colors duration-500 ease-out group-hover:text-neon">
                  {post.title}
                </h2>
              </a>
              
              {/* Subtle separator */}
              {index !== posts.length - 1 && (
                <div className="w-full h-[1px] bg-white/10 mt-12 md:mt-16 group-hover:bg-neon/30 transition-colors duration-500" />
              )}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
