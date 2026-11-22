//Tests for the web server's markdown output (it renders a template chosen by the request, which is code)
const esm = require("./esm")

describe("Markdown output on the web server", () => {
  const refused = {markdown: true, "markdown-pdf": true, "auto and markdown template": true, "no output and markdown template": true, "template as a list": true}
  const allowed = {markdown: false, "markdown-pdf": false, "auto and markdown template": false, "no output and markdown template": false, "template as a list": false}
  //Other outputs and templates never need the feature
  const others = {"auto and default template": false, svg: false, png: false, json: false, classic: false, "unknown template": false}

  test("is refused unless the extra feature is enabled", () => {
    const result = esm("web.mjs", "forbidden")
    for (const name of ["no extras", "extras off", "no features", "other features"])
      expect(result[name]).toEqual({...refused, ...others})
    expect(result.defaulted).toBe(true)
  })

  test("is allowed with the extra feature, all features or the default state", () => {
    const result = esm("web.mjs", "forbidden")
    for (const name of ["the feature", "all features", "default on"])
      expect(result[name]).toEqual({...allowed, ...others})
  })

  test("logged-in extra features are added to a copy, never to the shared settings", () => {
    const result = esm("web.mjs", "logged")
    const feature = "metrics.run.user.template"
    expect(result.array.features).toEqual(["a", feature])
    expect(result.empty.features).toEqual([feature])
    expect(result.unset.features).toEqual([feature])
    expect(result.off.features).toEqual([feature])
    expect(result.all.features).toBe(true)
    expect(result.none).toEqual(["a"])
    for (const name of ["array", "empty", "unset", "off", "all"])
      expect(result[name].untouched).toBe(true)
    //Settings still refuse markdown after a logged-in request, only the logged-in copy allows it
    for (const name of ["array", "empty", "unset", "off"]) {
      expect(result[name].forbiddenAfter).toBe(true)
      expect(result[name].forbiddenLogged).toBe(false)
    }
  })

  test("is rendered by the sandbox server, which enables all extra features (the opt-in works)", () => {
    const {link, auto, repository, json, fetched} = esm("web.mjs", "sandbox")
    for (const result of [link, auto, repository]) {
      expect(result.status).toBe(200)
      expect(result.body).toBe("marker\nRESULT=1")
      expect(result.executed).toBe(1)
    }
    expect(json.status).toBe(200)
    expect(json.body).toBe(true)
    expect(fetched.length).toBeGreaterThan(0)
  })
})
