'use strict'

import R from 'ramda'
import React, { Component } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import * as actions from './../actions/events'
import uuid from 'node-uuid'

import { ws } from './../config'

function mapStateToProps(state) {
  return {
    events: state.events
  }
}

function mapDispatchToProps(dispatch) {
  return {
    run: () => {
      const svgElement = document.getElementById('svg')
      while (svgElement.firstChild) {
        svgElement.removeChild(svgElement.firstChild)
      }

      return dispatch(actions.run())
    },
    addEvent: (event) => dispatch(actions.addEvent(event)),
    updateStats: (stats) => dispatch(actions.updateStats(stats))
  }
}

function drawNetwork (network) {
  let svgElement = document.getElementById('svg')
  const svg = d3.select("#svg").append("svg:svg")

  const svgHeight = R.dropLast(2, window.getComputedStyle(svgElement).height)
  const svgWidth = R.dropLast(2, window.getComputedStyle(svgElement).width)

  let nodes = []
  let links = []

  R.forEach((node) => {
    nodes.push({ id: node.id })
    R.forEach((conn) => {
      const link = {
        source: node.id,
        target: conn
      }
      links.push(link)
    }, node.conns)
  }, network)

  let simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .on("tick", ticked)

  svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 16)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")

  let link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("marker-end", "url(#arrow)")

  let node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("fill", "#6f767b")
    .attr("r", 6)

  function ticked() {
    node
      .attr("cx", function(d) { return d.x = Math.max(6, Math.min(svgWidth - 6, d.x)) })
      .attr("cy", function(d) { return d.y = Math.max(6, Math.min(svgHeight - 6, d.y)) })

    link
      .attr("x1", function(d) { return d.source.x })
      .attr("y1", function(d) { return d.source.y })
      .attr("x2", function(d) { return d.target.x })
      .attr("y2", function(d) { return d.target.y })
  }
}

class AppContainer extends Component {

  componentDidMount() {
    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data)
      console.log(parsed)
      switch (parsed.type) {
        case 'network':
          drawNetwork(parsed.data)
          break
        case 'event':
          this.props.addEvent(parsed.data)
          break
        case 'stats':
          this.props.updateStats(parsed.data)
          break
      }
    }
  }

  render() {
    const currentEvent = R.last(this.props.events.all)
    let eventNode = <div><i>Awaiting start...</i></div>

    if (currentEvent) {
      eventNode = (
        <div>
          <h3>Type: {currentEvent.type}</h3>
          <p>Source: {currentEvent.source}</p>
          <p>Time: {new Date(currentEvent.timestamp).toString()}</p>
          <p>Args: {JSON.stringify(currentEvent.args)}</p>
        </div>
      )
    }

    function generateTopicLog (topicLog) {
      let results = []

      R.mapObjIndexed((topicObj, topic) => {
        let result = {
          subscribers: topicObj.subscribers,
          topic: window.atob(topic),
          messages: []
        }

        R.mapObjIndexed((messageObj, msg) => {
          if (msg !== 'subscribers') {
            let traverseTime = null
            if (messageObj.exit) {
              traverseTime = (messageObj.exit - messageObj.enter) / 1000  // in seconds
            }

            result.messages.push({
              message: window.atob(msg),
              enter: messageObj.enter,
              exit: messageObj.exit,
              recipients: messageObj.recipients,
              traverseTime
            })
          }
        }, topicObj)

        results.push(result)
      }, topicLog)

      return R.map((result) => {
        return (
          <div key={uuid.v4()} className="item">
            <div>
              <h3>Topic: {result.topic}</h3>
            </div>
            <div>
              <h3>Subscribers:</h3>
              {R.map((s) => <p key={uuid.v4()}>{s}</p>, result.subscribers)}
            </div>
            <div>
              <h3>Messages:</h3>
              {R.map((msg) => {
                return (
                  <div className="item--nested" key={uuid.v4()}>
                    <p><strong>Message:</strong></p>
                    <p>{msg.message}</p>

                    <p><strong>Recipients:</strong></p>
                    {R.map((r) => <p key={uuid.v4()}>{r}</p>, msg.recipients)}

                    <p><strong>Enter:</strong> {msg.enter}</p>
                    <p><strong>Exit:</strong> {msg.exit}</p>
                    <p><strong>Traversal Time: </strong>
                      {
                        R.isNil(msg.traverseTime) ?
                        `Message did not reach all subscribers` :
                        `${msg.traverseTime} seconds`
                      }
                    </p>
                  </div>
                )
              }, result.messages)}
            </div>
          </div>
        )
      }, results)
    }


    return (
      <div className="container">

        <div className="pure-g">
          <div className="pure-u-1-1">
            <div className="section">
              <h1>Testnet Runner</h1>
            </div>
          </div>
        </div>

        <div className="pure-g">
          <div className="pure-u-1-1">
            <div className="section">
              <h2>Topology</h2>
              <div id="svg"></div>
            </div>
            <div className="section">
              <button className="pure-button pure-button-primary" onClick={this.props.run.bind(this)}>Start Testnet Runner</button>
            </div>
          </div>
        </div>

        <div className="pure-g">
          <div className="pure-u-1-1">
            <div className="section">
              <h2>Most Recent Event</h2>
              <div className="content">
                {eventNode}
              </div>
            </div>
          </div>
        </div>

        <div className="pure-g">
          <div className="pure-u-1-1">
            <div className="section">
              <h2>Propagation Stats</h2>
              <div className="content content-scroll">
                {generateTopicLog(this.props.events.topicLog)}
              </div>
            </div>
          </div>
        </div>

        <div className="pure-g">
          <div className="pure-u-1-1">
            <div className="section">
              <h2>Event Log</h2>
              <div className="content content-scroll">
                {R.map((event) => {
                  return (
                    <div key={uuid.v4()} className="item">
                      <p><strong>Source: </strong> {event.source}</p>
                      <p><strong>Type: </strong> {event.type}</p>
                      <p><strong>Topic: </strong> {window.atob(event.topic)}</p>
                      <p><strong>Message: </strong> {window.atob(event.msg)}</p>
                      <p><strong>timestamp: </strong> {new Date(event.timestamp).toString()}</p>
                    </div>
                  )
                }, this.props.events.eventLog)}
              </div>
            </div>
          </div>
        </div>

      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer)
