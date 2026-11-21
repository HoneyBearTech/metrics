# Interfaces

metrics has no OpenAPI file; its interfaces are the action's inputs, `settings.json` and the web server's URLs.

## Action inputs

[`action.yml`](../action.yml) lists every input with its description (it is generated, so the plugin guides are the fuller source). The only required one is `token`. They are grouped as:

- **Base content and core:** `base*`, `repositories*`, `user`, `repo`, `token`, `committer_*`, `filename`, `markdown*`, `output_action`, `output_condition`, `template`, `query`, `extras_css`, `extras_js`, `config_*` (timezone, display, animations, padding, output format and others), `retries*`, `delay`, `quota_required_*`, `plugins_errors_fatal`, `use_prebuilt_image`, `debug*`, `dryrun`, `experimental_features`.
- **Plugins:** `plugin_<name>` turns one on, and `plugin_<name>_<option>` configures it. Each plugin's `README.md` in [`source/plugins/`](../source/plugins/README.md) documents its options and the token scopes it needs.

`output_action` is one of `none`, `commit`, `pull-request`, `pull-request-merge`, `pull-request-squash`, `pull-request-rebase` or `gist`. The default is `commit`.

`use_prebuilt_image` has no effect in this fork: the image is built from the `Dockerfile`, tagged `metrics:forked-<package version>`, and reused if that tag already exists locally (see [installing](installing.md#as-a-github-action)).

## Output formats

`config_output` selects the format: `auto` (the template's default, usually `svg` or `markdown`), `svg`, `png`, `jpeg`, `json`, `markdown`, `markdown-pdf` and `insights` (a self-contained HTML file). `png`, `jpeg` and `markdown-pdf` can't be sent to a gist.

## Web server settings

Copy [`settings.example.json`](../settings.example.json) to `settings.json`. The main keys:

| Key | Meaning |
| --- | --- |
| `token` | GitHub token the server uses (required) |
| `modes` | enabled modes, `embed` and `insights` |
| `restricted`, `maxusers` | who may get an image, and a cap on cached users (not a concurrency limit); both checked only on the image route, not on insights |
| `ratelimiter` | `express-rate-limit` options for image requests |
| `cached` | how long rendered images are cached, in milliseconds |
| `port` | listening port (default 3000) |
| `outputs` | allowed output formats |
| `oauth` | GitHub OAuth client, so visitors can use their own token |
| `templates`, `plugins`, `extras` | which templates and plugins are enabled, and which extra features are allowed |

## Web server URLs

Defined in [`source/app/web/instance.mjs`](../source/app/web/instance.mjs):

- `/:login` and `/:login/:repository`: render an image for a user, organisation or repository. Query parameters are the action inputs with dots instead of underscores and without the `plugin_` prefix (for example `/octocat?languages=1&languages.limit=4`), plus `config.output` for the format. Errors come back as 400 (invalid user), 403 (not in `restricted`), 404 (unknown user), 429 (rate limit), 500 or 503 (the cache already holds `maxusers` users).
- `/`, `/embed/` and `/insights/` (and `/insights/:login`): the web pages. `/insights/query/:login/...` returns insights data.
- `/.plugins`, `/.plugins.base`, `/.plugins.metadata`, `/.templates`, `/.templates/:template`, `/.modes`, `/.extras`, `/.hosted`, `/.version` and `/.requests`: descriptions of what the server offers, as JSON or text. `/.requests` reports the server's GitHub API quota.
- `/.uncache`: clears the cached image of a user (two calls: one to get a token, one to use it).
- `POST /.control/stop`: only when `control.token` is set in `settings.json`. The `Authorization` header must equal that token (otherwise 401). It answers 202 and the process exits with code 1 five seconds later, so a supervisor can restart it.
- `/.oauth/...`: the sign-in flow, only when `oauth` is configured.
- `/.css/...`, `/.js/...`, `/.templates/<name>/partials` and a few images: static files.

The pages and descriptions have a built-in limit of 60 requests a minute for each visitor. Image rendering is limited only if you set `ratelimiter` (null by default).
