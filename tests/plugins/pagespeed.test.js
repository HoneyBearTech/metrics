//Tests for the pagespeed plugin
const esm = require("./esm.js")

const api = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url="

describe("Pagespeed", () => {
  test("Adds https:// to an address without protocol", () => {
    const {result, requests, error} = esm("pagespeed.mjs", "no_protocol")
    expect(error).toBeUndefined()
    expect(result.url).toBe("https://example.com")
    expect(requests).toHaveLength(1)
    expect(requests[0].startsWith(`${api}https://example.com/blog&category=performance`)).toBe(true)
  })

  test("Keeps the port of an address in the result and sends the address unchanged", () => {
    const {result, requests, error} = esm("pagespeed.mjs", "port_and_path")
    expect(error).toBeUndefined()
    expect(result.url).toBe("https://example.com:8443")
    expect(requests[0].startsWith(`${api}https://example.com:8443/some/path?a=b c&category=performance`)).toBe(true)
  })

  test("Fails with a clear message on an address that cannot be read", () => {
    const {result, requests, error} = esm("pagespeed.mjs", "invalid_address")
    expect(result).toBeUndefined()
    expect(error).toBe("Website URL is not valid")
    expect(requests).toHaveLength(0)
  })
})
