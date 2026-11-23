# Roadmap

This fork carries fixes for the unmaintained upstream project (lowlighter/metrics). Nothing here goes back upstream.

## Done

- Stack Overflow test stand-in: the user-account pattern now matches the plugin's real request, so the test no longer reaches the live Stack Exchange site (which was blocking GitHub's test servers); a new test checks every request the plugin makes gets a stand-in (PR #104)
- Markdown template rendered in one pass: the `{{ }}` and `{% %}` shortcuts are translated to `<% %>` and the template is rendered once, so text from plugin data is never run as template code; tests cover injected text, every documented syntax, escaped brace tags and large unclosed templates; the shipped examples render byte-identical (PR #107)
- Web server refuses markdown output (403) unless its settings turn on the extra feature `metrics.run.user.template`, since a request chooses the template, which is code; logged-in sessions' extra features no longer leak into later requests (PR #109)
- eslint 10, express 5 and file-type 22 reverted: they were merged while lint failed, so their tests never ran, and they broke lint and the web server (PR #114)
- `@actions/core` 3.0.1, with `import * as core` in the Action and the languages analyzer (version 3 has no default export) (PR #110)
- `@twemoji/parser` 17.0.2, with emoji matches that have no image skipped in `svg.twemojis`, so characters like ✌️ no longer crash emoji images; a test covers it (PR #111)
- Extra features enforced for core options: the permission check found no requirement for them, so a request's own `extras.css`, `extras.js` and `verify` were allowed on any web server; old extras flags no longer add to the shared feature list (PR #117)
- Token options checked: the steam, chess and splatoon plugins now check the extra features their token options declare, and a test fails if any declared feature is never checked (PR #121)
- Feature list in every form: presets and the `/.extras` page no longer fail when the server's extra feature list is `true`, `false` or unset (PR #120)
- Browsers closed on every path: the nine places that start their own browser (achievements, 16personalities, music, skyline, starlists, support, topics, screenshot, insights output) close it in a `finally` block, with tests for achievements, music and topics; the main test part 2 now peaks at 301 processes instead of running out at 829 on this machine (PR #100)
- Puppeteer 25.18.1: full Chrome path in the `Dockerfile`, the root install script and the last three overrides removed, PDF output kept a real PDF (`Buffer.from`) with a new test; `npm audit` 18 to 12 findings (9 to 3 high); replaces Renovate's #71 (PR #98)
- `tar` override removed: after `canvas` left (PR #94), the only users of `tar` (`node-gyp`, `cacache`) ask for `^7.4.3`, so the lock file keeps the fixed 7.5.23 on its own and future fixes arrive through normal updates; three overrides remain (PR #96)
- Secret scan: a new check runs gitleaks 8.30.1 (download checked against its checksum) over the whole git history on every pull request and push to `master`; `.gitleaks.toml` adds exceptions only for the exact reviewed stand-in values (mock log text, the music plugin's public web key); `CONTRIBUTING.md` says what to do when it fails. Sean turned on Secret Protection and Push protection. Closes issues #54 and #59 (PR #95)
- Animated GIF images in the Docker image: `gif()` builds them with `sharp` instead of `gifencoder`, which npm dropped in the image because its dependency `canvas` couldn't install, so the skyline animation was a blank 1-pixel image; `gifencoder`, `png-js`, `canvas` and 20 helper packages removed; 6 focused tests of `gif()` (PR #94)
- `@actions/github` 9 (job 10 of the findings plan, first of its major upgrades): the Action's entry point loads it as a module namespace (version 9 has no default export, so Renovate's #79 alone stopped every Action run at start-up); `@actions/github` 9.1.1, and `@octokit/rest` 20.1.2 and `@octokit/graphql` 7.1.1 within their ranges, so no old `@octokit/request`, `request-error` or `plugin-paginate-rest` is left (Dependabot alerts 13 to 15); npm audit 25 to 18 (PR #91)
- `minimatch` refresh: seven old copies of the file-pattern matcher (3.1.2 and 5.1.6, under the linter, test tools, `glob`, `jake` and `purgecss`) updated to 3.1.5 and 5.1.9 within their allowed versions, closing Dependabot alerts 32 to 37; only `package-lock.json` changed (PR #90)
- Embed page image address: the user name is encoded in the address the "generate" button loads the image from, the last request code scanning alert 9 pointed at after job 4; 2 more focused tests (PR #89)
- Dependency overrides (job 3 of the findings plan): `package.json` makes npm use fixed versions of `tar` (7.5.23), `tar-fs` (3.1.3, for puppeteer only), `ws` (8.23.0) and `basic-ftp` (6.2.6), which puppeteer and the image library held at vulnerable versions; `tar-fs` 2.x and `ip` updated within their allowed versions; npm's audit findings 34 to 25, none critical; each override's reason and removal condition in `docs/dependencies.md` (PR #85)
- Unused upstream scripts removed (job 5 of the findings plan): `.github/scripts/release.mjs`, `markdown_example.mjs`, `presets_examples.mjs` (code scanning alert 17) and `preview.mjs`, with the `presets` and `preview` commands and their ignore entries; `build.mjs` and `quickstart/` stay (PR #87)
- Small code fixes (job 4 of the findings plan): the embed and insights pages encode the user name in their requests (code scanning alerts 9, 10, 11); the languages plugin saves fetched public signing keys in a private temporary folder that is removed afterwards, skips keys whose id isn't hexadecimal, and carries on if the folder can't be made (alert 12); its fallback id is a random UUID (alerts 16 and 5); 12 focused tests (PR #86)
- Lock file refresh (job 2 of the findings plan): indirect packages updated to fixed versions within the versions already allowed (`proxy-addr`, `crypto-js`, `postcss-selector-parser`, the test tools' `@babel` packages, `braces`, `browserslist`, the old `js-yaml` copy); npm's audit findings 43 to 34, critical 4 to 1; nothing in `package.json` changed (PR #82)
- Sign-off check: a new **DCO sign-off** check fails a pull request when one of its commits has no `Signed-off-by` line (merge commits and Renovate's or Dependabot's commits are left out); named in the repo's guidelines, `CONTRIBUTING.md` and `docs/security.md` (PR #78)
- Web server sign-in made safe (job 1 of the findings plan): the page after GitHub sign-in only follows a return address on the same site (no more `javascript:` or other-site redirects, code scanning alerts 4 and 6); the server keeps the real return address (it read the wrong parameter) and only a same-site one; the sign-in page no longer sends `from=null`; the cache-reset password comes from secure random bytes; 30 focused tests (PR #77)
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
- **16personalities plugin:** it scrapes the live website, which has changed, so it likely no longer works for users; its test is skipped. Fix or retire it.
- **Formatter check:** six files aren't formatted (`analyzer.mjs`, `action/index.mjs`, `metrics/utils.mjs` and three `.github/scripts/` files). CI no longer reformats before testing (PR #43); format them, then add a `dprint check` step to lint, after deciding on Renovate's dprint update (#35).
- **After merging #6:** check that a real Apple Music or Spotify playlist no longer shows the "Explicit" label in titles. The label is only removed when it's clearly separate from the title (see the decisions log).
- **Private-repository check after PR #36:** the next real metrics run should still show languages from private repositories (simple-git 4 accepts the token clone address in local checks, but no real private clone was tried).
- **Minimum Node version:** sanitize-html 2.18.2 needs Node 22.12 or newer. CI and the Docker image use Node 24; `package.json` doesn't state an `engines` minimum.
- **After PR #39:** check on Renovate's next run that faker, Vue and vue-prism-component majors don't come back as PRs, and that a security PR still arrives without the 3-day wait.
- **Vulnerabilities no Renovate PR covers:** after the puppeteer 25 upgrade, `npm audit` reports 12 findings (3 high: `@faker-js/faker`, `decode-uri-component`, `query-string`). Each needs its own look.
- **Vue 3 for the web pages** (optional): a real migration of the four pages and the Prism helper, if the web server matters. Remove the major-update block in `renovate.json` when done (same for faker after a test migration).
- **Unpinned Docker inputs:** the base image and the Deno install script aren't pinned (both are inherited from upstream). Pin the base image by digest and Deno to a release.
- **Upgrades skipped on purpose for now:** jsdom 28. (file-type 21 is now in Renovate's #23.)
- **Upgrades reverted in PR #114, each needing its own job:**
  - **eslint 10:** done: the settings now live in `eslint.config.mjs` (this replaces Renovate's #115). It also drops an old schema package that brings a moderate audit finding.
  - **express 5:** `/about/*`, `/insights/*` and `/embed/*` need named wildcards, and `/:login/:repository?` needs the new optional form. `req.query` is read fresh on each access, so the route's writes to `req.query.template` and `req.query.repo` (`source/app/web/instance.mjs`) must go to a copy.
  - **file-type 22:** reviewed: no code change needed, recommended at 22.3.0 for Renovate's #116 (`docs/reports/2026-11-23-file-type-22-review.md`).
- **Two lint rules are off:** `no-useless-assignment` and `preserve-caught-error` were added to eslint's recommended set and are off to keep the checks unchanged. They find six spots: `source/app/action/index.mjs:582` and `:584`, `source/app/metrics/index.mjs:238`, `source/plugins/isocalendar/index.mjs:81`, `source/plugins/languages/analyzer/analyzer.mjs:121` and `source/plugins/steam/index.mjs:32`. Fix them, then turn the rules on.
- **Old formatting rules:** eslint 10 marks the formatting rules in `eslint.config.mjs` (spacing, quotes, semicolons and the like) as old, and a later major removes them. Before then, move them to a separate style package, or run the repo's formatter settings (`.github/config/dprint.json`) in CI.
- **SVG check written backwards:** `source/app/metrics/index.mjs` (~line 219) runs the SVG verification only when `libxmljs2` failed to load (`if (!libxmljs)`), so it never verifies and crashes when the library is missing.
- **New Renovate majors to review before merging:** #108 jest 30, #112 js-yaml 5, #113 jsdom 31.
- **Feature checks the scan can't see:** the test that every declared feature is checked reads each plugin's own file. A plugin that checks the same option in two places passes if only one is left.
- **Lint misses files when the pattern is expanded by the shell:** `npm run linter` passes `source/**/*.mjs` without quotes. If a file is ever added one folder deep (like `source/plugins/x.mjs`), the shell expands the pattern itself and lint checks only that file. Putting the pattern in quotes fixes it.
- **Requests fetching addresses:** presets (when enabled) and some plugin options (when the server enables those plugins) fetch any address a request gives.
- **Wrong error code:** "template not supported" errors are returned as 500 instead of 400 (the error check in `instance.mjs` doesn't match the message).
- **PDF output loads raw HTML:** `markdown-pdf` loads the rendered HTML into the browser without cleaning it (`svg.pdf` in `source/app/metrics/utils.mjs`), so raw HTML printed from plugin data can load there. Look at it separately.
- **`{% %}` isn't documented:** the markdown template's README covers `{{ }}` but not `{% %}`, which the code supports.
- **Markdown dry run still writes:** `source/app/action/index.mjs` post-processes markdown output through the commit path even when `dryrun` is set.
- **`emoji-name-map` stays on 1.2.9:** 2.x drops 513 names used today, including `ballot_box` (GitHub's default Polls category). Later, build the lookup from GitHub's own emoji list.
- **Emoji images from a moving address:** twemoji SVGs are fetched from a CDN path ending in `@latest`, outside the lock file's protection.
- **Spotify playlist test depends on the live site:** "Random track from playlist" opens the real Spotify page in the browser even with mocked data (`source/plugins/music/index.mjs`), so it can fail by chance (it did once on PR #96, then passed). The web instance also hides the plugin's own error behind "An error occurred during rendering". Mock the page and keep the original error in the log.
- **Repository mode in `activity`:** collaborators' pushes are still hidden (an older upstream gap, not caused by the API change).
- **Stale generated file under `.github/`:** the compatibility table. The examples workflow is gone (PR #10).
- **Shared username filter:** `filters.text` lowercases the text but not the patterns, so callers that pass a mixed-case pattern never match. Fixed where it broke (recently used languages); a general fix would touch many plugins.
- **Activity event types not seen live:** commit comments and wiki edits couldn't be checked against GitHub's current event format.

## Security and project health

Toward OpenSSF Baseline Levels 1 and 2 and the Best Practices Passing and Silver badges (project 16966). One GitHub issue (label `openssf`) tracks each open item.

- **Settings only Sean can change:** turn on the `main-protection` ruleset for `master` (pull requests and the CI checks required, no force-push or deletion); Actions workflow permissions read-only; secret scanning with push protection; Dependabot alerts on and Dependabot security updates off; the repository description (still upstream's); two-factor sign-in. Private vulnerability reporting is already on.
- **After the sign-off check is merged:** Sean adds **DCO sign-off** to the `main-protection` ruleset's required checks; then the Best Practices sign-off answer and issue #56 are updated. The check only sees the first 250 commits of a pull request (a GitHub limit); making it fail when there are more belongs in the house standard's workflow, which every repository copies.
- **New CI checks** in their own job: dependency review, secret scanning. Sean applies the workflow files; check that Renovate pull requests still pass all checks before merging more.
- **`decode-uri-component`** (2 alerts, the maps plugin's library): no fix is possible through an override (the fixed 0.5 is a newer module format that the maps library's `query-string` 7 can't load), and the maps library only builds query strings and never parses them, so the vulnerable decoding never runs; dismiss as "Vulnerable code is not actually used" (part 2 of the dismissals).
- **`crypto-js` is no longer maintained** (the maps plugin's library uses it); the current version has no known vulnerability, but a replacement belongs with that library's next upgrade.
- **Code scanning and Dependabot findings:** worked through in the order of `docs/reports/2026-11-21-security-findings-plan.md` (ten jobs: the web server's sign-in redirect first, then the lock file refresh and overrides, small code fixes, deleting upstream scripts, Sean's dismissals, Docker pinning, settings, a workflow tidy-up and the reviewed major upgrades).
- **The Best Practices form** for project 16966: answers drafted for Baseline 1 and 2, Passing and Silver (summary in the same report); Baseline 1 and 2 and Silver are saved on the site (2026-11-21); Passing still needs saving; Sean answers the few only he can (two-factor sign-in, secret scanning, workflow token, his own security knowledge).
- **`renovate.json` from the house standard:** pinning action updates to commits and grouping the code scanning action. Pinning makes Renovate edit workflow files, which the merge rule leaves for Sean.
- **After the first Scorecard run:** run it once by hand from the Actions tab, then sort its code scanning alerts in with the others. Its Branch-Protection check can't see every setting without an admin token; none is planned. Renovate will propose `ossf/scorecard-action` v2.6.0 (too new for the 3-day rule when the workflow was added).
- **Action cleanup:** remove the `.env` file also when a run fails, and rebuild the fork's image when the commit changes (it is tagged by package version, so a persistent runner can reuse an old image).
- **Web server:** the debug log prints its settings, tokens included; mask them. The insights routes don't check `restricted` or `maxusers`. The sign-in start (`/.oauth/authenticate`) has no rate limit, and its list of pending sign-ins only shrinks when a sign-in finishes, so many unfinished sign-ins grow memory. The session reaches the browser in the redirect address, so it stays in the browser's history (upstream design).
- **Languages plugin temporary folders:** the analyzer still clones repositories into folders with a predictable name in the shared temporary folder (`analyzer.mjs`, not flagged by code scanning); the same private-folder approach as the signing keys would fit. Its `gpg` commands also break on a temporary folder path with spaces (long-standing).
- **Sanitising review:** check every rendering path for outside text (planned in `docs/assurance-case.md`).
- **Known gaps the form will show:** no formatter check in CI, unpinned Docker base image and Deno install, no test coverage measurement, the older audit findings (see Next), signed releases (none yet).

## Not planned

- New plugins (Shikimori, Letterboxd)
- The upstream "v4" wish-list and old feature requests
- Support questions with no reproducible bug
