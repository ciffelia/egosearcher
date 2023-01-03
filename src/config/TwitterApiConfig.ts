/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-redeclare */

import { z } from 'zod'

const TwitterApiConfig = z.object({
  consumerKey: z.string(),
  consumerSecret: z.string(),
  accessToken: z.string(),
  accessTokenSecret: z.string(),
})
type TwitterApiConfig = z.infer<typeof TwitterApiConfig>

export { TwitterApiConfig }
