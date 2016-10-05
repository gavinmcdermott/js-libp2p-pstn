'use strict'

class TestNetError extends Error {
  constructor (message, extra) {
    super()
    Error.captureStackTrace(this, this.constructor)
    this.name = `TestNetError`
    this.message = `${message}`
    if (extra) this.extra = extra
  }
}

module.exports = { TestNetError }
