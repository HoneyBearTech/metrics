# Plan: named imports for octokit and svgo

## What Sean asked for

"go": the next step from the majors review (`docs/reports/2026-11-24-majors-review.md`). Change how the project imports octokit and svgo, so Renovate's updates #133 (octokit) and #130 (svgo 4) can go in as they are.

## What we found

- **The new versions drop the default import.** The new octokit packages (`@octokit/graphql` 9 and `@octokit/rest` 22) and svgo 4 only offer named imports. The project uses default imports, so with the new versions the web server and several test groups stop at startup. That's why #133 and #130 fail their checks.
- **The fix is small.** Named imports work with both today's versions and the new ones, so this change can go in first, on its own.
- **One test scenario already does it.** `tests/plugins/scenarios/markdown.mjs` already uses named octokit imports.
- **The version updates stay Renovate's.** This job doesn't touch `package.json` or `package-lock.json`. After it merges, Renovate updates #133 and #130, and each goes through the usual merge rules and Sean's approval.

## What we'll change

1. **Octokit imports, in 4 source files and 1 test scenario (13 lines):**
   - **The REST client:** `import OctokitRest from "@octokit/rest"` becomes `import {Octokit} from "@octokit/rest"`, and `new OctokitRest.Octokit(` becomes `new Octokit(`. This is in:
     - `source/app/metrics/setup.mjs`;
     - `source/app/web/instance.mjs`;
     - `source/plugins/languages/analyzer/cli.mjs`;
     - `tests/plugins/scenarios/extras.mjs`.
   - **The GraphQL client:** `import octokit from "@octokit/graphql"` becomes `import {graphql as octokitGraphql} from "@octokit/graphql"`, and `octokit.graphql.defaults(` becomes `octokitGraphql.defaults(`. This is in:
     - `source/app/web/instance.mjs`;
     - `source/app/action/index.mjs`;
     - `tests/plugins/scenarios/extras.mjs`.
   - **Why the new name:** it keeps clear of names already used in those files.
   - **Checked by:** lint and the plugin tests with today's versions, then the same with #133's package files.
2. **svgo import, 1 line:** in `source/app/metrics/utils.mjs`, `import SVGO from "svgo"` becomes `import * as SVGO from "svgo"`. **Checked by:** the same tests with today's svgo 3 and with #130's package files.
3. **Notes:** roadmap, pass map and decisions log in `docs/`.

**Overall checks:**
- **Comparisons:** the full test suite with today's versions, then with each of #133's and #130's package files in a scratch copy.
- **Review:** quality, security and an independent audit of the change.
- **On the pull request:** every check runs as usual.

## Who's on it

Engineer, QA, Security Officer, Auditor.

## Risks

- **Low.** Only the way the packages are loaded changes. What the code does with them stays the same.
- **Mocked tests:** the tests use mocked GitHub clients, so a real GitHub call isn't tried. The review checked that every client method the code calls exists in the new versions.

## Out of scope

- **The version updates themselves:** they stay Renovate's #133 and #130.
- **The SVG optimizer:** it has never run on master. Turning it on is a separate feature decision.
- **emoji-name-map 2 (#93):** not taken.
