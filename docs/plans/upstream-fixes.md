# Plan: bring the outstanding upstream fixes into this fork

## What Sean asked for

"Review my fork and fix any of the issues and PRs that are outstanding on lowlighter/metrics, but only on my fork." Nothing goes back to the upstream project.

## What we found

- **The fork's action doesn't work today.** When the action runs from a fork, it builds its own Docker image from `Dockerfile` (`action.yml`, near the end).
  - That build currently fails. A Ruby tool it installs (`licensed`) needs a compression program the image lacks, and the base image (Node 20) has reached end of life.
  - Upstream PR 1855 fixes the build. We test-built it, and it works, with one gap: on Node 24 an optional library used to check the finished SVG picture (`libxmljs2`) silently fails to install. It needs a newer version.
- **GitHub changed its API, and several plugins broke.**
  - Push events no longer list their commits, so the `activity`, `habits`, recently-used `languages` and `code` plugins show nothing or crash. That covers upstream issues 1694, 1519 and 1488, and probably 1565.
  - The old "Projects (classic)" feature is gone. That breaks the "Manager" achievement (issue 1706) and the `projects` plugin.
- **Several small plugin bugs have ready fixes in upstream PRs:**
  - lines (1843, 1847)
  - music "Explicit" label (1844, issue 1674)
  - wakatime crash (1783)
  - steam recently played (1845)
  - a way to skip organisations in notable (1788, helps issue 1371)
- **Many upstream items aren't worth doing here:**
  - About 20 dependency-update PRs. They conflict with each other, so we'll redo them as one update.
  - Two new-plugin PRs (Shikimori, Letterboxd).
  - The "v4" wish-list and old feature requests.
  - Support questions with no clear bug.
  - One junk PR (1832, which deletes the example settings file).

## What we'll change

Four separate pull requests, one logical change each. Each one targets this fork's `master` (never upstream) and gets its own final approval from Sean.

1. **Docker image builds again** (from upstream PR 1855).
   - Move the image to Node 24, install Chrome and Deno the current way, and drop the Ruby `licensed` tool that breaks the build.
     - The `licenses` plugin already copes without it. It just loses its extra license scan.
   - Raise `libxmljs2` to 0.37 so the SVG check works on Node 24.
   - Files: `Dockerfile`, `package.json`, `package-lock.json`.
   - *Checked by:*
     - building the image from scratch
     - confirming Chrome, Deno, `sharp` and `libxmljs2` load inside it
     - running the mocked test suite for a few plugins inside the image
2. **Plugins working again after GitHub's API changes.**
   - Achievements and projects: switch from the removed classic projects to the new Projects (based on upstream PRs 1834, 1769 and 1782). Ask only for counts, so no extra token permissions are needed.
   - Push events: look up each push's commits from the push's "before" and "after" points (GitHub's compare API). Do this for `activity`, `habits`, recently-used `languages` and `code`.
     - This rewrites upstream PRs 1760 and 1754 properly. Both had bugs or were unfinished.
     - Keep the existing day and event limits, so the number of API calls stays bounded.
   - Update the test stand-ins (mocks) to match GitHub's new data shape.
   - Files: those plugins' code and query files, and the matching test mocks.
   - *Checked by:* lint, plus the mocked test suite for these plugins inside the new image. We can't run them against a real GitHub account here, so Sean should try one real run after merging (see Risks).
3. **Small plugin fixes:**
   - lines: deleted users and organisations, and the template crash (1843, which includes 1847)
   - music: "Explicit" label (1844)
   - wakatime: crash (1783)
   - steam: recently played and free-to-play games (1845)
   - notable: new "skip these organisations" option (1788)

   The new options need the generated docs (`README.md`, `action.yml`, plugin READMEs) rebuilt with `npm run build`. Anything that rebuild changes under `.github/` is thrown away, because we don't touch that folder.
   - *Checked by:* lint, the rebuild giving the same result twice, and the mocked tests for these plugins.
4. **Safe dependency updates, done once.**
   - Bump the packages that upstream's automatic update PRs asked for, in a single update: axios, express, simple-git, uuid, @actions/core, open-graph-scraper, svgo, minimatch and the small indirect ones.
   - Skip the risky major jumps: puppeteer 25, file-type 21, jsdom 28.
   - This pull request sits on top of number 1, because both change `package-lock.json`.
   - *Checked by:* a clean install, lint, an image build and the mocked test suite.

Finally, the job notes go in a new `docs/` folder (`roadmap.md`, `pass-map.md`, `decisions-log.md`), in this plan's pull request.

## Who's on it

- Researcher (done)
- Engineers: one for 1 and 4, one for 2, one for 3
- QA
- Security Officer
- Auditor
- Second security review, because this touches the Docker setup and dependencies

## Risks

- **The push-event fix can't be tried against a real account here.** After merging, Sean should do one real run of his metrics workflow to confirm `activity`, `habits` and `languages` show data again.
- **More API calls.** Looking up commits uses one extra call per push, within the same limits as before. Very busy accounts may hit GitHub's rate limit sooner.
- **The license scan goes away.** Dropping the `licensed` tool turns off the dependency-license scan in the `licenses` plugin.
- **Some generated files go stale.** Two generated files live under `.github/` (the examples workflow and a compatibility table). They won't be refreshed, because we don't change that folder.
- **The fork's own CI won't check these pull requests.** It may not run on this fork at all. Our checks are run locally instead.
- **Merge order:** merge 1 before 4.

## Out of scope

- New plugins (Shikimori, Letterboxd)
- The "v4" wish-list and old feature requests (GPG signing, grouped users, alternative geocoding, sponsor newsletters, and so on)
- Support questions with no reproducible bug (PageSpeed, Anilist, commit counts, skip patterns, Go colour, token scopes, followup stats)
- Big upgrades (Node/eslint/puppeteer jump in upstream PR 1835)
- Upstream PR 1840 (points at upstream-hosted images)
- Junk PR 1832
- Any change under `.github/`
