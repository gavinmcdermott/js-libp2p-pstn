'use strict'

const newEvents = {
  all: [],
  topicLog: {},
  eventLog: [],
}

export default (state=newEvents, action) => {
  let newState = Object.assign({}, state)
  switch (action.type) {
    case 'NEW_EVENT':
      console.log('new event', action.data)
      newState.all.push(action.data)
      return newState
      break
    case 'UPDATE_STATS':
      console.log('new stats', action.data)
      newState.topicLog = action.data.topicLog
      newState.eventLog = action.data.eventLog
      return newState
      break
    case 'CLEAR_EVENTS':
      console.log('clear', action)
      newState = newEvents
      return newState
      break

    default:
      return newState
      break
  }
}
