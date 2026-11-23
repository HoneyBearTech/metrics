# Plan: express-5

**What Sean asked for:** "express 5 (#118)".

## What we found

- **Renovate's #118 alone breaks the web server:** it moves express, the library the web server is built on, from 4.22.3 to 5.3.0. Merged as it is (it was, in #102), the server won't start, and a repository page loses its options. That's why it was reverted in #114.
- **Four route patterns use the old catch-all and optional forms:** `/about/*`, `/insights/*`, `/embed/*` and `/:login/:repository?`. Express 5 rejects them at startup.
- **The repository page's options get lost:** express 5 reads a request's options fresh from the address every time. The server's own additions for a repository page (the `repository` template and the repository name) are lost unless they go on a copy.
- **Two more changes the trial found:**
  - **Install folder:** if the server is installed under a folder whose name starts with a dot (like `~/.local`), express 5 refuses to send every page. The Docker image isn't affected.
  - **Port in use:** a busy port no longer stops the server with an error.
- **A trial in a scratch copy:** it ran the server on express 4 and on express 5 with these changes, and asked 79 addresses in three modes. Every answer matched, except harmless content-type spelling (for example `utf-8` in lower case).

## What we'll change

1. **Packages:** take Renovate's `package.json` and `package-lock.json` from #118 unchanged. No new packages are added on top.
2. **`source/app/web/instance.mjs`:**
   - Write the four route patterns in express 5's form, matching the same addresses.
   - Put the repository page's additions on a copy of the request's options.
   - Send the server's own files with a setting that allows a dot folder in the install path. The files are only ever chosen by the server, never by the request.
   - Stop with an error when the port is busy, as before.
   - *Check:* the same addresses give the same answers on express 4 and 5, also from a dot folder.
3. **A test in `tests/plugins/`:** it starts the server and asks for pages, files, the old `/about/` addresses and the repository page, and checks that a request's options reach the page.
   - *Check:* it fails on Renovate's branch as it is and passes with the change.
4. **Notes:** mark express 5 done on the roadmap.
5. **Prove nothing broke:** lint, build, the plugin tests, the spelling check and CI's full suite.

## Who's on it

Researcher (done), Engineer, Security Officer, Auditor.

## Risks

- **Bracket-style options are no longer read:** express 5 no longer reads options like `a[b]=c`. Nothing in the repo or its docs uses them.
- **Pictures checked only as text:** images couldn't be drawn on this machine, so page results were checked in JSON form. CI's full suite draws them.
- **#118 closes:** this PR replaces it, and Renovate closes it once `master` has express 5.

## Out of scope

- express-rate-limit 8.
- Any other upgrade.
