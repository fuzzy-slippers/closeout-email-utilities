/** Bound Functions in Google Apps Script ES3 Javascript - The only functions that can be called from google scripts menu or GAS scheduled triggers
 *  attempting to keep these to mostly stubs...
 * 
 *  Note - Requirement: make sure to have the following bound libraries imported into your google script project via the appscript.json Libraries array/section:
 * "BoundSheetUtils", "KrApiCallsWDelay"
 */



/**
 * starting point for code find award time and money documents with blank notice dates - really empty just calls the right function in the Webpack compiled code  
 * (but this is needed as its a bound function accessible to be called from either the google script menu or called via a scheduled trigger) 
 *
 */
function startPointRefreshTimeAndMoneyMissingNoticeDateSheet() {
                                                            Logger.log("beginning of startPointRefreshTimeAndMoneyMissingNoticeDateSheet()");
  // Logger.log("missingNoticeDatesLib.sendHelloWorld() returning:");
  // Logger.log(missingNoticeDates.sendHelloWorld());

  // Logger.log("googleAppsScriptWrappers.callKrGetApiWithWait() returning:");
  // Logger.log(googleAppsScriptWrappers.callKrGetApiWithWait("award/api/v1/award-amount-transactions/-1"));  
  
  // Logger.log("googleAppsScriptWrappers.callKrGetApiWithWait(award/api/v1/award-amount-transactions/773749) returning:");
  // Logger.log(googleAppsScriptWrappers.callKrGetApiWithWait("award/api/v1/award-amount-transactions/773749"));  
  
  // Logger.log("missingNoticeDates.getAwardAmountTransactionByPrimaryKey(777) returning:");
  // Logger.log(apiUtils.getAwardAmountTransactionByPrimaryKey(777)); 

  // Logger.log("missingNoticeDates.getAwardAmountTransactionByPrimaryKey(773749) returning:");
  // Logger.log(apiUtils.getAwardAmountTransactionByPrimaryKey(773749));   
  
  //BoundSheetUtils.updNamedSheetWArrWHeaderRow("testdata", [["A","B"],["From","Inside"],["Webpacked","Code"]]);
  
  
//  missingNoticeDatesLib.updateSheet();

  missingNoticeDates.updateSheet();
  
                                                            Logger.log("end of startPointRefreshTimeAndMoneyMissingNoticeDateSheet()");  
}














/* old one

function testBoundSheetLibraryFunctions() {
  Logger.log("data in this test sheet");
  Logger.log(BoundSheetUtils.readDataInSheetWHeaderRowByName("testdata"));
  
  
  
                                                // try putting together data for sheet
                                                  //var makeUpDataArr = [["A","B"],["One","Two"],["Blue","Green"]];
                                                // try pulling data from API call instead
                                                
                                                // later we want to roll this into a stub function that calls the google apps script specific bound functions
                                                // but for now for testing just putting in here (and did add the library to the bound script)
                                                // (kind of like stubs...just calling functions in library krApiCallsWDelay - had to move the CacheService and LockService class calls to global variables indide the actual sheet to get things to work - could stub the below funcitons even more, but likely not needed as they already just call a library function(s)... 
                                                //call the krGetApiCall function using the caching and wait functionality of the utility functions below (pass in the function we want, in this case krGetApiCall
                                                function callKrGetApiWithWait(fullURLWithDomain, krApiKey, cacheRefreshRound, waitMs) {
                                                                                     //return "ZF DISABLING FOR NOW TO PROTECT SERVER";
                                                  return krApiCallsWDelay.krApiCallWithWait(krApiCallsWDelay.krGetApiCall,fullURLWithDomain, krApiKey, cacheRefreshRound, waitMs, "", false);
                                                }
                                                // end of global google apps script specific stub stuff
  
  
  //testing GAS converting 2d array test data to object array
  var sheetDataTwoDArr = BoundSheetUtils.readDataInSheetWHeaderRowByName("testdata");
  Logger.log("sheetDataTwoDArr: ");
  Logger.log(sheetDataTwoDArr);

  var sheetDataObjArr = arrayUtils.convertFromTwoDimArrWithHeaderToObjArr(sheetDataTwoDArr);
  Logger.log("sheetDataObjArr: ");
  Logger.log(sheetDataObjArr);  
  
  var convertedBackTwoDArr = arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(sheetDataObjArr);
  Logger.log("convertedBackTwoDArr: ");
  Logger.log(convertedBackTwoDArr);    
  
  Logger.log("loading that data into alasql - then doing a where clause on only rows where the first column is more than 12 (*updated*): ");
  //Logger.log(alasqlUtils.testAlasqlWorking2(BoundSheetUtils.readDataInSheetByNameWithHeader("testdata")));
  var twoDimArrResultsQueryOnSheetData = queriesLib.testSelect(BoundSheetUtils.readDataInSheetWHeaderRowByName("testdata"));
  Logger.log(twoDimArrResultsQueryOnSheetData);
  
  
  
  // try putting together data for sheet
    //var makeUpDataArr = [["A","B"],["One","Two"],["Blue","Green"]];
  // try pulling data from API call instead
  
  
  
  var apiData = callKrGetApiWithWait("https://umd-sbx.kuali.co/res/award/api/v1/award-amount-transactions/?noticeDate=2018-5-2", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViMzQwZDMwZDViODY2MDAwMTE2OWIxZiIsImlzcyI6Imt1YWxpLmNvIiwiZXhwIjoxNTYxNjczOTA0LCJpYXQiOjE1MzAxMzc5MDR9.jHU0mUXOFazeHPMIx0_rz6N08c4MAdeK5LpD8FzchJk", "runOne", 1000);
    
  //testing out converting to two dim arr with header row  
  Logger.log("apiData:");
  Logger.log(apiData);
  var objArrApiData = JSON.parse(apiData);
  Logger.log("objArrApiData:");
  Logger.log(objArrApiData);
  var convertedToTwoDimArr = arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(objArrApiData);
  Logger.log("convertedToTwoDimArr:");
  Logger.log(convertedToTwoDimArr); 
  
    
    BoundSheetUtils.updNamedSheetWArrWHeaderRow("testdata", convertedToTwoDimArr);
  //  BoundSheetUtils.updNamedSheetWArrWHeaderRow("testdata", twoDimArrResultsQueryOnSheetData);
    
}
 */

//works, just commenting for now so that the dropdown in google apps will default to the above test
// function testGoogleAppsScriptLibAccessability()
// {
//     Logger.log("testing libraries and their accessibility locally in google apps script - need this kind of thing for google apps script to pick up the function - the ones in webpack it does not pick up in the dropdown");
//     Logger.log("convertMsDateTimeToMMDDYYYYString function working ok?: ");
//     Logger.log(jsUtils.convertMsDateTimeToMMDDYYYYString(1512104400000));
//     Logger.log("what about stripTagsFromHtmlString('hi there, hopefully the br tab here <br> is removed')? : ");
//     Logger.log(jsUtils.stripTagsFromHtmlString('hi there, hopefully the br tab here <br> is removed'));
//     // Logger.log("alasqlUtils.testAlasqlWorking() returned: ");
//     // Logger.log(alasqlUtils.testAlasqlWorking());
    
// }