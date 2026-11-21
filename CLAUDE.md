# Guidelines for this repository

This is HoneyBearTech's fork of the GitHub profile metrics generator (upstream: lowlighter/metrics, no longer maintained). It carries the fork's own fixes; nothing goes back upstream. Job notes live in `docs/`: `roadmap.md`, `pass-map.md`, `decisions-log.md`, plans in `docs/plans/` and reviews in `docs/reports/`.

## Checks

Every pull request runs these checks: **Lint code**, **Build and test** (the Docker image build plus the full test suite), **Analyze code** and **CodeQL** (code scanning) and **Check Spelling**. `master` has no required checks set, so this file names them.

## Merging

The team may merge a pull request from Renovate only when all of these hold. Check them with `gh pr view <number> --json author,headRefName,isCrossRepository,commits,files,statusCheckRollup,body`.

1. **It is really Renovate's.** The author is `app/renovate`, the branch is a `renovate/` branch in this repository (not from a fork), and every commit on it was made by Renovate. If anyone else pushed to it, the owner merges it.
2. **It changes only `package.json` and `package-lock.json`.** Updates to anything else, such as files under `.github/`, `action.yml`, the `Dockerfile` or `renovate.json`, stay for the owner to merge. So do lock file maintenance, pin and digest updates.
3. **Its checks have passed on its latest commit.** Every check run named in the Checks section passed, including both **Check Spelling** runs. A check that didn't run counts as not passed. None of its other checks or statuses (including any `renovate/` status, such as Renovate's release-age wait) is failing or still running; only the spelling **Report** jobs may be skipped.
4. **The new version is at least 3 days old.** Every version it updates to was published at least 3 days ago (`npm view <package> time`). Renovate's security updates skip its own 3-day wait, so this is checked here.
5. **It is a patch or minor update, or a reviewed major.** Decide from the version change in the pull request, not from Renovate's labels. A change of the first number is major, and so is a change of the middle number below 1.0 (for example 0.32 to 0.35). A major update qualifies only when a review on `master` in `docs/reports/` names that pull request and recommends the exact version it now updates to.
6. **One at a time.** No other pull request was merged into `master` since its checks last ran. Renovate's pull requests share `package-lock.json` and Renovate only updates one on its own when it conflicts, so after each merge, tick the next pull request's rebase/retry checkbox in its description (or wait for Renovate to update it), then wait for its checks to pass again.

Merge with squash (`gh pr merge <number> --squash`), the method the repository's recent merges use.

Everything else, including the team's own pull requests, is merged by the owner.
