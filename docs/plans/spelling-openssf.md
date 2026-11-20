# Plan: spelling-openssf

## What Sean asked for

"yes, add openssf" - make the spelling check pass on master again.

## What we found

- After PR #27 the spelling check on master passed. Then PR #15 (labelling Renovate's security PRs) added the label `openssf` on line 7 of `renovate.json`, and master's spelling check now flags that one word.
- PR #15's own spelling check flagged it too, but spelling isn't a required check, so the PR could still be merged.

## What we'll change

1. **Add `openssf` to the spelling dictionary** (`.github/actions/spelling/expect.txt`), in the file's existing sorted order.
   - Check: this PR's own spelling run passes, and so does master's after merging.

Nothing else changes.

## Who's on it

Engineer, Security Officer, Auditor.

## Risks

- None beyond the usual one: later new words need adding the same way. Making spelling a required check would stop this; that's a repo setting only Sean can change.

## Out of scope

- Changing `renovate.json` or the repo's branch rules.
- Removing the dictionary entries the check reports as unused.
