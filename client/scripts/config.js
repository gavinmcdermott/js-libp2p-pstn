'use strict'

const host = window.document.location.host.replace(/:.*/, '')

const wsUrl = 'ws://' + host + ':8080'
module.exports.httpUrl = 'http://' + host + ':8080'

module.exports.ws = new WebSocket(wsUrl)
