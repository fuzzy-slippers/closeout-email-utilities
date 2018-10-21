/** utility functions that are in between the wrapped google apps script global API function calls and using the data - converts the data into valid js objects from raw json and handles errors
 * * @module api-utils
 */
const url = require('url');
 
const googleAppsScriptWrappers = require("../src/google-apps-script-wrappers/google-apps-script-wrappers.js");
const objUtils = require("../src/obj-utils.js");
const log = require("../src/log-utils.js");


module.exports = {
    
    /**
     * checks if the passed in object is the result of an API call that threw an error (we are expecting all API calls that return an error to have an Error property on th object to indicate an error of some sort was thrown)
     * 
     * @param {object} a javascript object representing either 1) the data result of an API call..converted from JSON to a js object or 2) an API call error returned, and converted from JSON about the error to a js object with an Error property
     * @return {boolean} the result of trying to detect if either true: the js object represents a failed API call/error or false: it's valid data in the js object
     */
    hasErrorProperty: (jsObj) => jsObj.hasOwnProperty("Error"),    

    /**
     * DEPRICATED (ZF) - use apiGetCallKrWDotEndpointNames (which calls this helper function) for most if not all situations as we want all sheet columns to have the API endpoint name prepended before the column name for good joins and no overwriting column names that are the same from different API endpoints 
     * utility function that calls the wrapped callKrGetApiWithWait method and converts the results from JSON into a js object (or return a js object with an Error property if there was any kind of error with the API call or parsing the results as JSON)
     * 
     * @param {string} the relative path of the API endpoint/URI to call (list of endpoints at https://umd-sbx.kuali.co/res/apidocs/)
     * @return {object} is a js object of the JSON returned by the API GET call with properties or a js object with an Error property if there were any errors encountered (however all errors are caught so the program execution continues)
     */  
    apiGetCallKrNoPrefixes: (relativeUriPath) => {
        log.trace(`api-utils apiGetCallKrNoPrefixes(${relativeUriPath}) called...`);
        //we want to handle when an API call returns an error gracefully - uncaught errors halt the program operation - instead catch the error but then return back the JSON returned with the error object
        try {
            //call the API with the primary key after the slash (no url variables needed for API calls with the primary key specified)
            const returnedByApiCall = googleAppsScriptWrappers.callKrGetApiWithWait(relativeUriPath);
            log.trace(`initial raw result returned from api call, returnedByApiCall: ${returnedByApiCall}`);
            try {
                //if valid json is returned back (should be when there is data found and returned from the API) - convert the raw json returned to a javascript object - we want to return back a javascript object
                const jsObjToReturn = JSON.parse(returnedByApiCall);    
                                                // console.log(`from node - got past the json.parse step and now its showing obj jsObjToReturn: ${JSON.stringify(jsObjToReturn)}`);
                return jsObjToReturn;
            }
            catch (e) {
                const jsonParseErrorObj = {};
                jsonParseErrorObj.Error = e;
                log.error(`api-utils apiGetCallKrNoPrefixes returned error on parsing to JSON step: ${e}`);
                                                    // console.log(`from node - the json.parse step caused an error with the following jsonReturnedByApiCall string: ${returnedByApiCall} so we will be returning (jsonParseErrorObj): ${JSON.stringify(jsonParseErrorObj)}`);
                return jsonParseErrorObj;
            }
        }
        catch(e) {
            const apiCallErrorObj = {};
            apiCallErrorObj.Error = e;
            log.error(`api-utils apiGetCallKrNoPrefixes returned error on googleAppsScriptWrappers.callKrGetApiWithWait(relativeUriPath) step: ${e}`);            
                                                    // console.log(`from node - there was an error with the api call, here is the error object returned (apiCallErrorObj): ${JSON.stringify(apiCallErrorObj)}`);
            return apiCallErrorObj;
        }
    },
    
    /**
     * similar to apiGetCallKrNoPrefixes but all returned data will have column/property names that are in the format [api_endpoint_name].[property name] to help with joins so we can distinguish between columns from different API endpoint data sets
     * @example
     * // returns [{"award-types.code":1,"award-types.description":"Grant","award-types._primaryKey":"1"}]
     * apiUtils.apiGetCallKrWDotEndpointNames("/award/api/v1/award-types/");
     * 
     * @param {string} the relative path of the API endpoint/URI to call (list of endpoints at https://umd-sbx.kuali.co/res/apidocs/)
     * @return {object} is a js object (or array of objects) of the JSON returned by the API GET call with properties (but with enpoint names and dots prepended to property names) or a js object with an Error property if there were any errors encountered (however all errors are caught so the program execution continues)
     * 
     */  
    apiGetCallKr: (relativeUriPath) => {
        log.trace(`api-utils apiGetCallKr(${relativeUriPath}) called...`);  
        //use apiGetCallKr to actually make the API call and format the data returned (depending on the API called will either be a js object or an array of js objects)
        const apiGetCallKrRetObjOrArr = module.exports.apiGetCallKrNoPrefixes(relativeUriPath);
        //get the endpoint name from the API path (for example "award-types" from "award/api/v1/award-types/")
        const endpointName = module.exports.extractApiEndpointNameFromUri(relativeUriPath);
        //use the prependAllObjKeys function to add the endpoint name (with a period separator) on the left side of every object property (column name) returned from the API
        return objUtils.prependAllArrOfObjKeys(apiGetCallKrRetObjOrArr, endpointName.concat("."));
    },
    
    /**
     * pulls out the just the endpoint name from a partial or full URL string passed in
     * @example
     * // returns "award-types"
     * apiUtils.apiGetCallKrWDotEndpointNames("/award/api/v1/award-types/");
     * 
     * @param {string} an API endpoint (uri) either relative or full as a string/path
     * @return {string} is a js object (or array of objects) of the JSON returned by the API GET call with properties (but with enpoint names and dots prepended to property names) or a js object with an Error property if there were any errors encountered (however all errors are caught so the program execution continues)
     * 
     */      
    extractApiEndpointNameFromUri(partialOrFullUriString) {
        log.trace(`api-utils extractApiEndpointNameFromUri(${partialOrFullUriString}) called...`);        
        //utilize the older node built in url (url.parse) module (imported/required above)
        const whatwgUrlObject = url.parse(partialOrFullUriString);
        //pull out just the "pathname" portion which is everything between the domain and query params like /category/articlename.html
        const onlyPathPortion = whatwgUrlObject.pathname;
        //use a regular expression that does not match "/" or any numbers, only matching words formed of letters and "-" chars (all KR endpoint names are letters and "-"s only)
        var regex = /[a-zA-Z\-]+/g;
        var arrRegexMatchesNonNumericWDashes = onlyPathPortion.match(regex);
        //once numbers and empty strings at the end are filterd out, the last portion of the path should be the endpoint name
        return arrRegexMatchesNonNumericWDashes[arrRegexMatchesNonNumericWDashes.length - 1];
    },    
    
// // Note: although it would logically be better to have the below functions inside the library for each validation, etc like the getAwardAmountTransactionByPrimaryKey inside missing-notice-dates
// // due to a quirk that when testing these specific api call with url functions we cant mock out the api call function if the module its in is required/imported, rather than in the module being tested - so combining them into a big module so the API call function apiGetCallKr cant be overwridden when testing any of the specific functions for each specific API url
    
//     /**
//      * make API call for single award-amount-transactions API by primary key and converts the results from JSON into a js object
//      * 
//      * @return {object} returns either a single award-amount-transaction object with noticeDate, etc or an object with an Error subobject with an errors array of strings if an error occured during the API call
//      */  
//     getAwardAmountTransactionByPrimaryKey: (primaryKey) => module.exports.apiGetCallKr("/award/api/v1/award-amount-transactions/" + primaryKey)
    


};


