# Plan: spelling-dict

## What Sean asked for

"yes, start the spelling job" - make the spelling check pass on master by adding the words it flags to its dictionary.

## What we found

- After the workflow update (PR #10), the spelling check really scans the repository for the first time. On master it flags 107 occurrences of 41 distinct words (case variants included).
- They are real words and names added by the earlier fixes, notes and tests, not typos. Examples: `trixie`, `keyring`, `dearmor`, `noto` (Docker); `roadmap`, `triaged`, `Shikimori`, `Letterboxd` (notes); `ttl`, `basehead`, `pushcommits`, `unprocessable` (code); `freegames`, `usd`, `eur`, `jpy` (plugin options); `ETIMEDOUT`, `getaddrinfo` (error names in tests).

## What we'll change

1. **Add the flagged words to the spelling dictionary** (`.github/actions/spelling/expect.txt`), in the file's existing sorted, one-word-per-line format. A word that turns out to be a real typo in our own text is corrected instead of added.
   - Check: the list added matches the words flagged on master's last spelling run, and the file stays sorted with no duplicates.
2. **Fix the dictionary folder's small warnings** if they're trivial (e.g. a missing final newline in `excludes.txt`).
3. **Proof:** the spelling check on this PR's own branch run passes, and the check on master passes after merging.

Nothing else changes: no workflow files, no code.

## Who's on it

Engineer, Security Officer, Auditor. Research was done by the plan review (the word list comes from master's spelling run).

## Risks

- New words added to the repo later will make the check fail again until they're added too; that's how the check is meant to work.
- If the check flags further words once these are in (it only lists a sample per file in some cases), they are added in the same PR.

## Out of scope

- Changing the spelling check's settings or workflow.
- Rewording any notes or code to avoid words.
