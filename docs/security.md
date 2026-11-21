# Security

This page says what metrics protects and what it doesn't. Report vulnerabilities as described in [SECURITY.md](../SECURITY.md).

## What it protects

- **Your GitHub token and plugin API keys.** The action passes inputs to its container through a temporary environment file that is removed after the run, and its log only says whether a token was provided, never its value. Use secrets for them, never plain text in a workflow. Give the token the fewest scopes the plugins you use need.
- **The rendered page.** Text that comes from outside (profile text, commit messages, feeds) goes through `sanitize-html` before it is put in an image, so it can't inject markup or scripts.
- **The web server's resources.** It limits requests per visitor, can restrict which users get images (`restricted`) and how many (`maxusers`), caches results, and keeps features that are risky off unless you enable them (below).
- **The repository's own pipeline.** Workflows are read-only by default, actions are pinned to exact commits, and every pull request runs the linter, the tests, code scanning and a spelling check.

## What it doesn't protect against

- **A malicious or careless workflow author.** The action runs with the secrets you give it; anyone who can edit the workflow can read them. Use the action only from refs you trust.
- **A token with too many scopes.** A token committed to a repository, or one that can write more than it needs to, is the user's to manage.
- **Untrusted plugins and extras.** Some "extras" let the user of a web instance run commands or inject CSS and JavaScript into the render (`metrics.run.user.cmd`, `metrics.run.puppeteer.user.js`, community templates, optional npm modules). The action turns extras on, because you are its only user. On a web server leave them off unless the server is for you alone; never enable them for the public.
- **The web server's transport.** It speaks plain HTTP and has no sign-in of its own. Put HTTPS in front of it, and restrict or rate-limit it if it is public.
- **Chrome without its sandbox.** Rendering starts Chrome with `--no-sandbox`, as is usual in containers. Run the web server in a container or a dedicated account, not on a machine with other data.
- **Third-party services and dependencies.** Plugins fetch from external websites; their data is untrusted, and they can change or fail. About 40 known findings in the dependency lock file have no fix yet ([dependencies.md](dependencies.md)).
- **Availability.** A public web server can be made to spend your GitHub API quota; set `restricted`, `maxusers` and `ratelimiter`.
