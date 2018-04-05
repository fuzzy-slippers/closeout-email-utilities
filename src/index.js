/**
 *  first file........
 * 
 * This module is the entry point for your GAS code. You can create additional
 * modules and import them here as necessary.
 *
 * Functions exported from this module will appear in the GAS editor's "Run"
 * and "Select function" menus. GAS will also pick up any trigger functions
 * exported from this module. For more details, see
 * https://developers.google.com/apps-script/guides/triggers/
 */

export const convertMsDateTimeToMMDDYYYYString = (msSinceEpoch) => {
    const jsDateObj = new Date(msSinceEpoch);
    return (jsDateObj.getMonth() + 1) + "/" + jsDateObj.getDate() + "/" + jsDateObj.getFullYear(); // i.e. 2/4/2018
};





function tester() {
  Logger.log("just running tester function - no library");
  helloWorld();
};