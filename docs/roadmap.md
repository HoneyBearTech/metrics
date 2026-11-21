# Roadmap

This fork carries fixes for the unmaintained upstream project (lowlighter/metrics). Nothing here goes back upstream.

## Done

- OpenSSF Scorecard workflow (`.github/workflows/scorecard.yml`): runs weekly, on pushes to `master`, when branch rules change and on demand; read-only token by default, every action pinned to a commit; results go to the code scanning page and to the public Scorecard badge in the README (PR #73)
- Quieter CI log: the PageSpeed plugin reads the website address with Node's `URL` class instead of the outdated `url.parse()` (no more deprecation warnings during the tests; an unreadable address now shows "Website URL is not valid"), with 3 focused tests; the Docker build tells the package installer nobody is there to answer, so its "unable to initialize" lines are gone (PR #70)

- Project documents and OpenSSF groundwork: a security policy with private reporting, contributing guide, code of conduct contact, governance, support and changelog files, project documentation pages in `docs/`, bug and feature forms, and the README badges for Best Practices project 16966 (PR #49)

- Upstream-only test files removed: `tests/ci.test.js` (upstream's checks on outside contributions, which failed on every fork change) and `tests/presets.test.js` (checked upstream's presets), with their two `package.json` commands, so `npm test` works on fork branches (PR #69)
- The fork's focused tests (`tests/plugins/`: recent activity, recently used languages, lines) run in CI, in the same run as the other tests: 15 more tests, about 15 seconds (PR #68)

- Faster test step: 32 minutes down to about 8. The tests run in four files side by side (one per core of the CI machine), the lines plugin waits 1 second in tests instead of 30, and the community template cases run on their own afterwards. Same 728 tests, same results (PR #48)

- CI faster and safer: lint installs without install scripts (18 seconds instead of 10.5 minutes), code scanning runs alongside lint, the formatter step that changed files before testing is gone, every job has a time limit (PR #43)

- The fork's workflows: current actions pinned to exact commits, upstream-only jobs removed, one CI workflow passing on master (PR #10)

- Docker image builds again on Node 24 (PR #3)
- Safe dependency updates within current major versions (PR #4, landed on master through PR #7)
- Plugins repaired after GitHub API changes: activity, habits, recently used languages, code, achievements, projects (PR #5)
- Small plugin fixes: lines, music, wakatime, steam, notable (PR #6)
- First real run on the owner's profile (2026-11-20): habits, code snippet, achievements, projects, notable, calendar and most-used languages show real data.

- Recent activity on trimmed pull-request events, and recently used languages for usernames with capitals (PR #8), confirmed by a real run.

- Spelling check passing: flagged words added to its dictionary (PR #11, `renovatebot` from Renovate's setup in PR #27, and `openssf` from its label config in PR #30; `dayjs`, `automerge` and `minimumreleaseage` from the Renovate jobs in PR #41)

## In progress

- **Merging the safe Renovate PRs one at a time** under the merge rule in the repo's guidelines (PR #40): #21 merged; then #23, #18, #17, #16, #19, #31, #32, then #24 and #29. #28 (a workflow update) stays for Sean.

- **Renovate's first 15 update PRs** (review: `docs/reports/2026-11-20-renovate-review.md`): 11 to merge one at a time (7 now, 4 once their build and test pass), 2 needing a fix first (fixed in PR #36), 2 to close.

## Next

- **Test suite fixes** (review: `docs/reports/2026-11-21-tests-review.md`). Small ones first: the inverted SVG check, placeholder tests that switch on their plugin, and mocks that never match. Later: unmocked requests should fail instead of reaching the internet, real checks on output, a fixed faker seed.
- **Community template cases never run:** both cases in `tests/cases/community.template.yml` are skipped for every template (its compatibility table), on master too, so installing a community template is untested. When they're turned on, they need network access to clone from GitHub.
- **Test timings for the split:** `tests/metrics/weights.json` holds each case's measured time, used to share the cases evenly between the four test files. A new case gets a default of 10 seconds. Refresh the file from a CI log if one test file becomes much slower than the others.
- **PageSpeed address handling:** an address starting with capital `HTTPS://` still gets a second `https://` added (the prefix check is case-sensitive), and the address is put into the request to Google without encoding. Both predate PR #70.
- **npm warnings in the build log:** deprecated packages, the security audit count and install scripts awaiting approval. Dependency upkeep, through Renovate and its reviews.
- **Notable counting bug:** issues and pull requests in the same repository count as one (`source/plugins/notable/index.mjs:50` and `:65`). No test covers those modes.
- **Spelling dictionary upkeep:** new words added later make the spelling check fail until they're added to `.github/actions/spelling/expect.txt`. Spelling isn't a required check, so a PR with a red spelling check can still be merged; making it required (a repo setting Sean controls) would catch this before merging. About 30 old entries are no longer used and could be removed.
- **Leftover upstream scripts:** `.github/scripts/release.mjs`, `markdown_example.mjs`, `presets_examples.mjs` (behind `npm run presets`) and `preview.mjs` still refer to the upstream project and are no longer used by any workflow. Delete or rewrite them in a later cleanup.
- **16personalities plugin:** it scrapes the live website, which has changed, so it likely no longer works for users; its test is skipped. Fix or retire it.
- **Formatter check:** six files aren't formatted (`analyzer.mjs`, `action/index.mjs`, `metrics/utils.mjs` and three `.github/scripts/` files). CI no longer reformats before testing (PR #43); format them, then add a `dprint check` step to lint, after deciding on Renovate's dprint update (#35).
- **After merging #6:** check that a real Apple Music or Spotify playlist no longer shows the "Explicit" label in titles. The label is only removed when it's clearly separate from the title (see the decisions log).
- **Private-repository check after PR #36:** the next real metrics run should still show languages from private repositories (simple-git 4 accepts the token clone address in local checks, but no real private clone was tried).
- **Minimum Node version:** sanitize-html 2.18.2 needs Node 22.12 or newer. CI and the Docker image use Node 24; `package.json` doesn't state an `engines` minimum.
- **After PR #39:** check on Renovate's next run that faker, Vue and vue-prism-component majors don't come back as PRs, and that a security PR still arrives without the 3-day wait.
- **Vulnerabilities no Renovate PR covers:** about 40 of the lockfile audit's 52 findings, mostly inside puppeteer (needs 25), tar, crypto-js and express. Each needs its own look.
- **Vue 3 for the web pages** (optional): a real migration of the four pages and the Prism helper, if the web server matters. Remove the major-update block in `renovate.json` when done (same for faker after a test migration).
- **Unpinned Docker inputs:** the base image and the Deno install script aren't pinned (both are inherited from upstream). Pin the base image by digest and Deno to a release.
- **Upgrades skipped on purpose for now:** puppeteer 25 (needs a full Chrome path), jsdom 28, eslint 9. (file-type 21 is now in Renovate's #23.)
- **Repository mode in `activity`:** collaborators' pushes are still hidden (an older upstream gap, not caused by the API change).
- **Stale generated file under `.github/`:** the compatibility table. The examples workflow is gone (PR #10).
- **Shared username filter:** `filters.text` lowercases the text but not the patterns, so callers that pass a mixed-case pattern never match. Fixed where it broke (recently used languages); a general fix would touch many plugins.
- **Activity event types not seen live:** commit comments and wiki edits couldn't be checked against GitHub's current event format.

## Security and project health

Toward OpenSSF Baseline Levels 1 and 2 and the Best Practices Passing and Silver badges (project 16966). One GitHub issue (label `openssf`) tracks each open item.

- **Settings only Sean can change:** turn on the `main-protection` ruleset for `master` (pull requests and the CI checks required, no force-push or deletion); Actions workflow permissions read-only; secret scanning with push protection; Dependabot alerts on and Dependabot security updates off; the repository description (still upstream's); two-factor sign-in. Private vulnerability reporting is already on.
- **New CI checks** in their own job: dependency review, secret scanning, a sign-off check. Sean applies the workflow files; check that Renovate pull requests still pass all checks before merging more.
- **Code scanning and Dependabot findings:** worked through in the order of `docs/reports/2026-11-21-security-findings-plan.md` (ten jobs: the web server's sign-in redirect first, then the lock file refresh and overrides, small code fixes, deleting upstream scripts, Sean's dismissals, Docker pinning, settings, a workflow tidy-up and the reviewed major upgrades).
- **The Best Practices form** for project 16966: answers drafted for Baseline 1 and 2, Passing and Silver (summary in the same report); Baseline 1 and 2 and Silver are saved on the site (2026-11-21); Passing still needs saving; Sean answers the few only he can (two-factor sign-in, secret scanning, workflow token, his own security knowledge).
- **`renovate.json` from the house standard:** pinning action updates to commits and grouping the code scanning action. Pinning makes Renovate edit workflow files, which the merge rule leaves for Sean.
- **After the first Scorecard run:** run it once by hand from the Actions tab, then sort its code scanning alerts in with the others. Its Branch-Protection check can't see every setting without an admin token; none is planned. Renovate will propose `ossf/scorecard-action` v2.6.0 (too new for the 3-day rule when the workflow was added).
- **Action cleanup:** remove the `.env` file also when a run fails, and rebuild the fork's image when the commit changes (it is tagged by package version, so a persistent runner can reuse an old image).
- **Web server:** the debug log prints its settings, tokens included; mask them. The cache-reset password is made with `Math.random()`, which is not safe for secrets (job 1 of the findings plan). The insights routes don't check `restricted` or `maxusers`.
- **Sanitising review:** check every rendering path for outside text (planned in `docs/assurance-case.md`).
- **Known gaps the form will show:** no formatter check in CI, unpinned Docker base image and Deno install, no test coverage measurement, the older audit findings (see Next), signed releases (none yet).

## Not planned

- New plugins (Shikimori, Letterboxd)
- The upstream "v4" wish-list and old feature requests
- Support questions with no reproducible bug
