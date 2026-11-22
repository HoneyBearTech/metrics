# Plan: remove-upstream-scripts

**What Sean asked for:** "start job 5 of the security plan" (job 5 of `docs/reports/2026-11-21-security-findings-plan.md`: delete the unused upstream scripts in `.github/scripts/`, which closes code scanning alert 17).

## What we found

- `.github/scripts/` holds six things. Four are leftovers from the original project that no workflow, Docker build or document of this fork uses:
  - `release.mjs`: writes upstream's release notes, with the upstream maintainer's name built in.
  - `markdown_example.mjs`: takes a screenshot of upstream's example page on GitHub.
  - `presets_examples.mjs` (behind `npm run presets`): clones upstream's `presets` branch with a token and pushes rendered examples back. Alert 17 ("web data written to a file") is in this script.
  - `preview.mjs` (behind `npm run preview`): builds the static preview site upstream published; this fork's web server doesn't serve it.
- Two are still used and stay: `build.mjs` (the Docker image runs `npm run build`) and `quickstart/` (the guides for new plugins and templates tell people to run `npm run quickstart`).
- The roadmap already lists these four for a later cleanup.

## What we'll change

1. **Delete the four scripts**, and remove the `presets` and `preview` commands from `package.json`'s scripts. Nothing else in `package.json` changes, and `package-lock.json` doesn't change.
   - *Check:* nothing in the repository refers to the deleted files or commands any more (outside the job notes); `npm run build` still works; the Docker build and full test suite pass in CI.
2. **Remove the two `.gitignore` lines that only existed for them:** `.presets` (where `presets_examples.mjs` cloned upstream's examples) and `source/app/web/statics/preview` (where `preview.mjs` wrote its output).
   - *Check:* `git status` stays clean after a build.
3. **Spelling list:** remove words from `.github/actions/spelling/expect.txt` that only the deleted files used, so the spelling check has nothing stale to report.
   - *Check:* both spelling check runs pass on this pull request.
4. **Record it:** the roadmap item marked done, the pass-map and the decisions log.
   - *Check:* after merging, code scanning on `master` shows alert 17 as fixed.

## Who's on it

Engineer, QA, Security Officer, Auditor. No separate research step: the roadmap and the findings plan already checked what uses these files. Not security-sensitive in itself (it only removes unused code), but it is a security-plan job, so the security review still runs.

## Risks

- **Someone running `npm run presets` or `npm run preview` by hand** would now get "missing script". Both only worked against the upstream project, so nothing that worked before stops working.

## Out of scope

`build.mjs` and `quickstart/` (still used); the other code scanning alerts (job 4 fixes some, job 6 dismisses the false alarms).
