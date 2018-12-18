// Copyright 2018 Stanford University see Apache2.txt for license
import React, { Component } from 'react'
import { asyncContainer, Typeahead } from 'react-bootstrap-typeahead'
import PropTypes from 'prop-types'
import Swagger from 'swagger-client'
import { connect } from 'react-redux'
import { changeSelections } from '../../actions/index'

const AsyncTypeahead = asyncContainer(Typeahead)

class InputLookup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false
    }
  }

  render() {
    let isMandatory, isRepeatable, authority, vocab, subauthority, language
    try {
      isMandatory = JSON.parse(this.props.propertyTemplate.mandatory)
      isRepeatable = JSON.parse(this.props.propertyTemplate.repeatable)
      authority = this.props.propertyTemplate.valueConstraint.useValuesFrom[0]
      vocab = authority.split(':')[0]
      subauthority = authority.split(':')[1]
      language = authority.split(':')[2]
    } catch (error) {
      console.log(`Problem with properties fetched from resource template: ${error}`)
    }

    const typeaheadProps = {
      required: isMandatory,
      multiple: isRepeatable,
      placeholder: this.props.propertyTemplate.propertyLabel,
      useCache: true,
      isLoading: this.state.isLoading,
      options: this.state.options,
      selected: this.state.selected,
      delay: 300
    }

    return (
      <div>
        <label htmlFor="lookupComponent">{this.props.propertyTemplate.propertyLabel}
        <AsyncTypeahead id="lookupComponent"
          onSearch={query => {
            this.setState({isLoading: true});
            Swagger({ url: "src/lib/apidoc.json" }).then((client) => {
              client
                .apis
                .SearchQuery
                .GET_searchAuthority({
                  q: query,
                  vocab: vocab,
                  subauthority: subauthority,
                  maxRecords: 8,
                  lang: language
                })
                .then(response => this.setState({
                isLoading: false,
                options: response.body
              }))
            }).catch(() => { return false })
          }}
          onChange={selected => {
            let payload = {
                id: this.props.propertyTemplate.propertyLabel,
                items: selected
              }
              this.props.handleSelectedChange(payload)
            }
          }
          {...typeaheadProps}
        />
        </label>
      </div>
    )
  }
}

InputLookup.propTypes = {
  propertyTemplate: PropTypes.shape({
    propertyLabel: PropTypes.string,
    mandatory: PropTypes.oneOfType([ PropTypes.string, PropTypes.bool]),
    repeatable: PropTypes.oneOfType([ PropTypes.string, PropTypes.bool]),
    valueConstraint: PropTypes.shape({
      useValuesFrom: PropTypes.oneOfType([ PropTypes.string, PropTypes.array])
    })
  }).isRequired
}

const mapStatetoProps = (state) => {
  let data = state.lookups.formData
  let result = {}
  if (data !== undefined){
    result = { formData: data }
  }
  return result
}

const mapDispatchtoProps = dispatch => ({
  handleSelectedChange(selected){
    dispatch(changeSelections(selected))
  }
})

export default connect(mapStatetoProps, mapDispatchtoProps)(InputLookup)
