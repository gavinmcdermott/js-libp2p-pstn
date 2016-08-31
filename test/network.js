'use strict'

const expect = require('chai').expect
const R = require('ramda')
const Network = require('./../src/network')
const constants = require('./../src/constants')

const TEST_NET_SIZE = 100
const networkConfig = { size: TEST_NET_SIZE }

describe('Testnet init', () => {
  let network

  before(() => {
    network = new Network(networkConfig)
  })

  after(() => {
    network = null
  })

  it('instance exists', () => {
    expect(network instanceof Network).to.be.true
  })

  it(`initialize a ${TEST_NET_SIZE} node testnet`, () => {
    return network.init().then((instance) => {
      expect(instance).to.exist
      expect(instance.size).to.equal(networkConfig.size)
      expect(instance.nodes.length).to.equal(networkConfig.size)
    })
  })

  it(`bootstrap to at least ${constants.NODE_BOOTSTRAP_COUNT} peers`, () => {
    const node = R.head(network.nodes)
    const peerBook = node.libp2p.peerBook.getAll()
    const peerCount = R.keys(peerBook).length
    expect(peerCount >= constants.NODE_BOOTSTRAP_COUNT).to.be.true
  })
})
