/**Mocked data */
export default async function({faker}, target, that, [{owner, repo, pull_number}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.pulls.get")
  const merged = faker.datatype.boolean()
  const created_at = faker.date.recent({days: 14})
  return ({
    status: 200,
    url: `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: {
      id: faker.number.int(100000000),
      url: `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`,
      html_url: `https://github.com/${owner}/${repo}/pull/${pull_number}`,
      number: Number(pull_number),
      state: merged ? "closed" : faker.helpers.arrayElement(["open", "closed"]),
      locked: false,
      title: faker.lorem.sentence(),
      user: {
        login: faker.internet.userName(),
        id: faker.number.int(100000000),
        type: "User",
      },
      body: faker.lorem.paragraph(),
      created_at,
      updated_at: created_at,
      closed_at: merged ? created_at : null,
      merged_at: merged ? created_at : null,
      merged,
      head: {
        ref: faker.lorem.slug(),
        sha: "MOCKED_SHA",
      },
      base: {
        ref: "main",
        sha: "MOCKED_SHA",
      },
      comments: faker.number.int(10),
      review_comments: faker.number.int(10),
      commits: faker.number.int({min: 1, max: 10}),
      additions: faker.number.int(1000),
      deletions: faker.number.int(1000),
      changed_files: faker.number.int({min: 1, max: 10}),
    },
  })
}
