# Plan: marked-18

**What Sean asked for:** "all in order". This is the first of the three code-change jobs from the majors review (#128): marked 18, instead of Renovate's #123 as it is.

## What we found

- **Two options are gone:** marked 18 removed the `highlight` and `xhtml` options that `markdown()` in `source/app/metrics/utils.mjs` relies on.
- **#123 alone breaks things quietly:** its checks pass, but code in comments and descriptions loses its highlighting. Tags like `<br>`, `<img>` and `<hr>` are no longer closed in the multi-line mode, which makes those pictures invalid XML.
- **The picture check now catches the second problem:** it really runs since #131, so #123's tests may now fail on it.
- **Other uses of marked:** the documentation pages (`source/app/metrics/metadata.mjs`) and PDF output (`utils.mjs`) use marked without those options.
- **Already prepared:** a Researcher built a change in the review that keeps single-line output byte for byte the same.

## What we'll change

1. **Package files:** `package.json` and `package-lock.json` exactly as Renovate's #123 (marked 18.2.1).
   - *Check:* no difference from Renovate's branch.
2. **`source/app/metrics/utils.mjs`, `markdown()`:**
   - its own marked parser with a code renderer that keeps the highlighting;
   - a step that closes `<br>`, `<hr>`, `<img>` and `<input>` tags.
   - The fixes from #131 (one `class`, escaped `&`, removed control characters) stay as they are.
   - *Check:* the same inputs through master and the branch, in both modes. Every changed output is listed and explained; the multi-line output passes the XML checker.
3. **Tests:**
   - code is highlighted;
   - multi-line output with a line break, an image, a rule and a task list is valid XML.
   - *Check:* both fail on #123's code without the change.
4. **Documentation pages and PDF output:** check what marked 18 changes in them.
   - `npm run build`, then compare the generated files with master's. Explain every difference, or fix it if small.
5. **Notes:** roadmap.
6. **Prove nothing broke:** lint, build, the plugin tests, the picture tests on this machine with checking on, the spelling check and CI's full suite.

## Who's on it

Engineer, Auditor (with the security pass, since this touches how user text becomes HTML).

## Risks

- **User text from sponsors, activity and Stack Overflow goes through `markdown()`:** a mistake could change how it looks or let markup through. The clean-up steps before and after marked stay, and the audit checks this.
- **Small changes in generated docs:** the docs may change slightly, for example in heading anchors. Each one is listed.

## Out of scope

- linguist-js 3 and js-yaml 5 (their own jobs).
- #132 yargs-parser 22.
- Renovate's #123 is replaced by this PR. Once this one is merged, Renovate should close #123 on its own; if it doesn't, Sean closes it.
