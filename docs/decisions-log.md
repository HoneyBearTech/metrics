# Decisions log

## 2026-11-20 - upstream-fixes

**What upstream items to take.** We triaged all 73 open upstream items. We took the bug fixes, the build fix and the safe dependency updates, as four pull requests.
- **Skipped:**
  - new plugins (Shikimori, Letterboxd)
  - the "v4" wish-list and old feature requests
  - support questions with no reproducible bug (PageSpeed, Anilist, commit counts, skip patterns, Go colour, token scopes, followup stats)
  - upstream PR 1840, which points at upstream-hosted example images
  - upstream PR 1832, junk that deletes `settings.example.json`
- **Why:** fixes restore what's broken. New features would add maintenance to a fork with no upstream support.

**Docker.** We used upstream PR 1855's Dockerfile (Node 24, signed Chrome keyring, no ruby/`licensed`).
- **Rejected:**
  - upstream PR 1677 (add `xz-utils`): the gem compile still ran past 20 minutes.
  - upstream PR 1838 (Node 24 only): it doesn't fix the `licensed` failure.
  - upstream PR 1724: it changes workflows and fetches `licensed` through a third-party tool at build time.
  - upstream PR 1835: eslint 9 breaks the lint config, and there are too many big upgrades at once.
- **Trade-off:** the `licenses` plugin loses its dependency-license scan. It already copes when the tool is missing.
- **Also changed:** we raised `libxmljs2` to 0.37, because 0.32 silently fails to install on Node 24 and SVG checks then crash.

**Push events.** GitHub's push event payload now carries only `before`, `head`, `push_id`, `ref` and `repository_id` (checked live). We now fetch commits with the compare API (`before...head`).
- It falls back to the head commit for new branches or failed compares, keeps at most 20 commits per push, and caches results per run.
- **Rejected:** the "guard against null" PRs (upstream 1807, 1834's guards, 1769's habits part). They stop the crash but leave the plugins empty. Upstream PR 1807 also swaps in an old upstream image.
- **Rejected as written:** upstream PRs 1760 and 1754. They had wrong field paths or were unfinished, and they reformatted whole files. Their ideas were reused.

**Achievements and projects.** Projects are now counted with `projectsV2 { totalCount }`, in a separate small query.
- If a token can't read projects, only that count falls back to 0, instead of the whole achievements plugin failing.
- The `projects` plugin now uses the new Projects only (upstream PR 1782).

**Organisations in habits and code.** The personal "commits authored by me" filter is skipped for organisation accounts, which matches the recent-languages analyzer. Otherwise organisations would lose nearly all member commits.

**Music "Explicit" label.** It's stripped only when it's clearly a separate badge (after a newline or two or more spaces), so titles like "Something Explicit" are kept.
- **Risk:** a badge joined to the title by a single plain space wouldn't be stripped. This needs one real check.

**Steam.** The recently played endpoint has no last-played time. Upstream PR 1845's version therefore dropped every game, and we fixed that: an unknown date stays unknown, games known to be recent sort first, and no "January 1970" is shown.

**Dependencies.** We made one combined update within the current majors, instead of about 20 conflicting automatic PRs.
- **Rejected:** puppeteer 25 (needs a full Chrome path), file-type 21, jsdom 28 and eslint 9 (major upgrades with code changes).

**Review findings rejected:**
- **activity's repository-mode actor filter hides collaborators:** real, but older than this work and unrelated to the API changes. Moved to the roadmap.
- **Test mock files mention the upstream owner and repo:** inert test data in the existing mock style, so no change.
- **Unpinned Docker base image and the `curl | sh` Deno install:** inherited from upstream and no worse than before. Moved to the roadmap.

**Process notes:**
- **Skipped checks:** the independent plan check, the second security review and the plain-English read were skipped, because their review service had reached its monthly quota.
- **Stray plan commit:** an early side request in the research session created a separate plan commit (`docs/plans/docker-build-fix.md`, branch `team/docker-build-fix`, local only). This plan's branch was accidentally started on top of it, so the stray plan file is removed again in this PR. Its content is covered by PR #3.

## 2026-11-20 - real-run-fixes

The first real run on the owner's profile showed two problems the stand-in tests had missed.

**Pull-request events are trimmed too.** GitHub now sends pull request, review and review-comment events with only the PR's number, link and branches (checked live). Recent activity now looks up each PR's details with a small cached helper next to the push helper, and only for events it will actually show.
- **Limits:** each PR is looked up at most once per run, and at most `max(limit x 3, 10)` different PRs per run, so unreadable PRs can't cause hundreds of calls. Lookups that fail for a lasting reason (not found, no access) are cached; brief failures (server errors, rate limits) are not, so the next run tries again.
- **Merged label:** the lookup returns the PR's current state, not its state at the time of the event. Only the "closed" event nearest the merge time (within 5 minutes) is labelled "merged"; other closings of the same PR stay "closed".
- **Unreadable PRs** (deleted repository, no access, deleted author) are skipped and the next event is shown.
- **Rejected:** fetching every PR event up front (over 100 calls a run on this account), and showing PR events without details (no title or author, and the ignored-users filter couldn't work).

**Recently used languages compared usernames case-sensitively.** The shared text filter lowercases the text but not the list it compares against, so a username with capitals matched no push events. The analyzer now lowercases both sides, as habits and code already did. It also no longer counts each push event as an extra commit.
- **Rejected:** changing the shared filter itself (used by many plugins; wider regression risk). Added to the roadmap.

**Tests.** The stand-in event data now uses the trimmed shape, with a stand-in for the PR lookup. New focused tests cover activity (trimmed events, unreadable PRs, ignored authors, the lookup cap, brief failures, merge labels) and a mixed-case username for languages. The old code fails them.

**Review findings:**
- **Fixed after review:** merge labels after close and reopen, the uncapped lookups, caching of brief failures, and test processes with no time limit (two rounds; the final re-check approved).
- **Not changed:** the plan naming the owner and his public GitHub login (already public); a missing native image library being stubbed inside the focused tests only (it isn't used by the code under test).

**Process notes:** the independent plan check and plain-English read were skipped again (their review service's monthly quota was used up). Two staff sessions dropped mid-job when the session service lost its connection; their committed work was kept and a replacement picked it up.
