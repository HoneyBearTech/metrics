# Review of the tests folder (2026-11-21)

Sean asked: "I also want you to review everything in tests/".

Reviewed by two researchers (the test runners and cases; the mocks), the security review and an independent audit. They ran the small test files locally and read the latest CI log. The main findings were checked again against the code.

## In short

- **The main test suite proves that each plugin doesn't crash, and very little more.** It runs every plugin example 2 to 6 times (as the action, through the web server and as a placeholder). A test passes if the process exits cleanly, the page returns HTTP 200, or the result is any text. Nothing looks at what the image contains.
- **The tests that would catch a real regression in the fork's fixes never run in CI.** These are the 15 tests in `tests/plugins/` (activity, recently used languages, lines). They pass in about 45 seconds without Docker.
- **Some checks don't run at all, because of bugs:**
  - The "is this valid SVG" check is inverted, so it never runs.
  - The placeholder tests switch on no plugins.
  - A few mocks never match the request they were written for.
- **When a request has no mock, the "mocked" tests quietly call the real GitHub API and other live sites.** The plugins catch the resulting errors, so the tests still pass.
- **No secrets.** `tests/secrets.json` holds only placeholders such as `MOCKED_TOKEN`. Git history shows no real token was ever committed, and CI passes no secrets to the tests.
- **The review also found two bugs that no test catches:**
  - The notable plugin counts issues and pull requests wrongly.
  - The Last.fm mock calls a faker function that no longer exists.

## What the tests do today

- **CI runs one file.** `npm run test-metrics` (`jest tests/metrics.test.js`) runs inside the Docker image. The latest run had 728 tests: 329 passed and 399 were skipped. The skipped ones are plugin and template combinations that don't apply. The run took 29.4 minutes.
- **Where the test cases come from.** The build script (`.github/scripts/build.mjs`) generates `tests/cases/*.yml` from each plugin's `examples.yml`, with placeholder secrets filled in. That gives 54 files holding about 90 cases.
- **Mocks.** `tests/mocks/` stands in for the GitHub API (GraphQL and REST), other web services and a few libraries. It is loaded by the action and the web server themselves whenever mocked data is turned on, so it isn't only test code. **Don't delete it.**
- **Not run by anything:**
  - `tests/plugins/*.test.js`: the fork's focused tests.
  - `tests/ci.test.js`: upstream's contributor checks.
  - `tests/presets.test.js`: clones the upstream project's presets branch.

## Findings

Most important first. Each says what's wrong, where, and what it means.

1. **The fork's focused tests aren't in CI.**
   - **Where:** `package.json:11` limits `test-metrics` to `metrics.test.js`.
   - **What they cover:** trimmed pull-request events, failure caching and merge labels (activity), mixed-case usernames (languages), and error and section display (lines). All 15 pass on Node 24 in about 42 seconds.
   - **Meaning:** if one of those fixes broke again, CI wouldn't notice.
   - **Fix:** add `tests/plugins` to the `test-metrics` script. That needs no workflow change.
2. **The main tests can't see wrong or empty output.**
   - **Where:** `tests/metrics.test.js:134` and `:146` only check `true`, and the placeholder check (`:60`) accepts any string.
   - **Meaning:** a plugin that renders nothing, a wrong number or a missing section still passes. Failures a plugin catches itself are never seen either: activity, languages and notable all catch and continue.
   - **Traced cases:** five of the fork's changed plugins were traced from case to mock to code. In each one, a realistic regression would pass CI.
3. **The SVG check never runs.**
   - **Where:** `source/app/metrics/index.mjs:219` says `if (!libxmljs)` where it means `if (libxmljs)`.
   - **Meaning:** when the parser is installed (it always is) the check is skipped, and if it weren't installed the code would crash.
   - **Fix:** one character. Then run the suite once to see whether any current output is malformed.
4. **Placeholder tests switch on no plugins.**
   - **Where:** `tests/metrics.test.js:57` keeps the `plugin_` prefix on the keys, but the placeholder looks for `enabled.lines`, `enabled.activity` and so on (`source/app/web/statics/embed/app.placeholder.js:168`, `:1194`).
   - **Meaning:** every placeholder test checks nothing plugin-specific, whatever plugin it is named after.
5. **Unmocked requests go to the real internet.**
   - **Where:** `tests/mocks/index.mjs` passes any request it has no mock for to the real client: GraphQL, REST, `rest.request`, axios GET and POST.
   - **What it showed:** the review ran probes, and each unmocked call reached api.github.com and got "401 Bad credentials". Every action test makes several such calls through the base plugin. The posts tests read the live dev.to site, and achievements reads live github.com pages.
   - **Meaning:** tests depend on outside services being up, they're slower, and they pass for the wrong reason.
   - **Locally:** a run on a machine with a real token in its environment or `settings.json` could send that token to a real service. CI is safe here: no secrets reach the container.
6. **Mocks that never match.**
   - `BaseFieldRepositories`: the query file `source/plugins/base/queries/field.repositories.graphql:1` has no space before `{`, but the matcher (`tests/mocks/index.mjs:53`) requires one. The repository totals then come back as "not a number".
   - The notable history query (`source/plugins/notable/queries/commits.graphql`) has no query name, so no mock can match it. The notable "indepth" test never exercises the history count.
   - `base.user.x` has no mock at all.
7. **Lines test data doesn't reach the history graph.**
   - **Where:** the history case (`tests/cases/lines.plugin.yml`) includes only `lowlighter/metrics`, but the mock profile gives a random repository name. The contributor-stats mock (`tests/mocks/api/github/rest/repos/getContributorsStats.mjs:16`) also uses dates where the plugin expects seconds.
   - **Meaning:** the graph code is never tested.
8. **The lines tests wait 30 real seconds each.**
   - **Where:** `plugin_lines_delay: 30` in `source/plugins/lines/examples.yml`.
   - **Meaning:** they ran 15 times, for about 7 of the 29 minutes, close to the 60-second test limit.
   - **Fix:** a test-only delay of 1 second still exercises the same code path.
9. **Bugs found in code no test reaches.**
   - **notable:** `source/plugins/notable/index.mjs:50` writes `issues[repository]` but reads `issues[repositories]`. `repositories` is an on/off setting, so two issues in one repository count as one. The same mistake is at line 65 for pull requests. No test uses those modes.
   - **Last.fm mock:** `tests/mocks/api/axios/get/lastfm.mjs:116` calls `faker.random.number()`, which doesn't exist in faker 8. That mode would crash if a test used it.
   - **GPG key mock:** `datatype.hexadecimal(16)` is deprecated and returns one digit. It's used only by the languages indepth path.
10. **Upstream-only test files.**
    - **`tests/ci.test.js`:**
      - It only allows changes to `.github/` and `tests/` when the upstream author makes them.
      - Its template check can never match, because it looks for `sources/templates`.
      - Its generated-files check compares wildcards as plain text.
      - It lists files that no longer exist.
    - **`tests/presets.test.js`:** it clones and checks the upstream project's presets, not this fork's code.
    - Neither is run by anything. They mislead more than they help.
11. **Process handling.**
    - When an action test times out, its child process isn't stopped (`tests/metrics.test.js:19`).
    - If the web server dies at start-up, the test only times out instead of failing with the real error (`:34`).
    - The focused tests' helper (`tests/plugins/esm.js`) already handles both, so it can serve as the model.
12. **Coverage gaps.**
    - Six plugins have no cases: 16personalities, crypto, skyline, splatoon, support and tweets. Their examples are skipped on purpose (dead or paid services), and 16personalities is already in the roadmap.
    - Two mocks stand in for services that may no longer work as mocked: Twitter (its API is now paid) and Hashnode's old API (it couldn't be reached during the review).
13. **Privacy, minor.** The Steam mock (`tests/mocks/api/axios/get/steam.mjs`) contains what look like a real public Steam profile's ID, avatar and country, probably the upstream author's. It's public data, not a secret. Keep or replace it, as Sean prefers.

## What we recommend

**Small and worth doing now.** Each is a short job with low risk:

1. **Run the focused tests in CI**, by adding `tests/plugins` to the `test-metrics` script in `package.json`. About 45 seconds more per run.
2. **Use a 1-second lines delay in tests.** About 7 minutes faster per run.
3. **Fix the inverted SVG check**, plus a test that malformed SVG is rejected. Run the full suite once to catch any output that's already malformed.
4. **Fix the placeholder tests**, so they switch on the named plugin and check its section appears.
5. **Fix the notable counting bug** (issues and pull requests), with a focused test.
6. **Make the dead mocks match:**
   - Add the space to the base query.
   - Name the notable history query and add mocks for it and for `base.user.x`.
   - Fix the Last.fm and GPG faker calls.
7. **Remove `tests/ci.test.js` and `tests/presets.test.js`** and their two `package.json` scripts, `test-contrib` and `test-presets`.

**Worth doing later.** These are bigger changes:

8. **Make the mocks fail closed.** An unmocked request should fail the test instead of reaching the internet. Expect this to turn up more missing mocks, and add them first. This is the change that makes the suite trustworthy.
9. **Real checks on output** for the plugins the fork changed: event contents, the projects count, mixed-case language totals, the lines history graph, and notable's per-repository numbers.
10. **Give faker a fixed seed and fixed dates,** so a failure can be reproduced.
11. **Split the 30-minute CI test run in two** (action and web server). That's a workflow change.
12. **Stop child processes properly** on a timeout or start-up failure.

**Not worth changing:**
- The upstream author's name in test data and mocks (it's inert).
- The 399 skipped combinations (by design).
- `tests/secrets.json` (placeholders, used by the case generator).
- The ES module helper for the focused tests.

## Suggested order

1. Recommendations 1 and 2 together. They are the cheapest and give the biggest gain in safety and time.
2. Recommendations 3 and 4. They may turn up broken output, so expect some follow-up.
3. Recommendations 5 to 7.
4. Recommendation 8, then 9.
