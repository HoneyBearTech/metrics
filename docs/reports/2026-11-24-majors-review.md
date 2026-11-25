# Review of six more major updates (2026-11-24)

Sean asked: "go". This is the review of the Renovate majors still waiting after the previous review (`docs/reports/2026-11-23-majors-review.md`).

The repo's guidelines let a major update in only when a review here names the pull request and recommends the exact version.

**How each was checked:** three researchers each tried updates in a scratch copy, read the release notes and checked every place the project uses the package. An independent audit, which also covered security and the supply chain, then checked their conclusions with its own runs. It agreed with all six. Nothing in the repository was changed.

## Recommendations

| PR | Package | From → to | Recommendation | Merge the PR as it is? |
|---|---|---|---|---|
| #105 | `express-rate-limit` | 7.5.1 → **8.7.5** | Take as is | Yes |
| #132 | `yargs-parser` | 21.1.1 → **22.0.0** | Take as is | Yes |
| #127 | `purgecss` | 5.0.0 → **9.1.0** | Take as is | Yes |
| #133 | `@octokit/graphql`, `@octokit/rest` | 7.1.1 → **9.0.5**, 20.1.2 → **22.0.1** | Take, after an import change (its own job) | Yes, once that change is on `master` and its checks pass again |
| #130 | `svgo` | 3.3.5 → **4.1.0** | Take, after an import change (the same job) | Yes, once that change is on `master` and its checks pass again |
| #93 | `emoji-name-map` | 1.2.9 → 2.0.3 | **Don't take** | No |

All the recommended versions are more than 3 days old. Each main package's integrity hash matches the registry. None adds an install script. npm's warning count stays at 26 with every one of them.

## Order

1. **#105, #132 and #127:** Sean merges them one at a time. Before each next one, Renovate updates its branch and its checks pass again (they share `package-lock.json`).
2. **One small job for the imports:** octokit and svgo no longer offer a default import. The job switches to named imports, which work with both the old and the new versions. Then #133 and #130 pass their checks as they are.
3. **#133 and #130:** after step 2, Renovate updates them, their checks pass, and they're merged one at a time.
4. **#93:** close it, or keep it open until a job keeps the emoji names working.

## Each update

### #105 `express-rate-limit` 8.7.5: take as is

- **Use:** the web server's rate limits in `source/app/web/instance.mjs`: the built-in limit and the optional one from the server's settings.
- **Behavior:** the same for normal use. Limits, the "retry later" answer, headers, and turning the optional limit off with `max: 0` all work as before. No new warnings at startup.
- **Newer IP addresses:** visitors using version 6 IP addresses are now grouped by their network block (`/56`), so they share one limit. This is the library's intended security fix: it stops a visitor from getting around the limit by switching addresses.
- **Server settings:** the `ratelimiter` settings are passed straight to the library.
  - Unknown options now log a warning instead of being ignored.
  - A `logger` option that isn't a proper logger now stops the server at startup. That option didn't exist before, so normal settings aren't affected.
- **Also fixed upstream:** 8.7.2 and 8.7.5 include security fixes.

### #132 `yargs-parser` 22.0.0: take as is

- **Use:** the language analyzer's command line (`source/plugins/languages/analyzer/cli.mjs`).
- **Behavior:** the same results on every command line tried. The only breaking change is its packaging, which doesn't affect this project.

### #127 `purgecss` 9.1.0: take as is

- **Use:** removing unused styles from pictures (`source/app/metrics/utils.mjs`).
- **Behavior:** the classic and terminal templates' styles come out byte for byte the same. The other changes since version 5 concern build-tool plugins the project doesn't use.
- **Node:** it needs Node 22.12 or later. The project uses Node 26.

### #133 `@octokit/graphql` 9.0.5 and `@octokit/rest` 22.0.1: take, after an import change

- **Use:** every call to GitHub, through `source/app/metrics/setup.mjs`, `source/app/web/instance.mjs`, `source/app/action/index.mjs` and the language analyzer's command line.
- **Why its checks fail:** neither package offers a default import any more, so the web server and four test groups stop at startup.
- **The change:** named imports in those four files and one test scenario, 13 lines. With it, all 16 test groups pass, on both the old and the new versions.
- **Everything else the project calls still exists:**
  - all 34 GitHub API methods the code uses;
  - plain requests, GraphQL defaults and paging.

### #130 `svgo` 4.1.0: take, after an import change

- **Why its checks fail:** svgo no longer offers a default import, so loading `utils.mjs` fails.
- **The change:** `import * as SVGO from "svgo"`, one line. It works with both versions.
- **Found by the review, already broken on master:** the SVG optimizer never runs.
  - **The setting name doesn't match:** the code checks for an experimental setting named `--optimize`, but users can only set `--optimize-svg`.
  - **The setup itself fails:** if the name check is fixed, the optimizer's setup fails, because it uses a function svgo removed in version 3.
  - **A separate job:** repairing it would turn on a feature that has never worked, so it needs its own decision and job.

### #93 `emoji-name-map` 2.0.3: don't take

- **Use:** the Discussions plugin turns category emoji names, such as `:speech_balloon:`, into the emoji itself.
- **Version 2 ships a different list:**
  - **Fewer names:** of GitHub's own emoji names, 265 fewer are known. 476 names are lost and 211 gained.
  - **Examples of lost names:** `:unicorn:`, `:robot:`, `:thinking:` and the country-name flags, such as `:canada:`.
  - **What users see:** an unknown name shows as the raw text, like `:unicorn:`.
  - **Different emoji:** some names now give a different emoji, for example `:beetle:`.
- **What the update gains:** only three old packages dropped. No security or feature gain.
- **The tests can't see the loss:** CI passes, because they only use names that both versions know.
