process.on('unhandledRejection', e => { throw e })

const EmailNotifier = require('./EmailNotifier')
const Searcher = require('./Searcher')
const config = require('../config')

const notifier = new EmailNotifier(config.notify.email)

const apps = config.search.map(searchConfig => new Searcher(searchConfig, notifier))

for (const app of apps) {
  app.start()
}
