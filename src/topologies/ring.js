'use strict'

const Q = require('q')
const R = require('ramda')

const { log, logError, logProgress, random } = require('./../utils')

const TYPE = 'RING'

const resolveAsyncFns = (fns) => {
  const fn = R.head(fns.splice(0, 1))
  logProgress(`Remaining links to create: ${fns.length}`)

  if (!fns.length) return true

  // delay is needed to stop node from keeling over
  return Q.delay(6).then(fn).then(() => resolveAsyncFns(fns))
}

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
    return resolveAsyncFns(linkFns).then((allResolved) => {
      return nodes
    })
  }
}
