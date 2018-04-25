/** Alasql utility module - functions that help with our common alasql tasks (i.e. generate a new table based on exported spreadsheet data)
 * @module alasql-utils
 */
const alasql = require("alasql/dist/alasql.js");
global.alasql = alasql;
const arrayUtils = require("./array-utils.js");

module.exports = {
    
    
    /**
     * Wrapper function to create an empty database object (hiding the implementation details of alaSql so that we could possibly change to a different javascript db provider in the future
     *
     * @return {object} returns a database object that can then be populated with other private helper functions
     */   
    createNewDatabase_: () => new alasql.Database()
    ,
    
    /**
     * Adds a new table into the passed in db, using the table name and two dimentional array data also passed in, converts to the data format needed to populate the db table natively 
     *
     * @param {object} an existing database that may or may not have any tables added so far, that should have this new table added to it
     * @param {string} the name we want to use for the new table we want to add to the database
     * @return {} the result of the exponential calculation
     * Takes a database object, a proposed table name and two dimentional array data (raw format of google sheets) and 
     */
    addTablePopulatedByTwoDimArrWithHeaderRowData_: (db, tableNameToAdd, twoDimArrDataWithHeader) => {
        //alasql expects data as array of objects like [{col1: 1, col2: 2}], convert data in 2d array format that comes directly out of sheets into 1d array of objects format first
        var twoDimArrDataWithHeaderConvertedToObjArr = arrayUtils.convertFromTwoDimArrWithHeaderToObjArr(twoDimArrDataWithHeader);
        //add a new table using the name specified
        db.exec("CREATE TABLE " + tableNameToAdd);
        //had to split this into 2 lines (js can only handle variable property names if its not in the middle of a string of properties...db.tables.[tableNameToAdd] was not working                                                            
        //get a reference to the tables object from the alasql db
        const dbTablesReference = db.tables;
        //set the data property of the table to populate the table - we are using a variable table name so that we can pass in the table name to use into the function (see, as reference: https://github.com/agershun/alasql/wiki/How-to-insert-data-into-the-table)
        dbTablesReference[tableNameToAdd].data = twoDimArrDataWithHeaderConvertedToObjArr; 
        return db;
    },
    
    
                        // //DELETE LATER
                        // testAlasqlWorking()
                        // {
                        //     alasql("CREATE TABLE cities (city string, population number)");
                        //     alasql("INSERT INTO cities VALUES ('Rome',2863223),('Paris',2249975),('Berlin',3517424),('Madrid',3041579)");
                        //     var res = alasql("SELECT * FROM cities WHERE population < 3500000 ORDER BY population DESC");
                        //     return res;
                        // },
    
    /**
     * transform single 2d array of data into revised 2d array based on single SQL SELECT statement (Note: table name referenced in SQL query should always be "tmptbl1")
     * for example you can pass in data from a sheet with null values and a sql SELECT statement excluding nulls and it will only return 2d data with the results (to use to update another sheet/tab)  
     * NOTE: this function only designed for SELECT statements against single tables (with or without where clauses, group by, etc - INSERT/UPDATE/DELETE use other function!)
     *
     * @param {object} 2d array of data (with first row as column headers) as a starting point (that the query will be run against)
     * @param {string} valid alasql SELECT SQL statement to run against that original 2d array data loaded as a alasql formatted table  
     * @return {object} 2d array exported from the table after the SQL statement has been run against that table/data
     */
    selectFromTwoDimArr(twoDimArrWHeader, sqlToTransformData)
    {
        const tempDb = this.createNewDatabase_();
        this.addTablePopulatedByTwoDimArrWithHeaderRowData_(tempDb, "tmptbl1", twoDimArrWHeader);
        const resultObjArr = tempDb.exec(sqlToTransformData);
        const resultTwoDimArr = arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(resultObjArr); 
        return resultTwoDimArr;
    }
    
    // /** TODO:
    //  * perform single INSERT/UPDATE/DELETE action against  (Note: table name referenced in SQL query should always be "tmptbl1")
    //  * for example you can pass in data from a sheet with null values and a sql SELECT statement excluding nulls and it will only return 2d data with the results (to use to update another sheet/tab)  
    //  * NOTE: this function only designed for SELECT statements against single tables (with or without where clauses, group by, etc - INSERT/UPDATE/DELETE use other function!)
    //  *
    //  * @param {object} 2d array of data (with first row as column headers) as a starting point (that the query will be run against)
    //  * @param {string} valid alasql SELECT SQL statement to run against that original 2d array data loaded as a alasql formatted table  
    //  * @return {object} 2d array exported from the table after the SQL statement has been run against that table/data
    //  */
    // insertUpdDelFromTwoDimArr(twoDimArrWHeader, sqlInsertUpdDelStmt)
    // {
    //     const tempDb = this.createNewDatabase_();
    //     this.addTablePopulatedByTwoDimArrWithHeaderRowData_(tempDb, "tmptbl1", twoDimArrWHeader);
    //     const rowsAffected = tempDb.exec(sqlInsertUpdDelStmt);
    //     const resultObjArr = tempDb.exec("SELECT * FROM tmptbl1;");
    //     const resultTwoDimArr = arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(resultObjArr); 
    //     return resultTwoDimArr;
    // },    

}