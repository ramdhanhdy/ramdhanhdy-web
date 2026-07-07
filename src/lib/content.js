// Content pipeline: MDX files in src/content/ are the single source of truth.
// - Frontmatter is eagerly imported (tiny, ships with the main bundle) so
//   index views (Work, Blog) render without loading any post/case-study body.
// - Bodies are lazily imported: each MDX file becomes its own chunk, fetched
//   only when its detail route is visited.
//
// Adding content = drop a new .mdx file into src/content/projects or
// src/content/writing. No code changes required.

const projectMeta = import.meta.glob('../content/projects/*.mdx', {
  eager: true,
  import: 'frontmatter',
});
const projectBodies = import.meta.glob('../content/projects/*.mdx');

const postMeta = import.meta.glob('../content/writing/*.mdx', {
  eager: true,
  import: 'frontmatter',
});
const postBodies = import.meta.glob('../content/writing/*.mdx');

function collect(metaGlob, bodyGlob) {
  return Object.entries(metaGlob).map(([path, frontmatter]) => ({
    ...frontmatter,
    // Lazy importer for the MDX body component (used by detail pages)
    load: bodyGlob[path],
  }));
}

export const projects = collect(projectMeta, projectBodies)
  .filter((p) => !p.draft)
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  .map((p, i) => ({ ...p, id: i + 1, image: p.cover }));

export const posts = collect(postMeta, postBodies)
  .filter((p) => !p.draft)
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export const getProject = (slug) => projects.find((p) => p.slug === slug);
export const getPost = (slug) => posts.find((p) => p.slug === slug);

export function getAdjacentProjects(slug) {
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: projects[(idx - 1 + projects.length) % projects.length],
    next: projects[(idx + 1) % projects.length],
  };
}
