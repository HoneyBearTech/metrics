# Plan: ci-workflow-update

## What Sean asked for

"review test.yml and fix/update it": review the CI workflow (`.github/workflows/test.yml`) and fix or update what needs it.

## What we found

- **Lint spends 10 of its 10.5 minutes installing.** Its `npm ci` runs the install scripts, and puppeteer's downloads a browser the linter never uses. Example: on the last `master` run, installing took 23:01:52 to 23:12:17 and linting took 2 seconds. With `--ignore-scripts` the install takes about 40 seconds, and the linter still passes.
- **The formatter step in "Build and test" checks nothing.** It installs dprint 0.41.0 globally (outside the lockfile), reformats the checkout, and never fails. The Docker image is then built from the reformatted files, so the tests don't run on exactly what's committed. Six files are currently out of format, so turning it into a real check needs a separate change first.
- **Code scanning waits for lint for no reason.** It needs nothing from lint, and it only takes 90 seconds.
- **No job has a time limit.** A hung test run would keep going for GitHub's default 6 hours.
- **Already good, and staying as is:**
  - actions pinned to exact commits, at their latest releases (the code scanning update is Renovate's #28)
  - read-only permissions by default
  - no saved checkout credentials
  - pull requests run with the read-only token
  - outdated PR runs cancelled
- **Not worth it now:**
  - Docker layer caching: the build is under 2 minutes of a 33-minute job.
  - npm caching: the install is about 40 seconds.
  - A dependency-review job and extra hardening actions: little benefit here, and they add outside actions.

## What we'll change

The job names (**Lint code**, **Build and test**, **Analyze code**) stay exactly the same, because the merge rule in the repo's guidelines checks them by name. Triggers, permissions and the action versions stay the same.

1. **Lint installs without install scripts** (`npm ci --ignore-scripts`). This saves about 9.5 minutes on every run.
2. **Remove the formatter step** from "Build and test". The tests then run on the committed files.
3. **Code scanning stops waiting for lint**, so it runs alongside it.
4. **Time limits:** lint 15 minutes, build and test 60 (it normally takes 31 to 35), code scanning 30.

All runs together should take about 35 minutes instead of 45. This is the exact change:

```diff
--- a/.github/workflows/test.yml
+++ b/.github/workflows/test.yml
@@ -20,6 +20,7 @@
   lint:
     name: Lint code
     runs-on: ubuntu-latest
+    timeout-minutes: 15
     steps:
       - name: Checkout repository
         uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
@@ -29,8 +30,9 @@
         uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
         with:
           node-version: 24
+      # The linter needs no install scripts (the only one downloads a browser and took about 10 minutes)
       - name: Setup metrics
-        run: npm ci
+        run: npm ci --ignore-scripts
       - name: Run linter
         run: npm run linter
 
@@ -39,16 +41,12 @@
     name: Build and test
     runs-on: ubuntu-latest
     needs: [ lint ]
+    timeout-minutes: 60
     steps:
       - name: Checkout repository
         uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
         with:
           persist-credentials: false
-      - name: Format code with dprint
-        run: |
-          npm install -g dprint@0.41.0
-          mkdir -v -p /home/runner/.cache/dprint/cache
-          npx dprint fmt --config .github/config/dprint.json
       # Build and test run in the same job, so a fixed local tag is enough
       - name: Build test image
         run: docker build -t metrics:ci .
@@ -59,7 +57,7 @@
   analyze:
     name: Analyze code
     runs-on: ubuntu-latest
-    needs: [ lint ]
+    timeout-minutes: 30
     permissions:
       actions: read
       contents: read
```

**How it gets applied.** This machine blocks the team from editing workflow files, even under this repo's `.github/` exception. As in the earlier workflow job, Sean applies the patch himself with one command given to him after approval. The security review and the audit then review the branch.

**Checks:**
- This PR's own CI run passes with all three job names present.
- Lint takes about 1 to 2 minutes instead of 10.
- Code scanning starts at the same time as lint.

## Who's on it

Researcher (done), Security Officer, Auditor. No Engineer: the change is the patch above, which Sean applies.

## Risks

- **A future lint plugin that needs an install script would make lint fail.** It would fail loudly, and the fix is one line.
- **A very slow runner could hit the 60-minute limit on a real test run.** That leaves 25 minutes of headroom over the slowest run seen, and the limit can be raised if it ever happens.
- **Renovate's #28 (code scanning v4.39.4) changes two lines near this change.** Whichever merges second needs a rebase. Renovate rebases #28 itself.

## Out of scope

- **A real formatting check.** That needs the six files formatted first, and a decision on Renovate's dprint update (#35). It's a separate job.
- **Speeding up the 31-minute test run**, which runs its tests one at a time by design.
- **The Dockerfile's unpinned base image and Deno install** (roadmap).
- **The labeler and spelling workflows.**
