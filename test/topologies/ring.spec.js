'use strict'

const expect = require('chai').expect
const R = require('ramda')
const Q = require('q')

const testUtils = require('./../testUtils')

const Node = require('libp2p-pstn-node')
const Topology = require('./../../src/topologies/topology')
const topologies = require('./../../src/topologies/index')
const ring = require('./../../src/topologies/ring')
const pregenKeys = require('./../../fixtures/keys').keys

const totalNodes = testUtils.DEFAULT_SIZE

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
      nodes = R.map((idx) => {
        const options = {
          id: pregenKeys[idx],
          portOffset: idx
        }
        return new Node(options)
      }, R.range(0, totalNodes))

      const inits = R.map((n) => n.start(), nodes)

      return Q.allSettled(inits)
    })

    // Must kill connections for further other tests!
    after(() => {
      R.forEach((node) => node.libp2p.swarm.close(), nodes)
    })

    it('fails without nodes', () => {
      let thrower = () => topology.init()
      expect(thrower).to.throw()
    })

    it('success returns promise with connected nodes', (done) => {
      ring.init(nodes).then((connected) => {
        // Allow the peerbooks to populate
        setTimeout(() => {
          // first node
          const nodeA = nodes[0]
          const idA = nodeA.peerInfo.id.toB58String()
          const peerBookA = nodeA.libp2p.peerBook.getAll()
          const peerCountA = R.keys(peerBookA).length

          // second node
          const nodeB = nodes[1]
          const idB = nodeB.peerInfo.id.toB58String()
          const peerBookB = nodeB.libp2p.peerBook.getAll()
          const peerCountB = R.keys(peerBookB).length

          // third node
          const nodeC = nodes[2]
          const idC = nodeC.peerInfo.id.toB58String()
          const peerBookC = nodeC.libp2p.peerBook.getAll()
          const peerCountC = R.keys(peerBookC).length

          // last node
          const nodeD = nodes[nodes.length - 1]
          const idD = nodeD.peerInfo.id.toB58String()
          const peerBookD = nodeD.libp2p.peerBook.getAll()
          const peerCountD = R.keys(peerBookD).length

          expect(peerCountA === 2).to.be.true
          expect(R.contains(idB, R.keys(peerBookA))).to.be.true
          expect(R.contains(idD, R.keys(peerBookA))).to.be.true

          expect(peerCountB === 2).to.be.true
          expect(R.contains(idC, R.keys(peerBookB))).to.be.true
          expect(R.contains(idA, R.keys(peerBookB))).to.be.true

          expect(peerCountC === 2).to.be.true
          expect(R.contains(idB, R.keys(peerBookC))).to.be.true

          expect(peerCountD === 2).to.be.true
          expect(R.contains(idA, R.keys(peerBookD))).to.be.true

          done()
        }, 2000)
      })
    })
  })
})
