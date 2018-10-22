/** Bound Functions in Google Apps Script ES3 Javascript - The only functions that can be called from google scripts menu or GAS scheduled triggers
 *  attempting to keep these to mostly stubs...
 * 
 * (see appscript.json for helper GAS libraries imported in addition to webpacked code)
 */


/**
 * starting point for code to schedule, etc - to flag NEW blank notice dates in award time and money documents and add them to bottom of sheet
 * really empty just calls the right function in the Webpack compiled code (but this is needed as its a bound function accessible to be called from either the google script menu or called via a scheduled trigger) 
 *
 */
function  updateSheetAdditionalMissingNoticeDate() {
  var startTime = "updateSheetAdditionalMissingNoticeDate started at " + new Date();
  console.log("--------------------------------------------------------------------------------------");
  Logger.log(startTime);console.log(startTime);  
  missingNoticeDates.addAdditionalFlaggedEmptyTimeAndMoneyNoticeDatesToSheet("TNMBlankNoticeDates");
}


/**
 * second function to be scheduled (periodically or possibly to run after updates)
 * goes through and tries to update one of the AUTOSAVE rows that are pending KR documents to see if they have been finalized (by querying the APIs for more up to date data for that row) - just does one row each time this is run but calling over and over should eventually refresh all AUTOSAVE rows - it uses the oldest refresh timestamp to make sure they all get refreshed
 */
function  updateOneAutoSaveRowInSheet() {
  var startTime = "updateRefreshOnePendingRowInSheet started at " + new Date();
  console.log("--------------------------------------------------------------------------------------");
  Logger.log(startTime);console.log(startTime);  
  missingNoticeDates.updateRefreshOnePendingRowInSheet("TNMBlankNoticeDates");
}
