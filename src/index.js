const EmailNotifier = require('./EmailNotifier')
const Searcher = require('./Searcher')

if (process.env.EGOSEARCHER_CONFIG === undefined) {
  throw new Error('EGOSEARCHER_CONFIG is not set.')
}
const config = require(process.env.EGOSEARCHER_CONFIG)

const notifier = new EmailNotifier(config.notify.email)

const apps = config.search.map(searchConfig => new Searcher(searchConfig, notifier))

console.log(`Starting apps for ${apps.length} users.`)
for (const app of apps) {
  app.start()
}
