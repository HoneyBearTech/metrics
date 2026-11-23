# Review of six more major updates (2026-11-23)

Sean asked: "go with the majors next".

Renovate had six more major-version pull requests open. The repo's guidelines let a major update in only when a review here names the pull request and recommends the exact version.

**How each was checked:** three researchers each tried updates in a scratch copy, read the release notes and checked every place the project uses the package. An independent audit, which also covered security and the supply chain, then checked their conclusions with its own runs. Nothing in the repository was changed.

## Recommendations

| PR | Package | From → to | Recommendation | Merge the PR as it is? |
|---|---|---|---|---|
| #113 | `jsdom` | 22.1.0 → **31.0.1** | Take as is | Yes |
| #108 | `jest` | 29.7.0 → **30.5.2** | Take as is | Yes |
| #123 | `marked` | 7.0.5 → **18.2.1** | Take, with a code change (its own job) | **No**: its checks pass, but it quietly breaks some images |
| #125 | Node | 24 → **26** (Docker image and CI) | Take, after a fix to picture checking (its own job) | Only after that fix; Sean merges it, as it changes a workflow |
| #119 | `linguist-js` | 2.9.2 → **3.0.4** | Take, with a code change (its own job), after Node 26 | **No** |
| #112 | `js-yaml` | 4.3.2 → **5.5.0** | Take, with a code change (its own job) | **No** |

All the recommended versions are more than 3 days old. Each main package's integrity hash matches the registry.

**PRs that are "No" in the last column:** the version is right, but the PR alone breaks something. The code-change job replaces it.

## Order

1. **#113 jsdom, then #108 jest:** Sean merges them one at a time. Before the second, Renovate updates its branch and its checks pass again.
2. **A picture-check fix:**
   - correct the backwards SVG check in `source/app/metrics/index.mjs`;
   - fix the doubled `class` on multi-line code blocks (see #125 and #123).
3. **marked 18:** with its code change, replacing #123.
4. **#125 Node 26:** after step 2, and with its checks passing again.
5. **linguist-js 3:** with its code change, replacing #119.
6. **js-yaml 5:** with its code change, replacing #112. It's independent of the others and can go at any point.

All five package updates share `package-lock.json`. After each merge, the next one needs its branch updated and its checks run again.

## Each update

### #113 `jsdom` 31.0.1: take as is

- **Use:** only `new JSDOM()` in `source/app/metrics/utils.mjs`, which draws graphs for the lines plugin and the stargazers world map.
- **Output:**
  - **Graphs:** line and pie graphs come out byte for byte the same.
  - **World map:** it writes its colors as `rgb(...)` instead of `#hex`. Once the colors are normalized, all 241 countries are identical.
- **Node:** it needs Node 24.15 or later. The Docker image and CI use a current Node 24.
- **Packages:** about 17 old packages go away. Nothing new runs at install, the security warning count is unchanged, and no native canvas is loaded.
- **CI:** every check passes.

### #108 `jest` 30.5.2: take as is

- **Use:** the test runner. Its settings in `package.json` are all still valid, and it finds the same 19 test files.
- **Tests:** the plugin tests pass.
- **Packages:**
  - **Install script:** one new test-only package (a file watcher) has an install script, but it does nothing unless a build-from-source setting is on.
  - **Native-binding fallback:** another (a module resolver) can fetch a native helper if its own can't load.
- **Security warnings:** npm's count goes from 11 to 26.
  - **No new advisories:** the 15 extra entries are test-only packages affected by advisories the project already has (through `glob` and `minimatch`). The number of distinct advisories goes from 7 to 6.
  - **Security score:** the OpenSSF Scorecard counts distinct advisories, so it shouldn't drop.
- **CI:** every check passes.

### #123 `marked` 18.2.1: take, with a code change

- **What breaks quietly:** two options the project used were removed in marked 8.
  - **Code highlighting is lost** in comments and descriptions.
  - **Tags like `<br>`, `<img>` and `<hr>` aren't closed** in the multi-line mode, which has no clean-up pass. That makes some SVG images invalid.
  - **CI misses both:** its checks still pass.
- **The change, in `source/app/metrics/utils.mjs`:**
  - its own parser with a code renderer that keeps the highlighting;
  - a step that closes those tags.
  - **Result:** single-line output is byte for byte the same as today.
- **Found by the audit, already broken today:** multi-line code blocks get a second `class` on the same tag, which is invalid. A classic sponsors image with a two-line code block in its description fails an XML check. Fix it in step 2.
- **Packages:** no new packages. Published from the project's release workflow with provenance.

### #125 Node 26: take, after a picture-check fix

- **Support dates:** Node 26 became the long-term support version on 2026-10-28. Node 24 is supported until 2028-04-30, so there's no rush.
- **Why CI fails:** the optional SVG checker `libxmljs2` 0.37.0 can't be built on Node 26. Its last release is from June 2025.
  - **The backwards check:** `source/app/metrics/index.mjs` checks `if (!libxmljs)` before calling it. So when the checker is missing, every image crashes. When it's present, as on Node 24, the check is skipped.
- **The fix (step 2):**
  - correct that condition;
  - fix the doubled `class` from #123, which the check would then catch;
  - test with the checker present and missing.
  - **On Node 26:** the SVG check stays off until `libxmljs2` supports it.
- **Other packages on Node 26:** `sharp`, `puppeteer`, `jsdom`, `marked`, `express` and the rest load fine.
- **Merging:** Sean merges #125 himself, because it changes the CI workflow.

### #119 `linguist-js` 3.0.4: take, with a code change, after Node 26

- **What changed:**
  - **Calling it:** the package is no longer called as a function. It has separate functions for folders and for single files.
  - **Language details:** each language's type and color moved to a separate `repository` object.
- **The change:** three call sites.
  - `source/app/metrics/utils.mjs`;
  - `source/plugins/languages/analyzer/recent.mjs`;
  - `source/plugins/languages/analyzer/indepth.mjs`.
- **Results:** the same for a small test folder and nine single files.
- **Tests to add:** the indepth mode and the language types and colors, which today's tests don't cover.
- **Node:** it officially needs Node 26. It works on 24 but warns at install, so it goes after #125.
- **Packages:** it drops `node-fetch`. Nothing new runs at install.

### #112 `js-yaml` 5.5.0: take, with a code change

- **What breaks:**
  - **Importing:** the package has no default import any more, so five files need `import * as yaml`, including `.github/scripts/build.mjs`.
  - **Writing YAML:** two options were renamed.
  - **Generated files:** five change slightly, because long links are no longer folded.
- **The repo's own files:** all its YAML files read to the same values. One file reads in neither version, because it has template code in it.
- **Found by the audit, which the change must also handle:**
  - **Empty input is now an error.** Template details read from an empty or missing file now fail where they used to give an empty result (`source/app/metrics/metadata.mjs`).
  - **Merge keys (`<<:`) are no longer read.** A user's preset that uses them silently loses those options. The change must keep reading them, or the docs must say they're gone.
  - **Dates in presets** now come in as plain text.
- **Packages:** no new install scripts. `linguist-js` 3 keeps its own copy of js-yaml 4.
