//Tests for the recently used languages analyzer
const esm = require("./esm.js")

describe("Recently used languages", () => {
  test("Keeps push events of a login with capitals and counts each analyzed commit once", () => {
    const {commits, files, lines, missed, calls} = esm("languages.mjs", "mixedcase")
    //Only push events of the account are analyzed
    expect(calls.sort()).toEqual(["A...B", "C...D"])
    expect(commits).toBe(3)
    expect(files).toBe(3)
    expect(missed.commits).toBe(0)
    expect(Object.keys(lines).sort()).toEqual(["Go", "JavaScript", "Python"])
  })
})
