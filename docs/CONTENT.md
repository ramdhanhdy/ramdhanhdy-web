# Content System

## Where content lives

```
src/content/
  ├── projects/    ← one .mdx file per case study
  └── writing/     ← one .mdx file per blog post
```

**No content is hardcoded in components.** If you find yourself writing a
project title or blog post body in a `.jsx` file, stop — it goes in an MDX
file. The only exceptions are the About page paragraphs (which are
intentionally inline in `About.jsx` because they are not MDX-managed
articles) and the Contact page (static contact info).

## How the loader works

**File:** `src/lib/content.js`

The loader uses Vite's `import.meta.glob` to discover MDX files at build time.
Two glob calls per collection:

```js
// Eager: frontmatter only, bundled into the main chunk
const projectMeta = import.meta.glob('../content/projects/*.mdx', {
  eager: true,
  import: 'frontmatter',
});

// Lazy: full MDX body, each file becomes its own chunk
const projectBodies = import.meta.glob('../content/projects/*.mdx');
```

The `remark-mdx-frontmatter` plugin (configured in `vite.config.js`) exposes
YAML frontmatter as a named `frontmatter` export from each compiled MDX
module. The eager glob imports only that export — tiny metadata objects that
ship with whatever chunk imports `content.js`.

The lazy glob returns a map of `path → () => import(mdx)`. Detail pages use
this to load the body **as its own chunk** only when that route is visited.

### Exports

| Export | Type | Description |
|---|---|---|
| `projects` | `Array` | Sorted, non-draft projects with `id`, `image` (from `cover`), and `load` (lazy importer) |
| `posts` | `Array` | Sorted, non-draft posts with `load` (lazy importer) |
| `getProject(slug)` | `Object\|undefined` | Lookup by slug |
| `getPost(slug)` | `Object\|undefined` | Lookup by slug |
| `getAdjacentProjects(slug)` | `{ prev, next }` | Circular prev/next for detail page navigation |

### Sorting

- Projects: by `order` field ascending (default 999 if missing).
- Posts: by `date` field descending (newest first).

### Drafts

Any entry with `draft: true` in frontmatter is filtered out. It will not
appear in index views, detail routes will render `<NotFound />`, and its lazy
chunk will not be in the build's module graph (unless imported elsewhere).

## Project frontmatter schema

```yaml
---
title: Lumen                    # required — display title
slug: lumen                     # required — URL: /work/lumen
category: AI Health Agent       # required — short category label
role: Research & Development    # required — your role
year: "2026"                    # required — string, quoted
order: 1                        # required — carousel/index position (ascending)
cover: /placeholder-lumen.jpg   # required — path in public/
summary: >-                     # required — one-sentence outcome
  An AI health agent that turns fragmented personal health data into
  actionable daily guidance.
stack: [Python, LangGraph]      # optional — array of strings
draft: false                    # optional — true hides it everywhere
---
```

### Field rules

- **`slug`** must be unique across all projects. It becomes the URL parameter
  (`/work/:slug`). Use kebab-case. The filename should match the slug.
- **`order`** is an integer. Lower = earlier in the carousel and index list.
  Gaps are fine (1, 2, 3, 5, 8) — they're just sort keys.
- **`cover`** is a path relative to `public/`. The loader maps it to `image`
  for compatibility with the Overview3D and IndexList components. Place the
  actual image file in `public/`.
- **`year`** must be a quoted string (`"2026"`, not `2026`). YAML parses
  unquoted numbers, which can cause type coercion issues.
- **`stack`** is optional but recommended. Rendered as a comma-separated list
  in the detail page meta row.

## Post frontmatter schema

```yaml
---
title: "Evaluating AI Agents Beyond the Demo"   # required — quoted if it contains special chars
slug: evaluating-ai-agents                       # required — URL: /blog/evaluating-ai-agents
date: "2025-11-20"                               # required — ISO date string, quoted
summary: >-                                      # required — one-line description
  Demos are easy. Knowing whether an agent actually works is the hard,
  unglamorous part.
draft: false                                     # optional — true hides it
---
```

### Field rules

- **`slug`** must be unique across all posts.
- **`date`** must be an ISO date string (`YYYY-MM-DD`). Used for sorting
  (newest first) and for the year display in the Blog list.
- Posts do **not** have `order`, `cover`, `category`, `role`, `year`, or
  `stack` fields — those are project-specific.

## MDX body rules

- **Use JSX comments, not HTML comments.** `{/* text */}` is valid in MDX;
  `<!-- text -->` is NOT and will cause a build error.
- Standard Markdown works: headings (`##`, `###`), lists, bold/italic, code
  blocks, blockquotes, horizontal rules.
- You can import and use React components inside MDX if needed (the React
  plugin processes MDX), but none of the current content does.
- The body renders inside `<div class="case-prose">` (see DESIGN-SYSTEM.md
  for the styled elements). Don't add inline styles or className hacks —
  extend `.case-prose` in `index.css` if you need new element styling.

## Cover images

Place cover images in `public/`. Reference them in frontmatter as
`/filename.jpg` (leading slash = `public/` root). The build copies `public/`
to `dist/` verbatim.

Current covers use `placeholder-*.jpg` files in `public/`. When real images
are available, replace the files or update the `cover` paths.

## Adding a new project (quick reference)

1. Create `src/content/projects/<slug>.mdx` with the frontmatter schema above.
2. Place the cover image in `public/` and reference it in `cover:`.
3. Run `npm run build` — the project automatically appears in the carousel,
   index list, and is reachable at `/work/<slug>`.
4. No code changes needed. The glob discovers it.

## Adding a new post (quick reference)

1. Create `src/content/writing/<slug>.mdx` with the post frontmatter schema.
2. Run `npm run build` — the post appears in the Blog list and is reachable
   at `/blog/<slug>`.
3. No code changes needed.

## Common mistakes

- **HTML comments in MDX** → build error. Use `{/* */}`.
- **Unquoted `year`** → YAML may parse it as a number; quote it.
- **Missing `slug`** → the entry has no URL; detail routes can't find it.
- **Duplicate `slug`** → `getProject`/`getPost` returns the first match; the
  second entry is unreachable.
- **`cover` path without leading slash** → image won't resolve. Use
  `/placeholder-foo.jpg`, not `placeholder-foo.jpg`.
- **Forgetting `draft: false`** → not a problem; the default is to show. But
  if you copy a draft file and forget to change `draft: true`, it won't
  appear.
