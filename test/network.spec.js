'use strict'

const expect = require('chai').expect
const R = require('ramda')
const Network = require('./../src/network')

const TEST_NET_SIZE = 10
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

  // TODO: Refactor by pulling into topo specs :)
  it(`bootstrap to at least 2 peers`, () => {
    const node = R.head(network.nodes)
    const peerBook = node.libp2p.peerBook.getAll()
    const peerCount = R.keys(peerBook).length
    expect(peerCount >= 2).to.be.true
  })
})
