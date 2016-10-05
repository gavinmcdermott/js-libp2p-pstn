'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')
const PubsubStats = require('libp2p-pstn-stats')
const ringTopo = require('libp2p-pstn-topo-ring')
// Note: require('libp2p-floodsub') throws: Cannot find module 'libp2p-floodsub'
const PS = require('./node_modules/libp2p-floodsub/src')

const Testnet = require('./src')
const logPath = path.resolve(__dirname, './logs/log.log')



const size = 10




// init the network with a size and Topology instance
const network = new Testnet({ size, pubsub: PS })

let nodeA
let nodeB

network.start()
  .then((network) => network.setTopology(ringTopo))
  .then((network) => {
    console.log('>', network)

    console.log('heres hte network')
    nodeA = network.nodes[0]
    nodeB = network.nodes[1]

    nodeB.pubsub.subscribe('A')

    console.log('B sub A')

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(network)
      }, 3000)
    })
  })
  .then((network) => {
    const nodeA = network.nodes[0]
    const nodeB = network.nodes[1]
    // const nodeC = R.last(network.nodes)
    // console.log(nodeC)

    // nodeB.pubsub.subscribe('A')
    nodeA.pubsub.subscribe('A')
    // nodeB.pubsub.unsubscribe('A')

    setTimeout(() => {
      // console.log(nodeB.pubsub.getPeerSet())
      // console.log(nodeA.pubsub.getPeerSet())

      // nodeB.pubsub.publish('A', 'kdjnas ejqw jasknj')
      nodeA.pubsub.publish('A', 'somerhing else')
      nodeB.pubsub.publish('A', 'A note here :)')
      console.log('pub')
    }, 1500)

    return new Promise((resolve) => {
      setTimeout(() => {
        // nodeB.pubsub.publish('A', 'kdjnas ejqw jasknj')
        // nodeA.pubsub.publish('A', 'somerhing else')
        console.log('maybe receive')
        resolve()
      }, 3000)
    })
  })
  .then(() => {
    const sampleLog = fs.readFileSync(logPath)
    const foo = new PubsubStats(sampleLog)
    console.log(util.inspect(foo.topicLog, {depth: 6}))
    // console.log('========================================================================')
    // console.log(util.inspect(foo.eventLog, {depth: 6}))
    console.log('========================================================================')
    console.log(foo.stats)
    process.exit()
  })

