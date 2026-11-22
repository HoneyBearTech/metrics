# Plan: minimatch-refresh

**What Sean asked for:** "start the minimatch refresh" (the last six Dependabot alerts a lock file refresh can fix, found after jobs 2 and 3 of `docs/reports/2026-11-21-security-findings-plan.md`).

## What we found

- Six old copies of `minimatch` (a file-pattern matcher) are pinned in `package-lock.json` at versions with known ReDoS problems (patterns that take very long to match): five copies of 3.1.2 (under the linter's config tools, the test coverage tool, `glob` 7 and the build tool `jake`) and two of 5.1.6 (under `filelist` and the CSS tool `purgecss`).
- The packages that use them already allow the fixed versions (3.1.5 and 5.1.9, both published in February 2026); job 2 just didn't name `minimatch`. That is Dependabot alerts 32 to 37 (all high).
- The other copies (9.0.9 and 11.0.9) are not affected by these alerts.

## What we'll change

1. **Update only `minimatch` inside `package-lock.json`,** each copy to the newest version its parent already allows, with npm's `--before=2026-11-18` so nothing is newer than 3 days. Nothing in `package.json` changes.
   - *Check:* the change touches only `package-lock.json` (besides the notes); every `minimatch` copy is 3.1.5, 5.1.9 or a version that was already unaffected; a list of every changed version with its publish date; `canvas` and the overrides stay as they are.
2. **Prove nothing broke:** a clean install, the lint check, the build and the focused tests locally; the Docker build and full test suite in CI.
   - *Check:* every check on this pull request passes with the same test totals as `master`.
3. **Measure and record:** npm's audit findings before and after, the alerts this should close, and the notes.

## Who's on it

Engineer, QA, Security Officer, Auditor. No separate research step. It is security-sensitive (dependency updates).

## Risks

- `minimatch` 3.1.5 and 5.1.9 are patch releases of the same versions, so the matching behavior is the same apart from the fixes.
- Renovate's open pull requests also change `package-lock.json` and will need a rebase after this merges.

## Out of scope

The three `@octokit` alerts (job 10's `@actions/github` upgrade) and everything already dismissed.
