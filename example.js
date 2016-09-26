'use strict'

const { Network, topologies } = require('./src/index')
const size = 4000
const topology = topologies['RING']  // valid topology type

// init the network with a size and Topology instance
const network = new Network({ size, topology })

network.init().then((initializedNetwork) => {
  /* do something awesome! */
  process.exit()
})