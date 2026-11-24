# Plan: js-yaml-5

**What Sean asked for:** "all in order". This is the last of the three code-change jobs from the majors review (#128): js-yaml 5.5.0, instead of Renovate's #112 as it is.

## What we found

- **#112 alone doesn't build:** js-yaml 5 has no default import any more, and four files under `source/app/metrics/` and the build script `.github/scripts/build.mjs` use one.
- **Writing YAML:** two options the build script uses were renamed. Without changes, five generated files come out slightly differently, because long links are no longer folded.
- **Found by the review's audit:**
  - **Empty input is now an error:** template details read from an empty or missing file (`source/app/metrics/metadata.mjs`) fail, where they used to give an empty result.
  - **Merge keys (`<<:`) are no longer read** by default. A user's preset that uses them silently loses those options (`source/app/metrics/presets.mjs`).
  - **Dates in YAML** now come in as plain text instead of dates.
- **The repo's own YAML files** all read to the same values with both versions.

## What we'll change

1. **Package files:** `package.json` and `package-lock.json` exactly as Renovate's #112 (js-yaml 5.5.0).
   - *Check:* no difference from Renovate's branch.
2. **Imports:** `import * as yaml` in the five files, including `.github/scripts/build.mjs`.
   - **This plan approves that one change under `.github/`:** only the import and the YAML writing options in that build script, nothing else there.
   - The `require` in the tests keeps working.
3. **Writing YAML:** use js-yaml 5's options so the generated files come out as today, as far as the new version allows.
   - *Check:* `npm run build` on master and on the branch. Every difference in generated files is listed.
4. **Empty input:** where the code reads YAML that may be empty or missing, it keeps giving an empty result, as today.
   - *Check:* a test with empty and missing template details.
5. **Users' presets:** presets keep reading merge keys (`<<:`) and dates as before, using js-yaml 5's schema options.
   - The presets loader keeps its safe schema: no custom types, nothing that runs code.
   - *Check:* a test with a preset that uses `<<:`, compared with master.
6. **Notes:** roadmap.
7. **Prove nothing broke:**
   - every YAML file in the repo reads to the same values with both versions;
   - lint, build, the plugin tests, the spelling check and CI's full suite.

## Who's on it

Engineer, Auditor (with the security pass, since presets come from URLs users give).

## Risks

- **Users' own YAML** (presets, workflow files) may use features the repo's files don't. The audit checks a wider set of inputs than the repo's own.
- **Generated docs** may change slightly. Each difference is listed.

## Out of scope

- Other changes under `.github/`.
- The Renovate majors still waiting for a review (#133, #132, #130, #127, #105, #93).
- Renovate's #112 is replaced by this PR. If Renovate doesn't close it after the merge, Sean closes it.
