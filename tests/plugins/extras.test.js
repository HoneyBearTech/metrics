//Tests for the extra features check of the core options (what a web request may ask for depends on the server's settings)
const esm = require("./esm")

describe("Extra features of the core options", () => {
  const guarded = ["extras_css", "extras_js", "config_presets", "setup_community_templates", "verify"]
  const refused = {"no extras": false, "extras off": false, "no features": false, "other features": false, "legacy flags alone": false}
  const allowed = {"the feature": true, "all features": true, "default on": true}

  test("are refused unless the server enables the feature, all features or the default state", () => {
    const result = esm("extras.mjs", "parser")
    for (const input of guarded)
      expect(result[input]).toMatchObject({...refused, ...allowed})
  })

  test("plugin options are checked as before", () => {
    const {plugins} = esm("extras.mjs", "parser")
    for (const input of ["indepth", "charts"])
      expect(plugins[input]).toEqual({"no extras": false, "other features": false, "part of the features": false, "the features": true, "all features": true})
  })

  test("are not refused when they need no feature, and throw when asked to", () => {
    const result = esm("extras.mjs", "parser")
    expect(result.template).toBe(true)
    expect(result.throws).toBe(true)
  })

  test("the legacy flags still enable their own feature only", () => {
    const result = esm("extras.mjs", "parser")
    expect(result.extras_css["legacy flags"]).toBe(true)
    expect(result.extras_js["legacy flags"]).toBe(true)
    expect(result.config_presets["legacy flags"]).toBe(true)
    expect(result.setup_community_templates["legacy flags"]).toBe(false)
    expect(result.verify["legacy flags"]).toBe(false)
  })

  test("the legacy flags never change the shared features list", () => {
    const result = esm("extras.mjs", "legacy")
    expect(result).toMatchObject({first: true, second: true, third: true, refused: false, features: [], same: true})
  })

  test("the CSS and JavaScript of a request are only used with their feature", () => {
    const result = esm("extras.mjs", "render")
    expect(result["no extras"]).toEqual({css: false, scripts: []})
    expect(result["css feature"]).toEqual({css: true, scripts: []})
    expect(result["js feature"]).toEqual({css: false, scripts: ["globalThis.__flag = 1"]})
    expect(result.reset).toBe(true)
    for (const name of ["both features", "all features", "default on"])
      expect(result[name]).toEqual({css: true, scripts: ["globalThis.__flag = 1"]})
  })
})

describe("Extra features of plugin options", () => {
  test("every option that requires a feature is checked by its plugin", () => {
    const rows = esm("extras.mjs", "declared")
    //Core options are checked by the app itself, not by a plugin
    const unchecked = rows.filter(({plugin, checked}) => (plugin !== "core") && (!checked)).map(({plugin, input}) => `${plugin}: ${input}`)
    expect(rows.length).toBeGreaterThan(20)
    expect(unchecked).toEqual([])
  })

  test("token options are refused unless the server grants their feature", () => {
    const result = esm("extras.mjs", "token")
    for (const name of ["steam", "chess", "splatoon", "statink"]) {
      for (const state of ["no extras", "other features"])
        expect(result[name][state]).toEqual({refused: true, requests: []})
      for (const state of ["both features", "all features", "default on"]) {
        expect(result[name][state].refused).toBe(false)
        expect(result[name][state].requests.length).toBeGreaterThan(0)
      }
    }
    for (const name of ["steam", "chess", "splatoon"])
      expect(result[name]["the feature"].refused).toBe(false)
  })

  test("stat.ink upload needs its own feature besides the Splatnet token", () => {
    const result = esm("extras.mjs", "token")
    expect(result.statink["the feature"]).toEqual({refused: true, requests: []})
    expect(result.statink["both features"].requests).toContain("write")
  })
})
