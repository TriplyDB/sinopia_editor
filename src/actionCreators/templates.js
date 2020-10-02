// Copyright 2019 Stanford University see LICENSE for license
import { addError } from 'actions/errors'
import { validateTemplates } from './templateValidationHelpers'
import Config from 'Config'
import { addTemplates } from 'actions/templates'
import { addTemplateHistoryByResult } from 'actions/history'
import { selectSubjectAndPropertyTemplates } from 'selectors/templates'
import TemplatesBuilder from 'TemplatesBuilder'
import { fetchResource } from 'sinopiaApi'
import { getTemplateSearchResultsByIds } from 'sinopiaSearch'
import _ from 'lodash'

/**
 * A thunk that gets a resource template from state or the server.
 * @return [Object] subject template
 */
export const loadResourceTemplate = (resourceTemplateId,
  resourceTemplatePromises, errorKey) => (dispatch) => dispatch(loadResourceTemplateWithoutValidation(resourceTemplateId,
  resourceTemplatePromises))
  .then((subjectTemplate) => dispatch(validateTemplates(subjectTemplate, resourceTemplatePromises, errorKey))
    .then((isValid) => (isValid ? subjectTemplate : null)))
  .catch((err) => {
    dispatch(addError(errorKey, `Error retrieving ${resourceTemplateId}: ${err.message || err}`))
    return null
  })

/**
   * A thunk that gets a resource template from state or the server and transforms to
   * subject template and property template models and adds to state.
   * Validation is not performed. This means that invalid templates can be stored in state.
   * @return [Object] subject template
   * @throws when error occurs retrieving the resource template.
   */
export const loadResourceTemplateWithoutValidation = (resourceTemplateId, resourceTemplatePromises) => (dispatch, getState) => {
  // Try to get it from resourceTemplatePromises.
  // Using this cache since in some cases, adding to state to too slow.
  const resourceTemplatePromise = resourceTemplatePromises?.[resourceTemplateId]
  if (resourceTemplatePromise) {
    return resourceTemplatePromise
  }
  // Try to get it from state.
  const subjectTemplate = selectSubjectAndPropertyTemplates(getState(), resourceTemplateId)
  if (subjectTemplate) {
    return Promise.resolve(subjectTemplate)
  }

  const templateUri = `${Config.sinopiaApiBase}/resource/${resourceTemplateId}`

  const newResourceTemplatePromise = fetchResource(templateUri, true)
    .then(([dataset]) => {
      const subjectTemplate = new TemplatesBuilder(dataset, templateUri).build()
      dispatch(addTemplates(subjectTemplate))
      return subjectTemplate
    })

  if (resourceTemplatePromises) resourceTemplatePromises[resourceTemplateId] = newResourceTemplatePromise
  return newResourceTemplatePromise
}

export const loadTemplateHistory = (templateIds) => (dispatch) => {
  if (_.isEmpty(templateIds)) return
  getTemplateSearchResultsByIds(templateIds)
    .then((response) => {
      if (response.error) {
        console.error(response.error)
        return
      }
      const resultMap = {}
      response.results.forEach((result) => resultMap[result.id] = result)
      // Reversing so that most recent is at top of list.
      const reversedTemplateIds = [...templateIds].reverse()
      reversedTemplateIds.forEach((templateId) => {
        const result = resultMap[templateId]
        if (!result) return
        dispatch(addTemplateHistoryByResult(result))
      })
    })
    .catch((err) => console.error(err))
}
