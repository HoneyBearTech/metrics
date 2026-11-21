# Plan: scorecard-workflow

**What Sean asked for:** "integrate the openssf scoreboard.yml into the workflows"

## What we found

- The house standard has an OpenSSF Scorecard workflow (`.github/workflows/scorecard.yml` in Steerhouse). Scorecard is OpenSSF's automatic check of a project's security habits: pinned actions, token permissions, branch protection, code review, dependency updates and more. Every week it gives the repository a score out of 10.
- This repository has no Scorecard workflow yet. The roadmap lists it under "New CI checks".
- The house file runs on pushes to `main`, but this repository's default branch is `master`. Its `upload-sarif` step uses a different version of the code scanning action than this repository's `test.yml`.
- Scorecard runs on pushes to `master` and on a weekly timer, not on pull requests. It adds no new check to pull requests, so the Renovate merge rule in the repo's guidelines stays the same.

## What we'll change

1. **Add `.github/workflows/scorecard.yml`** based on the house file. It runs on pushes to `master`, every Saturday, when branch protection rules change, and on demand. Its permissions start read-only, and the job asks only for what it needs. It publishes its results to OpenSSF, so the score can be shown on a badge, and it uploads its findings to this repository's code scanning page. Every action is pinned to an exact commit with its version in a comment: the newest Scorecard release that is at least 3 days old, checked against its release tag, and the same code scanning version `test.yml` uses.
   - *Check:* the file passes a workflow syntax check, and every pinned commit matches its version's tag on GitHub. After merging, run it once by hand from the Actions tab: it should finish green, and the Scorecard results should appear on the code scanning page.
2. **Add the Scorecard badge** to the README badge row, in the source file the README is generated from (`.github/readme/partials/templated/README.md`), and regenerate the README the usual way.
   - *Check:* the badge shows in the generated `README.md`. It shows a score after the first run on `master`.
3. **Mention Scorecard** where the security pages list the project's checks, if they do, and add any new words to the spelling dictionary.
   - *Check:* both spelling check runs pass on this pull request.

This job changes a workflow file, which this repository's rules allow when the plan says so.

## Who's on it

Engineer, QA, Security Officer, Auditor.

## Risks

- **New code scanning alerts:** Scorecard adds its findings (for example unpinned Docker images or missing branch protection) to the code scanning page. That is expected. The separate plan for code scanning findings covers them.
- **Branch protection is only partly checked:** without an extra token with admin rights, Scorecard can't read all branch protection settings, so that part of the score may be low or incomplete. We won't add such a token; Sean can decide later.
- **Publishing results:** the results go to OpenSSF's public API, which the badge reads. The repository is public, so nothing private is shared.

## Out of scope

Fixing what Scorecard finds (the code scanning plan), the other new checks on the roadmap (dependency review, secret scanning, sign-off check), and repository settings.
