# Plan: make the Docker image build again

## What Sean asked for
"Review my fork and fix any of the issues and PRs that are outstanding on lowlighter/metrics but only on my fork." This is the first of the fixes: the one that unbreaks the fork's GitHub Action.

## What we found
- The action rebuilds the image from `Dockerfile` on every run, so a broken Dockerfile means a broken action.
- Today's `Dockerfile` fails during the build step `gem install licensed` (the build tools cannot unpack a needed archive). The install of the app's packages is never reached.
- Other parts are out of date: the Chrome signing step uses a removed tool, the Node 20 base image is end-of-life, and the deno install address is old.
- A trial build using upstream pull request 1855 (Node 24, new Chrome signing, no ruby/`licensed`) finished in about 4.5 minutes. The app's packages installed, the browser started and the image image-processing library loaded.
- On Node 24 one optional package, `libxmljs2` (checks that a generated SVG is valid), silently fails to install at version 0.32. Version 0.37.0 installed and loaded fine in the same image.

## What we'll change
1. Replace `Dockerfile` with the 1855 version: Node 24 (Debian "trixie" slim) base, Chrome installed with a signed keyring, new deno address, Chrome-related settings moved to the top, and the start command written in the safe list form. Check: `docker build` finishes, then Chrome starts and the image library loads inside the image.
2. Drop ruby and `licensed` from the image (the 1855 approach). Effect: the licenses plugin can no longer scan a project's dependency licenses, and says so instead of failing. Check: the plugin's code already tests for `licensed` before using it (`source/plugins/licenses/index.mjs`).
3. Raise `libxmljs2` to `^0.37.0` in `package.json` and update only that package's entries in `package-lock.json` (no other packages change). Check: `npm ci` works and `libxmljs2` loads inside the built image.
4. Run `npm run build` and `npm run linter`, and run the action once with mocked data inside the built image. Revert anything the build regenerates under `.github/`. Check: no change under `.github/`; the test result is reported either way.

## Who's on it
Engineer, QA, Security Officer, Auditor. Plan check beforehand and a plain-English read of the report afterwards.

## Risks
- The licenses plugin loses its dependency scan (see step 2).
- Image is built against Debian "trixie" and Node 24; one plugin or package may behave differently. The mocked run in step 4 is the guard, but it does not cover every plugin.
- `PUPPETEER_BROWSER_PATH` stays a plain command name, which works with the current puppeteer 21. A later puppeteer upgrade would need a full path.

## Out of scope
Plugin fixes for GitHub API changes, dependency bumps beyond `libxmljs2`, new plugins, and anything under `.github/` (workflows are never changed).
