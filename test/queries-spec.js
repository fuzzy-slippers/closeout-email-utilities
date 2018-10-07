/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
require("mocha");
const should = require("should");

const queries = require("../src/queries.js");


describe("queries", function() {
  
  // describe("#testSelect()", function() {
  //   it("should given an array with a header and two data rows, one with a Col1 value greather than 12, should return just that one row", function () {
  //     const testData = [["Col1", "Col2"], [1,2], [15, "B"]];
  //     const expectedResult2dArr = [["Col1", "Col2"], [15, "B"]];    
  //     queries.testSelect(testData).should.be.eql(expectedResult2dArr);
  //   });  
  // });  

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
  
    it("should given a column name to search but a completely empty array, return an empty array", function () {
      queries.filterJustRowsWhereColIsNullOrBlank("endpoint-name.Col3", []).should.be.eql([]);
    });    
    
    it("should given an array with a header and one data row with no null values, just returns the header row (as no rows with null values in the col specified found)", function () {
      queries.filterJustRowsWhereColIsNullOrBlank("endpoint-name.Col3", [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], ["A","AA", "AAA"]]).should.be.eql([]);
    });    
    
    it("should given an array with a header and one data row with a blank value in the specified column to scan, return the one row with the blank string value", function () {
      queries.filterJustRowsWhereColIsNullOrBlank("endpoint-name.Col3", [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], ["A","AA", ""]]).should.be.eql([["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], ["A","AA", ""]]);
    });        
    
    it("should given an array with a header and one data row with a string with just blank spaces in the specified column to scan, return the one row with the string that is all whitespaces (although trimmed down to an empty string since we need to trim all strings as a workaround for the TRIM not working in alasql)", function () {
      queries.filterJustRowsWhereColIsNullOrBlank("endpoint-name.Col3", [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], ["A","AA", "     "]]).should.be.eql([["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], ["A","AA", ""]]);
    });        

    it("should given an array with a header and 4 data rows with an endpoint-name.noticeDate column, return just the row with the null notice date and the row with an empty string but not the row with endpoint-name.noticeDate with a string value of 'null'", function () {
      queries.filterJustRowsWhereColIsNullOrBlank("endpoint-name.noticeDate", [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.noticeDate"], ["A","AA", ""], ["B", "BB", "tomorrow"], ["C", "CC", null], ["D", "DD", "null"]]).should.be.eql([["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.noticeDate"], ["A","AA", ""], ["C", "CC", null]]);
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
    it("should given three tables and the first table assumed to have a unique _primaryKey column return the union of the tables but with any additional column names and values in the first table in the results", function () {
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

    it("should given only two tables and the first table assumed to have a unique _primaryKey column return the union of the tables but with any additional column names and values in the first table in the results", function () {
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
                                                            [3, "CC"], 
                                                            [5, "EE"]
                                                          ],
                                                          [])
                                                          .should.eql(
                                                          [["award-amount-transactions._primaryKey", "award-amount-transactions.Col2", "award-amount-transactions.Col3"], 
                                                          [1,"AA", ""], 
                                                          [2, "BB", "tomorrow"], 
                                                          [3, "CC", ""], 
                                                          [4, "DD", "The Next Day"],
                                                          [5, "EE", '']
                                                          ]);
    });
    
    it("should given only two tables and the first table assumed to have a unique _primaryKey column return the union of the tables but with any additional columns (that would be alphabetically to the left if sorted by the extra column names) ", function () {
      queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings("award-amount-transactions._primaryKey",
                                                          [["award-amount-transactions._primaryKey", "award-amount-transactions.Col2", "aaa", "___bbb"], 
                                                          [1,"AA", "", 1000], 
                                                          [2, "BB", "tomorrow", 2000], 
                                                          [3, "CC", "", 3000], 
                                                          [4, "DD", "The Next Day", 4000]
                                                          ],
                                                          [
                                                            ["award-amount-transactions._primaryKey", "award-amount-transactions.Col2"], 
                                                            [1,"AA"], 
                                                            [2, "BB"], 
                                                            [3, "CC"], 
                                                            [5, "EE"]
                                                          ],
                                                          [])
                                                          .should.eql(
                                                          [["award-amount-transactions._primaryKey", "award-amount-transactions.Col2", "aaa", "___bbb"], 
                                                          [1,"AA", "", 1000], 
                                                          [2, "BB", "tomorrow", 2000], 
                                                          [3, "CC", "", 3000], 
                                                          [4, "DD", "The Next Day", 4000],
                                                          [5, "EE", "", ""]
                                                          ]);
    });    

    /* note commenting this out because my plan is to always add extra columns in the google sheet or programically to the right hand side of the google sheet, even joining in new tables...if this changes in the future this test may be needed to be resurected - if this does need to happen...I think one possible way to achieve this althrough might be messy would be to create another version of the generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr function designed specifically to create the header for the union columnNamesSecondTable variable that instead of it having [col1], [col2] when the columnNamesFirstTable is [col0], [col1], [col2], [col3], we would need to have that function create for the columnNamesSecondTable variable '' AS [col0], [col1], [col2], '' AS [col3] or something similar (by comparing the headers in the different 2d arrays - but I think the program might be cleaner to avoid that if possible so I'm going to try to make the rule that all columns are added to the right hand side)
    it("should given only two tables and the first table assumed to have a unique _primaryKey column (and some extra columns on the left not just the right side), return the union of the tables but with any additional column names and values in the first table in the results", function () {
      const unionRetVal = queries.unionUsingFirstTablePrimaryKeyExtraColumnsInFirstTablePreservedSortedNullsAsBlankStrings("award-amount-transactions._primaryKey",
                                                          [["aaa", "award-amount-transactions._primaryKey", "award-amount-transactions.Col2", "award-amount-transactions.Col3"], 
                                                          ["",1,"AA", ""], 
                                                          ["",2, "BB", "tomorrow"], 
                                                          ["",3, "CC", ""], 
                                                          ["",4, "DD", "The Next Day"]
                                                          ],
                                                          [
                                                            ["award-amount-transactions._primaryKey", "award-amount-transactions.Col2"], 
                                                            [1,"AA"], 
                                                            [2, "BB"], 
                                                            [3, "CC"], 
                                                            [5, "NEWCOL"]
                                                          ],
                                                          []);
                                                                        console.log(`^^^^^^^^^^^^^^^^^^^^^^^^^^unionRetVal: ${JSON.stringify(unionRetVal)}`);                                                          
                                                          
                                                          unionRetVal.should.eql(
                                                          [["aaa","award-amount-transactions._primaryKey", "award-amount-transactions.Col2", "award-amount-transactions.Col3"], 
                                                          ["",1,"AA", ""], 
                                                          ["",2, "BB", "tomorrow"], 
                                                          ["",3, "CC", ""], 
                                                          ["",4, "DD", "The Next Day"],
                                                          ["",5, "NEWCOL", '']
                                                          ]);
    });    
*/

  });   
  
  
  
  describe("#addColumnComputedRefreshed()", function() {
    it("should given a passed in 2d array without the new refreshed column, in the result 2d array the header should now have a column that matches the name passed in for the last updated column (far right)", function () {
      queries.addColumnComputedRefreshed("endPointName.computedRefreshed", [["Col1", "Col2", "Col3"], ["A","AA", "AAA"], ["B", "BB", "BBB"], ["C", "CC", "CCC"]])[0].should.containEql("endPointName.computedRefreshed");
    });  
    it("should given a passed in 2d array without the new last updated column, should have blank data for each row/cell", function () {
      const retVal = queries.addColumnComputedRefreshed("endPointName.computedRefreshed", [["Col1", "Col2", "Col3"], ["A","AA", 1], ["B", "BB", 2], ["C", "CC", 3]]);
      const colPosition = retVal[0].indexOf("endPointName.computedRefreshed");
      retVal[1][colPosition].should.eql("");
      retVal[2][colPosition].should.eql("");
      retVal[3][colPosition].should.eql("");      
    }); 
    it("should given a passed in 2d array with the refreshed column already present, in the result 2d array the header should only have one the one extra column, not multiple added columns", function () {
      const functionFirstRunResults = queries.addColumnComputedRefreshed("endPointName.computedRefreshed", [["Col1", "Col2", "Col3"], ["A","AA", "AAA"], ["B", "BB", "BBB"], ["C", "CC", "CCC"]]);
      const functionSecondRunResults = queries.addColumnComputedRefreshed("endPointName.computedRefreshed", functionFirstRunResults);
      const functionThirdRunResults = queries.addColumnComputedRefreshed("endPointName.computedRefreshed", functionSecondRunResults);
      functionFirstRunResults[0].length.should.eql(4);
      functionSecondRunResults[0].length.should.eql(4);
      functionThirdRunResults[0].length.should.eql(4);
    });     
 
  });  
  
  
  describe("#addColumnComputedAutoSave()", function() {
    it("should given a passed in 2d array without the new auto save column, in the result 2d array the header should now have a column that matches the name passed in for the auto save/pending (far right)", function () {
      queries.addColumnComputedAutoSave("endPointName.computedAutoSave", "endPointName.transactionTypeCode", [["Col1", "Col2", "endPointName.transactionTypeCode"], ["A","AA", "AAA"], ["B", "BB", "BBB"], ["C", "CC", "CCC"]])[0]
      .should.eql(["Col1", "Col2", "endPointName.transactionTypeCode","endPointName.computedAutoSave"]);
    });  
    it("should given a passed in 2d array with the new auto save column and a endPointName.transactionTypeCode column, the auto save column is filled out based on the empty status of the endPointName.transactionTypeCode column", function () {
      queries.addColumnComputedAutoSave("endPointName.computedAutoSave", "endPointName.transactionTypeCode", [["Col1", "Col2", "endPointName.transactionTypeCode"], ["A","AA", ""], ["B", "BB", 2], ["C", "CC", " "]])
      .should.eql([["Col1", "Col2", "endPointName.transactionTypeCode","endPointName.computedAutoSave"], ["A","AA", "", "AUTOSAVE"], ["B", "BB", 2,""], ["C", "CC", "","AUTOSAVE"]])     
    }); 
    it("should given a passed in 2d array with the new auto save column and a endPointName.transactionTypeCode column name but none of the header rows matching the endPointName.transactionTypeCode column name, add the additional row but never fill out AUTOSAVE as there is nothing to base the logic on", function () {
      queries.addColumnComputedAutoSave("endPointName.computedAutoSave", "endPointName.transactionTypeCode", [["Col1", "Col2", "noColWithTransCodes"], ["A","AA", ""], ["B", "BB", 2], ["C", "CC", ""]])
      .should.eql([["Col1", "Col2", "noColWithTransCodes", "endPointName.computedAutoSave"], ["A","AA", "", ""], ["B", "BB", 2,""], ["C", "CC", "",""]]);     
    });     
    it("should given a passed in 2d array with the auto save column already present, the returned 2D array should be returned unchanged", function () {
      queries.addColumnComputedAutoSave("endPointName.computedAutoSave", "endPointName.transactionTypeCode", [["Col1", "Col2", "endPointName.transactionTypeCode","endPointName.computedAutoSave"], ["A","AA", "", "AUTOSAVE"], ["B", "BB", 2,""], ["C", "CC", "","AUTOSAVE"]])
      .should.eql([["Col1", "Col2", "endPointName.transactionTypeCode","endPointName.computedAutoSave"], ["A","AA", "", "AUTOSAVE"], ["B", "BB", 2,""], ["C", "CC", "","AUTOSAVE"]])     
    }); 
 
  });   
  
  
  describe("#generateListOfColumnNamesInAlaSqlSelectFormat()", function() {
    it("should given a 2d array with a header row with 3 column names and no data rows, return a string with just those column names in a format that works for alaSQL Select explicit column listings", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormat([["Col1", "Col2", "Col3"]])
      .should.be.eql("[Col1], [Col2], [Col3]");
    });  
    
    it("should given a 2d array with a header row with 3 column names and with data rows, return a string with just those column names in a format that works for alaSQL Select explicit column listings", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormat([["Col1", "Col2", "Col3"], [1,2,3],["A","B","C"]])
      .should.be.eql("[Col1], [Col2], [Col3]");
    });    
    
    it("should given a 2d array with a header row with 3 column names and with data rows, return a string with just those column names in a format that works for alaSQL Select explicit column listings", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormat([["Col1", "Col2", "Col3"], [1,2,3],["A","B","C"]])
      .should.be.eql("[Col1], [Col2], [Col3]");
    });    
    
    it("should given a 2d array with a header row with 3 column names that are in dot format and with data rows, return a string with just those column names in a format that works for alaSQL Select explicit column listings", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormat([["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], [1,2,3],["A","B","C"]])
      .should.be.eql("[endpoint-name.Col1], [endpoint-name.Col2], [endpoint-name.Col3]");
    });
    
    it("should given an empty 1d array, return * since a blank string would cause the select clause to be invalid - 'SELECT * from tmptbl1' is valid but 'SELECT from tmptbl1' is not valid", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormat([])
      .should.be.eql("*");
    });    

    it("should given an empty 2d array, return * since a blank string would cause the select clause to be invalid - 'SELECT * from tmptbl1' is valid but 'SELECT from tmptbl1' is not valid", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormat([[]])
      .should.be.eql("*");
    });    
    
  });  
  
   describe("#generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr()", function() {
    it("should given two 2d non-empty arrays with a header rows with 3 column names and no data rows, return from the first 2d array passed in a string with just those column names in a format that works for alaSQL Select explicit column listings", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr([["Col1", "Col2", "Col3"]], [["ColA", "ColB", "ColC"]], [])
      .should.be.eql("[Col1], [Col2], [Col3]");
    });  
    
    it("should given two 2d arrays with a header rows, the first empty 1d arr and the second non-empty, return the 3 column names and no data rows from the second array, return from the first 2d array passed in a string with just those column names in a format that works for alaSQL Select explicit column listings", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr([], [["ColA", "ColB", "ColC"]], [])
      .should.be.eql("[ColA], [ColB], [ColC]");
    });     
    
    it("should given two 2d arrays with a header rows, the first empty 2d arr and the second non-empty, return the 3 column names and no data rows from the second array, return from the first 2d array passed in a string with just those column names in a format that works for alaSQL Select explicit column listings", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr([[]], [["ColA", "ColB", "ColC"]], [])
      .should.be.eql("[ColA], [ColB], [ColC]");
    });       
    
    it("should given three 2d arrays with a header rows, the first two are empty 1d arrs and the third non-empty, return the 3 column names and no data rows from the second array, return from the first 2d array passed in a string with just those column names in a format that works for alaSQL Select explicit column listings", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr([], [], [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], [1,2,3],["A","B","C"]])
      .should.be.eql("[endpoint-name.Col1], [endpoint-name.Col2], [endpoint-name.Col3]");
    });   
    
    it("should given three 2d arrays with a header rows, the first two are empty 2d arrs and the third non-empty, return the 3 column names and no data rows from the second array, return from the first 2d array passed in a string with just those column names in a format that works for alaSQL Select explicit column listings", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr([[]], [[]], [["endpoint-name.Col1", "endpoint-name.Col2", "endpoint-name.Col3"], [1,2,3],["A","B","C"]])
      .should.be.eql("[endpoint-name.Col1], [endpoint-name.Col2], [endpoint-name.Col3]");
    });    
    
    it("should given three 2d arrays with a header row and all three are empty 1d arrs, should return *", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr([], [], [])
      .should.be.eql("*");
    });       
    
    it("should given three 2d arrays with a header rows and all three are empty 2d arrays, should return *", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr([[]], [[]], [[]])
      .should.be.eql("*");
    }); 
    
    it("should given three 2d arrays with a header rows and all three are empty either 1d or 2d arrs, should return *", function () {
      queries.generateListOfColumnNamesInAlaSqlSelectFormatFirstNonEmptyTwoDArr([[]], [], [[]])
      .should.be.eql("*");
    });         
    
  });   
  

});

