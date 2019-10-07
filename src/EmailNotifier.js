const { MailService } = require('@sendgrid/mail')
const parseSnowFlake = require('./parseSnowFlake')

class EmailNotifier {
  constructor (config) {
    this.config = config

    this.mailService = new MailService()
    this.mailService.setApiKey(config.sendGridApiKey)

    this.notifiedTweets = new Set()
  }

  push (tweet) {
    if (this.notifiedTweets.has(tweet.id_str)) return
    this.notifiedTweets.add(tweet.id_str)

    const subject = `${tweet.user.name}さんが言及しました`
    const text = EmailNotifier.generateNotificationMessage(tweet)

    this.mailService.send({
      from: this.config.from,
      to: this.config.to,
      subject,
      text
    })
  }

  static generateNotificationMessage (tweet) {
    const authorText = `${tweet.user.name} (@${tweet.user.screen_name})`

    const createdAt = parseSnowFlake(tweet.id_str).local().locale('ja').format('YYYY年M月D日(ddd) HH:mm:ss.SSS')

    const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`

    return `${tweet.text}\n― ${authorText} ${createdAt}\n${tweetUrl}`
  }
}

module.exports = EmailNotifier
