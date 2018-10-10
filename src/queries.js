/** functions which transform 2d arrays (from sheets) in some way via ANSI SQL and 2d arrays of data - for example filtering on rows where value is great than another value, joining two dim arrays on a primary key, fining all rows where a certain column is null, etc - the part in the middle between reading a sheet, adding a row after an API fetch and writing back an updated sheet
 * @module queries
 */
const alasqlUtils = require("./alasql-utils.js");
const arrayUtils = require("./array-utils.js");
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
  findMaxColValInAllDataRows: (colToFindMax, twoDArrWHeader) => alasqlUtils.selectFromTwoDimArr(`SELECT MAX([${colToFindMax}]) AS max_col_val FROM tmptbl1`, twoDArrWHeader),


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
  *
  * @param {string} the column name to sort/order by on 
  * @param {string[][]} the original data sort - must have column headers as the first row and have one column with header name that matches the first parameter
  * @return {string[][]} a 2d array with a header row - data sorted based on the column name specified
  */    
  orderByColumnWithName: (colToSortOn, twoDArrWHeader) => alasqlUtils.selectFromTwoDimArr(`SELECT * FROM tmptbl1 ORDER BY [${colToSortOn}] ASC`, twoDArrWHeader),
   
  
  
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

    ////attempting to simplify
    // const columnNamesFirstTable =   (twoDArrWHeader.length > 0 ? module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(twoDArrWHeader) : 
    //                                                           secondTwoDArrWHeader.length > 0 ? module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(secondTwoDArrWHeader) : 
    //                                                           thirdTwoDArrWHeader.length > 0 ? module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(thirdTwoDArrWHeader) : "*"
    //                                 );
    // const columnNamesSecondTable = (secondTwoDArrWHeader.length > 0 ? module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(secondTwoDArrWHeader): 
    //                                                           thirdTwoDArrWHeader.length > 0 ? module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(thirdTwoDArrWHeader) : "*"
    //                                 );


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
    return alasqlUtils.selectFromTwoDimArr(`SELECT ${module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(twoDArrWHeader)}, '' AS [${colName}] FROM tmptbl1`, twoDArrWHeader);
  },  
  
  /**
  * adds a new column to a 2d array with header that adds a new column (name specified) that auto-populates a value of AUTOSAVE for all rows that appear to be non-final documents (does this by checking for an empty value in the second column name specified which is presumably a required field)
  * 
  * @param {string} the column name (for the header row) of the column being added which will list AUTOSAVE for pending documents
  * @param {string} the column name of the required column to check for blank values that will indicate if a row/document is in AUTOSAVE status
  * @param {string[][]} a 2d array with a header row without the column, that should have the new column added
  * @return {string[][]} a 2d array with a header that is the initial 2d array with the additional column added (with the AUTOSAVE values added) on the righthand side
  */    
  addColumnComputedAutoSave: (colNameToAdd, colNameRequiredColToCheckForBlankValues, twoDArrWHeader) => {
    log.trace(`queries addColumnComputedLastUpdated: (${colNameToAdd}, ${colNameRequiredColToCheckForBlankValues}, ${JSON.stringify(twoDArrWHeader)}) called...`);
    //in order to accurately match if the transaction type code (required) column is blank and therefore indicating the TNM doc is pending, need to trim each cell (there is a bug in the alaSql trim function)
    const twoDArrWHeaderCellsTrimmed = arrayUtils.trimAllCellsInTwoDimArr(twoDArrWHeader);
    return alasqlUtils.selectFromTwoDimArr(`SELECT ${module.exports.generateListOfColumnNamesInAlaSqlSelectFormat(twoDArrWHeaderCellsTrimmed)}, CASE WHEN [${colNameRequiredColToCheckForBlankValues}] = '' THEN 'AUTOSAVE' ELSE '' END AS [${colNameToAdd}] FROM tmptbl1`, twoDArrWHeaderCellsTrimmed);
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
  * @return {string} the primary key value of the AUTOSAVE row that was refreshed the longest ago 
  */    
  getPrimaryKeyOfAutoSavedRowWOldestRefreshDate: (primKeyColName, lastRefreshDateColName, isAutoSavedColName, twoDArrWHeader) => {
    log.trace(`queries getPrimaryKeyOfAutoSavedRowWOldestRefreshDate: (${primKeyColName}, ${lastRefreshDateColName}, ${isAutoSavedColName}, ${JSON.stringify(twoDArrWHeader)}) called...`);
    // make sure the passed in 2d array has at least a header row and data rows
    if (twoDArrWHeader && twoDArrWHeader.length > 1) {
      const resultsTwoDimArrFromSelectQuery = alasqlUtils.selectFromTwoDimArr(
                                              `SELECT MIN([${primKeyColName}]) AS minPriKeyIfMultWSameRefreshDt
                                              FROM tmptbl1 
                                              WHERE [${isAutoSavedColName}] = 'AUTOSAVE'
                                              AND [${lastRefreshDateColName}] = 
                                                (
                                                  SELECT MIN([${lastRefreshDateColName}])
                                                  FROM tmptbl1
                                                  WHERE [${isAutoSavedColName}] = 'AUTOSAVE' 
                                                )
                                              `, twoDArrWHeader);
      //we dont care about the header row, just return the single "data" value in the 2nd "data" row ( minPriKeyIfMultWSameRefreshDt not column header)                                              
      const valueOfMinPriKeyIfMultWSameRefresDtReturned = resultsTwoDimArrFromSelectQuery[1][0];
      //alaSql will return null if no AUTOSAVE rows found, so only returning if not null, otherwise return 0
      if (valueOfMinPriKeyIfMultWSameRefresDtReturned)
        return valueOfMinPriKeyIfMultWSameRefresDtReturned;
      else 
        return 0;
    }
    // otherwise if the 2d array passed in has no data return 0 - (figured this was better than undefined but would prevent worst case API calls against all records)       
    else 
      return 0; 
  }

};  








