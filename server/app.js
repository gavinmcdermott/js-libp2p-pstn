'use strict'

const R = require('ramda')
const WebSocketServer = require('ws').Server
const http = require('http')
const path = require('path')
const express = require('express')
const { network, run } = require('./../runner')

const clientPath = path.resolve(__dirname, `./../client`)
const util = require('util')

const app = express()
app.use(express.static(clientPath))

app.post('/run', (req, res) => {
  run()
  return res.send(true)
})

const server = http.createServer(app)
server.listen(8080)

const wss = new WebSocketServer({ server })
wss.on('connection', handleWsConn)

function handleWsConn (ws) {
  console.log('connected socket server')

  network.on('connected', (nodes) => {
    // Send across the new network when connected
    const nodeConns = R.map((node) => {
      return {
        id: node.id,
        conns: R.keys(node.libp2p.peerBook.getAll())
      }
    }, nodes)
    ws.send(JSON.stringify({ type: 'network', data: nodeConns }))

    // Attach network event handlers
    R.forEach((node) => {
      const ps = node.logger
      ps.on('publish', handleLogEvent(ws))
      ps.on('receive', handleLogEvent(ws))
      ps.on('subscribe', handleLogEvent(ws))
      ps.on('unsubscribe', handleLogEvent(ws))
    }, nodes)
  })

  ws.on('close', function() {
    console.log('stopping socket server')
  })
}

function handleLogEvent (ws) {
  return (data) => {
    const parsed = { type: 'event', data }
    ws.send(JSON.stringify(parsed))
  }
}





