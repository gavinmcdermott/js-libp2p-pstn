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
// const Q = require('q')
const R = require('ramda')
const Repo = require('ipfs-repo')
const util = require('util')

// Local deps

// various network topologies to use
const topologies = require('./topologies/index')
const topologyTypes = R.keys(topologies)

//
const { DEFAULTS }  = require('./constants')
const { log, logWarn, logError, logProgress } = require('./utils')

// Defaults
const KEY_SIZE = DEFAULTS.KEY_SIZE
const BASE_PORT = DEFAULTS.BASE_PORT
const NODE_BOOTSTRAP_COUNT = DEFAULTS.NODE_BOOTSTRAP_COUNT

// Test network initialization

const initNodes = (network) => {
  const nodes = R.map((idx) => {
    // Peer object creation
    const peerId = PeerId.create({ bits: KEY_SIZE })
    const peer = new PeerInfo(peerId)
    const peerAddr1 = multiaddr(`/ip4/127.0.0.1/tcp/${BASE_PORT + idx}/ipfs/${peer.id.toB58String()}`)

    peer.multiaddr.add(peerAddr1)

    // Libp2p node Creation
    const libNode = new libp2p.Node(peer)

    return { peerInfo: peer, libp2p: libNode }
  }, R.range(0, network.size))

  // Set nodes on the network instance
  network.nodes = nodes

  log(`All nodes initialized`)
  return Promise.resolve(network)
}

const initNodePeerRepos = (network) => {
  const nodes = network.nodes
  const tmpDir = os.tmpdir()

  const result = R.map((peer) => {
    const repoPath = `${tmpDir}/${peer.peerInfo.id.toB58String()}`
    peer.repo = new Repo(repoPath, { stores: bs })
    return peer
  }, nodes)

  log(`All node peer repos initialized`)
  return Promise.resolve(network)
}

const startNodes = (network) => {
  const nodes = network.nodes

  const nodeStartPromises = R.map((peer) => {
    return new Promise((resolve, reject) => {
      peer.libp2p.start((err) => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }, nodes)

  return Promise.all(nodeStartPromises)
    .then((results) => {
      log(`${R.length(results)} nodes started`)
      return network
    })
}

const initNodeBitswaps = (network) => {
  const nodes = network.nodes

  const result = R.map((peer) => {
    peer.bitswap = new Bitswap(peer.peerInfo, peer.libp2p, peer.repo.datastore, peer.peerBook)
    return peer
  }, nodes)

  return Promise.resolve(network)
}

const initTopology = (network) => {
  return network.topology.init(network)
}

const initNetwork = (network) => {
  const start = new Date()
  const size = network.size

  return initNodes(network)
    .then(initNodePeerRepos)
    .then(startNodes)
    .then(initNodeBitswaps)
    .then(initTopology)
    .then((initializedNetwork) => {
      const finish = new Date()
      const totalNodes = initializedNetwork.nodes.length
      log(`Initialized ${totalNodes} node network (${(finish-start) / 1000}s)`)
      if (totalNodes !== size) {
        logWarn(`Initialized network size (${totalNodes}) was different from the anticipated size (${size})`)
      }
      return initializedNetwork
    })
    .catch((err) => {
      logError(err)
      process.exit()
    })
}

module.exports = class Network {
  constructor(config={}) {
    this.config = config

    // nodes are initialized explicitly via init call
    this._nodes = null

    // network size
    const size = config.size
    if (size && (R.type(size) !== 'Number')) {
      throw new Error('Network size must be a number')
    }
    this._size = size || DEFAULTS.SIZE

    // network topology
    const topology = config.topology
    // TODO: start extracting error classes (e.g.: topology errors)
    if (topology && !R.contains(topology, topologyTypes)) {
      throw new Error(`Must use a recognized topology: ${util.format('%j', topologyTypes)}`)
    }
    this._topology = topology || topologies.partialMesh
  }

  init() {
    log(`Initializing a ${this.size} node network`)
    return initNetwork(this)
  }

  set nodes(nodes) {
    this._nodes = nodes
  }

  get nodes() {
    return this._nodes
  }

  set size(size) {
    return this._size = size
  }

  get size() {
    return this._size
  }

  set topology(topology) {
    if (topology && !R.contains(topology, topologyTypes)) {
      throw new Error(`Must use a recognized topology: ${util.format('%j', topologyTypes)}`)
    }
    this._topology = topology
    return this
  }

  get topology() {
    return this._topology
  }
}
