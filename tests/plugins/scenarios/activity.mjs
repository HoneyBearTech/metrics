//Imports
import * as utils from "../../../source/app/metrics/utils.mjs"
import activity from "../../../source/plugins/activity/index.mjs"

//Pull request events as listed by the events api (pull request details are not included anymore)
function event({type, number, repo = "octo-org/octo-repo", payload = {}, created_at = new Date().toISOString()}) {
  return {
    id: `${Math.random()}`,
    type,
    actor: {login: "Octo-User"},
    repo: {name: repo},
    payload: {...payload, pull_request: {id: number * 100, number, url: `https://api.github.com/repos/${repo}/pulls/${number}`, head: {ref: "feature", sha: "HEAD_SHA"}, base: {ref: "main", sha: "BASE_SHA"}}},
    created_at,
    public: true,
  }
}

//Dates relative to now (events older than the days input are filtered out)
const ago = minutes => new Date(Date.now() - minutes * 60 * 1000).toISOString()
const dates = {merged: ago(60), reopened: ago(180), quickly: ago(30)}

//Pull requests details as returned by the pulls api
const pulls = {
  "octo-org/octo-repo": {
    1: {number: 1, title: "Fix the parser", body: "Some **details**", user: {login: "contributor"}, merged: false, merged_at: "2026-01-01T00:00:00Z", additions: 10, deletions: 2, changed_files: 1},
    4: {number: 4, title: "Add a feature", body: null, user: {login: "Octo-User"}, merged: false, merged_at: null, additions: 100, deletions: 20, changed_files: 5},
    5: {number: 5, title: "Update dependencies", body: "Bump packages", user: {login: "Octo-User"}, merged: true, merged_at: dates.merged, additions: 3, deletions: 3, changed_files: 2},
    6: {number: 6, title: "Opened by a bot", body: "", user: {login: "some-bot"}, merged: false, merged_at: null, additions: 1, deletions: 1, changed_files: 1},
    7: {number: 7, title: "Closed, reopened then merged", body: "", user: {login: "Octo-User"}, merged: true, merged_at: dates.reopened, additions: 1, deletions: 1, changed_files: 1},
    9: {number: 9, title: "Closed, reopened then merged quickly", body: "", user: {login: "Octo-User"}, merged: true, merged_at: dates.quickly, additions: 1, deletions: 1, changed_files: 1},
    8: {number: 8, title: "Closed without merging", body: "", user: {login: "Octo-User"}, merged: false, merged_at: null, additions: 1, deletions: 1, changed_files: 1},
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
        if (pull_number === 500)
          throw Object.assign(new Error("Server Error"), {status: 500})
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
    event({type: "PullRequestEvent", number: 5, payload: {action: "closed", number: 5}, created_at: dates.merged}),
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

/**Only the closing that matches the merge time is labelled as merged (earlier closings without merge stay closed) */
export function reopened() {
  return run([
    event({type: "PullRequestEvent", number: 7, payload: {action: "closed", number: 7}, created_at: ago(181)}),
    event({type: "PullRequestEvent", number: 7, payload: {action: "reopened", number: 7}, created_at: ago(240)}),
    event({type: "PullRequestEvent", number: 7, payload: {action: "closed", number: 7}, created_at: ago(300)}),
    event({type: "PullRequestEvent", number: 8, payload: {action: "closed", number: 8}, created_at: ago(360)}),
    event({type: "PullRequestEvent", number: 7, payload: {action: "opened", number: 7}, created_at: ago(420)}),
  ])
}

/**Only the closing nearest to the merge time is labelled as merged, even when the pull request was closed, reopened then merged within minutes */
export function quickly() {
  return run([
    event({type: "PullRequestEvent", number: 9, payload: {action: "closed", number: 9}, created_at: ago(30)}),
    event({type: "PullRequestEvent", number: 9, payload: {action: "reopened", number: 9}, created_at: ago(31)}),
    event({type: "PullRequestEvent", number: 9, payload: {action: "closed", number: 9}, created_at: ago(32)}),
  ])
}

/**A pull request is requested at most once per run, even when its failures are transient and not cached */
export function failing() {
  return run(Array.from({length: 60}, (_, i) => event({type: "PullRequestReviewCommentEvent", number: 500, payload: {action: "created", comment: {user: {login: "Octo-User"}, body: `Comment ${i}`, performed_via_github_app: null}}})), {limit: 2})
}

/**Pull requests lookups are capped so many unreadable pull requests cannot cause many requests */
export function capped() {
  return run([
    ...Array.from({length: 12}, (_, i) => event({type: "PullRequestEvent", number: 1000 + i, payload: {action: "opened", number: 1000 + i}})),
    event({type: "PullRequestEvent", number: 4, payload: {action: "opened", number: 4}}),
    event({type: "PullRequestReviewEvent", number: 1000, payload: {action: "created", review: {state: "approved", user: {login: "Octo-User"}}}}),
    {id: "public", type: "PublicEvent", actor: {login: "Octo-User"}, repo: {name: "octo-org/octo-repo"}, payload: {}, created_at: new Date().toISOString(), public: true},
  ], {limit: 2})
}

/**Pull request helper only caches failures that are not transient */
export async function transient() {
  const calls = []
  const failures = {
    500: [{status: 500, message: "Server Error"}],
    429: [{status: 429, message: "Too Many Requests"}],
    4031: [{status: 403, message: "API rate limit exceeded", response: {headers: {"x-ratelimit-remaining": "0"}}}],
    4032: [{status: 403, message: "You have exceeded a secondary rate limit", response: {headers: {}}}],
    1: [{message: "getaddrinfo EAI_AGAIN api.github.com"}],
    403: [{status: 403, message: "Resource not accessible by integration", response: {headers: {"x-ratelimit-remaining": "4000"}}}],
    404: [{status: 404, message: "Not Found"}],
    410: [{status: 410, message: "Gone"}],
    422: [{status: 422, message: "Unprocessable Entity"}],
  }
  const rest = {
    pulls: {
      async get({owner, repo, pull_number}) {
        calls.push(`${owner}/${repo}/${pull_number}`)
        const failure = failures[pull_number]?.shift()
        if (failure)
          throw Object.assign(new Error(failure.message), failure)
        return {data: {number: pull_number, title: "Recovered", user: {login: "contributor"}, merged: false, merged_at: null}}
      },
    },
  }
  const results = {}
  for (const number of Object.keys(failures)) {
    const first = await utils.pulled({rest, repository: "octo-org/octo-repo", number})
    const second = await utils.pulled({rest, repository: "octo-org/octo-repo", number})
    results[number] = {first: first?.title ?? null, second: second?.title ?? null, calls: calls.filter(call => call === `octo-org/octo-repo/${number}`).length}
  }
  return results
}
