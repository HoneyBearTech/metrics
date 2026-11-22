# Plan: close-browsers

**What Sean asked for:** "start the browser leak fix" (the roadmap item "Browsers left running").

## What we found

- Nine places start their own headless browser.
  - **Never closed:** the achievements plugin and the community 16personalities plugin.
  - **Closed only when everything works:** the music, skyline, starlists, support and topics plugins, the community screenshot plugin, and the insights page output (`source/app/metrics/index.mjs`). If a page fails to load or a step throws, the browser stays running.
- In the web server, which keeps running between requests, each left-over browser keeps its processes. On puppeteer 25, the main test part 2 ran a Docker container into its limit of 829 processes, so Chrome could no longer start, and every later request failed (PR #98). It passed with the limit raised, and in CI.
- The shared browser that `svg.resize` and `svg.pdf` reuse (`source/app/metrics/utils.mjs`) is kept open on purpose and isn't part of this job.

## What we'll change

1. **Each of the nine places:** close the browser in a `finally` block, so it closes whether the work succeeds or fails. Errors from closing are logged and ignored, so they can't hide the real error. The plugins' results and messages stay the same.
   - **Achievements:** the browser it starts while filling in GitHub's totals.
   - **Music:** the playlist browser.
   - **Skyline, starlists, support, topics, screenshot, 16personalities:** the plugin's browser.
   - **Insights output:** its browser.
   - *Check:* each change is a small diff that only moves or adds the `close()`; lint passes.
2. **Tests in `tests/plugins/`:** with a stand-in browser that records `close()`, check that the browser is closed both when the work succeeds and when a page step throws.
   - Cover at least achievements, music and one of the simple plugins.
   - *Check:* each test fails on the old code and passes on the new.
3. **Prove it helps:**
   - Run the main test part 2 alone in the Docker image at this machine's normal limit of 829 processes, which failed on #98, and measure the highest process count.
   - Run the other parts one at a time.
   - CI's full suite has to pass.

## Who's on it

Engineer, QA, Auditor. No research: the leaks were found and checked in PR #98.

## Risks

- **Closing too early:** a `finally` placed too early could close the browser while a page is still in use. The tests and the full suite check the plugins still produce the same output.
- **Part 2 may still fail here:** it may still hit this machine's limit for other reasons, such as the shared `svg.resize` browser. If so, we report the measured numbers and leave it; CI is unaffected.

## Out of scope

- The shared `svg.resize` browser.
- Other changes to these plugins, such as the music tests that reach the real sites.
