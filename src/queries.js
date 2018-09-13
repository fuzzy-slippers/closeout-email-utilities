/** functions which transform 2d arrays (from sheets) in some way via ANSI SQL and 2d arrays of data - for example filtering on rows where value is great than another value, joining two dim arrays on a primary key, fining all rows where a certain column is null, etc - the part in the middle between reading a sheet, adding a row after an API fetch and writing back an updated sheet
 * @module queries
 */
const alasqlUtils = require("./alasql-utils.js");
const arrayUtils = require("./array-utils.js");
const log = require("../src/log-utils.js");

module.exports = {

  /**
  * THE BELOW FUNCTION IS JUST FOR TESTING - FOR NOW....
  * Query returns just rows where co1 is greater than 12 (13+) 
  *
  * @param {string[][]} the original data to query against - must have column headers as the first row and have column with header "col1"
  * @return {string[][]} the resulting data where rows with "col1" column values less or equal to 12 have been excluded
  */
  testSelect: (twoDArrWHeader) => alasqlUtils.selectFromTwoDimArr("SELECT * FROM tmptbl1 WHERE Col1 > 12", twoDArrWHeader)
  ,

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
  filterJustRowsWhereColIsNullOrBlank: (colToLookForNulls, twoDArrWHeader) => alasqlUtils.selectFromTwoDimArr(`SELECT * FROM tmptbl1 WHERE [${colToLookForNulls}] IS NULL`, twoDArrWHeader),
  
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
    log.trace(`queries unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted: (${JSON.stringify(twoDArrWHeader)}, ${JSON.stringify(secondTwoDArrWHeader)}, ${JSON.stringify(thirdTwoDArrWHeader)}) called...`);     
    //if any of the arrays are undefined/not passed in, use an empty array in it's place, which in a UNION is equivalent to not adding it
    const thirdTwoDArrWHeaderEmptyArrIfNotPassedIn = (thirdTwoDArrWHeader.length > 0 ? thirdTwoDArrWHeader : []);    
    //due to a bug in AlaSQL that causes the second and third tables in a union statement to be blank if using SELECT *, but not if you list out the column names, had to do this dynamically based on the column names in the first 2d array and converting them with join to format 'col1', 'col2', etc - 
    // however if data for that table is an empty array, we needed to get the column name list from somewhere else (using * causes the unions to return blank rows) so found that can use the header rows from the second or third table data instead as long as those are not blank
    const columnNamesFirstTable =   (twoDArrWHeader.length > 0 ? "[" + twoDArrWHeader[0].join("], [") + "]" : 
                                                              secondTwoDArrWHeader.length > 0 ? "[" + secondTwoDArrWHeader[0].join("], [") + "]" : 
                                                              thirdTwoDArrWHeader.length > 0 ? "[" + thirdTwoDArrWHeader[0].join("], [") + "]" : "*"
                                    );
    const columnNamesSecondTable = (secondTwoDArrWHeader.length > 0 ? "[" + secondTwoDArrWHeader[0].join("], [") + "]": 
                                                              thirdTwoDArrWHeader.length > 0 ? "[" + thirdTwoDArrWHeader[0].join("], [") + "]" : "*"
                                    );
                                                                      // console.log(`columnNamesFirstTable: ${columnNamesFirstTable}`);
                                                                      // console.log(`columnNamesSecondTable: ${columnNamesSecondTable}`);
                                                                      // console.log(`first table data passed into unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted: ${JSON.stringify(twoDArrWHeader)}`);
                                                                      // console.log(`second table data passed into unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted: ${JSON.stringify(secondTwoDArrWHeader)}`);
                                                                      //return alasqlUtils.selectFromTwoDimArr(`SELECT ${columnNamesFirstTable} FROM tmptbl1 UNION SELECT ${columnNamesFirstTable} FROM tmptbl2 UNION SELECT ${columnNamesFirstTable} FROM tmptbl3`, twoDArrWHeader, secondTwoDArrWHeader, thirdTwoDArrWHeaderEmptyArrIfNotPassedIn);
                                                                      
                                                                      // console.log(`
                                                                            
                                                                      
                                                                      //           SELECT ${columnNamesFirstTable}
                                                                      //           FROM tmptbl1
                                                                      //           WHERE [${priKeyColName}] IN
                                                                      //           (
                                                                      //             SELECT [${priKeyColName}] FROM tmptbl1 A
                                                                      //             UNION 
                                                                      //             SELECT [${priKeyColName}] FROM tmptbl2 B
                                                                      //             UNION 
                                                                      //             SELECT [${priKeyColName}] FROM tmptbl3 C
                                                                      //           )
                                                                        
                                                                      //           UNION
                                                                                
                                                                      //           SELECT ${columnNamesSecondTable} FROM
                                                                      //           (
                                                                      //             SELECT ${columnNamesSecondTable} FROM tmptbl2 D
                                                                      //             UNION 
                                                                      //             SELECT ${columnNamesSecondTable} FROM tmptbl3 E
                                                                      //           ) 
                                                                                
                                                                      //           MINUS 
                                                                                
                                                                      //           SELECT ${columnNamesSecondTable} FROM tmptbl1 F
                                                                      
                                                                      
                                                                             
                                                                      //       `);
       

                                                                      
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
  }
  
  



























/* working top part:

      SELECT * FROM tmptbl1
      WHERE _primaryKey IN
      (
        SELECT _primaryKey FROM tmptbl1 
        UNION 
        SELECT _primaryKey FROM tmptbl2 
        UNION 
        SELECT _primaryKey FROM tmptbl3
      ) 
      
      
      OR...
      
      
              SELECT ${columnNamesSecondTable} 
        FROM tmptbl1
        WHERE _primaryKey IN
        (
          SELECT _primaryKey FROM tmptbl1 
          UNION 
          SELECT _primaryKey FROM tmptbl2 
          UNION 
          SELECT _primaryKey FROM tmptbl3
        ) 
      
*/



/* scratch
        SELECT ${columnNamesSecondTable} 
        FROM tmptbl1
        WHERE _primaryKey IN
        (
          SELECT _primaryKey FROM tmptbl1 
          UNION 
          SELECT _primaryKey FROM tmptbl2 
          UNION 
          SELECT _primaryKey FROM tmptbl3
        ) 
      )
      
      UNION 
      
      SELECT ${columnNamesSecondTable} FROM
      (
        SELECT ${columnNamesSecondTable} FROM tmptbl2 
        UNION 
        SELECT ${columnNamesSecondTable} FROM tmptbl3
      ) 
      WHERE _primaryKey NOT IN 
      (
        SELECT _primaryKey from tmptbl1
      )








  unionUsingWithExtraColumnsInFirstTablePreserved: (twoDArrWHeader, secondTwoDArrWHeader, thirdTwoDArrWHeader) => {
    //since the third table is optional, if it's not passed in, use an empty array in it's place, which in a UNION is equivalent to not adding it since it will never union in blank rows
    const thirdTwoDArrWHeaderEmptyArrIfNotPassedIn = (thirdTwoDArrWHeader ? thirdTwoDArrWHeader : []);    
    //due to a bug in AlaSQL that causes the second and third tables in a union statement to be blank if using SELECT *, but not if you list out the column names, had to do this dynamically based on the column names in the first 2d array and converting them with join to 'col1', 'col2', etc
    const columnNamesFirstTable = twoDArrWHeader[0].join(", ");
    
    
    const columnNamesSecondTable = secondTwoDArrWHeader[0].join(", ");
                                                    console.log(`columnNamesFirstTable: ${columnNamesFirstTable}`);
    //return alasqlUtils.selectFromTwoDimArr(`SELECT ${columnNamesFirstTable} FROM tmptbl1 UNION SELECT ${columnNamesFirstTable} FROM tmptbl2 UNION SELECT ${columnNamesFirstTable} FROM tmptbl3`, twoDArrWHeader, secondTwoDArrWHeader, thirdTwoDArrWHeaderEmptyArrIfNotPassedIn);
    return alasqlUtils.selectFromTwoDimArr(`
 
      SELECT * FROM tmptbl1
      WHERE ${columnNamesSecondTable} IN
      (
        SELECT ${columnNamesSecondTable} FROM tmptbl1 
        UNION SELECT ${columnNamesSecondTable} FROM tmptbl2 
        UNION SELECT ${columnNamesSecondTable} FROM tmptbl3
      ) 
      
       
       `, twoDArrWHeader, secondTwoDArrWHeader, thirdTwoDArrWHeaderEmptyArrIfNotPassedIn);
  }
















      
      UNION
      
    SELECT * FROM
      ( 
        SELECT * FROM tmptbl1
      ) TABLE1ALLCOLS
      WHERE ${columnNamesSecondTable} IN
      (
        SELECT ${columnNamesSecondTable} FROM tmptbl1 
        UNION SELECT ${columnNamesSecondTable} FROM tmptbl2 
        UNION SELECT ${columnNamesSecondTable} FROM tmptbl3
      )       

*/

  
  //alasqlUtils.selectFromTwoDimArr("SELECT * FROM tmptbl1 UNION ALL SELECT * FROM tmptbl1 UNION ALL SELECT * FROM tmptbl1", twoDArrWHeader, secondTwoDArrWHeader, (thirdTwoDArrWHeader ? thirdTwoDArrWHeader : []))
    
  
  
  
                      //   //DELETE LATER
                      // testAlasqlWorking2(twoDimArrPassedIn)
                      // {
                      //     var mybase = this.createNewDatabase_();
                      //     this.addTablePopulatedByTwoDimArrWithHeaderRowData_(mybase, "testtabledata", twoDimArrPassedIn)
                      //     var res = mybase.exec("SELECT * FROM testtabledata WHERE Col1 > 12");
                      //     return res;
                      // }

};


