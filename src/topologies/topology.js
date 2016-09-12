'use strict'

const R = require('ramda')

module.exports = class Topology {
  constructor(topology) {
    if (R.isNil(topology.type)) {
      throw new Error('Topology type must be a valid STRING')
    }

    if (R.type(topology.init) !== 'Function') {
      throw new Error('Topology init must be a valid FUNCTION')
    }

    this._type = topology.type
    this._init = topology.init
  }

  init(nodes) {
    if (R.isNil(nodes)) {
      throw new Error('Topology init expects network nodes to connect')
    }
    return this._init(nodes)
  }

  get type() { return this._type }
}
