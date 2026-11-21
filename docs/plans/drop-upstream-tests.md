# Plan: drop-upstream-tests

**What Sean asked for:** "remove the upstream-only test files next"

## What we found

- `tests/ci.test.js` holds the upstream project's checks on outside contributions: it fails whenever a branch changes files that only the original author was meant to change (`ARCHITECTURE.md`, `tests/cases/`, `.github/scripts/` and others). Every recent fork change trips it. CI doesn't run it; only `npm test` and `npm run test-contrib` do.
- `tests/presets.test.js` downloads the upstream project's presets branch from GitHub and checks it. It tests upstream's files, not this fork's code. Only `npm test` and `npm run test-presets` run it.
- Because of the first file, `npm test` (all tests) fails on any fork branch, so a contributor can't use it.
- The review of the tests folder (`docs/reports/2026-11-21-tests-review.md`) recommends removing both.

## What we'll change

1. **Delete `tests/ci.test.js` and `tests/presets.test.js`.**
   - *Check:* `npx jest --listTests` no longer lists them.
2. **Remove the `test-contrib` and `test-presets` scripts** from `package.json`, which only ran those files. `npm test` and `npm run test-metrics` stay.
   - *Check:* no file outside the old plans and reports still names them.
3. **Record the previous job (focused-tests-ci, PR #68) and this one** in the roadmap, pass map and decisions log. The previous job's notes come here so its approval stayed valid.
   - *Check:* the spelling check passes on the new text.

No workflow file changes. CI runs only `npm run test-metrics`, which doesn't use either file, so its results stay the same (344 passed, 399 skipped).

## Who's on it

Engineer, Security Officer, Auditor. CI on this PR is the full test run.

## Risks

- **Losing a useful check:** the upstream file also checked that generated files (the README, the test cases) weren't edited by hand. In this fork the team rebuilds them on purpose, so the check only gets in the way. The build script stays the way to regenerate them.

## Out of scope

The leftover upstream scripts under `.github/scripts/` (`presets_examples.mjs` behind `npm run presets`, `release.mjs`, `markdown_example.mjs`, `preview.mjs`) are a separate roadmap item. The `.presets` line in `.gitignore` stays, because `presets_examples.mjs` still uses that folder.
