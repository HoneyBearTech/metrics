# Governance

This is a fork of an unmaintained project, kept by one person. This document says who decides, who has access, and how the project carries on if the maintainer can't.

## Decision model

The maintainer, GitHub [@HoneyBearTech](https://github.com/HoneyBearTech), makes the final call on everything: scope, which pull requests are merged and when. Decisions happen in the open where possible:

- **Bugs, features and questions** go in [Issues](https://github.com/HoneyBearTech/metrics/issues) and [Discussions](https://github.com/HoneyBearTech/metrics/discussions).
- **Changes** land through pull requests to `master`. The description records what changed and why.
- **Why a choice was made** is written in [docs/decisions-log.md](docs/decisions-log.md); direction and what is not planned are in [docs/roadmap.md](docs/roadmap.md).
- **Security reports** are handled privately, as described in [SECURITY.md](SECURITY.md).

If you disagree with a decision, say so in the issue or pull request. The code is MIT-licensed, so you can always fork it.

## Roles and responsibilities

| Role | Who | Responsibilities |
| --- | --- | --- |
| Maintainer | @HoneyBearTech | Triage issues; review and merge pull requests; keep CI, dependencies and documentation current; answer vulnerability reports ([SECURITY.md](SECURITY.md)); enforce the [Code of Conduct](CODE_OF_CONDUCT.md); keep this file up to date. |
| Contributor | Anyone who opens an issue or pull request | Follow [CONTRIBUTING.md](CONTRIBUTING.md) (tests, sign-off) and the Code of Conduct; report vulnerabilities privately. |
| Security reporter | Anyone who reports a vulnerability | Report privately and keep the details private until the advisory is published. |

## Access

| Resource | Who | Through |
| --- | --- | --- |
| Repository administration, write access, settings and merging | the maintainer | GitHub account owner |
| Team pull requests (documentation, fixes, upkeep) | a GitHub App operated by the maintainer, which opens pull requests but doesn't merge outside the rule below | GitHub App installation |
| Dependency update pull requests | Renovate | the Renovate GitHub app |
| Security advisories and private vulnerability reports | the maintainer | GitHub |
| The OpenSSF Best Practices entry | the maintainer | GitHub sign-in |

There are no other collaborators. Workflows use a read-only `GITHUB_TOKEN` unless a job needs more. The repository holds no release or publishing credentials, because the fork publishes no releases or images.

The GitHub App may merge a Renovate pull request only when the rule in the repository's guidelines file holds: it is Renovate's own signed work, it changes only `package.json` and `package-lock.json`, all required checks passed, the new version is at least 3 days old, it is not an unreviewed major update, and no other pull request was merged since its checks ran ([dependencies.md](docs/dependencies.md#renovate-merge-rule)). Everything else, including the app's own pull requests, is merged by the maintainer.

## Granting access

Nobody gets write or admin access without the maintainer's decision, recorded in a pull request that updates this file. The person needs a public track record here (several good merged pull requests over a few months), a GitHub account with two-factor sign-in, and the least access their role needs. Access is removed when someone steps back or is inactive for a year.

## Continuity

If the maintainer can't continue:

- The project is MIT-licensed: anyone can fork it and carry on, and everything needed to build, test and run it is in this repository.
- The maintainer keeps recovery for the repository account and its credentials privately, and no secret is stored in the repository. Names and credentials are deliberately not published here.
- A successor, if the maintainer arranges one, would announce it in a pinned issue and update this file.

This is a one-person project, so its bus factor is 1. These arrangements keep it from being stranded; they don't replace a second maintainer.
