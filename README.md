# ramdhanhdy-web

Personal portfolio of Ramdhan Hidayat — data scientist, AI engineer, and
designer-developer. This repository is both a portfolio and a portfolio piece:
it packages work in analytics and AI while demonstrating a distinct approach
to web design, interaction, and frontend engineering.

The experience uses a dark-minimal visual system with one neon accent,
GSAP-driven page transitions, a 3D work carousel, and MDX-based case studies.

## Design thesis

The site's animations and visual language are part of the product, not a layer
added after the content. A few principles shape the experience:

- **Motion creates continuity.** Every internal route passes through the neon
  curtain so navigating the portfolio feels like one continuous composition.
- **Work can be explored in two modes.** The 3D carousel is spatial and
  expressive; the index view is fast, typographic, and information-dense.
- **Depth stays legible.** Perspective, card draw, callouts, scroll masks, and
  restrained color create hierarchy without adding visual noise.
- **Pages have their own rhythm.** About uses a scroll-linked character reveal,
  writing uses a softer editorial stagger, and case studies prioritize reading.
- **Responsive design includes interaction.** The carousel supports vertical
  touch gestures, navigation fits narrow screens, and every page owns its
  scroll rather than relying on the document body.

Together, these choices make the site a demonstration of art direction,
interaction design, responsive frontend work, and content architecture—not
only a container for project links.

## Stack

React 19 · Vite 8 · Tailwind CSS v4 · GSAP 3 · Framer Motion · React Router 7 · MDX

## Development

```bash
npm install
npm run dev      # dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint     # eslint
```

## Routes

```
/              Work (3D overview / index list toggle)
/work/:slug    Project case study
/about         About
/blog          Writing index
/blog/:slug    Post
/contact       Contact
```

## Adding content

Content lives in `src/content/` as MDX. Frontmatter is loaded eagerly for
index views; bodies are code-split and fetched only on their detail route.
No code changes are needed to add content.

### New project

Create `src/content/projects/<slug>.mdx`:

```yaml
---
title: Project Name
slug: project-name
category: Short Category
role: Your Role
year: "2026"
order: 1            # position in carousel/index (ascending)
cover: /images/project-name/cover.jpg
summary: One-sentence outcome.
stack: [Python, FastAPI]
draft: false        # true hides it everywhere
---
```

Then write the case study body in Markdown/JSX below the frontmatter.

### New post

Create `src/content/writing/<slug>.mdx`:

```yaml
---
title: "Post Title"
slug: post-slug
date: "2026-01-15"
summary: One-line description.
draft: false
---
```

## Structure

```
src/
  components/       shared components (Layout, TransitionLink, Meta)
    work/           Overview3D carousel, IndexList
  content/          MDX projects + writing (source of truth)
  lib/              content loader, curtain transition
  pages/            route components (all lazy-loaded)
```
