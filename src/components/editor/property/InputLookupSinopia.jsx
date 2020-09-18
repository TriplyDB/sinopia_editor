// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import PropTypes from 'prop-types'
import { getLookupResults } from 'sinopiaSearch'
import { getSinopiaOptions } from 'utilities/Search'

import ResourceList from './ResourceList'
import InputLookupModal from './InputLookupModal'

const InputLookupSinopia = (props) => (
  <React.Fragment>
    <InputLookupModal getLookupResults={getLookupResults} getOptions={getSinopiaOptions} property={props.property} />
    <ResourceList property={props.property} />
  </React.Fragment>
)


InputLookupSinopia.propTypes = {
  property: PropTypes.object.isRequired,
}

export default InputLookupSinopia
