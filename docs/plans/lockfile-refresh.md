# Plan: lockfile-refresh

**What Sean asked for:** "start job 2 of the security plan" (job 2 of `docs/reports/2026-11-21-security-findings-plan.md`: refresh the lock file within the versions already allowed).

## What we found

- Several packages that this project uses indirectly are pinned in `package-lock.json` at old versions with known vulnerabilities, although `package.json` and the packages that pull them in already allow fixed versions. Renovate doesn't update these on its own, because no lock file upkeep is set up.
- The ones the findings plan puts in this job, with their Dependabot alerts:

  | Package | Now | Fixed in | Alerts | Used by |
  |---|---|---|---|---|
  | `proxy-addr` | 2.0.7 | 2.0.8 | 1 critical | the web server (through express) |
  | `crypto-js` | 4.1.1 | 4.2.0 | 1 critical | the maps plugin's library |
  | `decode-uri-component` | 0.2.2 | 0.5.1 | 2 | the maps plugin's library |
  | `postcss-selector-parser` | 6.0.13 | 6.1.5 | 1 | the build step's style tool |
  | `@babel/traverse`, `@babel/core` | 7.22.17 | 7.23.2, 7.29.6 | 2 (1 critical) | test tools |
  | `braces` | 3.0.2 | 3.0.3 | 1 | test tools |
  | `browserslist` | 4.21.10 | 4.28.7 | 1 | build and test tools |
  | `js-yaml` (the old 3.x copy) | 3.14.1 | 3.14.2 or later | 5 | test tools |

  That is 14 of the 56 open alerts, including 3 of the 4 critical ones.
- npm's automatic fix tries to move the GIF plugin's image library, `canvas`, back from 2.11 to 2.7. That is a downgrade, so this job doesn't use the automatic fix.

## What we'll change

1. **Update only these packages inside `package-lock.json`,** each to the newest version that the package depending on it already allows. Nothing in `package.json` changes, and no direct dependency moves to a new major version. Where a fix needs a version outside what its parent allows, that package is left out and goes to job 3 (overrides).
   - *Check:* apart from the notes, the change touches only `package-lock.json`; a list of every package whose version changed (expected: the ones above and the few packages they bring along), each with its old and new version; every new version was published at least 3 days ago, as the repo's guidelines ask of updates; `canvas` stays at 2.11.2.
2. **Measure the result.** Count npm's audit findings before and after, and list which Dependabot alerts the change should close.
   - *Check:* the counts in the pull request; after merging, Dependabot's own list on GitHub.
3. **Prove nothing broke.** A clean install from the new lock file, the lint check, the focused tests, and in CI the Docker build and the full test suite.
   - *Check:* all checks on this pull request pass, with the same test totals as `master` (377 passed).
4. **Record it:** the notes, and `docs/dependencies.md`'s count of open findings.

## Who's on it

Engineer, QA, Security Officer, Auditor. No separate research step: this job was researched for the findings plan. It is security-sensitive (dependency updates).

## Risks

- **Packages brought along:** a newer version of one package can pull in newer versions of the packages it uses. The list from step 1 shows all of them, and the full test suite has to pass.
- **Renovate's open pull requests** also change `package-lock.json`. After this merges, Renovate has to rebase them before they can be merged, one at a time as the repo's guidelines say.

## Out of scope

Overrides for packages pinned by puppeteer and the GIF plugin (`tar`, `tar-fs`, `ws`, `basic-ftp`: job 3), major upgrades (job 10), and dismissing alerts (job 6).
