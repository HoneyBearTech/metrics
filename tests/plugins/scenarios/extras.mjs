//Imports
import OctokitRest from "@octokit/rest"
import octokit from "@octokit/graphql"
import setup from "../../../source/app/metrics/setup.mjs"
import metrics from "../../../source/app/metrics/index.mjs"
import mocks from "../../mocks/index.mjs"
import { svg, formatters } from "../../../source/app/metrics/utils.mjs"
import fs from "fs"
import path from "path"
import url from "url"
import yaml from "js-yaml"
import metadata from "../../../source/app/metrics/metadata.mjs"

//Server settings are read the same way the server does (only the extra features change)
const {conf, Plugins, Templates} = await setup({log: false})
const core = conf.metadata.plugins.core
const {base, habits} = conf.metadata.plugins
const permissions = {extras_css: "metrics.run.puppeteer.user.css", extras_js: "metrics.run.puppeteer.user.js", config_presets: "metrics.setup.community.presets", setup_community_templates: "metrics.setup.community.templates", verify: "metrics.npm.optional.libxml2"}

/**Tell what the extras parser answers for each guarded core input, for each kind of server settings */
export function parser() {
  const settings = {
    "no extras": undefined,
    "extras off": {default: false, features: false},
    "no features": {features: []},
    "other features": {features: ["metrics.run.user.cmd"]},
    "the feature": input => ({features: [permissions[input]]}),
    "all features": {features: true},
    "default on": {default: true},
    "legacy flags": () => ({features: [], css: true, js: true, presets: true}),
    "legacy flags alone": {css: true, js: true, presets: true},
  }
  const result = {}
  for (const input of Object.keys(permissions)) {
    result[input] = {}
    for (const [name, extras] of Object.entries(settings))
      result[input][name] = core.extras(input, {extras: typeof extras === "function" ? extras(input) : extras, error: false})
  }
  //Plugin options are checked by their own requirements
  const needs = {indepth: ["base", base, ["metrics.api.github.overuse"]], charts: ["habits", habits, ["metrics.api.github.overuse", "metrics.run.tempdir", "metrics.run.git"]]}
  result.plugins = {}
  for (const [input, [, plugin, features]] of Object.entries(needs)) {
    result.plugins[input] = {
      "no extras": plugin.extras(input, {extras: undefined, error: false}),
      "other features": plugin.extras(input, {extras: {features: ["metrics.run.user.cmd"]}, error: false}),
      "part of the features": plugin.extras(input, {extras: {features: features.slice(1)}, error: false}),
      "the features": plugin.extras(input, {extras: {features}, error: false}),
      "all features": plugin.extras(input, {extras: {features: true}, error: false}),
    }
  }
  result.template = core.extras("template", {extras: undefined, error: false})
  //Inputs that are refused throw when errors are asked for
  try {
    core.extras("extras_js", {extras: undefined})
    result.throws = false
  }
  catch (error) {
    result.throws = error.extras === true
  }
  return result
}

/**Tell if the legacy flags change the shared features list (they must not) */
export function legacy() {
  const features = []
  const extras = {features, css: true, js: true, presets: true}
  const first = core.extras("extras_css", {extras, error: false})
  const second = core.extras("extras_js", {extras, error: false})
  const third = core.extras("config_presets", {extras, error: false})
  const refused = core.extras("verify", {extras, error: false})
  return {first, second, third, refused, features, same: extras.features === features}
}

/**Render with mocked data and describe what the request's CSS and JavaScript did */
export async function render() {
  const marker = "request-css-flag"
  const script = "globalThis.__flag = 1"
  const states = {
    "no extras": undefined,
    "css feature": {features: ["metrics.run.puppeteer.user.css"]},
    "js feature": {features: ["metrics.run.puppeteer.user.js"]},
    "both features": {features: ["metrics.run.puppeteer.user.css", "metrics.run.puppeteer.user.js"]},
    "all features": {features: true},
    "default on": {default: true},
  }
  //No network, no browser: the rendered image is what would be sent to the browser, and the scripts are what it would run
  const original = {fetch: globalThis.fetch, resize: svg.resize}
  globalThis.fetch = async () => {
    throw new Error("network is disabled")
  }
  const scripts = []
  svg.resize = async (rendered, {scripts: list}) => {
    scripts.push(list)
    return {resized: rendered, mime: "image/svg+xml"}
  }
  const api = await mocks({graphql: octokit.graphql.defaults({headers: {authorization: "token MOCKED_TOKEN"}}), rest: new OctokitRest.Octokit({auth: "MOCKED_TOKEN"})})
  const result = {}
  try {
    for (const [name, extras] of Object.entries(states)) {
      scripts.length = 0
      const q = {template: "classic", base: false, "config.animations": false, "extras.css": `svg { --request: ${marker}; }`, "extras.js": script}
      const settings = {...conf.settings, extras}
      const {rendered} = await metrics({login: "octocat", q}, {...api, plugins: {}, conf: {...conf, settings}, convert: "svg"}, {Plugins, Templates})
      result[name] = {css: rendered.includes(marker), scripts: [...scripts[0]]}
    }
  }
  finally {
    globalThis.fetch = original.fetch
    svg.resize = original.resize
  }
  result.reset = (globalThis.fetch === original.fetch) && (svg.resize === original.resize)
  return result
}

//Plugins whose options need a feature: the check must be called by the plugin itself
const plugins = {steam: ["steam", {user: "octocat"}], chess: ["chess", {platform: "lichess.org", user: "octocat"}], splatoon: ["splatoon", {source: "mocks"}], statink: ["splatoon", {source: "mocks", statink: true}]}

/**List every input that declares required features, with the feature check its plugin calls for it (the check is found by the name the parser builds from its call) */
export function declared() {
  const root = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "../../../source/plugins")
  const rows = []
  const folders = fs.readdirSync(root, {withFileTypes: true}).filter(entry => entry.isDirectory()).flatMap(({name}) => name === "community" ? fs.readdirSync(path.join(root, name)).map(child => `${name}/${child}`) : [name])
  for (const folder of folders) {
    const name = path.basename(folder)
    const descriptor = path.join(root, folder, "metadata.yml")
    if (!fs.existsSync(descriptor))
      continue
    const source = fs.existsSync(path.join(root, folder, "index.mjs")) ? fs.readFileSync(path.join(root, folder, "index.mjs"), "utf8") : ""
    //Names the plugin passes to extras(), and whether it calls enabled() (which checks the "enabled" requirement)
    const called = new Set([...source.matchAll(/\.extras\(\s*"([^"]+)"/g)].map(([, input]) => metadata.to.yaml(input, {name})))
    if (/\.enabled\(/.test(source))
      called.add(metadata.to.yaml("enabled", {name}))
    for (const [input, {extras}] of Object.entries(yaml.load(fs.readFileSync(descriptor, "utf8")).inputs ?? {})) {
      if (extras)
        rows.push({plugin: folder, input, extras: [extras].flat(), checked: called.has(input)})
    }
  }
  return rows
}

/**Run a plugin whose token option needs a feature, with no network, and tell whether it was refused and what it tried to reach (plugins receive the features the way the core plugin passes them) */
export async function token() {
  const result = {}
  const states = {"no extras": false, "other features": ["metrics.run.user.cmd"], "the feature": null, "both features": "both", "all features": true, "default on": true}
  for (const [name, [plugin, inputs]] of Object.entries(plugins)) {
    result[name] = {}
    for (const [state, extras] of Object.entries(states)) {
      const requests = []
      const imports = {
        metadata: conf.metadata,
        axios: {get: async address => {
          requests.push(address)
          throw new Error("network is disabled")
        }},
        run: async () => requests.push("run"),
        fs: {writeFile: async () => requests.push("write"), readdir: async () => [], readFile: async () => "{}"},
        format: formatters().format,
        __module: () => "/nonexistent",
      }
      const needed = key => [conf.metadata.plugins[plugin].inputs[`plugin_${plugin}_${key}`].extras].flat()
      const features = extras === null ? needed("token") : extras === "both" ? [...needed("token"), ...(inputs.statink ? needed("statink") : [])] : extras
      const q = {[plugin]: true, ...Object.fromEntries(Object.entries(inputs).map(([key, value]) => [`${plugin}.${key}`, value]))}
      let refused = false
      try {
        await Plugins[plugin]({login: "octocat", q, imports, data: {warnings: []}, account: "user"}, {enabled: true, token: plugin === "splatoon" ? '{"loginState":{"sessionToken":"x"}}' : "TOKEN", extras: features})
      }
      catch (error) {
        refused = error?.error?.instance?.extras === true
      }
      result[name][state] = {refused, requests}
    }
  }
  return result
}
