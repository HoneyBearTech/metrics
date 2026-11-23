# Plan: svg-check-fix

**What Sean asked for:** "go with the majors next". The majors review (#128) puts this fix first, before Node 26 (#125) and marked 18.

## What we found

- **The SVG check is backwards:** `source/app/metrics/index.mjs` (about line 219) checks `if (!libxmljs)` before using the optional XML checker `libxmljs2`.
  - **When the checker is missing**, every picture with checking turned on crashes ("Cannot read properties of null"). That's why Node 26, where the checker can't be built, fails 242 tests.
  - **When the checker is present** (today, on Node 24), the check is silently skipped. Pictures have never really been checked.
- **An older bug the check would catch:** multi-line code blocks get a second `class` on the same tag (`source/app/metrics/utils.mjs`, about line 463). That's invalid XML. A classic sponsors picture with a two-line code block in its description fails the check.
- **The check will run for the first time:** CI's full test suite turns checking on for every picture it draws, so it will check them all on Node 24.

## What we'll change

1. **`source/app/metrics/index.mjs`:** check pictures when the checker is present, and skip with a note when it's missing. The check moves into a small function the tests can call.
   - *Check:* tests with the checker present (a bad picture is refused, a good one passes) and missing (no crash).
2. **`source/app/metrics/utils.mjs`:** multi-line code blocks keep one `class`, with `language-multiline` added to the existing one.
   - *Check:* a test that the multi-line output is valid XML.
3. **Any other invalid pictures** CI's full suite finds once checking runs: fix each in the template or plugin that makes it. If one is large, stop and report it instead.
   - *Check:* CI's full suite passes with checking on.
4. **Notes:** roadmap.
5. **Prove nothing broke:** lint, build, the plugin tests, the spelling check and CI's full suite.

## Who's on it

Engineer, Auditor (with the security pass). Research was done in the majors review.

## Risks

- **Checking may turn up more broken pictures than expected.** That's the point of the check. Large fixes become their own jobs.
- **On Node 26 the check stays off** until `libxmljs2` supports it.

## Out of scope

- Node 26 itself (#125, Sean merges it).
- marked 18.
