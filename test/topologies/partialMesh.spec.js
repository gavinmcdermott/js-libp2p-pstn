'use strict'

const expect = require('chai').expect
const R = require('ramda')

const testUtils = require('./../testUtils')

const Node = require('./../../src/nodes/index')
const Topology = require('./../../src/topologies/topology')
const topologies = require('./../../src/topologies/index')
const partialMesh = require('./../../src/topologies/partialMesh')

const totalNodes = 10

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

describe(`Topology: ${partialMesh.type}`, () => {
  let instance
  let nodes

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
    // test 2 random nodes in the mesh
    const randA = getRandomInt(0, totalNodes)
    const randB = getRandomInt(0, totalNodes)

    before(() => {
      nodes = R.map((offset) => new Node(offset), R.range(0, totalNodes))
    })

    // Must kill connections for further other tests!
    after(() => {
      R.forEach((node) => node.libp2p.swarm.close(), nodes)
    })

    it('fails without nodes', () => {
      let thrower = () => topology.init()
      expect(thrower).to.throw()
    })

    it('success returns promise with connected nodes', () => {
      partialMesh.init(nodes).then((connected) => {
        // first node
        const nodeA = connected[randA]
        const idA = nodeA.peerInfo.id.toB58String()
        const peerBookA = nodeA.libp2p.peerBook.getAll()
        const peerCountA = R.keys(peerBookA).length

        // second node
        const nodeB = connected[randB]
        const idB = nodeB.peerInfo.id.toB58String()
        const peerBookB = nodeB.libp2p.peerBook.getAll()
        const peerCountB = R.keys(peerBookB).length

        expect(peerCountA >= 2).to.be.true
        expect(peerCountB >= 2).to.be.true
      })
    })
  })
})
