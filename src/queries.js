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
  testSelect: (twoDArrWHeader) => alasqlUtils.selectFromTwoDimArr("SELECT * FROM tmptbl1 WHERE Col1 > 12", twoDArrWHeader)
  ,

  /**
  * Find the _primaryKey value the is the highest (max) in a whole dataset with a _primaryKey column 
  *
  * @param {string[][]} the original data to query against - must have column headers as the first row and have one column with header "_primaryKey"
  * @return {string[][]} a 2d array with just a header row with a single generated column header "max_prim_key" and a single row that contains one column with the highest (max) _primaryKey found in all rows of the passed in data set
  */  
  findMaxPrimaryKeyInAllDataRows: (twoDArrWHeader) => alasqlUtils.selectFromTwoDimArr("SELECT MAX(_primaryKey) AS max_prim_key FROM tmptbl1", twoDArrWHeader),


  /**
  * filter on just the rows in the passed in data with a noticeDate column that have a null noticeDate
  *
  * @param {string[][]} the original data to query against - must have column headers as the first row and have one column with header "_primaryKey"
  * @return {string[][]} a 2d array with just a header row with a single generated column header "max_prim_key" and a single row that contains one column with the highest (max) _primaryKey found in all rows of the passed in data set
  */    
  returnRowsWithNullNoticeDates: (twoDArrWHeader) => alasqlUtils.selectFromTwoDimArr("SELECT * AS max_prim_key FROM tmptbl1 WHERE noticeDate IS NULL", twoDArrWHeader),
  
  
  /**
  * does a union on the 2d array with header data sets passed in (currently up to 3 tables supported) but also makes sure that if the same row is in the first table but with extra data columns on the right side and the second or third table also has that data but without the righthand columns, that it will return just one row matching the more complete row from the first table with the extra data in the righthand columns
  *
  * @param {string[][]} a 2d array with a header row - the potentially largest one that may have extra additional columns with data (that will be preserved if there is a match against a row in the second or third dataset but without the extra column data)
  * @param {string[][]} a second 2d array with a header row - this one should have the same columns or less columns than the first data set/table but the names of the columns all matching column names of at least part of the ones in the first data set
  * @param {string[][]} Optional, third 2d array with a header row - this one should also have the same columns or less columns than the first data set/table but the names of the columns all matching column names of at least part of the ones in the first data set
  * @return {string[][]} a 2d array with a header row/column names matching the first data set - if a row was from the second or third data set, the extra columns not in those data sets will all show a blank string and as mentioned times when rows match between the columns in the first data set and the other data sets, data will be returned only once matching the first data set row with the extra data
  */    
  unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreserved: (twoDArrWHeader, secondTwoDArrWHeader, thirdTwoDArrWHeader) => {
    //since the third table is optional, if it's not passed in, use an empty array in it's place, which in a UNION is equivalent to not adding it since it will never union in blank rows
    const thirdTwoDArrWHeaderEmptyArrIfNotPassedIn = (thirdTwoDArrWHeader ? thirdTwoDArrWHeader : []);    
    //due to a bug in AlaSQL that causes the second and third tables in a union statement to be blank if using SELECT *, but not if you list out the column names, had to do this dynamically based on the column names in the first 2d array and converting them with join to 'col1', 'col2', etc
    const columnNamesFirstTable = twoDArrWHeader[0].join(", ");
    
    
    const columnNamesSecondTable = secondTwoDArrWHeader[0].join(", ");
                                                    console.log(`columnNamesFirstTable: ${columnNamesFirstTable}`);
    //return alasqlUtils.selectFromTwoDimArr(`SELECT ${columnNamesFirstTable} FROM tmptbl1 UNION SELECT ${columnNamesFirstTable} FROM tmptbl2 UNION SELECT ${columnNamesFirstTable} FROM tmptbl3`, twoDArrWHeader, secondTwoDArrWHeader, thirdTwoDArrWHeaderEmptyArrIfNotPassedIn);
    return alasqlUtils.selectFromTwoDimArr(`
      

          SELECT ${columnNamesFirstTable}
          FROM tmptbl1
          WHERE _primaryKey IN
          (
            SELECT _primaryKey FROM tmptbl1 A
            UNION 
            SELECT _primaryKey FROM tmptbl2 B
            UNION 
            SELECT _primaryKey FROM tmptbl3 C
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


  
  
  

    
      
      

     
       
       `, twoDArrWHeader, secondTwoDArrWHeader, thirdTwoDArrWHeaderEmptyArrIfNotPassedIn);
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


