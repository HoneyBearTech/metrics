### 📝 Reporting a Vulnerability

Please report security vulnerabilities privately, never in a public issue. Use [GitHub's private vulnerability reporting](https://github.com/HoneyBearTech/metrics/security/advisories/new) ("Report a vulnerability" on the repository's Security tab).

Include what you found, how to reproduce it, which commit you tested and what an attacker gains. If you'd like to be credited under a particular name, or not at all, say so.

This is a personal fork maintained by one person (see [GOVERNANCE.md](GOVERNANCE.md)), so these are targets, not a contract:

1. The first reply comes within 14 days.
2. The report is triaged: reproduced, rated and, if it is a vulnerability in this repository, fixed privately in a [GitHub Security Advisory](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/about-repository-security-advisories), with a test where one is practical.
3. Once the fix is on `master`, the advisory is published, with a CVE where one applies, and says which commits are affected and which are fixed.
4. The reporter is credited in the advisory unless they ask not to be.

Please keep the details private until the advisory is published.

### Supported versions

This fork makes no releases. Only the latest commit on `master` receives fixes; see [SUPPORT.md](SUPPORT.md).

### Scope

What *metrics* does and doesn't protect, and the threats it was designed against, are described in [docs/security.md](docs/security.md) and [docs/assurance-case.md](docs/assurance-case.md). Vulnerabilities in a dependency are handled as described in [docs/dependencies.md](docs/dependencies.md); if the problem is in the dependency itself, report it to that project as well.

### Code of conduct reports

Reports about conduct (see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)) use the same private form. Mark the report as a conduct report.
