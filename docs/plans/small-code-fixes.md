# Plan: small-code-fixes

**What Sean asked for:** "start job 4 of the security plan" (job 4 of `docs/reports/2026-11-21-security-findings-plan.md`: small code fixes for code scanning alerts 9, 10, 11, 12 and 16).

## What we found

- **Alerts 9, 10 and 11 (medium):** two web pages call their own server with the user name taken from the page's address, without encoding it: the embed page's "generate" button (`source/app/web/statics/embed/app.js`, the `/.uncache` calls) and the insights page (`source/app/web/statics/insights/script.js`, the `/insights/query/...` calls). A name containing `/`, `?` or `#` changes which address is called. The risk is low, since the call stays on the same site, but encoding the name is the right fix.
- **Alert 12 (high):** the languages plugin's in-depth analyzer saves each public signing key it fetches to a predictable file name in the shared system temporary folder (`source/plugins/languages/analyzer/indepth.mjs`). On a machine shared with other users, someone could create that file first. On GitHub's runners this doesn't matter, but the fix is small.
- **Alert 16 (high), and alert 5 (the same rule and line, shown without a state):** the analyzer's fallback id is `Math.random()` (`source/plugins/languages/analyzer/analyzer.mjs`). It only names temporary folders, so it is a false alarm, but switching to `crypto.randomUUID()` is one line.

## What we'll change

1. **Encode the user name** (and the plugin name on the insights page) with `encodeURIComponent` wherever those pages build a request address from it, and build the `/.uncache` query with `URLSearchParams`.
   - *Check:* a focused test that loads each page's script and confirms a name such as `a/b?c#d` is sent encoded and a normal name is sent unchanged; code scanning on this pull request no longer reports alerts 9, 10 and 11.
2. **Write signing keys inside a private temporary folder:** create one with `fs.mkdtemp` (readable only by the current user) for the import step, save each key inside it, and remove the whole folder when done, even after an error.
   - *Check:* a focused test with a fake shell that confirms the key file is written inside a new private folder (not directly in the system temporary folder) and that the folder is gone afterwards; code scanning no longer reports alert 12.
3. **Use `crypto.randomUUID()`** for the analyzer's fallback id.
   - *Check:* the existing languages tests pass; code scanning no longer reports alert 16 (and alert 5, if GitHub tracks it).
4. **Record it:** the notes.

## Who's on it

Engineer, QA, Security Officer, Auditor. No separate research step: this job was researched for the findings plan. It is security-sensitive (it fixes security findings and touches file permissions).

## Risks

- **Encoding a name that was already encoded:** if a page ever receives a name that is already encoded, it would be encoded twice. GitHub user names only use letters, digits and `-`, so a real name is unchanged.
- **The private folder:** the signing-key step runs `gpg` on the file; a new folder doesn't change that command, only where the file is.

## Out of scope

The analyzer's cloned-repository folders, which also use a predictable name in the system temporary folder but were not flagged (added to the roadmap); the other code scanning alerts (job 5 deletes `.github/scripts`, job 6 dismisses the false alarms).
