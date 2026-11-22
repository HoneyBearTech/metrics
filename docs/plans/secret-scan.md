# Plan: secret-scan

**What Sean asked for:** "start the secret scan" (issue #54, Baseline OSPS-BR-07.01, and issue #59, Best Practices `no_leaked_credentials`).

## What we found

- No workflow scans for leaked secrets today. Whether GitHub's own secret scanning and push protection are on can't be read by the team's GitHub access; only Sean can see and change that setting.
- `gitleaks` (MIT license, free for personal accounts) scans the whole git history in well under a minute for a repository this size (about 2,600 commits). Its latest release, 8.30.1 (March 2026), publishes a checksum file for each download.
- The repository has test files with stand-in tokens (`tests/secrets.json`, `MOCKED_` values) that a scanner may report; each needs a reviewed exception, not a blanket one.

## What we'll change

1. **`.gitleaks.toml`:** use gitleaks' standard rules, plus exceptions only for findings the team has checked are not real secrets, each with a one-line reason.
   - *Check:* a full-history scan with this file finds nothing; the list of every finding before the exceptions, with why each one isn't a real secret, goes in the decisions log.
2. **A new workflow, `.github/workflows/secrets.yml`,** on every pull request and every push to `master`: read-only permissions, the checkout step pinned to an exact commit like the other workflows, download gitleaks 8.30.1 and refuse to run unless its checksum matches the one written in the file, then scan the full history and fail on any finding (with the secret's value hidden in the log). The team prepares the exact file; Sean adds it to this pull request's branch himself (the same way as the sign-off check), because the team doesn't write workflow files directly.
   - *Check:* the new check runs on this pull request and passes; a test branch with a fake token (not pushed to GitHub, checked locally) makes the same scan fail.
3. **`SECURITY.md` or `CONTRIBUTING.md`:** one short paragraph on what the scan does and what to do if it flags something.
4. **Record it** in the notes. After the merge, the team sends Sean the Baseline and Best Practices answers to update, and closes #54 and #59.

**For Sean (a setting, about a minute):** Settings, then Advanced Security: turn on **Secret Protection** and **Push protection** (free for public repositories).

## Who's on it

Engineer, QA, Security Officer, Auditor. No separate research step. It is security-sensitive (a CI workflow).

## Risks

- The scan downloads gitleaks from GitHub releases on every run; the checksum check stops a changed download. Updating gitleaks later means changing the version and checksum together (Renovate can't do that on its own here).
- A false finding would block every pull request until an exception is added; the paragraph in step 3 says how.

## Out of scope

- Making the new check required in the branch rules (a setting only Sean can change).
