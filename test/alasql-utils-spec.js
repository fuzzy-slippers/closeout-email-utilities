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
  
    describe("#selectFromTwoDimArr()", function() {

    it("should if passed test 2d array and just a select * sql statement, it should return the original data", function () {
      const origTwoDimArr = [["column1", "column2"], ["avocado", "orange"]];
      const testSqlStmt = "SELECT * FROM tmptbl1;";
      alasqlUtils.selectFromTwoDimArr(testSqlStmt, origTwoDimArr).should
      .deepEqual([["column1", "column2"], ["avocado", "orange"]]);      
    });
    it("should if passed test 2d array with null in first column and a sql statement with WHERE excluding nulls, return 2d array with null rows removed", function () {
      const origTwoDimArr = [["column1", "column2"], ["avocado", "orange"], [null, "watermelon"], ["pineapple", null]];
      const testSqlStmt = "SELECT * FROM tmptbl1 WHERE column1 IS NOT NULL;";
      alasqlUtils.selectFromTwoDimArr(testSqlStmt, origTwoDimArr).should
      .deepEqual([["column1", "column2"], ["avocado", "orange"],  ["pineapple", null]]);      
    });
    
    it("should if passed 2 2d arrays (1 row each) and a join sql statement doing an inner join both to get the rows expected where the keys match", function () {
      const firstTwoDimArr = [["keyvalue", "column2"], [1, "orange"]];
      const secondTwoDimArr = [["keyvalue", "altcolumn2"], [1, "apple"]];    
      const testSqlStmt = `SELECT * FROM tmptbl1 INNER JOIN tmptbl2 ON tmptbl1.keyvalue = tmptbl2.keyvalue;`;
      alasqlUtils.selectFromTwoDimArr(testSqlStmt, firstTwoDimArr, secondTwoDimArr).should
      .deepEqual([["keyvalue", "column2", "altcolumn2"], 
                  [1, "orange", "apple"]]);      
    });    
    
    it("should if passed 2 2d arrays (3 rows each) and a join sql statement doing an inner join both to get the rows expected where the keys match", function () {
      const firstTwoDimArr = [["keyvalue", "column2"], 
                              [1, "orange"], 
                              [2, "watermelon"], 
                              [3, "avocado"]];
      const secondTwoDimArr = [["keyvalue", "altcolumn2"], 
                                [1, "apple"], 
                                [2, "cantaloupe"], 
                                [5, null]];    
      const testSqlStmt = `SELECT * FROM tmptbl1 INNER JOIN tmptbl2 ON tmptbl1.keyvalue = tmptbl2.keyvalue;`;
      alasqlUtils.selectFromTwoDimArr(testSqlStmt, firstTwoDimArr, secondTwoDimArr).should
      .deepEqual([["keyvalue", "column2", "altcolumn2"], 
                  [1, "orange", "apple"],  
                  [2, "watermelon", "cantaloupe"]
                  ]);      
    });         
    
    it("should if passed 3 2d arrays and a join sql statement doing an inner join on all 3 to get the rows expected where the keys match", function () {
      const firstTwoDimArr = [["keyvalue", "column2"], [1, "orange"], [2, "watermelon"], [3, "avocado"]];
      const secondTwoDimArr = [["keyvalue", "altcolumn2"], [1, "apple"], [2, "cantaloupe"], [5, null]];    
      const thirdTwoDimArr = [["keyvalue", "alt2column2"], [1, "pear"], [2, "honeydew"]];      
      const testSqlStmt = `SELECT * FROM tmptbl1 INNER JOIN tmptbl2 ON tmptbl1.keyvalue = tmptbl2.keyvalue 
                                                INNER JOIN tmptbl3 ON tmptbl2.keyvalue = tmptbl3.keyvalue;`;
      alasqlUtils.selectFromTwoDimArr(testSqlStmt, firstTwoDimArr, secondTwoDimArr, thirdTwoDimArr).should
      .deepEqual([["keyvalue", "column2", "altcolumn2", "alt2column2"], 
                  [1, "orange", "apple", "pear"],  
                  [2, "watermelon", "cantaloupe", "honeydew"]
                  ]);      
    });  
    
    //note found a bug in alasql where the ORDER BY does not work on a UNION statement...but using a subselect of the results and then an ORDER BY of that top select, it works as a workaround
    it("should if passed 3 2d arrays and a union sql statement return the distinct combined dataset (did this as a subselect then with an outer select with an order by)", function () {
      const firstTwoDimArr = [["column1", "column2"], [1, "orange"], [2, "watermelon"]];
      const secondTwoDimArr = [["column1", "column2"], [1, "orange"], [2, "watermelon"], [5, null]];    
      const thirdTwoDimArr = [["column1", "column2"], [1, "pear"]];      
      const testSqlStmt = `SELECT column1, column2 FROM 
                            (SELECT column1, column2 FROM tmptbl1 UNION SELECT column1, column2 FROM tmptbl2 UNION SELECT column1, column2 FROM tmptbl3) 
                            ORDER BY column1 desc, column2 asc;`;
      alasqlUtils.selectFromTwoDimArr(testSqlStmt, firstTwoDimArr, secondTwoDimArr, thirdTwoDimArr).should
      .deepEqual([["column1", "column2"],
                  [5, null],    
                  [2, "watermelon"],
                  [1, "orange"],
                  [1, "pear"],
                  ]);      
    });  
    
    it("should if passed 2 2d arrays, the first with 3 columns and the second with 2 and a union sql statement return all 3 columns but undefined when no value in the third column in the second 2d array (did this as a subselect then with an outer select with an order by)", function () {
      const firstTwoDimArr = [["column1", "column2", "column3"], [1, "orange", "banana"], [2, "watermelon", undefined]];
      const secondTwoDimArr = [["column1", "column2"], [1, "orange"], [2, "watermelon"], [5, null]];    
      const testSqlStmt = `SELECT column1, column2, column3 FROM
                            (SELECT column1, column2, column3 FROM tmptbl1 UNION SELECT column1, column2, undefined as column3 FROM tmptbl2) 
                            ORDER BY column1, column2, column3 asc;`;
      alasqlUtils.selectFromTwoDimArr(testSqlStmt, firstTwoDimArr, secondTwoDimArr).should
      .deepEqual([["column1", "column2", "column3"],
                  [1, "orange", undefined],
                  [1, "orange", "banana"],    
                  [2, "watermelon", undefined],                  
                  [5, null, undefined],
                  ]);      
    });       
    
    
    // not using yet (may never need the way we are just passing the data to load)
    // it("should if passed test 2d array and a valid insert statement, the returned data should have one more row than the original", function () {
    //   const origTwoDimArr = [["column1", "column2"], ["avocado", "orange"], [null, "watermelon"], ["pineapple", null]];
    //   const testSqlStmt = "insert into tmptbl1 values ('SPIKE', 'FRI');SELECT * FROM tmptbl1;";
    //   const retVal = alasqlUtils.selectFromTwoDimArr(origTwoDimArr, testSqlStmt);
    //   console.log(`retVal: ${JSON.stringify(retVal)}`);
    //   retVal.length.should.not.eql(origTwoDimArr.length);
    //   retVal.length.should.eql(4);      
    // });
    
   
  });

});
   
