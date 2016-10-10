'use strict'

import R from 'ramda'
import reqwest from 'reqwest'

import { httpUrl } from './../config'

const clearEvents = () => {
  return {
    type: 'CLEAR_EVENTS'
  }
}

const newEvent = (data) => {
  return {
    type: 'NEW_EVENT',
    data
  }
}

module.exports.addEvent = (data) => {
  return (dispatch, getState) => {
    return dispatch(newEvent(data))
  }
}

module.exports.run = (data) => {
  return (dispatch, getState) => {
    console.log('running')

    reqwest({
      url: httpUrl + '/run',
      type: 'json',
      method: 'post',
      contentType: 'application/json',
      crossOrigin: true,
      error: function (err) {
        console.log('ERR RUNNING!', err)
      },
      success: function (resp) {
        console.log('successfully running!', resp)
        dispatch(clearEvents())
        // dispatch(clearStats())
      }
    })
  }
}
