'use strict'

// Note on open file limits in OSX
// https://support.code42.com/CrashPlan/4/Troubleshooting/Backups_Stall_Due_To_Too_Many_Open_Files

const Bitswap = require('ipfs-bitswap')
const bs = require('abstract-blob-store')
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const os = require('os')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const R = require('ramda')
const Repo = require('ipfs-repo')
const util = require('util')

const CONFIG  = require('./config')
const Topology = require('./../topologies/topology')
const { log, logWarn, logError, logProgress } = require('./../utils')

const createNodes = (size) => {
  const nodes = R.map((idx) => {
    // Peer object creation
    const peerId = PeerId.create({ bits: CONFIG.KEY_SIZE })
    const peer = new PeerInfo(peerId)
    const peerAddr1 = multiaddr(`/ip4/127.0.0.1/tcp/${CONFIG.BASE_PORT + idx}/ipfs/${peer.id.toB58String()}`)

    peer.multiaddr.add(peerAddr1)

    // Libp2p node Creation
    const libNode = new libp2p.Node(peer)

    return { peerInfo: peer, libp2p: libNode }
  }, R.range(0, size))

  log(`${size} nodes created`)
  return Promise.resolve(nodes)
}

const initNodePeerRepos = (nodes) => {
  const tmpDir = os.tmpdir()

  const result = R.map((peer) => {
    const repoPath = `${tmpDir}/${peer.peerInfo.id.toB58String()}`
    peer.repo = new Repo(repoPath, { stores: bs })
    return peer
  }, nodes)

  log(`All node peer repos initialized`)
  return Promise.resolve(nodes)
}

const startNodes = (nodes) => {
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
      return nodes
    })
}

const initNodeBitswaps = (nodes) => {
  const result = R.map((peer) => {
    peer.bitswap = new Bitswap(peer.peerInfo, peer.libp2p, peer.repo.datastore, peer.peerBook)
    return peer
  }, nodes)

  return Promise.resolve(nodes)
}

module.exports = class Network {
  constructor(config={}) {
    // network size
    if (R.type(config.size) !== 'Number') {
      throw new Error('Network size must be a valid NUMBER')
    }
    this._size = config.size

    // network topology
    if (!(config.topology instanceof Topology)) {
      throw new Error('Network topology must be a valid TOPOLOGY instance')
    }
    this._topology = config.topology
  }

  _initNodes() {
    return createNodes(this.size)
      .then(initNodePeerRepos)
      .then(startNodes)
      .then(initNodeBitswaps)
      .then((nodes) => {
        this.nodes = nodes
        return this
      })
  }

  init() {
    log(`Initializing a ${this.size} node network`)
    const start = new Date()

    return this._initNodes()
      .then(() => this.topology.init(this.nodes))
      .then((topology) => {
        const finish = new Date()
        log(`Initialized ${topology.length} node network (${(finish-start) / 1000}s)`)
        return this
      })
      .catch((err) => {
        logError(err)
        process.exit()
      })
  }

  get nodes() {
    return this._nodes
  }

  set nodes(nodes) {
    this._nodes = nodes
    return this._nodes
  }

  get size() {
    return this._size
  }

  get topology() {
    return this._topology
  }
}
