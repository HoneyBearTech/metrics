# Plan: web-extras-forms

**What Sean asked for:** "keep going", after the extras fix. This is one of the small follow-ups it found (roadmap: "Presets with all extra features on" and "`/.extras` page for logged-in users").

## What we found

The web server reads the extra feature list in two places that assume it is always a list. The setting may also be `true` (all features), `false`, or unset.

- **Presets, `source/app/web/instance.mjs` ~line 501:** with `extras.features: true`, a request with `config.presets` returns 500. The check calls `.includes()` on `true` before it checks for `true`.
- **The `/.extras` page, ~line 176:** for a logged-in user, when the feature list is unset or `false`, the page crashes, because it copies the list without checking it is one.

## What we'll change

1. **Presets check:** check for `true` and for a list (`Array.isArray`) before calling `.includes()`.
   - *Check:* with `features: true`, a preset request is no longer a 500.
2. **The `/.extras` page:** build the logged-in user's list with the existing `withLoggedFeatures` helper (added in PR #109), so it never copies something that isn't a list.
   - *Check:* the page answers for a logged-in user with the feature list unset, `false`, a list, or `true`, and the shared settings are unchanged.
3. **Tests in `tests/plugins/`:** both cases.
   - *Check:* they fail on today's code.
4. **Prove nothing broke:** lint, build, the focused tests and CI's full suite.

## Who's on it

Engineer, Security Officer, Auditor. A small job, so no research or separate QA.

## Risks

- **What a logged-in user is allowed doesn't change:** that's already decided by `withLoggedFeatures` for the main route. The page will now show the same list.

## Out of scope

- The unchecked token options in three plugins, which is a separate job.
