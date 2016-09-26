'use strict'

const Q = require('q')
const R = require('ramda')

const { log, logError, logProgress, random, resolveAsyncAccum } = require('./../utils')

const TYPE = 'RING'

const mapIndexed = R.addIndex(R.map)

module.exports = {
  type: TYPE,
  init: (nodes) =>  {
    const totalNodes = nodes.length

    const linkFns = mapIndexed((node, idx) => {
      // set the neighbor node
      const neighborIdx = (idx + 1) % totalNodes
      const neighborNode = nodes[neighborIdx]
      // console.log(`FROM: ${idx} ${node.peerInfo.id.toB58String()} => TO: ${neighborIdx} ${neighborNode.peerInfo.id.toB58String()}`)

      return new Promise((resolve, reject) => {
        node.libp2p.dialByPeerInfo(neighborNode.peerInfo, (err) => {
          if (err) return reject(err)
          return resolve(node)
        })
      })
    }, nodes)

    log(`Resolving ${R.length(linkFns)} links in ${TYPE} topology`)

    // return a promise with all connected nodes
    return resolveAsyncAccum(linkFns).then(() => nodes)
  }
}
