# Plan: revert-untested-majors

**What Sean asked for:** revert the three major updates that broke `master` (his choice from three options).

## What we found

- **Merged without their tests:** #101 (eslint 10), #102 (express 5) and #106 (file-type 22) were merged while their "Lint code" check was failing. That check failing makes "Build and test" skip, so their tests never ran.
- **Lint is broken:** eslint 10 no longer reads the project's lint settings files, which are in an older format (it needs an `eslint.config.*` file). "Lint code" now fails on `master` and on every pull request, so no pull request gets its tests run.
- **The web server can't start:** express 5 rejects two of its route patterns, `/about/*` and `/:login/:repository?`. It also reads the request's options fresh on every access, so the web server's changes to them (the repository route's template, for example) are silently lost.
- **file-type 22 is untested:** it hasn't been tested with this project.

## What we'll change

1. **Revert the three merges,** newest first: #106, #102, then #101. This puts `package.json` and `package-lock.json` back to eslint 8, express 4 and file-type 21, as on `master` before those merges.
   - *Check:* the lock file matches the one before #101 for those packages, and nothing else changes.
2. **Prove `master` works again:** lint passes, the focused tests pass, the web server starts, and CI's full suite runs and passes on the pull request.

## Who's on it

Engineer, QA, Security Officer, Auditor. No research: the cause is known.

## Risks

- **Renovate opens them again:** Renovate will propose these three updates again. Each will get its own reviewed upgrade job: eslint needs a new settings file, express needs route and option changes in the web server, and file-type needs a test run.

## Out of scope

- Doing those upgrades, which are separate jobs.
- #110 and #111, which continue once `master` is green.
