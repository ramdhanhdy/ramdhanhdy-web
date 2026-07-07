# ramdhanhdy-web

Personal portfolio of Ramdhan Hidayat — data analyst & AI engineer.
Dark-minimal design with a neon accent, GSAP-driven page transitions, a 3D
work carousel, and MDX-based content.

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
