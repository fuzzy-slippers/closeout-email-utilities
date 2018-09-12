/** Time and Money Missing Notice Dates module - self contained module of code needed to refresh a google sheet so that it lists recent Time and Money documents that someone forgot to enter a notice date for (notice date is null)
 * @module missing-notice-dates
 */
const latestByPrimaryKey = require("../../src/latest-by-primary-key.js");
const googleAppsScriptWrappers = require("../../src/google-apps-script-wrappers/google-apps-script-wrappers.js");
const queries = require("../../src/queries.js"); 
const log = require("../../src/log-utils.js");

const apiUtils = require("../../src/api-utils.js"); 
//const arrayUtils = require("../../src/array-utils.js");


module.exports = {
    

    /**
     * the function that actually updates the google sheet (based on the tab/sheet name passed in) with new time and money docs flagged as missing notice dates below the existing (already flagged) data in the sheet
     * 
     * @param {string} a string with the name of the tab/sheet within the google sheet the program is pointing to that should be updated with the new time and money records missing notice dates since the last time it was run/last row in the existing sheet
     */   
    addAdditionalFlaggedEmptyTimeAndMoneyNoticeDatesToSheet: (sheetNameToUpdate) => {
        log.trace(`missing-notice-dates addAdditionalFlaggedEmptyTimeAndMoneyNoticeDatesToSheet(${sheetNameToUpdate}) called...`);
        const endpointUriStr = "/award/api/v1/award-amount-transactions/";
        const endpointNameOnly = apiUtils.extractApiEndpointNameFromUri(endpointUriStr);
        //1. read data from sheet (maybe later re-query all these ones and alasql filter on ones still missing notice dates and then re-update sheet) - or this could be separate operation so they could be scheduled at different frequencies
        const prevSheetDataTwoDimArrWHeader = googleAppsScriptWrappers.readDataInSheetWHeaderRowByName(sheetNameToUpdate);
        //2. determine the highest primary key in the google sheet data read in (before the update)
        const prevSheetMaxPrimaryKeyVal = latestByPrimaryKey.findMaxPrimaryKeyValueInData(`${endpointNameOnly}._primaryKey`, prevSheetDataTwoDimArrWHeader, endpointUriStr);
        //3. query data by increasing primary key values until we hit an error with the message that that primary key is not found 
        //note: later may want to improve so that we can handle gaps in primary keys (wait until the 3rd error on the 3rd primary key past the last one for example, but for now stopping on first error)
        const newApiCallsTwoDimArrWHeader = latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys(prevSheetMaxPrimaryKeyVal, endpointUriStr);
        //4a. join in document statuses on those records that do not yet have it
        //4b. filter on just rows where the document status is FINAL
        //4c. filter on just the rows/records where the noticeDate is NULL/missing        
        const justRowsNullNoticeDatesTwoDimArrWHeader = queries.filterJustRowsWhereColIsNull(`${endpointNameOnly}.noticeDate`, newApiCallsTwoDimArrWHeader);
        //5. append the new results to the original array read from sheet (will have to union the columns that match, then join in the rest of the columns in the existing sheet) - compute the endpoint name that will be the preface of all the column names for the 2d arrays of data
        const combinationOfExistingDataPlusNewApiResults = queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings(endpointNameOnly + "._primaryKey",  prevSheetDataTwoDimArrWHeader, justRowsNullNoticeDatesTwoDimArrWHeader);
        //6.  update sheet with old data in the sheet + the new results/flagged records
        googleAppsScriptWrappers.updNamedSheetWArrWHeaderRow(sheetNameToUpdate, combinationOfExistingDataPlusNewApiResults);
    }
    
    
}