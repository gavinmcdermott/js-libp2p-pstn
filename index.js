'use strict'

const bitswap = require('ipfs-bitswap')
const bs = require('abstract-blob-store')
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const os = require('os')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const R = require('ramda')

const constants = require('./constants')
const { log, warn, error } = require('./utils')

const NODE_PORT = constants.peerConnectionPort

const create = (nodeCount) => {

  // let network = []

  const peerNodes = R.map((idx) => {
    // Peer object creation
    const peer = new PeerInfo()
    const peerAddr = multiaddr(`/ip4/127.0.0.1/tcp/${NODE_PORT+idx}/ipfs/${peer.id.toB58String()}`)
    peer.multiaddr.add(peerAddr)

    // Libp2p node Creation
    const libNode = new libp2p.Node(peer)

    return { peerInfo: peer, libp2p: libNode }
  }, R.range(0, nodeCount))

  log(peerNodes)
}


create(1)
