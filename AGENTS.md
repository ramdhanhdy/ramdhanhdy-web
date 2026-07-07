# AGENTS.md — Read This Before Touching Anything

This is the personal portfolio of Ramdhan Hidayat (data analyst / AI engineer).
It is a **design-first, animation-heavy** React SPA. The animations and visual
language ARE the product. A change that "works" but degrades motion or visual
polish is a regression.

## Documentation index

| Doc | Read it when |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | You need to understand how anything fits together (start here) |
| [docs/ANIMATIONS.md](docs/ANIMATIONS.md) | You touch ANY component with `gsap`, `framer-motion`, transitions, or scrolling |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | You write or change any JSX/CSS |
| [docs/CONTENT.md](docs/CONTENT.md) | You add/edit projects or blog posts, or touch `src/lib/content.js` |
| [docs/ROUTING.md](docs/ROUTING.md) | You add routes, links, or touch navigation |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | You create files or write imports |
| [docs/PLAYBOOKS.md](docs/PLAYBOOKS.md) | Step-by-step recipes for the most common tasks |

## Hard rules (violating these = broken site)

1. **Never navigate with `<Link>` or bare `useNavigate()`.** All internal
   navigation must go through the curtain: use `<TransitionLink>` or
   `curtainTransition(() => navigate(...))` from `src/lib/curtain.js`.
   Bypassing it makes the page jump-cut, breaking the site's signature motion.

2. **Never remove or rename `#global-curtain`** (in `src/components/Layout.jsx`).
   The entire transition system finds it by that exact DOM id.

3. **Pages do not use document scroll.** Every page is `h-screen overflow-hidden`
   with an inner scrollable div. Do not add content that relies on `<body>`
   scrolling. See "Scroll-mask pattern" in docs/ANIMATIONS.md.

4. **The Overview3D rAF loop owns all card transforms.** Never tween a
   `.tunnel-card` element directly with GSAP — your tween will be overwritten
   every frame. Animate the per-card `hoverAmts` factors instead.

5. **Content lives in `src/content/*.mdx` only.** Never hardcode project/post
   data in components. The loader is `src/lib/content.js`.

6. **All pages are lazy-loaded** in `src/App.jsx`. New pages must follow the
   same `lazy(() => import(...))` pattern.

7. **Do not add CSS frameworks, UI libraries, or animation libraries.** The
   stack is Tailwind v4 + GSAP + Framer Motion (Blog only). That's it.

8. **Do not edit comments/docs to match broken code** — fix the code.

## Do-not-break checklist

After ANY change, verify the features nearby. Full context for each item is in
[docs/ANIMATIONS.md](docs/ANIMATIONS.md).

- [ ] **Curtain transition** — click any nav pill: neon curtain wipes up, page
      swaps while covered, curtain exits upward. No flash of unstyled/blank page.
- [ ] **Work / Overview (`/`)** — 3D card stack renders; mouse wheel cycles cards
      infinitely; hovering a card "throws" it toward the viewer and shows the
      angular callout label; clicking navigates to the case study.
- [ ] **Work / Index (`/?view=index`)** — rows stagger in; hovering a row shows
      a floating image preview that follows the cursor; row hover turns neon;
      clicking navigates.
- [ ] **About (`/about`)** — text characters light up progressively as you
      scroll; neon progress bar on the right tracks scroll.
- [ ] **Blog (`/blog`)** — posts stagger in with Framer Motion; titles turn neon
      on hover; clicking opens the post.
- [ ] **Detail pages (`/work/:slug`, `/blog/:slug`)** — content renders from
      MDX; prev/next (work) navigation works; unknown slug shows the 404.
- [ ] **Scroll masks** — on every scrollable page, content fades out under the
      header instead of clipping hard.
- [ ] **Build passes** — `npm run build` (fast, run it every time).

## Commands

```bash
npm run dev      # dev server (usually :5173)
npm run build    # ALWAYS run before considering a task done
npm run lint     # eslint
npm run preview  # serve dist/
```

There is no test suite. The build + the do-not-break checklist above are the
verification story. Verify visual changes in the browser, not by reading code.
