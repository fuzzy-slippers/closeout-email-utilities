/** utility functions that are in between the wrapped google apps script global API function calls and using the data - converts the data into valid js objects from raw json and handles errors
 * * @module api-utils
 */
 
const googleAppsScriptWrappers = require("../src/google-apps-script-wrappers/google-apps-script-wrappers.js");


module.exports = {
    
    /**
     * checks if the passed in object is the result of an API call that threw an error (we are expecting all API calls that return an error to have an Error property on th object to indicate an error of some sort was thrown)
     * 
     * @param {object} a javascript object representing either 1) the data result of an API call..converted from JSON to a js object or 2) an API call error returned, and converted from JSON about the error to a js object with an Error property
     * @return {boolean} the result of trying to detect if either true: the js object represents a failed API call/error or false: it's valid data in the js object
     */
    isErrorObj: (jsObj) => jsObj.hasOwnProperty("Error"),    

    /**
     * utility function that calls the wrapped callKrGetApiWithWait method and converts the results from JSON into a js object (or return a js object with an Error property if there was any kind of error with the API call or parsing the results as JSON)
     * 
     * @return {object} is a js object of the JSON returned by the API GET call with properties or a js object with an Error property if there were any errors encountered (however all errors are caught so the program execution continues)
     */  
    apiGetCallKr: (relativeUriPath) => {
        console.log(`node - top of get_award_amount_transaction_by_pri_key()`);
        //we want to handle when an API call returns an error gracefully - uncaught errors halt the program operation - instead catch the error but then return back the JSON returned with the error object
        try {
            //call the API with the primary key after the slash (no url variables needed for API calls with the primary key specified)
            const returnedByApiCall = googleAppsScriptWrappers.callKrGetApiWithWait(relativeUriPath);
                                                 // console.log(`from node - initial raw result returned from api call (jsonReturnedByApiCall var) shows: ${returnedByApiCall}`);
            try {
                //if valid json is returned back (should be when there is data found and returned from the API) - convert the raw json returned to a javascript object - we want to return back a javascript object
                const jsObjToReturn = JSON.parse(returnedByApiCall);    
                                                // console.log(`from node - got past the json.parse step and now its showing obj jsObjToReturn: ${JSON.stringify(jsObjToReturn)}`);
                return jsObjToReturn;
            }
            catch (e) {
                const jsonParseErrorObj = {};
                jsonParseErrorObj.Error = e;
                                                    // console.log(`from node - the json.parse step caused an error with the following jsonReturnedByApiCall string: ${returnedByApiCall} so we will be returning (jsonParseErrorObj): ${JSON.stringify(jsonParseErrorObj)}`);
                return jsonParseErrorObj;
            }
        }
        catch(e) {
            const apiCallErrorObj = {};
            apiCallErrorObj.Error = e;
                                                    // console.log(`from node - there was an error with the api call, here is the error object returned (apiCallErrorObj): ${JSON.stringify(apiCallErrorObj)}`);
            return apiCallErrorObj;
        }
    },
    
    
    
// Note: although it would logically be better to have the below functions inside the library for each validation, etc like the getAwardAmountTransactionByPrimaryKey inside missing-notice-dates
// due to a quirk that when testing these specific api call with url functions we cant mock out the api call function if the module its in is required/imported, rather than in the module being tested - so combining them into a big module so the API call function apiGetCallKr cant be overwridden when testing any of the specific functions for each specific API url
    
    /**
     * make API call for single award-amount-transactions API by primary key and converts the results from JSON into a js object
     * 
     * @return {object} returns either a single award-amount-transaction object with noticeDate, etc or an object with an Error subobject with an errors array of strings if an error occured during the API call
     */  
    getAwardAmountTransactionByPrimaryKey: (primaryKey) => module.exports.apiGetCallKr("/award/api/v1/award-amount-transactions/" + primaryKey)
    


};


