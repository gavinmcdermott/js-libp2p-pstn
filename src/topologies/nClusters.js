'use strict'

const Q = require('q')
const R = require('ramda')

const { log, logError, logProgress, random, resolveAsyncAccum } = require('./../utils')

const TYPE = 'N_CLUSTERS'

const NODES_PER_CLUSTER = 30

const UNIQ_CLUSTER_TO_CLUSTER_CONNS = 1

const forEachIndexed = R.addIndex(R.forEach)
const mapIndexed = R.addIndex(R.map)

const buildClusters = (nodes) => {
  let clusters = []
  let currentCluster = []

  const length = nodes.length

  forEachIndexed((node, idx) => {
    const ringMod = idx % NODES_PER_CLUSTER

    // if the mod is 0 and we're not at the first cluster, start a new cluster
    if (R.equals(ringMod, 0) && (idx > 0)) {
      clusters.push(currentCluster)
      currentCluster = []
    }

    // If the last node, add current cluster and return
    if (R.equals(idx, length - 1)) {
      currentCluster.push(node)
      clusters.push(currentCluster)
      return false
    }

    currentCluster.push(node)
  }, nodes)

  return clusters
}

module.exports = {
  type: TYPE,
  init: (nodes) =>  {

    // TODO: improve the initial naive implementation to handle more unique connections than nodes per cluster
    if (UNIQ_CLUSTER_TO_CLUSTER_CONNS > NODES_PER_CLUSTER) {
      throw new Error(`Topology Error: UNIQ_CLUSTER_TO_CLUSTER_CONNS (${UNIQ_CLUSTER_TO_CLUSTER_CONNS}) expected to be less than NODES_PER_CLUSTER (${NODES_PER_CLUSTER})`)
    }

    const clusters = buildClusters(nodes)
    const totalClusters = clusters.length
    const totalNodes = nodes.length

    const clusterConns = mapIndexed((cluster, clusterIdx) => {
      // build all necessary connection functions for a given cluster
      let connectionFns = []

      // keep track of how many cluster-to-cluster connections we need to build
      let clusterToClusterConnCount = 0

      forEachIndexed((node, nodeIdx) => {
        // In-cluster connections

        // set the neighbor node
        const neighborNodeId = nodeIdx + 1
        const neighborNode = cluster[neighborNodeId] ? cluster[neighborNodeId] : cluster[0]

        // Always add a connection fn to connect a node to their
        // neighbor within the same cluster
        const nodeInRingNeighborConn = new Promise((resolve, reject) => {
          node.libp2p.dialByPeerInfo(neighborNode.peerInfo, (err) => {
            if (err) return reject(err)
            return resolve(node)
          })
        })
        connectionFns.push(nodeInRingNeighborConn)

        // Cluster-to-cluster connections
        if (NODES_PER_CLUSTER < totalNodes) {

          // Initial naive implementaton picks pseudo-random clusters
          let selectedClusters = [clusterIdx]

          while (clusterToClusterConnCount < UNIQ_CLUSTER_TO_CLUSTER_CONNS) {
            let clusterIdxToConnect = random(0, totalClusters)

            while (R.contains(clusterIdxToConnect, selectedClusters)) {
              clusterIdxToConnect = random(0, totalClusters)
            }
            // make sure to not use the cluster again
            selectedClusters.push(clusterIdxToConnect)

            const neighborCluster = clusters[clusterIdxToConnect]
            const neighborClusterNode = neighborCluster[nodeIdx]

            // Add the neighbor cluster connection
            const clusterToClusterConn = new Promise((resolve, reject) => {
              node.libp2p.dialByPeerInfo(neighborClusterNode.peerInfo, (err) => {
                if (err) return reject(err)
                return resolve(node)
              })
            })
            connectionFns.push(clusterToClusterConn)

            // increment the
            clusterToClusterConnCount++
          }
        }
      }, cluster)

      // Return the connection functions from all clusters
      return connectionFns
    }, clusters)

    const linkFns = R.flatten(clusterConns)

    log(`Resolving ${R.length(linkFns)} links in ${TYPE} topology`)

    return resolveAsyncAccum(linkFns).then(() => {
      return nodes
    })
  }
}
