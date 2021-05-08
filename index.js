const _   = require('lodash')
const App = require('./src/app')

const app = new App()

app.start()
  .then(() => {
    let exit = async () => {
      await app.stop()
      process.exit(0)
    }

    exit          = _.once(exit)
    const signals = [ 'SIGUSR2', 'SIGTERM', 'SIGINT' ]

    signals.forEach(signal => process.once(signal, exit))
  })
  .catch((error) => {
    console.error(`Failed to start the app: ${error}`)
    process.exitCode = 1
  })
