# Roadmap

This fork carries fixes for the unmaintained upstream project (lowlighter/metrics). Nothing here goes back upstream.

## Done

- Docker image builds again on Node 24 (PR #3)
- Safe dependency updates within current major versions (PR #4, landed on master through PR #7)
- Plugins repaired after GitHub API changes: activity, habits, recently used languages, code, achievements, projects (PR #5)
- Small plugin fixes: lines, music, wakatime, steam, notable (PR #6)
- First real run on the owner's profile (2026-11-20): habits, code snippet, achievements, projects, notable, calendar and most-used languages show real data.

## In progress

- Recent activity crash on trimmed pull-request events, and empty recently used languages for usernames with capitals (PR #8)

## Next

- **After merging #8:** one more real run to confirm recent activity and recently used languages show data.
- **After merging #6:** check that a real Apple Music or Spotify playlist no longer shows the "Explicit" label in titles. The label is only removed when it's clearly separate from the title (see the decisions log).
- **`simple-git` security warning:** a critical command-injection warning remains on 3.x. Clearing it needs the 4.x major upgrade and a check of the languages "indepth" analyzer that uses it.
- **Unpinned Docker inputs:** the base image and the Deno install script aren't pinned (both are inherited from upstream). Pin the base image by digest and Deno to a release.
- **Upgrades skipped on purpose for now:** puppeteer 25 (needs a full Chrome path), file-type 21, jsdom 28, eslint 9.
- **Repository mode in `activity`:** collaborators' pushes are still hidden (an older upstream gap, not caused by the API change).
- **Stale generated files under `.github/`:** the examples workflow and the compatibility table. Refresh them in a job that may change `.github/`.
- **The fork's CI checks mostly fail for setup reasons** (retired artifact action in the spelling check, labeler without write permission, formatter config under `.github/config`, and the upstream rule against committing generated files). None are required. Repairing them needs a job allowed to change `.github/`.
- **Shared username filter:** `filters.text` lowercases the text but not the patterns, so callers that pass a mixed-case pattern never match. Fixed where it broke (recently used languages); a general fix would touch many plugins.
- **Activity event types not seen live:** commit comments and wiki edits couldn't be checked against GitHub's current event format.

## Not planned

- New plugins (Shikimori, Letterboxd)
- The upstream "v4" wish-list and old feature requests
- Support questions with no reproducible bug
