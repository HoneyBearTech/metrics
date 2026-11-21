# Plan: dependency-overrides

**What Sean asked for:** "start job 3 of the security plan" (job 3 of `docs/reports/2026-11-21-security-findings-plan.md`: overrides for `tar`, `tar-fs`, `ws` and `basic-ftp`).

## What we found

- Four packages this project uses indirectly have known vulnerabilities, and the packages that bring them in ask for exactly the old version or an old major version. A lock file refresh (job 2) can't move them, so `package.json` has to tell npm to use a fixed version instead (an "override").

  | Package | Now | Brought in by | Fixed in | Open alerts |
  |---|---|---|---|---|
  | `tar` | 6.1.15 | the GIF plugin's image library (`canvas`), only while it installs | 7.5.21 | 13 (1 critical) |
  | `tar-fs` | 3.0.4 | puppeteer, which asks for exactly 3.0.4 | 3.1.1 | 3 |
  | `tar-fs` | 2.1.1 | an install helper of `canvas` | 2.1.4 (already allowed) | 3 |
  | `ws` | 8.14.1 | puppeteer, which asks for exactly 8.14.1 | 8.21.0 | 3 |
  | `basic-ftp` | 5.3.1 | puppeteer's proxy support, for proxy settings fetched over FTP | 6.2.4 | 3 |
  | `ip` | 1.1.8 | the same proxy support | 1.1.9 (already allowed) | 1 of 2 |

  That is 26 of the open alerts. Every fixed version above was published at least 3 days ago.
- One `ip` alert (high) has no fixed version at all; it goes to job 6 (dismissing), together with the reason: the project never uses proxy settings that would reach that code.
- Two of the fixes are a new major version: `tar` 6 to 7 for the image library's installer, and `basic-ftp` 5 to 6 for the proxy support. Those carry the most risk, so each override can be removed on its own if it breaks something.

## What we'll change

1. **Add overrides to `package.json`** for `tar` (7.5.21 or later), `tar-fs` 3.x (3.1.1 or later, for puppeteer only), `ws` (8.21.0 or later, staying on 8.x) and `basic-ftp` (6.2.4 or later), and update `package-lock.json` to match. Update `tar-fs` 2.x and `ip` within the versions already allowed, with no override.
   - *Check:* `npm ls tar tar-fs ws basic-ftp ip` shows only fixed versions; a list of every package whose version changed in the lock file, each with its old and new version and publish date (at least 3 days old); nothing else in `package.json` changes; `canvas` stays at 2.11.2.
2. **Prove nothing broke.** A clean install, the lint check and the focused tests locally; in CI, the Docker image build (which installs `canvas` with the new `tar`) and the full test suite (which renders pages through puppeteer with the new `ws` and `tar-fs`).
   - *Check:* every check on this pull request passes, with the same test totals as `master`.
3. **Explain each override** in `docs/dependencies.md`: why it is there, and when to remove it (for example, when puppeteer or `canvas` is upgraded to a version that already asks for the fixed one).
   - *Check:* one entry per override.
4. **Measure the result:** npm's audit findings before and after, and the list of Dependabot alerts this should close.
5. **Record it:** the notes.

## Order

This pull request and job 2 (#82) both change `package-lock.json`. The work starts after #82 is merged, from the updated `master`, so the two don't conflict.

## Who's on it

Engineer, QA, Security Officer, Auditor. No separate research step: this job was researched for the findings plan. It is security-sensitive (dependency updates).

## Risks

- **`tar` 7 under the image library's installer:** if the installer can't unpack its ready-made download with `tar` 7, it falls back to building `canvas` from source, which is slower but works in the Docker image; the Docker build in CI shows which happened. If it fails outright, the `tar` override is dropped and those alerts go to job 6, since `tar` only runs while installing.
- **`basic-ftp` 6:** only used if a proxy setting is fetched over FTP, which this project never does. If it breaks anything, the override is dropped and its alerts go to job 6.
- **Renovate's open pull requests** also change `package-lock.json` and will need a rebase after this merges.

## Out of scope

Upgrading puppeteer or `canvas` (job 10), the `ip` alert with no fix and the other dismissals (job 6), `glob` and `minimatch` (the test tools still need their old versions).
