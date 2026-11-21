# Quick start

Generate a metrics image for your profile with the action from this fork. It takes about ten minutes. The longer walk-through with pictures is [the action setup guide](../.github/readme/partials/documentation/setup/action.md).

1. **Create a profile repository**, named like your GitHub login, if you don't have one. Its `README.md` shows on your profile.
2. **Create a classic personal access token.** Fine-grained tokens are not supported (the action stops with an error). No scopes are needed for public data; each plugin's guide lists extra scopes it needs. Use the fewest scopes you can.
3. **Save the token as a repository secret**, for example `METRICS_TOKEN`.
4. **Add a workflow**, for example `.github/workflows/metrics.yml`:

   ```yaml
   name: Metrics
   on:
     schedule: [{cron: "0 0 * * *"}]
     workflow_dispatch:
   jobs:
     metrics:
       runs-on: ubuntu-latest
       permissions:
         contents: write
       steps:
         - uses: HoneyBearTech/metrics@master
           with:
             token: ${{ secrets.METRICS_TOKEN }}
   ```

   The image is saved as `github-metrics.svg` in the repository and committed there (`output_action: commit`, `filename: github-metrics.*`).
5. **Show it** in your profile `README.md`: `![Metrics](https://raw.githubusercontent.com/<you>/<you>/<branch>/github-metrics.svg)`.

Notes:

- `@master` follows the latest code. To stay on code you have looked at, use a full commit hash instead ([upgrading](upgrading.md)).
- The runner needs Docker and `jq` (GitHub's hosted Ubuntu runners have both). The first run builds the image from the repository's `Dockerfile`, which takes a few minutes.
- Turn plugins on with inputs such as `plugin_languages: yes`; see the [user guide](user-guide/README.md) and [interfaces](interfaces.md).
