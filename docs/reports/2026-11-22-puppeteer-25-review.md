# Review of the puppeteer 25 upgrade (2026-11-22)

Sean asked: "start the puppeteer 25 review".

Puppeteer is the library that drives the headless Chrome browser. The project uses it for screenshots, GIF images, PDF output and the plugins that read web pages. This fork is on 21.2.1. The latest release is 25.18.1, published on 2026-11-17.

A researcher tried the upgrade in a scratch copy, and an independent audit, which also covered security and the supply chain, checked the result. Both ran it in the Docker image on this machine. Nothing in the repository was changed.

## Recommendation

**Upgrade to puppeteer `^25.18.1`, in a separate job with its own plan.** The change is small. It clears 6 of the 18 npm audit findings, including 6 of the 9 high ones, and it lets all three remaining dependency overrides go.

The new version is old enough for the repo's 3-day rule, and no later 25.x release is out.

Renovate's #71 (puppeteer 21.11.0) fails Build and test, because 21.11 no longer ships the `install.js` file that the `postinstall` script calls. The upgrade replaces it, so #71 can be closed then.

## What has to change

1. **`package.json`:**
   - Change `puppeteer` from `^21.2.1` to `^25.18.1`.
   - Remove the root `postinstall` script (`node node_modules/puppeteer/install.js`). Puppeteer 25 ships `install.mjs` and runs its own installer, so the line would fail and isn't needed. CI's lint job installs with `--ignore-scripts`, and the Docker image skips the browser download.
   - Remove the whole `overrides` block (`tar-fs` under `@puppeteer/browsers`, `ws` and `basic-ftp`). With puppeteer 25, `basic-ftp` and the 3.x `tar-fs` are gone from the lock, and `ws` is 8.23.0 without an override. Removing them changes no package version.
   - Regenerate the lock file with `--before` set at least 3 days back.
2. **`Dockerfile`:**
   - Set `PUPPETEER_BROWSER_PATH` to the full path `/usr/bin/google-chrome-stable`. Puppeteer 25 checks that the file exists before it starts the browser, so the bare name `google-chrome-stable` fails with "Browser was not found at the configured executablePath". Version 21 found it on the `PATH`.
   - Drop `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`, which is no longer read. `PUPPETEER_SKIP_DOWNLOAD` stays.
3. **`source/app/metrics/utils.mjs` (PDF output):** wrap the result as `Buffer.from(await page.pdf())`.
   - **Why:** in 25, `page.pdf()` returns a plain byte array instead of a Node `Buffer`.
   - **Without it:** both the web server and the action's output write it out as text like `{"0":37,"1":80,...}` instead of a PDF file. Both were reproduced. No test catches this today, because the tests only check that the request succeeded.
4. **A PDF test:** add a test that the PDF output starts with `%PDF`, so this can't break silently again.
5. **Docs:**
   - `docs/installing.md` needs the full browser path.
   - It should also say that an install without a skipped download fetches Chrome, which needs the system `unzip`.
   - It should mention that the browser download no longer goes through a proxy setting, because puppeteer's proxy support is now optional and not installed.
   - `docs/dependencies.md` should drop the three override entries.
6. **Optional:**
   - Pass the music plugin's `setUserAgent` an object instead of a string. The string form still works but is marked as old.
   - Change `headless: "new"` to `true`.
   - Fix the PDF console log in `utils.mjs`, which reads a property that doesn't exist and should call `message.text()`. That bug exists today too.

## What was checked

- **Browser calls:** every puppeteer call in `source/` was compared with version 25. Apart from the PDF return value, no other call needs a rewrite.
  - Launch options, navigation, waits, `evaluate`, selectors, style injection, screenshots and closing all behave as before.
  - Screenshots still come back as a `Buffer` on Node 24.
- **In the Docker image (Chrome 158):**
  - Both reviewers ran the browser through the project's own wrapper and got screenshots, a recorded GIF, PNG and JPEG resizing, and a valid PDF after the fix.
  - The image builds.
  - Lint and the build pass.
  - All 68 focused plugin tests pass.
- **The main test suite, one part at a time:** the machine's thread limit can't run CI's four parallel workers.
  - Parts 1, 3 and 4 passed.
  - Part 2 had 3 failures in one full run, all in "Random track from playlist" through the web server (Apple Music, Spotify, YouTube Music). The same cases passed when run again on their own.
  - These cases open the real music sites in the browser even with stand-in data. The same Spotify case failed once on `master` in CI (PR #96), and failed in a comparison run on puppeteer 21 here.
  - So they look flaky rather than broken, but that isn't proven. The upgrade job needs a clean CI run on GitHub before it merges.
- **npm audit:**
  - Before: 18 findings (9 high, 8 moderate, 1 low).
  - After: 12 findings (3 high, 8 moderate, 1 low).
  - All the puppeteer ones go away: `puppeteer`, `@puppeteer/browsers`, `extract-zip`, `ip` and `pac-resolver`. The 3 high findings left are `@faker-js/faker`, `decode-uri-component` and `query-string`.
- **Supply chain:**
  - `puppeteer`, `puppeteer-core` and `@puppeteer/browsers` are published from the project's own release workflow, with provenance.
  - The lock loses 62 packages and gains 16, among them `modern-tar` (unpacks browser downloads), `zod` and `lilconfig`.
  - The new packages have no install scripts, and their code shows nothing unexpected.
  - The only install script from this change is puppeteer's own browser download.

## Risks

- **Chrome version drift:** the image installs Google's current stable Chrome, 158 today, while 25.18.1 targets 157. It works now, but a future Chrome could need a newer puppeteer.
- **Untested plugin output:** a page-reading plugin can render successfully with nothing in it, such as a playlist with no tracks. The test suite doesn't check the contents, so a site change wouldn't be noticed.
- **Browser left running:** two plugins leave a browser running when they fail (music) or always (achievements). This exists today and isn't caused by the upgrade, but it can slow a long-running web server. It goes on the roadmap.
