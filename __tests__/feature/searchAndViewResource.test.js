import { fireEvent, screen } from '@testing-library/react'
import { renderApp } from 'testUtils'
import * as sinopiaSearch from 'sinopiaSearch'
import { resourceSearchResults } from 'fixtureLoaderHelper'
import Config from 'Config'

// This forces Sinopia server to use fixtures
jest.spyOn(Config, 'useResourceTemplateFixtures', 'get').mockReturnValue(true)
jest.mock('sinopiaSearch')
// Mock jquery
global.$ = jest.fn().mockReturnValue({ popover: jest.fn() })
// Mock out document.elementFromPoint used by useNavigableComponent.
global.document.elementFromPoint = jest.fn()
// Mock out scrollIntoView used by useNavigableComponent. See https://github.com/jsdom/jsdom/issues/1695
Element.prototype.scrollIntoView = jest.fn()

describe('searching and viewing a resource', () => {
  sinopiaSearch.getTemplateSearchResults.mockResolvedValue({
    totalHits: 0,
    results: [],
    error: undefined,
  })

  it('renders a modal without edit controls', async () => {
    // Setup search component to return known resource
    const uri = 'http://localhost:3000/resource/c7db5404-7d7d-40ac-b38e-c821d2c3ae3f'
    sinopiaSearch.getSearchResultsWithFacets.mockResolvedValue(resourceSearchResults(uri))

    renderApp()

    fireEvent.click(screen.getByText('Linked Data Editor', { selector: 'a' }))
    fireEvent.click(screen.getByText('Search', { selector: 'a' }))

    fireEvent.change(screen.getByLabelText('Query'), { target: { value: uri } })
    fireEvent.click(screen.getByTestId('Submit search'))

    await screen.findByText(uri)
    expect(screen.getByText('http://id.loc.gov/ontologies/bibframe/Fixture')).toBeInTheDocument()

    // Modal hasn't rendered yet
    expect(screen.queryByRole('dialog', { name: 'View Resource' })).not.toBeInTheDocument()
    expect(screen.getByTestId('view-resource-modal').classList).not.toContain('show')

    // Click the view icon next to the search result row
    expect(screen.getByTestId(`View ${uri}`)).toBeInTheDocument()
    fireEvent.click(screen.getByTestId(`View ${uri}`))

    // Modal has now rendered
    expect((await screen.findByTestId('view-resource-modal')).classList).toContain('show')
    expect((await screen.findAllByText('Uber template1, property1', { selector: 'span' }))).toHaveLength(1)

    // Edit controls are disabled in view modal
    screen.getAllByTestId('Remove Uber template3, property1').forEach((removeButton) => {
      expect(removeButton).toBeDisabled()
    })
    screen.getAllByText('ä').forEach((languageButton) => {
      expect(languageButton).toBeDisabled()
    })
    expect(screen.getByPlaceholderText('Uber template3, property1')).toBeDisabled()
    expect(screen.getByTestId('Edit Uber template3, property1')).toBeDisabled()
    expect(screen.getByTestId('Change language for Uber template3, property1')).toBeDisabled()
    expect(screen.getByTestId('Remove analog')).toBeDisabled()
    screen.getAllByTestId('lookup').forEach((lookupValueControl) => {
      expect(lookupValueControl).toBeDisabled()
    })
    screen.getAllByText('+').forEach((lookupControl) => {
      expect(lookupControl).toBeDisabled()
    })

    // Modal has edit and copy buttons
    expect(screen.getByTestId('edit-resource')).toBeInTheDocument()
    expect(screen.getByTestId('copy-resource')).toBeInTheDocument()

    // Edit button opens the editor with existing resource
    fireEvent.click(screen.getByLabelText('Edit', { selector: 'button', exact: true }))
    expect(screen.getByText('Uber template1', { selector: 'h3' })).toBeInTheDocument()
    expect(screen.getByText('Copy URI', { selector: 'button' })).toBeInTheDocument()
  })
})
