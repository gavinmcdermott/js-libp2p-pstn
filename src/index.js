'use strict'

const R = require('ramda')
const Network = require('./network')

const network = new Network({ size: 5000 })

network.init()
.then((d) => {
  console.log('done with init from the instance')
  process.exit()
})


