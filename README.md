# libp2p pstn

The Libp2p Pubsub Testnet (`libp2p-pstn`) is a utility for initializing arbitrary networks of [libp2p nodes](https://github.com/libp2p/js-libp2p) connected by some topology. It provides useful benchmarking tools for designing and implementing p2p pubsub/messaging strategies and is composed of modules from the `libp2p-pstn-*` [ecosystem](https://github.com/gavinmcdermott/js-libp2p-pstn#ecosystem).

## Install

To install through npm:

```sh
> npm i libp2p-pstn --save
```


## Example

Run the UI client with the default topology (ring) and default/example pubsub events:

```sh
> npm start
```

Go to `http://localhost:8080` in your browser. Open the console for logs, or just click the "Start Testnet Runner" button to kick off the pubsub test. Events will stream in followed by propagation stats and the full event log.

If you want to swap the topology (with a mesh or your own function) or rework the script for which nodes subscribe to what and who send what, open the `runner.js` file in the root and customize the `run` function. It should be pretty straightforward.

For a real example check out `example.js`, otherwise take a look below.

*Note about client page refreshes: If you refresh the page, you need to restart the server. This will be fixed soon.*

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

To run the UI client:

```sh
> npm start
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

- `libp2p-pstn-topo-ring`: Ring topology ([repo](https://github.com/gavinmcdermott/js-libp2p-pstn-topo-ring)).

- `libp2p-pstn-topo-partialmesh`: Partial mesh topology with 2 connections per peer ([repo](https://github.com/gavinmcdermott/js-libp2p-pstn-topo-partialmesh)).

## Contribute

PRs are welcome!

## License

MIT © Gavin McDermott
