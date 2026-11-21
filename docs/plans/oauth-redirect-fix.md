# Plan: oauth-redirect-fix

**What Sean asked for:** "start job 1 of the security plan" (job 1 of `docs/reports/2026-11-21-security-findings-plan.md`: the web server's sign-in redirect and cache-reset password).

## What we found

- **The sign-in page sends the browser wherever its `to` value says** (`source/app/web/statics/oauth/redirect.html`). A crafted link such as `/.oauth/redirect?to=javascript:...` runs script on the web server's own site, and `to=https://other.site` sends the visitor elsewhere right after signing in. These are code scanning alerts 4 and 6. This only affects a self-hosted web server with GitHub sign-in turned on; the GitHub Action is not affected.
- **The server keeps the wrong value as the return address** (`source/app/web/instance.mjs`, the `/.oauth/authenticate` route). It reads `from` from the `scopes` parameter, so after signing in, people are sent to an address made of the permission names instead of the page they came from. When there is no return address, the redirect link carries the text `null`.
- **The cache-reset password is made with `Math.random()`** (the `/.uncache` route in the same file). That kind of random number can be predicted, so it should not be used for anything that works as a password. Sign-in states and sessions already use the secure random function.
- The pages that start sign-in (`app.js`, `insights/script.js`) pass their own full address as `from`, so the return address is normally a full address on the same site, not just a path.

## What we'll change

1. **Only follow a return address on the same site.** In `redirect.html`, the browser goes to `to` only if it is an `http` or `https` address on the page's own site (a full address or a path). Anything else (`javascript:`, `//other.site`, another site, nonsense) goes to `/.oauth`, as it does today when `to` is missing. The session is still saved first, as it is today.
   - *Check:* a new focused test runs the page's script with a fake browser address and records where it sends the browser, for the cases `javascript:alert(1)`, `JavaScript:alert(1)`, `//other.site`, `https://other.site/x`, `/\other.site`, an empty value, `/insights/someone`, and a full same-site address. The bad ones must go to `/.oauth`; the good ones to the given address.
2. **The server keeps the right return address, and only a safe one.** In `/.oauth/authenticate`, read `from` from the `from` parameter and keep it only if it is an address on the site named in the web server's sign-in settings (`oauth.url`). Otherwise keep none. When there is none, leave `to` out of the redirect link instead of writing `null`.
   - *Check:* the check is a small function with its own focused tests (same-site full address and path kept; other sites, `javascript:` and missing values dropped).
3. **A secure random cache-reset password.** Make it with Node's `crypto.randomBytes` (already used by the same file for sessions), the same length or longer.
   - *Check:* a focused test, or a code read in review, that `Math.random` is no longer used in `instance.mjs`; the existing web server tests still pass.
4. **Run the new tests in CI** with the other focused tests, and record the change in the notes.
   - *Check:* the CI log for this pull request shows the new tests passing, and the full suite still passes.

Code scanning should close alerts 4 and 6 after the change reaches `master`. If either stays open, the review notes say why.

## Who's on it

Engineer, QA, Security Officer, Auditor. No separate research step: job 1 was researched for the findings plan, and the code was read again for this plan. This job is security-sensitive (sign-in), so the security review is part of it.

## Risks

- **A real return address gets refused**, for example if the web server sits behind a proxy and its `oauth.url` setting doesn't match the address people use. Then they land on the sign-in page instead of where they came from, which is safe but slightly less convenient. The same setting already has to be right for GitHub sign-in to work at all.
- **Old cache-reset links stop working** only if the server restarts, which already happens today (the passwords are only kept in memory).

## Out of scope

The other web server items on the roadmap (debug log printing settings, the insights routes' limits), encoding user names in page requests (job 4), and dismissing other alerts (job 6).
