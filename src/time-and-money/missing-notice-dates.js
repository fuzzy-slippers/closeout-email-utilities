/** Time and Money Missing Notice Dates module - self contained module of code needed to refresh a google sheet so that it lists recent Time and Money documents that someone forgot to enter a notice date for (notice date is null)
 * @module missing-notice-dates
 */
const googleAppsScriptWrappers = require("../../src/google-apps-script-wrappers/google-apps-script-wrappers.js");
const apiUtils = require("../../src/api-utils.js"); 
const queries = require("../../src/queries.js"); 
const arrayUtils = require("../../src/array-utils.js");
 
// the name of the tab in the google sheet to update each time - setting as a global constant so that its easy to change - since we are doing everything start to finish in this module, need to be able to keep track of the sheet name - may want to change to an external properties json file later
const GOOGLE_SHEET_TAB_NAME = "testdata"; 

 
module.exports = {
    

    /**
     * 1. read data from sheet (maybe later re-query all these ones and alasql filter on ones still missing notice dates and then re-update sheet) - or this could be separate operation so they could be scheduled at different frequencies
     * 2. determine the highest primary key in the google sheet data read in (before the update)
     * 3. query up to X number but stop when it hits the third error with the message that the primary key is not found (cant do the first time in case there is a gap for some reason)... - add results to single 2d array
     * 4. filter on ones with notice dates missing
     * 5. append to original array read from sheet
     * 6  update sheet with results
     * 
     * @return {object} returns a database object that can then be populated with other private helper functions
     */   
    updateSheet: () => {
        
        console.log("inside missingNoticeDates.updateSheet()..")
        
        //1. read data from sheet (maybe later re-query all these ones and alasql filter on ones still missing notice dates and then re-update sheet) - or this could be separate operation so they could be scheduled at different frequencies
        const prevSheetDataTwoDimArrWHeader = googleAppsScriptWrappers.readDataInSheetWHeaderRowByName(GOOGLE_SHEET_TAB_NAME);
                                                            console.log(`prevSheetDataTwoDimArrWHeader: ${JSON.stringify(prevSheetDataTwoDimArrWHeader)}`);
        
        //2. determine the highest primary key in the google sheet data read in (before the update)
        const prevSheetMaxPrimaryKeyVal = module.exports.findMaxPrimaryKeyValueInData(prevSheetDataTwoDimArrWHeader);
                                                            console.log(`prevSheetMaxPrimaryKeyVal: ${prevSheetMaxPrimaryKeyVal}`);
        //3. query data by increasing primary key values until we hit an error with the message that that primary key is not found 
        //later may want to improve so that we can handle gaps in primary keys (wait until the 3rd error on the 3rd primary key past the last one for example, but for now stopping on first error)
        const newApiCallsTwoDimArrWHeader = module.exports.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys(prevSheetMaxPrimaryKeyVal);
                                                            console.log(`newApiCallsTwoDimArrWHeader: ${JSON.stringify(newApiCallsTwoDimArrWHeader)}`);
        
                            googleAppsScriptWrappers.updNamedSheetWArrWHeaderRow(GOOGLE_SHEET_TAB_NAME, newApiCallsTwoDimArrWHeader);
    },
    

//Note: getAwardAmountTransactionByPrimaryKey inside the api-utils.js module (for reasons of getting the testing/rewire mocks to work)
    

    /**
     * determine the max _primaryKey column value in a data set
     * 
     * @param {object[][]} two dim array with header row (one column must be named _primaryKey) to search through for the max primary key val
     * @return {number} the single numeric value of the max _primaryKey in the data set
     */     
     //the queries.findMaxPrimaryKeyInAllDataRows returns an array with a single column of max_prim_key and single data row with the max primary key value - returning just the number in the 2nd row (array row position 1), first column (0th array column position) which is the max primary key as this function returns just the numeric primary key value
     findMaxPrimaryKeyValueInData: (twoDimArrWHeader) => queries.findMaxPrimaryKeyInAllDataRows(twoDimArrWHeader)[1][0],
     
    
    /**
     * based on the most recent primary key on the previous data, query the next higher primary key over and over, assembling the data together until we hit an error indicating a primary key value does not exist in KR with our last API call, return the combined data gathered up to that point
     * 
     * @param {number} the highest primary key in the previous sheet data, prior to trying to query the next X rows/records via API calls
     * @return {object[][]} a two dimentional array containing a header row and then as many rows of data as we were able to do successful API calls with increasingly higher primary key values this round (depends on whether we were already at the max primary key in the system or not or if there was new data to pull)
     */
    gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys: (maxPreviouslyUsedPrimaryKey) => {
        
        //may want to make this functional (recursive) in the future, for now using do...while loop
        const arrApiCallsJsObjs = []; 
                                        // console.log(`arrApiCallsJsObjs before do loop: ${JSON.stringify(arrApiCallsJsObjs)}`);
                
        do {
                                                    // console.log(`arrApiCallsJsObjs: ${JSON.stringify(arrApiCallsJsObjs)}`);            
            
            // the first time when no api calls have been made yet use the passed in primary key ("previous" from the data in the existing spreadsheet) as a starting point, every other time, we should be able to get the primary key value from the last element in the array (primary key property on that object)
            if (arrApiCallsJsObjs.length === 0) 
                arrApiCallsJsObjs.push(module.exports.apiCallOnNextHigherPrimaryKey(maxPreviouslyUsedPrimaryKey));
            else
                arrApiCallsJsObjs.push(module.exports.apiCallOnNextHigherPrimaryKey(arrayUtils.lastArrElement(arrApiCallsJsObjs)._primaryKey));
                
                                                                    // console.log(`arrApiCallsJsObjs inside loop: ${JSON.stringify(arrApiCallsJsObjs)}`);
                                                                    // console.log(`arrayUtils.lastArrElement(arrApiCallsJsObjs) inside loop: ${JSON.stringify(arrayUtils.lastArrElement(arrApiCallsJsObjs))}`);
                                                                    // console.log(`module.exports.isErrorObj(arrayUtils.lastArrElement(arrApiCallsJsObjs)) inside loop: ${JSON.stringify(module.exports.isErrorObj(arrayUtils.lastArrElement(arrApiCallsJsObjs)))}`);
        }
        // continue until the last object added to the array above is an error object, indicating that we have reached a primary key that has not been assigned yet to a record
        while (!module.exports.isErrorObj(arrayUtils.lastArrElement(arrApiCallsJsObjs)));
        
                                        // console.log(`arrApiCallsJsObjs after loop: ${JSON.stringify(arrApiCallsJsObjs)}`);
        
        //remove the last element from the array which was found to be an error object (hit the end of valid records by primary key value)
        arrApiCallsJsObjs.pop();
        
        //convert from a 1d array of js objects to a 2d array with a header row as that is the useful format of the data (alasql queries, google sheets, etc)
        return arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(arrApiCallsJsObjs);
    },     
    
    /**
     * checks if the passed in object is the result of an API call that threw an error (we are expecting all API calls that return an error to have an Error property on th object to indicate an error of some sort was thrown)
     * 
     * @param {object} a javascript object representing either 1) the data result of an API call..converted from JSON to a js object or 2) an API call error returned, and converted from JSON about the error to a js object with an Error property
     * @return {boolean} the result of trying to detect if either true: the js object represents a failed API call/error or false: it's valid data in the js object
     */
    isErrorObj: (jsObj) => jsObj.hasOwnProperty("Error"),     
     

    /**
     * calls the api to try to get data for the next primary key, one more than the last called API (or the last primary key in the existing spreadsheet if passing in the last highest primary key value)
     * 
     * @param {number} the current (or previous depending on how you look at it) primary key value that we already got data for - allows us to increment and try to retrieve data for the next primary key
     * @return {object} the js object version of the API call results (either a js object with valid data or a js object with Error properties)
     */
    apiCallOnNextHigherPrimaryKey: (previouslyUsedPrimaryKey) => apiUtils.apiGetCallKr("/award/api/v1/award-amount-transactions/" + (Number(previouslyUsedPrimaryKey) + 1)), 
     
    /**
     * go through each row in array and append award-transaction results to overwrite row with that primary key 
     * 
     */        


//read data from sheet (maybe later re-query all these ones and alasql filter on ones still missing notice dates and then re-update sheet) - or this could be separate operation so they could be scheduled at different frequencies

     
    
    /**
     * add later!!!!!!!!!!!!!!!!!
     * 
     * @return {object} returns a database object that can then be populated with other private helper functions
     */   
    sendHelloWorld: () => [["col1"], ["hello world"]]
    
}