//Imports
import * as utils from "../../../source/app/metrics/utils.mjs"
import activity from "../../../source/plugins/activity/index.mjs"

//Pull request events as listed by the events api (pull request details are not included anymore)
function event({type, number, repo = "octo-org/octo-repo", payload = {}}) {
  return {
    id: `${Math.random()}`,
    type,
    actor: {login: "Octo-User"},
    repo: {name: repo},
    payload: {...payload, pull_request: {id: number * 100, number, url: `https://api.github.com/repos/${repo}/pulls/${number}`, head: {ref: "feature", sha: "HEAD_SHA"}, base: {ref: "main", sha: "BASE_SHA"}}},
    created_at: new Date().toISOString(),
    public: true,
  }
}

//Pull requests details as returned by the pulls api
const pulls = {
  "octo-org/octo-repo": {
    1: {number: 1, title: "Fix the parser", body: "Some **details**", user: {login: "contributor"}, merged: false, merged_at: "2026-01-01T00:00:00Z", additions: 10, deletions: 2, changed_files: 1},
    4: {number: 4, title: "Add a feature", body: null, user: {login: "Octo-User"}, merged: false, merged_at: null, additions: 100, deletions: 20, changed_files: 5},
    5: {number: 5, title: "Update dependencies", body: "Bump packages", user: {login: "Octo-User"}, merged: true, merged_at: "2026-01-02T00:00:00Z", additions: 3, deletions: 3, changed_files: 2},
    6: {number: 6, title: "Opened by a bot", body: "", user: {login: "some-bot"}, merged: false, merged_at: null, additions: 1, deletions: 1, changed_files: 1},
  },
}

//Rest client stub
function client() {
  const calls = []
  return {
    calls,
    activity: {
      async listEventsForAuthenticatedUser() {
        return {data: this.events}
      },
    },
    pulls: {
      async get({owner, repo, pull_number}) {
        calls.push(`${owner}/${repo}/${pull_number}`)
        const data = pulls[`${owner}/${repo}`]?.[pull_number]
        if (!data)
          throw Object.assign(new Error("Not Found"), {status: 404})
        return {data: structuredClone(data)}
      },
    },
  }
}

//Run plugin
async function run(events, {limit = 5, ignored = []} = {}) {
  const rest = client()
  rest.activity.events = events
  const imports = {
    ...utils,
    ...utils.formatters(),
    metadata: {plugins: {activity: {enabled: () => true, inputs: () => ({limit, load: 100, days: 14, filter: ["all"], visibility: "all", timestamps: false, skipped: [], ignored: [...ignored]})}}},
  }
  const data = {shared: {"repositories.skipped": [], "users.ignored": []}}
  const result = await activity({login: "Octo-User", data, rest, q: {activity: true}, account: "user", imports}, {enabled: true})
  return {events: result.events.map(({timestamp, ...event}) => event), calls: rest.calls}
}

/**Trimmed pull request, review and review comment events are completed with pulls api */
export function trimmed() {
  return run([
    event({type: "PullRequestEvent", number: 5, payload: {action: "closed", number: 5}}),
    event({type: "PullRequestEvent", number: 4, payload: {action: "opened", number: 4}}),
    event({type: "PullRequestReviewEvent", number: 1, payload: {action: "created", review: {state: "approved", user: {login: "Octo-User"}}}}),
    event({type: "PullRequestReviewCommentEvent", number: 1, payload: {action: "created", comment: {user: {login: "Octo-User"}, body: "Looks *good*", performed_via_github_app: null}}}),
  ])
}

/**Pull requests that cannot be read are skipped and the next events are used instead */
export function unreadable() {
  return run([
    event({type: "PullRequestEvent", number: 404, payload: {action: "opened", number: 404}}),
    event({type: "PullRequestReviewEvent", number: 1, repo: "deleted-org/deleted-repo", payload: {action: "created", review: {state: "approved", user: {login: "Octo-User"}}}}),
    event({type: "PullRequestEvent", number: 5, payload: {action: "closed", number: 5}}),
    event({type: "PullRequestEvent", number: 4, payload: {action: "opened", number: 4}}),
    event({type: "PullRequestEvent", number: 1, payload: {action: "opened", number: 1}}),
  ], {limit: 2})
}

/**Pull requests opened by ignored users are skipped */
export function ignored() {
  return run([
    event({type: "PullRequestEvent", number: 6, payload: {action: "opened", number: 6}}),
    event({type: "PullRequestReviewEvent", number: 6, payload: {action: "created", review: {state: "commented", user: {login: "Octo-User"}}}}),
    event({type: "PullRequestEvent", number: 4, payload: {action: "opened", number: 4}}),
  ], {ignored: ["some-bot"]})
}

/**Pull requests are only fetched for displayed events, once per pull request */
export function lazy() {
  return run([
    event({type: "PullRequestEvent", number: 1, payload: {action: "opened", number: 1}}),
    event({type: "PullRequestReviewCommentEvent", number: 1, payload: {action: "created", comment: {user: {login: "Octo-User"}, body: "First", performed_via_github_app: null}}}),
    event({type: "PullRequestEvent", number: 4, payload: {action: "opened", number: 4}}),
    event({type: "PullRequestEvent", number: 5, payload: {action: "closed", number: 5}}),
  ], {limit: 2})
}

/**Pull request helper never throws and caches results per rest client */
export async function helper() {
  const rest = client()
  const results = {
    found: await utils.pulled({rest, repository: "octo-org/octo-repo", number: 1}),
    again: await utils.pulled({rest, repository: "octo-org/octo-repo", number: 1}),
    missing: await utils.pulled({rest, repository: "octo-org/octo-repo", number: 404}),
    malformed: await utils.pulled({rest, repository: "octo-org", number: 1}),
    nan: await utils.pulled({rest, repository: "octo-org/octo-repo", number: undefined}),
    norest: await utils.pulled({rest: null, repository: "octo-org/octo-repo", number: 1}),
  }
  return {...results, calls: rest.calls}
}
