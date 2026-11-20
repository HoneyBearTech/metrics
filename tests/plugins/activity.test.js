//Tests for the activity plugin with pull request events trimmed by the events api
const esm = require("./esm.js")

describe("Activity plugin with trimmed pull request events", () => {
  test("Completes pull request, review and review comment events with pulls api", () => {
    const {events, calls} = esm("activity.mjs", "trimmed")
    expect(events).toHaveLength(4)
    const [merged, opened, review, comment] = events
    expect(merged).toEqual({type: "pr", actor: "Octo-User", repo: "octo-org/octo-repo", action: "merged", user: "Octo-User", title: "Update dependencies", number: 5, content: expect.stringContaining("Bump packages"), lines: {added: 3, deleted: 3}, files: {changed: 2}})
    expect(opened).toEqual({type: "pr", actor: "Octo-User", repo: "octo-org/octo-repo", action: "opened", user: "Octo-User", title: "Add a feature", number: 4, content: "", lines: {added: 100, deleted: 20}, files: {changed: 5}})
    expect(review).toEqual({type: "review", actor: "Octo-User", repo: "octo-org/octo-repo", review: "approved", user: "contributor", number: 1, title: "Fix the parser"})
    expect(comment).toEqual({type: "comment", on: "pr", actor: "Octo-User", repo: "octo-org/octo-repo", content: expect.stringContaining("Looks good"), user: "contributor", mobile: null, number: 1, title: "Fix the parser"})
    //Review and review comment on the same pull request share a single request
    expect(calls.sort()).toEqual(["octo-org/octo-repo/1", "octo-org/octo-repo/4", "octo-org/octo-repo/5"])
  })

  test("Skips events whose pull request cannot be read and uses the next ones", () => {
    const {events, calls} = esm("activity.mjs", "unreadable")
    expect(events.map(({type, number}) => `${type} ${number}`)).toEqual(["pr 5", "pr 4"])
    expect(calls).toEqual(["octo-org/octo-repo/404", "deleted-org/deleted-repo/1", "octo-org/octo-repo/5", "octo-org/octo-repo/4"])
  })

  test("Skips pull requests opened by ignored users", () => {
    const {events} = esm("activity.mjs", "ignored")
    expect(events.map(({type, number, user}) => `${type} ${number} ${user}`)).toEqual(["pr 4 Octo-User"])
  })

  test("Only fetches pull requests of displayed events", () => {
    const {events, calls} = esm("activity.mjs", "lazy")
    expect(events.map(({type, number}) => `${type} ${number}`)).toEqual(["pr 1", "comment 1"])
    expect(calls).toEqual(["octo-org/octo-repo/1"])
  })

  test("Pull request helper never throws and caches results", () => {
    const {found, again, missing, malformed, nan, norest, calls} = esm("activity.mjs", "helper")
    expect(found).toMatchObject({number: 1, title: "Fix the parser", user: {login: "contributor"}, merged: true})
    expect(again).toEqual(found)
    expect(missing).toBeNull()
    expect(malformed).toBeNull()
    expect(nan).toBeNull()
    expect(norest).toBeNull()
    expect(calls).toEqual(["octo-org/octo-repo/1", "octo-org/octo-repo/404"])
  })
})
