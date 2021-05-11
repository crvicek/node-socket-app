const env = process.env.NODE_ENV || 'development'

module.exports = {
  port: 3000,

  redis: {
    baseNamespace: `${env}:node-socket-app:v1`,
    host:          {
      host: 'localhost',
      port: 6379,
    },
  },

}
