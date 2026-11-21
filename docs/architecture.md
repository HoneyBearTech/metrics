# Architecture

metrics fetches data about a GitHub user, organisation or repository through GitHub's APIs (and, for some plugins, other websites), renders it through a template into an image or document, and either commits it to a repository or serves it over HTTP. The code layout and the plugin and template structure are in [ARCHITECTURE.md](../ARCHITECTURE.md); this page is about who talks to whom.

## Two ways to run it

**The action.** A workflow runs `action.yml`, a composite step that builds an image from the `Dockerfile` on the runner and runs `source/app/action/index.mjs` in a container. The workflow's inputs are passed in as `INPUT_*` environment variables through a temporary `.env` file that is deleted after the run. The result is written to a folder on the runner and then committed to a repository, opened as a pull request, or sent to a gist (`output_action`).

**The web server.** `source/app/web/` is an Express server. A browser or an `<img>` tag asks it for `/<login>`; it renders the image on demand with its own token from `settings.json` (or the visitor's, after the optional OAuth sign-in) and caches the result in memory.

Both use the same engine in `source/app/metrics/`.

## Data flow

1. The caller (a workflow, a browser or an `<img>` tag) names a user and the plugins and template to use.
2. The engine calls GitHub's REST and GraphQL APIs with the token, and the enabled plugins call their own sources (for example the Stack Overflow, Steam or WakaTime APIs, with API keys given as inputs).
3. The template (EJS) turns the data into SVG. User-provided text is sanitised first.
4. A headless Chrome, driven by puppeteer, resizes the SVG, and converts it to PNG, JPEG or PDF when asked.
5. The result is saved, committed or returned over HTTP.

## Trust boundaries

| Boundary | Crosses it | Notes |
| --- | --- | --- |
| Workflow author to the action | Inputs, including the GitHub token and plugin API keys | Whoever writes the workflow controls the run and sees its secrets. |
| metrics to GitHub and other services | The token and API keys, over HTTPS | Responses are untrusted content. |
| Web visitor to the web server | The URL and its query parameters | Anyone who can reach the server can ask for an image. Query parameters are untrusted. |
| Rendering to the browser engine | SVG built from fetched and user-provided text | Rendered in Chrome inside the container. |
| Web server to the host | The container or process the server runs in | The server's token and settings live there. |

Threats and defences for each are in [security.md](security.md) and the [assurance case](assurance-case.md).
