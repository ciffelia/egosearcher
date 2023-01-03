/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-redeclare */

import { z } from 'zod'

const SlackConfig = z.object({
  webhookUrl: z.string().url(),
})
type SlackConfig = z.infer<typeof SlackConfig>

export { SlackConfig }
