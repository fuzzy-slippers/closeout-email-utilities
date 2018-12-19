/** validation helper module that allows you to find the latest records by _primaryKey of a given API, keep track of the last primary key checked via a property in case the spreadsheet is empty, etc
 * @module latest-by-primary-key
 */
const googleAppsScriptWrappers = require("../src/google-apps-script-wrappers/google-apps-script-wrappers.js");
const apiUtils = require("../src/api-utils.js"); 
const queries = require("../src/queries.js"); 
const arrayUtils = require("../src/array-utils.js");
const objUtils = require("../src/obj-utils.js");
const log = require("../src/log-utils.js");

module.exports = {

//TODO: set up some kind of parameter that will have it only check the next 100/whatever award amount transactions and then stop (gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys) - so that we dont hit the limit of how long scheduled tasks can run - if the program doesnt run for a while and then suddenly is checking 1000 new transactions, it might time out each time after the 3 mins without getting to update the google sheet at all

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
        log.trace(`latest-by-primary-key findMaxPrimaryKeyValueInData(${colToFindMax}, ${twoDimArrWHeader}, ${relativeUriPath}) called...`);         
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
     * @param {string} the column name of the key field in the first API call data results (the main data we are compiling together until we hit a primary key that does not yet exist)
     * @param {string} the relative KR api endpoint of the second api to use to check document status, such as "/research-sys/api/v1/document-route-header-values/"
     * @param {string} the column name (that should be in the results data) from the first API call to use to query a particular document from the second api endpoint (for example the doc number to then query the doc status endpoint for that particular doc number)
     * @return {object[][]} a two dimentional array containing a header row and then as many rows of data as we were able to do successful API calls with increasingly higher primary key values this round (depends on whether we were already at the max primary key in the system or not or if there was new data to pull)
     */
    gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys: (maxPreviouslyUsedPrimaryKey, relativeUriPath, firstApiKeyName, secApiCallRelativeUriPath, propFromFirstApiResultsUseAsSecondApiCallParam) => {
        log.trace(`latest-by-primary-key gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys: (${maxPreviouslyUsedPrimaryKey}, ${relativeUriPath}) called...`);           
        const endPointName = apiUtils.extractApiEndpointNameFromUri(relativeUriPath);
        const endPointNameSecondApiCall = apiUtils.extractApiEndpointNameFromUri(secApiCallRelativeUriPath); 
        
        //may want to make this functional (recursive) in the future, for now using do...while loop
        const arrApiCallsJsObjs = []; 
                                                                        // console.log(`arrApiCallsJsObjs before do loop: ${JSON.stringify(arrApiCallsJsObjs)}`);
        do {
            
/*            
            if (arrApiCallsJsObjs.length === 0) 
                arrApiCallsJsObjs.push(module.exports.apiCallOnNextHigherPrimaryKey(maxPreviouslyUsedPrimaryKey, relativeUriPath));
            else  
                //every other time, we should be able to get the primary key value from the last element in the array (primary key property on that object - the function only works to find the latest primary key value...if we wanted to find the latest value of some other column name we would need to update the function)
                arrApiCallsJsObjs.push(module.exports.apiCallOnNextHigherPrimaryKey(arrayUtils.lastArrElement(arrApiCallsJsObjs)[`${endPointName}._primaryKey`], relativeUriPath));            
*/            
            
                                                                        // console.log(`arrApiCallsJsObjs: ${JSON.stringify(arrApiCallsJsObjs)}`);            
            // the first time when no api calls have been made yet use the passed in primary key ("previous" from the data in the existing spreadsheet) as a starting point
            if (arrApiCallsJsObjs.length === 0) 
                arrApiCallsJsObjs.push(module.exports.apiCallsOnNextHigherPrimaryKey(maxPreviouslyUsedPrimaryKey, relativeUriPath, propFromFirstApiResultsUseAsSecondApiCallParam, secApiCallRelativeUriPath));
            else  
                //every other time, we should be able to get the primary key value from the last element in the array (primary key property on that object - the function only works to find the latest primary key value...if we wanted to find the latest value of some other column name we would need to update the function)
                arrApiCallsJsObjs.push(module.exports.apiCallsOnNextHigherPrimaryKey(arrayUtils.lastArrElement(arrApiCallsJsObjs)[`${endPointName}._primaryKey`], relativeUriPath, propFromFirstApiResultsUseAsSecondApiCallParam, secApiCallRelativeUriPath));
        }
        // continue until the last object added to the array above is an error object, indicating that we have reached a primary key that has not been assigned yet in KR and therefore there is no more data to retrieve that is newer than what is already in the spreadsheet
        while (!apiUtils.hasErrorProperty(arrayUtils.lastArrElement(arrApiCallsJsObjs)));
        //remove the last element from the array which was found to be an error object (hit the end of valid records by primary key value)
        arrApiCallsJsObjs.pop();
        //convert from a 1d array of js objects to a 2d array with a header row as that is the useful format of the data (alasql queries, google sheets, etc)
        const twoDArrWHeaderAllData =  arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(arrApiCallsJsObjs);
        //in case any of the API data is still in non string format convert return values into 2d array of string values (and also in case there are null values in the API data, convert to empty strings)
        return arrayUtils.convertTwoDimArrToAllStrings(twoDArrWHeaderAllData);
        
    },     
    
     

    /**
     * first calls the api to try to get data for the next primary key, one more than the last called API (or the last primary key in the existing spreadsheet if passing in the last highest primary key value), then right after calls the second api endpoint and using as the key the value of one of the properties from the results of the first API call (property name specified) - the results are then smooshed/joined into a single js object with both sets of properties which is returned back
     * 
     * @param {number} the current (or previous depending on how you look at it) primary key value that we already got data for - allows us to increment and try to retrieve data for the next primary key
     * @param {string} the relative KR api endpoint for the main API we will call, such as "/award/api/v1/award-amount-transactions/" allowing us to use this same function to find the next api key no matter which API data we are validating/looking at
     * @param {string} the name of the property/column, for example "award-amount-transactions.documentNumber", that contains the key to add to the righthand side of the second endpoint of the second followup API call to get the document status type info
     * @param {string} the relative KR api endpoint for the second API call to pull in status info, such as the document status at "/research-sys/api/v1/document-route-header-values/"
     * @return {object} the js object version of the API call results (either a js object with valid data or a js object with Error properties)
     */
    apiCallsOnNextHigherPrimaryKey: (previouslyUsedPrimaryKey, firstApiCallRelativeUriPath, propFromFirstApiResultsUseAsSecondApiCallParam, secApiCallRelativeUriPath) => {
        log.trace(`latest-by-primary-key apiCallsOnNextHigherPrimaryKey: (${previouslyUsedPrimaryKey}, ${firstApiCallRelativeUriPath}, ${propFromFirstApiResultsUseAsSecondApiCallParam}, ${secApiCallRelativeUriPath}) called...`);
        //query the first api based on the next primary key value
        const jsonObjFirstApiResult = apiUtils.apiGetCallKr(firstApiCallRelativeUriPath + (Number(previouslyUsedPrimaryKey) + 1));
        console.log(`#################jsonObjFirstApiResult: ${JSON.stringify(jsonObjFirstApiResult)}###############`);
        //TODO: handle errors in the first API call............
        //query the second api using the value of a property (such as doc number) from the first Api results
        console.log(`#################jsonObjFirstApiResult[propFromFirstApiResultsUseAsSecondApiCallParam]: ${JSON.stringify(jsonObjFirstApiResult[propFromFirstApiResultsUseAsSecondApiCallParam])}###############`); 
        console.log(`#################apiUtils.apiGetCallKr(secApiCallRelativeUriPath + jsonObjFirstApiResult[propFromFirstApiResultsUseAsSecondApiCallParam]): ${JSON.stringify(apiUtils.apiGetCallKr(secApiCallRelativeUriPath + jsonObjFirstApiResult[propFromFirstApiResultsUseAsSecondApiCallParam]))}###############`);
        console.log(`#################propFromFirstApiResultsUseAsSecondApiCallParam: ${propFromFirstApiResultsUseAsSecondApiCallParam}###############`);   
        const jsonObjSecApiResult = apiUtils.apiGetCallKr(secApiCallRelativeUriPath + jsonObjFirstApiResult[propFromFirstApiResultsUseAsSecondApiCallParam]);
        console.log(`#################jsonObjSecApiResult: ${JSON.stringify(jsonObjSecApiResult)}###############`);        
        const arrOfReturnValueObjsFromBothApiCalls = [jsonObjFirstApiResult,jsonObjSecApiResult];
        console.log(`#################arrOfReturnValueObjsFromBothApiCalls: ${JSON.stringify(arrOfReturnValueObjsFromBothApiCalls)}###############`);             
        //merge the 2 objects into one object with properties from both (has properties/data returned from both api calls)
        console.log(`#################objUtils.mergeObjArrIntoSingleObj(arrOfReturnValueObjsFromBothApiCalls): ${JSON.stringify(objUtils.mergeObjArrIntoSingleObj(arrOfReturnValueObjsFromBothApiCalls))}###############`);             
        return objUtils.mergeObjArrIntoSingleObj(arrOfReturnValueObjsFromBothApiCalls);
    }
    
     

};     