const moment = require('moment')
const Twit = require('twit')
const { MailService } = require('@sendgrid/mail')

class EgoSearcher {
  constructor (apiKeys) {
    moment.locale('ja')

    this.twit = new Twit(apiKeys.twitter)

    this.sgMail = new MailService()
    this.sgMail.setApiKey(apiKeys.sendGrid)

    this.handleTweet = this.handleTweet.bind(this)
  }

  start () {
    this.stream = this.twit.stream('statuses/filter', { track: 'Ciffelia' })
    this.stream.on('tweet', this.handleTweet)
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

    const createdAt = moment.utc(parseInt(tweet.timestamp_ms)).local().format('YYYY年M月D日(ddd) HH:mm:ss.SSS')

    const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`

    return `${tweet.text}\n― ${authorText} ${createdAt}\n${tweetUrl}`
  }

  handleTweet (tweet) {
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
