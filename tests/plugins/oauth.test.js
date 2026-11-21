//Tests for the web server's sign-in redirect (runs the real page script and the real check function)
const fs = require("fs")
const path = require("path")
const vm = require("vm")
const esm = require("./esm")

describe("Sign-in redirect page", () => {
  const html = fs.readFileSync(path.join(__dirname, "../../source/app/web/statics/oauth/redirect.html"), "utf8")
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]

  //Run the page script with a fake browser and return where it sends the browser
  function run(to, session = "abc123") {
    const params = new URLSearchParams()
    if (to !== undefined)
      params.set("to", to)
    if (session)
      params.set("session", session)
    const saved = {}
    const window = {location: {href: null}}
    const location = {origin: "http://localhost:3000", search: `?${params}`}
    const localStorage = {setItem: (key, value) => saved[key] = value}
    vm.runInNewContext(script, {URL, URLSearchParams, location, localStorage, window})
    return {href: window.location.href, saved}
  }

  test.each([
    ["javascript:alert(1)"],
    ["JavaScript:alert(1)"],
    [" javascript:alert(1)"],
    ["//other.site"],
    ["/\\other.site"],
    ["https://other.site/x"],
    ["http://localhost:3001/"],
    [""],
    [undefined],
  ])("Sends %j to the sign-in page", to => {
    expect(run(to).href).toBe("/.oauth")
  })

  test.each([
    ["/insights/someone", "http://localhost:3000/insights/someone"],
    ["http://localhost:3000/insights/someone?x=1", "http://localhost:3000/insights/someone?x=1"],
  ])("Sends %j to the same site", (to, expected) => {
    expect(run(to).href).toBe(expected)
  })

  test("Still saves the session", () => {
    expect(run("javascript:alert(1)", "abc123").saved).toEqual({"session.metrics": "abc123"})
    expect(run("/insights/someone", "def456").saved).toEqual({"session.metrics": "def456"})
  })
})

describe("Sign-in return address check", () => {
  const {kept, dropped} = esm("oauth.mjs", "check")

  test("Keeps same-site addresses and paths, whatever the sign-in address looks like", () => {
    expect(kept).toEqual({
      full: "https://metrics.example.com/insights/someone?x=1",
      path: "https://metrics.example.com/insights/someone",
      slash: "https://metrics.example.com/insights/someone",
      "sub path": "https://metrics.example.com/insights/someone",
      "full address": "https://metrics.example.com/insights/someone",
    })
  })

  test.each(["other", "port", "insecure", "script", "upper", "relative", "backslash", "missing", "empty", "nonsense", "no base", "bad base"])("Drops %s", name => {
    expect(dropped[name]).toBeNull()
  })
})

describe("Cache reset password", () => {
  test("Is made with secure random bytes", () => {
    const {tokens} = esm("oauth.mjs", "uncache")
    expect(tokens).toHaveLength(2)
    for (const token of tokens)
      expect(token).toMatch(/^[a-f0-9]{64}$/)
    expect(tokens[0]).not.toBe(tokens[1])
  })
})
