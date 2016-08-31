'use strict'

const chalk = require('chalk')
const memwatch = require('memwatch-next')
const constants = require('./constants')
const readline = require('readline')
const util = require('util')

// flag which is used to tell the logger if it should overwrite the current log line
let lastLogWasProgress = false

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ''
})

const levels = {
  warn: chalk.yellow('warn'),
  error: chalk.red('error'),
  info: chalk.green('info'),
  progress: chalk.blue('progress'),
}

const logWithOpts = (level, data) => {
  if (!constants.DEBUG) return

  const prefix = levels[level]
  const isProgressLog = (level === 'progress')

  if (isProgressLog) {
    lastLogWasProgress = true

    rl.write(null, { ctrl: true, name: 'u' })
    rl.write(`${prefix}: ${data}`)
  } else {
    // If the previous statement was a progress update,
    // overwrite it with the new log we want to persist visually
    if (lastLogWasProgress) {
      // rl.write('\n')
      rl.write(null, { ctrl: true, name: 'u' })
    }

    lastLogWasProgress = false

    rl.write(`${prefix}: ${data}`)
    rl.write('\n')
  }
}

const log = (data) => {
  logWithOpts('info', data)
}

const logWarn = (data) => {
  logWithOpts('warn', data)
}

const logError = (data) => {
  logWithOpts('error', data)
}

const logProgress = (data) => {
  logWithOpts('progress', data)
}

// min inclusive, max exclusive
const random = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}

if (constants.PROFILE_MEM) {
  memwatch.on('leak', (data) => {
    logError(`Memory leak: ${util.format('%j', data)}`)
  })
  memwatch.on('stats', (data) => {
    log(`Memory profile: ${util.format('%j', data)}`)
  })
}

module.exports = { log, logWarn, logError, logProgress, random }
