/** Time and Money Missing Notice Dates module - self contained module of code needed to refresh a google sheet so that it lists recent Time and Money documents that someone forgot to enter a notice date for (notice date is null)
 * @module missing-notice-dates
 */
const latestByPrimaryKey = require("../../src/latest-by-primary-key.js");
const googleAppsScriptWrappers = require("../../src/google-apps-script-wrappers/google-apps-script-wrappers.js");
const queries = require("../../src/queries.js"); 
const log = require("../../src/log-utils.js");

const apiUtils = require("../../src/api-utils.js"); 
//const arrayUtils = require("../../src/array-utils.js");

// using underscore isEqual to compare sheet data bore and after
const underscore = require("underscore");

module.exports = {
   
// scheduled tast 1 - add new rows to the sheet    

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
        
        //2a. use the updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates function to check for new t&m docs that should be listed on the validation sheet (and add them to the bottom of the 2d array)
        log.trace(`2a. use the updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates function to check for new t&m docs that should be listed on the validation sheet`);
        const combinationOfExistingDataPlusNewApiResults = module.exports.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(prevSheetDataTwoDimArrWHeader);
        //6. after updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates finishes/returns back results
        log.trace(`6. result from calling updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates function is combinationOfExistingDataPlusNewApiResults: ${JSON.stringify(combinationOfExistingDataPlusNewApiResults)}`);
        
        //7a. check if the data has changed (if the 2d arr that we would use to update the sheet is not identical to what we read from the sheet above)
        log.trace(`7a.  check if the data has changed (if the 2d arr that we would use to update the sheet is not identical to what we read from the sheet above)`);
        log.trace(`underscore.isEqual( ${prevSheetDataTwoDimArrWHeader} , ${combinationOfExistingDataPlusNewApiResults} )`);
        if (!underscore.isEqual(prevSheetDataTwoDimArrWHeader, combinationOfExistingDataPlusNewApiResults)) {
            log.trace(`underscore.isEqual found sheet data changed/is different`);
            //7b.  if the data has changed, update the google sheet - should be something like the old data in the sheet + the new results/flagged records
            log.trace(`7b.  update sheet with old data in the sheet + the new results/flagged records`);
            googleAppsScriptWrappers.updNamedSheetWArrWHeaderRow(sheetNameToUpdate, combinationOfExistingDataPlusNewApiResults);
            log.trace(`sheetNameToUpdate: ${sheetNameToUpdate}`);
        }
        else
            log.trace(`underscore.isEqual found sheet data to be the same`);
    },
    
    /*
     * the helper function for addAdditionalFlaggedEmptyTimeAndMoneyNoticeDatesToSheet that actually updates the 2d data array with new time and money docs flagged to be added at the bottom of the data already in (coming from) the sheet
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
        const docStatusEndpointUriStr = "/research-sys/api/v1/document-route-header-values/";
        const docStatusEndpointNameOnly = apiUtils.extractApiEndpointNameFromUri(docStatusEndpointUriStr);
        log.trace(`endpointNameOnly: ${endpointNameOnly}`);
        log.trace(`docStatusEndpointNameOnly: ${docStatusEndpointNameOnly}`);
        
        //2b. determine the highest primary key in the google sheet data read in (before the update)
        log.trace(`2b. determine the highest primary key in the google sheet data read in (before the update)`); 
        const prevSheetMaxPrimaryKeyVal = latestByPrimaryKey.findMaxPrimaryKeyValueInData(`${endpointNameOnly}._primaryKey`, prevSheetDataTwoDimArrWHeader, endpointUriStr); 
        log.trace(`prevSheetMaxPrimaryKeyVal: ${prevSheetMaxPrimaryKeyVal}`);

        //3. query data by increasing primary key values until we hit an error with the message that that primary key is not found 
        log.trace(`3. query data by increasing primary key values until we hit an error with the message that that primary key is not found`);
        //note: later may want to improve so that we can handle gaps in primary keys (wait until the 3rd error on the 3rd primary key past the last one for example, but for now stopping on first error)
        const newApiCallsTwoDimArrWHeader = latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys(prevSheetMaxPrimaryKeyVal, endpointUriStr, `${endpointNameOnly}._primaryKey`, docStatusEndpointUriStr, `${endpointNameOnly}.documentNumber`); 
        log.trace(`newApiCallsTwoDimArrWHeader: ${JSON.stringify(newApiCallsTwoDimArrWHeader)}`);
        
        
        //4. filter on just the rows/records where the noticeDate is NULL/missing        
        log.trace(`4. filter on just the rows/records where the noticeDate is NULL/missing`);
        const justRowsNullNoticeDatesTwoDimArrWHeader = queries.filterJustRowsWhereColIsNullOrBlank(`${endpointNameOnly}.noticeDate`, newApiCallsTwoDimArrWHeader); 
        log.trace(`justRowsNullNoticeDatesTwoDimArrWHeader: ${justRowsNullNoticeDatesTwoDimArrWHeader}`);
        
        //5. union the columns that match, then join in the rest of the columns in the existing sheet
        log.trace(`5. union the columns that match, then join in the rest of the columns in the existing sheet`);
        const combinationOfExistingDataPlusNewApiResults = queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings(`${endpointNameOnly}._primaryKey`,  prevSheetDataTwoDimArrWHeader, justRowsNullNoticeDatesTwoDimArrWHeader);
        log.trace(`combinationOfExistingDataPlusNewApiResults: ${JSON.stringify(combinationOfExistingDataPlusNewApiResults)}`);
        
        //6. add "award-amount-transactions.computedRefreshed" column if the column not already present
        log.trace(`6. add award-amount-transactions.computedRefreshed empty column`);
        const twoDArrDataWithComputedRefreshedColumnAdded = queries.addColumnComputedRefreshed(`${endpointNameOnly}.computedRefreshed`, combinationOfExistingDataPlusNewApiResults);
        log.trace(`twoDArrDataWithComputedRefreshedColumnAdded: ${JSON.stringify(twoDArrDataWithComputedRefreshedColumnAdded)}`);

        //7. add "award-amount-transactions.computedIsAutoSaved"" column        
        log.trace(`7. add "award-amount-transactions.computedIsAutoSaved" column `);
        // found that we were able to initially add the award-amount-transactions.computedIsAutoSaved column with the refresh function as they work the same way - so only maintaining one function which can both add the column initially and refresh the autosave values
        // in my testing so far, a document-route-header-values.docRouteStatus of `S` appears to indicate a saved document - if others are found, we may need to change the function logic to anything but an F status indicates autosave
        const twoDArrDataWithComputedAutoSavedColumnAdded = queries.refreshAllAutosaveColumnData(`${endpointNameOnly}.computedIsAutoSaved`, `${docStatusEndpointNameOnly}.docRouteStatus`, "S", twoDArrDataWithComputedRefreshedColumnAdded);   ///no switched from old function to equivalent newer update function //queries.addColumnComputedAutoSave(`${endpointNameOnly}.computedIsAutoSaved`, `${endpointNameOnly}.transactionTypeCode`,  twoDArrDataWithComputedRefreshedColumnAdded);
        log.trace(`twoDArrDataWithComputedAutoSavedColumnAdded: ${JSON.stringify(twoDArrDataWithComputedAutoSavedColumnAdded)}`);        
        
        return twoDArrDataWithComputedAutoSavedColumnAdded;
    },
    
    




// scheduled task 2 - update autosave rows in the existing sheet data

    
    
    /** 
     * separate scheduled task to refresh an AUTOSAVE row in the sheet - this function operates on one row at a time (so only does rows worth of API calls to check if data has changed) - look for oldest timestamp with AUTOSAVE status and does API call to see if data has changed, and updates the array and sheet with that new data
     * Note: final documents should not be updated/changing (but may want to design it in a way that it would be easy to update these rows too later if we find out they can)
     * 
     * @param {string} a string with the name of the tab/sheet within the google sheet the program that should be updated (updates single row that is non-final/pending, the pending row one with the max primary key value)
     */   
    updateRefreshOnePendingRowInSheet: (sheetNameToUpdate) => {
        log.trace(`missing-notice-dates updateRefreshOnePendingRowInSheet(${sheetNameToUpdate}) called...`);
        
        //since we are specifically looking for missing notice dates, this data comes from the award-amount-transactions API endpoint so we are hard coding that path within the function
        const endpointUriStr = "/award/api/v1/award-amount-transactions/";
        const endpointNameOnly = apiUtils.extractApiEndpointNameFromUri(endpointUriStr);    
        const primaryKeyColName = `${endpointNameOnly}._primaryKey`;
        const lastRefreshDateColName = `${endpointNameOnly}.computedRefreshed`;
        const isAutoSavedColName = `${endpointNameOnly}.computedIsAutoSaved`;
        const firstEndpointDocNumColName = `${endpointNameOnly}.documentNumber`;       
        const docStatusEndpointUriStr = "/research-sys/api/v1/document-route-header-values/";
        const docStatusEndpointNameOnly = apiUtils.extractApiEndpointNameFromUri(docStatusEndpointUriStr);
        
        
        // //1. read data from sheet
        log.trace(`1. read data from sheet <(updateRefreshOnePendingRowInSheet func)>)`); 
        const prevSheetDataTwoDimArrWHeader = googleAppsScriptWrappers.readDataInSheetWHeaderRowByName(sheetNameToUpdate); 
        log.trace(`prevSheetDataTwoDimArrWHeader: ${JSON.stringify(prevSheetDataTwoDimArrWHeader)} <(updateRefreshOnePendingRowInSheet func)>`);
        
        // 2. create a 2d array copy of data by filtering only on 1) rows that are AUTOSAVES and 2) look for the row with the oldest update timestamp value and 3) return its primary key value only 
        log.trace(`2. query for the primary key of the oldest AUTOSAVE row based on the refresh timestamp/dates <(updateRefreshOnePendingRowInSheet func)>)`); 
        const primKeyAutoSaveRowToUpdate = queries.getPrimaryKeyOfAutoSavedRowWOldestRefreshDate(primaryKeyColName, lastRefreshDateColName, isAutoSavedColName, prevSheetDataTwoDimArrWHeader);
        
        // 3. if there are no AUTOSAVE rows (no primary key is returned) then exit out of the function without proceeding/updating the sheet
        log.trace(`3. check if there are no AUTOSAVE rows (primKeyAutoSaveRowToUpdate is zero/false) in which case do not update anything and exit the function - primKeyAutoSaveRowToUpdate currently showing: ${primKeyAutoSaveRowToUpdate} <(updateRefreshOnePendingRowInSheet func)>)`); 
        if (!primKeyAutoSaveRowToUpdate || primKeyAutoSaveRowToUpdate === "0") {
            log.trace(`since primKeyAutoSaveRowToUpdate is: ${primKeyAutoSaveRowToUpdate} indicating that there were no autosave rows found, going to exit/return without doing anything further`);
            return; //if primary key value returned is 0 (false) exit without doing/updating anything in the sheet - for now just returning undefined but may later want to come up with a value to return when the sheet is not updated
        }
        //otherwise if the primary key of one of the AUTOSAVE rows was returned, proceed with refreshing that row in the sheet/data
        else {        
            // 4. Make API call to get current values in KR for AUTOSAVED row using primary key from previous step (using function to query both awardAmtInfo and docStatus APIs and join result data) - setting the bypassCache parameter to TRUE as we need uncached results from KR (there is no point in updating with cached data over and over, the sheet will never change)
            log.trace(`4. Make API calls to get current values in KR for AUTOSAVED row using primary key from previous step <(updateRefreshOnePendingRowInSheet func)>) - using function to query apis for both awardAmtInfo and docStatus api data and join result data`); 
            const apiResultSinglePrimKeyJsObj = latestByPrimaryKey.callApiThenSecondApiJoinOnPropVal(endpointUriStr, primKeyAutoSaveRowToUpdate, firstEndpointDocNumColName, docStatusEndpointUriStr, true);         //no longer querying on just the single api - now querying both the award amount trans and doc status endpoints joied, which matches the sheet data //apiUtils.apiGetCallKr(endpointUriStr + primKeyAutoSaveRowToUpdate, true);
            
            // 5. make sure the API did not return an error - usually it should not since the document should exist but there could always be network errors, etc assuming that there is valid data, go on to next step
            log.trace(`5. make sure the API did not return an error <(updateRefreshOnePendingRowInSheet func)>)`);
            if (apiUtils.hasErrorProperty(apiResultSinglePrimKeyJsObj)) // TODO: below may want to also log/trace something about the apiResultsSinglePrimKeyJsObj object
                return; //if inspecting the results of the API call indicate an error was thrown (such as a network error) exit without doing/updating anything in the sheet - will hopefully update the row in a future run when the APIs are functioning again
            //otherwise if the API call succeeded in bringing back data in KR for the autosave row specified, proceed with trying to get that row updated in the sheet
            else {
                // 6. query function updates the chosen AUTOSAVE row with  1) the data returned by the API call and 2) refresh the computedRefreshed date/time to the current date/time
                log.trace(`6. query function updates the chosen AUTOSAVE row with  1) the data returned by the API call and 2) refresh the computedRefreshed date/time to the current date/time <(updateRefreshOnePendingRowInSheet func)>)`);
                const twoDArrWHeaderUpdatedChosenAutoSaveRow = queries.overwriteRowMatchingPrimaryKeyWithApiReturnedData(apiResultSinglePrimKeyJsObj, primaryKeyColName, lastRefreshDateColName, prevSheetDataTwoDimArrWHeader);
                    
                // 7. update the auto save columns - clear that column and recalculate which rows should be set to AUTOSAVE based on the column that indicates if its a final document (the criteria we are using is the doc status api showing a docRouteStatus of S indicates its in SAVED state which we are calling AUTOSAVED)
                log.trace(`7. update the auto save columns - clear that column and recalculate which rows should be set to AUTOSAVE (the criteria we are using is the doc status api showing a docRouteStatus of S indicates its in SAVED state which we are calling AUTOSAVED)`);
                const twoDArrWHeaderAutoSaveColRefreshed = queries.refreshAllAutosaveColumnData(isAutoSavedColName, `${docStatusEndpointNameOnly}.docRouteStatus`, "S", twoDArrWHeaderUpdatedChosenAutoSaveRow);
                
                // 8. run the filter function again to filter out null notice dates now that data was changed (in case the updated row now no longer has a null notice date)
                log.trace(`8. run the filter function again to filter out null notice dates now that data was changed <(updateRefreshOnePendingRowInSheet func)>)`);
                const twoDArrWHeaderRefilteredOnNullNoticeDateRowsOnly = queries.filterJustRowsWhereColIsNullOrBlank(`${endpointNameOnly}.noticeDate`, twoDArrWHeaderAutoSaveColRefreshed); 
                
                // 9a. check if the data has changed (if the 2d arr that we would use to update the sheet is not identical to what we read from the sheet above) 
                log.trace(`9a. check if the data has changed (if the 2d arr that we would use to update the sheet is not identical to what we read from the sheet above)`);
                log.trace(`underscore.isEqual( ${prevSheetDataTwoDimArrWHeader} , ${twoDArrWHeaderRefilteredOnNullNoticeDateRowsOnly} )`);
                if (!underscore.isEqual(prevSheetDataTwoDimArrWHeader, twoDArrWHeaderRefilteredOnNullNoticeDateRowsOnly)) {
                    log.trace(`underscore.isEqual found sheet data changed/is different (running updateRefreshOnePendingRowInSheet)`);
                    // 9b. if the sheet data has changed, update the google sheet tab (name specified) with the updated results
                    log.trace(`9b. if the sheet data has changed, update the google sheet tab (tab named "${sheetNameToUpdate}") with the updated results`);
                    googleAppsScriptWrappers.updNamedSheetWArrWHeaderRow(sheetNameToUpdate, twoDArrWHeaderRefilteredOnNullNoticeDateRowsOnly);                    
                }
                else
                    log.trace(`underscore.isEqual found sheet data is identical/would not change (running updateRefreshOnePendingRowInSheet)`);
            }
        }

    }    
    
    
    
    
    
}