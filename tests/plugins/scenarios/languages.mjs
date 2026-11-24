//Imports
import fs from "fs/promises"
import os from "os"
import paths from "path"
import { language, run, spawn } from "../../../source/app/metrics/utils.mjs"
import { IndepthAnalyzer } from "../../../source/plugins/languages/analyzer/indepth.mjs"
import { RecentAnalyzer } from "../../../source/plugins/languages/analyzer/recent.mjs"

//Language data is not fetched from the network: without a connection linguist falls back to the data packaged with it
globalThis.fetch = async () => {
  throw new Error("network is disabled in tests")
}

//Push events as listed by the events api (commits are not listed anymore)
function push({actor, repo, before, head}) {
  return {id: `${Math.random()}`, type: "PushEvent", actor: {login: actor}, repo: {name: repo}, payload: {ref: "refs/heads/main", before, head}, created_at: new Date().toISOString(), public: true}
}

//Commit as returned by the compare api
function commit({sha, login, filename, patch}) {
  return {
    sha,
    url: `https://api.github.com/repos/owner/repo/commits/${sha}`,
    author: {login},
    commit: {message: `Commit ${sha}`, author: {name: login, email: `${login}@users.noreply.github.com`}, committer: {name: login, date: new Date().toISOString()}},
    parents: [{sha: "PARENT"}],
    files: [{filename, patch}],
  }
}

/**Recently used languages are computed for logins with capitals, and each analyzed commit is counted once */
export async function mixedcase() {
  const login = "MixedCase-User"
  const calls = []
  const comparisons = {
    "A...B": [
      commit({sha: "1111111", login, filename: "index.mjs", patch: "@@ -0,0 +1,2 @@\n+const a = 1\n+export default a"}),
      commit({sha: "2222222", login, filename: "main.py", patch: "@@ -0,0 +1,1 @@\n+print('hello')"}),
    ],
    "C...D": [
      commit({sha: "3333333", login, filename: "main.go", patch: "@@ -0,0 +1,1 @@\n+package main"}),
    ],
    "E...F": [
      commit({sha: "4444444", login: "someone-else", filename: "other.rb", patch: "@@ -0,0 +1,1 @@\n+puts 1"}),
    ],
  }
  const rest = {
    activity: {
      async listEventsForAuthenticatedUser({page}) {
        return {
          data: page > 1 ? [] : [
            push({actor: login, repo: `${login}/first`, before: "A", head: "B"}),
            push({actor: login, repo: `${login}/second`, before: "C", head: "D"}),
            push({actor: "someone-else", repo: "someone-else/repo", before: "E", head: "F"}),
          ],
        }
      },
    },
    repos: {
      async compareCommitsWithBasehead({basehead}) {
        calls.push(basehead)
        const commits = comparisons[basehead]
        return {data: {total_commits: commits.length, commits, files: commits.length === 1 ? commits[0].files : undefined}}
      },
    },
    async request(url) {
      throw new Error(`unexpected request to ${url}`)
    },
  }
  const analyzer = new RecentAnalyzer(login, {shell: {}, uid: 0, skipped: [], authoring: [login.toLocaleLowerCase()], timeout: {global: NaN, repositories: NaN}, account: "user", rest, context: {mode: "user"}, days: 14, categories: ["programming", "markup"], load: 100})
  const {commits, files, lines, missed} = await analyzer.run()
  return {commits, files, lines, missed, calls}
}

/**Recent analyzer with one file per language, to check the kinds and colors that come with the results */
export async function kinds() {
  const login = "kinds-user"
  const files = {
    "main.js": "+const a = 1",
    "main.py": "+print('hello')",
    "style.css": "+a { color: red }",
    "data.json": "+{\"a\": 1}",
  }
  const rest = {
    activity: {
      async listEventsForAuthenticatedUser({page}) {
        return {data: page > 1 ? [] : [push({actor: login, repo: `${login}/repo`, before: "A", head: "B"})]}
      },
    },
    repos: {
      async compareCommitsWithBasehead() {
        const commits = Object.entries(files).map(([filename, line], index) => commit({sha: `${index}000000`, login, filename, patch: `@@ -0,0 +1,1 @@\n${line}`}))
        return {data: {total_commits: commits.length, commits}}
      },
    },
    async request(url) {
      throw new Error(`unexpected request to ${url}`)
    },
  }
  const analyze = async categories => {
    const analyzer = new RecentAnalyzer(login, {shell: {}, uid: 0, skipped: [], authoring: [login], timeout: {global: NaN, repositories: NaN}, account: "user", rest, context: {mode: "user"}, days: 14, categories, load: 100})
    const {lines, colors} = await analyzer.run()
    return {languages: Object.keys(lines).sort(), colors}
  }
  return {
    programming: await analyze(["programming"]),
    markup: await analyze(["markup"]),
    data: await analyze(["data"]),
    everything: await analyze(["programming", "markup", "data"]),
    single: {
      js: await language({filename: "src/index.js", patch: "+const a = 1"}),
      py: await language({filename: "main.py", patch: "+print('hello')"}),
      none: await language({filename: "file.unknown-ext", patch: "+abc"}),
    },
  }
}

/**Languages that belong to a parent language are grouped into it, as on the language bar of GitHub */
export async function children() {
  const login = "children-user"
  const component = `app.${["ts", "x"].join("")}`
  const files = {[component]: "+export const App = () => <div/>", "main.ts": "+export const a = 1"}
  const rest = {
    activity: {
      async listEventsForAuthenticatedUser({page}) {
        return {data: page > 1 ? [] : [push({actor: login, repo: `${login}/repo`, before: "A", head: "B"})]}
      },
    },
    repos: {
      async compareCommitsWithBasehead() {
        const commits = Object.entries(files).map(([filename, line], index) => commit({sha: `${index}000000`, login, filename, patch: `@@ -0,0 +1,1 @@\n${line}`}))
        return {data: {total_commits: commits.length, commits}}
      },
    },
    async request(url) {
      throw new Error(`unexpected request to ${url}`)
    },
  }
  const recent = new RecentAnalyzer(login, {shell: {}, uid: 0, skipped: [], authoring: [login], timeout: {global: NaN, repositories: NaN}, account: "user", rest, context: {mode: "user"}, days: 14, categories: ["programming"], load: 100})
  const {lines} = await recent.run()
  const root = await fs.mkdtemp(paths.join(os.tmpdir(), "metrics-test-"))
  try {
    const git = args => run(`git -c user.name=sample -c user.email=sample@example.com ${args}`, {cwd: root}, {log: false, debug: false})
    await git("init -q -b main")
    await fs.writeFile(paths.join(root, component), "export const App = () => <div/>\n")
    await git("add .")
    await git("commit -q --no-gpg-sign -m first")
    const indepth = new IndepthAnalyzer("sample", {shell: {run, spawn}, uid: 0, skipped: [], authoring: ["sample@example.com"], timeout: {global: NaN, repositories: NaN}, account: "user", categories: ["programming"]})
    await indepth.analyze(root, {})
    return {recent: Object.keys(lines).sort(), indepth: Object.keys(indepth.results.lines).sort(), single: await language({filename: component, patch: "+export const App = () => <div/>"})}
  }
  finally {
    await fs.rm(root, {recursive: true, force: true})
  }
}

/**Indepth analyzer, on a small local repository (no network) */
export async function indepth() {
  const root = await fs.mkdtemp(paths.join(os.tmpdir(), "metrics-test-"))
  try {
    const git = args => run(`git -c user.name=sample -c user.email=sample@example.com ${args}`, {cwd: root}, {log: false, debug: false})
    const write = async (name, ...lines) => {
      await fs.mkdir(paths.dirname(paths.join(root, name)), {recursive: true})
      await fs.writeFile(paths.join(root, name), `${lines.join("\n")}\n`)
    }
    await git("init -q -b main")
    await write("src/index.js", "const a = 1", "export default a")
    await write("main.py", "print('hello')")
    await write("data.json", "{\"a\": 1}")
    await git("add .")
    await git("commit -q --no-gpg-sign -m first")
    await write("style.css", "a { color: red; }")
    await git("add .")
    await git("commit -q --no-gpg-sign -m second")
    const analyze = async categories => {
      const analyzer = new IndepthAnalyzer("sample", {shell: {run, spawn}, uid: 0, skipped: [], authoring: ["sample@example.com"], timeout: {global: NaN, repositories: NaN}, account: "user", categories})
      await analyzer.analyze(root, {})
      const {commits, files, lines, stats, colors, missed} = analyzer.results
      return {commits, files, lines, stats, colors, missed}
    }
    return {code: await analyze(["programming", "markup"]), data: await analyze(["data"])}
  }
  finally {
    await fs.rm(root, {recursive: true, force: true})
  }
}
