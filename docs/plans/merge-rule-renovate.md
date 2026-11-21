# Plan: merge-rule-renovate

## What Sean asked for

"yes, add the merge rule for Renovate PRs": let the team merge Renovate's update PRs once they pass, instead of Sean merging each one.

## What we found

- The repo has no guidelines file, so nothing allows anyone but Sean to merge. This machine's rules allow merging only where the repo's guidelines file says so, after the checks it names.
- `master` has no branch protection and no required checks, so the guidelines must name the checks themselves. Every PR runs four: **Lint code**, **Build and test** (the Docker build plus the full test suite), **Analyze code** (code scanning) and **Check Spelling**.
- Renovate's open PRs all change the same lockfile, so they must go in one at a time. After each merge, Renovate updates the next PR to match and its checks run again (about 45 minutes).
- Some Renovate PRs need more than green checks:
  - Major updates can break things the tests don't cover, as with Vue 3 (#26).
  - Updates to the CI workflows (like #28, codeql-action) change `.github/workflows`, which this machine's rules keep for Sean.

## What we'll change

1. **Add a short guidelines file at the top of the repo**, saying:
   - **What this repo is.** A fork of the profile metrics generator that carries its own fixes; nothing goes back upstream. Job notes live in `docs/`.
   - **The merge rule.** The team may merge a pull request opened by Renovate when all of the following hold:
     - All four checks above have passed on the PR's latest commit. None is failing or still running.
     - It's a patch or minor update. A major update also qualifies once a review in `docs/reports/` recommends merging it, as the 2026-11-20 review does for #21, #23 and #24.
     - It doesn't change `.github/workflows`. Those stay for Sean to merge.
     - No other Renovate PR was merged since its checks last ran. In other words: one at a time, waiting for Renovate to update the next PR and for its checks to pass again.
     - The merge method is squash, the same as the repo's recent merges.
   - **Everything else**, including the team's own PRs, is merged by Sean.
   - Check: the file says exactly the above and nothing more. The security review confirms it gives no wider permission than this.

After this PR merges, the team merges the safe Renovate PRs one at a time under the new rule: #21, #23, #18, #17, #16, #19, #31, #32, then #24 and #29 once their checks pass. #28 stays for Sean because it changes a workflow. That merging needs no separate approval from you.

## Who's on it

Engineer, Security Officer, Auditor.

## Risks

- **Green checks aren't a full guarantee.** The tests don't open the web pages, for example. The major-update condition covers the riskiest cases.
- **Slow.** Each merge waits about 45 minutes for the next PR's checks, so 10 PRs take most of a day. The team watches and merges them in turn.

## Out of scope

- Renovate merging its own PRs (automerge).
- Branch protection or required checks (repo settings only Sean can change).
- A full repo setup (badges, security files): the bootstrap job, if Sean wants it later.
