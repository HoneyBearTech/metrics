# Plan for the code scanning and Dependabot findings (2026-11-21)

Sean asked: "Develop a plan to address the code scanning findings on this repo and the vulnerabilities."

Prepared by the research role and checked by the team lead against the code and GitHub's own lists. The team read every open code scanning alert's code, read the open Dependabot alerts, and ran npm's audit (which uses the same advisory database) to see which updates fix what. Nothing has been changed yet: each job below becomes its own pull request with its own plan.

## In short

- **Code scanning: 18 open alerts, 2 of them real problems.** Both are in the optional web server's sign-in redirect, and they are one bug. Four more are small, cheap fixes. The rest are false alarms or upstream leftovers that can be fixed by deleting a file or dismissed with a one-line reason.
- **Dependabot: 56 open alerts in 22 packages, all from `package-lock.json`.** 4 are critical, 33 high, 16 medium and 3 low. No alert is about the fork's own code; they are all in packages it uses.
- **About two thirds can be fixed without a major upgrade:** refreshing the lock file within the versions `package.json` already allows, plus a few `overrides` for packages that puppeteer pins. What is left needs major upgrades (each with its own review) or is code the project never runs.
- **One more weak spot found on the way:** the web server builds its cache-reset password from `Math.random()`, which is not safe for secrets. Code scanning doesn't flag it, but the Best Practices checklist asks about it.

## Code scanning alerts

All 18 come from the code scanning tool's security and quality rules. The numbers are GitHub's alert numbers.

| Alert | What it says | Where | Verdict | What to do |
|---|---|---|---|---|
| 4, 6 | Cross-site scripting, unchecked redirect (high, medium) | `source/app/web/statics/oauth/redirect.html` | **Real** (web server with sign-in turned on). The page sends the browser wherever `to` says, so a crafted link can run script. It is made worse by a slip in `source/app/web/instance.mjs`, where `from` is read from the `scopes` parameter. | Fix (job 1). |
| 12 | Temporary file in a shared folder (high) | `source/plugins/languages/analyzer/indepth.mjs` | Real but low: public signing keys are written to a predictable name in the system temporary folder. Matters only on a shared machine. | Fix (job 4): write inside a private temporary folder. |
| 16 | Weak random number (high) | `source/plugins/languages/analyzer/analyzer.mjs` | False alarm: only names a temporary folder. | Fix anyway (job 4), it is one line. |
| 9, 10, 11 | Request built from page input (medium) | `source/app/web/statics/embed/app.js`, `.../insights/script.js` | Low: the page calls its own server with the user name from its own address. | Fix (job 4): encode the name. |
| 17 | Web data written to a file (medium) | `.github/scripts/presets_examples.mjs` | Upstream-only script, not used. | Delete the script (job 5). |
| 7, 8 | Unchecked redirect (medium) | `source/app/web/instance.mjs` | False alarm: the route only matches `/about/...` and always sends to `/insights/...` on the same site. | Dismiss: "False positive". |
| 14, 15 | Log injection (medium) | `source/app/web/instance.mjs` | False alarm: the logged value has already been checked to be hexadecimal. | Dismiss: "False positive". |
| 13 | Log injection (medium) | `source/app/action/index.mjs` | The Action writes to the user's own run log. | Dismiss: "Won't fix". |
| 18, 19 | Web data written to a file (medium) | `source/app/action/index.mjs` | The file name is the workflow author's own setting, on their own runner. | Dismiss: "Won't fix". |
| 1, 2, 3 | Duplicate character in a pattern (warning) | `source/plugins/tweets/index.mjs` | Harmless; the hashtag pattern was copied as it is. | Dismiss: "Won't fix". |

Alert 5 shows no state at all in GitHub's list (it is the same rule and file as alert 16). Once job 4 lands, check whether it closes with 16.

Reasons to type when dismissing:

- 7, 8: "The route only matches /about/ paths and always redirects to /insights/ on the same host."
- 14, 15: "The session value is checked to be hexadecimal before it is logged."
- 13: "Written to the user's own workflow log on their own runner."
- 18, 19: "The file name comes from the workflow author's own input; the action runs on their runner."
- 1, 2, 3: "Pattern copied from the upstream hashtag rules; the duplicate characters are harmless."

## Dependabot alerts

Grouped by the package that brings them in. "Shipped" means the package is part of the Action or the web server, not only a development tool.

| Package (alerts) | Worst | Brought in by | Shipped? | Fix |
|---|---|---|---|---|
| `tar` (13) | critical | the GIF plugin's image library, and an optional XML library's build tools | install time only | Override (job 3), or refresh (job 2) |
| `minimatch` (7), `glob` (1) | high | the optional XML library's build tools, and test tools | install and test time | Refresh what fits; the rest is never given outside input |
| `tar-fs` (6), `ws` (3), `basic-ftp` (3), `ip` (2) | high | puppeteer (the browser driver) | yes | Overrides (job 3); puppeteer 25 would fix them too but is skipped on purpose |
| `extract-zip` (2) | high | puppeteer, only when it downloads a browser | no: the image installs its browser another way | No fixed version exists. Dismiss: "Vulnerable code is not actually used" |
| `proxy-addr` (1) | critical | express (web server) | web server | Refresh (job 2) |
| `crypto-js` (1), `decode-uri-component` (2) | critical | the optional maps plugin's library | yes | Refresh (job 2) |
| `postcss-selector-parser` (1) | medium | the build step's style tool | build only | Refresh (job 2) |
| `@babel/traverse` (1), `@babel/core` (1), `braces` (1), `browserslist` (1), `js-yaml` (5) | critical | test and lint tools | no | Refresh (job 2) |
| `@octokit/request`, `request-error`, `plugin-paginate-rest` (1 each) | medium | `@actions/github` 5 | yes | Major upgrade to `@actions/github` 9, after a review (job 10) |
| `@faker-js/faker` (1) | high | listed as a dependency, used for test data | yes, but the affected function is never called | Dismiss: "Vulnerable code is not actually used"; major upgrade later |
| `vue` (1) | low | the web pages | web server | Vue 3 is a rewrite; dismiss: "Risk is tolerable to this project" |

Trying the fixes in a scratch copy: a lock file refresh plus overrides for `tar`, `tar-fs`, `ws` and `basic-ftp` cleared every alert except the `@octokit` trio, `faker`, `extract-zip`, `vue` and part of `glob`/`minimatch`. The lint check passed; the test suite was not run there, so CI has to prove it. The automatic `npm audit fix` also tried to move the image library `canvas` back from 2.11 to 2.7, which job 2 must not accept.

Renovate does not open pull requests for most of these, because they are packages inside other packages and no lock file upkeep is set up. That is why they have piled up.

## What Scorecard is likely to add

The Scorecard workflow (PR #73) will add its own code scanning alerts after its first run. Expected low scores, and what fixes them:

- **Branch-Protection, Code-Review:** the `main-protection` ruleset exists but is turned off. Turning it on is a setting only Sean can change. Code-Review also wants a second reviewer, which a one-person project can't have.
- **Pinned-Dependencies:** the Docker base image is not pinned to a digest, and Deno is installed with `curl | sh` (job 7).
- **Token-Permissions:** the spelling workflow's comment job has write access to the repository's contents (job 9).
- **Vulnerabilities:** one finding per open advisory, falling as jobs 2 and 3 land.
- **CII-Best-Practices:** low until the Best Practices form is filled in.
- **Maintained:** low until the repository is 90 days old (around mid-February 2027). Time fixes it.
- **Fuzzing, Contributors:** low, and not worth chasing for this project.

## Order of work

Each job is one pull request with its own plan for Sean to approve.

1. **Web server sign-in redirect and cache-reset password** (alerts 4 and 6, plus the `Math.random()` password). Only allow a same-site path as the redirect target, read `from` from the right parameter, and make the cache-reset password with a secure random function. Checked by focused tests with hostile addresses (`javascript:...`, `//other.site`), then the full suite. Low risk.
2. **Lock file refresh** within the versions already allowed: `proxy-addr`, `crypto-js`, `decode-uri-component`, `postcss-selector-parser` and the test tools. Keep `canvas` at 2.11. Checked by CI (the Docker build and every test), and by counting Dependabot alerts before and after. Medium risk: about 2,000 lock file lines move. Land it between Renovate merges.
3. **Overrides** in `package.json` for `tar`, `tar-fs`, `ws` and `basic-ftp`, each with a "remove when" note in `docs/dependencies.md`. Not `glob`: the test tools still need its old version. Checked by CI, which renders through the browser, and by `npm ls` showing one fixed version of each. Medium risk; any one override can be dropped on its own.
4. **Small code fixes** for alerts 9, 10, 11, 12 and 16: encode the user name, use a private temporary folder, and use `crypto.randomUUID()`. Low risk.
5. **Delete the unused upstream scripts** in `.github/scripts/` (closes alert 17). Already on the roadmap. Low risk.
6. **Sean dismisses the rest** in the GitHub interface, with the reasons above, once jobs 1 to 5 have landed.
7. **Pin the Docker base image and the Deno install.** Medium risk: it changes the image the Action runs in.
8. **Settings only Sean can change:** turn on the `main-protection` ruleset with the five checks required, secret scanning with push protection, read-only workflow token. These are already on the roadmap.
9. **Workflow tidy-up:** narrow the spelling workflow's write access. Workflow files need the plan to say so.
10. **Major upgrades, one at a time, each after a review in `docs/reports/`:** `@actions/github` 9, puppeteer 25 (already skipped on purpose), faker 10, Vue 3.

## Best Practices status

The answers for the project 16966 form were drafted at the same time. From the repository as it is today:

- **Baseline Level 1:** 17 of 24 controls met. The gaps are branch protection (the ruleset is off) and three answers only Sean can give: two-factor sign-in, secret scanning, and the workflow token setting.
- **Baseline Level 2:** 13 of 19 met. The gaps are a required sign-off check and required status checks.
- **Passing badge:** 45 of 67 met. 10 are not met: open vulnerabilities and code scanning alerts (this plan), no version tags or releases, no test coverage measurement, no dynamic testing, the lint check hiding warnings, and the cache-reset password (job 1).
- **Silver badge:** 30 of its own 55 met. It needs Passing first. Some items can't be met by a one-person project, such as a second maintainer.

Jobs 1 to 5 and Sean's settings in job 8 turn most of the "not met" answers into "met".

## Not covered

The Docker image's own operating system packages: Dependabot doesn't scan them, so neither list shows them. A container scan could be a later job.
