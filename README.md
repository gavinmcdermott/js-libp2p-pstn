# libp2p Pubsub Testnet (pstn)

The Pubsub Testnet is a utility for initializing arbitrary networks of [libp2p nodes](https://github.com/libp2p/js-libp2p) connected by some specified topology. It provides useful benchmarking tools to make designing and implementing network p2p pubsub/messaging strategies faster and somewhat more sane.

This module is currently being updated to work with these modules:
- `js-libp2p-pstn-node`: for pubsub testnet node instances
- `js-libp2p-pstn-logger`: logs pubsub events and useful data in a consistent manner
- `js-libp2p-pstn-stats`: walks the log file output from the logger to generate benchmark data (starting with network traversal time for a message)

## Example

Here's how these will play together

```javascript

const Node = require('js-libp2p-pstn-node')
const addLog = require('js-libp2p-pstn-logger')
const PStats = require('js-libp2p-pstn-stats')
const PS = require('js-libp2p-floodsub')

// ... do stuff

// ... make nodes
this.nodes = R.map((idx) => {
  const options = {
    id: pregenKeys[idx],
    portOffset: idx
  }
  let node = new Node(options)
  let nodeId = node.peerInfo.id.toB58String()
  node.pubsub = PS(node.libp2p)
  addLogger(node.pubsub, nodeId)
  return node
}, [0,1,2,3,4])

// ... start nodes and send messages


// then check out happened
PStats.eventLog
PStats.topicLog
PStats.stats

```



