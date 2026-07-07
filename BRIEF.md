# ramdhanhdy-web: Full Project Consultation

This document describes a personal portfolio site in its current state
and asks for your direction on everything. Architecture, design,
interaction, content strategy, user experience, technology, and
anything else you see. Nothing is decided. Nothing is off the table.

---

## The Project

ramdhanhdy-web is a personal portfolio site for Ramdhan Hidayat. It
showcases selected projects and written blog posts. The site lives at
github.com/ramdhanhdy/ramdhanhdy-web.

Ramdhan is a data analyst and AI engineer who has worked on retail
operations analytics, AI agents, computer vision, and algorithmic
trading systems. He has also briefed Indonesian parliament
decision-makers (DPR RI) on social program outcomes. The portfolio
needs to reflect that range without being a generic developer site.

## Current State

The site is built with React 19, Vite 8, Tailwind CSS v4, GSAP 3, and
Framer Motion, with React Router 7 for client-side routing. It has 5
commits, all on main. No deployment is configured. No tests exist.

### Routes

```
/          -> Work (default: 3D overview, toggle to index list)
/about     -> About (scroll-triggered text reveal)
/blog      -> Blog (staggered post list)
/contact   -> Contact (email + socials)
```

### Design Language

The visual identity is dark minimal: a pure black canvas (`#000000`),
zinc grayscale text, and a single neon accent color (`#C6FF00`,
exposed as the Tailwind theme token `--color-neon`). The font stack is
Inter. The header uses `mix-blend-difference` so navigation elements
adapt their contrast against any background they pass over. Typography
is oversized and tight-tracked, drawing from Awwwards-style portfolio
sites.

### Animations and Interactions

- **Page transitions** use a GSAP curtain wipe. A full-screen neon
  panel sweeps up to cover the viewport, the route swaps underneath,
  then the panel exits upward. Every navigation feels physical.
- **The Work overview** is a 3D card carousel driven by virtual scroll
  with lerp smoothing. Cards live in a perspective space
  (`perspective: 1600px`), wrap infinitely using modulo math, and
  fade at the edges of the queue. Wheel scroll is intercepted and
  converted to card traversal.
- **The Work index** is a table-style list where hovering a row
  reveals a floating image preview that follows the cursor via
  `gsap.quickTo` for 60fps tracking. Sibling rows dim when one is
  hovered, creating a focus effect.
- **The About page** uses scroll-triggered character-by-character text
  reveal via GSAP ScrollTrigger. Characters start at 20% opacity
  (zinc-500) and progressively light to full white as the reader
  scrolls. A calculated initial lighting ratio (15% of characters
  pre-lit at scroll 0) keeps the lit text ahead of the reader's eye
  position. A custom neon scroll progress bar runs along the right
  edge.
- **The Blog page** uses Framer Motion staggered entrance for post
  titles, oversized typography with neon hover transitions.
- A mask gradient (`linear-gradient(to bottom, transparent 0%, black
  120px)`) appears on scrollable containers across Work index, About,
  and Blog, creating a "content emerges from darkness" effect at the
  top edge.

### Content

Project data (8 entries) is hardcoded in `src/lib/data.js` as a flat
array: id, title, category, role, year, image. All images are
placeholder JPGs. The projects are:

1. Lumen - AI Health Agent
2. Ankify - Automated Spaced Repetition
3. Synthetic Control Analysis - Macroeconomics / Python
4. Hybrid Reasoning Models - LLM Architecture
5. RAG Pipeline - Retrieval Augmented Generation
6. DeepSight - Computer Vision / Detection
7. AgentForge - Multi-Agent Orchestration
8. QuantFlow - Algorithmic Trading Engine

Blog post data (8 entries) is inline in `src/pages/Blog.jsx` as an
array with id, title, year, link (all `#`). No post content exists.
Titles are generic design-blog topics ("Typography in Motion,"
"Framer Motion vs GSAP," etc.).

Contact info is placeholder (`hello@example.com`, `#` socials).

The About page has four paragraphs of placeholder bio text describing
a journey from theoretical physics to AI engineering.

### File Structure

```
src/
  components/
    Layout.jsx              -> fixed header + GSAP curtain + nav
    TransitionLink.jsx      -> animated route link (curtain wipe)
    HeaderHomeButton.jsx    -> 4-pointed star SVG home button
    work/
      Overview3D.jsx        -> 3D card carousel
      IndexList.jsx         -> table list + floating image
  pages/
    Work.jsx                -> view toggle (overview / index)
    About.jsx               -> scroll text reveal
    Blog.jsx                -> post list
    Contact.jsx             -> contact info
  lib/
    data.js                 -> hardcoded project array
  App.css                   -> unused Vite boilerplate
  App.jsx                   -> routes
  index.css                 -> Tailwind v4 theme + tokens
  main.jsx                  -> entry point
public/
  placeholder-*.jpg (8 images)
  favicon.svg, icons.svg
```

## What I'm Asking You

Everything is open. I am not looking for validation of existing
decisions. I want your direction on the entire project.

### Design

Is the dark-minimal neon aesthetic the right direction for this
portfolio? Is the visual identity working? Is the typography, color,
spacing, and overall feel right for someone with this background
presenting this kind of work? Should the design language evolve, and
if so, in what direction?

### Interaction and Motion

Are the current animations (curtain wipe, 3D carousel, cursor image
tracking, character-by-character scroll reveal) the right
interactions for a portfolio? Do they serve the content or do they
get in the way? What should the motion design philosophy be? Should
existing interactions be kept, evolved, or replaced? What new
interactions should exist that don't yet?

### Information Architecture

Is the current page structure (Work, About, Blog, Contact) right?
Should there be more pages, fewer pages, different pages? How should
project case studies be structured? What should a blog post look
like? How should the site flow as a whole?

### Content Strategy

What should this portfolio contain? How should projects be presented?
What makes a compelling case study for someone with this mix of data
analytics, AI engineering, and policy work? What should the blog be
about? What should the About page say? What is the narrative the
site should tell?

### Content Management

How should content be structured, stored, and loaded? How will
projects and blog posts accumulate over time? What is the content
schema? How does adding new content work? What handles rendering?

### Component Architecture

How should the codebase be organized? What is the right component
structure, directory layout, and separation of concerns? What should
be shared vs. page-specific? How should the codebase scale as it
grows?

### Technology

Is React 19 + Vite 8 + Tailwind v4 + GSAP 3 + Framer Motion the
right stack? Should anything be added, removed, or replaced? Are
there tools or libraries that would serve this project better?

### Mobile and Touch

The current interactions are desktop-first. The 3D carousel uses
wheel scroll. The index list uses cursor tracking. The About page
uses scroll triggers. How should this work on mobile and touch
devices? What is the mobile experience?

### Performance

GSAP and Framer Motion together. Image loading strategy. Bundle
size. What should the performance approach be?

### Accessibility

mix-blend-difference, scroll-jacking, hover-only interactions,
character reveal that starts text at 20% opacity. How should
accessibility work? What needs to change?

### SEO and Metadata

The page title is "ramdhanhdy-web." There are no meta tags, no Open
Graph, no structured data. How should this be handled?

### Deployment

The site has no deployment configured. Where should it live? How
should builds and deploys work?

### Dead Code

App.css is unused Vite boilerplate. The README is default template.
What else should go?

### Anything Else

What am I missing? What does this project need that I haven't
mentioned? What problems do you see that I haven't asked about?

---

Document your direction in a markdown file. I will implement from your decision.
