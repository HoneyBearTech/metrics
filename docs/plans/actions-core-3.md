# Plan: actions-core-3

**What Sean asked for:** "do the code changes on 75 and 83". This is the `@actions/core` part; `@twemoji/parser` has its own pull request.

## What we found

- **Why Renovate's #75 fails:** `@actions/core` 3 is an ES module only and has no default export, so `import core from "@actions/core"` fails. That is why Renovate's pull request has 337 failing tests.
- **The two files that need the change:** `source/app/action/index.mjs` and `source/plugins/languages/analyzer/analyzer.mjs`. Both reviewers of the majors review (`docs/reports/2026-11-22-majors-review.md`) ran the Action with `import * as core from "@actions/core"`.
- **Version 3.0.1 is old enough:** it was published on 2026-04-21, from GitHub's release workflow with provenance.

## What we'll change

1. **Version:** `package.json` and `package-lock.json` move to `@actions/core` 3.0.1, the version Renovate proposes.
   - *Check:* the lock file changes only `@actions/core` and the packages it brings in, and `npm audit` doesn't get worse.
2. **Imports:** in the two files, use `import * as core from "@actions/core"`.
   - *Check:* every use of `core.` in them still exists in version 3.
3. **Prove nothing broke:** lint, the focused tests, an Action run with stand-in data, and CI's full suite.
4. **After merging:** Renovate's #75 is no longer needed, and Renovate closes it on its own.

## Who's on it

Engineer, QA, Security Officer, Auditor. No new research: the majors review already covered it.

## Risks

- **Behaviour changes in version 3:** any change in how inputs, outputs or failures behave. The Auditor compares every function the project uses.

## Out of scope

- `@twemoji/parser` 17 (#83), in its own pull request.
