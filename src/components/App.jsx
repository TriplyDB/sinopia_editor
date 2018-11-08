import React from 'react'
import { hot } from 'react-hot-loader'
import HomePage from './HomePage'
import '../styles/main.css'
import BFF from './BFF'

import { BrowserRouter, Route, Switch } from 'react-router-dom'

const FourOhFour = () => <h1>404</h1>
const App = () => (
  <BrowserRouter>
    <div id="app">
      <Switch>
        <Route exact path='/' component={HomePage} />
        <Route exact path='/editor' component={BFF} />
        <Route id="404" component={FourOhFour} />
      </Switch>
    </div>
  </BrowserRouter>
)

export default hot(module)(App)
