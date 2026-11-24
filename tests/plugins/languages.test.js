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

  test("Keeps the kind and color of each language and filters by kind", () => {
    const {programming, markup, data, everything, single} = esm("languages.mjs", "kinds")
    const colors = {JavaScript: "#f1e05a", Python: "#3572A5", CSS: "#663399", JSON: "#292929"}
    expect(programming.languages).toEqual(["JavaScript", "Python"])
    expect(markup.languages).toEqual(["CSS"])
    expect(data.languages).toEqual(["JSON"])
    expect(everything.languages).toEqual(["CSS", "JSON", "JavaScript", "Python"])
    for (const {colors: found} of [programming, markup, data, everything])
      expect(found).toEqual(colors)
    expect(single).toEqual({js: "javascript", py: "python", none: "unknown"})
  })

  test("Keeps languages that belong to a parent language", () => {
    const {recent, indepth, single} = esm("languages.mjs", "children")
    expect(recent).toEqual(["TSX", "TypeScript"])
    expect(indepth).toEqual(["TSX"])
    expect(single).toBe("tsx")
  })
})

describe("In-depth used languages", () => {
  test("Keeps the commits of a local repository, with kinds and colors", () => {
    const {code, data} = esm("languages.mjs", "indepth")
    expect(code.commits).toBe(2)
    expect(code.files).toBe(4)
    expect(code.lines).toEqual({JavaScript: 2, Python: 1, CSS: 1})
    expect(code.stats).toEqual({JavaScript: 27, Python: 14, CSS: 17})
    expect(code.colors).toEqual({JavaScript: "#f1e05a", Python: "#3572A5", CSS: "#663399", JSON: "#292929"})
    expect(code.missed).toEqual({lines: 0, bytes: 0, commits: 0})
    expect(data.lines).toEqual({JSON: 1})
    expect(data.stats).toEqual({JSON: 8})
  })
})
