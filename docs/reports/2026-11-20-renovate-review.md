# Renovate review - 2026-11-20

What to do with the 15 update pull requests Renovate opened after its setup was merged. Each pull request was read by a researcher, then reviewed again from a security angle and in an independent audit. Where reviewers disagreed, the claim was checked directly against the package or the code.

Nothing was merged, closed or changed on GitHub during this review.

## In short

| What to do | Pull requests |
| --- | --- |
| **Merge now** (checks pass, low risk) | #21 sharp, #23 file-type, #18 js-yaml, #17 compression, #16 ejs, #19 prismjs, #28 code-scanning action |
| **Merge once its build and test finish green** | #24 minimatch, #29 Primer CSS, #31 Octicons, #32 chess.js |
| **Needs a small fix first** | #20 sanitize-html (take 2.18.2, not 2.18.0), #25 simple-git (six imports need changing) |
| **Close** | #22 faker, #26 Vue |

All but #28 change the same lockfile, so merge them **one at a time** and let Renovate rebase the rest between merges.

## Merge now

Checked and safe as they are, in order of how much they matter:

1. **#21 sharp 0.32.3 → 0.35.5.** Fixes four high-severity bugs in the image decoders. Metrics feeds them images downloaded from the internet (avatars, plugin images), so this one matters. The calls metrics makes (resize, PNG output) are unchanged; a test render on the new version worked. It also drops sharp's install script.
2. **#23 file-type 18.5.0 → 21.3.4.** Fixes a bug where a 55-byte crafted file makes the check loop forever; metrics runs it on every downloaded image. The one function metrics uses is unchanged.
3. **#18 js-yaml 4.1.0 → 4.3.2.** Fixes five bugs (slowdowns and a data-tampering bug) in the YAML reader, which also reads presets fetched from a web address. All 163 YAML files in the repo read the same on the new version.
4. **#17 compression 1.7.4 → 1.8.2.** Fixes a high-severity memory leak, but only in the optional web server; the action never loads it.
5. **#16 ejs 3.1.9 → 3.1.10** and **#19 prismjs 1.29.0 → 1.30.0.** Medium-severity fixes that metrics can't realistically be hit by (templates are the repo's own; the Prism bug only exists in a browser). Harmless to take.
6. **#28 code-scanning action v4.39.3 → v4.39.4.** Ordinary patch. Still pinned to an exact commit, which was checked against the release; permissions unchanged.

## Merge once green

These were still waiting for a runner when the review finished. Nothing in them looks risky; merge each once its "Build and test" passes.

- **#24 minimatch 9.0.9 → 11.0.9.** Fixes a medium-severity slowdown. The import metrics uses still works; 99 sample patterns matched the same except two documented edge cases.
- **#29 @primer/css 21.0.9 → 21.5.1.** Metrics only reads one stylesheet from it for PDF output, which is still there. Might change PDF styling slightly.
- **#31 @primer/octicons 19.7.0 → 19.42.0.** All 784 icon sizes rendered on the new version.
- **#32 chess.js 1.0.0-beta.6 → 1.4.0.** Optional chess plugin; the calls it makes still work and a sample game read correctly.

## Needs a small fix first

- **#20 sanitize-html 2.11.0 → 2.18.0.** The most important security update here: metrics cleans text from GitHub with it before putting it in the image. But **2.18.0 has a new bug of its own**: a few thousand nested `<iframe>` tags make it crash, and the tests don't catch it. Version 2.18.2 fixes that and three more bypasses. **Fix:** move the lockfile to 2.18.2 (the current version range already allows it).
- **#25 simple-git 3.36.0 → 4.1.0.** Fixes three bugs rated high to critical, which metrics is unlikely to hit (it only runs fixed git commands). But **version 4 removes the import style metrics uses**, so the Docker build and the action would both fail to start. **Fix:** change six imports to the new form (`import {simpleGit as git} from "simple-git"`) in `source/app/action/index.mjs`, `source/app/metrics/utils.mjs`, `source/plugins/languages/analyzer/analyzer.mjs`, and three build scripts under `.github/scripts/`; plus one line in `tests/ci.test.js`. Then check that analysing private repositories still works.

These two fixes can be one team job: two small pull requests, each going through the usual plan and approval.

## Close

- **#22 faker 8 → 10.** Its build and test fail, and making it pass means rewriting how the test suite loads and renaming four functions across the test data and the web demo. Faker is only used for test and demo data, and the bug it fixes needs a function metrics never calls (`helpers.fake`). Not worth the work now. Close it and tell Renovate to skip faker's major versions.
- **#26 Vue 2 → 3.** A full rewrite of the framework the web pages use. Its checks pass only because the tests never open those pages: they'd break (the file the server sends no longer exists, all four pages start Vue the old way, and a helper component only works with Vue 2). The bug it fixes is low severity and needs untrusted templates, which metrics doesn't have. Close it and tell Renovate to skip Vue's major versions. Moving to Vue 3 properly would be its own job.

## Coming next from Renovate

About 30 more updates are queued (rate-limited) on the Dependency Dashboard (#14). The ones most likely to break metrics, each needing care rather than a quick merge: **puppeteer 25**, the **GitHub API client (octokit)** majors and **@actions/core 3 / @actions/github 9** (the action's own entry point), **express 5**, **eslint 10** (needs a new config format), **jest 30**, **marked 18**, **jsdom 31**, **svgo 4** and **Node 26** for the Docker image.

## Security notes

- **Supply chain: clean.** Every package comes from the public npm registry. No package changed contents without a version change, and none adds an install script.
- **Very new releases.** Some versions here are less than a week old (Vue 3.5.46 came out today). Renovate's config has no waiting period; adding one (for example 3 days, as the profile repo already uses) gives the community time to spot a bad release.
- **Problems no pull request covers.** A security audit of the lockfile lists 52 findings on master (6 critical). These pull requests fix about 11. The rest sit deeper, mostly inside **puppeteer** (needs the version 25 major), **tar** and **crypto-js** (pulled in by other packages), and the web server's **express**. They need their own follow-up.

## What wasn't checked

No Docker images were built and no install scripts were run during the review; the evidence is the pull requests' own CI, reading the packages, and small checks run on Node 24. Browser pages, PDF appearance and analysing a real private repository weren't tested.
