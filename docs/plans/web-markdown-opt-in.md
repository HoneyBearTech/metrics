# Plan: web-markdown-opt-in

**What Sean asked for:** "start the web template fix" (the roadmap item "Web server lets a request choose the markdown template's address").

## What we found

- **A request chooses the template:** the web server passes a request's options straight to the renderer, so a request can ask for markdown output and give its own template, as a link or a file in any GitHub repository. A markdown template is code, so the server runs it.
- **The default setup is open:** with no settings file, or the documented minimal one with just a token, every output format is enabled, and `auto` picks markdown for the markdown template. Presets, when enabled, can ask for it too. The example settings file is not open, because it lists only svg, png and json.
- **Nothing in the project needs markdown output from the web server:** the web pages never ask for it. The Action renders markdown itself and doesn't go through the web server.

## What we'll change

1. **Refuse markdown output in the web server (`source/app/web/instance.mjs`)** unless the server's settings turn on a new extra feature, `metrics.run.user.template`, or all extra features.
   - The check runs after presets and `auto` are resolved, so every way in is covered.
   - A refused request gets "403 Forbidden: markdown output is disabled on this server", and its template is never fetched.
   - The Action is unchanged.
   - *Check:* tests, plus manual requests against a local server with default settings, with markdown in `outputs`, with presets, and with the feature on.
2. **Tests in `tests/plugins/`:**
   - Markdown output, `markdown-pdf` and `auto` with the markdown template are refused for every settings combination without the feature.
   - svg, png and json are never affected.
   - With the feature on, markdown output works.
   - *Check:* they fail without the change.
3. **Docs:**
   - **Settings docs:** add the new feature to the extra features table in the web setup docs, and to the comments in the example settings.
   - **Interface and security notes:** say in `docs/interfaces.md` and `docs/security.md` that markdown output from the web server runs a template the request chooses and needs the feature.
   - Generated files are rebuilt with `npm run build`.
4. **Prove nothing broke:** lint, build, the focused tests, and CI's full suite.

## Who's on it

Researcher (done), Engineer, QA, Security Officer, Auditor.

## Risks

- **Breaking change for some web servers:** a server that serves markdown output today (empty `outputs`, or `outputs` listing markdown or `auto`) returns 403 until its owner turns on the feature. That's on purpose: that setup lets any visitor run code on the server.
- **All extra features on also allows it:** a server with every extra feature turned on, as in sandbox mode, keeps markdown output. The docs already say never to do that on a public server.

## Out of scope (next jobs)

- **Extra CSS and JavaScript on the web server:** their permission check passes for every settings file, so a request's own CSS and JavaScript may reach the server's browser. This was found while researching this job and needs its own fix.
- **Requests fetching addresses:** presets (when enabled) and some plugin options (when the server enables those plugins) fetch any address a request gives.
- **Wrong error code:** "template not supported" errors are returned as 500 instead of 400.
