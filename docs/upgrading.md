# Upgrading

metrics keeps no state, so there is nothing to back up or migrate. It reads your workflow inputs or `settings.json` each time and writes only the images it renders.

There are no releases, so "upgrading" means moving to a newer commit:

- **Action:** change the ref in `uses: HoneyBearTech/metrics@<ref>`. `master` is always the latest; a full commit hash stays put until you change it. Look at [the changelog](../CHANGELOG.md) and the commits between the two refs first. On GitHub-hosted runners the next run builds a new image; on a self-hosted or persistent runner the image tag `metrics:forked-<version>` is reused if it exists, so remove it to force a rebuild (see [installing](installing.md#as-a-github-action)).
- **Web server from source:** `git pull`, then `npm ci`, then restart.
- **Docker:** pull the new source, run `docker build -t metrics .` again and restart the container.

Check after each upgrade that your inputs and `settings.json` still match [interfaces](interfaces.md); the changelog lists changed options. To go back, use the previous ref or commit.
