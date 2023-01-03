import type { Logger } from 'pino'
import { type TweetV1, TwitterApi } from 'twitter-api-v2'
import type { AccountConfig } from '@/config'
import { sleep } from '@/sleep'
import { iterateListTimeline } from '@/twitter/iterateListTimeline'
import { shouldNotifyTweet } from '@/twitter/shouldNotifyTweet'
import { notifyTweet } from '@/slack/notifyTweet'

export const runEgosearcher = async (
  config: AccountConfig,
  logger: Logger,
): Promise<never> => {
  logger.info('Starting egosearcher')

  const twitterClient = new TwitterApi({
    appKey: config.twitter.api.consumerKey,
    appSecret: config.twitter.api.consumerSecret,
    accessToken: config.twitter.api.accessToken,
    accessSecret: config.twitter.api.accessTokenSecret,
  }).readOnly

  const timelineIterator = iterateListTimeline(
    twitterClient,
    config.twitter.search.listId,
  )

  /* eslint-disable no-await-in-loop */
  // eslint-disable-next-line no-constant-condition
  while (true) {
    logger.debug('Fetching list timeline')
    const { value: tweets } = await timelineIterator.next()

    logger.debug(`Handling ${tweets.length} tweets`)
    await Promise.all(
      tweets.map(async (tweet) =>
        handleTweet(config, logger.child({ tweetId: tweet.id_str }), tweet),
      ),
    )

    logger.debug(`Sleeping for ${config.twitter.search.pollingInterval}ms`)
    await sleep(config.twitter.search.pollingInterval)
  }
  /* eslint-enable no-await-in-loop */
}

const handleTweet = async (
  config: AccountConfig,
  logger: Logger,
  tweet: TweetV1,
): Promise<void> => {
  if (shouldNotifyTweet(config.twitter.search, logger, tweet)) {
    await notifyTweet(config.slack, logger, tweet)
  }
}
