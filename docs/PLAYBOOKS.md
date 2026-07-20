# Playbooks — Step-by-Step Recipes

Each recipe is self-contained. Read the referenced docs if you need deeper
context. Always run `npm run build` after completing any recipe.

---

## PB-1: Add a new project

**Time:** ~5 minutes. No code changes required.

1. **Create the MDX file:** `src/content/projects/<slug>.mdx`

   ```yaml
   ---
   title: Project Name
   slug: project-name
   category: Short Category
   role: Your Role
   year: "2026"
   order: 9
   cover: /project-name-cover.jpg
   summary: One-sentence outcome.
   stack: [Python, FastAPI]
   draft: false
   ---

   ## Context

   Who needed this and why.

   ## Approach

   The interesting technical decisions.

   ## Evidence

   Metrics, diagrams, examples.

   ## Outcome

   What happened because this exists.
   ```

2. **Add the cover image:** place it in `public/` at the path specified in
   `cover:`. Use a 3:2 aspect ratio (or close — `object-cover` will crop).

3. **Build:** `npm run build`

4. **Verify:**
   - The project appears in the 3D carousel (scroll to it).
   - The project appears in the index list (`/?view=index`).
   - Clicking it in either view navigates to `/work/project-name`.
   - The detail page renders the MDX body with correct meta row.
   - Prev/next navigation at the bottom links to adjacent projects.

**That's it.** The glob in `content.js` discovers the new file automatically.

---

## PB-2: Add a new blog post

**Time:** ~5 minutes. No code changes required.

1. **Create the MDX file:** `src/content/writing/<slug>.mdx`

   ```yaml
   ---
   title: "Post Title Here"
   slug: post-slug
   date: "2026-02-01"
   summary: One-line description.
   draft: false
   ---

   Your essay content in Markdown/MDX.
   ```

2. **Build:** `npm run build`

3. **Verify:**
   - The post appears in the Blog list (`/blog`), sorted by date (newest
     first).
   - Clicking it navigates to `/blog/post-slug`.
   - The detail page renders the MDX body with the date and title header.
   - The "All writing" link at the bottom returns to `/blog`.

**MDX gotcha:** use `{/* comment */}` for comments, not `<!-- comment -->`.
HTML comments cause a build error in MDX.

---

## PB-3: Add a new page (route)

**Time:** ~15 minutes.

1. **Create the page component:** `src/pages/NewPage.jsx`

   ```jsx
   import { useRef } from 'react';
   import gsap from 'gsap';
   import { useGSAP } from '@gsap/react';
   import Meta from '../components/Meta';

   gsap.registerPlugin(useGSAP);

   export default function NewPage() {
     const containerRef = useRef(null);

     useGSAP(() => {
       gsap.from('.new-page-reveal', {
         opacity: 0,
         y: 40,
         duration: 0.9,
         stagger: 0.08,
         ease: 'power3.out',
         delay: 0.15,
         clearProps: 'all',
       });
     }, { scope: containerRef });

     return (
       <div ref={containerRef} className="page-bg w-full h-screen h-dvh overflow-hidden bg-black">
         <Meta title="New Page" description="Page description." />
         <div
           className="w-full h-full overflow-y-auto no-scrollbar pt-32 pb-24 px-6 md:px-12"
           style={{
             maskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
             WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
           }}
         >
           <div className="max-w-4xl mx-auto">
             <h1 className="new-page-reveal text-5xl md:text-7xl font-semibold tracking-tighter text-white">
               New Page
             </h1>
             <div className="new-page-reveal mt-8 text-lg text-zinc-300">
               Content here.
             </div>
           </div>
         </div>
       </div>
     );
   }
   ```

2. **Register the route** in `src/App.jsx`:

   ```jsx
   const NewPage = lazy(() => import('./pages/NewPage'));
   ```

   Add inside the `<Layout>` route:

   ```jsx
   <Route path="new-page" element={<NewPage />} />
   ```

3. **Add a nav link** in `src/components/Layout.jsx` (if the page should be
   in the header). Copy the pattern of an existing pill:

   ```jsx
   <TransitionLink
     to="/new-page"
     className={`px-4 py-2 rounded-full border text-sm transition-colors duration-300 ${
       isActive('/new-page')
         ? 'border-white text-white bg-white/5'
         : 'border-zinc-800 text-white hover:bg-neon hover:text-black hover:border-neon'
     }`}
   >
     New Page
   </TransitionLink>
   ```

4. **Build:** `npm run build`

5. **Verify:**
   - Navigate to `/new-page` via the nav pill — curtain transition plays.
   - Page renders with the scroll-mask pattern (content fades under header).
   - Entrance animation plays (elements stagger in).
   - Page title in the browser tab is correct.
   - `npm run build` output shows a new chunk for the page.

---

## PB-4: Add a new animation to an existing page

**Time:** varies. Read ANIMATIONS.md first.

### If it's a mount-time entrance animation

1. Add elements with a class name (e.g., `.my-reveal`).
2. Inside the page's existing `useGSAP(() => { ... }, { scope: containerRef })`:
   ```js
   gsap.from('.my-reveal', {
     opacity: 0,
     y: 30,
     duration: 0.8,
     stagger: 0.1,
     ease: 'power3.out',
     clearProps: 'all',
   });
   ```
3. If the animation depends on a route param (e.g., `slug`), add
   `dependencies: [slug]` to the `useGSAP` options.

### If it's a hover/interaction animation

1. Use event handlers (`onMouseEnter`, `onMouseLeave`, `onClick`).
2. Always `gsap.killTweensOf(target)` before starting a new tween.
3. If the target is a `.tunnel-card` in Overview3D, **do not tween it
   directly** — the rAF loop overwrites transforms every frame. Animate a
   factor the loop reads (see ANIMATIONS.md §3d for the hover pattern).

### If it's a scroll-linked animation

1. Use `ScrollTrigger` — import and register it:
   ```js
   import { ScrollTrigger } from 'gsap/ScrollTrigger';
   gsap.registerPlugin(useGSAP, ScrollTrigger);
   ```
2. **Pass `scroller:` to the ScrollTrigger** — the page scrolls in an inner
   div, not the window. Without `scroller:`, the trigger never fires.
   ```js
   scrollTrigger: {
     trigger: contentRef.current,
     scroller: scrollerRef.current,
     start: 'top top',
     end: 'bottom bottom',
     scrub: true,
   }
   ```
3. Use `scrub: 1` for smooth scrubbing, or `scrub: true` for 1:1.

### Motion language checklist

- Easing: `power3.out` for entrances, `power3.inOut` for symmetric wipes,
  `back.out(n)` for kinetic overshoot (use sparingly).
- Duration: 0.3–0.9s. Nothing over 1s unless it's a deliberate hero moment.
- Stagger: 0.05–0.1s per item.
- `clearProps: 'all'` on `gsap.from` entrances so inline styles don't
  interfere with later CSS transitions.
- Neon accent for the animated element if it's an emphasis moment; zinc
  shades otherwise.

---

## PB-5: Modify the 3D carousel

**Read ANIMATIONS.md §3 in full before touching `Overview3D.jsx`.**

### Tuning the card-draw hover

All hover physics constants are at the top of the file:

```js
const DRAW_X = 240;       // px to the right for non-front cards
const DRAW_Z = 56;        // subtle lift toward the viewer
const DRAW_LIFT = 10;     // px upward
const DRAW_SCALE = 0.015;
const FRONT_DRAW_Z = 32;  // camera-nearest visible card: depth only
const FRONT_DRAW_SCALE = 0.01;
```

And the easing in `handleCardEnter`:

```js
gsap.to(amt, { v: 1, duration: 0.45, ease: 'power3.out' });
```

- More rightward separation from the deck: increase `DRAW_X`.
- More depth emphasis: increase `DRAW_Z` or `DRAW_SCALE` sparingly.
- Tune the front card independently with `FRONT_DRAW_Z` and
  `FRONT_DRAW_SCALE`; do not add x/y movement to it.
- Faster/slower: adjust `duration`.
- Gentler return: change `handleCardLeave` to `power2.out` or increase its
  duration slightly.

### Tuning the carousel layout

In `layoutCards`:

```js
const zShift = offset * -280;   // depth spacing between cards
const xShift = offset * 180;    // horizontal spread
const yShift = offset * -55;    // vertical rise
```

- More spread out: increase `xShift` multiplier.
- Deeper stack: increase `zShift` multiplier.
- The perspective-shear compensation (`compY`, `compX`) derives from these
  values automatically — no separate tuning needed.

### Responsive carousel scale

`layoutCards` derives `cardScale` from `containerRef.current.clientWidth`:

- Below 640px, the card fits inside a 48px viewport gutter and is clamped to
  `0.44–0.62`.
- From 640–1100px, scale interpolates from `0.68` to `1`.
- `spacingScale` reduces x/y/z deck spacing with the card scale.

Keep this calculation inside the rAF-owned layout. Do not add a CSS transform
to `.tunnel-card`, because it will conflict with the transform owner.

### Tuning the callout

The SVG path in the JSX:

```
d="M8 68 L8 42 L34 18 L196 18"
```

This is: start at card edge → rise 26px → 45° fold → horizontal run to label.
Change the coordinates to alter the bend pattern. The label position is
controlled by the `.callout` container's CSS (`-top-12 right-8`).

### Scroll sensitivity

```js
targetScroll.current += e.deltaY * 0.002;
```

Increase `0.002` for faster scrolling, decrease for slower.

### Smoothness

```js
scrollPos.current += (targetScroll.current - scrollPos.current) * 0.08;
```

Higher = snappier (less smooth). Lower = more lag but smoother.

---

## PB-6: Replace placeholder content with real content

1. **Project case studies:** edit the `.mdx` files in
   `src/content/projects/`. Replace the `TODO` placeholder body with the
   real case study. Keep the `## Context / ## Approach / ## Evidence /
   ## Outcome` structure or change it — the `.case-prose` styles handle any
   heading levels.

2. **Cover images:** replace `public/placeholder-*.jpg` with real images, or
   update the `cover:` path in frontmatter to point to new files in
   `public/`.

3. **Blog posts:** edit the `.mdx` files in `src/content/writing/`. Replace
   the outline with the full essay.

4. **About page text:** edit the `paragraphs` array in
   `src/pages/About.jsx`. Each string becomes a scroll-revealed paragraph.
   Keep paragraphs reasonably long (3-5 sentences) for the best reveal
   pacing.

5. **Contact info:** edit `src/pages/Contact.jsx` — update email, social
   links.

6. **Build and verify:** `npm run build`, then check each page in the
   browser.

---

## PB-7: Deploy the site

Not yet configured. When ready:

1. Choose a static host (Netlify, Cloudflare Pages, Vercel).
2. Build command: `npm run build`
3. Output directory: `dist`
4. SPA fallback: all routes should serve `index.html` (the host's
   `_redirects` or equivalent). Without this, direct navigation to
   `/work/lumen` returns a 404 from the host.
5. After first deploy, add a `sitemap.xml` to `public/` and update
   `robots.txt` with the production domain.
