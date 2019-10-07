module.exports = {
  notify: {
    email: {
      sendGridApiKey: 'YOUR_SENDGRID_API_KEY',
      from: {
        name: 'EgoSearcher',
        email: 'egosearcher@example.com'
      },
      to: {
        name: 'John Doe',
        email: 'john@doe.com'
      }
    }
  },

  search: [
    {
      apiKeys: {
        consumer_key: 'TWITTER_CONSUMER_KEY',
        consumer_secret: 'TWITTER_CONSUMER_SECRET',
        access_token: 'TWITTER_ACCESS_TOKEN_KEY',
        access_token_secret: 'TWITTER_ACCESS_TOKEN_SECRET'
      },
      followingListId: 'TWITTER_FOLLOWING_LIST_ID',
      queries: ['#JohnDoe', 'John'],
      excludedUsers: ['john_doe', 'john_doe_2']
    }
  ]
}
