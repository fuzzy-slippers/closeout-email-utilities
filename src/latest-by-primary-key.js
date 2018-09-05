/** validation helper module that allows you to find the latest records by _primaryKey of a given API, keep track of the last primary key checked via a property in case the spreadsheet is empty, etc
 * @module latest-by-primary-key
 */
const googleAppsScriptWrappers = require("../src/google-apps-script-wrappers/google-apps-script-wrappers.js");
const apiUtils = require("../src/api-utils.js"); 
const queries = require("../src/queries.js"); 
const arrayUtils = require("../src/array-utils.js");

module.exports = {

//Note: getAwardAmountTransactionByPrimaryKey inside the api-utils.js module (for reasons of getting the testing/rewire mocks to work)
    

    /**
     * determine the max _primaryKey column value in a data set - if the data set is empty, use a google apps script property to pull the cached last highest primary key value instead (otherwise we can get into the situation where we lose track of which of where in the 20,000 possible primary keys we have already checked and which we havent)
     * 
     * @param {string} the name of the column to scan for the max numeric value (looks like alaSQL can only handle MAX on numeric values)
     * @param {object[][]} two dim array with header row (one column must be named _primaryKey) to search through for the max primary key val
     * @param {string} the relative KR api endpoint, such as "/award/api/v1/award-amount-transactions/" used as part of the property name so we can keep track of the latest _primaryKey for each of the various endpoints as they will all have different latest primary keys at any given moment
     * @return {number} the single numeric value of the max _primaryKey in the data set or cached/GAS property from last run if the data set is empty
     */     
     //the queries.findMaxPrimaryKeyInAllDataRows returns an array with a single column of max_prim_key and single data row with the max primary key value - returning just the number in the 2nd row (array row position 1), first column (0th array column position) which is the max primary key as this function returns just the numeric primary key value
     findMaxPrimaryKeyValueInData: (colToFindMax, twoDimArrWHeader, relativeUriPath) => {
        // make sure the data set is not empty (had data rows)
        if (twoDimArrWHeader.length > 0)
        {
            //in which case find the highest/max primary key in the data 
            const maxPrimKeyValueInDataSetFoundThisTime = queries.findMaxColValInAllDataRows(colToFindMax, twoDimArrWHeader)[1][0];
            //update the GAS script level property store with the max primary key for this API endpoint for the next time this is called and data is blank - updates the latest primary key value cached/GAS property so that in the future if there are blank data sets we have the most up to date record of the last highest primary key we have validated on
            googleAppsScriptWrappers.setScriptProperty("MAX_PRIMARY_KEY_" + relativeUriPath, maxPrimKeyValueInDataSetFoundThisTime);
            //and return that primary key value
            return maxPrimKeyValueInDataSetFoundThisTime;
        }
        else {
            // otherwise if the data set passed in was an empty (0 rows), use the cached/GAS property last _primaryKey to send back as the max primary key to start querying from
            return googleAppsScriptWrappers.getScriptProperty("MAX_PRIMARY_KEY_" + relativeUriPath);
        }          
     },
    
    
    /**
     * based on the most recent primary key on the previous data, query the next higher primary key over and over, assembling the data together until we hit an error indicating a primary key value does not exist in KR with our last API call, return the combined data gathered up to that point
     * 
     * @param {number} the highest primary key in the previous sheet data, prior to trying to query the next X rows/records via API calls
     * @param {string} the relative KR api endpoint, such as "/award/api/v1/award-amount-transactions/" allowing us to use this same function to find the next api key no matter which API data we are validating/looking at
     * @return {object[][]} a two dimentional array containing a header row and then as many rows of data as we were able to do successful API calls with increasingly higher primary key values this round (depends on whether we were already at the max primary key in the system or not or if there was new data to pull)
     */
    gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys: (maxPreviouslyUsedPrimaryKey, relativeUriPath) => {
        
        //may want to make this functional (recursive) in the future, for now using do...while loop
        const arrApiCallsJsObjs = []; 
                                                                        // console.log(`arrApiCallsJsObjs before do loop: ${JSON.stringify(arrApiCallsJsObjs)}`);
        do {
                                                                        // console.log(`arrApiCallsJsObjs: ${JSON.stringify(arrApiCallsJsObjs)}`);            
            // the first time when no api calls have been made yet use the passed in primary key ("previous" from the data in the existing spreadsheet) as a starting point, every other time, we should be able to get the primary key value from the last element in the array (primary key property on that object)
            if (arrApiCallsJsObjs.length === 0) 
                arrApiCallsJsObjs.push(module.exports.apiCallOnNextHigherPrimaryKey(maxPreviouslyUsedPrimaryKey, relativeUriPath));
            else
                arrApiCallsJsObjs.push(module.exports.apiCallOnNextHigherPrimaryKey(arrayUtils.lastArrElement(arrApiCallsJsObjs)._primaryKey, relativeUriPath));
                                                                    // console.log(`arrApiCallsJsObjs inside loop: ${JSON.stringify(arrApiCallsJsObjs)}`);
                                                                    // console.log(`arrayUtils.lastArrElement(arrApiCallsJsObjs) inside loop: ${JSON.stringify(arrayUtils.lastArrElement(arrApiCallsJsObjs))}`);
                                                                    // console.log(`apiUtils.isErrorObj(arrayUtils.lastArrElement(arrApiCallsJsObjs)) inside loop: ${JSON.stringify(apiUtils.isErrorObj(arrayUtils.lastArrElement(arrApiCallsJsObjs)))}`);
        }
        // continue until the last object added to the array above is an error object, indicating that we have reached a primary key that has not been assigned yet in KR and therefore there is no more data to retrieve that is newer than what is already in the spreadsheet
        while (!(arrayUtils.lastArrElement(arrApiCallsJsObjs)).hasOwnProperty("Error"));
        //NOTE: need to switch back to isErrorObj utility function instead of .hasOwnProperty for readability and maintainability of error object criteria but for now having trouble getting it to recognise that function for some unknown reason after moving it from this module to the api-utils module - where clause should really be:  while (!apiUtils.isErrorObj(arrayUtils.lastArrElement(arrApiCallsJsObjs));
                                                                    // console.log(`arrApiCallsJsObjs after loop: ${JSON.stringify(arrApiCallsJsObjs)}`);
        //remove the last element from the array which was found to be an error object (hit the end of valid records by primary key value)
        arrApiCallsJsObjs.pop();
        //convert from a 1d array of js objects to a 2d array with a header row as that is the useful format of the data (alasql queries, google sheets, etc)
        return arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(arrApiCallsJsObjs);
    },     
    
     

    /**
     * calls the api to try to get data for the next primary key, one more than the last called API (or the last primary key in the existing spreadsheet if passing in the last highest primary key value)
     * 
     * @param {number} the current (or previous depending on how you look at it) primary key value that we already got data for - allows us to increment and try to retrieve data for the next primary key
     * @param {string} the relative KR api endpoint, such as "/award/api/v1/award-amount-transactions/" allowing us to use this same function to find the next api key no matter which API data we are validating/looking at
     * @return {object} the js object version of the API call results (either a js object with valid data or a js object with Error properties)
     */
    apiCallOnNextHigherPrimaryKey: (previouslyUsedPrimaryKey, relativeUriPath) => apiUtils.apiGetCallKr(relativeUriPath + (Number(previouslyUsedPrimaryKey) + 1)), 
    
     

};     