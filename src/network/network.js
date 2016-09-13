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
const Q = require('q')
const R = require('ramda')
const Repo = require('ipfs-repo')
const util = require('util')

// const CONFIG  = require('./config')
const Topology = require('./../topologies/topology')
const Node = require('./../nodes/index')
const { log, logWarn, logError, logProgress } = require('./../utils')

module.exports = class Network {
  constructor(config={}) {
    // network size
    if (R.type(config.size) !== 'Number') {
      throw new Error('Network constructor error: size must be a valid NUMBER')
    }
    this._size = config.size

    // network topology
    if (!(config.topology instanceof Topology)) {
      throw new Error('Network constructor error: topology must be a valid TOPOLOGY instance')
    }
    this._topology = config.topology

    // network node instances
    this.nodes = R.map((offset) => new Node(offset), R.range(0, this.size))
  }

  init() {
    log(`Initializing a ${this.size} node network`)
    const start = new Date()
    const nodeInits = R.map((n) => n.init(), this.nodes)

    return Q.allSettled(nodeInits)
      .then(() => this.topology.init(this.nodes))
      .then((nodes) => {
        const finish = new Date()
        log(`Initialized ${nodes.length} node network (${(finish-start) / 1000}s)`)
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
