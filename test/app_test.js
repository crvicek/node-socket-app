const chai       = require('chai')
const chaiHttp   = require('chai-http')
const { expect } = chai

chai.use(chaiHttp)

const App = require('../src/app')

describe('App test', () => {
  context('Start and Stop', () => {
    const app = new App()
    it('should start the app', async () => {
      await app.start()
    })

    it('should stop the app', async () => {
      await app.stop()
    })
  })

  context('End to end test', () => {
    const app  = new App()
    let server = null
    beforeEach(async () => {
      server = await app.start()
    })
    afterEach(async () => {
      await app.stop()
    })

    it('should have /health endpoint', async () => {
      return chai.request(server)
        .get('/health')
        .then(res => {
          expect(res).to.have.status(200)
        })
    })

    // it('should have /socket endpoint accepting socket connection', async () => {
    //   return chai.request(server)
    //     .get('/socket')
    //     .then(res => {
    //       expect(res).to.have.status(200)
    //     })
    // })
  })
})
