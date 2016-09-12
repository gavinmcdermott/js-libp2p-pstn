'use strict'

const Q = require('q')
const R = require('ramda')

const { log, logError, logProgress, random } = require('./../utils')

const BOOTSTRAP_PEER_COUNT = 2

const genPeersToFetch = (len, skipIdx, maxPeers) => {
  return R.map(() => {
    let idxToFetch = random(0, len)
    while (idxToFetch === skipIdx) {
      idxToFetch = random(0, len)
    }
    return idxToFetch
  }, R.range(0, maxPeers))
}

const resolveLinkConnection = (fns) => {
  const fn = R.head(fns.splice(0, 1))
  logProgress(`Remaining network links to create: ${fns.length}`)

  if (!fns.length) return true

  // delay is needed to stop node from keeling over
  return Q.delay(6).then(fn).then(() => resolveLinkConnection(fns))
}

module.exports = {
  type: 'PARTIAL_MESH',
  init: (nodes) => {
    const size = nodes.length

    // pseudo-randomly generate all peer links
    let curIdx = 0

    const nestedPeerLinkFns = R.map((fromNode) => {
      const fromId = fromNode.peerInfo.id.toB58String()
      const linkPeerIds = genPeersToFetch(size, curIdx, BOOTSTRAP_PEER_COUNT)
      const linkPeers = R.map((idx) => nodes[idx], linkPeerIds)

      // increment the current idx
      curIdx++

      return R.map((toNode) => {
        const toId = toNode.peerInfo.id.toB58String()

        return new Promise((resolve, reject) => {
          fromNode.libp2p.dialByPeerInfo(toNode.peerInfo, (err) => {
            if (err) return reject(err)
            return resolve(fromNode)
          })
        })
      }, linkPeers)
    }, nodes)

    const linkFns = R.flatten(nestedPeerLinkFns)

    log(`Resolving ${R.length(linkFns)} links between nodes`)

    return resolveLinkConnection(linkFns).then((allResolved) => {
      return nodes
    })
  }
}
