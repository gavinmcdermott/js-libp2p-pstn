'use strict'

// Deps
const Bitswap = require('ipfs-bitswap')
const bs = require('abstract-blob-store')
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const os = require('os')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const promisify = require('es6-promisify')
// const Q = require('q')
const R = require('ramda')
const Repo = require('ipfs-repo')

// Local deps
const constants = require('./constants')
const { log, logWarn, logError } = require('./utils')

// Network constants
const NODE_PORT = constants.peerConnectionPort

// Locals


// Test network generation
const initNodes = (maxNodes) => {
  const result = R.map((idx) => {
    // Peer object creation
    const peer = new PeerInfo()
    const peerAddr = multiaddr(`/ip4/127.0.0.1/tcp/${NODE_PORT+idx}/ipfs/${peer.id.toB58String()}`)
    peer.multiaddr.add(peerAddr)

    // Libp2p node Creation
    const libNode = new libp2p.Node(peer)

    return { peerInfo: peer, libp2p: libNode }
  }, R.range(0, maxNodes))

  return Promise.resolve(result)
}

const initNodePeerBooks = (network) => {
  const result = R.map((self) => {
    const myId = self.peerInfo.id.id
    const myBook = self.libp2p.peerBook

    // TODO: Exponential, wuff...
    R.forEach((neighbor) => {
      const neighborId = neighbor.peerInfo.id.id
      if (neighborId === myId) return
      myBook.put(neighbor.peerInfo)
    }, network)

    return self
  }, network)

  return Promise.resolve(result)
}

const initNodePeerRepos = (network) => {
  const tmpDir = os.tmpdir()

  const result = R.map((peer) => {
    const repoPath = `${tmpDir}/${peer.peerInfo.id.toB58String()}`
    peer.repo = new Repo(repoPath, { stores: bs })
    return peer
  }, network)

  return Promise.resolve(result)
}

const startNodes = (network) => {
  // libp2p start func expects a callback
  const cb = (peer) => () => log(`Started peer: ${peer.peerInfo.id.toB58String()}`)

  const startPromises = R.map((peer) => {
    return promisify(peer.libp2p.start(cb(peer)))
  }, network)

  return Promise.all(startPromises)
    .then((results) => {
      log(`${R.length(results)} peers started`)
      return network
    })
}

const initNodeBitswaps = (network) => {
  const result = R.map((peer) => {
    peer.bitswap = new Bitswap(peer.peerInfo, peer.libp2p, peer.repo.datastore, peer.peerBook)
    return peer
  }, network)

  return Promise.resolve(result)
}


// TODO:
// TODO:
// TODO:
const linkNodes = (network) => {

}



// API
// API
// API

const initTestnet = (maxNodes) => {
  let start = new Date()

  initNodes(maxNodes)
    .then(initNodePeerBooks)
    .then(initNodePeerRepos)
    .then(startNodes)
    .then(initNodeBitswaps)
    .then(linkNodes)
    .then((result) => {
      log('DONE')
      let end = new Date()
      log(`started ${maxNodes} nodes in ${(end-start) / 1000} seconds`)
    })
    .catch((err) => {
      console.log(err)
      logError('ERR:', err)
      let end = new Date()
      log(`started ${maxNodes} nodes in ${(end-start) / 1000} seconds`)
    })
}

initTestnet(1)
