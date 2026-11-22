# Plan: gif-without-canvas

**What Sean asked for:** "start the canvas fix" (the roadmap item: the image library `canvas` doesn't install in the Docker image, so GIF features don't work there).

## What we found

- In the Docker image, `canvas` 2.11.2 fails to install (no ready-made build for Node 24, no libraries to build it). The GIF maker `gifencoder` lists `canvas` as a required dependency, so npm drops it too. `gif()` in `source/app/metrics/utils.mjs` then can't load it and quietly returns a 1-pixel placeholder, so the skyline plugin's animation is blank. No test checks the GIF itself, so CI can't see it.
- `gifencoder` never actually uses `canvas` the way the project calls it: it gets raw pixels. Only the install fails.
- The image library the project already uses, `sharp`, can write animated GIF images from raw frames (tested: 3 frames, looping, 150 ms per frame).
- The alternatives work but cost more: `canvas` 3 through an override (a 24 MB ready-made binary downloaded from GitHub at build time without a checksum in the lock file, and the page library `jsdom` would start using it), or building `canvas` 2 in the image (about 200 MB of build libraries).

## What we'll change

1. **`gif()` in `source/app/metrics/utils.mjs`:** take each frame as raw pixels with `sharp` and join them into an animated GIF with `sharp`, keeping the same options (size, position, number of frames, delay, repeat) and the same placeholder if something fails. `gifencoder` and the PNG decoder `png-js` (used only there) are no longer imported.
   - *Check:* a new focused test calls `gif()` with a stand-in page that returns real PNG frames, and checks the result is a GIF with the right number of frames, size, delay and looping; it fails on the old code where `gifencoder` is missing.
2. **`package.json` and `package-lock.json`:** remove `gifencoder` (and `png-js` if nothing else uses it). `canvas` and its installer leave the lock file. Nothing else changes; every remaining version stays the same.
   - *Check:* a list of every removed lock entry; `npm ls` shows no `canvas`; npm audit before and after (nothing added).
3. **`docs/dependencies.md`:** the `tar` override's reason no longer mentions `canvas`; say whether the override is still needed (`npm ls tar --all`). Removing it, if possible, is a separate job.
4. **Prove it works in the image:** build the Docker image locally and make a GIF from a real page in headless Chrome inside it; lint, build and CI's full test suite.
   - *Check:* the image produces a real animated GIF, not the placeholder; every CI check passes with at least the test totals of `master`.

## Who's on it

Engineer, QA, Security Officer, Auditor. Research is done (findings above). It is security-sensitive (dependency and image changes).

## Risks

- GIF images may look slightly different (`sharp` picks its own colors); the size and timing stay the same. The `quality` option of `gif()` maps to `sharp`'s colour settings rather than `gifencoder`'s.
- Removing packages changes `package-lock.json`, so Renovate's open pull requests need a rebase after this merges.

## Out of scope

- Removing the `tar` override (a separate job if it is no longer needed).
- `canvas` itself: nothing else in the project needs it.
