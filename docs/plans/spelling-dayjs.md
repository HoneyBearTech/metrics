# Plan: spelling-dayjs

## What Sean asked for

Keep the spelling check passing. It's needed for the new merge rule, which only allows a Renovate PR to merge when both spelling runs pass.

## What we found

- PR #36's notes (`docs/decisions-log.md`) name the package `dayjs`, a new dependency of sanitize-html 2.18.2. The spelling check doesn't know the word, so it now fails on `master` and on every PR, because it checks the whole repository.
- It's the only word it flags.

## What we'll change

1. **Add `dayjs` to the spelling dictionary** (`.github/actions/spelling/expect.txt`), in the file's existing sorted order.
   - Check: this PR's own spelling run passes, and so does master's after merging.

Nothing else changes.

## Who's on it

Engineer, Security Officer, Auditor.

## Risks

- None beyond the usual one: new words added later need adding the same way.

## Out of scope

- Making spelling a required check, or checking only changed files (repo settings and workflows).
