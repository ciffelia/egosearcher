export default [
  {
    name: 'test',
    twitter: {
      api: {
        consumerKey: 'TWITTER_CONSUMER_KEY',
        consumerSecret: 'TWITTER_CONSUMER_SECRET',
        accessToken: 'TWITTER_ACCESS_TOKEN_KEY',
        accessTokenSecret: 'TWITTER_ACCESS_TOKEN_SECRET',
      },
      search: {
        listId: 'TWITTER_FOLLOWING_LIST_ID',
        pollingInterval: 10000,
        queries: ['#JohnDoe', 'John'],
        excludedUserIds: [
          // @jack
          '12',
          // @twitter
          '783214',
        ],
      },
    },
    slack: {
      webhookUrl: 'https://hooks.slack.com/foo/bar',
    },
  },
]
