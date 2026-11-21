# 💪 Interested in contributing?

Nice! Please read the few sections below to understand how to implement new features.

## 👨‍💻 Extending *metrics*

Be sure to read [ARCHITECTURE.md](/ARCHITECTURE.md) first to understand how `metrics` is structured and to follow [`🔧 Local setup for development`](.github/readme/partials/documentation/setup/local.md) to get a working development environment!

Before working on something, ensure that it will not duplicate any active open pull requests (including drafts).

It is advised to open a [`💬 discussion`](https://github.com/HoneyBearTech/metrics/discussions) first to gather feedback about new features.

> ⚠️ This is a fork of the upstream [lowlighter/metrics](https://github.com/lowlighter/metrics), which is no longer maintained. It is maintained by one person in their own time (see [GOVERNANCE.md](GOVERNANCE.md)), so reviews can take a while, and inactive pull requests may be closed.

> 😅 Be positive! Even if your changes don't get merged here, you can always run workflows directly from your own fork.

## 🤝 Accepted contributions

The following contributions are accepted:
<table>
  <tr>
    <th>Section</th>
    <th>Changes</th>
    <th>Additions</th>
    <th>Notes</th>
  </tr>
  <tr>
    <td nowrap="nowrap">🧩 Plugins</td>
    <td>✔️</td>
    <td>✔️</td>
    <td>
      <ul>
        <li>New features for existing plugins are allowed but must be optional and backward compatible</li>
        <li>New community plugins are welcomed provided they're functional and not redundant with existing plugins</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td nowrap="nowrap">🖼️ Templates</td>
    <td>✓</td>
    <td>❌</td>
    <td>
      <ul>
        <li>Template changes are allowed with new features additions (but must remain consistent with current visuals)</li>
        <li>New templates should be added as <a href="/source/templates/community/README.md">📕 community templates</a> instead</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td nowrap="nowrap">🪛 Presets</td>
    <td>✔️</td>
    <td>✔️</td>
    <td>
      <ul>
        <li>New presets are welcomed provided they're functional and not redundant with existing presets</li>
        <li>This fork has no <code>presets</code> branch: propose a preset in a pull request or a discussion</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td nowrap="nowrap">🧪 Tests</td>
    <td>✔️</td>
    <td>✔️</td>
    <td>
      <ul>
        <li>Everything that makes metrics more stable is welcomed!</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td nowrap="nowrap">🧱 Core</td>
    <td>✓</td>
    <td>❌</td>
    <td>
      <ul>
        <li>Core changes impact all rendering process and should be avoided unless necessary</li>
        <li>New dependencies should be avoided when possible</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td nowrap="nowrap">🗃️ Repository</td>
    <td>❌</td>
    <td>❌</td>
    <td>
      <ul>
        <li>Workflows, license, readmes, etc. usually don't need to be edited</li>
      </ul>
    </td>
  </tr>
</table>

**Legend**
* ✔️: Contributions welcomed!
* ✓: Contributions are welcomed, but must be discussed first
* ❌: Only maintainers can manage these files

## ✍️ Signing off your commits

Every commit must carry a `Signed-off-by` line, which certifies that you wrote the change or have the right to submit it under the project's [MIT license](LICENSE) (the [Developer Certificate of Origin](https://developercertificate.org/)). Add it with `git commit -s`:

```shell
git commit -s -m "Fix the habits plugin when there are no events"
```

To add it to commits you already made, use `git rebase --signoff master` and push again. The **DCO sign-off** check enforces this on every pull request and leaves out merge commits and commits made by Renovate or Dependabot. It reads at most the first 250 commits of a pull request (a GitHub limit), so split very large pull requests.

## 🛠️ Building and testing from source

You need Node 24 (the version CI and the [Dockerfile](Dockerfile) use) and, for the full tests, Docker.

```shell
npm ci
npm run linter
```

[`🔧 Local setup for development`](.github/readme/partials/documentation/setup/local.md) explains how to start a local web instance. The full test run is the one CI makes, from the repository root:

```shell
docker build -t metrics:ci .
docker run --rm --entrypoint="" metrics:ci npm run test-metrics
```

## 🧪 Test policy

New features and bug fixes come with tests in [`tests/`](tests/) (test cases are YAML files in `tests/cases/`, one per plugin or template). A pull request that changes behaviour without a test needs a reason in its description. Tests use mocked data and need no token.

## 🎨 Coding standards

The linter is ESLint: run `npm run linter` and fix everything it reports before opening a pull request. A [dprint](https://dprint.dev/) configuration exists in [`.github/config/dprint.json`](.github/config/dprint.json); a CI check for it is planned, so please keep to the existing code style. Follow the conventions of the file you edit, and keep a pull request to one logical change.

## 🔑 Secret scan

The **Secret scan** check runs [gitleaks](https://github.com/gitleaks/gitleaks) over the full history on every pull request and every push to `master`, using the settings in [`.gitleaks.toml`](.gitleaks.toml). If it flags a real secret, revoke the secret first, then remove it. Removing it in a later commit is not enough, because the scan reads the whole history and keeps failing on the old commit: after revoking, ask a maintainer to review an exception for that exact historical finding, or to agree a coordinated history rewrite. If it flags a stand-in value (a test token or mock data), add a narrow exception with a reason to `.gitleaks.toml`.

## 🐛 Reporting a bug

Open an [issue](https://github.com/HoneyBearTech/metrics/issues/new/choose) with the bug report form. Say which commit or ref of the action you use, what you expected, what happened and the relevant log lines, with tokens and other secrets removed. For questions and ideas, use [discussions](https://github.com/HoneyBearTech/metrics/discussions). **Vulnerabilities go through the private form described in [SECURITY.md](SECURITY.md), never a public issue.**

## ✅ Before a pull request is merged

- These checks pass: **Lint code**, **Build and test**, **Analyze code**, **CodeQL** and **Check Spelling**. If the spelling check flags a real word, add it, in lower case, to `.github/actions/spelling/expect.txt` (kept sorted); an all-capitals word needs its own entry.
- Every commit is signed off (see above).
- The maintainer has reviewed it. Dependency updates from Renovate follow the rule in [GOVERNANCE.md](GOVERNANCE.md).

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
