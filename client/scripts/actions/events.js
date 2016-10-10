'use strict'

import R from 'ramda'
import reqwest from 'reqwest'

import { httpUrl } from './../config'

let requestInProgress = false

const _clearEvents = () => {
  return {
    type: 'CLEAR_EVENTS'
  }
}

const _addEvent = (data) => {
  return {
    type: 'NEW_EVENT',
    data
  }
}

const _updateStats = (data) => {
  return {
    type: 'UPDATE_STATS',
    data
  }
}

module.exports.addEvent = (data) => {
  return (dispatch, getState) => {
    return dispatch(_addEvent(data))
  }
}

module.exports.updateStats = (data) => {
  return (dispatch, getState) => {
    return dispatch(_updateStats(data))
  }
}

module.exports.run = (data) => {
  return (dispatch, getState) => {
    if (requestInProgress) return
    requestInProgress = true

    reqwest({
      url: httpUrl + '/run',
      type: 'json',
      method: 'post',
      contentType: 'application/json',
      crossOrigin: true,
      error: function (err) {
        requestInProgress = false
        console.log('ERR RUNNING!', err)
      },
      success: function (resp) {
        requestInProgress = false
        dispatch(_clearEvents())
      }
    })
  }
}
