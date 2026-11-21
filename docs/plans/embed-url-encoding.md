# Plan: embed-url-encoding

**What Sean asked for:** "option 1, start the small fix" (code scanning alert 9 stayed open after job 4, #86).

## What we found

- Job 4 encoded the user name in the embed page's two cache-reset requests. The same "generate" button then loads the rendered image from the page's own address for that user, which is built in the `url` getter of `source/app/web/statics/embed/app.js` without encoding the name (`/${this.user}`). Code scanning moved alert 9 to that request.
- The risk is low: the request stays on the same site and the server only accepts normal GitHub user names. A real GitHub user name (letters, digits and `-`) is unchanged by encoding.
- The same address is also shown to the user as the link to copy, so it stays correct for real names.

## What we'll change

1. **Encode the user name in the `url` getter** with `encodeURIComponent`, the same way the page already encodes the other values in that address.
   - *Check:* a focused test (added to `tests/plugins/security.test.js`) that the address for `a/b?c#d` has the name encoded in its path and the address for `octocat` is unchanged, and that "generate" requests that address; code scanning on this pull request no longer reports alert 9.
2. **Record it:** the notes.

## Who's on it

Engineer, QA, Security Officer, Auditor. No separate research step. It is security-sensitive (it fixes a security finding).

## Risks

- None expected for real user names. A name that was already encoded would be encoded twice, but GitHub user names never contain characters that need encoding.

## Out of scope

The page's display links to github.com (not requests), and everything else in the findings plan.
