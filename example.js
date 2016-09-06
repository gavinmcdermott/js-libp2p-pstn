'use strict'

const Network = require('./src/network')

const network = new Network({ size: 200 })

network.init()
  .then((network) => {
    console.log('demo testnet of ', network.size, 'nodes')
    process.exit()
  })
