const config  = require('config')
const http    = require('http')
const express = require('express')
const WS      = require('ws')
const Redis   = require('ioredis')

const { handleSocket, handleREST } = require('./lib')

module.exports = function () {
  const app    = express()
  const server = http.createServer(app)
  const wss    = new WS.Server({ server, path: '/socket' })
  const redis  = new Redis(config.redis.host)

  app.get('/health', (req, res) => {
    res.send('OK')
  })

  app.get('/rest/:key', (req, res) => {
    handleREST({ req, res, redis })
  })

  wss.on('connection', socket => {
    handleSocket({ socket, redis })
  })

  const start = () => {
    console.log('Starting the app')
    return new Promise((resolve, reject) => server.listen(config.port, error => {
      if (error) {
        return reject(error)
      }

      console.log(`🚀 Server ready at http://localhost:${config.port}.`)
      return resolve([ server, wss ])
    }))
  }

  const stop = async () => {
    console.log('Stopping the app')
    redis.disconnect()
    await new Promise(resolve => server.close(() => resolve()))
    console.log('App stoped')
  }
  return {
    start,
    stop,
  }
}
