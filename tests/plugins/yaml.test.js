//Tests for the way YAML is read and written
const esm = require("./esm")

describe("Presets", () => {
  test("read merge keys, anchors and nothing else that is risky", () => {
    const result = esm("yaml.mjs", "preset")
    expect(result.plain).toEqual({base: "header"})
    expect(result.merge).toEqual({base: "header", activity: "yes"})
    expect(result["merge with override"]).toEqual({base: "", activity: "yes"})
    expect(result.anchor).toEqual({base: "header", activity: "header"})
  })

  test("are ignored when empty, unknown, made of two documents or using code types", () => {
    const result = esm("yaml.mjs", "preset")
    for (const name of ["empty", "comment", "unknown schema", "code type", "two documents"])
      expect(result[name]).toEqual({})
    expect(result.ran).toBe(false)
  })

  test("read dates, sets and merge keys as before", () => {
    expect(esm("yaml.mjs", "types")).toEqual({
      date: true,
      time: "2001-12-15T02:59:43.100Z",
      set: ["a", "b"],
      merge: {x: 1, y: 2},
      list: {x: 1, z: 3, y: 2},
      text: null,
    })
  })
})

describe("Template metadata", () => {
  test("is empty when the descriptor is missing, empty or only has comments", () => {
    const result = esm("yaml.mjs", "template")
    for (const name of ["missing", "empty", "spaces", "comment"])
      expect(result[name]).toEqual({name: "(unnamed template)", description: ""})
    expect(result.named).toEqual({name: "Named", description: ""})
  })

  test("is refused when the descriptor has two documents", () => {
    expect(esm("yaml.mjs", "template").two).toBeNull()
  })
})
