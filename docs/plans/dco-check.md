# Plan: dco-check

**What Sean asked for:** "start a job for the sign-off check" (issue #56, the OpenSSF Baseline Level 2 sign-off control).

## What we found

- `CONTRIBUTING.md` already says every commit must carry a `Signed-off-by` line (`git commit -s`), but nothing checks it. That is the last open Baseline Level 2 item (#56).
- The house standard has a ready workflow for this, `dco.yml`, used across the owner's other repositories. Its check is called **DCO sign-off**. It reads the pull request's commits through GitHub's API and fails if one of them has no `Signed-off-by: Name <email>` line. Merge commits (like GitHub's "Update branch") and commits made by Renovate or Dependabot are left out.
- Renovate's commits carry no sign-off, so without that exemption every Renovate pull request would fail the new check, and the Renovate merge rule (which needs every listed check to pass) would stop working.
- The `main-protection` ruleset decides which checks must pass before a merge. Only Sean can add the new check there.

## What we'll change

1. **Add `.github/workflows/dco.yml`** from the house standard. It runs on every pull request, with read-only access, and uses no outside action (only `gh` and `jq`, which the runner already has). The pull request's details reach the script only through environment variables, never pasted into the command.
   - *Check:* the workflow syntax check passes; the check's filter is run locally on sample commit lists (signed, unsigned, a merge commit, a Renovate commit, a sign-off line with no email) and gives the right answer for each; on this pull request, **DCO sign-off** runs and passes, since every commit here is signed off.
2. **Name the new check in the repo's guidelines** (the Checks section, which the Renovate merge rule refers to) and in `docs/security.md` where the pipeline's checks are listed. `CONTRIBUTING.md` gets one line saying a check now enforces the sign-off.
   - *Check:* the texts match the check's real name, and both spelling check runs pass.
3. **Spelling:** add any new words from the workflow to the spelling list.
4. **After merging (Sean):** add **DCO sign-off** to the ruleset's required checks; then the team prepares an updated Best Practices answer for the sign-off control and closes #56.

This job changes a workflow file, which this repository's rules allow when the plan says so.

## Who's on it

Engineer, QA, Security Officer, Auditor. No separate research step: the house workflow is already in use elsewhere, and the repository was read for this plan. This job is security-sensitive (a CI workflow).

## Risks

- **The Renovate exemption goes by the commit author's GitHub account,** which GitHub works out from the commit's email address. Someone could put Renovate's address on their own commit to skip the check. That only skips the sign-off statement, not any other check, and the Renovate merge rule separately requires Renovate's commits to be verified by GitHub. Making Renovate sign its commits instead would remove the exemption, but if it ever left the line out, every Renovate pull request would be stuck; that can be a later change.
- **Open pull requests from before the check** may fail it if they contain a commit without a sign-off. The team's and Renovate's open pull requests don't.

## Out of scope

Changing Renovate's commit messages, signing commits cryptographically, and the other new CI checks on the roadmap (dependency review, secret scanning).
