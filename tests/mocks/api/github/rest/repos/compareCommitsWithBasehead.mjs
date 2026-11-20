/**Mocked data */
export default async function({faker}, target, that, [{owner, repo, basehead}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.repos.compareCommitsWithBasehead")
  //Pushes starting from "MOCKED_SHA_SINGLE" contain a single commit, others contain a commit from the user and another from an ignored bot
  const [base] = basehead.split("...")
  const authors = /^MOCKED_SHA_SINGLE/.test(base) ? [{login: owner, email: `${owner}@users.noreply.github.com`}] : [{login: owner, email: `${owner}@users.noreply.github.com`}, {login: "dependabot[bot]", email: "49699333+dependabot[bot]@users.noreply.github.com"}]
  const commits = authors.map(({login, email}) => ({
    sha: "MOCKED_SHA",
    url: "https://api.github.com/repos/lowlighter/metrics/commits/MOCKED_SHA",
    html_url: "https://github.com/lowlighter/metrics/commit/MOCKED_SHA",
    commit: {
      author: {
        name: login,
        email,
        date: `${faker.date.recent({days: 7})}`,
      },
      committer: {
        name: login,
        email,
        date: `${faker.date.recent({days: 7})}`,
      },
      message: faker.lorem.sentence(),
      url: "https://api.github.com/repos/lowlighter/metrics/git/commits/MOCKED_SHA",
    },
    author: {
      login,
      id: faker.number.int(100000000),
    },
    committer: {
      login,
      id: faker.number.int(100000000),
    },
    parents: [{sha: "MOCKED_SHA"}],
  }))
  return ({
    status: 200,
    url: `https://api.github.com/repos/${owner}/${repo}/compare/${basehead}`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: {
      status: "ahead",
      ahead_by: commits.length,
      behind_by: 0,
      total_commits: commits.length,
      commits,
      files: [
        {
          sha: "MOCKED_SHA",
          filename: `${faker.lorem.word()}.mjs`,
          status: "modified",
          additions: 5,
          deletions: 0,
          changes: 5,
          patch: '@@ -0,0 +1,5 @@\n+//Imports\n+  import app from "./src/app.mjs"\n+\n+//Start app\n+  await app()\n\\ No newline at end of file',
        },
      ],
    },
  })
}
