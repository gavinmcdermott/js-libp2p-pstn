'use strict'

const events = { all: [] }

export default (state=events, action) => {
  let newState = Object.assign({}, state)
  switch (action.type) {
    case 'NEW_EVENT':
      console.log('new event', action)
      newState.all.push(action.data)
      return newState
      break
    case 'CLEAR_EVENTS':
      console.log('clear', action)
      newState.all = []
      return newState
      break

    default:
      return newState
      break
  }
}
