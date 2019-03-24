process.on('unhandledRejection', e => { throw e })

const Notifier = require('./Notifier')
const Searcher = require('./Searcher')
const config = require('../config')

const notifier = new Notifier(config.sendGridApiKey)

const apps = config.twitter.map(account => new Searcher(account, notifier))

for (const app of apps) {
  app.start()
}
