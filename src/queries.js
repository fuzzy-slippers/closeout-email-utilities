/** functions which transform 2d arrays (from sheets) in some way via ANSI SQL and 2d arrays of data - for example filtering on rows where value is great than another value, joining two dim arrays on a primary key, fining all rows where a certain column is null, etc - the part in the middle between reading a sheet, adding a row after an API fetch and writing back an updated sheet
 * @module queries
 */
const alasqlUtils = require("./alasql-utils.js");

module.exports = {

  /**
  * THE BELOW FUNCTION IS JUST FOR TESTING - FOR NOW....
  * Query returns just rows where co1 is greater than 12 (13+) 
  *
  * @param {string[][]} the original data to query against - must have column headers as the first row and have column with header "col1"
  * @return {string[][]} the resulting data where rows with "col1" column values less or equal to 12 have been excluded
  */
  testSelect: (twoDArrWHeader) => alasqlUtils.selectFromTwoDimArr(twoDArrWHeader, "SELECT * FROM tmptbl1 WHERE Col1 > 12")
  ,
  
  findMaxPrimaryKeyInAllDataRows: (twoDArrWHeader) => alasqlUtils.selectFromTwoDimArr(twoDArrWHeader, "SELECT MAX(_primaryKey) AS max_prim_key FROM tmptbl1")
  
  
  
  
                      //   //DELETE LATER
                      // testAlasqlWorking2(twoDimArrPassedIn)
                      // {
                      //     var mybase = this.createNewDatabase_();
                      //     this.addTablePopulatedByTwoDimArrWithHeaderRowData_(mybase, "testtabledata", twoDimArrPassedIn)
                      //     var res = mybase.exec("SELECT * FROM testtabledata WHERE Col1 > 12");
                      //     return res;
                      // }

};


