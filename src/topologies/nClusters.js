'use strict'

const Q = require('q')
const R = require('ramda')

const { log, logError, logProgress, random, resolveAsyncAccum } = require('./../utils')

const TYPE = 'N_CLUSTERS'

const NODES_PER_CLUSTER = 30

const forEachIndexed = R.addIndex(R.forEach)
const mapIndexed = R.addIndex(R.map)

const buildClusters = (nodes) => {
  let clusters = []
  let cloned = nodes.slice(0)

  while (cloned.length) {
    let cluster = cloned.splice(0, NODES_PER_CLUSTER)
    clusters.push(cluster)
  }

  return clusters
}

const generateInClusterRingConn = (index, node, cluster) => {
  // set the neighbor node
  if (cluster.length <= 1) return null

  const neighborNodeId = index + 1
  const neighborNode = cluster[neighborNodeId] ? cluster[neighborNodeId] : cluster[0]

  return new Promise((resolve, reject) => {
    node.libp2p.dialByPeerInfo(neighborNode.peerInfo, (err) => {
      if (err) return reject(err)
      return resolve(node)
    })
  })
}

const generateHeadToNeighborClusterConn = (curNode, curClusterIdx, clusters) => {
  const totalClusters = clusters.length
  const clusterIdxToConnect = (curClusterIdx + 1) % totalClusters
  const neighborCluster = clusters[clusterIdxToConnect]
  const neighborClusterNode = neighborCluster[0]

  return new Promise((resolve, reject) => {
    curNode.libp2p.dialByPeerInfo(neighborClusterNode.peerInfo, (err) => {
      if (err) return reject(err)
      return resolve(curNode)
    })
  })
}

module.exports = {
  type: TYPE,
  init: (nodes) =>  {
    const totalNodes = nodes.length
    const clusters = buildClusters(nodes)
    const totalClusters = clusters.length

    console.log('totalNodes', totalNodes)
    console.log('totalClusters', totalClusters)

    const clusterConns = mapIndexed((cluster, clusterIdx) => {
      // build all necessary connection functions for a given cluster
      let connectionFns = []

      forEachIndexed((node, nodeIdx) => {
        const nodeIsClusterHead = (nodeIdx === 0)

        // Generate the in-cluster ring connection for the node
        const inClusterConn = generateInClusterRingConn(nodeIdx, node, cluster)
        if (inClusterConn) connectionFns.push(inClusterConn)

        // Only generate cluster-to-cluster connections if there are multiple clusters
        if (NODES_PER_CLUSTER > totalNodes) return true

        // The current implementation connects the lead in the ring to the head
        // in the neighboring cluster...rings in rings my friend
        // TODO: add some more config to this naive implementation
        if (nodeIsClusterHead) {
          let nodeToClusterConn = generateHeadToNeighborClusterConn(node, clusterIdx, clusters)
          connectionFns.push(nodeToClusterConn)
        }
      }, cluster)

      // Return the connection functions from all clusters
      return connectionFns
    }, clusters)

    const linkFns = R.flatten(clusterConns)

    log(`Resolving ${R.length(linkFns)} links in ${TYPE} topology`)

    return resolveAsyncAccum(linkFns).then(() => nodes)
  }
}
