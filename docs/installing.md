# Installing

metrics can run three ways. The fork publishes no releases or images, so each way uses the source in this repository.

## As a GitHub Action

The usual way: see the [quick start](quick-start.md). The action is a composite action (`action.yml`) that builds an image from the `Dockerfile` on the runner and runs it once, which needs Docker and `jq` on the runner. Because this is a fork, it always builds locally and never pulls the upstream image. The image is tagged `metrics:forked-<package version>` and reused if that tag already exists on the runner. `package.json` stays at one version, so on a self-hosted or persistent runner a new commit can silently reuse the old image; remove the tag (`docker image rm metrics:forked-<version>`) to force a rebuild. GitHub-hosted runners start clean, so they always rebuild.

## The web server, from source

You need Node 24 and a Chrome or Chromium that puppeteer can find (the `Dockerfile` installs Google Chrome and sets `PUPPETEER_BROWSER_PATH=google-chrome-stable`).

```shell
git clone https://github.com/HoneyBearTech/metrics.git
cd metrics
npm ci
cp settings.example.json settings.json   # set "token", see interfaces.md
npm start                                # listens on port 3000 by default
```

See [the web server setup guide](../.github/readme/partials/documentation/setup/web.md) and [the local setup guide](../.github/readme/partials/documentation/setup/local.md). The server speaks plain HTTP, so for anything public put a reverse proxy that handles HTTPS in front of it, and set `restricted`, `maxusers` and `ratelimiter` in `settings.json` ([security](security.md)). `restricted` and `maxusers` apply only to the image route, not to insights: if you need an allowlist, turn insights off or enforce access at the proxy.

## With Docker

Build the image and run the web server in it:

```shell
docker build -t metrics .
docker run --rm --entrypoint="" -p 127.0.0.1:3000:3000 \
  --volume "$PWD/settings.json:/metrics/settings.json" metrics npm start
```

Without `--entrypoint=""` the container runs the action's entry point instead, which expects the action's `INPUT_*` environment variables. The [Docker guide](../.github/readme/partials/documentation/setup/docker.md) covers that mode, but names the upstream image: replace it with the image you built.
