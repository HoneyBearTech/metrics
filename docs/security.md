# Security

This page says what metrics protects and what it doesn't. Report vulnerabilities as described in [SECURITY.md](../SECURITY.md).

## What it protects

- **Your GitHub token and plugin API keys.** The action passes inputs to its container through a temporary `.env` file in the workspace, which is removed after a successful run. If the build or the run fails, the file can be left behind: on GitHub-hosted runners the machine is discarded after the job, but on a self-hosted or persistent runner it stays, so clean the workspace there. The action's normal log only says whether a token was provided, never its value. The web server with `debug` on prints its settings, including tokens and OAuth secrets, so don't share its debug logs. Use secrets for them, never plain text in a workflow. Give the token the fewest scopes the plugins you use need.
- **The rendered page.** Text from outside sources goes through `sanitize-html` before it is rendered. A review of every rendering path is planned; until then, treat rendered output as built from untrusted data.
- **The web server's resources.** The static and metadata routes have a built-in limit of 60 requests a minute. It can limit image requests (`ratelimiter`, off by default), restrict which users get images (`restricted`), cap how many users are cached (`maxusers`), cache results, and keeps features that are risky off unless you enable them (below). `restricted` and `maxusers` are checked only by the image route (`/:login`), not by the insights routes: if you need an allowlist, turn insights off (`modes` without `insights`) or enforce access at a reverse proxy.
- **The repository's own pipeline.** Workflows are read-only by default, actions are pinned to exact commits, and every pull request runs the linter, the tests, code scanning and a spelling check. A weekly OpenSSF Scorecard run scores its security habits.

## What it doesn't protect against

- **A malicious or careless workflow author.** The action runs with the secrets you give it; anyone who can edit the workflow can read them. Use the action only from refs you trust.
- **A token with too many scopes.** A token committed to a repository, or one that can write more than it needs to, is the user's to manage.
- **Untrusted plugins and extras.** Some "extras" let the user of a web instance run commands or inject CSS and JavaScript into the render (`metrics.run.user.cmd`, `metrics.run.puppeteer.user.js`, community templates, optional npm modules). The action turns extras on, because you are its only user. On a web server leave them off unless the server is for you alone; never enable them for the public.
- **The web server's transport.** It speaks plain HTTP and has no sign-in of its own. Put HTTPS in front of it, and restrict or rate-limit it if it is public (the rate limiter is off unless you set `ratelimiter`).
- **Chrome without its sandbox.** Rendering starts Chrome with `--no-sandbox`, as is usual in containers. Run the web server in a container or a dedicated account, not on a machine with other data.
- **Third-party services and dependencies.** Plugins fetch from external websites; their data is untrusted, and they can change or fail. About 40 known findings in the dependency lock file have no fix yet ([dependencies.md](dependencies.md)).
- **Availability.** A public web server can be made to spend your GitHub API quota; set `restricted`, `maxusers` and `ratelimiter`, with the insights caveat above.
