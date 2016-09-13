'use strict'

const expect = require('chai').expect
const R = require('ramda')

const Bitswap = require('ipfs-bitswap')
const libp2p = require('libp2p-ipfs')
const PeerInfo = require('peer-info')
const Repo = require('ipfs-repo')

const testUtils = require('./../testUtils')

const CONFIG = require('./../../src/nodes/config')
const Node = require('./../../src/nodes/node')

describe('Nodes', () => {
  let node
  const offset = 1

  // Must kill connections for further other tests!
  after(() => {
    node.libp2p.swarm.close()
  })

  it('fails without an offset', () => {
    let thrower = () => new Node()
    expect(thrower).to.throw()
  })

  it('succeeds', () => {
    node = new Node(offset)
    expect(node).to.exist
    expect(node instanceof Node).to.be.true
    expect(node.peerInfo).to.exist
    expect(node.peerInfo instanceof PeerInfo).to.be.true
    expect(node.libp2p).to.exist
    expect(node.libp2p instanceof libp2p.Node).to.be.true
    expect(node.repo).to.exist
    expect(node.repo instanceof Repo).to.be.true
    expect(node.bitswap).to.exist
    expect(node.bitswap instanceof Bitswap).to.be.true
  })

  it(`init`, () => {
    return node.init().then((n) => {
      expect(n).to.exist
      expect(n instanceof Node).to.be.true
    })
  })
})
