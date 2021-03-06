/* globals  KrApiCallsWDelay, BoundSheetUtils */
/** Google Apps Script Wrappers module - stubs/wrappers around libraries imported into the project that work with Google Apps Script native classes that are not standard node.js
 * @module google-apps-script-wrappers
 * 
 * Note - Requirement: make sure to have the following bound libraries imported into your google script project via the appscript.json Libraries array/section:
 * "BoundSheetUtils", "KrApiCallsWDelay"
 */
 
/*TODO!!!!!!: move these to a GOOGLE SHEET LIBRARY THAT IS IMPORTED BY THE GOOGLE SHEETS LIBRARY THAT DOES THE API CALLS - hard coding for now OR 
even move some of these like the API Key to a Google Apps Script Library so that the actual API key isn't stored anywhere else*/
const krApiKeyFromProperties = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViMzQwZDMwZDViODY2MDAwMTE2OWIxZiIsImlzcyI6Imt1YWxpLmNvIiwiZXhwIjoxNTYxNjczOTA0LCJpYXQiOjE1MzAxMzc5MDR9.jHU0mUXOFazeHPMIx0_rz6N08c4MAdeK5LpD8FzchJk";
const krApiCacheRefreshRoundFromProperties = "cacheRound1";
const krApiWaitMsFromProperties = 1000; 

const serverRootDomainAndPath = "https://umd-sbx.kuali.co/res/";

//used to convert 2d arrays to all strings
const arrayUtils = require("../../src/array-utils.js");


module.exports = {
    
    /**
     * a wrapper around GAS bound function 
     * the API key, cache refresh string and the time to wait between API calls is hard coded/coming from properties file
     * see actual library for function parameters/details: https://script.google.com/a/umd.edu/d/1Winl9ZnSsY2TJnBhRF8yDpzy68g4vdoWWhtAVjauxjImER3Rpyjbn8bJ/edit
     * @param {string} only need to provide the part of the URL that the KR API docs lists, for example /award/api/v1/award-amount-transactions/
     * @return {string} the raw results of the API call, either from the API directly or the cached result (no meta info like "cached at:, run at: etc")
     */   
    callKrGetApiWithWait: (relativeApiUri) => KrApiCallsWDelay.krApiCallWithWait(KrApiCallsWDelay.krGetApiCall, serverRootDomainAndPath + relativeApiUri, krApiKeyFromProperties, krApiCacheRefreshRoundFromProperties, krApiWaitMsFromProperties, "", false),
    
    /**
     * a wrapper around GAS bound function - see actual library for function parameters/details: https://script.google.com/a/umd.edu/d/1px_6cTYvd1bbaQd2ZKtM2UGCe9tx-_1xslSy2ITOT9yA33okfeFShq50/edit
     */   
    readDataInSheetWHeaderRowByName: (sheetTabName) => {
        const twoDArrWithHeaderRow = BoundSheetUtils.readDataInSheetWHeaderRowByName(sheetTabName);
        //decided for keeping things clean/easier to reason about, converting all cells read in from the google sheet into strings (2d array of strings)
        return arrayUtils.convertTwoDimArrToAllStrings(twoDArrWithHeaderRow);
    },

    /**
     * a wrapper around GAS bound function - see actual library for function parameters/details: https://script.google.com/a/umd.edu/d/1px_6cTYvd1bbaQd2ZKtM2UGCe9tx-_1xslSy2ITOT9yA33okfeFShq50/edit
     */     
    updNamedSheetWArrWHeaderRow: (sheetTabName, twoDimDataArrWHeaderRow) => BoundSheetUtils.updNamedSheetWArrWHeaderRow(sheetTabName, twoDimDataArrWHeaderRow),

    /**
     * a wrapper around GAS bound function to get script scope GAS stored property - see actual library for function parameters/details: https://script.google.com/a/umd.edu/d/1px_6cTYvd1bbaQd2ZKtM2UGCe9tx-_1xslSy2ITOT9yA33okfeFShq50/edit
     */   
    getScriptProperty: (key) => BoundSheetUtils.getScriptProperty(key), 
    
    /**
     * a wrapper around GAS bound function to set script scope GAS stored property - see actual library for function parameters/details: https://script.google.com/a/umd.edu/d/1px_6cTYvd1bbaQd2ZKtM2UGCe9tx-_1xslSy2ITOT9yA33okfeFShq50/edit
     */   
    setScriptProperty: (key, value) => BoundSheetUtils.setScriptProperty(key, value)   
    
};
