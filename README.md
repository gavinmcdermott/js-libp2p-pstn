# PubSub Testnet (a utility for libp2p)
#### 

The Pubsub Testnet is a utility (*still in early, active development*) for initializing a arbitrary networks of a few thousand [libp2p nodes](https://github.com/libp2p/js-libp2p) connected by some specified topology (this size will increase dramatically as things progress). It provides useful interfaces, tools, and statistics to make designing and implementing network messaging strategies/algorithms easier.

## Purpose

The initial purpose of this utility is to to make the development, testing, debugging, and implementation of messaging ('PubSub') strategies in [IPFS](http://ipfs.io/) a delightful experience that's *fun for the whole family!* ™

## Tests

After `npm install`-ing your dependencies, simply run `> npm test`


## Abstractions

### Network
The Network abstraction enables you to work with the network as a whole. It is comprised of `Nodes` and takes the form of a specified `Topology`. Initially you have access to a `Network`'s basics, but eventually this abstraction will enable you to trigger network outages, node dropouts, and the like.

```
const { Network, topologies } = require('./src/index')
const size = 1000
const topology = topologies['PARTIAL_MESH']  // valid topology type

// init the network with a size and Topology instance
const network = new Network({ size, topology })

network.init().then((initializedNetwork) => { /* do something awesome! */ })

// Useful properties
network.size
network.nodes
network.topology
```

### Nodes
`Node` instances are basically wrappers for `libp2p` peer instances (distinctly different than, and pared down from, a full IPFS node). Currently, `Nodes` only need a unique port offset to initialize.

```
const Q = require('q')
const R = require('ramda')

// Node initialization is handled by network instances
// but here's what happens conceptually...
const nodes = R.map((offset) => new Node(offset), R.range(0, 1000))

const nodeInits = R.map((n) => n.init(), nodes)

Q.allSettled(nodeInits).then((resolvedVals) => {
    // if you want to work with the returned nodes, you need to 
    // extract them from the resolvedVals. But once all are settled, 
    // a topology can be initialized with these nodes
    topology.init(nodes)
})

// Useful properties
node.peerInfo
node.libp2p
node.repo
node.bitswap
```

### Topologies
`Topologies` are various arrangements used to specify and shape the connections of your particular `Network` instance—they are passed in during the creation of a `Network` instances. Currently the interface for a `Topology` is extremely simple. Each one has a `type` and an `init` function (which expects an array of `Nodes` from your `Network`). The implementation details are left to you. This may change in the future, but currently serves the purpose.

##### Adding a new topology
Now if you've read this far, you may be saying to yourself...

> Geez, I'd really love to see [insert_topology]! How might I go about doing this? Surely it must be challenging!

Well, things are pretty simple. The API for a new topology would look something like this:
```
module.exports = {
  // all caps snake-casing for types
  type: 'SOME_NAME',
  
  // return a promise with your nodes once they are arranged and connected
  init: (nodes) => {
    /* do some connecting, then return the nodes */
    return Promise.resolve(nodes)
  }
}
```
Then all you have to do is add your implementation to the `index.js` file in `/src/topologies` (...eventually I'll use `fs` to walk the files for discovery, but today it's manual).

## Config

Config for each abstraction can be found in the relevant `config` file. To toggle debugging and memory profiling, use config in `/src/env.js`.

## Examples

Initially the best examples can be found by looking through `/test`. But there's also a basic example of network initialization in the `example.js`.

## Feedback and Issues

I'd love to hear new thoughts and ideas about how to improve this utility. Feel free to shoot me an email with ideas, or open up a new issue and I'll get back to you as soon as I can. 

**A sincere thank you in advance for providing any thoughts and ideas, and generally helping to improve this utility for the entire community!**
