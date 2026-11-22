# Plan: remove-tar-override

**What Sean asked for:** "start the tar override removal" (the roadmap item left by PR #94).

## What we found

- `package.json`'s `overrides` pins `tar` to 7.5.23 everywhere. It was added because the image library `canvas` used an installer that asked for the vulnerable `tar` 6.
- Since PR #94, `canvas` and its installer are gone. The only packages that use `tar` are `node-gyp` and its cache library `cacache` (through the XML library `libxmljs2`), and both ask for `^7.4.3`, which already allows the fixed 7.5.23 that the lock file has.
- So the override no longer changes anything; it only stops future fixes for `tar` arriving through normal updates.

## What we'll change

1. **`package.json`:** remove the `"tar": "7.5.23"` line from `overrides`; the other three overrides stay as they are.
   - *Check:* `package-lock.json` is regenerated with npm's `--before=2026-11-19` and `tar` stays 7.5.23 (or another fixed 7.5.x at least 3 days old); a list of every changed lock entry; `npm ls tar --all` shows no 6.x; npm audit before and after (nothing added).
2. **`docs/dependencies.md`:** remove the `tar` bullet from the overrides list and say why in one line.
3. **Prove nothing broke:** clean install, lint, build and CI's full test suite (including the Docker build).

## Who's on it

Engineer, Auditor (with the security review). Trivial job: no research, and QA's checks are covered by the audit and CI.

## Risks

- None expected: the lock file should not change apart from the override itself. `package-lock.json` changes mean Renovate's open pull requests may need a rebase.

## Out of scope

- The other overrides (`tar-fs`, `ws`, `basic-ftp`), which wait for the puppeteer upgrade.
