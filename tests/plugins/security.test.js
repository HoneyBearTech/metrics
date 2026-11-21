//Tests for the small security fixes (page requests, signing keys folder, analyzer id)
const fs = require("fs")
const os = require("os")
const path = require("path")
const vm = require("vm")
const esm = require("./esm")

const statics = path.join(__dirname, "../../source/app/web/statics")
const encoded = "a%2Fb%3Fc%23d"
const name = "a/b?c#d"

//Run a page script with a fake Vue, and return the options given to Vue and the requests made to the fake axios
async function load(file, respond) {
  const script = fs.readFileSync(path.join(statics, file), "utf8")
  const requests = []
  const axios = {defaults: {headers: {common: {}}}, get: async url => {
    requests.push(url)
    return {data: respond(url)}
  }}
  let options = null
  function Vue(value) {
    options = value
  }
  const window = {matchMedia: null, location: {}}
  const localStorage = {getItem: () => null}
  const context = {PrismComponent: {}, Vue, axios, window, localStorage, location: {search: "", pathname: "/"}, URLSearchParams, console: {warn: () => null}, setTimeout, Promise, Object, JSON, Intl}
  await vm.runInNewContext(script, context)
  return {options, requests}
}

describe("Embed page", () => {
  async function generate(user) {
    const {options, requests} = await load("embed/app.js", url => {
      if (url === "/.plugins.metadata")
        return {core: {web: {}}}
      if (url.startsWith("/.uncache?user="))
        return {token: "t/k?1"}
      return {}
    })
    requests.length = 0
    const self = {user, url: "/result", generated: {pending: false}}
    await options.methods.generate.call(self)
    return requests
  }

  test("Encodes the user name and the token in the cache reset requests", async () => {
    const requests = await generate(name)
    expect(requests.slice(0, 2)).toEqual([`/.uncache?user=${encoded}`, "/.uncache?token=t%2Fk%3F1"])
    expect(requests[2]).toBe("/result")
  })

  test("Leaves a normal user name unchanged", async () => {
    expect((await generate("octocat")).slice(0, 2)).toEqual(["/.uncache?user=octocat", "/.uncache?token=t%2Fk%3F1"])
  })
})

describe("Insights page", () => {
  async function search(user, first, others = () => ({plugins: {}})) {
    const {options, requests} = await load("insights/script.js", url => url === `/insights/query/${encodeURIComponent(user)}` ? first : others(url))
    requests.length = 0
    await options.methods.search.call({user, localstorage: false, plugins: [], metrics: null})
    return requests.filter(url => url.startsWith("/insights/"))
  }

  test("Encodes the user name", async () => {
    expect(await search(name, {rendered: {plugins: {}}})).toEqual([`/insights/query/${encoded}`])
  })

  test("Leaves a normal user name unchanged", async () => {
    expect(await search("octocat", {rendered: {plugins: {}}})).toEqual(["/insights/query/octocat"])
  })

  test("Encodes the user name and the plugin name when waiting for plugins", async () => {
    const requests = await search(name, {processing: true, plugins: ["a/b"]})
    expect(requests).toEqual([`/insights/query/${encoded}`, `/insights/query/${encoded}/base`, `/insights/query/${encoded}/a%2Fb`])
  })

  test("Leaves normal names unchanged when waiting for plugins", async () => {
    const requests = await search("octocat", {processing: true, plugins: ["languages"]})
    expect(requests).toEqual(["/insights/query/octocat", "/insights/query/octocat/base", "/insights/query/octocat/languages"])
  })
})

describe("Signing keys", () => {
  const posix = process.platform !== "win32"

  function check({seen, remaining}) {
    expect(seen).toHaveLength(4)
    for (const {file, dir, tmpdir, exists, mode, content} of seen) {
      expect(dir).not.toBe(tmpdir)
      expect(path.dirname(dir)).toBe(tmpdir)
      expect(path.basename(dir).startsWith("metrics-gpg-")).toBe(true)
      expect(path.basename(file)).toMatch(/^(1A2B3C4D|5E6F7A8B).gpg$/)
      expect(exists).toBe(true)
      expect(content).toMatch(/^key-[ab]$/)
      if (posix)
        expect(mode).toBe(0o700)
    }
    expect(new Set(seen.map(({dir}) => dir)).size).toBe(1)
    expect(os.tmpdir()).toBe(seen[0].tmpdir)
    expect(remaining.every(exists => !exists)).toBe(true)
  }

  test("Saves keys inside a new private folder that is removed afterwards", () => {
    const result = esm("analyzer.mjs", "gpgOk")
    check(result)
    expect(result.seen.map(({command}) => command.startsWith("gpg "))).toEqual([true, true, true, true])
  })

  test("Removes the folder when the shell fails", () => {
    check(esm("analyzer.mjs", "gpgFail"))
  })

  test("Creates no folder when there are no keys", () => {
    const {before, after} = esm("analyzer.mjs", "gpgNone")
    expect(after).toBe(before)
  })
})

describe("Analyzer id", () => {
  test("Is a random UUID when not given", () => {
    const {first, second, given} = esm("analyzer.mjs", "uid")
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(second).toMatch(/^[0-9a-f-]{36}$/)
    expect(second).not.toBe(first)
    expect(given).toBe("fixed")
  })
})
