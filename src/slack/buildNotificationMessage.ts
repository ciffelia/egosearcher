import type { IncomingWebhookSendArguments } from '@slack/webhook'
import type {
  Block,
  ContextBlock,
  KnownBlock,
  SectionBlock,
} from '@slack/types'
import type { TweetV1 } from 'twitter-api-v2'
import { format } from 'date-fns'
import { parseSnowflake } from '@/twitter/parseSnowflake'

export const buildNotificationMessage = (
  tweet: TweetV1,
): Pick<IncomingWebhookSendArguments, 'text' | 'blocks'> => ({
  text: buildAltMessage(tweet),
  blocks: buildBlocks(tweet),
})

const buildAltMessage = (tweet: TweetV1): string =>
  `${tweet.user.name} (@${
    tweet.user.screen_name
  }) mentioned you: ${tweet.full_text!}`

const buildBlocks = (tweet: TweetV1): Array<KnownBlock | Block> => [
  buildHeaderBlock(tweet),
  buildTextBlock(tweet),
  buildFooterBlock(tweet),
]

const buildHeaderBlock = (tweet: TweetV1): ContextBlock => {
  const authorUrl = `https://twitter.com/${tweet.user.screen_name}`

  /* eslint-disable @typescript-eslint/naming-convention */
  return {
    type: 'context',
    elements: [
      {
        type: 'image',
        image_url: tweet.user.profile_image_url_https,
        alt_text: 'icon',
      },
      {
        type: 'mrkdwn',
        text: `<${authorUrl}|*${tweet.user.name}* (@${tweet.user.screen_name})> mentioned you.`,
      },
    ],
  }
  /* eslint-enable @typescript-eslint/naming-convention */
}

const buildTextBlock = (tweet: TweetV1): SectionBlock => ({
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: tweet.full_text!,
  },
})

const buildFooterBlock = (tweet: TweetV1): ContextBlock => {
  const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
  const formattedDate = format(
    parseSnowflake(tweet.id_str),
    'yyyy-MM-dd HH:mm:ss.SSS',
  )

  return {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `<${tweetUrl}|${formattedDate}>`,
      },
    ],
  }
}
