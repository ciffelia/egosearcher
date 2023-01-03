/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-redeclare */

import { z } from 'zod'
import { TwitterConfig } from './TwitterConfig'
import { SlackConfig } from './SlackConfig'

const AccountConfig = z.object({
  name: z.string(),
  twitter: TwitterConfig,
  slack: SlackConfig,
})
type AccountConfig = z.infer<typeof AccountConfig>

export { AccountConfig }
