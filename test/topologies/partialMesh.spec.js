'use strict'

const expect = require('chai').expect
const R = require('ramda')

const Topology = require('./../../src/topologies/topology')
const partialMesh = require('./../../src/topologies/partialMesh')

const utils = require('./../testUtils')

describe(`Topology: ${partialMesh.type}`, () => {
  let instance

  it('has a type', () => {
    expect(partialMesh.type).to.exist
    expect(typeof partialMesh.type).to.equal('string')
  })

  it('has an init', () => {
    expect(partialMesh.init).to.exist
    expect(typeof partialMesh.init).to.equal('function')
  })

  it('succeeds', () => {
    instance = new Topology(partialMesh)
    expect(instance instanceof Topology).to.be.true
    expect(instance.type).to.exist
    expect(instance.init).to.exist
  })

  describe('init', () => {
    it('fails without nodes', () => {
      let thrower = () => topology.init()
      expect(thrower).to.throw()
    })

    // TODO: call init with valid nodes
    // it('succeeds', () => {

    // })
  })
})
