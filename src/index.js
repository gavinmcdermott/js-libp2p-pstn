'use strict'

const Network = require('./network')

const network = new Network()

network.init()
  .then((network) => {
    console.log('demo testnet of ', network.size, 'nodes')
    process.exit()
  })
