//Imports
import OctokitRest from "@octokit/rest"
import octokit from "@octokit/graphql"
import setup from "../../../source/app/metrics/setup.mjs"
import metrics from "../../../source/app/metrics/index.mjs"
import mocks from "../../mocks/index.mjs"
import { svg } from "../../../source/app/metrics/utils.mjs"

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
