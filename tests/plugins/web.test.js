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

  test("the verify option is on only for a true value", () => {
    const result = esm("web.mjs", "verified")
    for (const name of ["undefined", "", "false", "0", "off", "no"])
      expect(result[name]).toBe(false)
    for (const name of ["true", "True", "1", "yes", "on"])
      expect(result[name]).toBe(true)
  })

  test("the verify option of a request decides if the picture is checked", () => {
    const result = esm("web.mjs", "checking")
    expect(result).toEqual({omitted: false, "&verify=false": false, "&verify=0": false, "&verify=true": true})
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

  test("presets are allowed with all features, the feature in a list or the default state, and never throw", () => {
    const result = esm("web.mjs", "presets")
    expect(result).toEqual({
      "all features": true,
      "list with the feature": true,
      "list without the feature": false,
      "empty list": false,
      off: false,
      "unset and default on": true,
      "unset and default off": false,
      unset: false,
    })
  })

  test("the extras page lists the logged-in features for every form of the setting, without changing it", () => {
    const result = esm("web.mjs", "extras")
    expect(result.unset).toMatchObject({logged: ["b"], visitor: false, untouched: true})
    expect(result.off).toMatchObject({logged: ["b"], visitor: false, untouched: true})
    expect(result.list).toMatchObject({logged: ["a", "b"], visitor: ["a"], untouched: true})
    expect(result.all).toMatchObject({logged: true, visitor: true, untouched: true})
    expect(result.nothing).toEqual({logged: ["a"], unset: false, default: true})
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

  test("answers its routes, and the query of a request (and the repository alias) reaches the rendering", () => {
    const result = esm("web.mjs", "routes")
    for (const path of ["/", "/.css/style.css", "/.js/app.js", "/.js/faker/index.mjs", "/.templates/classic/partials/achievements.ejs", "/insights/", "/insights/octocat", "/embed/"])
      expect(result[path]).toMatchObject({status: 200, empty: false})
    //Legacy catch-all route, and no route for more than a login and a repository
    expect(result["/about/"]).toMatchObject({status: 302, location: "/insights/"})
    expect(result["/about/x/y"]).toMatchObject({status: 302, location: "/insights/x/y"})
    expect(result["/About/x"]).toMatchObject({status: 302, location: "/insights/x"})
    expect(result["/octocat/repo/extra"].status).toBe(404)
    //Options of the query reach the rendering
    expect(result["/octocat?config.output=json&template=classic&base.header=0"]).toMatchObject({status: 200, q: {template: "classic", "base.header": "0"}})
    expect(result["/octocat?config.output=json&template=classic&base.header=0"].base.header).toBe(false)
    //Repository alias sets the repository template and the repository, unless a template is given
    expect(result["/octocat/repo?config.output=json"]).toMatchObject({status: 200, q: {template: "repository", repo: "repo"}})
    expect(result["/octocat/repo?config.output=json&template=markdown"]).toMatchObject({status: 200, q: {template: "markdown", repo: "repo"}})
  })
})
