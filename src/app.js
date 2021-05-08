const config  = require('config')
const debug   = require('debug')('app:')
const http    = require('http')
const express = require('express')
const WS      = require('ws')

module.exports = function () {
  const app    = express()
  const server = http.createServer(app)
  const wss    = new WS.Server({ server, path: '/socket' })

  app.get('/health', (req, res) => {
    res.send('OK')
  })

  wss.on('connection', socket => {
    debug('New client connected')
    socket.on('message', msg => {
      debug('Message received', msg)
    })
    socket.on('close', () => {
      debug('Client disconnected')
    })
  })

  const start = () => {
    console.log('Starting the app')
    return new Promise((resolve, reject) => server.listen(config.port, error => {
      if (error) {
        return reject(error)
      }

      console.log(`🚀 Server ready at http://localhost:${config.port}.`)
      return resolve(server)
    }))
  }

  const stop = async () => {
    console.log('Stopping the app')
    await new Promise(resolve => server.close(() => resolve()))
    console.log('App stoped')
  }
  return {
    start,
    stop,
  }
}
