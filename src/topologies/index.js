'use strict'

const R = require('ramda')

const Topology = require('./topology')
const partialMesh = require('./partialMesh')
const ring = require('./ring')
const nClusters = require('./nClusters')
// TODO: add more topologies
// const minSpanTree = require('./minSpanTree')

const implementations = [partialMesh, ring, nClusters]

let topologies = {}

R.forEach((implementation) => {
  let t = new Topology(implementation)
  topologies[t.type] = t
}, implementations)

module.exports = topologies
