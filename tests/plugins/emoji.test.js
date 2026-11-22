//Tests for emoji images made from text
const esm = require("./esm")

describe("Emoji images", () => {
  test("skip characters without an image and replace the others", () => {
    const {requested, victory, check, face, image} = esm("emoji.mjs", "images")
    expect(requested).toBe(1)
    expect(image).toBe(true)
    expect(face).toBe(false)
    expect(victory).toBe(true)
    expect(check).toBe(true)
  })
})
