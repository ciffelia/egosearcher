import path from 'node:path'
import type { Logger } from 'pino'
import { EgosearcherConfig } from './EgosearcherConfig'

export const loadConfig = async (
  logger: Logger,
): Promise<EgosearcherConfig> => {
  const configPath = process.env['EGOSEARCHER_CONFIG']
  if (configPath === undefined) {
    throw new Error('EGOSEARCHER_CONFIG is not set.')
  }

  const fullPath = path.join(process.cwd(), configPath)
  logger.info(`Loading config from ${fullPath}`)

  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const rawConfig: unknown = require(fullPath)
  return EgosearcherConfig.parse(rawConfig)
}
