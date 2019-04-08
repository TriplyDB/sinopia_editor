// Copyright 2019 Stanford University see Apache2.txt for license

import React, {Component} from 'react'
import InputLiteral from './InputLiteral'
import InputListLOC from './InputListLOC'
import InputLookupQA from './InputLookupQA'
import OutlineHeader from './OutlineHeader'
import PropertyTypeRow from './PropertyTypeRow'
import RequiredSuperscript from './RequiredSuperscript'
import { getResourceTemplate } from '../../sinopiaServer'
import lookupConfig from '../../../static/spoofedFilesFromServer/fromSinopiaServer/lookupConfig.json'
import PropTypes from 'prop-types'
import shortid from 'shortid'

export const valueTemplateRefTest = (property) => {
  return Boolean(property.valueConstraint != null &&
   property.valueConstraint.valueTemplateRefs != null &&
   property.valueConstraint.valueTemplateRefs.length > 0)
}


export const getLookupConfigForTemplateUri = (templateUri) => {
    let returnConfigItem
    lookupConfig.forEach((configItem) => {
        if (configItem.uri === templateUri) {
            returnConfigItem = configItem;
        }
    })
    return {value: returnConfigItem};
}

//This method is used for input list loc below, with just one lookup config passed back
// in {value : configItem } format
export const getLookupConfigItem = (property) => {
  let templateUri = property.valueConstraint.useValuesFrom[0];
  let configItem = getLookupConfigForTemplateUri(templateUri);
  return configItem
}

export const getLookupConfigItems = (property) => {
    //More than one value possible so this returns all the lookup configs associated with property
    let templateUris = property.valueConstraint.useValuesFrom;
    let templateConfigItems = [];
    templateUris.forEach(templateUri => {
        let configItem = getLookupConfigForTemplateUri(templateUri);
        //TODO: Handle when this is undefined?
        templateConfigItems.push(configItem);
    });
    return templateConfigItems;
}

export class PropertyTemplateOutline extends Component {

  constructor(props) {
    super(props)
    this.state = {
      collapsed: true,
      output: []
    }
  }

  handleAddClick = (event) => {
    event.preventDefault()
  }

  handleMintUri = (event) => {
    event.preventDefault()
  }

  handleClick = (property) => (event) => {
    event.preventDefault()
    let newOutput = this.state.output
    let input
    let lookupConfigItem, lookupConfigItems
    switch (property.type) {
      case "literal":
        input = <InputLiteral id={this.props.count}
              propertyTemplate={property}
              key={shortid.generate()}
              rtId={property.rtId} />
        break;

      case "lookup":
        lookupConfigItems = getLookupConfigItems(property);
        input = <InputLookupQA propertyTemplate={property} 
             lookupConfig={lookupConfigItems}
             rtId = {property.rtId} />
        break;

      case "resource":
        if (valueTemplateRefTest(property)){
          input = []
          property.valueConstraint.valueTemplateRefs.map((rtId) => {
            let resourceTemplate = getResourceTemplate(rtId)
            resourceTemplate.propertyTemplates.map((rtProperty) => {
              input.push(<PropertyTemplateOutline key={shortid.generate()}
                propertyTemplate={rtProperty}
                resourceTemplate={getResourceTemplate(rtId)} />)
            })
          })
          break;
        }
        lookupConfigItem = getLookupConfigItem(property)
        input = <InputListLOC propertyTemplate = {property}
             lookupConfig = {lookupConfigItem}
             rtId = {property.rtId} />

        break;
    }
    let existingInput
    newOutput.forEach((input) => {
      if (this.props.propertyTemplate.propertyURI === input.props.propertyTemplate.propertyURI) {
        existingInput = input
        return
      }
    })
    if (existingInput === undefined) {
      newOutput.push(<PropertyTypeRow
          key={shortid.generate()}
          handleAddClick={this.props.handleAddClick}
          handleMintUri={this.props.handleMintUri}
          propertyTemplate={property}>
          {input}
        </PropertyTypeRow>)
    }
    this.setState( { collapsed: !this.state.collapsed,
                     output: newOutput })
  }

  isRequired = (property) => {
    if (property.mandatory === "true") {
      return <RequiredSuperscript />
    }
  }

  outlinerClasses = () => {
    let classNames = "rOutline-property"
    if (this.state.collapsed) { classNames += " collapse"}
    return classNames
  }



  render() {
    return(<div className="rtOutline" key={shortid.generate()}>
            <OutlineHeader label={this.props.propertyTemplate.propertyLabel}
              collapsed={this.state.collapsed}
              key={shortid.generate()}
              isRequired={this.isRequired(this.props.propertyTemplate)}
              handleCollapsed={this.handleClick(this.props.propertyTemplate)} />
            <div className={this.outlinerClasses()}>
              {this.state.output}
            </div>
        </div>)
  }

}

PropertyTemplateOutline.propTypes = {
  count: PropTypes.number,
  depth: PropTypes.number,
  handleAddClick: PropTypes.func,
  handleMintUri: PropTypes.func,
  handleCollapsed: PropTypes.func,
  isRequired: PropTypes.func,
  propertyTemplate: PropTypes.object,
  rtId: PropTypes.string
}

export default PropertyTemplateOutline;