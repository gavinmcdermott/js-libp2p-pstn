'use strict'

const { Network, topologies } = require('./src/index')
const size = 1000
const topology = topologies['PARTIAL_MESH']  // valid topology type

// init the network with a size and Topology instance
const network = new Network({ size, topology })

network.init().then((initializedNetwork) => {
  /* do something awesome! */
  process.exit()
})