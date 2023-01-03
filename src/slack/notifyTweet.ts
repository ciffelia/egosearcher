import type { Logger } from 'pino'
import { IncomingWebhook } from '@slack/webhook'
import type { TweetV1 } from 'twitter-api-v2'
import type { SlackConfig } from '@/config'
import { buildNotificationMessage } from '@/slack/buildNotificationMessage'

export const notifyTweet = async (
  slackConfig: SlackConfig,
  logger: Logger,
  tweet: TweetV1,
): Promise<void> => {
  logger.info('Creating notification')

  const webhook = new IncomingWebhook(slackConfig.webhookUrl)
  await webhook.send(buildNotificationMessage(tweet))

  logger.info('Webhook called')
}
