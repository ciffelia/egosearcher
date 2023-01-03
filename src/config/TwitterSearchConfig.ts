/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-redeclare */

import { z } from 'zod'

const TwitterSearchConfig = z.object({
  listId: z.string(),
  pollingInterval: z.number().positive(),
  queries: z.string().array(),
  excludedUserIds: z.string().array(),
})
type TwitterSearchConfig = z.infer<typeof TwitterSearchConfig>

export { TwitterSearchConfig }
