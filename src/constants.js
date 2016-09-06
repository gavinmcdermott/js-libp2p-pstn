'use strict'

const DEFAULTS = {
  KEY_SIZE: 128,  // in bits; currently shortened to shrink the test keyspace
  BASE_PORT: 12000,
  SIZE: 1000,
}

const ENV = {
  DEBUG: true,
  PROFILE_MEM: true,  // log memory memory usage
}

module.exports = { ENV, DEFAULTS }
