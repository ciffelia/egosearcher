import type { Logger } from 'pino'
import type { TweetV1 } from 'twitter-api-v2'
import type { TwitterSearchConfig } from '@/config'

export const shouldNotifyTweet = (
  searchConfig: TwitterSearchConfig,
  logger: Logger,
  tweet: TweetV1,
): boolean => {
  logger.trace('Running shouldNotifyTweet')

  const isRetweet = tweet.retweeted_status !== undefined
  if (isRetweet) {
    logger.trace('Skipping retweet')
    return false
  }

  const authorId = tweet.user.id_str
  const quotedUserId = tweet.quoted_status?.user.id_str
  const mentionedUserIds =
    tweet.entities.user_mentions?.map((user) => user.id_str) ?? []

  for (const excludedUser of searchConfig.excludedUserIds) {
    if (
      authorId === excludedUser ||
      quotedUserId === excludedUser ||
      mentionedUserIds.includes(excludedUser)
    ) {
      logger.trace('Skipping because of excludedUser')
      return false
    }
  }

  const includesQuery = searchConfig.queries.some((query) =>
    tweet.full_text!.toLowerCase().includes(query.toLowerCase()),
  )
  if (!includesQuery) {
    logger.trace('Skipping because no match found')
    return false
  }

  logger.trace('One or more queries matched')
  return true
}
