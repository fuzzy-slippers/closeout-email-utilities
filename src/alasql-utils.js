/** Alasql utility module - functions that help with our common alasql tasks (i.e. generate a new table based on exported spreadsheet data)
 * @module alasql-utils
 */
const alasql = require("alasql/dist/alasql.js");
global.alasql = alasql;
const arrayUtils = require("./array-utils.js");
const log = require("../src/log-utils.js");

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
        log.trace(`alasql-utils addTablePopulatedByTwoDimArrWithHeaderRowData_(${db},${tableNameToAdd}, ${JSON.stringify(twoDimArrDataWithHeader)}) called...`);
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
    
    /**
     * transform a 2d array of data (or up to 3 2d arrays of data if doing a join or union, etc) into a revised 2d array based on single SQL SELECT statement (Note: table name referenced in SQL query should always be "tmptbl1", "tmptbl2" and "tmptbl3" as these are the hard coded table names when adding the data to the database)
     * for example you can pass in data from a sheet with null values and a sql SELECT statement excluding nulls and it will only return 2d data with the results (to use to update another sheet/tab)  
     * NOTE: this function only designed for SELECT statements againts passed in data tables (with or without where clauses, group by, etc - not designed for INSERT/UPDATE/DELETE but does start fresh with the data passed in each time so may not need these)
     * all null values in the data are converted to empty strings in the result set
     * 
     * @param {string} valid alasql SELECT SQL statement to run against that original 2d array data loaded as a alasql formatted table(s) 
     * @param {object} 2d array of data (with first row as column headers) as a starting point (that the query will be run against)
     * @param {object} optional 2d array of data (with first row as column headers) if joining/union on a second table 
     * @param {object} optional 2d array of data (with first row as column headers) if joining/union on a third table  
     * @return {object} 2d array exported from the table after the SQL statement has been run against that table/data
     */
    selectFromTwoDimArr(sqlToTransformData, twoDimArrWHeader, secondTblTwoDimArrWHeader, thirdTblTwoDimArrWHeader)
    {
        log.trace(`alasql-utils selectFromTwoDimArr(${sqlToTransformData}, ${JSON.stringify(twoDimArrWHeader)}, ${JSON.stringify(secondTblTwoDimArrWHeader)}, ${JSON.stringify(thirdTblTwoDimArrWHeader)}) called...`);        
        const tempDb = this.createNewDatabase_();
        this.addTablePopulatedByTwoDimArrWithHeaderRowData_(tempDb, "tmptbl1", twoDimArrWHeader);
        //only attempt to create/load second table if data is passed in for it - optional two do select against more than one table
        if (secondTblTwoDimArrWHeader)
            this.addTablePopulatedByTwoDimArrWithHeaderRowData_(tempDb, "tmptbl2", secondTblTwoDimArrWHeader);
        //only attempt to create/load third table if data is passed in for it - optional two do select against more than one table
        if (thirdTblTwoDimArrWHeader)
            this.addTablePopulatedByTwoDimArrWithHeaderRowData_(tempDb, "tmptbl3", thirdTblTwoDimArrWHeader);            
        const resultObjArr = tempDb.exec(sqlToTransformData);
        const resultTwoDimArr = arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(resultObjArr); 
        //TODO change to replacing null values with empty strings
        return resultTwoDimArr;
    },
    

    /**
     * transform passed in data by performing a single INSERT/UPDATE/DELETE action against the data passed in, then querying the results (select all) and returning them  (Note: table name referenced in SQL query should always be "tmptbl1")
     *
     * @param {string} valid alasql INSERT, UPDATE or DELETE single SQL statement to run against that original 2d array data loaded as a alasql formatted table  
     * @param {object} 2d array of data (with first row as column headers) as a starting point (that the insert, update or delete will be run against)      
     * @return {object} 2d array exported from the table based on the initial data passed in after the INSERT/UPDATE/DELETE statment has been has been run against that table/data
     */
    insertUpdDelFromTwoDimArr(sqlSingleInsertUpdDelStmt, twoDimArrWHeader)
    {
        log.trace(`alasql-utils insertUpdDelFromTwoDimArr(${sqlSingleInsertUpdDelStmt}, ${JSON.stringify(twoDimArrWHeader)}) called...`);        
        const tempDb = this.createNewDatabase_();
        this.addTablePopulatedByTwoDimArrWithHeaderRowData_(tempDb, "tmptbl1", twoDimArrWHeader);
        const rowsAffected = tempDb.exec(sqlSingleInsertUpdDelStmt);
                                                                console.log(`rowsAffected: ${JSON.stringify(rowsAffected)}`);
        const resultObjArr = tempDb.exec("SELECT * FROM tmptbl1;");
                                                                console.log(`resultObjArr: ${JSON.stringify(resultObjArr)}`);        
        const resultTwoDimArr = arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(resultObjArr); 
                                                                console.log(`resultTwoDimArr: ${JSON.stringify(resultTwoDimArr)}`);
                                                                
        //as final step, replace any null values or string containing "null" in the 2d array results to empty strings (trying to do this for all query results)
        const resultTwoDimArrNullsReplaced = arrayUtils.replaceAllOccurancesInTwoDimArr(resultTwoDimArr, null, "");
        return arrayUtils.replaceAllOccurancesInTwoDimArr(resultTwoDimArrNullsReplaced, "null", "");
    },    

}