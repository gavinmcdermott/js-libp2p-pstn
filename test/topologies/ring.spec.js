'use strict'

const expect = require('chai').expect
const R = require('ramda')

const testUtils = require('./../testUtils')

const Node = require('./../../src/nodes/index')
const Topology = require('./../../src/topologies/topology')
const topologies = require('./../../src/topologies/index')
const ring = require('./../../src/topologies/ring')

const totalNodes = 10

describe(`Topology: ${ring.type}`, () => {
  let instance
  let nodes

  it('has a type', () => {
    expect(ring.type).to.exist
    expect(typeof ring.type).to.equal('string')
  })

  it('has an init', () => {
    expect(ring.init).to.exist
    expect(typeof ring.init).to.equal('function')
  })

  it('succeeds', () => {
    instance = new Topology(ring)
    expect(instance instanceof Topology).to.be.true
    expect(instance.type).to.exist
    expect(instance.init).to.exist
  })

  describe('init', () => {
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
      ring.init(nodes).then((connected) => {
        // first node
        const nodeA = connected[0]
        const idA = nodeA.peerInfo.id.toB58String()
        const peerBookA = nodeA.libp2p.peerBook.getAll()
        const peerCountA = R.keys(peerBookA).length

        // second node
        const nodeB = connected[1]
        const idB = nodeB.peerInfo.id.toB58String()
        const peerBookB = nodeB.libp2p.peerBook.getAll()
        const peerCountB = R.keys(peerBookB).length

        // last node
        const nodeC = connected[connected.length - 1]
        const idC = nodeC.peerInfo.id.toB58String()
        const peerBookC = nodeC.libp2p.peerBook.getAll()
        const peerCountC = R.keys(peerBookC).length

        expect(peerCountA === 1).to.be.true
        expect(peerCountB === 1).to.be.true
        expect(peerCountC === 1).to.be.true

        expect(R.head(nodeA.libp2p.peerBook)).to.equal(idB)
        expect(R.head(nodeC.libp2p.peerBook)).to.equal(idA)
      })
    })
  })
})
