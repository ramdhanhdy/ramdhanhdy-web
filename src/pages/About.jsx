import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Meta from "../components/Meta";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const paragraphs = [
  "I started my journey in theoretical physics, fascinated by the fundamental laws governing reality. That obsession with complex systems naturally evolved into an extensive career in AI Engineering and Data Science. I specialize in crafting immersive, highly interactive web experiences with a strong focus on algorithmic efficiency, elegant architectures, and dynamic integrations.",
  "My goal is to build agentic workflows that bridge the gap between abstract mathematics and tangible, human-centric solutions. I believe in creating remarkable digital experiences that connect in authentic and memorable ways.",
  "I’m passionate about the intersection of deep learning and beautiful user interfaces. Whether it’s a massive data pipeline that powers a dashboard or a complex multi-agent reasoning model, I focus on precision, fluidity, and cutting-edge logic.",
  "Beyond the screen, I find inspiration in the patterns of nature—analyzing complex systems, hiking new trails, and continuously pushing the boundaries of what creative coding can achieve.",
];

// Helper to gracefully split text into animated words and characters
const TextReveal = ({ children }) => {
  return (
    <div className="mb-12">
      {children.split(" ").map((word, wIdx) => (
        <span key={wIdx} className="inline-block mr-[0.25em]">
          {word.split("").map((char, cIdx) => (
            <span
              key={cIdx}
              className="text-char opacity-20 text-zinc-500 transition-colors duration-100"
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
};

export default function About() {
  const containerRef = useRef(null);
  const scrollbarRef = useRef(null);
  const textRef = useRef(null);
  const scrollerRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(
    () => {
      const scroller = scrollerRef.current;
      const text = textRef.current;

      // Position of text top relative to scroller viewport at scroll 0
      const initialTop =
        text.getBoundingClientRect().top - scroller.getBoundingClientRect().top;

      // Target: ~15% of characters lit at scroll 0.
      // Based on reading research: visual span ~10 chars/fixation, optimal line
      // length 50-75 CPL (sweet spot ~66), reading speed ~238 wpm non-fiction.
      // 15% of ~920 total chars ≈ 138 chars ≈ 2 lines — enough head start so the
      // lit text stays ahead of the reader's current position.
      const INITIAL_LIT_RATIO = 0.15;

      // Character reveal scrub animation
      gsap.to(".text-char", {
        color: "#ffffff",
        opacity: 1,
        duration: 2,
        stagger: 0.05,
        scrollTrigger: {
          trigger: text,
          scroller: scroller,
          start: () => {
            const vh = scroller.offsetHeight;
            const textHeight = text.offsetHeight;
            const endPos = 0.95 * vh;
            const r = INITIAL_LIT_RATIO;
            // Solve for startPos so that progress at scroll 0 equals r:
            // (startPos - initialTop) / (textHeight - endPos + startPos) = r
            const startPos =
              (initialTop + r * textHeight - r * endPos) / (1 - r);
            return `top ${startPos}px`;
          },
          end: () => `bottom ${0.95 * scroller.offsetHeight}px`,
          scrub: 1,
        },
      });

      // Custom Neon Scrollbar animation (tracks the whole container)
      gsap.to(scrollbarRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: contentRef.current,
          scroller: scrollerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="w-full bg-black relative h-screen h-dvh overflow-hidden"
    >
      <Meta
        title="About"
        description="Data analyst and AI engineer. From retail operations analytics to AI agents, computer vision, and policy briefings."
      />
      <div
        ref={scrollerRef}
        className="w-full h-full overflow-y-auto no-scrollbar"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 120px)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 120px)",
        }}
      >
        {/*
          Native flex flow layout.
          Allows the text to scroll dynamically over the screen exactly as requested,
          while starting securely tucked right below the header.
        */}
        <div
          ref={contentRef}
          className="max-w-4xl mx-auto w-full px-5 sm:px-6 md:px-12 flex flex-col pt-28 sm:pt-32 pb-20 sm:pb-24"
        >
          <div
            ref={textRef}
            className="text-[1.4rem] sm:text-2xl md:text-3xl lg:text-[2.5rem] leading-[1.32] font-medium tracking-tight cursor-default"
          >
            {paragraphs.map((p, i) => (
              <TextReveal key={i}>{p}</TextReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Neon Scroll Progress Bar */}
      <div className="fixed right-6 top-[20%] bottom-[20%] w-[3px] bg-zinc-900 rounded-full z-50 overflow-hidden hidden md:block">
        <div
          ref={scrollbarRef}
          className="w-full h-full bg-neon rounded-full transform origin-top shadow-[0_0_10px_#B8FF00]"
          style={{ scaleY: 0 }}
        ></div>
      </div>
    </div>
  );
}
