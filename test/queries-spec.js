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
  
  describe("#filterJustRowsWhereColIsNullOrBlank()", function() {
    it("should if given data with the column header not having dot prefixes and a column mayHaveNull that contains null values in some cases, return just those rows that mayHaveNull has null values", function () {
      queries.filterJustRowsWhereColIsNullOrBlank("mayHaveNull", [["Col1", "Col2", "mayHaveNull"], ["A","AA", null], ["B", "BB", "tomorrow"], [null, null, null]]).should.be.eql([["Col1", "Col2", "mayHaveNull"], ["A","AA", null], [null, null, null]]);
    });  
    
    it("should given an array with a header and 3 data rows with an endpoint-name.noticeDate column, return just the two rows with null notice dates", function () {
      queries.filterJustRowsWhereColIsNullOrBlank("endpoint-name.noticeDate", [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.noticeDate"], ["A","AA", null], ["B", "BB", "tomorrow"], ["C", "CC", null]]).should.be.eql([["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.noticeDate"], ["A","AA", null], ["C", "CC", null]]);
    });  
    
    it("should given an array with just a header row, returning empty array", function () {
      queries.filterJustRowsWhereColIsNullOrBlank("endpoint-name.Col3", [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"]]).should.be.eql([]);
    });  
    
    // it("should given an array with a header and one data row with no null values, just returns the header row (as no rows with null values in the col specified found)", function () {
    //   queries.filterJustRowsWhereColIsNullOrBlank("endpoint-name.Col3", [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], ["A","AA", "AAA"]]).should.be.eql([]);
    // });    
    
    // it("should given an array with a header and one data row with a blank value in the specified column to scan, return the one row with the blank string value", function () {
    //   queries.filterJustRowsWhereColIsNullOrBlank("endpoint-name.Col3", [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], ["A","AA", ""]]).should.be.eql([["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], ["A","AA", ""]]);
    // });        
    
    // it("should given an array with a header and one data row with a string with just blank spaces in the specified column to scan, return the one row with the string that is all whitespaces", function () {
    //   queries.filterJustRowsWhereColIsNullOrBlank("endpoint-name.Col3", [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], ["A","AA", "     "]]).should.be.eql([["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], ["A","AA", "     "]]);
    // });        

    // it("should given an array with a header and 4 data rows with an endpoint-name.noticeDate column, return just the row with the null notice date and the row with an empty string but not the row with endpoint-name.noticeDate with a string value of 'null'", function () {
    //   queries.filterJustRowsWhereColIsNullOrBlank("endpoint-name.noticeDate", [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.noticeDate"], ["A","AA", ""], ["B", "BB", "tomorrow"], ["C", "CC", null], ["D", "DD", "null"]]).should.be.eql([["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.noticeDate"], ["A","AA", ""], ["C", "CC", null]]);
    // });      
    
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
      const retVal = queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted("endpoint-name._primaryKey",
                                                          [["endpoint-name._primaryKey", "endpoint-name.Col2", "endpoint-name.Col3"], 
                                                          [1,"AA", ""], 
                                                          [2, "BB", "tomorrow"], 
                                                          [3, "CC", ""], 
                                                          [4, "DD", "The Next Day"]
                                                          ],
                                                          [
                                                            ["endpoint-name._primaryKey", "endpoint-name.Col2"], 
                                                            [1,"AA"], 
                                                            [2, "BB"], 
                                                            [3, "CC"]
                                                          ],
                                                          [
                                                            ["endpoint-name._primaryKey", "endpoint-name.Col2"], 
                                                            [1,"AA"], 
                                                            [2, "BB"], 
                                                            [3, "CC"], 
                                                            [5, "EE"]
                                                          ]);
    //since we don't know the order rows will be returned, just checking that the result contains these rows in some order
    retVal.should.containEql(["endpoint-name._primaryKey", "endpoint-name.Col2", "endpoint-name.Col3"]);
    retVal.should.containEql([1,"AA", ""]);
    retVal.should.containEql([2, "BB", "tomorrow"]);
    retVal.should.containEql([3, "CC", ""]);
    retVal.should.containEql([4, "DD", "The Next Day"]);      
    retVal.should.containEql([5, "EE", null]);                                                     
    });   
    
    it("should handle being passed an empty array for first data set - in that case without header rows and returned unioned data from the second two data sets", function () {
       queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedUnsorted("endpoint-name._primaryKey", [], [["endpoint-name._primaryKey", "endpoint-name.colB"],[1,2]], [["endpoint-name._primaryKey", "endpoint-name.colB"],[1,2],[3,4]])
       .should.eql([["endpoint-name._primaryKey", "endpoint-name.colB"],[1,2],[3,4]]);
    });     
    
  });  
  
  describe("#unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings()", function() {
    it("should given the two tables and the first table assumed to have a unique _primaryKey column return the union of the two tables but with any additional column names and values in the first table in the results", function () {
      queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings("award-amount-transactions._primaryKey",
                                                          [["award-amount-transactions._primaryKey", "award-amount-transactions.Col2", "award-amount-transactions.Col3"], 
                                                          [1,"AA", ""], 
                                                          [2, "BB", "tomorrow"], 
                                                          [3, "CC", ""], 
                                                          [4, "DD", "The Next Day"]
                                                          ],
                                                          [
                                                            ["award-amount-transactions._primaryKey", "award-amount-transactions.Col2"], 
                                                            [1,"AA"], 
                                                            [2, "BB"], 
                                                            [3, "CC"]
                                                          ],
                                                          [
                                                            ["award-amount-transactions._primaryKey", "award-amount-transactions.Col2"], 
                                                            [1,"AA"], 
                                                            [2, "BB"], 
                                                            [3, "CC"], 
                                                            [5, "EE"]
                                                          ])
                                                          .should.eql(
                                                          [["award-amount-transactions._primaryKey", "award-amount-transactions.Col2", "award-amount-transactions.Col3"], 
                                                          [1,"AA", ""], 
                                                          [2, "BB", "tomorrow"], 
                                                          [3, "CC", ""], 
                                                          [4, "DD", "The Next Day"],
                                                          [5, "EE", '']
                                                          ]);
    });
    
    it("should handle being passed an empty array for second data set - in that case without header rows and returned unioned data from the first and third data sets", function () {
      queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings("endpoint-name._primaryKey", [["endpoint-name._primaryKey", "endpoint-name.colB", "endpoint-name.colC"],[1,2,3]], [], [["endpoint-name._primaryKey", "endpoint-name.colB"],[1,2],[3,4]])
      .should.eql([["endpoint-name._primaryKey", "endpoint-name.colB", "endpoint-name.colC"],[1,2,3],[3,4,""]]);
    });   
    
    it("should handle being passed an empty array for all three data sets - in that case without header rows - returns empty array", function () {
      queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings("endpoint-name._primaryKey", [], [], [])
      .should.eql([]);
    });   

    it("should handle being passed all but the first data set as empty - in that case returns the first data set", function () {
      queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings("endpoint-name._primaryKey", [["endpoint-name._primaryKey", "endpoint-name.colA"], ['', '']], [], [])
      .should.eql([["endpoint-name._primaryKey", "endpoint-name.colA"], ['', '']]);
    });     
    
    it("should handle being passed all but the second data set as empty - in that case returns the second data set", function () {
      queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings("endpoint-name._primaryKey", [], [["endpoint-name._primaryKey", "endpoint-name.colA"], ["Z", "Y"]], [])
      .should.eql([["endpoint-name._primaryKey", "endpoint-name.colA"], ["Z", "Y"]]);
    });    
    
    it("should handle being passed all but the third data set as empty - in that case returns the third data set", function () {
      queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings("endpoint-name._primaryKey", [], [], [["_primaryKey", "colA"], [1, 2]])
      .should.eql([["_primaryKey", "colA"], [1, 2]]);
    });      
    
    
  });   

});

