// Copyright 2018, 2019 Stanford University see LICENSE for license

import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import TextareaAutosize from 'react-textarea-autosize'
import {
  hideDiacritics, showDiacritics,
  setLiteralContent, updateCursorPosition,
} from 'actions/inputs'
import { displayResourceValidations } from 'selectors/errors'
import InputValue from './InputValue'
import { defaultLanguageId } from 'utilities/Utilities'
import _ from 'lodash'
import { addValue } from 'actions/resources'
import { newLiteralValue } from 'utilities/valueFactory'
import { selectLiteralInputContent } from 'selectors/inputs'


const InputLiteral = (props) => {
  const inputLiteralRef = useRef(100 * Math.random())
  const [lang, setLang] = useState(defaultLanguageId)
  const id = `inputliteral-${props.property.key}`

  const disabled = !props.property.propertyTemplate.repeatable
      && props.property.values.length > 0

  const addItem = () => {
    let currentcontent = props.content.trim()
    if (!currentcontent && !props.shouldShowDiacritic) {
      return
    }

    if (props.shouldShowDiacritic && !currentcontent) {
      currentcontent = inputLiteralRef.current.value
    }

    props.addValue(newLiteralValue(props.property, currentcontent, lang))
    props.setLiteralContent(props.property.key, '')
    setLang(defaultLanguageId)
  }

  const handleKeypress = (event) => {
    if (event.key === 'Enter') {
      addItem()
      props.hideDiacritics()
      event.preventDefault()
    }
    // Handle any position changing
    props.updateCursorPosition(inputLiteralRef.current.selectionStart)
  }

  const handleEdit = (content, lang) => {
    props.setLiteralContent(props.property.key, content)
    setLang(lang)
    inputLiteralRef.current.focus()
  }

  const toggleDiacritics = (event) => {
    if (props.shouldShowDiacritic) {
      props.hideDiacritics()
    } else {
      props.updateCursorPosition(inputLiteralRef.current.selectionStart)
      props.showDiacritics(props.property.key)
    }
    event.preventDefault()
  }

  const addedList = props.property.valueKeys.map((valueKey) => (<InputValue key={valueKey}
                                                                            handleEdit={handleEdit}
                                                                            valueKey={valueKey} />))

  const required = props.property.propertyTemplate.required

  let error
  let groupClasses = 'form-group'

  if (props.displayValidations && !_.isEmpty(props.property.errors)) {
    groupClasses += ' has-error'
    error = props.property.errors.join(',')
  }

  const focusIn = (event, checkId) => {
    if (event.relatedTarget === null) return false

    let node = event.relatedTarget

    while (node !== null) {
      if (node.id === checkId) return true
      node = node.parentNode
    }

    return false
  }

  const hasInput = () => !_.isEmpty(props.content)

  const handleBlur = (e) => {
    if (focusIn(e, 'diacritics-selection') || focusIn(e, id)) {
      return
    }

    if (hasInput()) {
      addItem()
      props.hideDiacritics()
    }
  }

  // This handles if they change the cursor position within the field after the focus event.
  const handleClick = () => {
    props.updateCursorPosition(inputLiteralRef.current.selectionStart)
  }

  // This handles if they focus into the field using tab (no click)
  const handleFocus = () => {
    props.updateCursorPosition(inputLiteralRef.current.selectionStart)
  }

  return (
    <div className={groupClasses}>
      <div className="input-group" onBlur={handleBlur} id={id}>
        <TextareaAutosize
              required={required}
              className="form-control"
              placeholder={props.property.propertyTemplate.label}
              onChange={(event) => props.setLiteralContent(props.property.key, event.target.value)}
              onKeyPress={handleKeypress}
              onFocus={handleFocus}
              onClick={handleClick}
              value={props.content}
              disabled={disabled}
              ref={inputLiteralRef}
        />
        <div className="input-group-append" tabIndex="0">
          <button className="btn btn-outline-primary"
                  disabled={disabled}
                  onClick={toggleDiacritics}>&auml;</button>
        </div>
      </div>
      {error && <span className="text-danger">{error}</span>}
      {addedList}
    </div>
  )
}

InputLiteral.propTypes = {
  shouldShowDiacritic: PropTypes.bool,
  hideDiacritics: PropTypes.func,
  showDiacritics: PropTypes.func,
  displayValidations: PropTypes.bool,
  property: PropTypes.object.isRequired,
  addValue: PropTypes.func,
  content: PropTypes.string,
  setLiteralContent: PropTypes.func,
  updateCursorPosition: PropTypes.func,
}

const mapStateToProps = (state, ownProps) => ({
  displayValidations: displayResourceValidations(state),
  shouldShowDiacritic: state.selectorReducer.editor.diacritics.show,
  content: selectLiteralInputContent(state, ownProps.property.key) || '',
})

const mapDispatchToProps = (dispatch) => bindActionCreators({
  hideDiacritics, showDiacritics, addValue, setLiteralContent, updateCursorPosition,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(InputLiteral)
