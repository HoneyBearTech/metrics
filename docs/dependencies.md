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

## Known gaps

- The Docker base image (`node:24-trixie-slim`) and the Deno install script are not pinned to a digest or a release.
- About 40 of the 52 findings of `npm audit` have no Renovate pull request, mostly in puppeteer, tar, crypto-js and express; each needs its own look. See the roadmap.
