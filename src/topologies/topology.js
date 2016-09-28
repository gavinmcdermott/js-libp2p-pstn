'use strict'

const R = require('ramda')
// const Node = require('./../nodes/index')
const Node = require('libp2p-pstn-node')

module.exports = class Topology {
  constructor(topology) {
    if (R.isNil(topology.type)) {
      throw new Error('Topology constructor error: type must be a valid STRING')
    }

    if (R.type(topology.init) !== 'Function') {
      throw new Error('Topology constructor error: init must be a valid FUNCTION')
    }

    this._type = topology.type
    this._init = topology.init
  }

  init(nodes) {
    if (R.isNil(nodes) || !R.isArrayLike(nodes)) {
      throw new Error('Topology init expects array of valid NODEs to connect')
    }
    if (!(R.head(nodes) instanceof Node)) {
      throw new Error('Topology init expects valid NODE instances')
    }
    return this._init(nodes)
  }

  get type() { return this._type }
}
