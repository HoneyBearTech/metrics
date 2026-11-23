# Review of the file-type 22 upgrade (2026-11-23)

Sean asked: "file-type 22".

**What file-type does here:** the project uses the library in one place, `imgb64` in `source/app/metrics/utils.mjs`, to tell what kind of image a downloaded picture is.

**The upgrade:** this fork is on 21.3.4. Renovate's PR #116 moves it to 22.3.0, the latest release, which was published on 2026-10-29.

**Earlier attempt:** file-type 22 was merged once before, in #106. It was taken back out in #114 only because it was merged while lint was failing, so its tests never ran.

**How it was reviewed:** a researcher tried the upgrade in a scratch copy. An independent audit, which also covered security and the supply chain, checked the result. Nothing in the repository was changed.

## Recommendation

**Merge PR #116 at file-type `22.3.0`.**
- **No code change:** none is needed.
- **Same results:** the one function the project uses detects images exactly as before.
- **Checks pass:** lint, build and the plugin tests pass with the upgrade merged into today's `master`.
- **Age:** the version is old enough for the repo's 3-day rule.

#116 still goes to Sean to merge, for two reasons:
- **Not only Renovate's commits:** its branch has a merge commit from Sean's "Update branch" button, so not every commit on it is Renovate's.
- **Branch is behind:** the branch is behind `master` (before #117, #120 and #121). It needs another update and a green run on its newest commit first.

## What changed in file-type 22

The breaking changes in 22.0.0, checked against this repo:

| Change | Effect here |
|---|---|
| Needs Node 22 or later | None: the Docker image and CI use Node 24 |
| Stream functions take only web streams | None: the repo doesn't use them |
| The `file-type/core` and `file-type/node` imports are removed | None: the repo imports `file-type` only |
| A type is removed and some file types' names changed | None: the repo only reads the short extension |

Releases 22.0.1 to 22.3.0 are fixes and new formats.

## Checks

- **Same answers before and after:**
  - **Images:** PNG, JPEG, GIF and three other image formats were detected the same way on both versions.
  - **SVG:** SVG with and without an XML header gave the same answer on both.
  - **Other data:** HTML, empty and random data were handled the same way on both.
  - **SVG addresses:** addresses ending in `.svg` skip detection on both versions.
- **Packages:** no packages are added or removed. Only file-type and one helper package it uses (0.4.1 to 0.6.1) change.
  - **Publishers:** they are the same people as before.
  - **Integrity:** the lock file's integrity hashes match the registry.
  - **Contents:** neither package has install scripts, hidden code, binaries or network access.
  - **Security warnings:** npm's security warning count is the same before and after.
- **Tests:**
  - **Merged into master:** with #116 merged into `master` 1f681ad6, the linter and build pass, with no extra changes.
  - **Plugin tests:** 104 passed and 1 skipped.
  - **Full suite:** CI's full suite passed on #116 earlier, on an older `master`.

## Before merging #116

1. Update its branch from `master`, with GitHub's "Update branch" button or Renovate's rebase checkbox.
2. Wait for every check to pass on the new commit.
3. Merge with squash.
