'use strict'

const Q = require('q')
const R = require('ramda')

const { log, logError, logProgress, random, resolveWithTailRec } = require('./../utils')

const TYPE = 'RING'

module.exports = {
  type: TYPE,
  init: (nodes) =>  {

    let curId = 0

    const linkFns = R.map((node) => {
      // set the neighbor node
      const neighborId = curId + 1
      const neighborNode = nodes[neighborId] ? nodes[neighborId] : nodes[0]

      // increment the counter before returning
      curId++

      return new Promise((resolve, reject) => {
        node.libp2p.dialByPeerInfo(neighborNode.peerInfo, (err) => {
          if (err) return reject(err)
          return resolve(node)
        })
      })
    }, nodes)

    log(`Resolving ${R.length(linkFns)} links in ${TYPE} topology`)

    // return a promise with all connected nodes
    return resolveWithTailRec(linkFns).then((allResolved) => {
      return nodes
    })
  }
}
