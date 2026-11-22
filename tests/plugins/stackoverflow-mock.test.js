//Tests for the Stack Overflow stand-in of mocked data (every request of the plugin must be answered without reaching the real api)
const esm = require("./esm")

describe("Stack Overflow mocked data", () => {
  test("answers the user account request", () => {
    const {status, user, items} = esm("stackoverflow-mock.mjs", "account")
    expect(status).toBe(200)
    expect(items).toBe(1)
    expect(user).toEqual({reputation: "number", badge_counts: {bronze: "number", silver: "number", gold: "number"}, answer_count: "number", question_count: "number", view_count: "number"})
  })

  test("answers the user account request without a filter", () => {
    const {status, items} = esm("stackoverflow-mock.mjs", "unfiltered")
    expect(status).toBe(200)
    expect(items).toBe(1)
  })

  test("answers the comments count request", () => {
    const {status, total} = esm("stackoverflow-mock.mjs", "comments")
    expect(status).toBe(200)
    expect(total).toBe("number")
  })

  test("answers the answers requests, and the related questions", () => {
    const {status, items, fields, related} = esm("stackoverflow-mock.mjs", "answers")
    expect(status).toBe(200)
    expect(items).toBe(2)
    expect(fields).toEqual([])
    expect(related.status).toBe(200)
    expect(related.items).toBeGreaterThan(0)
    expect(related.fields).toEqual([])
  })

  test("answers the questions requests, and the related answers", () => {
    const {status, items, fields, related} = esm("stackoverflow-mock.mjs", "questions")
    expect(status).toBe(200)
    expect(items).toBe(2)
    expect(fields).toEqual([])
    expect(related.status).toBe(200)
    expect(related.items).toBeGreaterThan(0)
    expect(related.fields).toEqual([])
  })

  test("keeps the user account and comments answers apart", () => {
    const {account, comments} = esm("stackoverflow-mock.mjs", "distinct")
    expect(account).toBe(true)
    expect(comments).toBe(true)
  })
})
