//Imports
import {graphql as octokit} from "@octokit/graphql"
import {Octokit} from "@octokit/rest"
import axios from "axios"
import rss from "rss-parser"
import metrics from "../../../source/app/metrics/index.mjs"
import setup from "../../../source/app/metrics/setup.mjs"
import {markdownSource} from "../../../source/app/metrics/utils.mjs"
import mocks from "../../mocks/index.mjs"

//Marker set by the injected text if it is ever run as template code (it only sets a variable, nothing else)
const marker = "{% globalThis.__marker = 1 %}"

//Setup is made once, mocked github data and svg resizing (which needs a browser) are replaced by stand-ins
const {conf, Plugins, Templates} = await setup({log: false})
const api = await mocks({graphql: octokit.defaults({headers: {authorization: "token MOCKED_TOKEN"}}), rest: new Octokit({auth: "MOCKED_TOKEN"})})
const feed = {title: "Title"}
const posts = {title: "Title"}
rss.prototype.parseURL = () => ({title: "feed", description: "", link: "https://example.invalid/feed", items: [{title: feed.title, link: "https://example.invalid/1", isoDate: "2024-01-02T00:00:00Z"}]})
axios.get = (url, ...args) => {
  if (url === "https://example.invalid/template.md")
    return {data: render.template}
  if (/^https:\/\/dev[.]to\/api\/articles/.test(url))
    return {data: [{title: posts.title, description: "Description", published_at: "2024-01-02T00:00:00Z", url: "https://example.invalid/p"}]}
  throw new Error(`unexpected request: ${url}`)
}

//Render a template source, the same way the action does, and tell if the marker was run
async function render(template, {rss: rssTitle = "Title", post = "Title"} = {}) {
  render.template = template
  Object.assign(feed, {title: rssTitle})
  Object.assign(posts, {title: post})
  delete globalThis.__marker
  const q = {template: "markdown", markdown: "https://example.invalid/template.md", rss: true, "rss.source": "https://example.invalid/feed", "rss.limit": 1, posts: true, "posts.source": "dev.to", "posts.user": "octocat", "posts.limit": 1}
  const {rendered} = await metrics({login: "octocat", q}, {...api, plugins: {rss: {enabled: true}, posts: {enabled: true}}, conf, convert: "markdown"}, {Plugins, Templates})
  const executed = globalThis.__marker ?? 0
  delete globalThis.__marker
  return {rendered, executed}
}

//Data printed by a partial or by a template must stay text
export async function injection() {
  const partials = "<%- await include('partials/rss.ejs') %>\n<%- await include('partials/posts.ejs') %>\n"
  const result = {}
  result.rss = await render(partials, {rss: `RSS ${marker}`})
  result.posts = await render(partials, {post: `POST ${marker}`})
  result.field = await render("Posts: <%= (plugins.posts.list[0].title) %> | {{ plugins.posts.list[0].title }}\n", {post: `FIELD ${marker}`})
  result.control = await render(partials, {})
  return result
}

//Every kind of delimiters supported by the documentation keeps working
export async function syntax() {
  const sources = {
    sugar: "a {{ 1 + 1 }} b {{ \"<i>\" }}\n",
    escaped: "{%= \"<b>&\" %} | {%- \"<b>&\" %} | <%= \"<b>\" %> | <%- \"<b>\" %>\n",
    loops: "{% for (const n of [1, 2]) { %}[{{ n }}]{% } %}<% for (const n of [3, 4]) { %>[<%= n %>]<% } %>\n",
    trimming: "a\n  <%_ if (true) { _%>\nb\n  <%_ } _%>\nc {%- 'x' -%} d\n",
    comments: "one {%# note %}two <%# note %>three\n",
    literal: "<%% literal %%> {{tight}} {text}\n",
    string: "<%- \"{{ x }}\" %>|<%- \"{%= 1 %}\" %>\n",
    include: "{{ 1 }}\n<%- await include('partials/rss.ejs') %>\n{{ 2 }}\n",
  }
  const rendered = {}
  for (const [name, source] of Object.entries(sources))
    rendered[name] = (await render(source)).rendered
  return rendered
}

//Brace tags written with doubled percent signs print literal delimiters and are not run as template code
export async function escapes() {
  const literal = await render("{%% literal %%}\n")
  const marked = await render("{%% globalThis.__marker = 1 %%} and {%% x %} then %%}\n")
  return {literal: literal.rendered, marked: marked.rendered, executed: marked.executed}
}

//Source with delimiters that are never closed is translated in linear time and left as is
export async function unclosed() {
  const result = {}
  for (const [name, opener] of Object.entries({code: "<%", block: "{%", expression: "{{ "})) {
    const source = opener.repeat(1024 * 1024 / opener.length)
    const start = performance.now()
    const translated = markdownSource(source)
    result[name] = {milliseconds: performance.now() - start, same: translated === source}
  }
  return result
}
