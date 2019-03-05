// Copyright 2018 Stanford University see Apache2.txt for license

import React, {Component} from 'react'
import { connect } from 'react-redux'
import { removeAllItems } from '../../actions/index'
import PropTypes from 'prop-types'
import ResourceTemplate from './ResourceTemplate'
import Header from './Header'
import StartingPoints from './StartingPoints'

class Editor extends Component {
  constructor(props) {
    super(props)

    // TODO: temporarily hardcoded here.
    //  Selecting a resource template will happen in the left-nav "Starting Points" menu,
    //   another child of the Editor component;  it will set state.resourceTemplateId
    const defaultRtId = 'resourceTemplate:bf2:Monograph:Instance'
    this.state = {
      resourceTemplateId: defaultRtId,
      tempRtState: true
    }
  }

  resetTempState = () => {
    this.setState({tempRtState: true})
  }

  //resource templates are set via StartingPoints and passed to ResourceTemplate
  setResourceTemplates = (content) => {
    this.props.resetStore()
    this.setState({resourceTemplateData: content})
  }

  render() {
    return(
      <div id="editor">
        <Header triggerEditorMenu={this.props.triggerHandleOffsetMenu}/>
        <h1>[Clone|Edit] title.of.resource</h1>
        <StartingPoints
          tempStateCallback={this.resetTempState}
          resourceTemplatesCallback={this.setResourceTemplates}
          defaultRtId = {this.state.resourceTemplateId}
          setResourceTemplateCallback={this.setResourceTemplates}
        />
        <ResourceTemplate
          resourceTemplateId = {this.state.resourceTemplateId}
          resourceTemplateData = {this.state.resourceTemplateData}
        />
      </div>
    )
  }
}

Editor.propTypes = {
  children: PropTypes.array,
  triggerHandleOffsetMenu: PropTypes.func,
  resetStore: PropTypes.func
}

const mapDispatchToProps = dispatch => ({
  resetStore(){
    dispatch(removeAllItems())}
})

export default connect(null, mapDispatchToProps)(Editor)
