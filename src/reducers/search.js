// Copyright 2019 Stanford University see LICENSE for license

/**
 * @param {Object} state the previous redux state
 * @param {Object} action the payload of the action is the this of search results
 * @return {Object} the next redux state
 */
const setSearchResults = (state, action) => {
  const newState = { ...state }

  newState.search.authority = action.payload.authority
  newState.search.results = action.payload.searchResults
  newState.search.totalResults = action.payload.totalResults
  newState.search.query = action.payload.query
  newState.search.startOfRange = action.payload.startOfRange
  newState.search.error = action.payload.error

  return newState
}

export default setSearchResults
