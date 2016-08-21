'use strict'

// Deps
const Bitswap = require('ipfs-bitswap')
const bs = require('abstract-blob-store')
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const os = require('os')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
// const promisify = require('es6-promisify')
const Q = require('q')
const R = require('ramda')
const Repo = require('ipfs-repo')
const Swarm = require('libp2p-swarm')

// Local deps
const constants = require('./constants')
const { log, logWarn, logError } = require('./utils')

// Network constants
const NODE_PORT = constants.basePort

// Test network generation
const initNodes = (maxNodes) => {
  const result = R.map((idx) => {
    // Peer object creation
    const peerId = PeerId.create({ bits: 128 })  // Note: currently shortened to shrink the test keyspace
    const peer = new PeerInfo(peerId)
    const peerAddr = multiaddr(`/ip4/127.0.0.1/tcp/${NODE_PORT+idx}/ipfs/${peer.id.toB58String()}`)
    peer.multiaddr.add(peerAddr)

    // Libp2p node Creation
    const libNode = new libp2p.Node(peer)

    return { peerInfo: peer, libp2p: libNode }
  }, R.range(0, maxNodes))

  return Promise.resolve(result)
}

// TODO: Decide where to implement peer discovery strategies...
const initNodePeerBooks = (network) => {
  const result = R.map((self) => {
    const myId = self.peerInfo.id
    const myBook = self.libp2p.peerBook

    R.forEach((neighbor) => {
      const neighborId = neighbor.peerInfo.id
      // do not include self in peerbook
      if (neighborId.toB58String() === myId.toB58String()) return
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
  const nodeStartPromises = R.map((peer) => {
    return new Promise((resolve, reject) => {
      peer.libp2p.start((err) => {
        if (err) return reject(err)
        log(`Started node: ${peer.peerInfo.id.toB58String()}`)
        return resolve()
      })
    })
  }, network)

  return Promise.all(nodeStartPromises)
    .then((results) => {
      log(`${R.length(results)} nodes started`)
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

const linkNodes = (network) => {
  const potentialLinkNodes = R.map((fromNode) => {
    const fromId = fromNode.peerInfo.id.toB58String()

    return R.map((toNode) => {
      const toId = toNode.peerInfo.id.toB58String()
      // don't link to self
      if (fromId === toId) return null

      return new Promise((resolve, reject) => {
        fromNode.libp2p.dialByPeerInfo(toNode.peerInfo, (err) => {
          if (err) return reject(err)
          return resolve()
        })
      })
    }, network)

  }, network)

  const linkNodes = R.filter((pExists) => pExists, R.flatten(potentialLinkNodes))

  return Promise.all(linkNodes)
    .then((results) => {
      log(`${R.length(results)} links created`)
      return network
    })
}

//

const initTestnet = (maxNodes) => {
  // Hack until strategies implemented
  if (maxNodes > 30) {
    logError(`Strategies for building node peerbooks are being implemented. Until then keep it under 30`)
    throw new Error(`Keep maxNodes it under 30 until strategies implemented`)
  }
  let start = new Date()

  return initNodes(maxNodes)
    .then(initNodePeerBooks)
    .then(initNodePeerRepos)
    .then(startNodes)
    .then(initNodeBitswaps)
    .then(linkNodes)
    .then((result) => {
      log('DONE')
      let end = new Date()
      log(`Started a ${maxNodes} node network in ${(end-start) / 1000} seconds`)
      process.exit()
    })
    .catch((err) => {
      console.log(err)
      logError('ERR:', err)
      let end = new Date()
      log(`Failed to start a ${maxNodes} node network (${(end-start) / 1000} seconds)`)
      process.exit()
    })
}

initTestnet(3)
