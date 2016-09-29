'use strict'

const chalk = require('chalk')
const ENV = require('./env')
// https://github.com/marcominetti/node-memwatch
const memwatch = require('memwatch-next')
const Q = require('q')
const R = require('ramda')
const readline = require('readline')
const util = require('util')

const debug = require('debug')

const memLog = debug('pstn:memory-watch')
memLog.err = debug('pstn:memory-watch:warning')


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
  if (!ENV.DEBUG) return

  const prefix = levels[level]
  const isProgressLog = (level === 'progress')

  if (isProgressLog) {
    lastLogWasProgress = true
    // update for new logs
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
  let result = data
  if (data instanceof Error) {
    result = data.stack
  }
  // https://nodejs.org/api/errors.html
  logWithOpts('error', result)
}

const logProgress = (data) => {
  logWithOpts('progress', data)
}

// min inclusive, max exclusive
const random = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}

const resolveAsyncAccum = (fns) => {
  const fn = R.head(fns.splice(0, 1))
  logProgress(`${fns.length} resolutions remaining...`)

  if (!fns.length) return true

  // delay is needed to break the recursion and prevent larger memory leaks
  // http://stackoverflow.com/questions/15027192/how-do-i-stop-memory-leaks-with-recursive-javascript-promises
  return Q.delay(1).then(fn).then(() => resolveAsyncAccum(fns))
}

if (ENV.PROFILE_MEM) {
  memwatch.on('leak', (data) => {
    memLog.err(`Memory leak potential: Heap growth over 5 consecutive GCs: ${util.format('%j', data)}`)
  })
  memwatch.on('stats', (data) => {
    memLog(`Memory profile: ${util.format('%j', data)}`)
  })
}

module.exports = {
  log,
  logWarn,
  logError,
  logProgress,
  random,
  resolveAsyncAccum,

  //
  debug
}








