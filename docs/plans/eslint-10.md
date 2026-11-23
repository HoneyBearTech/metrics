# Plan: eslint-10

**What Sean asked for:** "eslint 10 (#115)".

## What we found

- **Renovate's #115 alone would break lint again:** it moves eslint from 8.57.1 to 10.15.0, but eslint 10 no longer reads the two old-style settings files. That's what broke lint when it was merged in #101 and reverted in #114.
- **The fix is a new settings file:** the settings move to one `eslint.config.mjs` at the top of the repo. It needs two small helper packages from the eslint project's own maintainers: `@eslint/js` 10.0.1 for the recommended rules, and `globals` 17.14.0 for the names Node defines. Both are well over 3 days old.
- **Same files, same results:** a trial in a scratch copy checked the same 72 files with the same results as today, with no errors and the same warnings at the same places. A test file full of mistakes got the same 23 problems from both versions.
- **Rules that changed:**
  - **Formatting rules:** they're marked old in eslint 10 but still work, so they stay.
  - **New recommended rules:** six were added to eslint's recommended set. Two of them find six real spots in today's code. All six are turned off for now, so this job changes no code.
  - **Changed defaults:** for a few rules whose defaults changed, the old behaviour is kept.
  - **Renamed rule:** one rule was renamed, and the new name is used.

## What we'll change

1. **Packages, in `package.json` and `package-lock.json`:**
   - eslint goes to `^10.15.0`, as in Renovate's #115.
   - `@eslint/js` and `globals` are added as development packages.
   - *Check:* the lock changes match #115's plus only the two new packages.
2. **Settings:**
   - add `eslint.config.mjs` with today's rules;
   - delete the old settings file in `source/`;
   - delete the old settings file in `tests/mocks/`, which was never used because lint never checks that folder.
   - *Check:* lint checks the same files, with the same enabled rules and results as eslint 8. The test file full of mistakes is flagged the same way.
3. **Notes:** mark the eslint move done on the roadmap. Add the two turned-off rules, their six spots, and the later removal of the old formatting rules as roadmap items.
4. **Prove nothing broke:** lint, build, the plugin tests, the spelling check, and CI's full suite.

The workflows don't change, because CI already runs `npm run linter`.

## Who's on it

Researcher (done), Engineer, QA, Security Officer, Auditor.

## Risks

- **#115 can't be merged as it is:** this PR replaces it. Renovate closes #115 by itself once `master` has eslint 10.
- **Old formatting rules:** a later eslint version will remove them. Before then they'll need a separate style package, or the repo's existing formatter settings turned on in CI (roadmap).
- **Two new packages:** Renovate will propose updates for them.

## Out of scope

- Fixing the six spots the two new rules find.
- Running lint on `tests/`.
- Any other upgrade.
