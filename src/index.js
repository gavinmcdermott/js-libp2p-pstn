'use strict'

// Note on open file limits in OSX
// https://support.code42.com/CrashPlan/4/Troubleshooting/Backups_Stall_Due_To_Too_Many_Open_Files

const fs = require('fs')
const path = require('path')
const Q = require('q')
const R = require('ramda')
const libp2p = require('libp2p-ipfs')
const multiaddr = require('multiaddr')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const addLogger = require('libp2p-pstn-logger')
const PubsubStats = require('libp2p-pstn-stats')

const keys = require('./../fixtures/keys').keys
const logPath = path.resolve(__dirname, './../logs/log.log')

const { TestNetError } = require('./errors')
const { log, PORT } = require('./config')

function createNodes (config) {
  const PS = config.pubsub
  const size = config.size

  return R.map((idx) => {
    // Use pregenerated keys
    const privKey = keys[idx].privKey

    // Peer info
    const peerId = PeerId.createFromPrivKey(privKey)
    const peerInstance = new PeerInfo(peerId)
    const peerAddr1 = multiaddr(`/ip4/127.0.0.1/tcp/${PORT+idx}/ipfs/${peerInstance.id.toB58String()}`)
    peerInstance.multiaddr.add(peerAddr1)

    // Libp2p info
    const libp2pInstance = new libp2p.Node(peerInstance)

    // The network node instance
    let node = {
      peerInfo: peerInstance,
      libp2p: libp2pInstance,
      id: peerInstance.id.toB58String(),
      pubsub: PS(libp2pInstance),
    }
    // Add test logging
    addLogger(node.pubsub, node.id)
    // Add the node to the network
    return node
  }, R.range(0, size))
}

module.exports = class Network {
  constructor (config={}) {
    // network size
    if (R.type(config.size) !== 'Number') {
      throw new TestNetError(`Size must be <number>`)
    }

    if (config.size > keys.length) {
      throw new TestNetError(`Size must not exceed existing pregenerated keys (${keys.length})`)
    }
    this._size = config.size

    if (R.isNil(config.pubsub) || !R.equals(typeof(config.pubsub), 'function')) {
      throw new TestNetError(`Invalid pubsub`)
    }

    this._nodes = createNodes(config)

    log('Testnet instance created')
  }

  start () {
    log('Testnet nodes being started')

    const nodeStarts = R.map((node) => {
      return new Promise((resolve, reject) => {
        node.libp2p.start((err) => {
          if (err) return reject(err)
          return resolve(node)
        })
      })
    }, this.nodes)

    return Promise.all(nodeStarts)
      .then((nodes) => {
        log('Testnet nodes started')
        return this
      })
      .catch((err) => {
        log.err(err)
        process.exit()
      })
  }

  setTopology (fn) {
    if (R.isNil(typeof(fn.then))) {
      throw new TestNetError('Topology must return a promise')
    }
    log('Testnet topology being set')
    const self = this
    return fn(this.nodes).then(() => {
      // Resolve after a short timeout to allow the p2p conns to establish
      return new Promise((resolve) => {
        log('Testnet topology set')
        setTimeout(() => {
          resolve(self)
        }, 2500)
      })
    })
  }

  get stats () {
    const log = fs.readFileSync(logPath)
    return new PubsubStats(log)
  }

  get nodes () {
    return this._nodes
  }

  get size () {
    return this._size
  }
}
