module.exports = {
  port: 3000,

  redis: {
    baseNamespace: 'local:node-socket-app:v1',
    host:          {
      host: 'localhost',
      port: 6379,
    },
  },

}
