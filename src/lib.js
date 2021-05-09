const _      = require('lodash')
const config = require('config')
const debug  = require('debug')('app:lib')

const setKey = (key, value, redis) => {
  if (!config.redis) {
    console.log('No redis config, not saving')
    return
  }

  const fullNamespace = `${config.redis.baseNamespace}:${key}`
  debug(`Setting key for ${fullNamespace}`)
  return redis.set(fullNamespace, value)
}

const getKey = async (key, redis) => {
  if (!config.redis) {
    console.log('No redis config, not looking')
    return
  }

  const fullNamespace = `${config.redis.baseNamespace}:${key}`
  const data          = await redis.get(fullNamespace)
  if (data) debug(`Found data for ${fullNamespace}`)

  return data
}

const handleREST = async ({ req, res, redis }) => {
  const { key } = req.params
  debug('Request key: ', key)

  const value = await getKey(key, redis)
  if (!value) {
    return res.status(404).send('No value found for this key')
  }

  res.send(value)
}

const handleSocket = function ({ socket, redis }) {
  debug('New client connected')
  socket.on('message', async msg => {
    try {
      const message = JSON.parse(msg)
      debug('Parsed message', message)

      // Data format checks
      if (_.isArray(message)) {
        return socket.send(JSON.stringify({
          type:    'Error',
          message: 'Arrays are not supported yet',
        }))
      }

      const keys = _.keys(message)

      // Only save single key:value
      if (keys.length > 1 || _.isEmpty(keys)) {
        return socket.send(JSON.stringify({
          type:    'Error',
          message: 'Please provide single key:value pair in an object',
        }))
      }

      const firstKey = keys[0]
      await setKey(firstKey, message[firstKey], redis)
    } catch (e) {
      console.error('Error processing the message', e)
      const errorObj = {
        type:    'Error',
        payload: 'Could not process or save the message',
      }
      socket.send(JSON.stringify(errorObj))
    }
  })

  socket.on('close', () => {
    debug('Client disconnected')
  })
  socket.on('error', error => {
    debug('Woopsie ', error)
  })
}

module.exports = {
  handleSocket,
  handleREST,
}
