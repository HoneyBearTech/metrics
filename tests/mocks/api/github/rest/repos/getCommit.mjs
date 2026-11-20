/**Mocked data */
export default async function({faker}, target, that, [{owner, repo, ref}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.repos.getCommit")
  return ({
    status: 200,
    url: `https://api.github.com/repos/${owner}/${repo}/commits/${ref}`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: {
      sha: "MOCKED_SHA",
      url: "https://api.github.com/repos/lowlighter/metrics/commits/MOCKED_SHA",
      html_url: "https://github.com/lowlighter/metrics/commit/MOCKED_SHA",
      commit: {
        author: {
          name: owner,
          email: `${owner}@users.noreply.github.com`,
          date: `${faker.date.recent({days: 7})}`,
        },
        committer: {
          name: owner,
          email: `${owner}@users.noreply.github.com`,
          date: `${faker.date.recent({days: 7})}`,
        },
        message: faker.lorem.sentence(),
        url: "https://api.github.com/repos/lowlighter/metrics/git/commits/MOCKED_SHA",
      },
      author: {
        login: owner,
        id: faker.number.int(100000000),
      },
      committer: {
        login: owner,
        id: faker.number.int(100000000),
      },
      parents: [{sha: "MOCKED_SHA"}],
      files: [
        {
          sha: "MOCKED_SHA",
          filename: `${faker.lorem.word()}.mjs`,
          status: "added",
          additions: 5,
          deletions: 0,
          changes: 5,
          patch: '@@ -0,0 +1,5 @@\n+//Imports\n+  import app from "./src/app.mjs"\n+\n+//Start app\n+  await app()\n\\ No newline at end of file',
        },
      ],
    },
  })
}
