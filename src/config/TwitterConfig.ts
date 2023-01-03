/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-redeclare */

import { z } from 'zod'
import { TwitterApiConfig } from './TwitterApiConfig'
import { TwitterSearchConfig } from './TwitterSearchConfig'

const TwitterConfig = z.object({
  api: TwitterApiConfig,
  search: TwitterSearchConfig,
})
type TwitterConfig = z.infer<typeof TwitterConfig>

export { TwitterConfig }
