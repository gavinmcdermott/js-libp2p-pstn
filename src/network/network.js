'use strict'

// Note on open file limits in OSX
// https://support.code42.com/CrashPlan/4/Troubleshooting/Backups_Stall_Due_To_Too_Many_Open_Files

const Q = require('q')
const R = require('ramda')
const Node = require('libp2p-pstn-node')

const Topology = require('./../topologies/topology')
const { debug, logProgress } = require('./../utils')
const pregenKeys = require('./../../fixtures/keys').keys

const log = debug('pstn:network')
log.err = debug('pstn:network:error')

module.exports = class Network {
  constructor(config={}) {
    // network size
    if (R.type(config.size) !== 'Number') {
      throw new Error('Network constructor error: size must be a valid NUMBER')
    }
    if (config.size > pregenKeys.length) {
      throw new Error('Network constructor error: size must not exceed total pregenerated keys ('+pregenKeys.length+')')
    }
    this._size = config.size

    // network topology
    if (!(config.topology instanceof Topology)) {
      throw new Error('Network constructor error: topology must be a valid TOPOLOGY instance')
    }
    this._topology = config.topology

    // network node instances
    this.nodes = R.map((idx) => {
      const options = {
        id: pregenKeys[idx],
        portOffset: idx
      }
      return new Node(options)
    }, R.range(0, this.size))
  }

  init() {
    log(`Initializing a ${this.size} node network`)
    const start = new Date()
    const nodeInits = R.map((n) => n.start(), this.nodes)

    return Q.allSettled(nodeInits)
      .then(() => this.topology.init(this.nodes))
      .then((nodes) => {
        const finish = new Date()
        log(`Initialized ${nodes.length} node network (${(finish-start) / 1000}s)`)
        return this
      })
      .catch((err) => {
        log.err(err)
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
