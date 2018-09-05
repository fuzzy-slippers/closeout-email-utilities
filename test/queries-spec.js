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

  describe("#findMaxColumnValInAllDataRows()", function() {
    it("should given a passed in column name of endpoint-name._primaryKey and an array with a header and 3 data rows with a endpoint-name._primaryKey column, return a header row of max_col_val and one data row/column with the largest endpoint-name._primaryKey value out of all rows", function () {
      queries.findMaxColValInAllDataRows("endpoint-name._primaryKey", [["Col1", "Col2", "endpoint-name._primaryKey"], ["A","AA", 2], ["B", "BB", 7], ["C", "CC", 1]]).should.be.eql([["max_col_val"], [7]]);
    });  
    it("should given a passed in column name of just Col1 and an array with a header and 3 data rows with a Col1 column, return a header row of max_col_val and one data row/column with the largest Col1 value out of all rows", function () {
      queries.findMaxColValInAllDataRows("Col1", [["Col1", "Col2", "endpoint-name._primaryKey"], [99,"AA", 2], [100, "BB", 7], [98, "CC", 1]]).should.be.eql([["max_col_val"], [100]]);
    });      
  });
  
  describe("#returnRowsWithNullNoticeDates()", function() {
    it("should given an array with a header and 3 data rows with a noticeDate column, return just the two rows with null notice dates", function () {
      queries.returnRowsWithNullNoticeDates([["Col1", "Col2", "noticeDate"], ["A","AA", null], ["B", "BB", "tomorrow"], ["C", "CC", null]]).should.be.eql([["Col1", "Col2", "noticeDate"], ["A","AA", null], ["C", "CC", null]]);
    });  
  });
  
 
   describe("#orderByColumnWithName()", function() {
    it("should given an array with a header that contains a single column (name sortOn specified) and 3 rows, return two Dim Array with Header data sorted by the numeric values, nulls at the end", function () {
      queries.orderByColumnWithName("sortOn", [["Col1", "Col2", "sortOn"], ["A","AA", 2], ["B", "BB", 1], ["C", "CC", null]])
      .should.be.eql([["Col1", "Col2", "sortOn"], ["C", "CC", null], ["B", "BB", 1], ["A","AA", 2]]);
    });  
    
    it("should given an array with a header that contains a single column (name sortLetters) and 3 rows, return two Dim Array with Header data sorted by the alphabetic values, nulls at the end", function () {
      queries.orderByColumnWithName("sortLetters", [["Col1", "Col2", "sortLetters"], ["A","AA", "Z"], ["B", "BB", null], ["C", "CC", "Y"]])
      .should.be.eql([["Col1", "Col2", "sortLetters"], ["B", "BB", null], ["C", "CC", "Y"], ["A","AA", "Z"]]);
    });
    
    it("should handle being passed an empty array - in that case without header rows", function () {
      queries.orderByColumnWithName("does_not_matter", []).should.be.eql([]);
    });     
  }); 
  
  
  // describe("#unionWithExtraColumnsInFirstTablePreserved()", function() {
  //   it("should given the two tables return the union of the two tables but with any additional column names and values in the first table in the results", function () {
  //     queries.unionWithExtraColumnsInFirstTablePreserved([["Col1", "Col2", "Col3"], ["A","AA", ""], ["B", "BB", "tomorrow"], ["C", "CC", ""]],
  //                                                         [["Col1", "Col2"], ["A","AA"], ["B", "BB"], ["C", "CC"]],
  //                                                         [["Col1", "Col2"], ["A","AA"], ["B", "BB"], ["C", "CC"]])
  //                                                         .should.be.eql([["Col1", "Col2", "Col3"], ["A","AA", ""], ["B", "BB", "tomorrow"], ["C", "CC", ""]]);
  //   });  
  // });  
  
  describe("#unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted()", function() {
    it("should given the two tables and the first table assumed to have a unique _primaryKey column return the union of the two tables but with any additional column names and values in the first table in the results", function () {
      const retVal = queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted(
                                                          [["_primaryKey", "Col2", "Col3"], 
                                                           [1,"AA", ""], 
                                                           [2, "BB", "tomorrow"], 
                                                           [3, "CC", ""], 
                                                           [4, "DD", "The Next Day"]
                                                          ],
                                                          [
                                                            ["_primaryKey", "Col2"], 
                                                            [1,"AA"], 
                                                            [2, "BB"], 
                                                            [3, "CC"]
                                                          ],
                                                          [
                                                            ["_primaryKey", "Col2"], 
                                                            [1,"AA"], 
                                                            [2, "BB"], 
                                                            [3, "CC"], 
                                                            [5, "EE"]
                                                          ]);
    //since we don't know the order rows will be returned, just checking that the result contains these rows in some order
    retVal.should.containEql(["_primaryKey", "Col2", "Col3"]);
    retVal.should.containEql([1,"AA", ""]);
    retVal.should.containEql([2, "BB", "tomorrow"]);
    retVal.should.containEql([3, "CC", ""]);
    retVal.should.containEql([4, "DD", "The Next Day"]);      
    retVal.should.containEql([5, "EE", null]);                                                     
    });   
    
    it("should handle being passed an empty array for first data set - in that case without header rows and returned unioned data from the second two data sets", function () {
       queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted([], [["_primaryKey", "colB"],[1,2]], [["_primaryKey", "colB"],[1,2],[3,4]])
       .should.eql([["_primaryKey", "colB"],[1,2],[3,4]]);
    });     
    
  });  
  
  describe("#unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings()", function() {
    it("should given the two tables and the first table assumed to have a unique _primaryKey column return the union of the two tables but with any additional column names and values in the first table in the results", function () {
      queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings(
                                                          [["_primaryKey", "Col2", "Col3"], 
                                                           [1,"AA", ""], 
                                                           [2, "BB", "tomorrow"], 
                                                           [3, "CC", ""], 
                                                           [4, "DD", "The Next Day"]
                                                          ],
                                                          [
                                                            ["_primaryKey", "Col2"], 
                                                            [1,"AA"], 
                                                            [2, "BB"], 
                                                            [3, "CC"]
                                                          ],
                                                          [
                                                            ["_primaryKey", "Col2"], 
                                                            [1,"AA"], 
                                                            [2, "BB"], 
                                                            [3, "CC"], 
                                                            [5, "EE"]
                                                          ])
                                                          .should.eql(
                                                          [["_primaryKey", "Col2", "Col3"], 
                                                           [1,"AA", ""], 
                                                           [2, "BB", "tomorrow"], 
                                                           [3, "CC", ""], 
                                                           [4, "DD", "The Next Day"],
                                                           [5, "EE", '']
                                                          ]);
    });
    
    it("should handle being passed an empty array for second data set - in that case without header rows and returned unioned data from the first and third data sets", function () {
       queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings([["_primaryKey", "colB", "colC"],[1,2,3]], [], [["_primaryKey", "colB"],[1,2],[3,4]])
       .should.eql([["_primaryKey", "colB", "colC"],[1,2,3],[3,4,""]]);
    });   
    
    it("should handle being passed an empty array for all three data sets - in that case without header rows - returns empty array", function () {
       queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings([], [], [])
       .should.eql([]);
    });   

    it("should handle being passed all but the first data set as empty - in that case returns the first data set", function () {
       queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings([["_primaryKey", "colA"], ['', '']], [], [])
       .should.eql([["_primaryKey", "colA"], ['', '']]);
    });     
    
    it("should handle being passed all but the second data set as empty - in that case returns the second data set", function () {
       queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings([], [["_primaryKey", "colA"], ["Z", "Y"]], [])
       .should.eql([["_primaryKey", "colA"], ["Z", "Y"]]);
    });    
    
    it("should handle being passed all but the third data set as empty - in that case returns the third data set", function () {
       queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings([], [], [["_primaryKey", "colA"], [1, 2]])
       .should.eql([["_primaryKey", "colA"], [1, 2]]);
    });      
    
     
    
  });   

});

