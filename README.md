# libp2p pstn

The Libp2p Pubsub Testnet (`libp2p-pstn`) is a utility for initializing arbitrary networks of [libp2p nodes](https://github.com/libp2p/js-libp2p) connected by some topology. It provides useful benchmarking tools for designing and implementing p2p pubsub/messaging strategies and is composed of modules from the `libp2p-pstn-*` [ecosystem](https://github.com/gavinmcdermott/js-libp2p-pstn#ecosystem).

## Install

To install through npm:

```sh
> npm i libp2p-pstn --save
```


## Example

For a real example check out `example.js`, otherwise take a look below.

```javascript
const Testnet   = require('libp2p-pstn')
const Floodsub  = require('libp2p-floodsub')
const Stats     = require('libp2p-pstn-stats')
const ringTopo  = require('libp2p-pstn-topo-ring')

const size = 10
const network = new Testnet({ size, pubsub: Floodsub })

// Start the nodes
network.start()
  // Use an existing topology from the libp2p-pstn-topo-* ecosystem
  // or pass the setTopology a custom topology creation function your own
  .then((network) => network.setTopology(ringTopo))
  // Do lots of things like subscribing, publishing, etc (eventually this will be scripted)
  .then((network) => {
    const nodeA = network.nodes[0]
    const nodeB = network.nodes[1]
    
    // ...
    nodeA.pubsub.subscribe('Topic A')
    // ... Do lots more
    nodeB.pubsub.publish('Topic A', 'Some message!')
    // ...
    
    // Then return the network's stats
    return Promise.resolve(network.stats)
  })
  .then((stats) => {
    // stats.eventLog
    // stats.topicLog
    // stats.stats
  })
```

## API

### Testnet

#### `new Testnet({ size: <int>, pubsub: <pubsub_strategy> })`

### Instance Properties

#### `instance.size` 

#### `instance.nodes`

Nodes in the the network are structured as follows: 

```javascript
{
  peerInfo: <peer_info_instance>,
  libp2p: <libp2p_nstance>,
  id: <peer_info_id_b58>,
  pubsub: <pubsub_node_instance>
}
```

#### `instance.stats`

Returns a [`js-libp2p-pstn-stats`](https://github.com/gavinmcdermott/js-libp2p-pstn-stats) instance built from pubsub node activity event logs.

## Demo

To run the demo:

```sh
> npm start
```

To run the demo with a debug log:

```sh
> npm start:debug
```

## Tests

To run the tests:

```sh
> npm test
```

## Ecosystem

`libp2p-pstn` is composed of a small, developing ecosystem for testing p2p messaging strategies in `libp2p`. They follow the `libp2p-pstn-*` convention.

### Logging

- `libp2p-pstn-logger`: Decorates a pubsub node instance and logs under the `pstn:logger` namespace in a format consumable by a stats parser ([repo](https://github.com/gavinmcdermott/js-libp2p-pstn-logger)). Currently built to work with [floodsub](https://github.com/libp2p/js-libp2p-floodsub).

### Statistics

- `libp2p-pstn-stats`: Generates in basic stats for a testnet instance based on logs from all pubsub node activity ([repo](https://github.com/gavinmcdermott/js-libp2p-pstn-stats)).

### Topologies

- `libp2p-pstn-topo-*`: Topologies used to connect a testnet instance.

- `libp2p-pstn-topo-ring`: Basic ring topology ([repo](https://github.com/gavinmcdermott/js-libp2p-pstn-topo-ring)).

## Contribute

PRs are welcome!

## License

MIT © Gavin McDermott
