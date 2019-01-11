const EgoSearcher = require('./EgoSearcher')

const egoSearcher = new EgoSearcher({
  twitter: {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  },
  sendGrid: process.env.SENDGRID_API_KEY
})

egoSearcher.start()
