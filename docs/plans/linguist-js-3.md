# Plan: linguist-js-3

**What Sean asked for:** "all in order". This is the second of the three code-change jobs from the majors review (#128): linguist-js 3.0.4, instead of Renovate's #119 as it is.

## What we found

- **How it's called has changed:** linguist-js 3 is no longer called as a function. It has one function for folders and one for single files.
- **Where the language details went:** each language's type and color moved from the language results to a separate `repository` object.
- **Three call sites need updating:**
  - the single-file helper in `source/app/metrics/utils.mjs`;
  - the "recent" analyzer in `source/plugins/languages/analyzer/recent.mjs`;
  - the "indepth" analyzer in `source/plugins/languages/analyzer/indepth.mjs`.
- **What the tests miss:** today's tests cover the recent analyzer, but not the indepth one, or the language types and colors.
- **Node:** linguist-js 3 needs Node 26, which the project now uses (#125).

## What we'll change

1. **Package files:** `package.json` and `package-lock.json` exactly as Renovate's #119 (linguist-js 3.0.4).
   - *Check:* no difference from Renovate's branch.
2. **The three call sites:** use the new functions, and read type and color from the new place. The researchers already prepared this change.
   - *Check:* the same small folder and the same single files give the same languages, types and colors on master and on the branch.
3. **Tests:** both analyzers, including the indepth one and the type and color filtering.
   - *Check:* the tests fail with Renovate's package files alone, and pass with the change.
4. **Notes:** roadmap.
5. **Prove nothing broke:** lint, build, the plugin tests (on Node 26), the languages picture tests, the spelling check and CI's full suite.

## Who's on it

Engineer, Auditor (with the security pass, as the indepth analyzer runs git commands on cloned repositories).

## Risks

- **Language detection can change** between linguist-js versions, for example a file being newly detected. Differences on the sample files are listed.
- **The indepth mode runs on real repositories**, which the tests can only stand in for.

## Out of scope

- js-yaml 5 (the next job).
- #132 yargs-parser 22.
- Renovate's #119 is replaced by this PR. If Renovate doesn't close it after the merge, Sean closes it.
