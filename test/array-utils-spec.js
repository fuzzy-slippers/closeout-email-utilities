/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
require("mocha");
const should = require("should");

var arrayUtils = require("../src/array-utils.js");

describe("array-utils", function() {

  describe("#convertFromTwoDimArrWithHeaderToObjArr()", function() {
    it("should given an array [['col1', 'col2'], [1,2], ['A', 'B']] return a 1d array of objects with the header row as property names [{col1: 1, col2: 2}, {col1: 'A', col2: 'B'}]", function () {
     const test2dArr = [["col1", "col2"], [1,2], ["A", "B"]];
     const expectedResult = [{col1: 1, col2: 2}, {col1: "A", col2: "B"}];
     arrayUtils.convertFromTwoDimArrWithHeaderToObjArr(test2dArr).should.be.eql(expectedResult);
    });  
  });
  
  describe("#unionArrs()", function() {
    it("should convert 3 arrays passed in (2d array) to a single 1d array with the values in order but with unique values only shown once, like a db union statement", function() {
        arrayUtils.unionArrs([1, 2, 3], [101, 2, 1, 10], [2, 1])
        .should.be.eql([1, 2, 3, 101, 10]);
    });   
    it("should convert 2 simple numeric arrays (2d array) of 1 and 2 with a second array with just 1 to a 1d array with just 1 and 2", function() {
        arrayUtils.unionArrs([1, 2], [1])
        .should.be.eql([1, 2]);
    });     
  });
  
  describe("#duplicateArrayAllElementsReplacedWith()", function() {
    it("should if passed an array with 5 elements & to replace with nulls, it should return an array with 5 null arr elements", function() {
        arrayUtils.duplicateArrayReplaceAllElementsWith([1, 2, 3, 4, 5], null)
        .should.be.eql([null, null, null, null, null]);
    });   
    it("should if passed an empty array return back an empty array", function() {
        arrayUtils.duplicateArrayReplaceAllElementsWith([], null).should.be.eql([]);
    }); 
    it("should if passed an array with 5 elements to replace with nulls, the original array should not be affected (non-mutating)", function() {
        var originalArrShouldNotBeChanged = [1, 2, 3, 4, 5];
        const resultGetsDiscarded = arrayUtils.duplicateArrayReplaceAllElementsWith(originalArrShouldNotBeChanged, null);
        originalArrShouldNotBeChanged.should.be.eql([1, 2, 3, 4, 5]);
    });         
    it("should if passed an array with 5 elements & to replace with strings, it should return an array with all 5 matching the str", function() {
        arrayUtils.duplicateArrayReplaceAllElementsWith([1, 2, 3, 4, 5], "replacewithme")
        .should.be.eql(["replacewithme", "replacewithme", "replacewithme", "replacewithme", "replacewithme"]);
    });
    it("should if passed an array created with the array constructor to create a 4 element array using Array(4), return an array with all elements replaced with the string specified", function() {
        const testArrayCreatedWithConstructorLengthFour = new Array(4);
        console.log(`testArrayCreatedWithConstructorLengthFour: ${JSON.stringify(testArrayCreatedWithConstructorLengthFour)}`);
        arrayUtils.duplicateArrayReplaceAllElementsWith(testArrayCreatedWithConstructorLengthFour, "replaceConstructorArrElements")
        .should.be.eql(["replaceConstructorArrElements", "replaceConstructorArrElements", "replaceConstructorArrElements", "replaceConstructorArrElements"]);
    });     
  });  

  describe("#convertOneDimObjArrToTwoDimArrWithHeaderRow()", function() {
    it(`should convert a 1d array [{prop1: "dog", prop2: "food"}, {prop1: "cat" prop2: "salmon"}] to [["prop1", "prop2"], ["dog", "food"], ["cat", "salmon"]]`, function () {
     const test1dObjArr = [{prop1: "dog", prop2: "food"}, {prop1: "cat", prop2: "salmon"}];
     const expectedResult = [["prop1", "prop2"], ["dog", "food"], ["cat", "salmon"]];
     arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(test1dObjArr).should.be.eql(expectedResult);
    }); 
    it("should convert an empty 1d array into an empty 2d array", function () {
     arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow([]).should.be.eql([]);
    });  
    it(`should handle objects with different numbers of properties - [{"1":"a"}, {"1":"b", "2":"z"}] returning [["1","2"],["a", null],["b","z"]]`, function () {
     arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow([{"1":"a"}, {"1":"b", "2":"z"}])
     .should.be.eql([["1","2"],["a", null],["b","z"]]);
    });
    it(`should handle objects with different numbers of properties - [{"1":"a"}, {"1":"b", "2":"z"}, {"1":"c", "2":"y", "3":"A"}] returning [["1","2","3"],["a", null, null],["b","z", null],["c","y","A"]]`, function () {
     arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow([{"1":"a"}, {"1":"b", "2":"z"}, {"1":"c", "2":"y", "3":"A"}])
     .should.be.eql([["1","2","3"],["a", null, null],["b","z", null],["c","y","A"]]);
    });
    it(`should handle objects with different numbers of properties not always in increasing order - [{"1":"a"}, {"1":"b", "2":"z"}, {"1":"c", "2":"y", "3":"A"}] returning [["1","2","3"],["a", null, null],["b","z", null],["c","y","A"]]`, function () {
     arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow([{"1":"a"}, {"1":"b", "2":"z"}, {"1":"c", "2":"y", "3":"A"}])
     .should.be.eql([["1","2","3"],["a", null, null],["b","z", null],["c","y","A"]]);
    });    
  });  
  
  describe("#lastArrElement()", function() {
    it("should if passed an array like [1,2,3] return the last element 3", function () {
      arrayUtils.lastArrElement([1,2,3]).should.eql(3);
    }); 
    
    it("should if passed an empty array [], obj or undefined, return undefined", function () {
      should.not.exist(arrayUtils.lastArrElement([])); 
      should.not.exist(arrayUtils.lastArrElement(undefined));
      should.not.exist(arrayUtils.lastArrElement({prop1: "some obj"}));
    }); 
  });
  
  describe("#replaceAllOccurancesInTwoDimArr()", function() {
    it("should if passed an array like [[1,2,3],[4,5,6],[7,8,9]] and to replace 5 with the string replaced should return [[1,2,3],[4,'replaced',6],[7,8,9]]", function () {
      arrayUtils.replaceAllOccurancesInTwoDimArr([[1,2,3],[4,5,6],[7,8,9]], 5, "replaced").should.be.eql([[1,2,3],[4,"replaced",6],[7,8,9]]);
    }); 
    
    it(`should if passed an array like [[1,0,3],[4,0,6],[7,0,9]] and to replace 0 with the string replaced should return [[1,"replaced",3],[4,"replaced",6],[7,"replaced",9]`, function () {
      arrayUtils.replaceAllOccurancesInTwoDimArr([[1,0,3],[4,0,6],[7,0,9]], 0, "replaced").should.be.eql([[1,"replaced",3],[4,"replaced",6],[7,"replaced",9]]);
    });     
    
    it("should if passed an emtpy array (and some replacments) return an empty array", function () {
      arrayUtils.replaceAllOccurancesInTwoDimArr([], "does not matter", "also does not matter").should.be.eql([]);
    }); 
  });    

  describe("#trimAllCellsInTwoDimArr()", function() {
    it("should if passed a 2d array with strings but nothing that would be changed by a trim, return the array unchanged", function () {
      arrayUtils.trimAllCellsInTwoDimArr([[1,2,3],["A","B","C"],["AAA","BBB","CCC"]]).should.be.eql([[1,2,3],["A","B","C"],["AAA","BBB","CCC"]]);
    }); 
    
    it(`should if passed a 2d array with 2 strings with extra spaces on the outside left/right, return the 2d array with those extra spaces removed`, function () {
      arrayUtils.trimAllCellsInTwoDimArr([[1,2,3],[" A ","B","C"],["AAA","  BBB ","CCC"]]).should.be.eql([[1,2,3],["A","B","C"],["AAA","BBB","CCC"]]);
    });     
  
    it(`should if passed a 2d array with 2 strings with tabs and newlines the outside left/right, return the 2d array with those extra spaces removed`, function () {
      arrayUtils.trimAllCellsInTwoDimArr([[1,2,3],["  A ","B","C"],["AAA",`
      BBB
      
      `,"CCC"]]).should.be.eql([[1,2,3],["A","B","C"],["AAA","BBB","CCC"]]);
    });     
    
    it(`should if passed a 2d array with 2 strings with spaces and tabs only on the inside between other characters, return the 2d array unchanged`, function () {
      arrayUtils.trimAllCellsInTwoDimArr([[1,2,3],["a furry brown fox went to the woods","B","one tab space   tab"],["AAA","BBB","CCC"]]).should.be.eql([[1,2,3],["a furry brown fox went to the woods","B","one tab space   tab"],["AAA","BBB","CCC"]]);
    }); 
  }); 

});

