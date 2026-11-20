# Plan: real-run-fixes

## What Sean asked for

"yes, start the fix job" - fix the two problems the first real run of the metrics workflow showed on his profile.

## What we found

- **Recent activity crashes ("Unexpected error").** GitHub now trims pull-request events the same way it trimmed push events. Pull request, review and review-comment events only carry the PR's number, link and branches - no author, title, description, merge state or line counts. The `activity` plugin reads those missing fields and crashes. Checked against live data: issues, releases, forks and the other event types are unchanged, and no other plugin reads pull-request events.
- **Recently used languages is empty ("No recent push activity found").** The analyzer keeps only push events made by the account, but compares usernames case-sensitively: it lowercases the event's username and not the account's. Any username with capitals (like `HoneyBearTech`) matches nothing. Reproduced against live data: 0 push events kept before the fix, 37 after. This bug is older than the earlier fixes; the test data uses an all-lowercase username, so tests never caught it.
- The same analyzer also over-counts the commits it shows (it starts from the number of push events and then adds each commit again).

## What we'll change

1. **Recent activity: look up pull-request details only for events that will be shown.**
   - Add a small cached helper next to the existing push helper (`source/app/metrics/utils.mjs`) that fetches one pull request's details, never crashes, and reuses results within a run.
   - In `source/plugins/activity/index.mjs`, pull request, review and review-comment events fetch their details lazily, in the same "only what will be displayed" loop already used for pushes, so a normal run costs about 5 extra API calls, not hundreds.
   - If a pull request can't be read (deleted repository, no access), that event is skipped and the next one is used instead of crashing.
   - The "ignored users" filter for pull-request authors still works (applied once the author is known).
   - Check: updated test data in the new trimmed shape, a new stand-in for the pull-request lookup, and the Recent activity tests pass.
2. **Recently used languages: compare usernames regardless of capitals.**
   - In `source/plugins/languages/analyzer/recent.mjs`, compare the event's username and the account's username both lowercased, the same way `habits` and `code` already do.
   - Fix the over-counted commit total in the same file.
   - Check: a new test with a mixed-case username, and the Languages tests pass.
3. **Lint, build and tests.** `npm run linter`, `npm run build` (generated files refreshed if anything changes; nothing under `.github/` is touched), and the stand-in test suite for Recent activity and Languages in the Docker test image.
4. **After merging:** one more real run of the workflow on Sean's profile to confirm both sections show data.

## Who's on it

Engineer, QA, Security Officer, Auditor. Research is done.

## Risks

- Each shown pull-request event costs one extra API call (about 5 per run with defaults); results are cached within a run.
- Pull-request events from repositories the token can't read are skipped rather than shown.
- Event types not seen in live data (commit comments, wiki edits) can't be checked against the new format; they're left unchanged.

## Out of scope

- Changing the shared username filter used by many plugins (a wider change with regression risk).
- Fixing the fork's CI checks (needs changes under `.github/`).
- Adding the metrics image to Sean's profile README (separate small change in another repo).
