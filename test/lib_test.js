const chai       = require('chai')
const sinon      = require('sinon')
const chaiHttp   = require('chai-http')
const { expect } = chai

chai.use(chaiHttp)

const {
  setKey,
  getKey,
  handleREST,
  handleSocket,
} = require('../src/lib')

describe('Lib unit tests', () => {
  context('setKey', () => {
    const fakeRedis = { set: null }
    it('should call redis.set', async () => {
      fakeRedis.set = sinon.spy()
      await setKey('key', 'value', fakeRedis)
      expect(fakeRedis.set.calledOnce).to.be.true
    })
  })

  context('getKey', () => {
    const fakeRedis = { get: null }
    it('should return the value of the key if found', async () => {
      const expectedResult = 'banana'
      fakeRedis.get        = sinon.stub().resolves(expectedResult)
      const result         = await getKey('existingKey', fakeRedis)
      expect(result).to.equal(expectedResult)
    })
    it('should not throw if the value of the key if not found', async () => {
      fakeRedis.get = sinon.stub().resolves(null)
      const result  = await getKey('nonExistingKey', fakeRedis)
      expect(result).to.equal(null)
    })
  })

  // context('handleRest', () => {
  //   it('should ', async () => {

  //   })
  // })
  // context('handleSocket', () => {
  //   it('should ', async () => {
  //   })
  // })
})
