//Tests for the rendered SVG check and for the markup of multi-line code blocks
const esm = require("./esm")

const {available} = esm("svg-check.mjs", "loaded")
//The "present" cases need the optional XML checker, which Docker builds for CI
const optional = available ? test : test.skip
if (!available)
  console.warn("libxmljs2 could not be loaded here, the tests that need the XML checker are skipped")

describe("SVG check", () => {
  optional("a valid SVG passes when the checker is present", () => {
    expect(esm("svg-check.mjs", "present").good.threw).toBe(false)
  })

  optional("an invalid SVG is refused when the checker is present", () => {
    const {bad} = esm("svg-check.mjs", "present")
    expect(bad.threw).toBe(true)
    expect(bad.message).toContain("Malformed SVG")
  })

  test("nothing is thrown when the checker is missing", () => {
    const {good, bad} = esm("svg-check.mjs", "missing")
    expect(good.threw).toBe(false)
    expect(bad.threw).toBe(false)
  })
})

describe("Code blocks with several lines", () => {
  test("a block with a language has one class attribute and is valid XML", () => {
    const {js} = esm("svg-check.mjs", "code")
    expect(js.classes).toBe(1)
    expect(js.opening).toContain("language-multiline")
    expect(js.opening).toContain("language-js")
    expect(js.opening).toContain('xml:space="preserve"')
    if (js.errors)
      expect(js.errors).toEqual([])
  })

  test("a block without a language still gets language-multiline", () => {
    const {plain} = esm("svg-check.mjs", "code")
    expect(plain.opening).toBe('<code class="language-multiline" xml:space="preserve">')
  })

  test("a single-line block is unchanged", () => {
    const {single} = esm("svg-check.mjs", "code")
    expect(single.opening).not.toContain("language-multiline")
    expect(single.opening).not.toContain("xml:space")
  })
})
