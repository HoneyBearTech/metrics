# Guidelines for this repository

This is HoneyBearTech's fork of the GitHub profile metrics generator (upstream: lowlighter/metrics, no longer maintained). It carries the fork's own fixes; nothing goes back upstream. Job notes live in `docs/`: `roadmap.md`, `pass-map.md`, `decisions-log.md`, plans in `docs/plans/` and reviews in `docs/reports/`.

## Checks

Every pull request runs four checks: **Lint code**, **Build and test** (the Docker image build plus the full test suite), **Analyze code** (code scanning) and **Check Spelling**. `master` has no required checks set, so this file names them.

## Merging

The team may merge a pull request opened by Renovate when all of these hold:

1. All four checks above have passed on the pull request's latest commit; none is failing, skipped or still running.
2. It is a patch or minor update, or a major update that a review in `docs/reports/` recommends merging.
3. It doesn't change anything under `.github/workflows/`. Those stay for the owner to merge.
4. No other pull request was merged into `master` since its checks last ran. Renovate's pull requests share `package-lock.json`, so they go in one at a time: after each merge, wait for Renovate to update the next one and for its checks to pass again.

Merge with squash (`gh pr merge <number> --squash`), the method the repository's recent merges use.

Everything else, including the team's own pull requests, is merged by the owner.
