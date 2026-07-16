# Plan 006: Make curtain navigation re-entrant and route-readiness aware

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. This is the site's signature motion system; if anything in the "STOP conditions" section occurs, stop and report rather than improvising. When done, update this plan's status row in `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e7fdf8..HEAD -- src/lib/curtain.js src/components/Layout.jsx src/components/TransitionLink.jsx src/components/work/Overview3D.jsx src/components/work/IndexList.jsx src/pages/Blog.jsx src/pages/ProjectDetail.jsx src/pages/PostDetail.jsx tests/e2e/portfolio.spec.js docs/ANIMATIONS.md docs/ARCHITECTURE.md`
> Stop for any material drift in the curtain, lazy-route, or nested MDX Suspense implementation.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: HIGH
- **Depends on**: `plans/001-restore-clean-lint-gate.md`, `plans/002-add-browser-smoke-verification.md`
- **Category**: bug
- **Planned at**: commit `4e7fdf8`, 2026-07-14

## Why this matters

Every internal route depends on the neon curtain. Today each call kills the active tween and resets the curtain to `yPercent: 100`, so a second click can visibly snap an in-progress transition back below the viewport. The exit also begins after a fixed 0.1-second pause without knowing whether a lazy route or MDX chunk resolved, allowing blank content on slow connections. Replace the implicit timing with a small explicit state machine that keeps the latest navigation intent, never snaps transforms, and exits only when the expected route tree commits.

## Current state

- `src/lib/curtain.js:12-32` kills the curtain tween, uses `gsap.fromTo` from `yPercent: 100`, calls navigation at full cover, then exits after a fixed `delay: 0.1`.
- `src/components/Layout.jsx:83-85` wraps `<Outlet />` in `<Suspense fallback={null}>` but does not signal when the lazy route has committed.
- `src/pages/ProjectDetail.jsx:107-109` and `src/pages/PostDetail.jsx:73-75` catch MDX suspension inside the route with their own null fallbacks, so the outer route boundary cannot observe body readiness.
- Navigation callers are `TransitionLink.jsx:25`, `Overview3D.jsx:268`, `IndexList.jsx:91`, and `Blog.jsx:28`. Every caller knows its destination URL.
- `docs/ANIMATIONS.md:21-53` fixes the visual contract: enter from below, 0.6-second `power3.inOut`, navigate at full cover, exit upward, preserve real anchors/modifier clicks, keep `#global-curtain`, and never add pointer events.

Current fragile sequence:

```js
gsap.killTweensOf(curtain);
gsap.fromTo(curtain, { yPercent: 100 }, {
  yPercent: 0,
  onComplete: () => {
    onCovered();
    gsap.to(curtain, { yPercent: -100, delay: 0.1 });
  },
});
```

Target state model:

| State | New navigation request | Route-ready signal |
|---|---|---|
| `idle` | Store destination/callback; animate current curtain position to covered | ignore |
| `covering` | Replace pending destination/callback; do not restart or reset the tween | ignore |
| `waiting` (covered) | Navigate immediately to the newer destination, remain covered, invalidate the old expected URL | exit only when signal URL matches latest expected URL |
| `exiting` | Kill only the exit tween; animate from its current transform back to covered, then navigate | ignore until waiting |

Repository constraints:

- Never rename or remove `#global-curtain`.
- Never give the curtain pointer events or lower its z-index.
- Preserve 0.6-second `power3.inOut` motion in both directions.
- Internal navigation still uses `TransitionLink` or `curtainTransition`; do not introduce `<Link>` or bare navigation.
- Overview3D's rAF loop and `.tunnel-card` transforms are out of bounds.
- Route readiness must be matched to the latest normalized internal URL so a stale route commit cannot release a newer transition.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Find callers | `rg -n "curtainTransition\(" src` | only the shared helper definition and four approved caller sites |
| Targeted tests | `npm run test:e2e -- --grep "curtain"` | normal, rapid, and delayed-chunk cases pass |
| Full verification | `npm run verify` | exit 0 |
| Scope check | `git status --short` | only Scope files and `plans/README.md` |

## Scope

**In scope**:

- `src/lib/curtain.js`
- `src/components/Layout.jsx`
- `src/components/TransitionLink.jsx`
- `src/components/work/Overview3D.jsx` (destination argument only)
- `src/components/work/IndexList.jsx` (destination argument only)
- `src/pages/Blog.jsx` (destination argument only)
- `src/pages/ProjectDetail.jsx` (Suspense ownership only)
- `src/pages/PostDetail.jsx` (Suspense ownership only)
- `tests/e2e/portfolio.spec.js`
- `docs/ANIMATIONS.md`
- `docs/ARCHITECTURE.md`
- `plans/README.md` (status only)

**Out of scope**:

- Renaming, restyling, or moving `#global-curtain`.
- Changing curtain color, easing, 0.6-second duration, z-index, or pointer-event behavior.
- Changing route paths or replacing React Router.
- Tweening `.tunnel-card` elements, changing carousel math, or altering card interaction magnitudes.
- Adding a global loading library, state-management library, animation library, or error-reporting service.
- Solving lazy-chunk rejection/error-boundary behavior; this plan handles pending readiness, not failed downloads.

## Git workflow

- Branch: `codex/006-harden-curtain-route-readiness`
- Prefer two logical commits: `test: cover curtain reentry and route readiness`, then `fix: make curtain wait for route readiness`.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Add failing browser regressions before changing motion code

Extend `tests/e2e/portfolio.spec.js` with three curtain cases:

1. **Normal navigation contract**: instrument `history.pushState` before page code runs and record `#global-curtain.getBoundingClientRect()` at the route mutation. Click a real nav pill; assert the curtain covered the viewport when history changed, the destination rendered, and the curtain eventually parked above the viewport.
2. **Rapid latest-intent wins**: sample the curtain's bounding rect with `requestAnimationFrame`; after it begins moving into view, click a second header destination. Assert the URL settles on the second destination, no sample snaps back to the fully-below position after covering began, and one curtain remains parked above after completion.
3. **Delayed lazy chunk remains covered**: intercept a destination route chunk request (match the built asset by route chunk name pattern), hold the response, click its real nav link, and wait until the request is observed. Assert the curtain covers the viewport while the response is held. Release the response, then assert the destination renders and the curtain exits.

Use events, intercepted-request promises, URL changes, and polling. Do not use a fixed sleep as the assertion mechanism.

**Verify**: `npm run test:e2e -- --grep "curtain"` → the normal case passes; rapid and delayed cases fail for the documented reasons before implementation.

### Step 2: Implement an explicit module-level curtain state machine

Refactor `src/lib/curtain.js` while preserving GSAP and the public navigation pattern. The module must track:

- Current phase: `idle`, `covering`, `waiting`, or `exiting`.
- Latest pending callback and normalized expected internal URL.
- The active GSAP tween/timeline.
- A monotonically increasing request token so stale completion callbacks do nothing.

Change the API to accept both the covered callback and destination, for example `curtainTransition(() => navigate(to), to)`. Normalize destination pathname/search consistently with `useLocation`; hash fragments may be retained but must not prevent a pathname/search readiness match.

Behavior requirements:

- From idle, position the curtain at `100` only if no transform has been initialized, then tween to `0` with `gsap.to`, not a resetting `fromTo`.
- While covering, replace the pending intent without restarting the tween.
- At cover completion, invoke only the latest callback and enter waiting.
- While waiting, a newer request navigates while remaining covered and replaces the expected URL/token.
- While exiting, a newer request kills the exit tween and tweens from the current negative position back to `0`; it must never jump to `100`.
- Export a route-ready function that receives the committed pathname/search and exits only when it matches the latest expected URL and token.
- On exit completion, park at `-100`, clear callbacks/timers, and return to idle.

Add a bounded safety timeout only to avoid a permanently stuck curtain if readiness never arrives. It must not fire during the deliberately delayed regression duration, and its callback must leave the page in a usable state. Keep the timeout constant named and documented; clear it on success and on superseding requests.

**Verify**: `npm run lint` → exit 0; `rg -n "fromTo" src/lib/curtain.js` → no match.

### Step 3: Pass explicit destinations from every approved caller

Update exactly the four caller sites:

- `TransitionLink.jsx` passes `to`.
- `Overview3D.jsx` creates the project URL once inside `handleCardClick` and passes it both to `navigate` and the transition helper.
- `IndexList.jsx` does the same for its project row URL.
- `Blog.jsx` does the same for its post URL.

Preserve modifier-key guards, real anchor `href` values, swipe-click suppression, and all existing event behavior.

**Verify**: `rg -n "curtainTransition\(" src` → every call outside the helper has two arguments and still wraps `navigate`.

### Step 4: Signal readiness only after the lazy route tree commits

In `Layout.jsx`, add a small component inside the existing outer Suspense boundary that renders `<Outlet />`, reads `useLocation`, and calls the exported route-ready function from a layout effect after the suspended route tree commits. Pass normalized `pathname + search` to the helper. The initial render must be a no-op when no curtain transition is active.

Remove the nested `<Suspense fallback={null}>` wrappers and unused `Suspense` imports from ProjectDetail and PostDetail so MDX body suspension reaches the outer boundary. Preserve `useMemo(() => lazy(entry.load), [entry])`, all page markup, animations, scroll containers, and `key={slug}` behavior.

**Verify**: `rg -n "Suspense" src/pages/ProjectDetail.jsx src/pages/PostDetail.jsx` → no matches; `npm run build` → route and MDX chunks still build successfully.

### Step 5: Make all curtain regressions pass and update contracts

Run the targeted tests twice. Then update `docs/ANIMATIONS.md` and `docs/ARCHITECTURE.md` to describe the state machine, explicit destination matching, outer Suspense ownership, latest-intent behavior, and safety timeout. Remove statements that claim a fixed 0.1-second pause makes `fallback={null}` inherently safe.

**Verify**: `npm run test:e2e -- --grep "curtain"` twice → all three curtain cases pass both times; `npm run verify` → exit 0.

### Step 6: Perform the protected manual motion checklist

In a real browser, verify Work → About → Blog → detail routes, rapid alternating header clicks, slow-network throttling, project prev/next navigation, Index row navigation, Overview click/tap, and mobile swipe. Confirm the neon panel always enters from below, covers route changes, exits upward, never flashes/reset-snaps, and never remains stuck.

**Verify**: Record each checked route/viewport in the PR or handoff notes; `git status --short` lists only Scope files and `plans/README.md`.

## Test plan

- Add normal, rapid re-entry, and delayed-route-chunk cases to `tests/e2e/portfolio.spec.js` before implementation.
- Existing Plan 002 tests cover route endpoints, MDX rendering, wheel/touch behavior, and 404s.
- Run curtain tests twice to expose stale completion callbacks and listener/timer leakage.
- Manual checks remain mandatory because transform continuity and visual polish are product requirements.

## Done criteria

- [ ] The curtain never resets to `yPercent: 100` after an active transition begins.
- [ ] Rapid clicks deterministically navigate to the latest requested internal destination.
- [ ] Stale route-ready signals cannot release a newer transition.
- [ ] A delayed route or MDX chunk remains covered until its tree commits.
- [ ] Normal curtain timing remains 0.6 seconds in and 0.6 seconds out with `power3.inOut`.
- [ ] `#global-curtain`, z-index, color, and pointer-event classes are unchanged.
- [ ] All internal callers still navigate through the curtain with modifier behavior preserved.
- [ ] Targeted curtain tests pass twice and `npm run verify` exits 0.
- [ ] The protected manual checklist passes on desktop and 390px touch viewport.
- [ ] No files outside Scope are modified.
- [ ] `plans/README.md` marks Plan 006 DONE.

## STOP conditions

Stop and report if:

- Plan 002 is not complete or its baseline browser suite is unstable.
- React commits the readiness wrapper before a suspended Outlet/MDX descendant resolves, invalidating the readiness design.
- Correct URL correlation requires bypassing `TransitionLink`, changing route paths, or using document navigation.
- The fix requires tweening `.tunnel-card`, changing curtain visual timing, or adding pointer events to the curtain.
- A lazy import rejection is discovered; capture it as a separate error-boundary finding rather than broadening this plan.
- Targeted or full verification fails twice after a reasonable fix attempt.

## Maintenance notes

Treat `curtain.js` as a state machine, not a collection of independent tweens. New programmatic navigation callers must pass their explicit internal destination and must be added to the caller grep/test. Reviewers should scrutinize stale GSAP callbacks, timer cleanup, URL normalization, and whether route readiness truly occurs after suspension resolves.
