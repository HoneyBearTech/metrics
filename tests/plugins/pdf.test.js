//Tests for pdf output made from rendered markdown
const fs = require("fs")
const esm = require("./esm")

describe("PDF", () => {
  test("is a Buffer starting with %PDF when the browser returns plain bytes", () => {
    const {buffer, header, mime, plain, closed} = esm("pdf.mjs", "plain_bytes")
    expect(plain).toBe(true)
    expect(buffer).toBe(true)
    expect(header).toBe("%PDF")
    expect(mime).toBe("application/pdf")
    expect(closed).toBe(1)
  })

  const browser = process.env.PUPPETEER_BROWSER_PATH
  const available = Boolean(browser) && fs.existsSync(browser)
  const real = available ? test : test.skip
  real("is a Buffer starting with %PDF when rendered by the real browser (needs PUPPETEER_BROWSER_PATH)", () => {
    const {buffer, header, mime, opened} = esm("pdf.mjs", "real")
    expect(opened).toBe(true)
    expect(buffer).toBe(true)
    expect(header).toBe("%PDF")
    expect(mime).toBe("application/pdf")
  })
})
