/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
require("mocha");
const should = require("should");

const queries = require("../src/queries.js");


describe("queries", function() {
  
  describe("#testSelect()", function() {
    it("should given an array with a header and two data rows, one with a Col1 value greather than 12, should return just that one row", function () {
      const testData = [["Col1", "Col2"], [1,2], [15, "B"]];
      const expectedResult2dArr = [["Col1", "Col2"], [15, "B"]];    
      queries.testSelect(testData).should.be.eql(expectedResult2dArr);
    });  
  });  

  describe("#findMaxPrimaryKeyInAllDataRows()", function() {
    it("should given an array with a header and 3 data rows with a _primaryKey column, return a header row of max_prim_key and one data row/column with the largest _primaryKey value out of all rows", function () {
      queries.findMaxPrimaryKeyInAllDataRows([["Col1", "Col2", "_primaryKey"], ["A","AA", 2], ["B", "BB", 7], ["C", "CC", 1]]).should.be.eql([["max_prim_key"], [7]]);
    });  
  });
  
  describe("#returnRowsWithNullNoticeDates()", function() {
    it("should given an array with a header and 3 data rows with a noticeDate column, return just the two rows with null notice dates", function () {
      queries.returnRowsWithNullNoticeDates([["Col1", "Col2", "noticeDate"], ["A","AA", null], ["B", "BB", "tomorrow"], ["C", "CC", null]]).should.be.eql([["Col1", "Col2", "noticeDate"], ["A","AA", null], ["C", "CC", null]]);
    });  
  });
  

});

