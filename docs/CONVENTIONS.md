# Conventions

## File naming

| Type | Convention | Example |
|---|---|---|
| Page components | PascalCase `.jsx` | `ProjectDetail.jsx`, `NotFound.jsx` |
| Shared components | PascalCase `.jsx` | `TransitionLink.jsx`, `Meta.jsx` |
| Work-specific components | PascalCase, in `components/work/` | `Overview3D.jsx`, `IndexList.jsx` |
| Lib modules | camelCase `.js` | `content.js`, `curtain.js` |
| Content files | kebab-case `.mdx` | `lumen.mdx`, `evaluating-ai-agents.mdx` |
| CSS | `index.css` only | — |
| Static assets in `public/` | kebab-case, descriptive | `placeholder-lumen.jpg` |

## File organization

```
src/
  components/         ← shared across multiple pages
    work/             ← used only by Work.jsx (not shared)
  lib/                ← non-component utilities (content loader, curtain)
  pages/              ← one per route, all lazy-loaded
  content/            ← MDX files only (no JS/JSX)
  assets/             ← (currently empty; images go in public/ instead)
```

### Where things go

- **A component used by only one page** → co-locate it if it's small, or put
  it in a subfolder under `components/` matching the page name (like
  `components/work/`). Do not put page-specific components directly in
  `components/` — that directory is for shared components.
- **A utility used by multiple components** → `src/lib/`.
- **A utility used by one component** → inside that component's file.
- **Images** → `public/` (referenced by absolute path `/foo.jpg` in
  frontmatter and JSX). Do not import images in JS unless you need Vite to
  process them (hashing, optimization).
- **MDX files** → `src/content/projects/` or `src/content/writing/`. Never
  anywhere else.

## Import patterns

### Order (top to bottom of file)

1. React hooks (`useRef`, `useMemo`, `lazy`, `Suspense`, etc.)
2. Router (`react-router-dom`)
3. Animation (`gsap`, `@gsap/react`, `framer-motion`)
4. Content/lib (`../lib/content`, `../lib/curtain`)
5. Components (`../components/TransitionLink`, `../components/Meta`)
6. Relative sibling imports

### Path style

- Use relative paths (`../lib/content`, `./TransitionLink`), not path
  aliases. There is no `@/` or `~/` configured.
- The project root `src/` is the base for relative paths from pages:
  `../lib/content`, `../components/Meta`.

### What to import where

- **`framer-motion`**: only in `src/pages/Blog.jsx`. Do not import it
  anywhere else — it adds ~40KB gz to the chunk that imports it.
- **`gsap`**: import freely. It lands in a shared chunk.
- **`gsap/ScrollTrigger`**: import only in pages that use ScrollTrigger
  (currently `About.jsx`). Register it with
  `gsap.registerPlugin(useGSAP, ScrollTrigger)`.
- **`curtainTransition`**: import from `../lib/curtain` in any component that
  needs programmatic navigation (non-`TransitionLink` clicks).
- **`useTheme` / `setThemeWithTransition`**: import from `../lib/theme`. Only
  reach for `useTheme()` when JS needs the resolved palette (GSAP color
  tweens); styling alone should never need it.
- **`projects` / `posts`**: import from `../lib/content` (or
  `../../lib/content` from `components/work/`).

## Export style

- **Default export** for page components and shared components:
  `export default function Work() { ... }`
- **Named exports** for lib functions:
  `export function curtainTransition() { ... }`,
  `export const projects = ...`
- **Named exports** for content arrays and lookup functions in `content.js`.

## Component structure

A typical page component follows this shape:

```jsx
import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { curtainTransition } from '../lib/curtain';
import TransitionLink from '../components/TransitionLink';
import Meta from '../components/Meta';

gsap.registerPlugin(useGSAP);

export default function PageName() {
  const containerRef = useRef(null);
  // ... hooks ...

  useGSAP(() => {
    // entrance animation, scoped to containerRef
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="page-bg w-full h-screen h-dvh overflow-hidden bg-black">
      <Meta title="..." description="..." />
      {/* scroll-mask container + content */}
    </div>
  );
}
```

### Required for every page

1. **`<Meta />`** — for SEO/head tags.
2. **`h-screen h-dvh overflow-hidden`** on the outermost div — pages do not use
   document scroll. Add the **`page-bg`** marker class — the light theme's
   ambient gradient targets it.
3. **Scroll-mask pattern** if the page scrolls (see ANIMATIONS.md §2).
4. **`useGSAP` with `{ scope }`** for any mount-time animation.
5. **`key={slug}`** on the scroll container in detail pages — resets scroll
   position on param change.
6. **No hardcoded colors** — token classes only (`bg-black`, `text-zinc-400`,
   `text-neon`…). The light theme remaps tokens; literals like `#fff` or
   `rgba(0,0,0,.5)` cannot follow. Themed exceptions go through CSS variables
   defined per-theme in `index.css` (see `--dot-grid-color`).

## CSS conventions

- **Tailwind utility classes in JSX** for all styling. No CSS modules, no
  styled-components, no CSS-in-JS.
- **`src/index.css`** is the only stylesheet. Extend it (not create new
  files) if you need global styles.
- **`@theme`** in `index.css` defines design tokens. Add new tokens there,
  not in a `tailwind.config.js` (there isn't one).
- **`@apply`** is used in `.case-prose` and `@layer base`. The IDE warns
  "Unknown at-rule" — this is a false positive (Tailwind v4 processes it).
  Do not remove `@apply` to "fix" the warning.
- **Inline `style={{}}`** only for values Tailwind can't express:
  `perspective`, `perspectiveOrigin`, `maskImage`, `WebkitMaskImage`,
  `transformStyle`, `pathLength`, `strokeDasharray`, dynamic pixel values.

## Hooks conventions

- `useGSAP(() => { ... }, { scope: ref, dependencies: [...] })` — always
  pass `scope` to contain selector queries. Pass `dependencies` if the
  animation must replay on a param/state change (e.g., `[slug]` in detail
  pages).
- `gsap.quickTo` for high-frequency mouse tracking (IndexList cursor
  preview). Never use per-event `gsap.to` for mousemove — it creates a new
  tween per event and janks.
- `gsap.killTweensOf(target)` before starting a new tween on the same target
  in event handlers. Without this, rapid hover on/off stacks overlapping
  tweens.
- `useMemo(() => lazy(entry.load), [entry])` for MDX body components in
  detail pages. The `useMemo` is critical — recreating `lazy()` every render
  causes infinite remount loops.

## What not to do

- Do not create `tailwind.config.js` — Tailwind v4 uses `@theme` in CSS.
- Do not create `postcss.config.js` — `@tailwindcss/vite` handles it.
- Do not add `autoprefixer` — it's redundant with Tailwind v4.
- Do not create new CSS files — extend `index.css`.
- Do not add new dependencies without checking AGENTS.md hard rules. The
  stack is fixed: React, Vite, Tailwind, GSAP, Framer Motion, React Router,
  MDX, Fontsource. That's it.
- Do not use `clsx` or `tailwind-merge` (they're in `package.json` but
  unused — leftover from the template). If you need conditional classes,
  use template literals like the existing code does.
- Do not add comments that describe what the code does — add comments that
  describe WHY (the non-obvious reasoning). The existing codebase follows
  this pattern.
