# Plan: stackoverflow-mock

**What Sean asked for:** "start the Stack Overflow mock fix".

## What we found

- The Stack Overflow test is meant to use stand-in data. The stand-in for the user-account request (`tests/mocks/api/axios/get/stackoverflow.mjs`) expects `/users/<id>/?site=stackoverflow` with nothing after it.
- The plugin actually asks for `/users/<id>?site=stackoverflow&filter=...`, with no slash and with a filter. So the stand-in never matches, and the request goes to the real Stack Exchange site.
- That site now blocks GitHub's shared test servers for hours at a time ("too many requests from this IP"). The test then fails on any pull request, which is why Renovate's #13 failed three times.
- The other Stack Overflow stand-ins (comments, answers, questions) do match the plugin's requests.

## What we'll change

1. **The stand-in's pattern:** in `tests/mocks/api/axios/get/stackoverflow.mjs`, make the user-account pattern match the plugin's real request, with or without a filter, and nothing broader. Check the returned fields still cover what the plugin reads.
   - *Check:* a small test in `tests/plugins/` that runs every request the plugin makes (from `source/plugins/stackoverflow/index.mjs`) through the stand-ins and checks each is answered without reaching the real site.
2. **The test case itself:** run only the Stack Overflow cases of the main suite in the Docker image. The log must show the stand-in answering and no call to the real site.
3. **CI:** CI's full suite has to pass. With the stand-in fixed, the Stack Overflow block no longer matters.

## Who's on it

Engineer, Auditor (which also does the security pass). A trivial job: no research or separate QA.

## Risks

- **Other stand-ins:** other plugins' stand-ins may also miss their real requests (the tests review on 2026-11-21 found a few). They stay on the roadmap; this job fixes only Stack Overflow.

## Out of scope

- Making unmatched requests fail instead of reaching the real site (a larger change to `tests/mocks/index.mjs`).
