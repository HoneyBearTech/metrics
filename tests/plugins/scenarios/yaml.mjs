//Imports
import fs from "fs"
import os from "os"
import path from "path"
import metadata from "../../../source/app/metrics/metadata.mjs"
import presets from "../../../source/app/metrics/presets.mjs"
import * as yaml from "js-yaml"
import {dumpOptions, dumpOptionsPlain, load, schema} from "../../../source/app/metrics/yaml.mjs"

//Read presets from their text, through the real loader (requests are answered with the given text)
export async function preset() {
  const lines = (...rows) => rows.join("\n")
  const texts = {
    plain: lines("schema: v1", "with:", "  base: header", ""),
    merge: lines("schema: v1", "with:", '  <<: {base: header, plugin_activity: "yes"}', ""),
    "merge with override": lines("schema: v1", "with:", '  <<: {base: header, plugin_activity: "yes"}', '  base: ""', ""),
    anchor: lines("schema: v1", "with:", "  base: &base header", "  plugin_activity: *base", ""),
    empty: "",
    comment: "# nothing here",
    "unknown schema": lines("schema: v2", "with:", "  base: header", ""),
    "code type": lines("schema: v1", "with:", '  base: !!js/function "function () { globalThis.__ran = true }"', ""),
    "two documents": lines("schema: v1", "with:", "  base: header", "---", "schema: v1", ""),
  }
  const fetched = globalThis.fetch
  const result = {}
  try {
    for (const [name, text] of Object.entries(texts)) {
      globalThis.fetch = async () => ({text: async () => text})
      result[name] = await presets("https://example.invalid/preset.yml", {log: false})
    }
  }
  finally {
    globalThis.fetch = fetched
  }
  result.ran = globalThis.__ran ?? false
  return result
}

//Kinds of values read by presets (dates are read as dates)
export async function types() {
  const read = text => load(text, {schema})
  const lines = (...rows) => rows.join("\n")
  return {
    date: read("d: 2001-12-14")?.d instanceof Date,
    time: read("d: 2001-12-14t21:59:43.10-05:00")?.d?.toISOString(),
    set: [...read("d: !!set {a, b}").d],
    merge: read(lines("a: &a {x: 1}", "b: {<<: *a, y: 2}")).b,
    list: read(lines("a: &a {x: 1}", "b: {<<: [*a, {z: 3}], y: 2}")).b,
    text: read("d: 2001-12-14").d instanceof Date ? null : "text",
  }
}

//Read the metadata of templates without descriptor, with an empty one and with one that only has comments
export async function template() {
  const folder = await fs.promises.mkdtemp(path.join(os.tmpdir(), "metrics-templates-"))
  const result = {}
  try {
    fs.mkdirSync(path.join(folder, "missing"))
    fs.mkdirSync(path.join(folder, "empty"))
    fs.writeFileSync(path.join(folder, "empty", "metadata.yml"), "")
    fs.mkdirSync(path.join(folder, "spaces"))
    fs.writeFileSync(path.join(folder, "spaces", "metadata.yml"), "  ")
    fs.mkdirSync(path.join(folder, "comment"))
    fs.writeFileSync(path.join(folder, "comment", "metadata.yml"), "# nothing here")
    fs.mkdirSync(path.join(folder, "named"))
    fs.writeFileSync(path.join(folder, "named", "metadata.yml"), "name: Named")
    fs.mkdirSync(path.join(folder, "two"))
    fs.writeFileSync(path.join(folder, "two", "metadata.yml"), ["name: One", "---", "name: Two", ""].join("\n"))
    for (const name of ["missing", "empty", "spaces", "comment", "named", "two"]) {
      const meta = await metadata.template({__templates: folder, name, plugins: {}})
      result[name] = meta === null ? null : {name: meta.name, description: meta.description}
    }
  }
  finally {
    fs.rmSync(folder, {recursive: true, force: true})
  }
  return result
}

//Write long text (a link, a tab and only spaces) with both sets of options
export function dump() {
  const value = {link: `https://example.com/${"a".repeat(90)}`, tab: `${"x".repeat(90)}\ty`, spaces: " ".repeat(100)}
  return {default: yaml.dump(value, dumpOptions), plain: yaml.dump(value, dumpOptionsPlain)}
}
