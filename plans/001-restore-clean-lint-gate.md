# Plan 001: Restore a clean, trustworthy lint gate

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report; do not improvise. When done, update this plan's status row in `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e7fdf8..HEAD -- package.json package-lock.json eslint.config.js src/pages/Blog.jsx src/pages/ProjectDetail.jsx src/pages/PostDetail.jsx docs/ANIMATIONS.md docs/CONVENTIONS.md`
> If an in-scope or evidence file changed, compare the current code with the excerpts below. Treat a material mismatch as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `4e7fdf8`, 2026-07-14

## Why this matters

`npm run lint` currently exits with three errors, so it cannot distinguish a new regression from known configuration noise. One error is caused by ESLint not recognizing the lowercase `motion` JSX namespace; two are caused by a documented, intentionally memoized `lazy()` pattern. Restore a zero-error baseline without weakening unrelated React hook checks.

## Current state

- `package.json:8` defines `lint` as `eslint .`.
- `eslint.config.js:8-16` enables the recommended core, React Hooks, and React Refresh configurations but does not load `eslint-plugin-react`'s JSX variable-use rule.
- `src/pages/Blog.jsx:1,44` imports `motion` and uses `<motion.ul>`, but core `no-unused-vars` reports the import as unused.
- `src/pages/ProjectDetail.jsx:20-23` and `src/pages/PostDetail.jsx:26` create an MDX lazy component with `useMemo(() => lazy(entry.load), [entry])`.
- `docs/ANIMATIONS.md:302-304` and `docs/CONVENTIONS.md:147` explicitly require that memoized lazy pattern because recreating it on every render remounts the MDX body.

Current approved detail pattern:

```jsx
const Body = useMemo(() => (post ? lazy(post.load) : null), [post]);
```

Repository constraints:

- Preserve the memoized MDX lazy-loading behavior.
- Do not disable `react-hooks/static-components` globally.
- Dependencies used only for linting belong in `devDependencies`.
- Match the semicolon-free style of `eslint.config.js`; do not reformat unrelated files.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install/update lockfile | `npm install` | exit 0 |
| Lint | `npm run lint` | exit 0, no errors |
| Build | `npm run build` | exit 0 and Vite reports a successful build |
| Scope check | `git status --short` | only the files listed in Scope plus `plans/README.md` |

## Scope

**In scope**:

- `package.json`
- `package-lock.json`
- `eslint.config.js`
- `plans/README.md` (status only)

**Out of scope**:

- `src/pages/Blog.jsx` — the lowercase `motion` API is the library's intended API; do not rename it to evade lint.
- `src/pages/ProjectDetail.jsx` and `src/pages/PostDetail.jsx` — preserve the documented memoized lazy-component pattern.
- Any global disabling of React Hooks rules.
- Source formatting or unrelated dependency upgrades.

## Git workflow

- Branch: `codex/001-restore-clean-lint-gate`
- Use one focused commit with the repository's conventional style, for example: `chore: restore clean lint baseline`.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Add JSX variable-use support

Install `eslint-plugin-react` as a development dependency. In `eslint.config.js`, register only the plugin capability needed for JSX identifier tracking and enable `react/jsx-uses-vars`. Do not enable the plugin's full recommended preset, because that would introduce unrelated policy changes such as prop-type enforcement.

**Verify**: `npm run lint` → the `src/pages/Blog.jsx:1` unused-variable error is absent; only the two documented static-component errors may remain at this intermediate point.

### Step 2: Narrowly exempt the approved MDX lazy pattern

Add a file-specific flat-config entry for exactly `src/pages/ProjectDetail.jsx` and `src/pages/PostDetail.jsx` that disables `react-hooks/static-components`. Add a short configuration comment explaining that these files intentionally memoize `lazy(entry.load)` by content entry, as required by `docs/ANIMATIONS.md`, so future maintainers do not broaden the exception.

**Verify**: `npm run lint` → exit 0 with no errors or warnings.

### Step 3: Confirm the exception did not weaken the project globally

Review `eslint.config.js` and confirm the static-components rule is disabled only in the two detail-page files. Do not edit source files merely to satisfy lint.

**Verify**: `npm run build` → exit 0; MDX chunks for project and writing content appear in the Vite output.

## Test plan

- No new runtime tests are required because this is a lint configuration correction.
- The regression test is the lint command itself: JSX namespace imports must count as used, and the approved exception must remain limited to two files.
- Run `npm run build` to ensure configuration dependency changes did not disturb the build toolchain.

## Done criteria

- [ ] `eslint-plugin-react` is present only in `devDependencies` and the lockfile is updated.
- [ ] `npm run lint` exits 0 with no errors or warnings.
- [ ] `react-hooks/static-components` remains enabled everywhere except the two MDX detail pages.
- [ ] `src/pages/Blog.jsx`, `ProjectDetail.jsx`, and `PostDetail.jsx` are unchanged.
- [ ] `npm run build` exits 0.
- [ ] No files outside Scope are modified.
- [ ] `plans/README.md` marks Plan 001 DONE.

## STOP conditions

Stop and report if:

- The detail pages no longer use the memoized `lazy(entry.load)` pattern.
- Enabling `react/jsx-uses-vars` requires the full React recommended preset or produces unrelated new rules.
- A clean lint run appears to require disabling `no-unused-vars` or React Hooks checks globally.
- A verification command fails twice after a reasonable correction.

## Maintenance notes

Keep the two-file hook-rule exception narrow. If MDX lazy-component creation is later moved to module initialization, remove the exception and re-enable the rule for those files. Reviewers should reject renaming `motion` or suppressing all unused-variable checks as shortcuts.
