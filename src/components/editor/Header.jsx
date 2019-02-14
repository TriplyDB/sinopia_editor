// Copyright 2018 Stanford University see Apache2.txt for license

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {NavLink} from 'react-router-dom'
class Header extends Component {
  render() {
    return (
      <div className="navbar editor-navbar">
        <div>
          <ul className="nav navbar-nav pull-right">
            <li>
              <a className="editor-header-text" href="https://profile-editor.sinopia.io/">Profile Editor</a>
            </li>
            <li className="menu">
              <a href="#" className="editor-help-resources" onClick={this.props.triggerEditorMenu}>Help and Resources</a>
            </li>
          </ul>
          <div>
            <h2 className="editor-subtitle"><a className="editor-subtitle" href="/">SINOPIA</a></h2>
            <h1 className="editor-logo">LINKED DATA EDITOR</h1>
          </div>
          <div>
              <ul className="nav nav-tabs pull-left editor-navtabs">
                { /*Navlinks enable highlighting the appropriate tab based on route, active style is defined in css */}
                <li className="nav-item"><NavLink className="nav-link" to="/browse">Browse</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/editor">Editor</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/import">Import Resource Template</NavLink></li>
              </ul>
          </div>
        </div>
      </div>
    )
  }
}

Header.propTypes = {
  triggerEditorMenu: PropTypes.func
}

export default Header
