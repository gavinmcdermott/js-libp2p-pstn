'use strict'

const memwatch = require('memwatch-next')
const constants = require('./constants')
const winston = require('winston')

const logger = new winston.Logger({
  transports: [ new winston.transports.Console({ colorize: true }) ]
})

const logWithOpts = (level, msg, data) => {
  if (!constants.debug) return
  logger[level](msg, data || null)
}

const log = (msg, ...data) => {
  logWithOpts('info', msg, data)
}

const logWarn = (msg, ...data) => {
  logWithOpts('warn', msg, data)
}

const logError = (msg, ...data) => {
  logWithOpts('error', msg, data)
}

// min inclusive, max exclusive
const random = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}

if (constants.profileMem) {
  memwatch.on('leak', (info) => logError('MEMORY LEAK: ', info))
  memwatch.on('stats', (stats) => log('MEMORY PROFILE:', stats))
}

module.exports = { log, logWarn, logError, random }
