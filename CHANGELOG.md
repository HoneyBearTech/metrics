# Changelog

All notable changes to this fork are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

This fork has made no releases yet, so everything is under "Unreleased". It builds on the upstream project's code as of its last maintained state, and `package.json` still carries the upstream version number.

## [Unreleased]

### Added

- Project documents: governance, support, this changelog, a security policy with private reporting, contributing and conduct guidance, the `docs/` pages, issue forms and a sign-off checkbox in the pull request template.
- A Renovate configuration (`renovate.json`) and the repository's guidelines, with the rule for when a Renovate pull request may be merged (PR #40).
- `steam` and `notable` plugin options (PR #6).

### Changed

- Dependencies updated within their current major versions (PR #4, landed on `master` through PR #7), sanitize-html 2.18.2 and simple-git 4.1.0 (PR #36).
- Renovate skips major updates for faker, Vue and vue-prism-component, and waits 3 days before ordinary updates (PR #39).
- CI: lint installs without install scripts, code scanning runs alongside lint, the formatter step that changed files before testing is gone, and every job has a time limit (PR #43).
- The fork's workflows: current actions pinned to exact commits, upstream-only jobs removed, one CI workflow (PR #10).
- The spelling check passes, with its dictionary kept up to date (PR #11 and later).

### Fixed

- The Docker image builds on Node 24 again; ruby and `licensed` are dropped (PR #3).
- Plugins repaired after GitHub API changes: activity, habits, recently used languages, code, achievements and projects (PR #5).
- Small fixes to the lines, music, wakatime, steam and notable plugins (PR #6).
- Recent activity uses trimmed pull-request events, and recently used languages match usernames with capital letters (PR #8).

### Removed

- Upstream-only workflows (PR #10).
