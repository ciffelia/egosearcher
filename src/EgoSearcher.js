const Twit = require('twit')
const { MailService } = require('@sendgrid/mail')
const parseSnowFlake = require('./parseSnowFlake')

class EgoSearcher {
  constructor (apiKeys) {
    this.twit = new Twit(apiKeys.twitter)

    this.sgMail = new MailService()
    this.sgMail.setApiKey(apiKeys.sendGrid)

    this.handleNewTweet = this.handleNewTweet.bind(this)
  }

  start () {
    this.stream = this.twit.stream('statuses/filter', { track: 'Ciffelia' })
    this.stream.on('tweet', this.handleNewTweet)
  }

  handleNewTweet (tweet) {
    if (!EgoSearcher.shouldNotify(tweet)) return

    const subject = `${tweet.user.name}さんが言及しました`
    const text = EgoSearcher.generateNotificationMessage(tweet)

    this.sgMail.send({
      from: EgoSearcher.mailFrom,
      to: EgoSearcher.mailTo,
      subject,
      text
    })
  }

  static shouldNotify (tweet) {
    const isRetweet = !!tweet.retweeted_status
    const isQuoteTweet = !!tweet.quoted_status

    if (isRetweet) return false

    const author = tweet.user.screen_name
    const quotedUser = isQuoteTweet && tweet.quoted_status.user.screen_name
    const mentionedUsers = tweet.entities.user_mentions.map(user => user.screen_name)

    for (const excludedUser of EgoSearcher.excludedUserList) {
      if (author === excludedUser || quotedUser === excludedUser) return false
      if (mentionedUsers.includes(excludedUser)) return false
    }

    return true
  }

  static generateNotificationMessage (tweet) {
    const authorText = `${tweet.user.name} (@${tweet.user.screen_name})`

    const createdAt = parseSnowFlake(tweet.id_str).local().locale('ja').format('YYYY年M月D日(ddd) HH:mm:ss.SSS')

    const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`

    return `${tweet.text}\n― ${authorText} ${createdAt}\n${tweetUrl}`
  }
}

EgoSearcher.excludedUserList = ['ciffelia', 'ciffelia_key', 'ciffelia_alt', 'ciffelia_nyan']

EgoSearcher.mailFrom = {
  name: 'EgoSearcher',
  email: 'egosearcher@ciffelia.com'
}
EgoSearcher.mailTo = {
  name: 'Ciffelia',
  email: 'mc.prince.0203@gmail.com'
}

module.exports = EgoSearcher
