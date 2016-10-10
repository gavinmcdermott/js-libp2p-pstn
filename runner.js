'use strict'

const util = require('util')
const topo = require('libp2p-pstn-topo-ring')
// const topo = require('libp2p-pstn-topo-partialmesh')
// Note: require('libp2p-floodsub') throws: Cannot find module 'libp2p-floodsub'
const PS = require('./node_modules/libp2p-floodsub/src')
const Testnet = require('./src')

const NETWORK_SIZE = 12

const network = new Testnet({ size: NETWORK_SIZE, pubsub: PS })


let nodeA
let nodeB


function run() {
  network.start()
    .then((network) => {
      console.log('starting!!!!')
      return network.setTopology(topo)
    })
    .then((network) => {
      console.log('connecting!!!!')

      network.emit('connected', network.nodes)

      nodeA = network.nodes[0]
      nodeB = network.nodes[1]

      nodeB.pubsub.subscribe('A')
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('subs done')
          resolve(network)
        }, 3000)
      })
    })
    .then((network) => {
      nodeA.pubsub.subscribe('A')
      setTimeout(() => {
        console.log('first pubs')
        nodeB.pubsub.publish('A', 'A note here :)')
      }, 1000)

      setTimeout(() => {
        nodeA.pubsub.publish('A', 'somerhing else')
      }, 2500)

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(network.stats)
        }, 2000)
      })
    })
    .then((stats) => {
      console.log(util.inspect(stats.topicLog, {depth: 6}))
      // process.exit()
    })
}

module.exports = { network, run }
