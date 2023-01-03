import pino from 'pino'
import { loadConfig } from '@/config'
import { runEgosearcher } from '@/runEgosearcher'

const main = async (): Promise<void> => {
  const logger = pino({
    level: process.env['NODE_ENV'] === 'production' ? 'info' : 'trace',
  })
  logger.info('Application started')

  const config = await loadConfig(logger)
  logger.info('Config loaded')

  await Promise.all(
    config.map(async (c) =>
      runEgosearcher(c, logger.child({ account: c.name })),
    ),
  )
}

void main()
