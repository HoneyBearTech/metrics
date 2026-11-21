# Plan: tests-speed

**What Sean asked for:** "Let's fix it, that test step shouldn't take that long" (after the review of the tests folder, PR #47).

## What we found

- The "Run tests" step takes about 29 minutes. It runs 329 tests one after another (`jest --runInBand`), and each one starts its own process (review: `docs/reports/2026-11-21-tests-review.md`).
- The two lines plugin cases wait 30 real seconds each time they run (`plugin_lines_delay: 30`). They run 15 times, which adds up to about 7 minutes.
- The CI machine has 4 processor cores, but the tests use one. The action tests don't share anything with each other. The web tests share one web server on port 3000.
- Every test case is still needed: this job makes them run faster, not fewer.

## What we'll change

1. **A 1-second lines delay in tests.**
   - In `source/plugins/lines/examples.yml`, both examples get a test-only setting of `plugin_lines_delay: 1`, using the same `test:` block other plugins already use. Users' examples and the documentation keep 30.
   - The generated `tests/cases/lines.plugin.yml` is rebuilt to match.
   - The code that waits and asks again still runs; only the wait is shorter.
   - *Check:* the generated case shows `1`, and the CI log shows the lines tests at a few seconds instead of about 35.
2. **Run the test files side by side.**
   - `tests/metrics.test.js` becomes a shared helper plus a few test files, about one per core. Each file runs part of the cases.
   - The `test-metrics` script in `package.json` drops `--runInBand`, so the test runner spreads the files over the cores.
   - Test names stay the same (for example "GitHub Action > Template : classic > ..."), so the CI log reads as before.
   - *Check:* the PR's CI run has the same totals as before (329 passed, 399 skipped, 728 total) and no failures.
3. **Web tests get their own server per file.**
   - Each web test file starts its own web server on its own port, so they don't get in each other's way.
   - In sandbox (test) mode only, the web server can take its port from an environment setting. The default stays 3000, and normal web servers still read the port from `settings.json`.
   - The placeholder tests use the server of the file they run in.
   - *Check:* the web tests pass on their ports, and a web server started without the setting still listens on 3000.
4. **Shared folders are handled once.**
   - The community template cases write to `source/templates/@classic`, and today every run cleans it up before and after.
   - These cases go in one file, and that file alone cleans up, so files running side by side can't delete each other's files.
   - *Check:* the community template tests pass in the parallel run.

**Goal:** the test step goes from about 29 minutes to about 10. This is an estimate. The PR's own CI run measures it, and the result goes in the notes.

No workflow file changes: CI already runs `npm run test-metrics`.

## Who's on it

Engineer, QA, Security Officer, Auditor.

## Risks

- **Slower single tests.** With four tests at a time, each one runs slower. The 60-second limit per test stays; if a test gets close to it, we report it rather than hide it.
- **Hidden sharing.** Something else the tests share could clash when they run at the same time. The parallel CI run is what shows this, and anything flaky gets fixed or reported before Gate B.
- **Uneven files.** If one file holds most of the slow cases, the step only gets as fast as that file. Cases are spread by their measured times from the last CI log.

## Out of scope

The review's other recommendations each get their own PR later: running the focused tests in `tests/plugins/` in CI, the SVG check, the placeholder tests, the dead mocks, the upstream-only test files, and mocks that fail instead of reaching the internet. This job doesn't change what any test checks.
