# Direction: ramdhanhdy-web

Opinionated decisions for every area raised in BRIEF.md. Where the brief asks
"should X change?", the answer here is a decision, not a menu.

---

## 1. Positioning (read this first — everything follows from it)

The site's job is to get one of three people to act:

1. A hiring manager / founder evaluating you for data or AI engineering work.
2. A collaborator or client who found you via a blog post or GitHub.
3. A policy/analytics stakeholder (the DPR RI briefing angle is rare and valuable).

None of these people are Awwwards judges. The current site is built for
Awwwards judges. That's the core tension: the craft is real, but the site
currently says "I make animated portfolio sites," not "I ship analytical and
AI systems that decision-makers act on."

**Decision: keep the dark-minimal identity, cut the motion by ~60%, and
redirect all effort into case-study content.** A data/AI portfolio wins on
evidence — problem, method, numbers, artifacts — not on choreography. The
strongest possible impression is a restrained, fast, precise site with two or
three deep case studies. That reads as engineering judgment, which is the
product being sold.

---

## 2. Design

**Keep:**
- Black canvas, zinc grayscale, single neon accent (`#C6FF00`). It's
  distinctive and works for a technical identity. Do not add colors.
- Inter, oversized/tight-tracked display type.
- `mix-blend-difference` header (fine, low risk, keep it).

**Change:**
- **Add a monospace layer.** For metadata, numbers, captions, code:
  `JetBrains Mono` or `IBM Plex Mono`. A data engineer's site should have a
  typographic register for data. Use it for project meta rows (year, role,
  stack), figure captions, and inline metrics. This single change moves the
  identity from "design portfolio" to "technical portfolio" more than
  anything else.
- **Neon discipline.** Reserve `--color-neon` for exactly: links/hover, the
  scroll progress bar, and one accent element per page. The curtain wipe
  flooding the viewport in neon spends the accent's entire budget on a
  transition.
- **Raise base body contrast.** Body text should be zinc-300 minimum on
  black, never zinc-500 as a resting state (see Accessibility).

---

## 3. Interaction & Motion

Motion philosophy: **motion confirms, it never performs.** Every animation
must answer "what state change does this communicate?" If the answer is
"nothing, it's cool," cut it.

Per-interaction rulings:

- **Curtain wipe page transitions — replace.** A full-viewport blocking
  animation on every navigation is a tax paid on every click, and it's the
  single most "template portfolio" pattern in circulation. Replace with a
  fast opacity/8px-translate crossfade (~250ms) via Framer Motion's
  `AnimatePresence`. Navigation should feel instant.
- **3D card carousel (Overview3D) — cut as the default view.** Scroll-jacking
  the homepage is the highest-cost decision on the site: it breaks on
  trackpads inconsistently, doesn't exist on touch, hides 7 of 8 projects at
  any moment, and delays the visitor's first real information. **Make the
  index list the homepage.** If you love the carousel, keep it behind the
  toggle as an easter egg — but the default view must show all work at once.
- **Index list with cursor-following preview — keep.** This is the best
  interaction on the site: it's information-dense, degrades gracefully
  (on touch, render the thumbnail inline per row instead), and the
  sibling-dimming focus effect serves scanning. Keep `gsap.quickTo`.
- **Character-by-character About reveal — cut.** It makes reading slower and
  starts text at 20% opacity (an accessibility failure). Replace with simple
  per-paragraph fade-up on scroll entry (once, 300ms, full opacity resting
  state). Keep the neon scroll progress bar.
- **Blog staggered entrance — keep**, but cap stagger total at ~400ms.
- **Top mask gradient — keep.** Cheap, subtle, effective.

**Add:** `prefers-reduced-motion` support globally — one hook/media query
that disables all entrance animation and transitions. Non-negotiable.

---

## 4. Information Architecture

**Decision: 4 top-level routes plus detail routes.**

```
/                  Work index (list view, all projects visible)
/work/:slug        Project case study        <- NEW, the most important page type
/writing           Blog index (rename from /blog)
/writing/:slug     Post                      <- NEW
/about             About (bio + contact merged)
```

- **Kill `/contact` as a page.** An email address and three social links do
  not justify a route. Fold contact into the About page footer and put the
  email in the site footer on every page. A dedicated placeholder contact
  page signals emptiness.
- **`/work/:slug` is the reason the site exists.** Everything else is
  navigation to it. See Content Strategy for the case-study template.
- Rename Blog → Writing. "Writing" fits essays about methods and systems;
  "Blog" sets expectations of frequency you likely won't meet.

---

## 5. Content Strategy

### Projects

**Cut from 8 to 4–5 real case studies.** Eight thin entries with placeholder
images are worse than four deep ones. Generic names like "RAG Pipeline" and
"AgentForge" read as filler; a hiring manager has seen a hundred of them.
Prioritize the ones with real outcomes and the unusual ones:

1. The DPR RI / social program analysis (synthetic control) — nobody else
   has this. Lead with it or place it second.
2. Lumen (AI health agent) — if it's real and demonstrable.
3. One retail operations analytics project — business impact, numbers.
4. One of CV/trading — whichever has the strongest artifacts.

### Case study template (fixed structure, every project)

```
1. Header      — title, one-sentence outcome, meta row (year/role/stack) in mono
2. Context     — who needed this and why (2-3 paragraphs max)
3. Approach    — the interesting technical decisions, not a full log
4. Evidence    — charts, screenshots, architecture diagram, metrics.
                 At least one real number per case study.
5. Outcome     — what happened because this existed
6. Links       — repo / demo / paper where applicable
```

For policy/client work where details are confidential, say so explicitly and
describe method — that itself signals seniority.

### Writing

Delete all 8 placeholder posts. Launch with 1–2 real essays or an empty state
("Writing coming soon" with one line of intent). Topics that serve the
positioning: synthetic control in practice, evaluating AI agents, lessons
from briefing non-technical decision-makers. Do **not** write design-blog
content ("Framer Motion vs GSAP") — it dilutes the identity.

### About

Rewrite the four placeholder paragraphs to ~150 words of true narrative:
data analyst → AI engineer, the range (retail ops, CV, trading, policy), and
what you want to work on next. End with contact block: real email, GitHub,
LinkedIn, X. Optional: a mono-typeset "currently" line (location,
availability) — small, honest, effective.

---

## 6. Content Management

**Decision: Markdown/MDX files in the repo, loaded via Vite glob imports. No
CMS.** At this volume (≤10 projects, occasional essays) a CMS is pure
overhead, and content-in-git matches how you already work.

```
src/content/
  projects/
    lumen.mdx
    synthetic-control-dpr.mdx
    ...
  writing/
    evaluating-agents.mdx
    ...
```

Frontmatter schema:

```yaml
# project
title: Lumen
slug: lumen
summary: One-sentence outcome.
year: 2026
role: Research & Development
stack: [Python, LangGraph, FastAPI]
cover: /images/lumen/cover.jpg
featured: true
order: 1

# post
title: ...
slug: ...
date: 2026-07-01
summary: ...
draft: false
```

Implementation: `@mdx-js/rollup` + `import.meta.glob('./content/**/*.mdx')`.
A small `src/lib/content.js` maps globs → sorted arrays, replaces `data.js`.
Adding content = add one `.mdx` file + images, commit, push. MDX (not plain
md) so case studies can embed custom components (metric callouts, image
comparisons, charts) later.

---

## 7. Component Architecture

Current structure is fine for the current size; grow it like this:

```
src/
  components/
    ui/            -> shared primitives (PageHeading, MetaRow, Prose, Tag)
    layout/        -> Layout, Header, Footer, PageTransition
    work/          -> IndexList, (Overview3D if kept), CaseStudy blocks
    writing/       -> PostList
  content/         -> mdx (see above)
  hooks/           -> useReducedMotion, usePageTitle
  lib/             -> content.js, utils (clsx+tailwind-merge cn())
  pages/           -> route components only, thin
```

Rules: pages compose, components render, `lib` computes. No data literals
outside `content/`. Delete `src/lib/data.js` once MDX lands.

---

## 8. Technology

**Keep the stack. Do not migrate to Next/Astro.** The itch to rewrite is the
biggest schedule risk to this project. React 19 + Vite 8 + Tailwind 4 is
current and fast. Changes:

- **Remove GSAP *or* Framer Motion — pick one: Framer Motion.** Two animation
  runtimes for one portfolio is unjustifiable bundle weight (~90KB combined,
  min+gz). After cutting the curtain wipe and character reveal, the only GSAP
  dependency left is `quickTo` cursor tracking, which is ~15 lines of rAF +
  lerp by hand, or `useMotionValue` + `useSpring` in Framer Motion. Drop
  `gsap` and `@gsap/react`.
- **Remove `autoprefixer` and `postcss`** from dependencies — Tailwind v4's
  Vite plugin handles this; they're dead weight in `package.json`.
- **Add:** `@mdx-js/rollup` (content), `vite-plugin-sitemap` or a tiny
  build-time sitemap script.
- **Add prerendering for SEO:** `vite-prerender-plugin` or a post-build
  script that renders each route to static HTML. This keeps the SPA feel but
  gives crawlers real content. (This is the SPA tax; prerendering pays it
  without a framework migration.)
- Testing: skip unit tests for now; add **Playwright** with ~5 smoke tests
  (each route renders, nav works, case study loads) once content lands.
  That's the right level of testing for a portfolio.

---

## 9. Mobile & Touch

- Index list as homepage solves the carousel-on-touch problem outright.
- On touch (`pointer: coarse`): no cursor-following preview; render a small
  inline thumbnail on each row instead. Rows keep full-width tap targets.
- About/Writing are plain scroll pages — already fine once character reveal
  is gone.
- Oversized display type needs `clamp()`: e.g.
  `font-size: clamp(2.5rem, 8vw, 7rem)` for page titles.
- Test the mix-blend-difference header against iOS Safari; it has a history
  of blend-mode + fixed-position bugs. If it glitches, fall back to a solid
  header on mobile.

## 10. Performance

- Single animation library (above) is the biggest win.
- Images: self-hosted, pre-sized WebP/AVIF at 2 widths via `srcset`;
  `loading="lazy"` for everything below the fold, `fetchpriority="high"`
  for the first visible thumbnails. No image CDN needed at this scale.
- Route-level code splitting: `React.lazy` per page (Vite does the rest).
- `font-display: swap`, self-host Inter + the mono via `@fontsource` (2
  weights each, subset latin).
- Budget: <150KB JS gz on first load, LCP <1.5s. Check with Lighthouse in CI
  (optional, one GitHub Action).

## 11. Accessibility

Non-negotiables, in order:

1. **`prefers-reduced-motion`** — global, disables all entrance/transition
   animation.
2. **No text below WCAG AA contrast at rest.** Kill the 20%-opacity reveal;
   audit zinc-500 usage (fails AA on black for body text — zinc-400 is the
   floor for large text, zinc-300 for body).
3. **Keyboard**: visible focus rings (neon outline is on-brand), logical tab
   order, skip-to-content link.
4. **No hover-only information**: touch fallbacks above double as keyboard
   fallbacks.
5. Semantic landmarks (`header/main/footer/nav`), one `h1` per page, alt
   text on all case-study images.

## 12. SEO & Metadata

- Real `<title>` per route ("Ramdhan Hidayat — Data & AI Engineer"; per-page
  variants). React 19 supports hoisting `<title>`/`<meta>` natively from
  components — no react-helmet needed.
- Meta description, canonical, Open Graph + Twitter card per page. One
  designed OG image (black + neon, name + role) as default; per-project
  covers as OG images for case studies.
- JSON-LD: `Person` on about/home, `Article` on posts.
- `sitemap.xml` + `robots.txt` at build time.
- Prerendering (Section 8) is what makes all of this actually crawlable.

## 13. Deployment

**Decision: Cloudflare Pages** (Vercel equally fine — pick one, both free
tier). Push-to-main deploys, PR previews, global CDN. Steps:

1. Connect repo, build command `npm run build`, output `dist/`.
2. SPA fallback rewrite (`/* -> /index.html`) for client routing — with
   prerendering, static HTML wins where it exists.
3. Custom domain: `ramdhanhdy.com` (or `.dev`). A portfolio on a default
   `*.pages.dev` subdomain undercuts the polish; buy the domain.
4. GitHub Action: lint + build on PR (add Playwright smoke later).

## 14. Dead Code / Hygiene

- Delete `src/App.css`.
- Delete `src/assets/react.svg`, `vite.svg`, and `hero.png` if unused.
- Replace README with: what the site is, stack, `npm run dev`, content
  authoring instructions (how to add a project/post).
- Delete placeholder JPGs as real covers land.
- `lucide-react@^1.8.0` is old (2.x current) — bump when touching deps.

## 15. What the Brief Missed

- **Analytics**: add one privacy-friendly counter (Cloudflare Web Analytics
  is free and zero-config on Pages). You'll want to know if case studies
  get read.
- **Resume/CV**: hiring managers look for it. A `/resume.pdf` link in the
  About contact block. Keep it current.
- **404 page**: with client routing + prerendering you need a designed 404;
  it's also a free brand moment (neon star, "nothing here").
- **Favicon/OG audit**: favicon.svg exists; add `apple-touch-icon` and a
  192/512 PNG pair.
- **The real risk is content, not code.** Every technical item above is
  days of work; writing four honest case studies is the long pole. Sequence
  accordingly.

---

## Build Order

1. **Content first**: write 4 case studies + About in MDX (can be drafted
   before any code changes).
2. Content pipeline: MDX + glob loader, `/work/:slug`, `/writing/:slug`,
   delete `data.js`.
3. IA changes: index list as homepage, kill `/contact`, rename `/writing`.
4. Motion diet: remove curtain wipe + character reveal, add crossfade
   transitions, drop GSAP, add `prefers-reduced-motion`.
5. Mobile/touch fallbacks + `clamp()` typography.
6. SEO: prerender, per-page meta, OG image, sitemap, JSON-LD.
7. Deploy: Cloudflare Pages + domain + analytics + 404.
8. Polish: accessibility audit, image pipeline, Playwright smoke tests,
   README, dead-code sweep.

Steps 2–5 are roughly a week of evenings. Step 1 is the real project.
