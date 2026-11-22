# Plan: puppeteer-25

**What Sean asked for:** "start the puppeteer 25 upgrade", following the review in `docs/reports/2026-11-22-puppeteer-25-review.md` (PR #97).

## What we found (from the review)

- Puppeteer 25.18.1 (published 2026-11-17) works with this project after four changes, and clears 6 of the 9 high npm audit findings.
- It won't start Chrome from a bare name, so the `Dockerfile` must give the full path.
- Its `page.pdf()` returns raw bytes instead of a Node `Buffer`. The web server and the action would then write PDF output as text. No test catches this today.
- The root install script (`node node_modules/puppeteer/install.js`) and all three remaining overrides (`tar-fs` under `@puppeteer/browsers`, `ws`, `basic-ftp`) are no longer needed.

## What we'll change

1. **`package.json` and `package-lock.json`:**
   - Change `puppeteer` from `^21.2.1` to `^25.18.1`.
   - Remove the root `postinstall` script.
   - Remove the `overrides` block.
   - Regenerate the lock with npm's `--before=2026-11-19`.
   - *Check:* `npm ci` passes. List every changed lock entry. `npm ls tar-fs ws basic-ftp --all` shows no vulnerable version. Run npm audit before and after; expect 18 to 12 findings, 9 to 3 high.
2. **`Dockerfile`:**
   - Set `PUPPETEER_BROWSER_PATH=/usr/bin/google-chrome-stable`.
   - Remove `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`, which is no longer read. `PUPPETEER_SKIP_DOWNLOAD` stays.
   - *Check:* the image builds and the browser starts in it.
3. **`source/app/metrics/utils.mjs` (PDF output):**
   - Use `Buffer.from(await page.pdf())`.
   - Fix the PDF console log to call `message.text()`; it reads a property that doesn't exist.
   - *Check:* the new test in step 4.
4. **A PDF test in `tests/plugins/`:**
   - Check that `svg.pdf()` returns a `Buffer` whose bytes start with `%PDF`, using a stand-in browser whose `pdf()` returns plain bytes, as puppeteer 25 does.
   - Add a real-browser run where the browser is available. CI runs these tests inside the Docker image, which has Chrome.
   - *Check:* the test fails without the fix and passes with it.
5. **Docs:**
   - `docs/installing.md`: the full browser path. An install that doesn't skip the download fetches Chrome and needs the system `unzip`. That download no longer uses a proxy setting.
   - `docs/dependencies.md`: drop the three override entries and say why.
   - Check the README and CONTRIBUTING for anything now wrong.
6. **Prove nothing broke:**
   - Lint, build and the focused tests.
   - A smoke run in the Docker image: screenshot, GIF image, PDF.
   - Each main test part on its own. This machine can't run CI's four parallel workers.
   - CI's full suite on GitHub has to pass.

## Who's on it

Engineer, QA, Security Officer, Auditor. No new research: the review covered it.

## Risks

- **Flaky playlist tests:** three web-server playlist tests open the real music sites and fail now and then, on puppeteer 21 too. If one fails in CI, it is re-run, and the cause is checked before it is called flaky.
- **Chrome versions:** the image installs Google's current Chrome (158), one version ahead of what 25.18.1 targets (157). It works today.
- **Local installs:** they now download Chrome through puppeteer's own installer unless `PUPPETEER_SKIP_DOWNLOAD=true` is set.
- **Renovate:** the lock file changes a lot, so Renovate's open pull requests may need a rebase. Renovate's #71 (puppeteer 21.11.0, failing its build) becomes out of date and is closed after the merge.

## Out of scope

- Browsers left running by the achievements and music plugins (a separate roadmap item).
- The optional clean-ups from the review (`setUserAgent` object form, `headless: true`).
- No workflow changes.
