# Plan 004: Replace placeholder contact destinations with verified real links

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report; do not improvise. When done, update this plan's status row in `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 4e7fdf8..HEAD -- src/pages/Contact.jsx tests/e2e/portfolio.spec.js docs/PLAYBOOKS.md`
> Stop if the Contact page structure or its documented content workflow changed materially.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/002-add-browser-smoke-verification.md`; verified contact destinations from the portfolio owner
- **Category**: bug
- **Planned at**: commit `4e7fdf8`, 2026-07-14

## Why this matters

The portfolio's conversion page currently sends email to an example-domain mailbox and renders three social links that only point to the current page. A visitor who decides to make contact cannot reach the owner. Replace placeholders with owner-confirmed destinations and remove any social entry for which no real destination is provided.

## Current state

- `src/pages/Contact.jsx:23-25` renders `mailto:hello@example.com` and displays the same placeholder address.
- `src/pages/Contact.jsx:30-32` renders Twitter, LinkedIn, and GitHub with `href="#"`.
- `docs/PLAYBOOKS.md:355-356` identifies updating Contact email and social links as unfinished portfolio content work.
- `src/pages/Contact.jsx:5-38` already follows the page frame, inner-scroll, mask, neon hover, and responsive typography conventions. Preserve that JSX/CSS structure.

Current broken excerpt:

```jsx
<a href="mailto:hello@example.com">hello@example.com</a>
<a href="#">Twitter</a>
<a href="#">LinkedIn</a>
<a href="#">GitHub</a>
```

Required input before implementation:

- The exact public email address to display and use in `mailto:`.
- The exact HTTPS profile URL for each social label the owner wants displayed.
- Confirmation of whether each external profile should open in a new tab. Recommended default: same tab unless the owner explicitly prefers a new tab.

Never infer usernames from repository or Git metadata, and never substitute a credential/private address discovered elsewhere.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Find placeholders | `rg -n 'hello@example.com|href="#"' src/pages/Contact.jsx` | no matches after the edit |
| Browser tests | `npm run test:e2e` | contact regression and existing smoke tests pass |
| Full verification | `npm run verify` | exit 0 |

## Scope

**In scope**:

- `src/pages/Contact.jsx`
- `tests/e2e/portfolio.spec.js`
- `plans/README.md` (status only)

**Out of scope**:

- Adding a contact form, backend, analytics, CAPTCHA, or third-party form service.
- Changing Contact page layout, animation, typography, colors, scroll mask, or responsive behavior.
- Editing About, header navigation, project content, or blog content.
- Inventing or scraping contact information.

## Git workflow

- Branch: `codex/004-replace-contact-placeholders`
- Commit message example: `fix: replace placeholder contact links`.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Obtain and validate owner-approved destinations

Ask the operator for the required input listed above. Validate that the email has a plausible address structure and that every social destination is an absolute `https://` URL for the intended service. If a platform has no provided URL, plan to omit its link rather than retaining `#`.

**Verify**: Record a checklist of the approved labels and destination types without exposing anything beyond the public contact details the owner explicitly supplied.

### Step 2: Replace placeholders without changing the visual system

Edit only the link data/markup needed in `Contact.jsx`. Keep the current class names and layout. For external links that the owner asks to open in a new tab, add both `target="_blank"` and `rel="noopener noreferrer"`. Do not route external links through `TransitionLink`; the curtain is for internal routes only.

**Verify**: `rg -n 'hello@example.com|href="#"' src/pages/Contact.jsx` → no matches.

### Step 3: Add a contact regression check

Extend `tests/e2e/portfolio.spec.js` with one Contact test that:

- Visits `/contact`.
- Asserts the email link has a `mailto:` destination and does not contain `example.com`.
- Asserts every rendered social link has an absolute `https://` destination and no link has `href="#"`.
- If new-tab behavior was requested, asserts `target` and `rel` are correct.

Do not hardcode private data in test output. Matching the explicitly public link attributes is acceptable.

**Verify**: `npm run test:e2e -- --grep "contact"` → the Contact test passes.

### Step 4: Run the full visual-adjacent verification

Run the full suite, then manually view `/contact` at 320px, 390px, desktop width, and a short landscape viewport. Confirm links wrap without horizontal overflow and the inner container remains scrollable.

**Verify**: `npm run verify` → exit 0; `git status --short` lists only Scope files and `plans/README.md`.

## Test plan

- Automated Contact assertions live in `tests/e2e/portfolio.spec.js` beside the route smoke tests from Plan 002.
- Cover the real email scheme, absence of example/hash placeholders, HTTPS social destinations, and optional external-link security attributes.
- Manual verification covers link wrapping and scroll behavior at the documented mobile widths.

## Done criteria

- [ ] The owner explicitly supplied or confirmed every rendered destination.
- [ ] No `hello@example.com` or `href="#"` remains in `Contact.jsx`.
- [ ] Every external new-tab link includes `rel="noopener noreferrer"`.
- [ ] The Contact browser test passes.
- [ ] `npm run verify` exits 0.
- [ ] Contact layout and class names are unchanged except where link semantics require markup changes.
- [ ] No files outside Scope are modified.
- [ ] `plans/README.md` marks Plan 004 DONE.

## STOP conditions

Stop and report if:

- The owner has not supplied the exact public email and desired social URLs.
- A requested destination is not an absolute HTTPS profile URL or cannot be confidently associated with the intended owner.
- Completing the request appears to require a form, backend, new dependency, or design change.
- The Contact page has drifted from the current inner-scroll layout.

## Maintenance notes

Future profile changes should update both the rendered link and its smoke assertion. Reviewers should click each destination manually before release. Do not let a temporarily unavailable profile regress to `href="#"`; omit it until a real URL exists.
