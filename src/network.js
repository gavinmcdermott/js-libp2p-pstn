'use strict'

// Note on open file limits in OSX
// https://support.code42.com/CrashPlan/4/Troubleshooting/Backups_Stall_Due_To_Too_Many_Open_Files

// Deps
const Bitswap = require('ipfs-bitswap')
const bs = require('abstract-blob-store')
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const os = require('os')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Q = require('q')
const R = require('ramda')
const Repo = require('ipfs-repo')

// Local deps
const constants = require('./constants')
const { log, logWarn, logError, random } = require('./utils')

// Network constants
const NODE_PORT = constants.basePort

// Node constants
const BOOTSTRAP_CONNS_PER_NODE = 2

// Test network generation
const initNodes = (networkSize) => {
  const result = R.map((idx) => {
    // Peer object creation
    const peerId = PeerId.create({ bits: 128 })  // Note: currently shortened to shrink the test keyspace
    const peer = new PeerInfo(peerId)
    const peerAddr1 = multiaddr(`/ip4/127.0.0.1/tcp/${NODE_PORT + idx}/ipfs/${peer.id.toB58String()}`)

    peer.multiaddr.add(peerAddr1)

    // Libp2p node Creation
    const libNode = new libp2p.Node(peer)

    return { peerInfo: peer, libp2p: libNode }
  }, R.range(0, networkSize))

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

const batchLinkFunctions = (network) => {
  const networkSize = network.length
  const connectionBatchSize = Math.floor(networkSize * 0.8)

  const genPeersToFetch = (len, skipIdx) => {
    return R.map(() => {
      let idxToFetch = random(0, len)
      while (idxToFetch === skipIdx) {
        idxToFetch = random(0, len)
      }
      return idxToFetch
    }, R.range(0, BOOTSTRAP_CONNS_PER_NODE))
  }

  // generate all links
  let curIdx = 0

  const nestedPeerLinkFns = R.map((fromNode) => {
    const fromId = fromNode.peerInfo.id.toB58String()
    const linkPeerIds = genPeersToFetch(networkSize, curIdx)
    const linkPeers = R.map((idx) => network[idx], linkPeerIds)

    // increment the current idx
    curIdx++

    return R.map((toNode) => {
      const toId = toNode.peerInfo.id.toB58String()

      return new Promise((resolve, reject) => {
        fromNode.libp2p.dialByPeerInfo(toNode.peerInfo, (err) => {
          if (err) return reject(err)
          return resolve(fromNode)
        })
      })
    }, linkPeers)
  }, network)

  const linkFns = R.flatten(nestedPeerLinkFns)
  const partitionSize = Math.ceil(linkFns.length / connectionBatchSize)

  let batches = []
  while (linkFns.length) {
    let batch = linkFns.splice(0, partitionSize)
    batches.push(batch)
  }

  log(`Bootstrapping with ${BOOTSTRAP_CONNS_PER_NODE} connections per node`)
  log(`Batching node connections into ${R.length(batches)} batches (~${partitionSize} connections per batch)`)
  return batches
}

const linkNodes = (network) => {
  const batches = batchLinkFunctions(network)
  let result

  batches.forEach(function (batch) {
    result = Q.allSettled(batch)
      .then((data) => {
        const nodes = R.pluck('value', data)
        return Promise.resolve(nodes)
      })
  })

  return result
}

const initNetwork = (size) => {
  const start = new Date()
  log(`Initing ${size} node network`)

  return initNodes(size)
    .then(initNodePeerRepos)
    .then(startNodes)
    .then(initNodeBitswaps)
    .then(linkNodes)
    .then((network) => {
      const end = new Date()
      log(`Initialized ${size} node network (${(end-start) / 1000} seconds)`)
      return { size, network }
    })
    .catch((err) => {
      const end = new Date()
      logError(`Network initialization failure. ${size} nodes failed in ${(end-start) / 1000} seconds`, err.message)
      return Promise.reject(err)
    })
}

module.exports = class Network {
  constructor(config) {
    const size = config.size

    if (size && (R.type(size) !== 'Number')) {
      throw new Error('Network size must be a number')
    }

    this.size = size || 1000
  }

  init() {
    return initNetwork(this.size)
  }
}
