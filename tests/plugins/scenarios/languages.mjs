//Imports
import { RecentAnalyzer } from "../../../source/plugins/languages/analyzer/recent.mjs"

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
