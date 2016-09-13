'use strict'

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
const { log, logWarn, logError, logProgress } = require('./../utils')

module.exports = class Node {
  constructor(offset) {
    if (R.type(offset) !== 'Number') {
      throw new Error('Node constructor error: Node offset must be a valid NUMBER')
    }

    let peerInstance
    let libp2pInstance
    let repoInstance
    let bitswapInstance

    try {
      // Peer info
      const peerId = PeerId.create({ bits: CONFIG.KEY_SIZE })
      peerInstance = new PeerInfo(peerId)
      const peerAddr1 = multiaddr(`/ip4/127.0.0.1/tcp/${CONFIG.BASE_PORT + offset}/ipfs/${peerInstance.id.toB58String()}`)
      peerInstance.multiaddr.add(peerAddr1)

      // Libp2p node info
      libp2pInstance = new libp2p.Node(peerInstance)

      // object storage
      const tmpDir = os.tmpdir()
      const repoPath = `${tmpDir}/${peerInstance.id.toB58String()}`
      repoInstance = new Repo(repoPath, { stores: bs })

      // bitswap instance
      bitswapInstance = new Bitswap(peerInstance, libp2pInstance, repoInstance.datastore, peerInstance.peerBook)
    } catch (err) {
      throw new Error('Node constructor error: ', err)
    }

    this.peerInfo = peerInstance
    this.libp2p = libp2pInstance
    this.repo = repoInstance
    this.bitswap = bitswapInstance
  }

  init() {
    return new Promise((resolve, reject) => {
      this.libp2p.start((err) => {
        if (err) {
          // TODO: what is the best way to handle failures?
          // do we remove them from the network?
          logError(`Node ${this.peerInfo.id.toB58String()} was unable to init`)
          return reject(err)
        }
        return resolve(this)
      })
    })
  }
}
