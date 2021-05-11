const _          = require('lodash')
const chai       = require('chai')
const chaiHttp   = require('chai-http')
const { expect } = chai
const WS         = require('ws')

chai.use(chaiHttp)

const App = require('../src/app')

describe('App test', () => {
  context('Start and Stop', () => {
    const app = new App()
    let server
    it('should start the app', async () => {
      [ server ] = await app.start()
    })

    it('should have /health endpoint', async () => {
      const res = await chai.request(server)
        .get('/health')
      expect(res).to.have.status(200)
    })

    it('should stop the app', async () => {
      await app.stop()
    })
  })

  context('End to end test', () => {
    const app   = new App()
    const date  = Date.now()
    let server  = null
    let ws      = null
    let client1 = null
    let client2 = null
    let client3 = null
    let client4 = null
    let client5 = null

    it('should start up', async () => {
      [ server, ws ] = await app.start()
    })

    it('should handle /socket endpoint with socket handler', () => {
      return expect(ws.shouldHandle({ url: '/socket' })).to.be.true
    })

    it('should connect client1', done => {
      client1 = new WS('ws://127.0.0.1:3000/socket')
        .on('open', () => {
          expect(client1.readyState).to.equal(1)
          done()
        })
    })

    it('should be able to connect multiple clients', async () => {
      let clients = [ client2, client3, client4, client5 ]
      clients     = await Promise.all(_.map(clients, client => {
        return new Promise(resolve => {
          client = new WS('ws://127.0.0.1:3000/socket')
          client.on('open', () => {
            expect(client.readyState).to.equal(1)
            resolve(client)
          })
        })
      }))

      client2 = clients[0]
      client3 = clients[1]
      client4 = clients[2]
      client5 = clients[3]
      expect(client2.url).to.equal('ws://127.0.0.1:3000/socket')
      expect(client3.url).to.equal('ws://127.0.0.1:3000/socket')
      expect(client4.url).to.equal('ws://127.0.0.1:3000/socket')
      expect(client5.url).to.equal('ws://127.0.0.1:3000/socket')
    })

    it('should not accept empty json', done => {
      client1.on('message', m => {
        const message = JSON.parse(m)
        expect(message.type).to.equal('Error')
        expect(message.message).to.equal('Please provide single key:value pair in an object')
        done()
      })
      client1.send(JSON.stringify({}))
    })

    it('should not accept json with multiple keys', done => {
      client2.on('message', m => {
        const message = JSON.parse(m)
        expect(message.type).to.equal('Error')
        expect(message.message).to.equal('Please provide single key:value pair in an object')
        done()
      })
      client2.send(JSON.stringify({
        drink1: 'Cola',
        drink2: 'Juice',
      }))
    })

    it('should not accept arrays', done => {
      client3.on('message', m => {
        const message = JSON.parse(m)
        expect(message.type).to.equal('Error')
        expect(message.message).to.equal('Arrays are not supported yet')
        done()
      })
      client3.send(JSON.stringify([ { drink1: 'Cola' }, { drink2: 'Juice' } ]))
    })

    it('should not accept a string', done => {
      client4.on('message', m => {
        const message = JSON.parse(m)
        expect(message.type).to.equal('Error')
        expect(message.message).to.equal('Could not process or save the message')
        done()
      })
      client4.send('headphones')
    })

    it('should accept expected json', done => {
      client5.send(JSON.stringify({ [date]: 'Banana' }))
      done()
    })

    it('should not connect clients on funny endpoints', done => {
      const failedClient = new WS('ws://127.0.0.1:3000/pocket')
      failedClient.on('error', e => {
        expect(e).to.be.be.an('error')
        done()
      })
    })

    it('should disconnect clients', async () => {
      const clients = [ client1, client2, client3, client4, client5 ]
      const codes   = await Promise.all(clients.map(client => {
        return new Promise(resolve => {
          client.on('close', code => {
            resolve(code)
          })
          client.close()
        })
      }))
      codes.map(code => expect(code).to.equal(1005))
    })

    it('should have /rest/:key endpoint', async () => {
      const res = await chai.request(server)
        .get(`/rest/${date}`)

      expect(res).to.have.status(200)
      expect(res.text).to.equal('Banana')
    })

    it('should not have /rest/:nonExistingKey endpoint', async () => {
      const res = await chai.request(server)
        .get(`/rest/${date + 9999999999}`)

      expect(res).to.have.status(404)
      expect(res.text).to.equal('No value found for this key')
    })

    it('should stop', async () => {
      await app.stop()
    })
  })
})
