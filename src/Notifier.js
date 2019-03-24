const { MailService } = require('@sendgrid/mail')
const parseSnowFlake = require('./parseSnowFlake')

class Notifier {
  constructor (sendGridApiKey) {
    this.mailService = new MailService()
    this.mailService.setApiKey(sendGridApiKey)

    this.notifiedTweets = new Set()
  }

  push (tweet) {
    if (this.notifiedTweets.has(tweet.id_str)) return
    this.notifiedTweets.add(tweet.id_str)

    const subject = `${tweet.user.name}さんが言及しました`
    const text = Notifier.generateNotificationMessage(tweet)

    this.mailService.send({
      from: Notifier.mailFrom,
      to: Notifier.mailTo,
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

Notifier.mailFrom = {
  name: 'EgoSearcher',
  email: 'egosearcher@ciffelia.com'
}
Notifier.mailTo = {
  name: 'Ciffelia',
  email: 'mc.prince.0203@gmail.com'
}

module.exports = Notifier
