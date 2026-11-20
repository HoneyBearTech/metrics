/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > achievements/projects")
  return ({
    [/^query AchievementsProjects {\s*organization\(/.test(query) ? "organization" : "user"]: {
      projectsV2: {totalCount: faker.number.int(100)},
    },
  })
}
