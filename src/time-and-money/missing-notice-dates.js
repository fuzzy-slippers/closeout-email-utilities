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
        
        //1. read data from sheet
        log.trace(`1. read data from sheet`); 
        const prevSheetDataTwoDimArrWHeader = googleAppsScriptWrappers.readDataInSheetWHeaderRowByName(sheetNameToUpdate); 
        log.trace(`prevSheetDataTwoDimArrWHeader: ${JSON.stringify(prevSheetDataTwoDimArrWHeader)}`);
        
        //6. use the updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates function to check for new t&m docs that should be listed on the validation sheet (and add them to the bottom of the 2d array)
        const combinationOfExistingDataPlusNewApiResults = module.exports.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(prevSheetDataTwoDimArrWHeader);
        log.trace(`6. use the updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates function to check for new t&m docs that should be listed on the validation sheet`);
        log.trace(`combinationOfExistingDataPlusNewApiResults: ${JSON.stringify(combinationOfExistingDataPlusNewApiResults)}`);
        
        
        //7.  update sheet with old data in the sheet + the new results/flagged records
        log.trace(`7.  update sheet with old data in the sheet + the new results/flagged records`);
        googleAppsScriptWrappers.updNamedSheetWArrWHeaderRow(sheetNameToUpdate, combinationOfExistingDataPlusNewApiResults);
        log.trace(`sheetNameToUpdate: ${sheetNameToUpdate}`)
    },
    
    /*
     * the function that actually updates the 2d data array with new time and money docs flagged as missing notice dates below the existing (already flagged) data in the sheet
     * 
     * @param {object[][]} the 2d array with header data read directly from the sheet as a starting point
     * @return {object[][]} the 2d array with header data produced after adding in additional validation rows added during this round to the data passed in from the google sheet (for the next step of updating the google sheet)
     */       
    updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(prevSheetDataTwoDimArrWHeader)    
    {
        log.trace(`missing-notice-dates updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(${JSON.stringify(prevSheetDataTwoDimArrWHeader)}) called...`);
        
        //since we are specifically looking for missing notice dates, this data comes from the award-amount-transactions API endpoint so we are hard coding that path within the function
        const endpointUriStr = "/award/api/v1/award-amount-transactions/";
        const endpointNameOnly = apiUtils.extractApiEndpointNameFromUri(endpointUriStr);
        log.trace(`endpointNameOnly: ${endpointNameOnly}`);
        
        //2. determine the highest primary key in the google sheet data read in (before the update)
        log.trace(`2. determine the highest primary key in the google sheet data read in (before the update)`); 
        const prevSheetMaxPrimaryKeyVal = latestByPrimaryKey.findMaxPrimaryKeyValueInData(`${endpointNameOnly}._primaryKey`, prevSheetDataTwoDimArrWHeader, endpointUriStr); 
        log.trace(`prevSheetMaxPrimaryKeyVal: ${prevSheetMaxPrimaryKeyVal}`);

        //3. query data by increasing primary key values until we hit an error with the message that that primary key is not found 
        log.trace(`3. query data by increasing primary key values until we hit an error with the message that that primary key is not found`);
        //note: later may want to improve so that we can handle gaps in primary keys (wait until the 3rd error on the 3rd primary key past the last one for example, but for now stopping on first error)
        const newApiCallsTwoDimArrWHeader = latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys(prevSheetMaxPrimaryKeyVal, endpointUriStr); 
        log.trace(`newApiCallsTwoDimArrWHeader: ${newApiCallsTwoDimArrWHeader}`);
        
        //4a. join in document statuses on those records that do not yet have it
        
        //4b. filter on just rows where the document status is FINAL
        
        //4c. filter on just the rows/records where the noticeDate is NULL/missing        
        log.trace(`4c. filter on just the rows/records where the noticeDate is NULL/missing`);
        const justRowsNullNoticeDatesTwoDimArrWHeader = queries.filterJustRowsWhereColIsNullOrBlank(`${endpointNameOnly}.noticeDate`, newApiCallsTwoDimArrWHeader); 
        log.trace(`justRowsNullNoticeDatesTwoDimArrWHeader: ${justRowsNullNoticeDatesTwoDimArrWHeader}`);
        
        //5. union the columns that match, then join in the rest of the columns in the existing sheet
        log.trace(`5. union the columns that match, then join in the rest of the columns in the existing sheet`);
        const combinationOfExistingDataPlusNewApiResults = queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings(`${endpointNameOnly}._primaryKey`,  prevSheetDataTwoDimArrWHeader, justRowsNullNoticeDatesTwoDimArrWHeader);
        log.trace(`combinationOfExistingDataPlusNewApiResults: ${combinationOfExistingDataPlusNewApiResults}`);
        
        return combinationOfExistingDataPlusNewApiResults;
        
    }
    
    
}