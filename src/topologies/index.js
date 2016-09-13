'use strict'

const R = require('ramda')

const Topology = require('./topology')
const partialMesh = require('./partialMesh')
// TODO: add more topologies :)
// const minSpanTree = require('./minSpanTree')
// const nClusters = require('./nClusters')
// const ring = require('./ring')

const implementations = [partialMesh]

let topologies = {}

R.forEach((implementation) => {
  let t = new Topology(implementation)
  topologies[t.type] = t
}, implementations)

module.exports = topologies
