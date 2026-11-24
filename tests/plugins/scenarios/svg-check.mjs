//Imports
import {JSDOM} from "jsdom"
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

//Problems that make a text not valid XML, found with the optional checker when it is there and with jsdom (which also throws on malformed XML) when it is not
async function problems(xml) {
  const libxmljs = await checker()
  if (libxmljs) {
    try {
      return libxmljs.parseXml(xml).errors.map(String)
    }
    catch (error) {
      return [error.message]
    }
  }
  try {
    new JSDOM(xml, {contentType: "application/xml"})
    return []
  }
  catch (error) {
    return [error.message]
  }
}

//Code blocks of the given language and number of lines, checked as XML
export async function code() {
  const result = {}
  for (const [name, text] of Object.entries({js: snippet("js", 2), plain: snippet("", 2), single: snippet("js", 1)})) {
    const html = await markdown(text, {mode: "multiline"})
    const opening = html.match(/<code[^>]*>/)?.[0] ?? ""
    result[name] = {html, classes: (opening.match(/ class=/g) ?? []).length, opening, errors: await problems(`<div>${html}</div>`)}
  }
  return result
}

//Links with an & in the address, and characters that XML forbids, checked as XML
export async function text() {
  const address = "https://example.com/?a=1&b=2"
  const link = await markdown(`[Docs](${address})`, {mode: "multiline"})
  const control = await markdown("hello\u0001 world\u000B", {mode: "multiline"})
  const result = {link, control}
  result.linked = await problems(`<div>${link}</div>`)
  result.removed = await problems(`<div>${control}</div>`)
  //The address read back from the parsed picture
  result.href = new JSDOM(`<div>${link}</div>`, {contentType: "application/xml"}).window.document.querySelector("a").getAttribute("href")
  return {...result, address}
}

//Written-out and literal forbidden characters, and entity names in the wrong case, each as multiline output
export async function entities() {
  const inputs = {decimal: "a &#1; b", hexadecimal: "a &#x1; b", zero: "a &#0; b", literal: "a \ufffe b \uffff c \u0001 d", apos: "&APOS; x", amp: "&AMP; x", known: "&amp; &lt; &#39; &#x27; &#X27;"}
  const result = {}
  for (const [name, text] of Object.entries(inputs)) {
    const html = await markdown(text, {mode: "multiline"})
    result[name] = {html, problems: await problems(`<div>${html}</div>`)}
  }
  return result
}

//Code with a known language, in both modes
export async function markup() {
  const text = snippet("js", 2)
  return {inline: await markdown(text), multiline: await markdown(text, {mode: "multiline"})}
}

//A hard line break, an image, a rule and a to-do list, checked as XML
export async function closed() {
  const html = await markdown(["first  ", "second", "", "![logo](https://example.com/logo.png)", "", "---", "", "- [x] done", "- [ ] open"].join("\n"), {mode: "multiline"})
  return {html, problems: await problems(`<div>${html}</div>`)}
}

//Tags written by the user as escaped text, which must come out exactly as they were written
export async function written() {
  const inputs = {
    address: "&lt;img src=&quot;https://example.com/a&gt;b.png&quot;/&gt;",
    group: "&lt;input-group&gt;x&lt;/input-group&gt;",
    caption: "&lt;img title=&quot;a &gt; b&quot;/&gt;",
  }
  const result = {}
  for (const [name, text] of Object.entries(inputs)) {
    const html = await markdown(text, {mode: "multiline"})
    result[name] = {html, problems: await problems(`<div>${html}</div>`)}
  }
  return result
}

//Time taken for many unfinished tags in a row
export async function repeated() {
  const start = Date.now()
  const html = await markdown(`&lt;div&gt;\n${"&lt;img ".repeat(64000)}`, {mode: "multiline"})
  return {milliseconds: Date.now() - start, length: html.length}
}

//A block of HTML followed by a blank line, in both modes
export async function spacing() {
  const text = "<div>hello</div>\n\n" + "world"
  return {inline: await markdown(text), multiline: await markdown(text, {mode: "multiline"})}
}
