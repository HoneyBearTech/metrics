/**Mocked data */
export default async function({faker}, target, that, [{username: login, page, per_page}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.activity.listEventsForAuthenticatedUser")
  return ({
    status: 200,
    url: `https://api.github.com/users/${login}/events?per_page=${per_page}&page=${page}`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: page < 1 ? [] : [
      {
        id: "10000000000",
        type: "CommitCommentEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          comment: {
            user: {
              login,
            },
            path: faker.system.fileName(),
            commit_id: "MOCKED_SHA",
            body: faker.lorem.sentence(),
          },
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000001",
        type: "PullRequestReviewCommentEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          action: "created",
          comment: {
            user: {
              login,
            },
            body: faker.lorem.paragraph(),
          },
          //Pull request details are not included anymore (fetched with rest.pulls.get)
          pull_request: {
            id: faker.number.int(100000000),
            number: 1,
            url: `https://api.github.com/repos/${login}/${faker.lorem.word()}/pulls/1`,
            head: {
              ref: faker.lorem.slug(),
              sha: "MOCKED_SHA",
              repo: {id: faker.number.int(100000000), name: faker.lorem.word(), url: `https://api.github.com/repos/${login}/${faker.lorem.word()}`},
            },
            base: {
              ref: "main",
              sha: "MOCKED_SHA",
              repo: {id: faker.number.int(100000000), name: faker.lorem.word(), url: `https://api.github.com/repos/${login}/${faker.lorem.word()}`},
            },
          },
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000002",
        type: "IssuesEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          action: faker.helpers.arrayElement(["opened", "closed", "reopened"]),
          issue: {
            number: 2,
            title: faker.lorem.sentence(),
            user: {
              login,
            },
            body: faker.lorem.paragraph(),
            performed_via_github_app: null,
          },
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000003",
        type: "GollumEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          pages: [
            {
              page_name: faker.lorem.sentence(),
              title: faker.lorem.sentence(),
              summary: null,
              action: "created",
              sha: "MOCKED_SHA",
            },
          ],
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000004",
        type: "IssueCommentEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          action: "created",
          issue: {
            number: 3,
            title: faker.lorem.sentence(),
            user: {
              login,
            },
            labels: [
              {
                name: "lorem ipsum",
                color: "d876e3",
              },
            ],
            state: "open",
          },
          comment: {
            body: faker.lorem.paragraph(),
            performed_via_github_app: null,
          },
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000005",
        type: "ForkEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          forkee: {
            name: faker.lorem.word(),
            full_name: `${faker.lorem.word()}/${faker.lorem.word()}`,
          },
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000006",
        type: "PullRequestReviewEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          action: "created",
          review: {
            user: {
              login,
            },
            state: "approved",
          },
          //Pull request details are not included anymore (fetched with rest.pulls.get)
          pull_request: {
            id: faker.number.int(100000000),
            number: 4,
            url: `https://api.github.com/repos/${login}/${faker.lorem.word()}/pulls/4`,
            head: {
              ref: faker.lorem.slug(),
              sha: "MOCKED_SHA",
              repo: {id: faker.number.int(100000000), name: faker.lorem.word(), url: `https://api.github.com/repos/${login}/${faker.lorem.word()}`},
            },
            base: {
              ref: "main",
              sha: "MOCKED_SHA",
              repo: {id: faker.number.int(100000000), name: faker.lorem.word(), url: `https://api.github.com/repos/${login}/${faker.lorem.word()}`},
            },
          },
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000007",
        type: "ReleaseEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          action: "published",
          release: {
            tag_name: `v${faker.number.int()}.${faker.number.int()}`,
            name: faker.lorem.words(4),
            draft: faker.datatype.boolean(),
            prerelease: faker.datatype.boolean(),
          },
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000008",
        type: "CreateEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          ref: faker.lorem.slug(),
          ref_type: faker.helpers.arrayElement(["tag", "branch"]),
          master_branch: "master",
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "100000000009",
        type: "WatchEvent",
        actor: {
          login,
        },
        repo: {
          name: "lowlighter/metrics",
        },
        payload: {action: "started"},
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000010",
        type: "DeleteEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          ref: faker.lorem.slug(),
          ref_type: faker.helpers.arrayElement(["tag", "branch"]),
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000011",
        type: "PushEvent",
        actor: {
          login,
        },
        repo: {
          name: `${login}/${faker.lorem.word()}`,
        },
        //Push events payloads do not list commits anymore (fetched with rest.repos.compareCommitsWithBasehead)
        payload: {
          repository_id: faker.number.int(100000000),
          push_id: faker.number.int(100000000),
          ref: "refs/heads/master",
          head: "MOCKED_SHA",
          before: "MOCKED_SHA_BEFORE",
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000015",
        type: "PushEvent",
        actor: {
          login,
        },
        repo: {
          name: `${login}/${faker.lorem.word()}`,
        },
        //Push of a single commit (files are listed by rest.repos.compareCommitsWithBasehead)
        payload: {
          repository_id: faker.number.int(100000000),
          push_id: faker.number.int(100000000),
          ref: "refs/heads/master",
          head: "MOCKED_SHA",
          before: "MOCKED_SHA_SINGLE",
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000016",
        type: "PushEvent",
        actor: {
          login,
        },
        repo: {
          name: `${login}/${faker.lorem.word()}`,
        },
        //Push of a new branch (cannot be compared, head commit is fetched with rest.repos.getCommit)
        payload: {
          repository_id: faker.number.int(100000000),
          push_id: faker.number.int(100000000),
          ref: "refs/heads/feature",
          head: "MOCKED_SHA",
          before: "0000000000000000000000000000000000000000",
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000012",
        type: "PullRequestEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          action: faker.helpers.arrayElement(["opened", "closed"]),
          number: 5,
          //Pull request details are not included anymore (fetched with rest.pulls.get)
          pull_request: {
            id: faker.number.int(100000000),
            number: 5,
            url: `https://api.github.com/repos/${login}/${faker.lorem.word()}/pulls/5`,
            head: {
              ref: faker.lorem.slug(),
              sha: "MOCKED_SHA",
              repo: {id: faker.number.int(100000000), name: faker.lorem.word(), url: `https://api.github.com/repos/${login}/${faker.lorem.word()}`},
            },
            base: {
              ref: "main",
              sha: "MOCKED_SHA",
              repo: {id: faker.number.int(100000000), name: faker.lorem.word(), url: `https://api.github.com/repos/${login}/${faker.lorem.word()}`},
            },
          },
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000013",
        type: "MemberEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {
          member: {
            login: faker.internet.userName(),
          },
          action: "added",
        },
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
      {
        id: "10000000014",
        type: "PublicEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.lorem.word()}/${faker.lorem.word()}`,
        },
        payload: {},
        created_at: faker.date.recent({days: 7}),
        public: true,
      },
    ],
  })
}
