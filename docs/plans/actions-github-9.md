# Plan: actions-github-9

**What Sean asked for:** "start job 10 of the security plan" (`docs/reports/2026-11-21-security-findings-plan.md`), starting with the `@actions/github` 9 upgrade, which closes the last three open Dependabot alerts.

## What we found

- Renovate's PR #79 (`@actions/github` 5.1.1 to 9.1.1) can't be merged as it is. Version 9 can only be loaded as a newer-style module with named parts, and the Action's entry point (`source/app/action/index.mjs`, line 3) loads it the old way, so every Action run stops at start-up. CI on #79 shows it: 123 tests fail with "does not provide an export named 'default'".
- With the one-line fix (`import * as github from "@actions/github"`), the Action starts. Two independent reviews checked every part of the package the project uses: the run details it reads, the client it builds with a custom address, and all 34 GitHub API calls in `source/` still exist and behave the same.
- #79 alone wouldn't close Dependabot alerts 13 to 15. The project also uses `@octokit/rest` and `@octokit/graphql` directly, and their lock entries (20.0.1 and 7.0.1) hold the same old `@octokit/request`, `request-error` and `plugin-paginate-rest`. The newest versions their `package.json` ranges already allow (20.1.2 and 7.1.1, from February 2025) bring fixed versions.
- 9.1.1 was published in April 2026 by the official Actions toolkit with signed provenance; every new package in the lock comes from npm's registry with a checksum and none has install scripts. The Docker image runs Node 24; version 9 needs Node 20 or later.

## What we'll change

1. **The Action's entry point:** load the package with `import * as github from "@actions/github"`. Nothing else in the file changes.
   - *Check:* the Action starts in the test suite (the `tests/metrics` suites run it with mocked APIs).
2. **`package.json` and `package-lock.json`:** `@actions/github` to `^9.1.1` (the version #79 proposes); `@octokit/rest` and `@octokit/graphql` updated in the lock file within their current ranges, with npm's `--before=2026-11-18` so nothing is newer than 3 days. `canvas` and the overrides stay as they are.
   - *Check:* every copy of `@octokit/request`, `request-error` and `plugin-paginate-rest` is at or above the fixed version (`npm ls`); a list of every changed lock entry with its publish date; npm audit before and after.
3. **Prove nothing broke:** clean install, lint, build and the full test suite in CI (including the Docker build).
   - *Check:* every check passes, with at least the test totals of `master`.
4. **Record it** in the notes; Renovate closes #79 on its own once `master` has version 9.

## Who's on it

Engineer, QA, Security Officer, Auditor. The research step is done (the findings above). It is security-sensitive (dependency update).

## Risks

- The tests run the Action with mocked APIs and in dry-run mode, so a real run against GitHub (sign-in, commits, pull requests) isn't tested. The reviews checked each call against a local stand-in server. The first real run of the Action after the merge is the final check.
- `@octokit/rest` 20.1.2 uses a pre-release build of its pagination plugin (11.4.4), published by the Octokit maintainers for that line.

## Out of scope

- `@octokit/rest` 21 and later (a newer module format, a separate review), and the other major upgrades in job 10 (puppeteer, faker, Vue).
