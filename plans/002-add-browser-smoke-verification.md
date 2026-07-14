# Plan 002: Add automated browser smoke verification for critical interactions

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report; do not improvise. When done, update this plan's status row in `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e7fdf8..HEAD -- package.json package-lock.json playwright.config.js tests/e2e/portfolio.spec.js AGENTS.md src/App.jsx src/components/Layout.jsx src/components/TransitionLink.jsx src/components/work/Overview3D.jsx src/components/work/IndexList.jsx src/pages/Blog.jsx src/pages/ProjectDetail.jsx src/pages/PostDetail.jsx`
> Plan 001 is expected to change package and lint configuration. Compare rather than stopping for those expected changes. Stop for material changes to route structure or interaction contracts.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/001-restore-clean-lint-gate.md`
- **Category**: tests
- **Planned at**: commit `4e7fdf8`, 2026-07-14

## Why this matters

The portfolio's product value is concentrated in browser-only behavior: curtain-mediated navigation, lazy MDX routes, an infinite wheel/touch carousel, hover previews, scroll masks, and mobile layout. The build compiler cannot prove any of those interactions still work. Add a small Chromium smoke suite that asserts stable end states and structural contracts while leaving subjective motion polish in the manual checklist.

## Current state

- `package.json:6-10` exposes dev, build, lint, and preview commands; there is no test or combined verification command.
- `AGENTS.md:54-79` lists the required browser regression checklist.
- `AGENTS.md:83` states that no test suite exists.
- `src/components/TransitionLink.jsx:23-25` prevents native navigation and routes only when `curtainTransition` reaches its covered callback.
- `src/components/work/Overview3D.jsx:159-216` owns wheel, touch, and rAF behavior with manual listeners and cleanup.
- `src/components/work/IndexList.jsx:114-156` uses real anchors and a cursor-following preview.
- `src/App.jsx:8-14` lazy-loads every route.

Repository constraints:

- The site is animation-heavy. Tests must wait for observable state, never sleep for an exact GSAP duration.
- Every internal click exercised by tests must use the real curtain path; do not navigate directly merely to make a test pass.
- Test tooling must be development-only. Do not add a runtime UI, CSS, or animation dependency.
- Keep manual visual checks for animation quality and 320–390px layout; automation supplements rather than replaces them.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install dependencies | `npm install` | exit 0 |
| Install browser | `npx playwright install chromium` | exit 0 |
| Browser tests | `npm run test:e2e` | all smoke tests pass |
| Full verification | `npm run verify` | lint, build, and browser tests all exit 0 |

## Scope

**In scope**:

- `package.json`
- `package-lock.json`
- `playwright.config.js` (create)
- `tests/e2e/portfolio.spec.js` (create)
- `AGENTS.md` (commands/verification wording only)
- `plans/README.md` (status only)

**Out of scope**:

- Production source files under `src/`.
- Pixel-perfect screenshot baselines; they are too brittle for this motion-heavy first suite.
- Cross-browser coverage beyond Chromium in this plan.
- Fixing failures discovered in production code; stop and report them so they receive a separate plan.
- Replacing the manual visual checklist.

## Git workflow

- Branch: `codex/002-add-browser-smoke-verification`
- Commit message example: `test: add portfolio browser smoke coverage`.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Add Playwright as development-only tooling

Add `@playwright/test` to `devDependencies`. Add scripts:

```json
"test:e2e": "playwright test",
"verify": "npm run lint && npm run build && npm run test:e2e"
```

Do not alter existing script meanings.

**Verify**: `npm install` and `npx playwright install chromium` → both exit 0; `npm ls @playwright/test` shows one installed version.

### Step 2: Configure a deterministic local test server

Create `playwright.config.js` with:

- `testDir: './tests/e2e'`.
- Chromium only.
- Base URL `http://127.0.0.1:4173`.
- A `webServer` that runs `npm run build && npm run preview -- --host 127.0.0.1 --port 4173`, reusing an existing server only outside CI.
- Trace retention on first retry and screenshots only on failure.
- Desktop viewport near 1440×900 by default; individual mobile tests may override it.
- Conservative assertions such as `expect.poll`, URL checks, visibility, and transform changes. Do not use fixed sleeps as pass criteria.

**Verify**: `npx playwright test --list` → lists the new project and exits 0 without starting an interactive browser.

### Step 3: Add stable smoke cases

Create `tests/e2e/portfolio.spec.js` with independent tests for:

1. `/` renders `#global-curtain`, Overview/Index controls, and at least one `.tunnel-card`.
2. Clicking the About header pill reaches `/about` through the normal link handler and renders the About page; clicking Work returns to `/?view=index`.
3. `/?view=index` renders project anchors; hovering a row makes the fixed preview visible; clicking a row reaches its `/work/:slug` detail and MDX body content becomes visible.
4. `/blog` renders post anchors; clicking one reaches `/blog/:slug` and displays body content.
5. Unknown `/work/...` and `/blog/...` slugs render the shared 404 page.
6. A wheel event on Overview changes at least one card's computed transform and does not scroll `document.scrollingElement`.
7. A 390px-wide touch-enabled context renders the compact header and carousel without horizontal overflow.

Derive the first project/post URLs from rendered anchor `href` values instead of hardcoding content slugs. When asserting MDX completion, use a visible body paragraph or heading, not exact full article copy.

**Verify**: `npm run test:e2e` → all seven smoke cases pass twice consecutively.

### Step 4: Document the combined verification command

Update only the commands and verification paragraphs in `AGENTS.md` to add `npm run test:e2e` and `npm run verify`. Preserve the full manual do-not-break checklist and state explicitly that browser smoke tests do not replace visual review.

**Verify**: `npm run verify` → lint, build, and all browser smoke cases pass.

## Test plan

- The new file `tests/e2e/portfolio.spec.js` is the test plan.
- Each test must start from its own `page.goto` so ordering cannot hide state leaks.
- Run the suite twice to expose listener cleanup, persistent body classes, or timing dependence.
- Native vertical-swipe and stationary-tap behavior remain mandatory manual browser checks. Playwright's Chromium touch injection did not reach this carousel's `touchmove` listener, and Playwright could not hit-test an interactive 3D card center in the planning environment, so do not claim automated touch-gesture coverage.
- Keep known unfixed findings out of baseline assertions: rapid curtain re-entry, contact destinations, date timezone behavior, and slow-chunk readiness are covered by their later plans.

## Done criteria

- [ ] Playwright is a development dependency only.
- [ ] `npm run test:e2e` passes seven independent smoke cases twice.
- [ ] `npm run verify` exits 0.
- [ ] Tests use no fixed-duration sleep as a success condition.
- [ ] No production files under `src/` are modified.
- [ ] `AGENTS.md` retains the manual visual checklist.
- [ ] No files outside Scope are modified.
- [ ] `plans/README.md` marks Plan 002 DONE.

## STOP conditions

Stop and report if:

- Plan 001 is not complete and `npm run lint` still fails.
- A critical smoke case fails against the unchanged production code twice; record the exact route and observable failure instead of weakening the test.
- The mobile layout case cannot render the compact header or carousel without horizontal overflow in the installed Playwright version.
- Test stability appears to require exact GSAP timing or screenshot tolerances.
- Adding Playwright requires changing Vite, React, GSAP, or production code.

## Maintenance notes

Every future change to navigation, route loading, or Overview3D should extend this suite with a regression assertion that targets an end state. Reviewers should reject arbitrary sleeps and tests that bypass `TransitionLink`. Cross-browser, visual-diff, and automated native-touch coverage are deliberately deferred until the Chromium suite proves stable; the manual mobile swipe/tap checklist remains required.

## Execution note (2026-07-14)

The first isolated execution discovered two test-harness constraints before it made a commit:

- The first index project currently renders a text preview, so preview coverage must select the fixed preview container itself instead of filtering it for an image.
- Chromium CDP `Input.dispatchTouchEvent` did not alter a carousel card transform despite a touch-enabled context. The code's real `touchmove` contract remains subject to the documented manual mobile check; this plan does not treat a synthetic CDP gesture as equivalent coverage.
- `page.touchscreen.tap` also could not navigate: after filtering to `elementFromPoint`-hit-tested card centers, no interactive `.tunnel-card` center was available. The 3D stack must therefore receive real-device/manual touch verification until a browser runner can reliably target it.

The revised automated mobile case verifies compact layout and no horizontal overflow. It does not assert vertical swipe movement or stationary touch navigation.
