/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
require("mocha");
const should = require("should");

var alasqlUtils = require("../src/alasql-utils.js");

describe("alasql-utils", function() {
  describe("#createNewDatabase_()", function() {
  
    it("should return a new alasql db object, which should have a 'databaseid' property", function () {
      const testDb = alasqlUtils.createNewDatabase_();
      testDb.should.be.an.Object();
      testDb.should.have.property("databaseid");    
    });
  
  });
  
  describe("#addTablePopulatedByTwoDimArrWithHeaderRowData_()", function() {
    
    //define variables used in all tests
    const testDb = alasqlUtils.createNewDatabase_();
    const testTwoDimArrDataToInsert = [["colA", "colB", "colC"], [1,2,3], ["X", "Y", "Z"]];
    
    before(function() {
      //will use the same sample database with one populated table as a starting point for all of our tests
      alasqlUtils.addTablePopulatedByTwoDimArrWithHeaderRowData_(testDb, "newtablename", testTwoDimArrDataToInsert);      
    });    
  
    it("should return a db with a table under name we specified (SELECT * on that table name should not throw an error)", function () {
      (function(){
        const selectAllResults = testDb.exec("SELECT * FROM newtablename");
      }).should.not.throw();
    });
    
    it("should return a db with a non empty table under the name we specified if we include data in the 2d array passed in", function () {
      const selectAllRowsNewtablename = testDb.exec("SELECT * FROM newtablename");
      selectAllRowsNewtablename.length.should.be.greaterThan(0);
    }); 
    
    it("should throw an error if we try to add a table by specifying a table name that already exists in the db previously", function () {
      (function(){
        alasqlUtils.addTablePopulatedByTwoDimArrWithHeaderRowData_(testDb, "newtablename", testTwoDimArrDataToInsert);
      }).should.throw();
    });  
    
    it("should be possible to add a second table to the same db and query the data for both successfully", function () {
      const secondTableTestData = [["column1", "column2"], ["avocado", "orange"]];
      alasqlUtils.addTablePopulatedByTwoDimArrWithHeaderRowData_(testDb, "secondtablename", secondTableTestData); 
      const selectAllRowsSecondtablename = testDb.exec("SELECT * FROM secondtablename");
      selectAllRowsSecondtablename.should.deepEqual([{"column1": "avocado", "column2": "orange"}]);      
    }); 
  
  });

});
   
