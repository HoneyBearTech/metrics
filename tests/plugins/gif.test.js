//Tests for animated gif images made from page screenshots
const esm = require("./esm")

const prefix = "data:image/gif;base64,"

describe("Animated gif", () => {
  test("has one page per frame, with the given size, delay and looping", () => {
    const {result, pages, width, height, pageHeight, loop, delay} = esm("gif.mjs", "normal")
    expect(result).toBe(prefix)
    expect(pages).toBe(3)
    expect(width).toBe(40)
    expect(pageHeight).toBe(30)
    expect(height).toBe(90)
    expect(loop).toBe(0)
    expect(delay).toEqual([150, 150, 150])
  })

  test("plays once when repeat is disabled", () => {
    const {result, loop} = esm("gif.mjs", "once")
    expect(result).toBe(prefix)
    expect(loop).toBe(1)
  })

  test("accepts a custom delay and quality", () => {
    const {result, delay} = esm("gif.mjs", "slow")
    expect(result).toBe(prefix)
    expect(delay).toEqual([300, 300, 300])
  })

  test("keeps the size of screenshots that are larger than requested", () => {
    const {result, pages, width, pageHeight} = esm("gif.mjs", "scaled")
    expect(result).toBe(prefix)
    expect(pages).toBe(3)
    expect(width).toBe(80)
    expect(pageHeight).toBe(60)
  })

  test("keeps identical frames instead of merging them", () => {
    const {result, pages, delay} = esm("gif.mjs", "identical")
    expect(result).toBe(prefix)
    expect(pages).toBe(3)
    expect(delay).toEqual([150, 150, 150])
  })

  test("returns the placeholder image when a screenshot fails", () => {
    const {result} = esm("gif.mjs", "failing")
    expect(result.startsWith("data:image/png;base64,")).toBe(true)
    expect(result).toBe("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==")
  })
})
