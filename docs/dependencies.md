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

No overrides remain. The `overrides` section of `package.json` tells npm to use a fixed version of a package that a parent asks for in an exact old version, so a lock file refresh can't move it. The last three (`tar-fs`, `ws` and `basic-ftp`) were removed on 2026-11-22: puppeteer 25 no longer pulls them in, and `ws` 8.23.0 is already allowed by its range. The `tar` override was removed the same day: after `canvas` left, its only users (`node-gyp`, `cacache`) ask for `^7.4.3`, which already allows the fixed 7.5.23 in the lock file.

If an override is needed again, list it here with the reason and the condition for removing it. An override pins an exact version, so a later fix for that package does not arrive through a lock file refresh; Renovate proposes updates to override entries like any other dependency, and Dependabot alerts still report a vulnerable pinned version. When the parent package is upgraded so that it asks for a fixed version itself, remove the override, regenerate the lock file, and check with `npm ls <package> --all` and `npm audit` that no old copy is left.

## Known gaps

- The Docker base image (`node:24-trixie-slim`) and the Deno install script are not pinned to a digest or a release.
- After the puppeteer 25 upgrade (2026-11-22), `npm audit` reports 12 findings (none critical: 3 high, 8 moderate, 1 low), down from 43 before the lock file refresh. The 3 high ones are in `@faker-js/faker` (needs a major upgrade), `decode-uri-component` and `query-string` (used by the maps plugin; see the roadmap). The plan is in `docs/reports/2026-11-21-security-findings-plan.md`.
