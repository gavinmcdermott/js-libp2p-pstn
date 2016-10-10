'use strict'

import { render } from 'react-dom'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'

import getRoutes from './routes'

// Reducers
import events from './reducers/events'

let reducers = combineReducers({events})
let store = createStore(reducers, applyMiddleware(thunkMiddleware))

render(getRoutes(store), document.getElementById('app'))
