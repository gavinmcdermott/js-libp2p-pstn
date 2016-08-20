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

const warn = (msg, ...data) => {
  logWithOpts('warn', msg, data)
}

const error = (msg, ...data) => {
  logWithOpts('error', msg, data)
}

module.exports = { log, warn, error }
