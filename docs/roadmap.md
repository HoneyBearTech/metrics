# Roadmap

This fork carries fixes for the unmaintained upstream project (lowlighter/metrics). Nothing here goes back upstream.

## Done (awaiting merge)

- Docker image builds again on Node 24 (PR #3)
- Safe dependency updates within current major versions (PR #4, merge after #3)
- Plugins repaired after GitHub API changes: activity, habits, recently used languages, code, achievements, projects (PR #5)
- Small plugin fixes: lines, music, wakatime, steam, notable (PR #6)

## Next

- **After merging #5:** one real run of the metrics workflow to confirm activity, habits and languages show data again. It could only be tested with stand-in data.
- **After merging #6:** check that a real Apple Music or Spotify playlist no longer shows the "Explicit" label in titles. The label is only removed when it's clearly separate from the title (see the decisions log).
- **`simple-git` security warning:** a critical command-injection warning remains on 3.x. Clearing it needs the 4.x major upgrade and a check of the languages "indepth" analyzer that uses it.
- **Unpinned Docker inputs:** the base image and the Deno install script aren't pinned (both are inherited from upstream). Pin the base image by digest and Deno to a release.
- **Upgrades skipped on purpose for now:** puppeteer 25 (needs a full Chrome path), file-type 21, jsdom 28, eslint 9.
- **Repository mode in `activity`:** collaborators' pushes are still hidden (an older upstream gap, not caused by the API change).
- **Stale generated files under `.github/`:** the examples workflow and the compatibility table. Refresh them in a job that may change `.github/`.

## Not planned

- New plugins (Shikimori, Letterboxd)
- The upstream "v4" wish-list and old feature requests
- Support questions with no reproducible bug
