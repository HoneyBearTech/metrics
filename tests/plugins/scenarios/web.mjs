//Imports
import axios from "axios"
import setup from "../../../source/app/metrics/setup.mjs"
import {extrasFeatures, markdownForbidden, presetsAllowed, withLoggedFeatures} from "../../../source/app/web/instance.mjs"

//Marker set by a template if it is ever run (it only sets a variable, nothing else)
const marker = "{% globalThis.__marker = 1 %}marker"

//Server settings are read the same way the server does (only the allowed outputs and extra features change)
const {conf} = await setup({log: false})

/**Tell if a request for the given output and template is refused, for each kind of server settings */
export function forbidden() {
  const settings = {
    "no extras": undefined,
    "extras off": {default: false, features: false},
    "no features": {features: []},
    "other features": {features: ["metrics.setup.community.presets", "metrics.run.user.cmd"]},
    "the feature": {features: ["metrics.run.user.template"]},
    "all features": {features: true},
    "default on": {default: true},
  }
  const requests = {
    "markdown": {convert: "markdown", q: {template: "markdown"}},
    "markdown-pdf": {convert: "markdown-pdf", q: {template: "markdown"}},
    "auto and markdown template": {convert: "auto", q: {template: "markdown"}},
    "no output and markdown template": {convert: undefined, q: {template: "markdown"}},
    "template as a list": {convert: "auto", q: {template: ["markdown"]}},
    "auto and default template": {convert: "auto", q: {}},
    "svg": {convert: "svg", q: {template: "markdown"}},
    "png": {convert: "png", q: {template: "classic"}},
    "json": {convert: "json", q: {template: "markdown"}},
    "classic": {convert: "auto", q: {template: "classic"}},
    "unknown template": {convert: "auto", q: {template: "unknown"}},
  }
  const result = {}
  for (const [name, extras] of Object.entries(settings)) {
    result[name] = {}
    for (const [request, {convert, q}] of Object.entries(requests))
      result[name][request] = markdownForbidden({conf: {...conf, settings: {...conf.settings, extras}}, q, convert})
  }
  //Default template is the markdown one
  result.defaulted = markdownForbidden({conf: {...conf, settings: {...conf.settings, templates: {default: "markdown", enabled: []}}}, q: {}, convert: "auto"})
  return result
}

/**Add the features of logged-in sessions without changing the shared settings */
export function logged() {
  const result = {}
  for (const [name, features] of Object.entries({array: ["a"], empty: [], unset: undefined, off: false, all: true})) {
    const extras = {features, logged: ["metrics.run.user.template"]}
    const settings = {...conf.settings, extras}
    const merged = withLoggedFeatures({...conf, settings})
    result[name] = {
      features: merged.settings.extras.features,
      sameFeatures: extras.features === features,
      untouched: JSON.stringify(extras.features) === JSON.stringify(features),
      forbiddenAfter: markdownForbidden({conf: {...conf, settings}, q: {template: "markdown"}, convert: "markdown"}),
      forbiddenLogged: markdownForbidden({conf: merged, q: {template: "markdown"}, convert: "markdown"}),
    }
  }
  result.none = withLoggedFeatures({...conf, settings: {...conf.settings, extras: {features: ["a"]}}}).settings.extras.features
  return result
}

/**Tell if presets may be loaded, for each form of the extra feature setting */
export function presets() {
  const settings = {
    "all features": {features: true},
    "list with the feature": {features: ["a", "metrics.setup.community.presets"]},
    "list without the feature": {features: ["a"]},
    "empty list": {features: []},
    "off": {features: false},
    "unset and default on": {default: true},
    "unset and default off": {default: false},
    "unset": undefined,
  }
  const result = {}
  for (const [name, extras] of Object.entries(settings))
    result[name] = presetsAllowed({...conf, settings: {...conf.settings, extras}})
  return result
}

/**Extra features reported to a logged-in session, for each form of the extra feature setting, without changing the shared settings */
export function extras() {
  const result = {}
  for (const [name, features] of Object.entries({unset: undefined, off: false, list: ["a"], all: true})) {
    const extras = {features, logged: ["b"]}
    const settings = {...conf.settings, extras}
    const shared = {...conf, settings}
    result[name] = {
      logged: extrasFeatures(shared, true),
      visitor: extrasFeatures(shared, false),
      untouched: (shared.settings.extras === extras) && (extras.features === features) && (JSON.stringify(extras.logged) === JSON.stringify(["b"])),
    }
  }
  //Nothing given to logged-in sessions, or no extras at all
  result.nothing = {
    logged: extrasFeatures({...conf, settings: {...conf.settings, extras: {features: ["a"]}}}, true),
    unset: extrasFeatures({...conf, settings: {...conf.settings, extras: undefined}}, true),
    default: extrasFeatures({...conf, settings: {...conf.settings, extras: {default: true}}}, true),
  }
  return result
}

/**Ask the sandbox web server (all extra features are enabled) to render a template from a link and from a repository */
export async function sandbox() {
  process.env.METRICS_SANDBOX_PORT = "3918"
  const fetched = []
  axios.get = async url => {
    fetched.push(`${url}`)
    return {data: `${marker}\nRESULT={{ globalThis.__marker }}\n`}
  }
  const app = (await import("../../../source/app/web/instance.mjs")).default
  await app({sandbox: true})
  const get = async query => {
    delete globalThis.__marker
    const response = await fetch(`http://127.0.0.1:3918/octocat?${query}`)
    return {status: response.status, body: (await response.text()).trim(), executed: globalThis.__marker ?? 0}
  }
  const result = {
    link: await get("template=markdown&config.output=markdown&markdown=https%3A%2F%2Fexample.invalid%2Ftemplate.md"),
    auto: await get("template=markdown&markdown=https%3A%2F%2Fexample.invalid%2Ftemplate.md"),
    repository: await get("template=markdown&config.output=markdown&markdown=TEMPLATE.md"),
    json: await get("template=markdown&config.output=json&markdown=https%3A%2F%2Fexample.invalid%2Ftemplate.md"),
    fetched,
  }
  result.json.body = result.json.body.startsWith("{")
  //The server keeps listening, so stop the process once the result is written
  setTimeout(() => process.exit(0), 500)
  return result
}

/**Ask the sandbox web server for its routes: pages and files answer, the legacy and repository routes match, and the query of a request reaches the rendering */
export async function routes() {
  process.env.METRICS_SANDBOX_PORT = "3919"
  const app = (await import("../../../source/app/web/instance.mjs")).default
  await app({sandbox: true})
  const get = async path => {
    const response = await fetch(`http://127.0.0.1:3919${path}`, {redirect: "manual"})
    const type = response.headers.get("content-type") ?? ""
    const body = await response.text()
    return {status: response.status, location: response.headers.get("location"), json: type.startsWith("application/json") ? JSON.parse(body) : null, length: body.length}
  }
  const result = {}
  for (const path of ["/", "/.css/style.css", "/.js/app.js", "/.js/faker/index.mjs", "/.templates/classic/partials/achievements.ejs", "/insights/", "/insights/octocat", "/embed/", "/about/", "/about/x/y", "/octocat/repo/extra"])
    result[path] = await get(path)
  //Rendering as json shows the query it received
  for (const path of ["/octocat?config.output=json&template=classic&base.header=0", "/octocat/repo?config.output=json", "/octocat/repo?config.output=json&template=markdown"])
    result[path] = await get(path)
  setTimeout(() => process.exit(0), 500)
  return Object.fromEntries(Object.entries(result).map(([path, {status, location, json, length}]) => [path, {status, location, q: json?.q, base: json?.base, empty: length === 0}]))
}
