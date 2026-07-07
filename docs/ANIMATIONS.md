# Animation System — PROTECTED

Every interaction documented here is load-bearing. These are the site's
signature features. Treat each section as a contract: if your change touches
any file mentioned, re-verify the listed behavior in the browser before
finishing.

General rules:

- GSAP is the default engine. Framer Motion exists **only** in `Blog.jsx`.
- Component-scoped animations use `useGSAP(() => {...}, { scope: containerRef })`
  from `@gsap/react` — this auto-cleans tweens on unmount. Use it for anything
  created at mount time. Event-handler tweens (hover etc.) must
  `gsap.killTweensOf(target)` before starting a new tween on the same target.
- Entrance animations use `gsap.from(...)` with `clearProps: 'all'` so elements
  end in their natural CSS state (otherwise stale inline styles break hover
  transitions later).

---

## 1. Curtain page transition (site-wide) — THE most fragile system

**Files:** `src/lib/curtain.js`, `src/components/TransitionLink.jsx`,
`src/components/Layout.jsx`

**Behavior:** every internal navigation is a neon panel that wipes up from the
bottom, covers the screen, the route swaps while hidden, then the panel
continues upward and exits.

**The contract (all parts required):**

1. `Layout.jsx` renders `<div id="global-curtain" className="fixed inset-0
   z-50 bg-neon pointer-events-none" />` and parks it below the viewport on
   mount: `gsap.set(curtainRef.current, { yPercent: 100 })` in
   `useLayoutEffect`. If this `set` is removed, the curtain covers the screen
   on first paint (site appears as a neon void).
2. `curtainTransition(onCovered)` in `src/lib/curtain.js`:
   - looks up the element **by id `global-curtain`** — renaming the id breaks
     every navigation silently (it falls back to instant navigation);
   - `killTweensOf` first (rapid clicking must not stack tweens);
   - `yPercent 100 → 0`, 0.6s, `power3.inOut`; at complete: `onCovered()`
     (this is where `navigate()` runs), then after `delay: 0.1`,
     `yPercent 0 → -100`, 0.6s.
3. `TransitionLink` is a real `<a href>` (middle-click / ctrl-click / new-tab
   still work via the modifier guard) that calls `e.preventDefault()` and runs
   `curtainTransition(() => navigate(to))` for plain left clicks.
4. Non-anchor interactive elements (3D cards, index rows, blog items) call
   `curtainTransition(() => navigate(...))` in their click handlers with the
   same modifier-key guard where they are `<a>` tags.

**Interaction with lazy routes:** `navigate()` fires while the screen is fully
covered, and the curtain waits 0.1s + 0.6s before revealing — that window is
what hides lazy chunk loading and Suspense's `null` fallback. If you change
the timing, keep the covered window ≥ ~0.3s.

**Do not:** navigate with `<Link>`, bare `navigate()`, or `window.location`
for internal routes. Do not give the curtain `pointer-events` (it must never
block clicks). Do not lower its `z-50` (it must cover the `z-40` header).

**Verify:** click nav pills rapidly; navigate Work→About→Blog→detail pages.
No jump-cuts, no stuck curtain, no double-wipes.

---

## 2. Scroll-mask pattern (every scrollable page)

**Files:** `About.jsx`, `Blog.jsx`, `ProjectDetail.jsx`, `PostDetail.jsx`,
`IndexList.jsx`

**Behavior:** the header floats over content; scrolled content fades out
beneath it instead of hard-clipping.

**The pattern (copy it exactly when building a new scrollable page):**

```jsx
<div className="w-full h-screen overflow-hidden bg-black">   {/* page frame */}
  <div
    className="w-full h-full overflow-y-auto no-scrollbar pt-32 pb-24 ..."
    style={{
      maskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 120px)',
    }}
  >
    {/* content */}
  </div>
</div>
```

Key facts:

- **The document/body never scrolls.** All scrolling is inside these inner
  divs. `body` has `overflow-x-hidden` only.
- `.no-scrollbar` (defined in `index.css`) hides scrollbars on all engines.
- The `120px` mask distance matches the fixed header height; both `maskImage`
  and `WebkitMaskImage` are required.
- Top padding `pt-32` (or `pt-40` on Blog) keeps content clear of the header
  at scroll 0.
- Anything using GSAP ScrollTrigger inside these pages MUST pass the inner
  div as `scroller:` (see §5) — ScrollTrigger defaults to window scroll,
  which never fires here.

---

## 3. Overview3D — the 3D card carousel (`/`)

**File:** `src/components/work/Overview3D.jsx`. The most complex file in the
repo. Read the whole file before editing it.

### 3a. The rAF layout loop owns everything

A `requestAnimationFrame` loop runs `layoutCards()` every frame, which
`gsap.set`s position, rotation, scale, opacity, z-index, and pointer-events on
every `.tunnel-card`.

**Consequence: you cannot tween a card element directly.** Any `gsap.to(card,
...)` gets overwritten within 16ms. To animate a card, you must animate a
*factor* the loop reads. This is exactly how hover works (§3d).

### 3b. Infinite wheel scroll

- `wheel` listener on the container with `{ passive: false }` +
  `e.preventDefault()` — **required**, otherwise the page rubber-bands.
- `targetScroll += e.deltaY * 0.002`; the loop lerps
  `scrollPos += (target - scrollPos) * 0.08` for smoothing.
- Cards wrap infinitely via positive-modulo on their offset:
  `offset = ((offset + half) % total + total) % total - half`.
- Offset drives placement: `z = offset * -280`, `x = offset * 180`,
  `y = offset * -55`. Negative offset = near camera.
- Opacity fades at both ends: `offset > 2.5` (wrapping to back) and
  `offset < -1.5` (passing the camera). Cards under 0.3 opacity get
  `pointer-events: none` so invisible cards can't swallow hovers/clicks.

### 3c. Perspective-shear compensation (the "tilted image" fix)

All cards share base rotation (`rotX 8, rotY -38, rotZ -2`), but CSS
perspective projects each card along a different sight line depending on its
x/y offset from the perspective origin (`50% 15%`), which made some cards
appear skewed. `layoutCards` compensates per card:

```js
const depth = PERSPECTIVE - zShift;
const compY = Math.atan2(xShift, depth) * DEG;   // subtracted from rotationY
const compX = Math.atan2(yShift, depth) * DEG;   // added to rotationX
```

**Do not remove this** or the "some cards look tilted" bug returns. If you
change the perspective value or the offset multipliers, the compensation
adjusts automatically (it derives from the same numbers).

### 3d. Disc-throw hover

Hovering a card "flings" it toward the viewer. Implementation:

- `hoverAmts` — a ref holding one `{ v: 0 }` object per project.
- `handleCardEnter`: `gsap.to(amt, { v: 1, duration: 0.55, ease:
  'back.out(2.4)' })`. The back-ease overshoot past 1 creates the kinetic
  snap.
- `handleCardLeave`: `v → 0`, `power3.out`, 0.5s.
- `layoutCards` folds `hover` into every frame:
  z `+240px`, y `-18px`, yaw `+26°` toward face-on, pitch `-6°`, spin `+3°`,
  scale `+4%`, z-index `+1000`.
- All magnitudes are the `THROW_*` constants at the top of the file — tune
  there, nowhere else.
- Both handlers `killTweensOf(amt)` first — required for rapid hover on/off.

### 3e. Angular callout (floating metadata label)

Each card contains a `.callout` block (hidden by default, `pointer-events-none`)
with:

- `.callout-path` — an SVG polyline `M8 68 L8 42 L34 18 L196 18`
  (vertical rise → 45° fold → horizontal run). It draws in via the
  `pathLength="1"` + `strokeDasharray="1"` + animated `strokeDashoffset 1→0`
  trick (GSAP-animatable without the paid DrawSVG plugin).
- `.callout-marker` — a diamond (rotated rect) pinned where the line meets the
  card; pops in with `back.out(3)` scale.
- `.callout-label` — mono, uppercase, neon tag reading `0{id} · {CATEGORY}`,
  fading in with a 0.18s delay so the line "arrives" first.

The callout lives **inside the card's 3D plane** on purpose: it tilts with the
card and straightens as the throw rotates the card toward the viewer.

**Structural requirement:** the card root (`.tunnel-card`) has NO
`overflow-hidden`; clipping and `rounded-xl` live on the inner "card face"
div. If you re-add overflow-hidden to the root, the callout gets clipped.
The inner face keeps `transform: translateZ(0)` (Chrome/Safari border-radius
rendering fix).

### 3f. Misc invariants

- Container: `perspective: ${PERSPECTIVE}px`, `perspectiveOrigin: '50% 15%'`,
  `cursor-ns-resize`. Stack wrapper: `transformStyle: 'preserve-3d'`.
- Cards: `backfaceVisibility: hidden`, sized by `CARD_W/CARD_H` (580×380).
- Card click navigates via `curtainTransition` (§1).
- Images: `loading="eager"` (they're the hero content), `decoding="async"`,
  explicit width/height.

**Verify after touching:** wheel in both directions (infinite, no stutter at
the wrap seam), hover several cards including partially-faded ones, click
navigates, no card visibly "pops" transforms.

---

## 4. IndexList — work index with cursor preview (`/?view=index`)

**File:** `src/components/work/IndexList.jsx`

Three cooperating behaviors:

1. **Entrance:** `gsap.from('.list-item', { opacity: 0, y: 30, stagger: 0.1,
   clearProps: 'all' })` inside `useGSAP`.
2. **Cursor-following preview:** a single `fixed` 300×200 image element moves
   with the mouse via `gsap.quickTo(imageRef.current, 'x'/'y', ...)` bound to
   a window `mousemove` listener (offsets −150/−100 center it on the cursor).
   Row `onMouseEnter` swaps `activeImage` state + fades the preview in;
   `onMouseLeave` fades it out. `quickTo` is the performance trick — do not
   replace it with per-event `gsap.to` calls.
3. **Scroll hover-guard:** while the inner container scrolls, `disable-hover`
   is added to `<body>`; `.disable-hover .list-item { pointer-events: none }`
   (in `index.css`) prevents hover states sticking to the wrong row during
   smooth scrolling. Removed 100ms after scrolling stops.

Rows are `<a href="/work/:slug">` with a modifier-key guard that routes plain
clicks through `curtainTransition`. Row hover inverts the row to neon
(`hover:bg-neon` + `group-hover:text-zinc-900` on children) and dims siblings
(`group-hover/list:opacity-30 hover:!opacity-100`).

**Verify:** stagger plays once, preview follows the cursor smoothly and shows
the right image per row, no stuck hover after fast scrolling, clicks navigate.

---

## 5. About — scroll-driven character reveal (`/about`)

**File:** `src/pages/About.jsx`

- `TextReveal` splits paragraphs into per-character `<span class="text-char">`
  elements (opacity 0.2, zinc-500).
- A ScrollTrigger-scrubbed `gsap.to('.text-char', { color: '#fff', opacity: 1,
  stagger: 0.05, scrub: 1 })` lights characters up as the user scrolls.
- **Critical:** the page scrolls in an inner div (scroll-mask pattern, §2), so
  both ScrollTriggers pass `scroller: scrollerRef.current`. If you copy this
  pattern to a new page, forgetting `scroller:` means the animation simply
  never runs.
- The `start` position is computed (see in-file comment) so ~15% of characters
  are already lit at scroll 0 — keeps the lit region ahead of reading pace.
  Don't replace the computed `start` with a hardcoded value.
- The neon progress bar (right edge, hidden on mobile) is a `scaleY 0→1` scrub
  of `contentRef` scroll progress, `transform-origin: top`.

**Verify:** characters light progressively while scrolling (already partially
lit at top), progress bar reaches exactly full at the bottom.

---

## 6. Blog list — Framer Motion stagger (`/blog`)

**File:** `src/pages/Blog.jsx` — the ONLY Framer Motion consumer.

- `containerVariants`: staggerChildren 0.1. `itemVariants`: `y: 50 → 0`,
  0.8s, ease `[0.16, 1, 0.3, 1]` (expo-like).
- List renders from `posts` (content loader); each item is
  `<a href="/blog/:slug">` with the modifier-guard + `curtainTransition`.
- Hover: title turns neon via CSS transition (no JS).

If you remove/replace this page, framer-motion should leave the bundle —
check `npm run build` output.

---

## 7. Detail pages entrance (`/work/:slug`, `/blog/:slug`)

**Files:** `ProjectDetail.jsx`, `PostDetail.jsx`

- `gsap.from('.detail-reveal', { opacity: 0, y: 40, stagger: 0.08, delay:
  0.15, clearProps: 'all' })` with `dependencies: [slug]` — the dependency
  makes the entrance replay on prev/next navigation (same component instance,
  new slug). The scroll container also has `key={slug}` to reset scroll
  position. Keep both.
- MDX body: `const Body = useMemo(() => lazy(entry.load), [entry])` inside
  `<Suspense fallback={null}>`. The `useMemo` is required — recreating
  `lazy()` every render causes infinite remount loops.
- Unknown slug renders `<NotFound />` inline (no redirect), keeping the URL.

---

## 8. NotFound (`*`)

Star logo rotates forever (`rotation: 360, repeat: -1, ease: 'none'`), content
staggers in. Nothing depends on this page; safe to restyle.

---

## Adding a new animation — checklist

1. GSAP by default. Framer Motion only if extending `Blog.jsx` itself.
2. Mount-time animation → `useGSAP` with `{ scope }` (+ `dependencies` if it
   must replay on param change). Event-driven → plain handlers with
   `killTweensOf` first.
3. Never tween `.tunnel-card` directly (§3a).
4. Scroll-linked → ScrollTrigger with explicit `scroller:` (§2, §5).
5. Entrances use `gsap.from` + `clearProps: 'all'`.
6. Respect the motion language: fast-out expressive easing (`power3.out`,
   `back.out`), 0.3–0.9s durations, staggers 0.05–0.1, neon accents.
