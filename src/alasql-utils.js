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
    
    
    //DELETE LATER
    testAlasqlWorking()
    {
        alasql("CREATE TABLE cities (city string, population number)");
        alasql("INSERT INTO cities VALUES ('Rome',2863223),('Paris',2249975),('Berlin',3517424),('Madrid',3041579)");
        var res = alasql("SELECT * FROM cities WHERE population < 3500000 ORDER BY population DESC");
        return res;
    },
    
    
    //DELETE LATER
    testAlasqlWorking2(twoDimArrPassedIn)
    {
        var mybase = this.createNewDatabase_();
        this.addTablePopulatedByTwoDimArrWithHeaderRowData_(mybase, "testtabledata", twoDimArrPassedIn)
        var res = mybase.exec("SELECT * FROM testtabledata WHERE Col1 > 12");
        return res;
    }
    
    

}