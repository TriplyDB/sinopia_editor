// Copyright 2018 Stanford University see Apache2.txt for license
import React, { Component } from 'react'
import { asyncContainer, Typeahead, Menu, MenuItem } from 'react-bootstrap-typeahead'
import PropTypes from 'prop-types'
import Swagger from 'swagger-client'
import { connect } from 'react-redux'
import { changeSelections } from '../../actions/index'
import {groupBy} from 'lodash';

const AsyncTypeahead = asyncContainer(Typeahead)

class InputLookupQA extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false
    }
  }

  render() {
    
    let isMandatory, isRepeatable, authority, subauthority, language, lookupConfig
    const lookupConfigs = this.props.lookupConfig
    
    try {
      isMandatory = JSON.parse(this.props.propertyTemplate.mandatory)
      isRepeatable = JSON.parse(this.props.propertyTemplate.repeatable)
      /***Passing lookupConfig as array of configs and not just one config***/
      //lookupConfigs = this.props.lookupConfig
      //lookupConfig = lookupConfigs[0]
      //authority = lookupConfig.value.authority
      //subauthority = lookupConfig.value.authority
      //language = lookupConfig.value.language
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
      delay: 300 // was 300
    }

    return (
      <div>
        <AsyncTypeahead id="lookupComponent"
        
         renderMenu={(results, menuProps) => {
         		//Returning results per each promise
         		//If error is returned, it will be used to display for that source
         		const items = [];
         		let r, i, authLabel, resultsLength, authURI, headerKey, result;
         		resultsLength = results.length;
         		let idx = 0;
         		for(i = 0; i < resultsLength; i++) {
         		    result = results[i];
               		authLabel = results[i].authLabel;
               		authURI = results[i].authURI;
               		headerKey = authURI + "-header";
               		console.log(authLabel + "=" + authURI);
               		//Add header only if more than one authority request
               		if(resultsLength > 1)
               			items.push(  <Menu.Header key={headerKey}>
			            	{authLabel}
			          	</Menu.Header>);
			        //For this authority, display results
			        if("isError" in result) {
			        	//if error, then get error from within result and display that message
			        	let errorMessage = "An error occurred in retrieving results";
			        	let errorHeaderKey = headerKey + "-error";
			        	items.push(  <Menu.Header key={errorHeaderKey}>
			            	{errorMessage}
			          	</Menu.Header>);
			        	//console.log(result["errorObject"]);
			        } else {
			        	//if not error, print out items for result
				        r = result.body;
				        //to test, r = [];
				        r.forEach(function(result) {
				        	items.push( <MenuItem option={result} position={idx} key={idx}>
	    			          {result.label}
	    			        </MenuItem>);
	    			        idx++;
				        });
				        //if the length of results is zero we need to show that as well
				        if(r.length == 0) {
				        	let noResultsMessage = "No results for this lookup";
				        	let noResultsHeaderKey = headerKey + "-noResults";
				        	items.push(  <Menu.Header key={noResultsHeaderKey}>
	    			          {noResultsMessage}
	    			        </Menu.Header>);
				        }
				        
			        }
               	}
         		
	         return (
			    <Menu {...menuProps}>
			     {items}
			    </Menu>
			  )
		  	}
		  }
        
        
          onSearch={query => {
            this.setState({isLoading: true});
            Swagger({ url: "src/lib/apidoc.json" }).then((client) => {
              //create array of promises based on the lookup config array that is sent in
              let lookupPromises = lookupConfigs.map(lookupConfig => {
              	authority = lookupConfig.value.authority;
      			subauthority = lookupConfig.value.authority;
      			language = lookupConfig.value.language;
      			//return the 'promise' 
      			//Since we don't want promise.all to fail if
      			//one of the lookups fails, we want a catch statement
      			//at this level which will then return the error
      			return client
	                .apis
	                .SearchQuery
	                .GET_searchAuthority({
	                  q: query,
	                  vocab: authority,
	                  subauthority: subauthority,
	                  maxRecords: 8,
	                  lang: language
	                })
	                .catch(function(err) {
	                	console.error("ERROR", err);
	                	//return information along with the error in its own object
	                	return {"isError":true, "errorObject":err};
	                });
	                
              });
             //to test 
             //lookupPromises[0] = new Promise(function(resolve, reject) { reject("rejection is hard"); }).catch(function(err){console.error(err);return {"isError":true, "errorObject":new Error(err)};});
              
             Promise.all(lookupPromises).then((values) => {
                
               		 let valuesLength = values.length;
               		 let i;
               		 for(i = 0; i < valuesLength; i++) {
               		 	//If undefined, add info - note if error, error object returned in object
               		 	//which allows attaching label and uri for authority
               		 	if(values[i]) {
							values[i]["authLabel"]=lookupConfigs[i].value.label;
	               		 	values[i]["authURI"]=lookupConfigs[i].value.uri;
               		 	}
               		 }
               		
                this.setState({
	                isLoading: false,
	                options:values
	              })
               }
              )
            }).catch(() => { return false })
          }}
          onChange={selected => {
            let payload = {
                id: this.props.propertyTemplate.propertyURI,
                items: selected,
                rtId: this.props.rtId
              }
              this.props.handleSelectedChange(payload)
            }
          }
          {...typeaheadProps}

			filterBy={(option, props) => {
				/** Currently don't want any default filtering as we want all the results returned from QA, also we are passing in a complex object **/
    			/* Your own filtering code goes here. */
    			return true;
  			}}
        />
      </div>
    )
  }
}

InputLookupQA.propTypes = {
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
  let result = Object.assign({},state)
  return result
}

const mapDispatchtoProps = dispatch => ({
  handleSelectedChange(selected){
    dispatch(changeSelections(selected))
  }
})

export default connect(mapStatetoProps, mapDispatchtoProps)(InputLookupQA)
