# Plan: markdown-single-pass

**What Sean asked for:** "start the markdown template fix" (the roadmap item "Markdown template runs plugin text as template code").

## What we found

- The markdown output (`source/app/metrics/index.mjs`) runs the template twice: once with `<% %>`, then again with `{% %}`, after rewriting `{{ x }}` to `{%= x %}`. Whatever the first pass prints is run as code by the second.
- **Data that becomes code:** the first pass prints plugin data, through the shipped partials (RSS, posts, activity, topics, tweets) and through a template's own `<%= %>`. Text in that data written as `{% ... %}` is then run as code. Anyone who controls such text, like a feed title or a commit message, could run code in the Action of someone using the markdown template, with their token. This was reproduced with a harmless marker.
  - **HTML escaping doesn't stop it:** `<%=` escapes quotes but not braces.
- **Breakage without any attacker:** a feed or post title that simply contains `{%` breaks the render.
- **Why there are two passes:** the second pass exists only for the `{{ x }}` shortcut, so a single pass can keep the same syntax.
- **Shipped files use only `<% %>`:** the partials and examples never use `{{ }}` or `{% %}`.

## What we'll change

1. **One pass:**
   - Add a small helper in `source/app/metrics/utils.mjs` that rewrites `{{ x }}` to `<%= x %>` and `{% ... %}` to `<% ... %>` in the template source. It leaves existing `<% ... %>` blocks untouched.
   - `index.mjs` then renders the result once, so printed data is never run again.
   - *Check:* `example.md` and `example.pdf.md` render byte-identical before and after, with fixed stand-in data.
2. **Tests in `tests/plugins/`:**
   - **Data stays text:** a marker in an RSS title, a post title and a `<%= %>` field must not run, and must appear as plain text.
   - **Every documented syntax still works:** `{{ }}`, `{%= %}`, `{%- %}`, `<%= %>`, `<%- %>`, `<%_ _%>`, comments, `<%%`, loops mixing both styles, and `include`.
   - *Check:* the tests fail on today's code and pass with the fix.
3. **Docs:** a short note in `source/templates/markdown/README.md` that a markdown template is code and should be trusted like a workflow file, and that plugin data is never run as code.
4. **Prove nothing broke:** lint, build, the focused tests, and CI's full suite.

## Who's on it

Researcher (done), Engineer, QA, Security Officer, Auditor.

## Risks

- **Shared scope:** `{{ }}` and `{% %}` now share a scope with `<% %>`. A template that relied on a variable from the first pass being invisible in the second would change. No shipped file or documented example does.
- **Code inside code:** a `{{ }}` or `{% %}` written inside a `<% %>` block is now left alone.
- **More cases now work:** two cases that failed before, such as a `{%= %}` inside a `<% %>` loop, now work.

## Out of scope (next job)

- **Choosing a template address from a web request:** the web server lets a request choose the template address. When the server's `outputs` setting is empty, which enables every format, that means anyone can run code on the server. This needs its own fix right after this one. The example settings don't enable markdown output.
- **Raw HTML in PDF output:** in `markdown-pdf`, the rendered HTML is loaded into the browser without cleaning. A separate look.
