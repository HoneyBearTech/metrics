//Shared helper of the metrics tests (this is not a test file: jest only runs the *.test.js files next to it)
//Each *.test.js file calls run() with its own shard number and web server port
//Imports
const processes = require("child_process")
const yaml = require("js-yaml")
const fs = require("fs")
const path = require("path")
const url = require("url")
const axios = require("axios")
const faker = require("@faker-js/faker").faker
const ejs = require("ejs")

//Paths
const root = path.join(__dirname, "../..")

//GitHub action
const action = yaml.load(fs.readFileSync(path.join(root, "action.yml"), "utf8"))
action.defaults = Object.fromEntries(Object.entries(action.inputs).map(([key, {default: value}]) => [key, value]))
action.input = vars => Object.fromEntries([...Object.entries(action.defaults), ...Object.entries(vars)].map(([key, value]) => [`INPUT_${key.toLocaleUpperCase()}`, value]))
action.run = async vars =>
  await new Promise((solve, reject) => {
    let [stdout, stderr] = ["", ""]
    const env = {...process.env, ...action.input(vars), GITHUB_REPOSITORY: "lowlighter/metrics"}
    const child = processes.spawn("node", ["source/app/action/index.mjs"], {env})
    child.stdout.on("data", data => stdout += data)
    child.stderr.on("data", data => stderr += data)
    child.on("close", code => {
      if (code === 0)
        return solve(true)
      console.log(stdout, stderr)
      reject(stdout)
    })
  })

//Request that fails with a plain error (jest workers can't send axios errors back, as they hold sockets and so can't be serialized)
async function get(url) {
  try {
    return await axios.get(url)
  }
  catch (error) {
    throw new Error(`GET ${url.replace(/\?.*$/, "")} failed: ${error.message}${error.response ? `\n${`${error.response.data}`.substring(0, 2000)}` : ""}`)
  }
}

//Web instance (each test file starts its own, on its own port)
function webinstance(port) {
  const web = {port}
  web.run = async vars => (await get(`http://localhost:${port}/lowlighter?${new url.URLSearchParams(Object.fromEntries(Object.entries(vars).map(([key, value]) => [key.replace(/^plugin_/, "").replace(/_/g, "."), value])))}`)).status === 200
  web.start = async () =>
    new Promise((solve, reject) => {
      let [stdout, stderr] = ["", ""]
      web.instance = processes.spawn("node", ["source/app/web/index.mjs"], {env: {...process.env, SANDBOX: true, METRICS_SANDBOX_PORT: `${port}`}})
      web.instance.stdout.on("data", data => (stdout += data, /Server ready !/.test(stdout) ? solve() : null))
      web.instance.stderr.on("data", data => (stderr += data, console.error(`${data}`)))
      web.instance.on("error", error => reject(error))
      web.instance.on("exit", (code, signal) => reject(new Error(`Web instance on port ${port} exited before it was ready (code: ${code}, signal: ${signal})\n${stderr || stdout}`)))
    })
  web.stop = async () => await web.instance?.kill("SIGKILL")
  return web
}

//Web instance placeholder
function placeholderinstance(port) {
  require("../../source/app/web/statics/embed/app.placeholder.js")
  const placeholder = globalThis.placeholder
  delete globalThis.placeholder
  placeholder.init({
    faker,
    ejs,
    axios: {
      async get(url) {
        return get(`http://localhost:${port}${url}`)
      },
    },
  })
  placeholder.run = async vars => {
    const options = Object.fromEntries(Object.entries(vars).map(([key, value]) => [key.replace(/^plugin_/, "").replace(/_/g, "."), value]))
    const enabled = Object.fromEntries(Object.entries(vars).filter(([key]) => /^plugin_[a-z]+$/.test(key)))
    const config = Object.fromEntries(Object.entries(options).filter(([key]) => /^config[.]/.test(key)))
    const base = Object.fromEntries(Object.entries(options).filter(([key]) => /^base[.]/.test(key)))
    return typeof await placeholder({
      templates: {selected: vars.template},
      plugins: {enabled: {...enabled, base}, options},
      config,
      version: "TEST",
      user: "lowlighter",
      avatar: "https://github.com/lowlighter.png",
    }) === "string"
  }
  return placeholder
}

//Load metadata (as jest doesn't support ESM modules, we use this dirty hack)
function loadmetadata() {
  return JSON.parse(`${
    processes.spawnSync("node", [
      "--input-type",
      "module",
      "--eval",
      'import metadata from "./source/app/metrics/metadata.mjs";console.log(JSON.stringify(await metadata({log:false})))',
    ]).stdout
  }`)
}

//Build tests index
function index(metadata) {
  const tests = []
  for (const type of ["plugins", "templates"]) {
    for (const name in metadata[type]) {
      const cases = yaml
        .load(fs.readFileSync(path.join(root, "tests/cases", `${name}.${type.replace(/s$/, "")}.yml`), "utf8"))
        ?.map(({name: test, with: inputs, modes = [], timeout}) => {
          const skip = new Set(Object.entries(metadata.templates).filter(([_, {readme: {compatibility}}]) => !compatibility[name]).map(([template]) => template))
          if (!(metadata[type][name].supports?.includes("repository")))
            skip.add("repository")
          return [test, inputs, {skip: [...skip], modes, timeout, community: (type === "templates") && (name === "community")}]
        }) ?? []
      tests.push(...cases)
    }
  }
  return tests
}

//Split tests between files
//Cases are spread over the shards using the time each one took (in seconds, see weights.json), heaviest first, each on the lightest shard so far
//The result only depends on the cases and on weights.json, so a file always gets the same cases
//All community template cases go to shard 0, which is the only one to clean the folders they write to
function split(tests, shards, weights = require("./weights.json")) {
  const fallback = 10
  const load = new Array(shards).fill(0)
  const assigned = new Map()
  const rest = []
  for (const test of tests) {
    if (test[2].community)
      assigned.set(test, 0)
    else
      rest.push(test)
  }
  const weight = test => weights[test[0]] ?? fallback
  for (const test of rest.map((test, i) => ({test, i})).sort((a, b) => (weight(b.test) - weight(a.test)) || (a.i - b.i)).map(({test}) => test)) {
    const shard = load.indexOf(Math.min(...load))
    load[shard] += weight(test)
    assigned.set(test, shard)
  }
  return tests.map(test => [test, assigned.get(test)])
}

/**Register the tests of one file */
function run({shard, shards, port}) {
  const web = webinstance(port)
  const placeholder = placeholderinstance(port)
  const metadata = loadmetadata()
  //Cases of this file, in the same order as in the cases files
  const tests = split(index(metadata), shards).filter(([_, assigned]) => assigned === shard).map(([test]) => test)
  const community = path.join(root, "source/templates/@classic")

  //Setup
  beforeAll(async () => {
    //Clean community template (only the file that runs the community template cases does it)
    if (tests.some(([_, __, {community}]) => community))
      await fs.promises.rm(community, {recursive: true, force: true})
    //Start web instance
    await web.start()
  })
  //Teardown
  afterAll(async () => {
    //Stop web instance
    await web.stop()
    //Clean community template
    if (tests.some(([_, __, {community}]) => community))
      await fs.promises.rm(community, {recursive: true, force: true})
  })

  //Tests run
  describe("GitHub Action", () =>
    describe.each([
      ["classic", {}],
      ["terminal", {}],
      ["repository", {repo: "metrics"}],
    ])("Template : %s", (template, query) => {
      for (const [name, input, {skip = [], modes = [], timeout} = {}] of tests) {
        if ((skip.includes(template)) || ((modes.length) && (!modes.includes("action"))))
          test.skip(name, () => null)
        else
          test(name, async () => expect(await action.run({template, base: "", query: JSON.stringify(query), plugins_errors_fatal: true, dryrun: true, use_mocked_data: true, verify: true, retries: 1, ...input})).toBe(true), timeout)
      }
    }))

  describe("Web instance", () =>
    describe.each([
      ["classic", {}],
      ["terminal", {}],
      ["repository", {repo: "metrics"}],
    ])("Template : %s", (template, query) => {
      for (const [name, input, {skip = [], modes = [], timeout} = {}] of tests) {
        if ((skip.includes(template)) || ((modes.length) && (!modes.includes("web"))))
          test.skip(name, () => null)
        else
          test(name, async () => expect(await web.run({template, base: 0, ...query, plugins_errors_fatal: true, verify: true, ...input})).toBe(true), timeout)
      }
    }))

  describe("Web instance (placeholder)", () =>
    describe.each([
      ["classic", {}],
      ["terminal", {}],
    ])("Template : %s", (template, query) => {
      for (const [name, input, {skip = [], modes = [], timeout} = {}] of tests) {
        if ((skip.includes(template)) || ((modes.length) && (!modes.includes("placeholder"))))
          test.skip(name, () => null)
        else
          test(name, async () => expect(await placeholder.run({template, base: 0, ...query, ...input})).toBe(true), timeout)
      }
    }))
}

module.exports = {run, split, index}
