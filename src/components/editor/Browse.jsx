// Copyright 2018 Stanford University see Apache2.txt for license

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Header from './Header'

class Browse extends Component {
  constructor(props) {
    super(props)
  }


  render() {
    return(
      <div id="browse">
        <Header triggerEditorMenu={this.props.triggerHandleOffsetMenu}/>
      </div>
    )
  }
}

Browse.propTypes = {
  children: PropTypes.array,
  triggerHandleOffsetMenu: PropTypes.func
}



export default (Browse)