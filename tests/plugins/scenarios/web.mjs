//Imports
import axios from "axios"
import setup from "../../../source/app/metrics/setup.mjs"
import {markdownForbidden} from "../../../source/app/web/instance.mjs"

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
