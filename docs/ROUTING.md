# Routing

## Route tree

```
/                    → Work (Overview3D carousel or IndexList, toggled by ?view=)
  /work/:slug        → ProjectDetail (case study)
  /about             → About
  /blog              → Blog (post list)
  /blog/:slug        → PostDetail
  /contact           → Contact
  *                  → NotFound (also rendered inline by detail pages for unknown slugs)
```

All routes are nested under a single `Layout` element which provides the
header, the `<Suspense>` boundary, and `#global-curtain`.

## File map

| Route | Component file | Lazy import in |
|---|---|---|
| `/` | `src/pages/Work.jsx` | `App.jsx` |
| `/work/:slug` | `src/pages/ProjectDetail.jsx` | `App.jsx` |
| `/about` | `src/pages/About.jsx` | `App.jsx` |
| `/blog` | `src/pages/Blog.jsx` | `App.jsx` |
| `/blog/:slug` | `src/pages/PostDetail.jsx` | `App.jsx` |
| `/contact` | `src/pages/Contact.jsx` | `App.jsx` |
| `*` | `src/pages/NotFound.jsx` | `App.jsx` |

## Lazy loading

Every page is `React.lazy(() => import(...))` in `src/App.jsx`. This is a
hard rule — do not convert any page to a static import. The curtain
transition's covered window (§1 of ANIMATIONS.md) is what makes lazy loading
invisible: the chunk fetches while the screen is covered by the neon panel.

`<Suspense fallback={null}>` wraps `<Outlet />` in `Layout.jsx`. The fallback
is `null` (not a spinner) because the curtain covers the viewport during the
swap — a spinner would flash behind the curtain and look broken.

## The `?view=` query parameter

The Work page (`/`) reads `useSearchParams()` to toggle between two
sub-views:

- `/?view=index` → renders `IndexList` (text rows + cursor preview)
- `/` (or any other value) → renders `Overview3D` (3D carousel)

The toggle is in the bottom-right corner of the Work page. The "Work" nav
pill in the header links to `/?view=index`. The home button (star logo) also
links to `/?view=index`.

**Do not change this to a route-based split** (`/work` vs `/` or similar).
The `?view=` approach keeps both views under the same route, so the curtain
transition doesn't fire when toggling between them — the toggle is instant,
which is the intended UX.

## Navigation methods (all go through the curtain)

### `<TransitionLink to="/path">`

Use for any anchor-style navigation: nav pills, "back to blog" links,
prev/next navigation in detail pages. It renders a real `<a href>`, so
middle-click, ctrl-click, and "open in new tab" all work. For plain
left-clicks, it prevents default and runs `curtainTransition(() =>
navigate(to))`.

### `curtainTransition(() => navigate(to))`

Use for non-anchor elements that need to navigate: 3D cards (`onClick`),
index rows (`onClick`), blog post titles (`onClick`). Import from
`src/lib/curtain.js`. Always include the modifier-key guard if the element
is an `<a>` (so new-tab clicks pass through):

```js
if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
e.preventDefault();
curtainTransition(() => navigate(`/work/${slug}`));
```

### What NEVER to use

- `import { Link } from 'react-router-dom'` — no curtain, instant jump-cut.
- `navigate('/path')` without wrapping in `curtainTransition` — same.
- `window.location.href = '...'` — full page reload, breaks the SPA.
- `<a href="/path">` without an onClick handler that calls
  `e.preventDefault()` + `curtainTransition` — full page reload.

## Adding a new route

1. Create the page component in `src/pages/NewPage.jsx`.
2. Add `const NewPage = lazy(() => import('./pages/NewPage'))` in `App.jsx`.
3. Add `<Route path="new-page" element={<NewPage />} />` inside the
   `<Layout>` route.
4. Add a nav link in `Layout.jsx` using `<TransitionLink to="/new-page">`
   with the same active/inactive className pattern as the existing pills.
5. Add `<Meta title="New Page" description="..." />` in the page component.
6. Run `npm run build` to verify.

See docs/PLAYBOOKS.md for a detailed walkthrough.

## URL structure dependencies

- `getProject(slug)` and `getPost(slug)` in `content.js` look up entries by
  the `:slug` URL parameter. If you change the route path (e.g.
  `/work/:slug` → `/projects/:slug`), update the `useParams()` destructuring
  in the detail page and the navigation calls in `Overview3D`, `IndexList`,
  and `Blog`.
- The `?view=index` query parameter is read in `Work.jsx` and linked from
  `Layout.jsx` and `HeaderHomeButton.jsx`. Changing the parameter name
  requires updating all three.
