// 'use strict'

// const expect = require('chai').expect
// const R = require('ramda')

// const testUtils = require('./testUtils')
// const Network = require('./../src')

// const createTopo = require('libp2p-pstn-topo-ring')

// const size = 10



// const missingSize = {}
// const validConfig = { size }

// describe('Network', () => {
//   let network

//   // Must kill connections for further other tests!
//   after(() => {
//     R.forEach((node) => node.libp2p.swarm.close(), network.nodes)
//   })

//   it('fails without a size', () => {
//     let thrower = () => new Network(missingSize)
//     expect(thrower).to.throw()
//   })

//   it('succeeds', () => {
//     network = new Network(validConfig)
//     expect(network instanceof Network).to.be.true
//   })

//   it(`init`, () => {
//     return network.init().then((instance) => {
//       expect(instance).to.exist
//       expect(instance.size).to.equal(validConfig.size)
//       expect(instance.nodes.length).to.equal(validConfig.size)
//     })
//   })
// })
