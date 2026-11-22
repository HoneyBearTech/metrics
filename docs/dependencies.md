# Dependencies and vulnerability management

## Choosing and recording dependencies

Dependencies are npm packages, listed in `package.json`, with exact resolved versions and hashes in `package-lock.json` (always committed). CI installs from the lock file (`npm ci`). The Docker image also installs system packages (Google Chrome, fonts, build tools) and Deno, listed in the `Dockerfile`. New dependencies should be avoided where possible ([CONTRIBUTING.md](../CONTRIBUTING.md)); a new one needs a reason in its pull request.

## Tracking updates

- **Renovate** ([`renovate.json`](../renovate.json)) proposes updates. An ordinary update waits 3 days after its release. Vulnerability fixes skip the wait and carry the `security` and `openssf` labels. Major updates for faker, Vue and vue-prism-component are switched off until their migrations are done.
- **Dependabot alerts** are meant to be on, to report known vulnerabilities in the lock file. Dependabot security updates are off, because Renovate makes those pull requests.
- Each update is a pull request that runs the full checks (**Lint code**, **Build and test**, **Analyze code**, **CodeQL**, **Check Spelling**) before anything merges.

## Renovate merge rule

The rule in the repository's guidelines file lets the maintainer's GitHub App merge a Renovate pull request only when all of this holds: Renovate authored it on its own branch in this repository, and every commit is Renovate's and verified; it changes only `package.json` and `package-lock.json`; every required check passed on its latest commit; every new version is at least 3 days old; it is a patch or minor update, or a major one that a review in `docs/reports/` recommends by name; and no other pull request was merged since its checks last ran. Everything else is merged by the maintainer.

## Fixing vulnerabilities

Targets, from when a finding is known, not a contract:

| Severity | Target |
| --- | --- |
| Critical or high | fixed or mitigated within 30 days |
| Medium | within 60 days |
| Low | at the maintainer's discretion |

A fix that needs a major upgrade or a migration is planned on the [roadmap](roadmap.md) instead, with the reason. For a vulnerability in metrics itself, see [SECURITY.md](../SECURITY.md).

## Overrides

Some packages ask for an exact old version of a library, or an old major version, so a lock file refresh can't move them. The `overrides` section of `package.json` tells npm to use a fixed version instead. Each override is listed here so it can be removed once it is no longer needed.

- **`tar-fs` 3.1.3, only under `@puppeteer/browsers`**. Puppeteer asks for exactly 3.0.4. The scope keeps the 2.x copy that `libxmljs2` uses (through an install helper) on 2.x; that copy needs no override because its own range already allows the fixed 2.1.4 and later. Remove it when puppeteer is upgraded to a version that asks for `tar-fs` 3.1.1 or later.
- **`ws` 8.23.0**. Puppeteer asks for exactly 8.14.1. Remove it when puppeteer is upgraded to a version that asks for `ws` 8.21.0 or later (`jsdom` already allows it).
- **`basic-ftp` 6.2.6**. Puppeteer's proxy support asks for 5.x. It is only used if a proxy setting is fetched over FTP, which this project never does. Remove it when puppeteer is upgraded to a version whose proxy support asks for `basic-ftp` 6.2.4 or later.

`ip` and the 2.x `tar-fs` are fixed without overrides: the lock file moves them to the fixed versions their parents already allow. The `tar` override was removed on 2026-11-22: after `canvas` left, its only users (`node-gyp`, `cacache`) ask for `^7.4.3`, which already allows the fixed 7.5.23 in the lock file.

The overrides pin exact versions, so a later fix for one of these three packages does not arrive through a lock file refresh. Renovate proposes updates to override entries like any other dependency (it supports npm overrides), and Dependabot alerts still report a vulnerable pinned version. When the parent package is upgraded so that it asks for a fixed version itself, remove the override, regenerate the lock file, and check with `npm ls <package> --all` and `npm audit` that no old copy is left.

If an override breaks something, remove just that one and plan the matching alerts for dismissal or a later upgrade.

## Known gaps

- The Docker base image (`node:24-trixie-slim`) and the Deno install script are not pinned to a digest or a release.
- After the lock file refresh and the overrides (2026-11-21), `npm audit` reports 25 findings (none critical: 10 high, 14 moderate, 1 low), down from 43. Most of the rest are in packages that need a major upgrade, plus a few that do not affect the project. The plan is in `docs/reports/2026-11-21-security-findings-plan.md`.
