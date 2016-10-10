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
    run: () => dispatch(actions.run()),
    addEvent: (event) => dispatch(actions.addEvent(event))
  }
}

function drawNetwork (network) {
  const svg = d3.select("#svg").append("svg:svg")
  const svgElement = document.getElementById('svg')

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
      }
    }
  }

  render() {
    return (
      <div className="container">

        <div className="pure-g">
          <div className="pure-u-1-1">
            <div className="section">
              <h1>Testnet Runnner</h1>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>Topology</h2>
          <div id="svg"></div>
        </div>

        <div className="section">
          <button className="pure-button" onClick={this.props.run.bind(this)}>Start Testnet Runner</button>
        </div>

        <div className="pure-g">

          <div className="pure-u-2-3">
            <div className="section">
              <h2>Events</h2>
              <div className="events">
                {R.map((evt) => {
                  return (
                    <div key={uuid.v4()} className="event">
                      <h4>Type: {evt.type}</h4>
                      <p>Source: {evt.source}</p>
                      <p>Time: {evt.timestamp}</p>
                      <p>Args: {JSON.stringify(evt.args)}</p>
                    </div>
                  )
                }, this.props.events.all)}
              </div>
            </div>
          </div>

          <div className="pure-u-1-3">
            <div className="section">
              <h2>Stats</h2>
            </div>
          </div>

        </div>

      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer)
