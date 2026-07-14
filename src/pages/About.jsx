import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Meta from "../components/Meta";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const paragraphs = [
  "I’m Ramdhan Hidayat, an Indonesia-based Data & AI Engineer and Creative Developer working at the intersection of intelligent systems, applied analytics, and expressive web design. I transform dense information and complex technology into precise, intuitive products built to earn trust, sharpen decisions, and leave a lasting visual impression.",
  "I care about craft at every scale: the rigor of an evaluation framework, the architecture of an agent workflow, the weight of a typeface, and the timing of a transition. Every detail should strengthen the whole. Evidence, clarity, storytelling, and fluidity are the principles I return to because the best work feels both exact and effortless.",
  "Beyond the screen, I find perspective through strength training, hiking, and reading across science, technology, and human behavior. Each offers a different discipline: repetition, observation, and curiosity. Together, they keep me attentive to patterns, movement, and the quiet details that often spark the strongest ideas.",
];

const toolkit = [
  {
    index: "01",
    label: "Web Development",
    tools: [
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "GSAP",
      "Framer Motion",
      "Vite",
      "Vercel",
    ],
  },
  {
    index: "02",
    label: "Data Science & Analytics",
    tools: [
      "Python",
      "pandas",
      "SQL",
      "SQLite",
      "scipy",
      "statsmodels",
      "Streamlit",
    ],
  },
  {
    index: "03",
    label: "AI Engineering & Evaluation",
    tools: ["LangGraph", "OpenRouter", "pytest", "httpx", "asyncio"],
  },
  {
    index: "04",
    label: "Applied Machine Learning",
    tools: ["scikit-learn", "UMAP", "HDBSCAN", "Optuna", "Leiden"],
  },
];

const TextReveal = ({ children }) => (
  <p aria-label={children}>
    {children.split(" ").map((word, wordIndex) => (
      <span
        key={`${word}-${wordIndex}`}
        aria-hidden="true"
        className="inline-block mr-[0.25em]"
      >
        {word.split("").map((char, charIndex) => (
          <span
            key={`${char}-${charIndex}`}
            className="text-char opacity-20 text-zinc-500 transition-colors duration-100"
          >
            {char}
          </span>
        ))}
      </span>
    ))}
  </p>
);

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

      gsap.from(".about-reveal", {
        opacity: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.15,
        clearProps: "all",
      });

      const initialTop =
        text.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      const INITIAL_LIT_RATIO = 0.15;

      gsap.to(".text-char", {
        color: "#ffffff",
        opacity: 1,
        duration: 2,
        stagger: 0.05,
        scrollTrigger: {
          trigger: text,
          scroller,
          start: () => {
            const viewportHeight = scroller.offsetHeight;
            const textHeight = text.offsetHeight;
            const endPosition = 0.95 * viewportHeight;
            const ratio = INITIAL_LIT_RATIO;
            const startPosition =
              (initialTop + ratio * textHeight - ratio * endPosition) /
              (1 - ratio);

            return `top ${startPosition}px`;
          },
          end: () => `bottom ${0.95 * scroller.offsetHeight}px`,
          scrub: 1,
        },
      });

      gsap.from(".stack-reveal", {
        opacity: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".stack-section",
          scroller,
          start: "top 82%",
          once: true,
        },
      });

      gsap.to(scrollbarRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: contentRef.current,
          scroller,
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
      className="relative w-full h-screen h-dvh overflow-hidden bg-black"
    >
      <Meta
        title="About"
        description="Ramdhan Hidayat is an Indonesia-based Data & AI Engineer and Creative Developer creating intelligent systems, applied analytics, and expressive web experiences."
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
        <div
          ref={contentRef}
          className="max-w-6xl mx-auto w-full px-5 sm:px-6 md:px-12 pt-28 sm:pt-32 pb-20 sm:pb-24"
        >
          <div ref={textRef} className="cursor-default">
            <h1 className="sr-only">About Ramdhan Hidayat</h1>

            <div className="about-reveal flex items-center gap-3 font-mono text-[10px] sm:text-xs uppercase tracking-[0.24em] text-zinc-500">
              <span>About</span>
              <span className="h-px w-10 bg-zinc-800" />
              <span>Data + AI + Design</span>
            </div>

            <div className="mt-8 max-w-[68rem] space-y-12 text-[1.4rem] sm:space-y-16 sm:text-2xl md:text-3xl lg:text-[2.5rem] leading-[1.32] font-medium tracking-tight">
              {paragraphs.map((paragraph) => (
                <TextReveal key={paragraph}>{paragraph}</TextReveal>
              ))}
            </div>

            <section className="stack-section mt-28 border-t border-zinc-800 pt-8 sm:mt-36 sm:pt-10">
              <div className="stack-reveal grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] md:items-end">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 sm:text-xs">
                    Tech stack / Working toolkit
                  </p>
                  <h2 className="mt-4 max-w-2xl text-4xl font-medium tracking-tighter text-white sm:text-5xl md:text-6xl">
                    Tools shaped by the work.
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base md:justify-self-end">
                  A focused set for moving from research and data to intelligent
                  systems, expressive interfaces, and reliable delivery.
                </p>
              </div>

              <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                {toolkit.map(({ index, label, tools }) => (
                  <div
                    key={label}
                    className="stack-reveal border-t border-zinc-800 pt-5"
                  >
                    <div className="flex min-h-12 items-start justify-between gap-4">
                      <h3 className="text-sm font-medium text-white sm:text-base">
                        {label}
                      </h3>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-neon">
                        {index}
                      </span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-full border border-zinc-800 bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] text-zinc-400 transition-colors duration-300 hover:border-neon/60 hover:text-white sm:text-xs"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="fixed right-6 top-[20%] bottom-[20%] z-50 hidden w-[3px] overflow-hidden rounded-full bg-zinc-900 md:block">
        <div
          ref={scrollbarRef}
          className="h-full w-full origin-top rounded-full bg-neon shadow-[0_0_10px_#B8FF00]"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
    </div>
  );
}
