# Pass map

| Date | Job | What shipped or was found | PR |
|---|---|---|---|
| 2026-11-20 | upstream-fixes | Triaged all 73 open upstream items (32 issues, 41 PRs). Plan and these notes. | #2 |
| 2026-11-20 | upstream-fixes | Docker image builds on Node 24; ruby/`licensed` dropped; `libxmljs2` 0.37 | #3 |
| 2026-11-20 | upstream-fixes | Safe dependency updates; security warnings in the libraries the action uses: 59 to 45 | #4 |
| 2026-11-20 | upstream-fixes | Push events: commits fetched via compare API; Projects (classic) removal handled | #5 |
| 2026-11-20 | upstream-fixes | lines, music, wakatime, steam, notable fixes; new steam and notable options | #6 |
| 2026-11-20 | upstream-fixes | #4 merged into its base branch by mistake; same commit re-landed on master | #7 |
| 2026-11-20 | real-run-fixes | Recent activity: pull-request details fetched only for shown events (cached, capped, one lookup per PR per run). Recently used languages: case-insensitive username match, correct commit count | #8 |
| 2026-11-20 | fork-workflows | Upstream-only workflows removed; one CI workflow (lint, Docker build and stand-in tests, code scanning) passing on the fork for the first time; labeler and spelling fixed; every action pinned to an exact commit | #10 |
| 2026-11-20 | spelling-dict | 35 dictionary entries added and 3 replaced so the spelling check passes; master's main CI passed in full for the first time | #11 |
| 2026-11-20 | spelling-renovate | `renovatebot` (from Renovate's setup file) added to the spelling dictionary | #27 |
| 2026-11-20 | spelling-openssf | `openssf` (a Renovate label) added to the spelling dictionary | #30 |
| 2026-11-20 | renovate-review | Review of Renovate's first 15 update PRs: 11 safe to merge, 2 need a fix (sanitize-html 2.18.2, simple-git imports), 2 to close (faker, Vue); report in `docs/reports/2026-11-20-renovate-review.md` | #33 |
| 2026-11-21 | renovate-fixes | sanitize-html 2.18.2 (replaces Renovate's #20) and simple-git 4.1.0 with the seven imports switched to its named export (replaces #25) | #36 |
| 2026-11-21 | renovate-skip-majors | #22 (faker 10) and #26 (Vue 3) closed; `renovate.json` skips major updates for faker, Vue and vue-prism-component, and adds a 3-day wait for ordinary updates | #39 |
| 2026-11-21 | merge-rule-renovate | The repo's guidelines, with the rule for when the team may merge a Renovate PR (only Renovate's own verified commits, only `package.json` and `package-lock.json`, every check green, new version at least 3 days old, majors only if a review names them, one at a time) | #40 |
| 2026-11-21 | spelling-dayjs | `dayjs`, `automerge` and `minimumreleaseage` (from the notes and config of #36, #39 and #40) added to the spelling dictionary (`dayjs` in #41; the other two and these notes in #42, because #41 merged before GitHub picked up its last push) | #41, #42 |
| 2026-11-21 | ci-workflow-update | `test.yml`: lint without install scripts, code scanning no longer waits for lint, formatter step removed, job time limits; two words its plan used added to the spelling dictionary | #43, #46 |
| 2026-11-21 | tests-review | Review of `tests/`: the main suite only checks that nothing crashes, the fork's focused tests aren't run in CI, the SVG check and placeholder tests don't work, unmocked requests reach the internet, no secrets; report in `docs/reports/2026-11-21-tests-review.md` | #47 |
| 2026-11-21 | openssf-bootstrap | Project documents for OpenSSF: security policy with private reporting, contributing guide, conduct contact, governance, support, changelog, 12 pages in `docs/`, issue forms, README badges for Best Practices project 16966; security wording checked against the code | #49 |
| 2026-11-21 | tests-speed | CI test step from 32 to about 8 minutes: four test files side by side, a 1-second lines delay in tests, community template cases run alone afterwards; same 728 tests and results | #48 |
| 2026-11-21 | focused-tests-ci | The fork's 15 focused tests (`tests/plugins/`) run in CI, in the same run as the metrics test files; CI totals 344 passed, 399 skipped | #68 |
| 2026-11-21 | drop-upstream-tests | Upstream-only `tests/ci.test.js` and `tests/presets.test.js` removed, with the `test-contrib` and `test-presets` commands; notes for #68 | #69 |
| 2026-11-21 | quiet-ci-warnings | PageSpeed plugin reads addresses with Node's `URL` class instead of `url.parse()`, with 3 focused tests; build-only installer setting in the Dockerfile; CI log has no deprecation warnings or installer lines; CI totals 347 passed, 399 skipped | #70 |
| 2026-11-21 | scorecard-workflow | OpenSSF Scorecard workflow (weekly, on pushes to `master`, on branch rule changes and on demand; results to code scanning and the public badge); Scorecard badge in the README; one line in `docs/security.md` | #73 |
| 2026-11-21 | security-findings-plan | Plan for the 18 code scanning alerts (2 real, in the web server's sign-in redirect) and the 56 Dependabot alerts (none in the fork's own code), in ten jobs; Best Practices answers drafted for all four checklists | #76 |
| 2026-11-21 | oauth-redirect-fix | Sign-in redirect follows only same-site addresses; server keeps the real, same-site return address; no `from=null`; secure random cache-reset password; 30 focused tests | #77 |
| 2026-11-21 | dco-check | **DCO sign-off** check on every pull request (house standard workflow; merge, Renovate and Dependabot commits left out); named in the guidelines, contributing guide and security page | #78 |
