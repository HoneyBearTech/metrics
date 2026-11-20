# Roadmap

This fork carries fixes for the unmaintained upstream project (lowlighter/metrics). Nothing here goes back upstream.

## Done

- Docker image builds again on Node 24 (PR #3)
- Safe dependency updates within current major versions (PR #4, landed on master through PR #7)
- Plugins repaired after GitHub API changes: activity, habits, recently used languages, code, achievements, projects (PR #5)
- Small plugin fixes: lines, music, wakatime, steam, notable (PR #6)
- First real run on the owner's profile (2026-11-20): habits, code snippet, achievements, projects, notable, calendar and most-used languages show real data.

- Recent activity on trimmed pull-request events, and recently used languages for usernames with capitals (PR #8), confirmed by a real run.

## In progress

- The fork's workflows: current actions pinned to exact commits, upstream-only jobs removed, one CI workflow for the fork (PR #10)

## Next

- **After merging #10:** the labeler and spelling checks show their fixed versions on the next pull request (they run the base branch's workflow). Merge Renovate's setup PR (#9) so action and dependency versions stay current; until then the repo has no update-tool config.
- **Leftover upstream scripts:** `.github/scripts/release.mjs`, `markdown_example.mjs`, `presets_examples.mjs` (behind `npm run presets`) and `preview.mjs` still refer to the upstream project and are no longer used by any workflow. Delete or rewrite them in a later cleanup.
- **16personalities plugin:** it scrapes the live website, which has changed, so it likely no longer works for users; its test is skipped. Fix or retire it.
- **Formatter drift:** one file (`source/plugins/languages/analyzer/analyzer.mjs`) isn't formatted; CI formats but doesn't check.
- **After merging #6:** check that a real Apple Music or Spotify playlist no longer shows the "Explicit" label in titles. The label is only removed when it's clearly separate from the title (see the decisions log).
- **`simple-git` security warning:** a critical command-injection warning remains on 3.x. Clearing it needs the 4.x major upgrade and a check of the languages "indepth" analyzer that uses it.
- **Unpinned Docker inputs:** the base image and the Deno install script aren't pinned (both are inherited from upstream). Pin the base image by digest and Deno to a release.
- **Upgrades skipped on purpose for now:** puppeteer 25 (needs a full Chrome path), file-type 21, jsdom 28, eslint 9.
- **Repository mode in `activity`:** collaborators' pushes are still hidden (an older upstream gap, not caused by the API change).
- **Stale generated file under `.github/`:** the compatibility table. The examples workflow is gone (PR #10).
- **Shared username filter:** `filters.text` lowercases the text but not the patterns, so callers that pass a mixed-case pattern never match. Fixed where it broke (recently used languages); a general fix would touch many plugins.
- **Activity event types not seen live:** commit comments and wiki edits couldn't be checked against GitHub's current event format.

## Not planned

- New plugins (Shikimori, Letterboxd)
- The upstream "v4" wish-list and old feature requests
- Support questions with no reproducible bug
