'use strict'

const debug = require('debug')
const memwatch = require('memwatch-next')  // https://github.com/marcominetti/node-memwatch
const R = require('ramda')
const util = require('util')

const PORT = 12000
const PROFILE_MEM = true

const log = debug('pstn:network')
log.err = debug('pstn:network:error')

const memLog = debug('pstn:memory-watch')
memLog.err = debug('pstn:memory-watch:warning')

if (PROFILE_MEM) {
  memwatch.on('leak', (data) => {
    memLog.err(`Memory leak potential: Heap growth over 5 consecutive GCs: ${util.format('%j', data)}`)
  })
  memwatch.on('stats', (data) => {
    memLog(`Memory profile: ${util.format('%j', data)}`)
  })
}

module.exports = { PORT, log }
