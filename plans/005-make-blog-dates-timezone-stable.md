# Plan 005: Render MDX calendar dates identically in every time zone

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report; do not improvise. When done, update this plan's status row in `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e7fdf8..HEAD -- src/pages/Blog.jsx src/pages/PostDetail.jsx src/lib/date.js tests/e2e/portfolio.spec.js docs/CONTENT.md`
> Stop if writing frontmatter no longer uses date-only `YYYY-MM-DD` values or if date rendering moved elsewhere.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/002-add-browser-smoke-verification.md`
- **Category**: bug
- **Planned at**: commit `4e7fdf8`, 2026-07-14

## Why this matters

Writing frontmatter stores publication dates as calendar dates without times. JavaScript parses `new Date('2026-01-15')` as midnight UTC, then `toLocaleDateString` converts it into the visitor's local zone; users west of UTC can therefore see January 14. Treat frontmatter dates as calendar values, not instants, and centralize the rule so list years and detail dates cannot drift.

## Current state

- Every `src/content/writing/*.mdx:4` date uses quoted `YYYY-MM-DD`, for example `src/content/writing/synthetic-control-in-practice.mdx:4` contains `date: "2026-01-15"`.
- `src/pages/PostDetail.jsx:12-17` formats `new Date(dateStr)` with `toLocaleDateString('en-US', ...)`.
- `src/pages/Blog.jsx:59` obtains the list year through `new Date(post.date).getFullYear()`.
- With `TZ=America/Los_Angeles`, the current formatter renders `2026-01-15` as `January 14, 2026`.
- `src/lib/` contains shared non-component utilities such as `content.js` and `curtain.js`; a small `date.js` utility matches repository organization.

Repository constraints:

- Keep frontmatter date syntax as quoted `YYYY-MM-DD`.
- Preserve the English long-date display (`January 15, 2026`) and existing typography.
- Do not introduce a date library.
- Use named exports from a camelCase `src/lib/` module and relative imports.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Confirm content contract | `rg -n '^date: "[0-9]{4}-[0-9]{2}-[0-9]{2}"$' src/content/writing` | one match per writing MDX file |
| Targeted browser test | `npm run test:e2e -- --grep "calendar date"` | timezone regression passes |
| Full verification | `npm run verify` | exit 0 |

## Scope

**In scope**:

- `src/lib/date.js` (create)
- `src/pages/Blog.jsx`
- `src/pages/PostDetail.jsx`
- `tests/e2e/portfolio.spec.js`
- `docs/CONTENT.md`
- `plans/README.md` (status only)

**Out of scope**:

- Editing publication dates or other MDX content.
- Changing post sort order in `src/lib/content.js` unless a failing regression proves sorting is timezone-dependent; that is a STOP condition for separate investigation.
- Adding a date/time dependency, localization controls, time-of-day, or user-selectable locales.
- Visual changes to Blog or PostDetail.

## Git workflow

- Branch: `codex/005-make-blog-dates-timezone-stable`
- Commit message example: `fix: preserve blog calendar dates across timezones`.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Add a calendar-date utility

Create `src/lib/date.js` with named exports:

- `formatCalendarDate(dateStr)` → returns the existing English long form.
- `getCalendarYear(dateStr)` → returns the four-digit numeric year used by Blog.

Validate the input against exact `YYYY-MM-DD`. Convert the components into a UTC date with `Date.UTC`, and pass `timeZone: 'UTC'` to `Intl.DateTimeFormat` so formatting cannot cross a date boundary. Validate that the UTC components round-trip; reject impossible dates rather than silently normalizing them. Throw a concise error that identifies the invalid field but does not include unrelated content.

**Verify**: `node -e "import('./src/lib/date.js').then(({formatCalendarDate,getCalendarYear}) => console.log(formatCalendarDate('2026-01-15'), getCalendarYear('2026-01-15')))"` → exactly `January 15, 2026 2026`.

### Step 2: Replace ad hoc parsing in both consumers

In `PostDetail.jsx`, remove the local `formatDate` function and import `formatCalendarDate` from `../lib/date`. In `Blog.jsx`, import and use `getCalendarYear`. Preserve import ordering and all existing JSX classes and motion variants.

**Verify**: `rg -n "new Date\(.*date|function formatDate" src/pages/Blog.jsx src/pages/PostDetail.jsx` → no matches.

### Step 3: Add a western-time-zone browser regression

Extend `tests/e2e/portfolio.spec.js` with a context configured as `timezoneId: 'America/Los_Angeles'`. Locate the post whose rendered link corresponds to the MDX entry dated `2026-01-15`, navigate through the real Blog link, and assert the detail page displays `January 15, 2026`. Also assert its Blog list year is `2026`.

Do not change the entire Playwright project's timezone; keep this case isolated.

**Verify**: `npm run test:e2e -- --grep "calendar date"` → pass in the Los Angeles context.

### Step 4: Document the date-only contract

Update `docs/CONTENT.md` near the writing frontmatter example to state that `date` is a calendar date, must remain quoted `YYYY-MM-DD`, and is rendered without visitor-time-zone conversion.

**Verify**: `npm run verify` → exit 0.

## Test plan

- Unit-like command checks valid formatting and year extraction.
- Playwright reproduces the original failing timezone and verifies both list and detail output.
- Add invalid-input cases only if the existing browser/tooling structure has a suitable non-UI test location; do not add another test framework solely for this utility.
- Manual check: open one post in Jakarta and confirm its visible date is unchanged from the intended frontmatter date.

## Done criteria

- [ ] No page directly constructs a `Date` from `post.date`.
- [ ] `formatCalendarDate('2026-01-15')` returns `January 15, 2026` regardless of process/browser timezone.
- [ ] `getCalendarYear('2026-01-15')` returns `2026`.
- [ ] The Los Angeles browser regression passes.
- [ ] `npm run verify` exits 0.
- [ ] No MDX files or visual classes are changed.
- [ ] No files outside Scope are modified.
- [ ] `plans/README.md` marks Plan 005 DONE.

## STOP conditions

Stop and report if:

- Any writing entry uses a value other than a date-only `YYYY-MM-DD` string.
- Product intent requires publication instants or visitor-local time rather than calendar dates.
- Correct sorting requires a change to `src/lib/content.js`; report the observed case separately.
- The fix requires a third-party date library.

## Maintenance notes

All future frontmatter calendar-date rendering should use `src/lib/date.js`. Reviewers should look for new `new Date(frontmatter.date)` calls. If time-of-day publishing is introduced later, create a distinct instant/timestamp field instead of changing the semantics of `date`.
