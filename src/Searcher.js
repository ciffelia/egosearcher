const Twit = require('twit')

class Searcher {
  constructor (config, notifier) {
    this.config = config

    this.twit = new Twit(config.apiKeys)
    this.normalizedQueries = config.queries.map(query => Searcher.normalizeText(query))

    this.latestFetchedTweet = null

    this.notifier = notifier

    this.checkTimeLine = this.checkTimeLine.bind(this)
    this.handleNewTweet = this.handleNewTweet.bind(this)
  }

  start () {
    setInterval(this.checkTimeLine, 1500)
    this.checkTimeLine(true)
  }

  async checkTimeLine (isInitialExecution) {
    const { data: results } = await this.twit.get('lists/statuses', {
      list_id: this.config.followingListId,
      since_id: isInitialExecution ? undefined : this.latestFetchedTweet,
      count: 200,
      include_rts: false
    })

    if (results.length === 0) return
    this.latestFetchedTweet = results[0].id_str

    if (!isInitialExecution) this.handleNewTweets(results)
  }

  handleNewTweets (tweets) {
    for (const tweet of tweets) {
      this.handleNewTweet(tweet)
    }
  }

  handleNewTweet (tweet) {
    tweet.text = Searcher.unescapeTweetText(tweet.text)
    if (this.shouldNotify(tweet)) this.notifier.push(tweet)
  }

  shouldNotify (tweet) {
    const isRetweet = !!tweet.retweeted_status
    if (isRetweet) return false

    const includesQuery = this.normalizedQueries.some(query => Searcher.normalizeText(tweet.text).includes(query))
    if (!includesQuery) return false

    const isQuoteTweet = !!tweet.quoted_status

    const author = tweet.user.screen_name
    const quotedUser = isQuoteTweet && tweet.quoted_status.user.screen_name
    const mentionedUsers = tweet.entities.user_mentions.map(user => user.screen_name)

    for (const excludedUser of this.config.excludedUsers) {
      if (author === excludedUser || quotedUser === excludedUser) return false
      if (mentionedUsers.includes(excludedUser)) return false
    }

    return true
  }

  static normalizeText (text) {
    return text
      .normalize('NFKC')
      .replace(/[\s\u200B-\u200D\uFEFF]/g, '')
      .toLowerCase()
  }

  static unescapeTweetText (text) {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
  }
}

module.exports = Searcher
