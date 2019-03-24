const Twit = require('twit')

class Searcher {
  constructor (config, notifier) {
    const { followingListId, ...apiConfig } = config

    this.followingListId = followingListId
    this.twit = new Twit(apiConfig)

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
      list_id: this.followingListId,
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
    if (Searcher.shouldNotify(tweet)) this.notifier.push(tweet)
  }

  static unescapeTweetText (text) {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
  }

  static shouldNotify (tweet) {
    const isRetweet = !!tweet.retweeted_status
    if (isRetweet) return false

    const includesKeyword = Searcher.Keywords.some(keyword => tweet.text.toLowerCase().includes(keyword))
    if (!includesKeyword) return false

    const isQuoteTweet = !!tweet.quoted_status

    const author = tweet.user.screen_name
    const quotedUser = isQuoteTweet && tweet.quoted_status.user.screen_name
    const mentionedUsers = tweet.entities.user_mentions.map(user => user.screen_name)

    for (const excludedUser of Searcher.ExcludedUserList) {
      if (author === excludedUser || quotedUser === excludedUser) return false
      if (mentionedUsers.includes(excludedUser)) return false
    }

    return true
  }
}

Searcher.ExcludedUserList = ['ciffelia', 'ciffelia_nyan', 'ciffelia_ek']
Searcher.Keywords = ['ciffelia', 'しふぇ', 'しふえ']

module.exports = Searcher
