const Twit = require('twit')
const { MailService } = require('@sendgrid/mail')
const parseSnowFlake = require('./parseSnowFlake')

class EgoSearcher {
  constructor (apiKeys) {
    this.twit = new Twit(apiKeys.twitter)

    this.sgMail = new MailService()
    this.sgMail.setApiKey(apiKeys.sendGrid)

    this.latestFetchedTweetIdOnHomeTimeline = null
    this.latestFetchedTweetIdOnStandardSearch = null
    this.latestFetchedTweetIdOnPremiumSearch = null

    this.notifiedTweets = new Set()

    this.performHomeTimelineSearch = this.performHomeTimelineSearch.bind(this)
    this.performStandardSearch = this.performStandardSearch.bind(this)
    this.performPremiumSearch = this.performPremiumSearch.bind(this)
    this.handleNewTweet = this.handleNewTweet.bind(this)
  }

  start () {
    this.stream = this.twit.stream('statuses/filter', { track: EgoSearcher.StreamQuery })
    this.stream.on('tweet', this.handleNewTweet)

    setInterval(this.performHomeTimelineSearch, 70 * 1000)
    setInterval(this.performStandardSearch, 10 * 1000)
    setInterval(this.performPremiumSearch, 4 * 60 * 60 * 1000)

    this.performHomeTimelineSearch(true)
    this.performStandardSearch(true)
    this.performPremiumSearch(true)
  }

  // ホームタイムラインから検索 70秒おき
  // 鍵ツイートを取得するために使用する
  async performHomeTimelineSearch (isInitialExecution) {
    const { data: results } = await this.twit.get('statuses/home_timeline', {
      count: 200,
      since_id: isInitialExecution ? undefined : this.latestFetchedTweetIdOnHomeTimeline
    })

    if (results.length === 0) return
    this.latestFetchedTweetIdOnHomeTimeline = results[0].id_str

    if (!isInitialExecution) this.handleNewTweets(results)
  }

  // Standard search API 10秒おき
  async performStandardSearch (isInitialExecution) {
    const { data: { statuses: results } } = await this.twit.get('search/tweets', {
      q: EgoSearcher.standardSearchQuery,
      result_type: 'recent',
      count: 100,
      since_id: isInitialExecution ? undefined : this.latestFetchedTweetIdOnStandardSearch
    })

    if (results.length === 0) return
    this.latestFetchedTweetIdOnStandardSearch = results[0].id_str

    if (!isInitialExecution) this.handleNewTweets(results)
  }

  // Premium search API 4時間おき
  async performPremiumSearch (isInitialExecution) {
    const { data: { results } } = await this.twit.get('tweets/search/30day/dev', {
      query: EgoSearcher.premiumSearchQuery,
      since_id: isInitialExecution ? undefined : this.latestFetchedTweetIdOnPremiumSearch
    })

    if (results.length === 0) return
    this.latestFetchedTweetIdOnPremiumSearch = results[0].id_str

    if (!isInitialExecution) this.handleNewTweets(results)
  }

  handleNewTweets (tweets) {
    for (const tweet of tweets) {
      this.handleNewTweet(tweet)
    }
  }

  handleNewTweet (tweet) {
    if (!EgoSearcher.shouldNotify(tweet)) return

    if (this.notifiedTweets.has(tweet.id_str)) return
    this.notifiedTweets.add(tweet.id_str)

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

    if (!tweet.text.toLowerCase().includes('ciffelia')) return false

    const author = tweet.user.screen_name
    const quotedUser = isQuoteTweet && tweet.quoted_status.user.screen_name
    const mentionedUsers = tweet.entities.user_mentions.map(user => user.screen_name)

    for (const excludedUser of EgoSearcher.ExcludedUserList) {
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

EgoSearcher.ExcludedUserList = ['ciffelia', 'ciffelia_key', 'ciffelia_alt', 'ciffelia_nyan']
EgoSearcher.StreamQuery = 'Ciffelia'
EgoSearcher.standardSearchQuery = 'Ciffelia -filter:retweets -from:ciffelia -@ciffelia -from:ciffelia_key -@ciffelia_key -from:ciffelia_alt -@ciffelia_alt -from:ciffelia_nyan -@ciffelia_nyan'
EgoSearcher.premiumSearchQuery = 'Ciffelia -from:ciffelia -@ciffelia -from:ciffelia_key -@ciffelia_key -from:ciffelia_alt -@ciffelia_alt -from:ciffelia_nyan -@ciffelia_nyan'

EgoSearcher.mailFrom = {
  name: 'EgoSearcher',
  email: 'egosearcher@ciffelia.com'
}
EgoSearcher.mailTo = {
  name: 'Ciffelia',
  email: 'mc.prince.0203@gmail.com'
}

module.exports = EgoSearcher
