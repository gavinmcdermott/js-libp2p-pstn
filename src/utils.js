'use strict'

const winston = require('winston')
const constants = require('./constants')

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

module.exports = { log, logWarn, logError }
