# Plan: fork-workflows

## What Sean asked for

"I also want the workflow actions checked to make sure they are up to date and reference my user as the repo owner" - and chose to have the team update the fork's workflows.

## What we found

- **Outdated actions.** Most workflows use action versions from 2022-2023 that GitHub has retired or is retiring (`checkout@v3`, `setup-node@v3`, `codeql-action@v2`, `check-spelling@v0.0.20`). The spelling check fails on every run because of this, and code scanning fails on master pushes.
- **Upstream references.** The master CI runs the upstream project's copy of the test workflow (`lowlighter/metrics/.../test.yml@master`) instead of this fork's. Other jobs publish Docker images to the upstream registry, deploy the upstream web instance, render the upstream author's example images, clean the upstream registry, and run upstream's stale-issue bot. None of these can work in the fork (no secrets, no such branches) and the fork doesn't need them: the action rebuilds its image from this repo's `Dockerfile` when used from a fork.
- **Broken but useful checks.**
  - "Build and test" has never passed on the fork: its formatter step looks for files in the wrong folder.
  - The labeler was bumped to v7, but its settings file is still in the old format.
  - The "Lint code" job runs an upstream rule that forbids committing regenerated files, which the fork must commit.
- Renovate is installed on the repo (its setup PR is open), so keeping action versions current after this job is left to it. The old Dependabot file does nothing (its limit is 0) and names the upstream author as reviewer.

## What we'll change

1. **Remove upstream-only workflows and files.**
   - Delete `branches.yml`, `clean.yml`, `stale.yml`, `examples.yml`, `examples.presets.yml` and `test.presets.yml`.
   - Delete the registry-cleaning scripts they call (`.github/actions/ghcr-clean/`), `.github/FUNDING.yml` (upstream sponsorship) and `.github/dependabot.yml` (inactive; Renovate replaces it).
   - Stop the build script (`.github/scripts/build.mjs`) from regenerating the examples workflow, so `npm run build` doesn't bring it back.
   - Check: `npm run build` recreates no deleted file, and changes nothing outside `.github/` and the build script.
2. **One CI workflow for the fork.** `test.yml` runs on pull requests to master, on pushes to master and by hand, with read-only permissions by default:
   - **Lint:** install, then lint. The upstream contributor guard step is removed.
   - **Build and test:** the formatter finds the right files (config fix in `.github/config/dprint.json`), then the Docker image builds and the stand-in test suite runs. The local image name no longer uses `lowlighter`.
   - **Code scanning:** CodeQL v4, with only the permission it needs (`security-events: write`).
   - **`ci.yml` is deleted.** Its only useful job, running the tests, is now `test.yml`'s push trigger; the rest was upstream publishing and deploying.
   - Check: the workflows parse (`actionlint`), and the PR's own run shows Lint, Build and test and code scanning passing.
3. **Fix the labeler and spelling checks.**
   - **Labeler:** settings converted to the current format, with an explicit `pull-requests: write` permission.
   - **Spelling:** updated to the current version. The job that needs a missing secret is removed, and the "is this upstream?" conditions are simplified. If it still fails, it is removed instead, and that is noted.
   - Check: both run on PRs (see Risks for when the new versions take effect).
4. **Pin every action and point at this fork.**
   - Every `uses:` line points to an exact commit, with the version as a comment (e.g. `actions/checkout@<commit> # v7.0.1`): checkout v7.0.1, setup-node v7.1.0 (Node 24, matching the Docker image), labeler v7.0.0, check-spelling v0.0.26, CodeQL v4.39.3.
   - Every remaining `lowlighter` reference that means "this repository" points at `HoneyBearTech` or `${{ github.repository }}`.
   - The issue template's support links point at this fork.
   - Check: a search finds no unpinned `uses:` and no `lowlighter` under `.github/workflows/`.
5. **Kept as they are:** upstream credits and examples in the README's source partials (a separate documentation decision), the spelling dictionary and the CodeQL config.

## Who's on it

Engineer, QA, Security Officer, Auditor. Research is done.

## Risks

- **First Docker run.** The "Build and test" job has never completed on the fork. Its first run may take 20-30 minutes and may show other failures. It stays optional (nothing is a required check), and any new failure is reported, not hidden.
- **Big version jumps** (checkout v3 to v7, setup-node v3 to v7, CodeQL v2 to v4) are only fully proven by a real run. This PR's own checks are that run.
- **Labeler and spelling take effect late.** They use the base branch's workflow on pull requests, so their fixed versions only take effect on PRs opened after this one is merged.

## Out of scope

- Repository settings, branch rules and CODEOWNERS.
- Renovate's setup (its own PR #9) and any Renovate rules.
- Rewriting upstream credits and examples in the README.
- Publishing a Docker image for the fork.
