//Imports
import util from "node:util"
import { formatters } from "../../../source/app/metrics/utils.mjs"
import achievements from "../../../source/plugins/achievements/index.mjs"
import music from "../../../source/plugins/music/index.mjs"
import topics from "../../../source/plugins/topics/index.mjs"

//Stand-in puppeteer: evaluate() answers with the given rows one call after the other, counts launches and close() calls, and every page step can be made to throw
function puppeteer({failing = null, close = null, rows = []} = {}) {
  const calls = {launched: 0, closed: 0}
  const step = (name, value = null) => async () => {
    if (failing === name)
      throw new Error(`${name} failed`)
    return typeof value === "function" ? value() : value
  }
  const frame = {
    waitForSelector: step("waitForSelector"),
    evaluate: step("evaluate", () => rows.shift() ?? []),
  }
  const page = {
    setUserAgent: step("setUserAgent"),
    goto: step("goto"),
    mainFrame: () => frame,
    evaluate: step("evaluate", () => rows.shift() ?? []),
    close: step("close"),
  }
  const browser = {
    version: async () => "stand-in",
    newPage: step("newPage", page),
    close: async () => {
      calls.closed++
      if (close)
        throw close
    },
  }
  return {calls, launch: async () => (calls.launched++, browser)}
}

//Run a plugin and describe what it returned or threw
async function outcome(run) {
  try {
    return {result: JSON.parse(JSON.stringify(await run()))}
  }
  catch (error) {
    return {error: error?.error?.message ?? String(error?.message ?? error), reason: error?.error?.instance?.message ?? String(error?.error?.instance ?? "")}
  }
}

//Imports given to the plugins
function imports(stand, metadata) {
  return {
    ...formatters(),
    puppeteer: stand,
    util,
    metadata: {plugins: metadata},
    shuffle: array => array,
    imgb64: async url => url,
    wait: async () => null,
    htmlescape: text => text,
  }
}

//Achievements: GraphQL is unavailable so the totals are read with the browser
async function achievement({failing, close}) {
  const stand = puppeteer({failing, close, rows: [[["", "Users", "5"], ["", "Repositories", "7"]]]})
  const metadata = {achievements: {enabled: () => true, inputs: () => ({threshold: "C", secrets: true, only: [], ignored: [], limit: 0, display: "detailed"})}}
  const graphql = async () => {
    throw new Error("graphql unavailable")
  }
  const done = await outcome(() => achievements({login: "octocat", q: {achievements: true}, imports: imports(stand, metadata), data: {}, computed: {}, graphql, queries: {achievements: {total: () => ""}}, rest: {}, account: "unknown"}))
  return {...done, ...stand.calls}
}
export const achievements_success = () => achievement({})
export const achievements_failing = () => achievement({failing: "goto"})
export const achievements_close_error = () => achievement({close: new Error("close failed")})

//Music: playlist mode
async function playlist({failing, close}) {
  const stand = puppeteer({failing, close, rows: [[{name: "Track", artist: "Artist", artwork: "https://example.com/a.png"}]]})
  const metadata = {music: {enabled: () => true, extras: () => true, inputs: () => ({provider: "spotify", mode: "playlist", playlist: "https://open.spotify.com/embed/playlist/test", limit: 5})}}
  const done = await outcome(() => music({login: "octocat", imports: imports(stand, metadata), data: {}, q: {music: true}, account: "user"}, {enabled: true}))
  return {...done, ...stand.calls}
}
export const music_success = () => playlist({})
export const music_failing = () => playlist({failing: "waitForSelector"})
export const music_close_error = () => playlist({close: new Error("close failed")})

//Topics
async function topic({failing, close}) {
  const stand = puppeteer({failing, close, rows: [[{name: "javascript", description: "JS", icon: null, url: "https://github.com/topics/javascript"}], []]})
  const metadata = {topics: {enabled: () => true, inputs: () => ({sort: "stars", mode: "labels", limit: 0})}}
  const done = await outcome(() => topics({login: "octocat", data: {}, imports: imports(stand, metadata), q: {topics: true}, account: "user"}, {enabled: true}))
  return {...done, ...stand.calls}
}
export const topics_success = () => topic({})
export const topics_failing = () => topic({failing: "goto"})
export const topics_close_error = () => topic({close: new Error("close failed")})
