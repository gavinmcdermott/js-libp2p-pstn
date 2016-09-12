'use strict'

const expect = require('chai').expect
const R = require('ramda')

const Topology = require('./../../src/topologies/topology')
const partialMesh = require('./../../src/topologies/partialMesh')

const utils = require('./../testUtils')

describe('Topology', () => {
  let topology

  it('fails without a type', () => {
    let thrower = () => new Topology({})
    expect(thrower).to.throw()
  })

  it('fails without a init function', () => {
    let thrower = () => new Topology({type: 'someType'})
    expect(thrower).to.throw()
  })

  it('succeeds', () => {
    topology = new Topology(partialMesh)
    expect(topology instanceof Topology).to.be.true
    expect(topology.type).to.exist
    expect(topology.init).to.exist
  })

  describe('init', () => {
    it('fails without nodes', () => {
      let thrower = () => topology.init()
      expect(thrower).to.throw()
    })
  })
})
