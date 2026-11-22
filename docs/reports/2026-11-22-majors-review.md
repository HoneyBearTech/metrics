# Review of six major Renovate updates (2026-11-22)

Sean asked: "start the majors review".

Renovate had six major-version pull requests open. The repo's guidelines let a major update in only when a review here names the pull request and recommends the exact version. For each one, a researcher tried the update in a scratch copy and read the release notes and every call site. An independent audit then checked the conclusions. The audit also covered security and the supply chain, and it rendered the markdown template, including its PDF output, end to end with the updates applied.

## Recommendations

| PR | Package | From → to | Recommendation |
|---|---|---|---|
| #80 | `@primer/css` | 21.5.1 → **22.3.3** | Take as is |
| #92 | `ejs` | 3.1.10 → **7.0.2** | Take as is |
| #84 | `color` | 4.2.3 → **5.0.3** | Take as is (merged on 2026-11-22 while the review ran) |
| #75 | `@actions/core` | 1.11.1 → **3.0.1** | Take, with a code change (its own job) |
| #83 | `@twemoji/parser` | 14.1.0 → **17.0.2** | Take, with a code change (its own job) |
| #93 | `emoji-name-map` | 1.2.9 → 2.0.3 | Don't take; stay on 1.2.9 |

All the recommended versions are more than 3 days old. None of the six has an install script, and none changes the npm audit result.

## Each update

### #80 `@primer/css` 22.3.3: take as is

- **Use in the project:** only `dist/markdown.css`, which styles PDF output (`source/app/metrics/utils.mjs`). It still exists at the same path.
- **Changes in that file:** small style differences, such as a thinner horizontal rule and the same fonts through a CSS variable.
- **Render checks:** the markdown template rendered to a PDF with this version.
- **Publishing:** published from the project's release workflow with provenance.

### #92 `ejs` 7.0.2: take as is

- **Breaking changes since 3.x:**
  - Data no longer resolves through the prototype chain.
  - Options are no longer read from the data object.
  - The `client` option and `VERSION` are gone.
  - The project uses none of these.
- **Render checks:**
  - 87 renders of the classic and terminal templates were byte-identical to 3.1.10.
  - The markdown template's two passes with custom delimiters and `include` were identical too.
  - So were `npm run build` and the quickstart output.
- **Browser copy:** the browser copy (`ejs.min.js`) that the web server serves still exists and works.
- **Security:** ejs 7 doesn't make templates safe to run from untrusted sources, and neither did 3.x. See "Found along the way".

### #84 `color` 5.0.3: take as is

- **Module format:** the package is ES-module only, which the worldmap plugin's import already handles.
- **Output check:** all 495 colour mixes the worldmap uses gave the same result. The worldmap tests passed in CI.
- **Past compromise:**
  - In September 2025, `color` 5.0.1 and three related packages were briefly replaced with malware, after their publisher's account was taken over.
  - The lock holds 5.0.3 and later versions of the others, which are clean.
  - The `^5.0.0` range would allow 5.0.1, so the lock and its integrity hashes are what protect the project.

### #75 `@actions/core` 3.0.1: take with a code change

- **Why its build fails:** version 3 is ES-module only and has no default export, so `import core from "@actions/core"` fails. That is the cause of its 337 test failures.
- **The fix:**
  - Change `import core from "@actions/core"` to `import * as core from "@actions/core"`.
  - Apply it in `source/app/action/index.mjs` and `source/plugins/languages/analyzer/analyzer.mjs`.
  - Both reviewers ran the action with this fix.
- **Publishing:** published from GitHub's release workflow with provenance.
- **Next step:** Renovate's PR can't be merged alone. This needs a team job with the version and the two lines together.

### #83 `@twemoji/parser` 17.0.2: take with a code change

- **New emoji:** version 17 knows the newer emoji and keeps more combined emoji whole.
- **Dropped matches:**
  - From 17.0.2, about 200 characters are no longer treated as emoji when written without the emoji variant, for example ✔ ☺ ⚠.
  - Ten characters written with it, for example ✌️, now come back as an empty match.
- **The crash:** the empty match makes `svg.twemojis` (`source/app/metrics/utils.mjs`) fail with an invalid-address error whenever emoji images are switched on.
- **The fix:**
  - Skip matches with no address: `twemojis.parse(rendered).filter(({url}) => url)`.
  - Those characters then show in the normal font, and nothing crashes.
  - The guard also helps on older versions, which return empty matches for a lone variant character.
- **Next step:** like #75, this needs a team job.

### #93 `emoji-name-map` 2.0.3: don't take

- **What changes:** the lookup works the same, but its list of names changed. 513 names that work today are gone, including all country-flag names and `ballot_box`.
- **Effect:** `ballot_box` is the icon of GitHub's default "Polls" discussion category. With 2.0.3 the discussions plugin shows `:ballot_box: Polls` instead of 🗳 Polls. This was reproduced through the plugin.
- **Why CI misses it:** CI passes because the test data uses names that exist in both versions.
- **Recommendation:** stay on 1.2.9. A later option is to build the lookup from GitHub's own emoji list.

## Found along the way (separate jobs)

- **The markdown template runs text from plugin data as template code.** Its second rendering pass treats text already put in by the first pass as template code. That text can come from plugin data that someone else controls. The same is true with ejs 3 and ejs 7. This needs its own fix, and it is on the roadmap.
- **A markdown dry run still tries to write the output file:** `source/app/action/index.mjs`.
- **Emoji images come from a CDN path ending in `@latest`:** that path can change, and the lock file doesn't protect it.

## Order

Merge the updates one at a time, because they all change `package-lock.json`:

1. #80
2. #92
3. The team job for #75 and #83.
