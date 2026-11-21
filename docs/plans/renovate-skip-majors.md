# Plan: renovate-skip-majors

## What Sean asked for

"close 22 and 26", plus the Renovate settings change that goes with it (from the Renovate review): stop Renovate proposing the faker and Vue major updates, and add a waiting period for new releases.

## What we found

- #22 (faker 10) and #26 (Vue 3) are closed. Renovate replied on both that it will ignore that one major version (10.x and 3.x). It would still open a PR for the next one (faker 11, Vue 4), and the block lives only in PR history: one click on the Dependency Dashboard (issue #14) undoes it.
- Renovate's settings support a rule that turns off major updates for chosen packages. Reading Renovate's own code shows its security PRs respect that rule too. Minor and patch updates, and security fixes inside the current major, still come.
- Renovate's documentation says security updates skip the waiting period, so a 3-day wait only delays ordinary updates. The profile repo already uses a 3-day wait.
- Of the open Renovate PRs, only #28 (codeql-action, released about a day ago) is under 3 days old. Renovate may hold it back for a day or two, after which it comes back as before.

## What we'll change

1. **`renovate.json`:** add a 3-day wait for new releases (`minimumReleaseAge`, with `timestamp-optional` as in the profile repo). Add one rule that turns off major updates for `@faker-js/faker` and `vue`, with a short note on why and when to remove it. The labels on security PRs stay as they are.
   - Check: Renovate's config validator passes (`npx --yes --package renovate renovate-config-validator renovate.json`). On Renovate's first run after merging, its log and the Dependency Dashboard show no errors, and faker and Vue don't come back as PRs.

Nothing else changes.

## Who's on it

Engineer, Security Officer, Auditor.

## Risks

- **A security fix that only exists in a new major of faker or Vue won't be proposed.** That's the trade-off the review accepted: faker is used only by the tests, and the Vue bug needs untrusted templates, which metrics doesn't use. Remove the rule when the Vue 3 or faker migration is done.
- **The wait holds ordinary updates for 3 days.** Security updates aren't affected.

## Out of scope

- The Vue 3 and faker migrations.
- Merging the other Renovate PRs, and the merge rule (a separate PR).
- Automatic merging by Renovate.
