# Plan: quiet-ci-warnings

**What Sean asked for:** "fix the url.parse warning and debconf noise"

## What we found

- The "Build and test" log shows four red warning blocks while the tests run. Node prints them because the PageSpeed plugin (`source/plugins/pagespeed/index.mjs`, line 19) still reads the website address with Node's old `url.parse()`, which Node now marks as outdated and unsafe. It is the only place in the fork's code that still uses it. The test helper copies the test web server's error output into the log, so the warning shows once for each of the four test parts. The tests still pass.
- The Docker build log shows many lines saying the package installer "is unable to initialize" a screen and falls back to defaults. The installer tries to ask questions, finds no screen, and uses its defaults. Nothing goes wrong, but the lines hide real problems in the log.

## What we'll change

1. **Read the website address the modern way in the PageSpeed plugin.** Replace `url.parse()` with the standard `URL` reader built into Node. The plugin keeps adding `https://` when the address has none, and keeps showing only the site's protocol and host on the card. An address that can't be read gives the plugin's normal "Website URL is not valid" style error on the card instead of a crash or an odd result.
   - *Check:* a new focused test in `tests/plugins/` runs the plugin with a fake PageSpeed response, without any network access. It checks an address with and without `https://`, one with a port and a path, and one that can't be read. The existing PageSpeed cases in the metrics suite still pass.
2. **Tell the package installer in the Docker build that nobody is there to answer questions.** Add one build-only setting to the `Dockerfile`, in the standard form for this. It applies while the image is built and isn't kept in the finished image, so the action runs exactly as before.
   - *Check:* the Docker build passes in CI and its log no longer shows the "unable to initialize" lines.
3. **Add any new words the spelling check needs** (such as the setting's value) to the spelling dictionary, in the same pull request.
   - *Check:* both spelling check runs pass on this pull request.

No workflow file changes.

## Who's on it

Engineer, QA, Security Officer, Auditor. CI on this pull request runs the Docker build and the full test suite, and its log is where we check that the warnings are gone.

## Risks

- **Addresses read slightly differently:** the modern reader drops a port that is the default for the protocol (for example `:443` on `https://`), and it rejects a few malformed addresses that the old reader let through. Only the label on the card changes in the first case; the address sent to Google stays exactly what the user gave. A rejected address would have failed at Google anyway, and now shows a clear error.
- **Other warnings:** if a library the project uses also calls the outdated reader, a warning could remain. The CI log on this pull request will show it; we'd note it on the roadmap and leave it for another job.

## Out of scope

The npm warnings in the build log (deprecated packages, the security audit count, install scripts awaiting approval). They concern the project's dependencies and belong to dependency upkeep. The other lines in the build log (for example services not started inside the build) are normal and stay.
