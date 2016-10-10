'use strict'

const R = require('ramda')
const util = require('util')
const topo = require('libp2p-pstn-topo-ring')
// const topo = require('libp2p-pstn-topo-partialmesh')
// Note: require('libp2p-floodsub') throws: Cannot find module 'libp2p-floodsub'
const PS = require('./node_modules/libp2p-floodsub/src')
const Testnet = require('./src')

const NETWORK_SIZE = 12
const network = new Testnet({ size: NETWORK_SIZE, pubsub: PS })
// Immediately start the network
network.start()

let nodeA
let nodeB

let running = false

function run() {

  if (running) return
  running = true

  network.setTopology(topo)
    .then((network) => {
      nodeA = network.nodes[0]
      nodeB = network.nodes[1]

      nodeB.pubsub.subscribe('A')
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(network)
        }, 3000)
      })
    })
    .then((network) => {
      nodeA.pubsub.subscribe('A')

      setTimeout(() => {
        nodeB.pubsub.publish('A', 'A note here :)')
      }, 1000)

      setTimeout(() => {
        nodeB.pubsub.publish('A', 'WHAT IS THIS NOTE???')
      }, 2500)

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(network.stats)
        }, 3500)
      })
    })
    .then((stats) => {
      running = false
      console.log('=======================================')
      console.log('TESTNET STATS')
      console.log('=======================================')
      console.log(util.inspect(stats.topicLog, {depth: 6}))
    })
    .catch((err) => {
      running = false
      console.log(err)
    })
}

module.exports = { network, run }
