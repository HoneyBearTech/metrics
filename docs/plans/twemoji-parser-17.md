# Plan: twemoji-parser-17

**What Sean asked for:** "do the code changes on 75 and 83". This is the `@twemoji/parser` part; `@actions/core` has its own pull request.

## What we found

- **What version 17 changes:** it knows newer emoji and keeps more combined emoji whole.
- **Dropped matches:** from 17.0.2, about 200 characters such as ✔ ☺ ⚠ are no longer emoji unless written with the emoji variant. Ten characters written with it, such as ✌️, come back as an empty match.
- **The crash:** an empty match makes `svg.twemojis` in `source/app/metrics/utils.mjs` fail with an invalid-address error whenever emoji images are switched on. That is why Renovate's #83 can't be merged alone.
- **The guard:** skipping matches with no address, `twemojis.parse(rendered).filter(({url}) => url)`, avoids the crash. It also helps on older versions, which return an empty match for a lone variant character.
- **Version 17.0.2 is old enough:** it was published on 2026-06-01.
- The majors review is `docs/reports/2026-11-22-majors-review.md`.

## What we'll change

1. **Version:** `package.json` and `package-lock.json` move to `@twemoji/parser` 17.0.2, the version Renovate proposes.
   - *Check:* the lock file changes only that package, and `npm audit` doesn't get worse.
2. **Guard:** in `svg.twemojis`, skip matches with no address.
   - *Check:* a new test in `tests/plugins/` renders text with ✌️, ✔ and a normal emoji with emoji images on. It must not crash, and the normal emoji must still become an image. The test fails without the guard.
3. **Prove nothing broke:** lint, the focused tests and CI's full suite.
4. **After merging:** Renovate's #83 is no longer needed, and Renovate closes it on its own.

## Who's on it

Engineer, QA, Security Officer, Auditor. No new research: the majors review already covered it.

## Risks

- **Characters that are no longer images:** characters that version 17 no longer treats as emoji show in the normal font instead of as images. That is the library's own choice.

## Out of scope

- `@actions/core` 3 (#75), in its own pull request.
