'use strict'

const expect = require('chai').expect
const R = require('ramda')

const testUtils = require('./../testUtils')

const Node = require('js-libp2p-pstn-node')
const Topology = require('./../../src/topologies/topology')
const topologies = require('./../../src/topologies/index')
const nClusters = require('./../../src/topologies/nClusters')
const pregenKeys = require('./../../fixtures/keys').keys

const totalNodes = testUtils.DEFAULT_SIZE

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

describe(`Topology: ${nClusters.type}`, () => {
  let instance
  let nodes

  it('has a type', () => {
    expect(nClusters.type).to.exist
    expect(typeof nClusters.type).to.equal('string')
  })

  it('has an init', () => {
    expect(nClusters.init).to.exist
    expect(typeof nClusters.init).to.equal('function')
  })

  it('succeeds', () => {
    instance = new Topology(nClusters)
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

      const inits = R.map((n) => n.init(), nodes)

      return Promise.all(inits)
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
      nClusters.init(nodes).then((connected) => {

        // TODO: add config to each topo
        setTimeout(() => {
          // first node in first cluster
          // const nodeA = nodes[0]
          // const idA = nodeA.peerInfo.id.toB58String()
          // const peerBookA = nodeA.libp2p.peerBook.getAll()
          // const peerCountA = R.keys(peerBookA).length

          // // second node in first cluster
          // const nodeB = nodes[1]
          // const idB = nodeB.peerInfo.id.toB58String()
          // const peerBookB = nodeB.libp2p.peerBook.getAll()
          // const peerCountB = R.keys(peerBookB).length

          // // last node in first cluster
          // const nodeC = nodes[29]
          // const idC = nodeC.peerInfo.id.toB58String()
          // const peerBookC = nodeC.libp2p.peerBook.getAll()
          // const peerCountC = R.keys(peerBookC).length

          // // first node for next cluster
          // const nodeD = nodes[30]
          // const idD = nodeD.peerInfo.id.toB58String()
          // const peerBookD = nodeD.libp2p.peerBook.getAll()
          // const peerCountD = R.keys(peerBookD).length

          // expect(peerCountA === 3).to.be.true

          // expect(R.contains(idB, R.keys(peerBookA))).to.be.true
          // expect(R.contains(idC, R.keys(peerBookA))).to.be.true
          // expect(R.contains(idD, R.keys(peerBookA))).to.be.true

          done()
        }, 2000)
      })
    })
  })
})
