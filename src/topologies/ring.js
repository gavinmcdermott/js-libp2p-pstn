'use strict'

const Q = require('q')
const R = require('ramda')

const { log, logError, logProgress, random, resolveAsyncAccum } = require('./../utils')

const TYPE = 'RING'

const mapIndexed = R.addIndex(R.map)

module.exports = {
  type: TYPE,
  init: (nodes) =>  {
    const linkFns = mapIndexed((node, idx) => {
      // set the neighbor node
      const neighborId = idx + 1
      const neighborNode = nodes[neighborId] ? nodes[neighborId] : nodes[0]

      // console.log(nodes[neighborId] ?
      //   `FROM: ${idx} ${node.peerInfo.id.toB58String()} => TO: ${neighborId} ${neighborNode.peerInfo.id.toB58String()}`
      //   : `FROM: ${idx} ${node.peerInfo.id.toB58String()} => TO: 0 ${neighborNode.peerInfo.id.toB58String()}`)

      return new Promise((resolve, reject) => {
        node.libp2p.dialByPeerInfo(neighborNode.peerInfo, (err) => {
          if (err) return reject(err)
          return resolve(node)
        })
      })
    }, nodes)

    log(`Resolving ${R.length(linkFns)} links in ${TYPE} topology`)

    // return a promise with all connected nodes
    return resolveAsyncAccum(linkFns).then((connected) => {
      return connected
    })
  }
}
