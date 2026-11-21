# Plan: focused-tests-ci

**What Sean asked for:** "run the focused tests in CI"

## What we found

- The fork has its own focused tests in `tests/plugins/` (recent activity, recently used languages, lines). They check the fork's fixes against made-up data, with no network, no web server and no shared folders, and take under a minute.
- CI never runs them: it only runs `npm run test-metrics`, which covers `tests/metrics/` (the review in `docs/reports/2026-11-21-tests-review.md` lists this as the first fix).
- The test files are already inside the image CI builds (the `Dockerfile` copies the whole repository), so no workflow change is needed.

## What we'll change

1. **Add the focused tests to the `test-metrics` script** in `package.json`, in the same run as the four metrics test files, so all their results are reported together and a failure in one doesn't hide the others.
   - *Check:* this PR's CI log lists the three focused test files with all their tests passing, next to the four metrics files, and the totals for `tests/metrics/` stay 329 passed and 399 skipped.
2. **Mention it where the tests are described** (`ARCHITECTURE.md`'s tests list, and `CONTRIBUTING.md` if it names the test commands).
   - *Check:* the wording matches the script.

No workflow file changes.

## Who's on it

Engineer, Security Officer, Auditor. CI on this PR is the full test run.

## Risks

- **A focused test fails inside the image** but passes outside it (for example a missing build of a native module). The CI run shows this; it gets fixed before the work is finished.
- **Slightly longer test step:** under a minute.

## Out of scope

The review's other fixes (the SVG check, the placeholder tests, the dead mocks, the upstream-only test files) each get their own PR.
