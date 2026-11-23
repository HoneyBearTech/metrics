//Imports
import {createRequire} from "node:module"
import verify from "../../../source/app/metrics/verify.mjs"
import {markdown} from "../../../source/app/metrics/utils.mjs"

//The XML checker is optional, null when it cannot be loaded here
async function checker() {
  try {
    return (await import("libxmljs2")).default
  }
  catch {
    return null
  }
}

//Code block with the given number of lines
function snippet(language, count) {
  return [`\`\`\`${language}`, ...Array.from({length: count}, (_, i) => `const value${i} = ${i}`), "```"].join("\n")
}

//Run the check and tell what happened
function attempt(svg, libxmljs) {
  try {
    verify(svg, libxmljs, "octocat")
    return {threw: false, message: null}
  }
  catch (error) {
    return {threw: true, message: error.message}
  }
}

const good = '<svg xmlns="http://www.w3.org/2000/svg"><g class="a"/></svg>'
const bad = '<svg xmlns="http://www.w3.org/2000/svg"><g class="a" class="b"/></svg>'

export async function loaded() {
  return {available: Boolean(await checker())}
}

export async function present() {
  const libxmljs = await checker()
  return {good: attempt(good, libxmljs), bad: attempt(bad, libxmljs)}
}

export async function missing() {
  return {good: attempt(good, null), bad: attempt(bad, null)}
}

//Errors of the checker, which throws on some of them
function problems(libxmljs, xml) {
  try {
    return libxmljs.parseXml(xml).errors.map(String)
  }
  catch (error) {
    return [error.message]
  }
}

//Code blocks of the given language and number of lines, checked as XML when the checker is there
export async function code() {
  const libxmljs = await checker()
  const result = {}
  for (const [name, text] of Object.entries({js: snippet("js", 2), plain: snippet("", 2), single: snippet("js", 1)})) {
    const html = await markdown(text, {mode: "multiline"})
    const opening = html.match(/<code[^>]*>/)?.[0] ?? ""
    result[name] = {html, classes: (opening.match(/ class=/g) ?? []).length, opening, errors: libxmljs ? problems(libxmljs, `<div>${html}</div>`) : null}
  }
  return result
}
