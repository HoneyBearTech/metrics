# Plan: openssf-bootstrap

## What Sean asked for

"Bootstrap https://github.com/HoneyBearTech/metrics. bestpractices.dev project ID is 16966": bring this fork up to the house standard for project documents and OpenSSF (Baseline Level 1 and 2, Best Practices Passing and Silver), with the Best Practices badges for project 16966.

## What we found

- **The project documents still speak for the upstream project.** `SECURITY.md` tells people to report vulnerabilities as a public issue on the upstream repository. `CONTRIBUTING.md` links upstream discussions, branches and rules that don't exist here. `CODE_OF_CONDUCT.md` names no one to contact. There is no `GOVERNANCE.md`, `SUPPORT.md` or `CHANGELOG.md`, and `docs/` holds only the team's job notes.
- **The README is generated.** `npm run build` rebuilds it from `.github/readme/partials/templated/README.md`, so the badge row must go there (and in the rebuilt `README.md`), or the next build removes it. Its one badge points at the upstream project's CI.
- **The project page on bestpractices.dev exists** (registered today for this repository, nothing answered yet, 0%). Its badge links are `https://www.bestpractices.dev/projects/16966/badge` and `.../16966/baseline`.
- **Much is already met:** MIT license, public history, Issues and Discussions on, dependencies in `package.json` and its lockfile, tests and code scanning on every pull request, read-only workflow permissions, actions pinned to exact commits, Renovate with vulnerability alerts.
- **Not in this job:** this fork publishes no releases or images (the action builds its image from the `Dockerfile` at run time), so signed releases and release checksums are marked "Planned". New CI checks (Scorecard, dependency review, secret scanning, sign-off check) are a separate job, because every new check also gates every Renovate pull request under the merge rule, and this machine leaves workflow file edits to Sean (as in PR #43).

## What we'll change

Nothing here changes how metrics runs. Only documents, templates and `.gitignore` change.

1. **README badges.** In the README source and the rebuilt `README.md`: the CI badge points at this repository's `test.yml` instead of upstream's, plus the Best Practices and Baseline badges for project 16966. The Scorecard badge is added commented out until the Scorecard workflow exists. A short "Project documentation" section links every document below. *Check:* `npm run build` changes only `README.md` (anything else it regenerates is reverted), and the badge links open.
2. **Security policy (`SECURITY.md`).** The reporting section is replaced: report privately through GitHub's "Report a vulnerability" form on this repository, never as a public issue; first reply within 14 days; how fixes and advisories are published; reporters credited. *Check:* no link to the upstream repository remains.
3. **Contributing guide (`CONTRIBUTING.md`).** Upstream-only links and rules are fixed, and sections are added: signing off commits (`git commit -s`), building and testing from source, the test policy (new features and fixes come with tests), coding standards (the linter and formatter), how to report a bug, and what a pull request needs before it is merged. *Check:* every link points at this repository.
4. **Code of conduct (`CODE_OF_CONDUCT.md`).** Add how to report a problem privately (through GitHub, no personal email). The rest stays.
5. **New root files:** `GOVERNANCE.md` (who maintains it and who has access, how decisions are made, what happens if the maintainer is unavailable, with no private details), `SUPPORT.md` (what is supported and where to ask), `CHANGELOG.md` (the fork's changes so far, from the roadmap's "Done" list). *Check:* nothing claims a release or a feature that doesn't exist.
6. **New files in `docs/`:** `README.md` (an index), `quick-start.md`, `installing.md`, `upgrading.md`, `architecture.md` (who and what talks to what, pointing to the existing `ARCHITECTURE.md`), `security.md` (what metrics protects and what it doesn't), `assurance-case.md` (threats, trust boundaries, how common weaknesses are handled), `dependencies.md` (how dependencies are chosen and updated, Renovate and its merge rule, how fast findings are fixed), `interfaces.md` (action inputs, `settings.json`, the web server's pages and endpoints, the output formats), `accessibility.md` (short: the web pages and the images), `verifying-releases.md` (marked "Planned"), and `user-guide/README.md` (points to the existing plugin and template guides). Anything not built yet is marked "Planned". *Check:* each statement matches the code; links work.
7. **Templates.** A bug report form and a feature request form in `.github/ISSUE_TEMPLATE/`, a link to the security policy in its `config.yml`, and a sign-off checkbox in the pull request template (dropping its out-of-date line about automatic formatting). *Check:* the forms are valid issue form files.
8. **`.gitignore`:** add `*.pem`, `*.key` and `.obsidian-docs/`, so private keys and local notes can't be committed by accident.
9. **Spelling.** New words in all this text go into the spelling dictionary in the same pull request, so the spelling check (which the Renovate merge rule needs) stays green.
10. **The team's notes** (`docs/roadmap.md` gets a "Security and project health" list, plus the pass map and decisions log), done at the end.

After Sean approves the finished work: one GitHub issue per OpenSSF item still open (label `openssf`), so the work shows on the project board. Checked or not-applicable items get none.

## Things only Sean can do (listed again in the final report)

- Turn on the existing `main-protection` ruleset for `master` (it is off): pull requests required, the CI checks required, no force-push or deletion.
- Settings > Actions > General: workflow permissions read-only.
- Turn on private vulnerability reporting, secret scanning with push protection, and Dependabot alerts (keep Dependabot security updates off; Renovate makes those pull requests).
- Update the repository description (it is still upstream's), and fill in the bestpractices.dev form for project 16966 (the new documents give most answers).
- Two-factor sign-in on his account, if not already on.

## Who's on it

Researcher (done), Engineer, QA, Security Officer, Auditor, a second security review, a plan check and a plain-English check.

## Risks

- **Spelling:** a missed word fails the spelling check on every pull request, which blocks Renovate merges. Each new file is checked before pushing.
- **Generated README:** if the build can't run here, the same change is made by hand to both the source and `README.md`.
- **Size:** this is a large documentation change; it touches no code or workflow.
- **Accuracy:** documents that overstate what the project does are worse than none. Reviewers check them against the code.

## Out of scope (later jobs)

- New CI workflows: Scorecard, dependency review, secret scanning, a sign-off check. Each needs Sean to apply the workflow file, and a check that Renovate pull requests still pass.
- `renovate.json` changes from the standard (pinning action updates, grouping code scanning updates, a weekly schedule). Pinning would make Renovate edit workflow files, which the merge rule leaves for Sean.
- Signed releases, checksums and a parts list for releases (no releases yet).
- `CODEOWNERS` (this machine never changes it; `GOVERNANCE.md` names the maintainer instead).
- Known gaps the badge form will show: formatter check in CI, pinned Docker base image, test coverage measurement, the older audit findings no Renovate PR covers (all already on the roadmap).
