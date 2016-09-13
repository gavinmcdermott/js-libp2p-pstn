'use strict'

const expect = require('chai').expect
const R = require('ramda')

const testUtils = require('./../testUtils')

const Network = require('./../../src/network/index')
const topologies = require('./../../src/topologies/index')

const size = testUtils.DEFAULT_SIZE
const topology = topologies[testUtils.DEFAULT_TOPOLOGY_TYPE]

const missingSize = {}
const missingTopolog = { size }
const validConfig = { size, topology }

describe('Network', () => {
  let network

  after(() => {
    network = null
  })

  it('fails without a size', () => {
    let thrower = () => new Network(missingSize)
    expect(thrower).to.throw()
  })

  it('fails without a valid topology', () => {
    let throwerA = () => new Network(missingTopolog)
    let throwerB = () => new Network({ size: 20, topology: 'someInvalidTopo' })
    expect(throwerA).to.throw()
    expect(throwerB).to.throw()
  })

  it('succeeds', () => {
    network = new Network(validConfig)
    expect(network instanceof Network).to.be.true
  })

  it(`initializes a ${size} node testnet with a ${testUtils.DEFAULT_TOPOLOGY_TYPE} topology`, () => {
    return network.init().then((instance) => {
      expect(instance).to.exist
      expect(instance.size).to.equal(validConfig.size)
      expect(instance.nodes.length).to.equal(validConfig.size)
      expect(instance.topology).to.equal(topology)
    })
  })
})
