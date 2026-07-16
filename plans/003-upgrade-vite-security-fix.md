# Plan 003: Upgrade Vite beyond the affected Windows dev-server release

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report; do not improvise. When done, update this plan's status row in `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e7fdf8..HEAD -- package.json package-lock.json vite.config.js`
> Plans 001 and 002 are expected to change package files. Compare the installed Vite version and scripts with Current state; stop only if the Vite major or plugin architecture changed.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/001-restore-clean-lint-gate.md`, `plans/002-add-browser-smoke-verification.md`
- **Category**: security
- **Planned at**: commit `4e7fdf8`, 2026-07-14

## Why this matters

The lockfile resolves Vite 8.0.8, and `npm audit` reports that release in the affected range for a high-severity Windows development-server file-deny bypass. This does not affect the static production bundle or the app's client-only React Router usage, but it can expose unintended local files when requests can reach the development server. Upgrade within Vite 8 and verify the MDX → Tailwind → React plugin pipeline.

## Current state

- `package.json:7` maps `npm run dev` directly to `vite`.
- `package.json:37` declares `vite` as `^8.0.4`.
- `package-lock.json:5096-5099` resolves `vite` 8.0.8.
- `vite.config.js:9-19` depends on plugin order: MDX with `enforce: 'pre'`, then Tailwind, then React.
- The audit run on 2026-07-14 reported affected Vite versions through 8.0.15; the selected version must be at least 8.0.16 or a newer compatible 8.x release that `npm audit` no longer flags for the Windows `server.fs.deny` advisory.

Repository constraints:

- Stay on Vite major 8 in this plan.
- Preserve the exact plugin order and MDX `include` behavior.
- Do not run `npm audit fix --force`.
- Do not report or "fix" React Router framework/server-mode advisories; this repository uses client-only `BrowserRouter` and no React Router server endpoints.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Inspect candidates | `npm view vite@8 version` | lists available Vite 8 releases |
| Upgrade | `npm install -D vite@^8.0.16` | exit 0 and lockfile resolves a compatible patched 8.x release |
| Security check | `npm audit --omit=dev --audit-level=high` | the Vite Windows dev-server advisories are absent; unrelated advisories may remain only if documented |
| Full verification | `npm run verify` | exit 0 |

## Scope

**In scope**:

- `package.json`
- `package-lock.json`
- `plans/README.md` (status only)

**Out of scope**:

- `vite.config.js` — inspect it, but do not change it unless the patch release proves incompatible; incompatibility is a STOP condition.
- React Router, PostCSS, React, Tailwind, MDX, and animation dependency upgrades.
- Development-server exposure policy, deployment, or network configuration beyond a maintenance note.
- `npm audit fix --force`.

## Git workflow

- Branch: `codex/003-upgrade-vite-security-fix`
- Commit message example: `chore: update vite past dev-server advisories`.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Confirm the advisory and patched Vite 8 target

Run the audit and inspect available Vite 8 releases. Select the newest compatible Vite 8 release, with a minimum of 8.0.16. Record the selected version in the commit message or PR notes, not in source comments.

**Verify**: `npm audit --json` → confirms whether the currently locked version is still affected before the upgrade.

### Step 2: Upgrade only Vite

Update the Vite devDependency and lockfile. Do not allow npm to intentionally upgrade unrelated direct dependencies; review `git diff -- package.json package-lock.json` for scope.

**Verify**: `npm ls vite` → exactly one Vite 8 version is installed and it is at least 8.0.16.

### Step 3: Re-run security and application verification

Run the audit, lint, production build, and browser smoke suite. Confirm build output still creates separate route and MDX chunks.

**Verify**: `npm run verify` → exit 0; `npm audit --omit=dev --audit-level=high` no longer names Vite's Windows `server.fs.deny` or launch-editor advisories.

## Test plan

- Use the Plan 002 browser suite as regression coverage for route loading, MDX compilation, and animation entry points.
- `npm run build` must still show separate Blog, About, Work, detail, and MDX chunks.
- A brief manual `npm run dev` launch on Windows must bind only to the configured/default trusted interface; do not expose it with `--host 0.0.0.0` for this check.

## Done criteria

- [ ] `package-lock.json` resolves exactly one patched Vite 8 release, at least 8.0.16.
- [ ] The Vite high-severity Windows advisories are absent from the audit output.
- [ ] No unrelated direct dependency is upgraded intentionally.
- [ ] `vite.config.js` is unchanged.
- [ ] `npm run verify` exits 0.
- [ ] No files outside Scope are modified.
- [ ] `plans/README.md` marks Plan 003 DONE.

## STOP conditions

Stop and report if:

- No Vite 8 release outside the affected range is available.
- The upgrade requires a Vite major-version migration.
- MDX, Tailwind, or React plugin compatibility requires editing `vite.config.js`.
- The audit still reports the named Vite advisories after the lockfile resolves at least 8.0.16.
- Full verification fails twice.

## Maintenance notes

Keep development servers bound to trusted interfaces even after patching. Reviewers should focus on lockfile scope and the MDX/Tailwind/React build pipeline. The moderate PostCSS advisory and server-mode React Router advisories were deliberately excluded from this focused plan because reachability was not established for this static SPA.

## Execution note (2026-07-14)

Isolated execution verified that both Vite 8.1.4 and the minimum patched Vite 8.0.16 remove the Vite Windows development-server advisories. Both versions also emit `INEFFECTIVE_DYNAMIC_IMPORT` warnings for every project and writing MDX file, collapsing the established individual MDX chunks into one `src-*.js` bundle. The baseline Vite 8.0.8 build emitted separate MDX chunks.

This plan is blocked: changing Vite configuration or adapting the content-loader import strategy is outside its dependency-only scope and risks the portfolio's documented lazy-content architecture. Create a separate investigation plan before attempting another Vite upgrade; it must prove that a patched version preserves one lazy chunk per MDX entry before it changes the production dependency.
