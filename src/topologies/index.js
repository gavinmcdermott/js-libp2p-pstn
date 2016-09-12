'use strict'

const R = require('ramda')

const Topology = require('./topology')
const partialMesh = require('./partialMesh')
// const minSpanTree = require('./minSpanTree')
// const nClusters = require('./nClusters')
// const ring = require('./ring')

const topologyImplementations = [partialMesh]

module.exports = R.map((topology) => {
  return new Topology(topology)
}, topologyImplementations)
