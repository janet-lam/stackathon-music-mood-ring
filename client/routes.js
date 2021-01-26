import React, {Component} from 'react'
import {Route, Switch} from 'react-router-dom'
import {Mood, Home} from './components'

class Routes extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/mood" component={Mood} />
        </Switch>
      </div>
    )
  }
}

export default Routes
