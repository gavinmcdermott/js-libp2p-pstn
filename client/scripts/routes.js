import React from 'react'
import { Router, IndexRoute, Route } from 'react-router'
import { Provider } from 'react-redux'

// Containers
import AppContainer from './containers/AppContainer'

module.exports = (store) => {
  return (
    <Provider store={store}>
      <AppContainer></AppContainer>
    </Provider>
  )
}
