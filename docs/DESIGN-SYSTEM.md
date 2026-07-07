# Design System

The visual language is **dark-minimal with a single neon accent**. Every
surface is near-black; the accent (`#C6FF00`) appears only at moments that
matter — hover states, the curtain, active callouts, the scrollbar, key
typographic highlights. Restraint is the rule: if everything is neon, nothing
is.

## Color

| Token | Value | Usage |
|---|---|---|
| `--color-neon` | `#C6FF00` | The ONE accent. Curtain fill, hover states, callout line/label border, scrollbar fill, blog title hover, link underlines in prose |
| `bg-black` | `#000` | Every page background, card overlay base |
| `text-white` | `#fff` | Primary headings, active nav pill text |
| `text-zinc-300` | | Body text in prose, meta values |
| `text-zinc-400` | | Secondary text (summaries, year badges) |
| `text-zinc-500` | | Tertiary text (meta labels, unlit About chars) |
| `text-zinc-600` | | Muted labels (uppercase mono captions) |
| `border-zinc-800` | | Dividers, inactive nav pill borders, card borders at `white/[0.08]` |
| `bg-zinc-900` | | Inline code blocks, callout label bg at `black/85` |

### Rules

- **Never introduce a second accent color.** If you need visual hierarchy, use
  opacity/zinc shades, not a new hue.
- **Neon is for interaction and emphasis, not decoration.** A static neon
  element that doesn't respond to user input dilutes the language.
- **Hover pattern:** inactive → `border-zinc-800 text-white`; hover →
  `bg-neon text-black border-neon`. This exact triplet is used on every nav
  pill and every interactive border element. Copy it; don't invent variants.
- `mix-blend-difference` on the header makes nav legible over any content.
  Don't remove it or add backgrounds to header children that cancel the blend.

## Typography

| Token | Font | Usage |
|---|---|---|
| `--font-sans` | Inter Variable | Everything default — headings, body, nav, labels |
| `--font-mono` | JetBrains Mono Variable | Meta values, callout labels, year badges, code blocks, uppercase tracking labels |

### Type scale (as used in the codebase, not hardcoded tokens)

| Context | Classes | Notes |
|---|---|---|
| Hero / detail page title | `text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter` | ProjectDetail header |
| Blog post title | `text-4xl md:text-6xl font-semibold tracking-tighter leading-[1.05]` | PostDetail header |
| Blog list item | `text-4xl md:text-5xl lg:text-[5vw] font-medium tracking-tight` | Fluid sizing |
| IndexList row title | `text-4xl sm:text-5xl lg:text-7xl font-medium tracking-tight` | |
| About body | `text-2xl md:text-3xl lg:text-[2.5rem] leading-[1.3] font-medium tracking-tight` | |
| Section heading (prose) | `text-3xl md:text-4xl font-semibold tracking-tight` | `.case-prose h2` |
| Card title | `text-xl font-semibold` | Overview3D overlay |
| Meta label | `text-xs uppercase tracking-widest` | Mono, zinc-600 |
| Callout label | `text-[10px] uppercase tracking-[0.25em]` | Mono, neon |

### Rules

- `tracking-tighter` on large display type, `tracking-tight` on medium,
  `tracking-widest` / `tracking-[0.25em]` on uppercase mono labels.
- Headings use `font-semibold` (600) or `font-medium` (500), never `font-bold`.
- Body prose is `text-lg leading-relaxed` via `.case-prose`.
- Fonts are self-hosted via Fontsource (`@fontsource-variable/inter`,
  `@fontsource-variable/jetbrains-mono`). **Do not use Google Fonts CDN.** The
  `@import` lines at the top of `src/index.css` must stay before
  `@import "tailwindcss"`.

## Spacing & layout

- Page frame: `h-screen overflow-hidden` (never document scroll).
- Inner scroll container: `pt-32 pb-24 px-6 md:px-12` (Blog uses `pt-40`).
- Content max-widths: `max-w-4xl` (About, ProjectDetail), `max-w-3xl`
  (PostDetail), `max-w-5xl` (IndexList), `max-w-[90vw]` (Blog list).
- Header: `px-8 py-4`, `fixed top-0 z-40`.
- Scroll-mask gradient: `transparent 0% → black 120px` (matches header height).

## Component conventions

### Buttons / pills

```
px-4 py-2 rounded-full border text-sm transition-colors duration-300
```

Active: `border-white text-white bg-white/5`.
Inactive: `border-zinc-800 text-white hover:bg-neon hover:text-black hover:border-neon`.

### Cards (Overview3D)

- Fixed pixel size: 580×380 (`CARD_W`, `CARD_H`).
- `rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl`.
- Depth overlay: `bg-black/30` at rest, `group-hover:bg-black/10` on hover.
- `translateZ(0)` on the inner face (Chrome border-radius fix — keep it).

### Prose (MDX body)

All MDX content renders inside `<div class="case-prose">`. Styles are defined
in `src/index.css` under `.case-prose` — h2/h3/p/a/ul/ol/blockquote/code/pre/
img/hr/strong. **Do not style MDX output with component-level CSS;** extend
`.case-prose` in `index.css` if you need a new element styled.

### Images

- `object-cover w-full h-full` for card/cover images.
- `decoding="async"` always.
- `loading="eager"` for above-the-fold card images, `lazy` for below-fold.
- Explicit `width`/`height` attributes where the aspect ratio is known
  (prevents layout shift).

## Motion language (easing & timing)

| Purpose | Ease | Duration |
|---|---|---|
| Entrance (general) | `power3.out` | 0.8–0.9s |
| Entrance stagger | — | 0.08–0.1s per item |
| Curtain wipe | `power3.inOut` | 0.6s each direction |
| Disc-throw hover in | `back.out(2.4)` | 0.55s |
| Disc-throw hover out | `power3.out` | 0.5s |
| Callout path draw | `power2.inOut` | 0.4s |
| Callout marker pop | `back.out(3)` | 0.25s |
| CSS hover transitions | `transition-colors duration-300` | 0.3s |
| ScrollTrigger scrub | `scrub: 1` | — |

**Vibe:** fast, confident, with a touch of overshoot on kinetic interactions.
Nothing should feel mushy or slow. Nothing should feel bouncy/childish either
— `back.out` is used sparingly for the "thrown" feel, not everywhere.

## CSS architecture

- `src/index.css` is the only stylesheet. It contains: font imports, `@theme`
  tokens, `@layer base` (body), `.no-scrollbar`, `.disable-hover`, and
  `.case-prose` styles.
- Tailwind v4 via `@tailwindcss/vite` — **no `tailwind.config.js`**, no
  `postcss.config.js`. The `@theme` block in `index.css` IS the config.
- `@apply` is used in `.case-prose` and `@layer base`. The IDE warns
  "Unknown at-rule @theme/@apply" — **this is a false positive**; the Tailwind
  v4 Vite plugin processes them correctly. Do not "fix" by removing them.
- No CSS modules, no styled-components, no CSS-in-JS. Inline `style={{}}` is
  used only for values that can't be expressed in Tailwind (perspective,
  maskImage, transform-style, dynamic pixel values from JS).
