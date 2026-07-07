# Architecture

## What this is

A single-page portfolio (React 19 + Vite 8) with five surfaces: a 3D work
carousel, a work index list, an about page, a writing/blog section, and a
contact page. Project case studies and blog posts are MDX files compiled at
build time. There is no backend, no CMS, no server rendering.

## Stack (exact, do not add to it)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 19 | Uses React 19 native `<title>`/`<meta>` head hoisting (no helmet lib) |
| Build | Vite 8 | Rolldown-based. MDX plugin runs `enforce: 'pre'` before the React plugin |
| Styling | Tailwind CSS v4 | Via `@tailwindcss/vite`. **No PostCSS config, no autoprefixer** — the plugin handles it |
| Animation | GSAP 3 + `@gsap/react` | Primary animation engine, used everywhere |
| Animation | Framer Motion | **Blog list page only.** Do not spread it to other pages |
| Routing | React Router 7 (`react-router-dom`) | BrowserRouter, nested under one `Layout` |
| Content | MDX (`@mdx-js/rollup` + remark-frontmatter + remark-mdx-frontmatter) | Frontmatter exported as a named `frontmatter` export |
| Fonts | Fontsource variable fonts | Inter Variable (sans), JetBrains Mono Variable (mono), self-hosted |
| Icons | `lucide-react` | Available but barely used; inline SVG preferred for brand marks |

## Directory map

```
e:/ramdhanhdy-web
├── index.html                  # Shell: default meta, JSON-LD Person schema
├── vite.config.js              # MDX (pre) → tailwindcss → react plugin order matters
├── eslint.config.js
├── AGENTS.md                   # Agent entry point / hard rules
├── docs/                       # You are here
├── public/                     # Static assets served at /
│   ├── favicon.svg
│   ├── robots.txt
│   └── placeholder-*.jpg       # Project cover images (referenced by MDX frontmatter)
└── src/
    ├── main.jsx                # ReactDOM root + BrowserRouter
    ├── App.jsx                 # Route table. ALL pages lazy-loaded here
    ├── index.css               # Fonts, @theme tokens, global CSS, .case-prose styles
    ├── components/
    │   ├── Layout.jsx          # Header nav + <Suspense><Outlet/></Suspense> + #global-curtain
    │   ├── TransitionLink.jsx  # <a> that navigates through the curtain
    │   ├── HeaderHomeButton.jsx# 4-pointed star logo (links to /?view=index)
    │   ├── Meta.jsx            # Per-page <title>/OG/Twitter tags (React 19 hoisting)
    │   └── work/               # Components used only by the Work page
    │       ├── Overview3D.jsx  # 3D card carousel (rAF-driven, most complex file)
    │       └── IndexList.jsx   # Text index with cursor-following image preview
    ├── content/                # ★ SOURCE OF TRUTH for all content
    │   ├── projects/*.mdx      # One file per case study
    │   └── writing/*.mdx       # One file per blog post
    ├── lib/
    │   ├── content.js          # Content loader (glob imports, sorting, lookups)
    │   └── curtain.js          # curtainTransition() — the shared page-wipe
    └── pages/                  # One component per route (all lazy)
        ├── Work.jsx            # / — toggles Overview3D vs IndexList via ?view=
        ├── ProjectDetail.jsx   # /work/:slug
        ├── About.jsx           # /about — scroll-driven character reveal
        ├── Blog.jsx            # /blog — Framer Motion list
        ├── PostDetail.jsx      # /blog/:slug
        ├── Contact.jsx         # /contact
        └── NotFound.jsx        # * and unknown slugs
```

## How the pieces connect

```
main.jsx
  └─ BrowserRouter
      └─ App.jsx (route table, React.lazy per page)
          └─ Layout.jsx  ──────────────┐
              ├─ header (TransitionLink pills)
              ├─ <Suspense fallback={null}> <Outlet/> </Suspense>
              └─ #global-curtain (fixed, z-50, bg-neon)
                          ▲
                          │ found by DOM id
              lib/curtain.js ◄── TransitionLink.jsx
                          ▲        Overview3D / IndexList / Blog click handlers
                          │
              pages/* ──► lib/content.js ──► src/content/**/*.mdx
                              (frontmatter eager, bodies lazy)
```

### Data flow: content → screen

1. `src/lib/content.js` runs two `import.meta.glob` calls per collection:
   - `{ eager: true, import: 'frontmatter' }` — tiny metadata objects, bundled
     into whatever chunk imports `content.js`.
   - a plain (lazy) glob — a map of `path → () => import(mdx)` used by detail
     pages to load the compiled MDX body **as its own chunk**.
2. Index views (`Work` → `Overview3D`/`IndexList`, `Blog`) render from the
   metadata arrays only. They never load MDX bodies.
3. Detail pages (`ProjectDetail`, `PostDetail`) look up the entry by `:slug`,
   wrap `entry.load` in `React.lazy` (memoized on the entry), and render it
   inside `<Suspense>` within a `.case-prose` container.

### Navigation flow (the curtain)

1. User clicks a `TransitionLink` (or a card/row/post with a click handler).
2. `curtainTransition(onCovered)` animates `#global-curtain` from below the
   viewport (`yPercent: 100`) to cover it (`yPercent: 0`) in 0.6s.
3. At full cover, `onCovered()` fires — this is where `navigate()` happens.
   React swaps the route; the lazy chunk fetches **while hidden**.
4. After a 0.1s beat, the curtain exits upward (`yPercent: -100`).
5. The incoming page's own entrance animation plays as the curtain reveals it.

This is why `Suspense fallback={null}` is safe: any blank frame is behind the
curtain. See docs/ANIMATIONS.md for the full contract.

## Code-splitting strategy

- Every page in `src/App.jsx` is `lazy(() => import(...))`.
- Framer Motion (~40KB gz) is only imported by `Blog.jsx`, so it ships only in
  the Blog chunk. **Do not import framer-motion anywhere else.**
- Each MDX file compiles to its own ~1KB chunk.
- GSAP lands in a shared chunk because `Layout`/`curtain.js` need it globally.

Check the effect of your changes on chunking by reading `npm run build` output.

## SEO

- `index.html`: default title/description + JSON-LD `Person`.
- `src/components/Meta.jsx`: per-page `<title>`, `description`, OG and Twitter
  tags. React 19 hoists these into `<head>` automatically — do NOT add
  react-helmet or similar.
- Every page renders `<Meta .../>`; detail pages pass the entry's
  title/summary/cover.
- `public/robots.txt` allows everything. There is no sitemap yet (no production
  domain decided).

## What does not exist (do not assume it does)

- No test suite, no CI, no deployment config (not yet deployed).
- No dark/light theming — the site is permanently dark.
- No i18n. English only.
- No state management library. All state is component-local or in the URL.
- No API calls at runtime. Everything is static.
