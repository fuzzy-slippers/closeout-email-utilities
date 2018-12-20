/** functions which transform 2d arrays (from sheets) in some way via ANSI SQL and 2d arrays of data - for example filtering on rows where value is great than another value, joining two dim arrays on a primary key, fining all rows where a certain column is null, etc - the part in the middle between reading a sheet, adding a row after an API fetch and writing back an updated sheet
 * @module queries
 */
const alasqlUtils = require("./alasql-utils.js");
const arrayUtils = require("./array-utils.js");
const apiUtils = require("./api-utils.js");
const log = require("../src/log-utils.js");

module.exports = {

  // /**
  // * THE BELOW FUNCTION IS JUST FOR TESTING - FOR NOW....
  // * Query returns just rows where co1 is greater than 12 (13+) 
  // *
  // * @param {string[][]} the original data to query against - must have column headers as the first row and have column with header "col1"
  // * @return {string[][]} the resulting data where rows with "col1" column values less or equal to 12 have been excluded
  // */
  // testSelect: (twoDArrWHeader) => alasqlUtils.selectFromTwoDimArr("SELECT * FROM tmptbl1 WHERE Col1 > 12", twoDArrWHeader)
  // ,

  /**
  * Find the max value in the column specified- the highest (max) in a whole dataset for that column 
  *
  * @param {string} the column name to use to look for the max value (ignore the other columns)
  * @param {string[][]} the original data to query against - must have column headers as the first row and have one column with a header that matches the name specified in colToFindMax param
  * @return {string[][]} a 2d array with just a header row with a single generated column header "max_col_val" and a single row that contains one column with the highest (max) value found in all rows of the passed in data set for the column name specied in the colToFindMax param
  */  
  //note: does the max calculation as a number (to make sure it gets the highest value) but then converts back to a string (now that we are treating all cell values as strings)
  findMaxColValInAllDataRows: (colToFindMax, twoDArrWHeader) => alasqlUtils.selectFromTwoDimArr(`SELECT CAST(max_col_val AS VARCHAR) AS max_col_val FROM (SELECT MAX(CAST([${colToFindMax}] AS NUMBER)) AS max_col_val FROM tmptbl1)`, twoDArrWHeader),


  /**
  * filter on just the rows in the passed in data with a null value in a particular column (lets you specifiy the column name)
  *
  * @param {string} pass in the full name of the column search in for NULL values - for example "award-amount-transactions.noticeDate"
  * @param {string[][]} the 2d array data to query against - must have column headers as the first row 
  * @return {string[][]} a 2d array with a header row and just those particular rows where the column name specified was found to be NULL 
  */    
  filterJustRowsWhereColIsNullOrBlank: (colToLookForNulls, twoDArrWHeader) => {
    const twoDArrWHeaderCellsTrimmed = arrayUtils.trimAllCellsInTwoDimArr(twoDArrWHeader);
    return alasqlUtils.selectFromTwoDimArr(`SELECT * FROM tmptbl1 WHERE [${colToLookForNulls}] IS NULL OR [${colToLookForNulls}] = ''`, twoDArrWHeaderCellsTrimmed);
  },
  
  /**
  * sort (order by) the data passed in based on the column name specified (order by using ASC ordering) with any rows with a null value in the column to sort on appearing first in the results
  * note: all values are converted to numbers, then sorted - null values are converted to a very high number so that they will appear at the bottom
  * 
  * @param {string} the column name to sort/order by on 
  * @param {string[][]} the original data sort - must have column headers as the first row and have one column with header name that matches the first parameter
  * @return {string[][]} a 2d array with a header row - data sorted based on the column name specified
  */    
  orderByColumnWithName: (colToSortOn, twoDArrWHeader) => {
    //to make sure nulls sort at the top of the sheet, convert everything to strings first and nulls/undefined values to empty string - CAN LIKELY REMOVE LATER ONCE ALL SHEET DATA IS READ/WRITTEN AS STRINGS
    const twoDArrWHeaderConvertedToAllStrings = arrayUtils.convertTwoDimArrToAllStrings(twoDArrWHeader);
    return alasqlUtils.selectFromTwoDimArr(`SELECT * FROM tmptbl1 ORDER BY CAST([${colToSortOn}] AS NUMBER) ASC`, twoDArrWHeaderConvertedToAllStrings);
  }, 
  
  
  /**
  * does a union on the 2d array with header data sets passed in (currently up to 3 tables supported) but also makes sure that if the same row is in the first table but with extra data columns on the right side and the second or third table also has that data but without the righthand columns, that it will return just one row matching the more complete row from the first table with the extra data in the righthand columns
  *
  * @param {string} the full name of the column (column header row/cell) for the primary key column, for example "award-amount-transactions._primaryKey"
  * @param {string[][]} a 2d array with a header row - the potentially largest one that may have extra additional columns with data (that will be preserved if there is a match against a row in the second or third dataset but without the extra column data)
  * @param {string[][]} a second 2d array with a header row - this one should have the same columns or less columns than the first data set/table but the names of the columns all matching column names of at least part of the ones in the first data set
  * @param {string[][]} Optional, third 2d array with a header row - this one should also have the same columns or less columns than the first data set/table but the names of the columns all matching column names of at least part of the ones in the first data set
  * @return {string[][]} a 2d array with a header row/column names matching the first data set - if a row was from the second or third data set, the extra columns not in those data sets will all show a blank string and as mentioned times when rows match between the columns in the first data set and the other data sets, data will be returned only once matching the first data set row with the extra data
  */    
  unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted: (priKeyColName, twoDArrWHeader = [], secondTwoDArrWHeader = [], thirdTwoDArrWHeader = []) => {
    log.trace(`queries unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted: (${priKeyColName}, ${JSON.stringify(twoDArrWHeader)}, ${JSON.stringify(secondTwoDArrWHeader)}, ${JSON.stringify(thirdTwoDArrWHeader)}) called...`);     
    //if any of the arrays are undefined/not passed in, use an empty array in it's place, which in a UNION is equivalent to not adding it
    const thirdTwoDArrWHeaderEmptyArrIfNotPassedIn = (thirdTwoDArrWHeader.length > 0 ? thirdTwoDArrWHeader : []);    
    //due to a bug in AlaSQL that causes the second and third tables in a union statement to be blank if using SELECT *, but not if you list out the column names, had to do this dynamically based on the column names in the first 2d array and converting them with join to format 'col1', 'col2', etc - 
    // however if data for that table is an empty array, we needed to get the column name list from somewhere else (using * causes the unions to return blank rows) so found that can use the header rows from the second or third table data instead as long as those are not blank
    const columnNamesFirstTable = module.exports.generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr(twoDArrWHeader, secondTwoDArrWHeader, thirdTwoDArrWHeader);
    const columnNamesSecondTable = module.exports.generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr(secondTwoDArrWHeader, thirdTwoDArrWHeader);

    return alasqlUtils.selectFromTwoDimArr(`
      
          SELECT ${columnNamesFirstTable}
          FROM tmptbl1
          WHERE [${priKeyColName}] IN
          (
            SELECT [${priKeyColName}] FROM tmptbl1 A
            UNION 
            SELECT [${priKeyColName}] FROM tmptbl2 B
            UNION 
            SELECT [${priKeyColName}] FROM tmptbl3 C
          )
  
          UNION
          
          SELECT ${columnNamesSecondTable} FROM
          (
            SELECT ${columnNamesSecondTable} FROM tmptbl2 D
            UNION 
            SELECT ${columnNamesSecondTable} FROM tmptbl3 E
          ) 
          
          MINUS 
          
          SELECT ${columnNamesSecondTable} FROM tmptbl1 F
       
       `, twoDArrWHeader , secondTwoDArrWHeader, thirdTwoDArrWHeaderEmptyArrIfNotPassedIn);
  },
  
  /**
  * does a union on the 2d array with header data sets passed in (currently up to 3 tables supported) but also makes sure that if the same row is in the first table but with extra data columns on the right side and the second or third table also has that data but without the righthand columns, that it will return just one row matching the more complete row from the first table with the extra data in the righthand columns
  * the difference with the unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted is that the results are sorted and all nulls in the returned data are replace with blank strings
  * 
  * @param {string} the column name of the primary key column (or whatever ID column being used to help with the union between all tables), for example "award-amount-transactions._primaryKey" 
  * @param {string[][]} a 2d array with a header row - the potentially largest one that may have extra additional columns with data (that will be preserved if there is a match against a row in the second or third dataset but without the extra column data)
  * @param {string[][]} a second 2d array with a header row - this one should have the same columns or less columns than the first data set/table but the names of the columns all matching column names of at least part of the ones in the first data set
  * @param {string[][]} Optional, third 2d array with a header row - this one should also have the same columns or less columns than the first data set/table but the names of the columns all matching column names of at least part of the ones in the first data set
  * @return {string[][]} a 2d array with a header row/column names matching the first data set - if a row was from the second or third data set, the extra columns not in those data sets will all show a blank string and as mentioned times when rows match between the columns in the first data set and the other data sets, data will be returned only once matching the first data set row with the extra data
  */    
  unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings: (priKeyColName, twoDArrWHeader, secondTwoDArrWHeader, thirdTwoDArrWHeader) => {
    log.trace(`queries unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings: (${priKeyColName}, ${JSON.stringify(twoDArrWHeader)}, ${JSON.stringify(secondTwoDArrWHeader)}, ${JSON.stringify(thirdTwoDArrWHeader)}) called...`);
                                                    //console.log(`first table data passed into unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings: ${JSON.stringify(twoDArrWHeader)}`);
    const initialQueryResults = module.exports.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted(priKeyColName, twoDArrWHeader, secondTwoDArrWHeader, thirdTwoDArrWHeader);
    const sortedQueryResults = module.exports.orderByColumnWithName(priKeyColName, initialQueryResults);
    return arrayUtils.replaceAllOccurancesInTwoDimArr(sortedQueryResults, null, "");
  },
  
  
  /**
  * adds a new column to a 2d array with header, with the name specified and each row of the new column initialized to an empty string (later will be updated with the current date and time when re-running pending rows)
  * 
  * @param {string} the column name (for the header row) of the column being added to list the last updated date/time
  * @param {string[][]} a 2d array with a header row without the column, that should have the new column added
  * @return {string[][]} a 2d array with a header that is the initial 2d array with the additional column added on the righthand side
  */    
  addColumnComputedRefreshed: (colName, twoDArrWHeader) => {
    log.trace(`queries addColumnComputedLastUpdated: (${colName}, ${JSON.stringify(twoDArrWHeader)}) called...`);
    //if the column is already present, leave the 2d array/sheet data unchanged (first checking that the twoDArrWHeader is valid and a 2d array)
    if (twoDArrWHeader && twoDArrWHeader[0] && twoDArrWHeader[0].includes(colName))
      return twoDArrWHeader;
    //if the column does not yet seem to be present, add it with blank placeholder values in each data cell in that column
    else
      return alasqlUtils.selectFromTwoDimArr(`SELECT ${module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(twoDArrWHeader)}, '' AS [${colName}] FROM tmptbl1`, twoDArrWHeader);
  },  
  
  

  /**
  * generates a column name list string to be used with alaSql select statements, such as SELECT {column name list string goes here} - mostly needed due to bugs in alasql with * and unions 
  * 
  * @param {string[][]} a 2d array with a header row and potentially data (to use as the basis for the column name list)
  * @return {string} a string in the valid '[col1], [col2], [col3]' format for alasql SELECT statements - note that brackets are needed to handle column names with dot notation and other special characters and cant hurt - returns '*' if empty array passed in
  */    
  generateListOfColumnNamesInAlaSqlSelectFormat: (twoDArrWHeader) => {
    log.trace(`queries generateListOfColumnNamesInAlaSqlSelectFormat: (${JSON.stringify(twoDArrWHeader)}) called...`);
    if (twoDArrWHeader.length > 0 && twoDArrWHeader[0].length > 0)
      return "[" + twoDArrWHeader[0].join("], [") + "]";
    else return "*";
  },  
  
  /**
  * generates a column name list string to be used with alaSql select statements, such as SELECT {column name list string goes here} but this time with up to three 2d arrays passed in, and returning the column name list from the first 2d array passed in that is non-empty, otherwise return * if all three are empty 
  * @param {string[][]} a 2d array with a header row and potentially data (to use as the basis for the column name list)
  * @param {string[][]} a 2d array with a header row and potentially data (to use as the basis for the column name list)
  * @param {string[][]} a 2d array with a header row and potentially data (to use as the basis for the column name list) 
  * @return {string} a string in the valid '[col1], [col2], [col3]' format for alasql SELECT statements (based on the first passed in non-empty 2d arr) - note that brackets are needed to handle column names with dot notation and other special characters and cant hurt - returns '*' if empty array passed in
  */    
  generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr: (twoDArrWHeader1 = [], twoDArrWHeader2 = [], twoDArrWHeader3 = []) => {
    log.trace(`queries generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr: (${JSON.stringify(twoDArrWHeader1)}, ${JSON.stringify(twoDArrWHeader2)}, ${JSON.stringify(twoDArrWHeader3)}) called...`);
    if (twoDArrWHeader1.length > 0 && twoDArrWHeader1[0].length > 0)
      return module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(twoDArrWHeader1);
    else if (twoDArrWHeader2.length > 0 && twoDArrWHeader2[0].length > 0)
      return module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(twoDArrWHeader2);
    //generateListOfColumnNamesInAlaSqlSelectFormat will return '*' if the 2d array passed in is empty 
    else 
      return module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(twoDArrWHeader3);
  },   

  /**
  * gets the single primary key value from the data passed in of the AUTOSAVE row with the oldest/most stale refresh date/time listed 
  * @param {string} the name of the primary key column in the header row of the 2d array passed in
  * @param {string} the name of the last refresh date column in the header row of the 2d array passed in
  * @param {string} the name of the is auto saved column in the header row of the 2d array passed in
  * @param {string[][]} a 2d array with a header row and data to run the query against
  * @return {number} the primary key value of the AUTOSAVE row that was refreshed the longest ago
  */    
  getPrimaryKeyOfAutoSavedRowWOldestRefreshDate: (primKeyColName, lastRefreshDateColName, isAutoSavedColName, twoDArrWHeader) => {
    log.trace(`queries getPrimaryKeyOfAutoSavedRowWOldestRefreshDate: (${primKeyColName}, ${lastRefreshDateColName}, ${isAutoSavedColName}, ${JSON.stringify(twoDArrWHeader)}) called...`);
    // make sure the passed in 2d array has at least a header row and data rows - note added check for non blank primary key column to fix issue with blank rows but may be able to remove later when we switch to pulling in document statuses
    if (twoDArrWHeader && twoDArrWHeader.length > 1) {
      const resultsTwoDimArrFromSelectQuery = alasqlUtils.selectFromTwoDimArr(
                                              `SELECT MIN([${primKeyColName}]) AS minPriKeyIfMultWSameRefreshDt
                                              FROM tmptbl1 
                                              WHERE [${isAutoSavedColName}] = 'AUTOSAVE'
                                              AND ([${primKeyColName}] <> '' AND [${primKeyColName}] > 0)
                                              AND CAST([${lastRefreshDateColName}] AS NUMBER) = 
                                                (
                                                  SELECT MIN(CAST([${lastRefreshDateColName}] AS NUMBER))
                                                  FROM tmptbl1
                                                  WHERE [${isAutoSavedColName}] = 'AUTOSAVE' 
                                                )
                                              `, twoDArrWHeader);
                                              //                             console.log(`@@@@@@@@@@@@@@@@ sql query used: 
                                              // SELECT MIN([${primKeyColName}]) AS minPriKeyIfMultWSameRefreshDt
                                              // FROM tmptbl1 
                                              // WHERE [${isAutoSavedColName}] = 'AUTOSAVE'
                                              // AND CAST([${lastRefreshDateColName}] AS NUMBER) = 
                                              //   (
                                              //     SELECT MIN(CAST([${lastRefreshDateColName}] AS NUMBER))
                                              //     FROM tmptbl1
                                              //     WHERE [${isAutoSavedColName}] = 'AUTOSAVE' 
                                              //   )
                                              //                             `);                                                                          ;                                              
                                                                          //console.log(`@@@@@@@@@@@@@@@@ resultsTwoDimArrFromSelectQuery: ${JSON.stringify(resultsTwoDimArrFromSelectQuery)}`);
      //we dont care about the header row, just return the single "data" value in the 2nd "data" row ( minPriKeyIfMultWSameRefreshDt not column header)                                              
      const valueOfMinPriKeyIfMultWSameRefresDtReturned = resultsTwoDimArrFromSelectQuery[1][0];
      //alaSql will return null if no AUTOSAVE rows found, so only returning the query result if it's not null, otherwise return 0
      if (valueOfMinPriKeyIfMultWSameRefresDtReturned)
        return valueOfMinPriKeyIfMultWSameRefresDtReturned.toString(); // make sure it's returning a string - for example if the max primary key is 5 we should return "5"
      else 
        return "0";
    }
    // otherwise if the 2d array passed in has no data return 0 - (figured this was better than undefined but would prevent worst case API calls against all records)       
    else 
      return "0"; 
  },
  
  /**
  * update the row matching the specified primary key with the passed in sheet data with the data in the recently rerun api query (js object) also passed in and marking the refresh date column with the current date/timestamp to indicate the row was updated  
  * any null values are replaced by empty strings as with other query functions (keeping google sheet empty fields consistent)
  * @param {object} single js object returned by the API call with the key (primary key) specified, to be used to update the sheet data
  * @param {string} the name of the primary key column in the header row of the 2d array passed in
  * @param {string} the name of the last refresh date column in the header row of the 2d array passed in
  * @param {string[][]} a 2d array with a header row and data to run the query against (to update a row within)
  * @return {string[][]} a 2d array with a header row matching the data passed in except the one row will have been updated based on the API data object passed in and with a refresh date updated
  */    
  overwriteRowMatchingPrimaryKeyWithApiReturnedData: (apiReturnedJsObj, priKeyColName, lastRefreshDateColName, twoDArrWHeader) => {
    log.trace(`queries overwriteRowMatchingPrimaryKeyWithApiReturnedData: (${JSON.stringify(apiReturnedJsObj)}, ${priKeyColName}, ${lastRefreshDateColName}, ${JSON.stringify(twoDArrWHeader)}) called...`);
    //if the api date object passed in indicates the API call generated an error (property) or the api data object is empty - return the 2d array/sheet data unchanged if no API data to update with
    if (apiUtils.hasErrorProperty(apiReturnedJsObj) || Object.keys(apiReturnedJsObj).length === 0)
      return twoDArrWHeader;
    //api data looks good, return updated 2d array/sheet data
    else {
      //pull out the value of the primary key (object property) from the api data js object passed in - figured this was the safer way to go - we wouldnt want to update the wrong row
      const primaryKeyValueFromApiDataObj = apiReturnedJsObj[priKeyColName];   
                                                      //console.log(`===*=*=*=*===primaryKeyValueFromApiDataObj: ${primaryKeyValueFromApiDataObj}`);    
      //capture the current date/time (in milliseconds since Unix EPOCH) to be used as the refresh timestamp - easier than trying to do it within the alaSQL query (some reports of issues with formats in alasql)
      const currentDateTimestamp = Date.now();
      //loop through the properties of the API data object passed in to create the SET col1 = val1, col2 = val2 portion of the SQL update statement - so that all fields in API data provided are updated - because its mapping over an array, commas are added between elements automatically by the map function
      //we may not want to turn non-string values/properies from the API returned data object (such as dates, numbers) into strings, so only putting single quotes around string properties 
      //note that this will not include any of the computed columns (as the API data wont have those fields), but we can explicitly add the ones we need below 
      const dynamicallyGeneratedSetPortionOfSqlString = Object.entries(apiReturnedJsObj).map(([key, value]) => ` [${key}] = '${value}'`);
                                                      //console.log(`=*=*=*=*dynamicallyGeneratedSetPortionOfSqlString: ${dynamicallyGeneratedSetPortionOfSqlString}`);
      //put together the SQL to update the one row that we have API data for and only those fields that are in the API data, not columns added to the sheet
      //(Note: we do explicitly update the refresh update/timestamp but not the AUTOSAVE info, the AUTOSAVE info is refreshed separately for the whole sheet as an outside step instead)
      const fullInsertStmt = `UPDATE tmptbl1 
                              SET ${dynamicallyGeneratedSetPortionOfSqlString} , [${lastRefreshDateColName}] = '${currentDateTimestamp}' 
                              WHERE [${priKeyColName}] = '${primaryKeyValueFromApiDataObj}'`;
                                                      //console.log(`=*=** fullInsertStmt: ${fullInsertStmt}`);
      const twoDArrWHeaderWUpdatedRow = alasqlUtils.insertUpdDelFromTwoDimArr(fullInsertStmt, twoDArrWHeader);
      //TODO: REMOVE AT SOME POINT AS ALREADY HAPPENING INSIDE THE ALASQLUTIL QUERY FUNCTION ABOVE all rows that contain a "null" value (presumably coming from API data that returned null for a property) should have the value replaced with empty strings (using that as a standard for updating the google sheets to keep things clean looking)
      return arrayUtils.replaceAllOccurancesInTwoDimArr(twoDArrWHeaderWUpdatedRow, "null", "");
    }
  },  
  
  // /**
  // * goes through all rows of the auto save refresh column, blanks out the AUTOSAVE values and recalculates whether or not each row is an AUTOSAVE row based on the column and values to look for that are passed in
  // * @param {object} the name of the column that contains AUTOSAVE info (to update/refresh) 
  // * @param {string} the name of the column to check when determining/calculating if a row is an AUTOSAVE or final doc
  // * @param {string} the value to match against (i.e. "" or "PENDING", etc) used to determine/calculate if each row should be marked AUTOSAVE
  // * @param {string[][]} a 2d array with a header row and data to run the query against (to clear/update the AUTOSAVE columns)
  // * @return {string[][]} a 2d array with a header row matching the data passed in except the one row will have been updated based on the API data object passed in and with a refresh date updated
  // */    
  refreshAllAutosaveColumnData: (autoSaveRefreshColName, determineIfAutoSaveColName, determineIfAutoSaveColValue, twoDArrWHeader) => {
    log.trace(`queries refreshAllAutosaveColumnData: (${autoSaveRefreshColName}, ${determineIfAutoSaveColName}, ${determineIfAutoSaveColValue}, ${JSON.stringify(twoDArrWHeader)}) called...`);
    //in order to compare blank strings of different lengths need to trim each cell (but there is a bug in the alaSql trim function so that is not a viable option)
    const twoDArrWHeaderCellsTrimmed = arrayUtils.trimAllCellsInTwoDimArr(twoDArrWHeader);

    // use the generateListOfColumnNamesInAlaSqlSelectFormat function to get the explicit list of column names [colA], [colB] rather than using SELECT *
    const headerRowFieldsInSqlSelectFormat = module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(twoDArrWHeaderCellsTrimmed);
    //(we are taking advantage of a quirk in alasql (at least for now) that lets you query select A, B, C, 'FOO' AS B from tmptbl1 and the results woud show: {normal value of A}, 'foo' as B column values, {normal value of C} and in the original column order A B C)
    const twoDArrWHeaderWUpdatedRow = alasqlUtils.selectFromTwoDimArr(`
                                      SELECT ${headerRowFieldsInSqlSelectFormat}, CASE WHEN [${determineIfAutoSaveColName}] = '${determineIfAutoSaveColValue}' THEN 'AUTOSAVE' ELSE '' END AS [${autoSaveRefreshColName}]
                                      FROM tmptbl1
                                      `, twoDArrWHeaderCellsTrimmed);
    return twoDArrWHeaderWUpdatedRow;
  },
  
  
  
  /** MAY BE ABLE TO REPLACE WITH CALL TO refreshAllAutosaveColumnData?
  * adds a new column to a 2d array with header that adds a new column (name specified) that auto-populates a value of AUTOSAVE for all rows that appear to be non-final documents (does this by checking for an empty value in the second column name specified which is presumably a required field)
  * 
  * @param {string} the column name (for the header row) of the column being added which will list AUTOSAVE for pending documents
  * @param {string} the column name of the required column to check for blank values that will indicate if a row/document is in AUTOSAVE status
  * @param {string[][]} a 2d array with a header row without the column, that should have the new column added
  * @return {string[][]} a 2d array with a header that is the initial 2d array with the additional column added (with the AUTOSAVE values added) on the righthand side
  */    
  addColumnComputedAutoSave: (colNameToAdd, colNameRequiredColToCheckForBlankValues, twoDArrWHeader) => {
    log.trace(`queries addColumnComputedLastUpdated: (${colNameToAdd}, ${colNameRequiredColToCheckForBlankValues}, ${JSON.stringify(twoDArrWHeader)}) called...`);
    return module.exports.refreshAllAutosaveColumnData(colNameToAdd, colNameRequiredColToCheckForBlankValues, "", twoDArrWHeader);
/*
    //in order to accurately match if the transaction type code (required) column is blank and therefore indicating the TNM doc is pending, need to trim each cell (there is a bug in the alaSql trim function)
    const twoDArrWHeaderCellsTrimmed = arrayUtils.trimAllCellsInTwoDimArr(twoDArrWHeader);
    return alasqlUtils.selectFromTwoDimArr(`SELECT ${module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(twoDArrWHeaderCellsTrimmed)}, CASE WHEN [${colNameRequiredColToCheckForBlankValues}] = '' THEN 'AUTOSAVE' ELSE '' END AS [${colNameToAdd}] FROM tmptbl1`, twoDArrWHeaderCellsTrimmed);
*/
  },    
  

};  








