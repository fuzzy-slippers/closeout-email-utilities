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
  

});

