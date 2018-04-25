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

});

