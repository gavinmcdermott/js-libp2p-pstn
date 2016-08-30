'use strict'

const expect = require('chai').expect
const R = require('ramda')
const Network = require('./../src/network')
const constants = require('./../src/constants')

const TEST_NET_SIZE = 1500

describe('Testnet init', () => {
  const networkConfig = { size: TEST_NET_SIZE }
  let network

  before(() => {
    network = new Network(networkConfig)
  })

  it('instance exists', () => {
    expect(network instanceof Network).to.be.true
  })

  it(`initialize a ${TEST_NET_SIZE} node testnet`, (done) => {
    network.init().then((instance) => {
      expect(instance).to.exist
      expect(instance.size).to.equal(networkConfig.size)
      done()
    })
  })

  it(`peers bootstrap with 2 connectons`, () => {
    const node = R.head(network.nodes)
    const pb = node.libp2p.peerBook.getAll()
    expect(R.keys(pb).length).to.equal(2)
  })
})
