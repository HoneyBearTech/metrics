# Plan: renovate-fixes

## What Sean asked for

"start the fix job" - fix the two security updates the Renovate review marked "needs a small fix first": #20 (sanitize-html) and #25 (simple-git).

## What we found

- **#20 sanitize-html** moves 2.11.0 to 2.18.0. That version fixes several ways to sneak HTML past the cleaner, but adds a crash of its own: a few thousand nested `<iframe>` tags make it throw an error. 2.18.2 fixes that crash and three more bypasses. metrics uses it in one place, `source/app/metrics/utils.mjs`, to clean text from GitHub before it goes into the image.
- **#25 simple-git** moves 3.36.0 to 4.1.0, fixing three high-to-critical bugs. Version 4 drops the "default import" metrics uses everywhere, so the action and the Docker build would fail to start as #25 stands. The new form is `import {simpleGit} from "simple-git"`.
- simple-git is imported in four places metrics runs, `source/app/action/index.mjs`, `source/app/metrics/utils.mjs`, `source/plugins/languages/analyzer/analyzer.mjs` and `tests/ci.test.js`, and in three helper scripts the project's own release process uses: `.github/scripts/build.mjs`, `release.mjs` and `presets_examples.mjs`. The licenses and contributors plugins reach it through `utils.mjs`, so they need no change.
- The deep language analysis clones private repositories by putting the token in the clone address. It doesn't pass git settings through environment variables, which version 4 now filters (neither the action, the Dockerfile nor the analyzer sets any). We still need to confirm version 4 accepts that kind of address.

## What we'll change

One PR with two commits, one per package. When it merges, Renovate sees both updates are done and closes #20 and #25 by itself.

1. **sanitize-html to 2.18.2.** Raise the minimum version in `package.json` to `^2.18.2` and update `package-lock.json` to match. Nothing else in the lockfile should change.
   - Check: the lockfile shows 2.18.2. A quick script feeds it `'<iframe>'.repeat(4000)` and gets cleaned text back, not an error. The test suite passes.
2. **simple-git to 4.1.0.** Set `package.json` to `^4.1.0` and update `package-lock.json`. Switch the seven imports listed above to the new form, keeping each file's current local name (`git` or `sgit`), so no other line changes. In `tests/ci.test.js` it becomes `require("simple-git").simpleGit(...)`.
   - Check: every changed file loads (`node --check`, plus importing each module). The tests pass (`npm test` where it can run here). The linter passes (`npm run linter`).
   - Check: a small local script, run against a local repository, clones from a `https://user:token@host/...` address through the same calls the analyzer makes (`clone(url, ".", ["--single-branch"])`, then `branch(...)`). This shows version 4 doesn't refuse it.
   - Check: the PR's CI (Lint, Analyze code, Build and test with the Docker image) passes.

The three `.github/scripts/` files fall under the rule that lets this repo's approved jobs change `.github/` files. No workflow file changes.

## Who's on it

Engineer, QA, Security Officer, Auditor.

## Risks

- **Private repositories.** If version 4 handles the token address differently in a way the local check misses, the deep analysis of private repositories would quietly skip those repos instead of failing. The next real metrics run on the profile would show it (language numbers drop). If it does, we put simple-git back to 3.36.0 in a follow-up.
- **Lockfile churn.** Other open Renovate PRs edit the same `package-lock.json`. Whichever merges second may need Renovate to rebase it, which it does by itself.
- **Release scripts.** The three helper scripts only run in the upstream project's release process, so CI doesn't exercise them. We check them by loading them.

## Out of scope

- The other Renovate PRs: merging the safe ones, or closing #22 (faker) and #26 (Vue 3).
- Changing `renovate.json`.
- The other `npm audit` findings no PR covers.
