/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-redeclare */

import { z } from 'zod'
import { AccountConfig } from './AccountConfig'

const EgosearcherConfig = z.array(AccountConfig)
type EgosearcherConfig = z.infer<typeof EgosearcherConfig>

export { EgosearcherConfig }
