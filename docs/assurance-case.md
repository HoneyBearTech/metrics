# Assurance case

This page argues that metrics meets the expectations in [security.md](security.md): it threat-models its use, names its trust boundaries, follows secure design principles, and counters common weaknesses, with pointers to the code. It is honest about gaps. The component overview is in [architecture.md](architecture.md).

The claim is modest: **used as documented, metrics sends your token and keys only to the services that need them, passes outside text through `sanitize-html` before rendering it, and a public web server can limit how much it serves.** A review of every rendering path is planned. It does not claim to resist a malicious workflow author or a hostile host.

## 1. Threat model

**Assets:** the GitHub token and plugin API keys; the repository the action commits to; the web server's token and `settings.json`; the GitHub API quota; the rendered images.

| Actor | Threats considered |
| --- | --- |
| Anonymous web visitor | Spend the server's API quota or CPU; request users the owner didn't intend; inject markup or scripts through query parameters; reach internal URLs through plugin inputs. |
| Author of fetched content (a profile, commit message, feed or repository) | Inject HTML or script into the image; break the template. |
| A third-party service or its network path | Return hostile or malformed data; be intercepted. |
| A malicious dependency | Run code at install or run time. |
| Workflow author or web server owner | Out of scope as an attacker: they hold the secrets by design. |
| Anyone with access to the host | Out of scope. |

## 2. Trust boundaries

Listed in [architecture.md](architecture.md#trust-boundaries). Each is mediated: workflow inputs by GitHub's secrets, most outgoing calls by HTTPS (with the exceptions in section 4), web requests by the checks below, outside text by `sanitize-html`, and rendering by the container.

## 3. Secure design principles

- **Least privilege.** The token needs no scopes by default, and each plugin's guide lists the extra scopes it needs. Workflows have `contents: read`; the code scanning job adds only `security-events: write` (`test.yml`).
- **Secure defaults.** Risky features (commands, user CSS and JavaScript, remote templates, optional modules) are off in the web server unless named in `extras` in `settings.json`.
- **Economy of mechanism.** The same engine serves the action and the web server; settings come from one place.
- **Minimal attack surface.** The web server only serves what `instance.mjs` registers; the modes (`embed`, `insights`) and the OAuth routes can be turned off.
- **Mediation of untrusted input.** Query parameters are validated and outside text goes through `sanitize-html` (below); a review of every rendering path is planned.
- **Fail safely.** A failing plugin is reported in the image or stops the run (`plugins_errors_fatal`) and the action's normal log says only whether a token was provided.

## 4. Countering common weaknesses

| Weakness | How it's countered | Where |
| --- | --- | --- |
| Cross-site scripting and markup injection | Outside text goes through `sanitize-html` before it is rendered. A review of every rendering path is planned. | `markdown()` in `source/app/metrics/utils.mjs` |
| Injection through the URL | A login must match `^[-\w]+$`, plugin names `^\w+$`, sessions are hexadecimal; names beginning with `.` or containing `/` are passed on, not rendered. | `source/app/web/instance.mjs` |
| Resource exhaustion | Static and metadata routes allow 60 requests a minute (built in); `ratelimiter` can limit image requests but is off by default; `maxusers` caps cached users; an in-memory cache; one pending request per user. Spawned commands have a timeout. | `instance.mjs`, `utils.mjs` |
| Unauthorised use of a public server | `restricted` answers 403 to other users on the image route. The insights routes don't check `restricted` or `maxusers`: turn insights off or enforce access at a reverse proxy. | `instance.mjs` |
| Cross-site request forgery in sign-in | The OAuth flow makes a random `state` (64 random bytes), checks it on return and deletes it; sessions are 128 random bytes. | `instance.mjs` |
| Credential exposure | The action's normal log doesn't print tokens; its `.env` file is removed after a successful run (a failed run on a self-hosted or persistent runner can leave it); CI checkouts don't persist credentials. The web server with `debug` on prints its settings, including tokens and OAuth secrets. | `action.yml`, `source/app/action/index.mjs`, `test.yml` |
| Supply chain | Dependencies are locked; Renovate waits 3 days; every change runs lint, tests and CodeQL; actions are pinned to exact commits. | `package-lock.json`, `renovate.json`, `.github/workflows/` |
| Insecure transport | Most outgoing requests use HTTPS. Exceptions: the rss plugin fetches any feed URL the user gives, and the steam plugin builds some `http` icon URLs. The web server itself is plain HTTP by design: use a reverse proxy. | — |

## 5. Known gaps

- The Docker base image and the Deno install script (`curl | sh`) aren't pinned.
- About 40 audit findings in the lock file have no fix pull request.
- Chrome runs with `--no-sandbox` inside the container.
- There is no coverage measurement, and the formatter isn't checked in CI.
- No fuzzing, and the web pages have had no accessibility or security testing beyond CodeQL.

The [roadmap](roadmap.md) lists each of these.
