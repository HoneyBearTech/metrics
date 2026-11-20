# Plan: spelling-renovate

## What Sean asked for

"yes, add renovatebot and delete the old branches" - make the spelling check pass on master again.

## What we found

- After the dictionary fix (PR #11) was merged, the spelling check on master flags one word: `renovatebot`, in the schema link on line 2 of `renovate.json`. That file came with Renovate's setup and reached master after PR #11's branch was made, so PR #11's own check never saw it.
- The old branches are already deleted (`team/spelling-dict`, after checking its content is on master).

## What we'll change

1. **Add `renovatebot` to the spelling dictionary** (`.github/actions/spelling/expect.txt`), in the file's existing sorted order.
   - Check: this PR's own spelling run passes, and so does master's after merging.

Nothing else changes.

## Who's on it

Engineer, Security Officer, Auditor.

## Risks

- None beyond the usual one: later new words need adding the same way.

## Out of scope

- Removing the dictionary entries the check reports as unused.
- Changing `renovate.json`.
