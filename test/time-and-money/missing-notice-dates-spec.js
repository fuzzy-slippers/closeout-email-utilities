/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
require("mocha");
const should = require("should");
const rewire = require("rewire");

// using rewire to mock out the responses from the callKrGetApiWithWait function called inside the missing-notice-dates module - use switch statement to return json for known primary keys and otherwise return json example when an error occurs
const missingNoticeDates = rewire("../../src/time-and-money/missing-notice-dates.js");
missingNoticeDates.__set__("apiUtils", {
    apiGetCallKr: function (relativeApiUri) {
                                                          console.log(`inside rewiring of missingNoticeDates calls of apiUtils.apiGetCallKr, relativeApiUri detected as: ${relativeApiUri}`)      
      switch (relativeApiUri) {
      case "/award/api/v1/award-amount-transactions/" + "1":
        return JSON.parse('{"testCol1":"A","_primaryKey":"1"}');
      case "/award/api/v1/award-amount-transactions/" + "2":
        return JSON.parse('{"testCol1":"B","_primaryKey":"2"}');
      case "/award/api/v1/award-amount-transactions/" + "3":
        return JSON.parse('{"Error":{"errors":["not found for key 3"]}}');
      case "/award/api/v1/award-amount-transactions/" + "773750":
        return JSON.parse('{"awardAmountTransactionId":773750,"comments":null,"documentNumber":"2455782","noticeDate":1525233600000,"awardNumber":"029053-00001","transactionTypeCode":4,"_primaryKey":"773750"}');
      case "/award/api/v1/award-amount-transactions/" + "773751":
        return JSON.parse('{"awardAmountTransactionId":773751,"comments":null,"documentNumber":"2455782","noticeDate":1525233600000,"awardNumber":"029053-00001","transactionTypeCode":4,"_primaryKey":"773751"}');
      case "/award/api/v1/award-amount-transactions/" + "773752":
        return JSON.parse('{"awardAmountTransactionId":773752,"comments":null,"documentNumber":"2455803","noticeDate":1525233600000,"awardNumber":"029054-00001","transactionTypeCode":4,"_primaryKey":"773752"}');     
      case "/award/api/v1/award-amount-transactions/" + "773753":
        return JSON.parse('{"Error":{"errors":["not found for key 773753"]}}');
      }
    }
});

          //ARRAY-UTILS IMPORT TEMPORARY FOR CONVERSION OF TEST DATA - REMOVE LATER
          const arrayUtils = require("../../src/array-utils.js");
          
        //JUST NEEDED ONE TIME TO CREATE SAMPLE TEST DATA TO BE RETURNED
        // console.log(`'[{"testCol1":"A","_primaryKey":"1"}]' as 2d array: ${JSON.stringify(arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(JSON.parse('[{"testCol1":"A","_primaryKey":"1"}]')))}`);      
        // const example2 = '[{"testCol1":"B","_primaryKey":"2"}]';     
        // const example3 ='[{"Error":{"errors":["not found for key 3"]}}]';
        // const example4 ='[{"awardAmountTransactionId":773750,"comments":null,"documentNumber":"2455782","noticeDate":1525233600000,"awardNumber":"029053-00001","transactionTypeCode":4,"_primaryKey":"773750"}]';
        // const example5 ='[{"awardAmountTransactionId":773751,"comments":null,"documentNumber":"2455782","noticeDate":1525233600000,"awardNumber":"029053-00001","transactionTypeCode":4,"_primaryKey":"773751"}]';
        // const example6 ='[{"awardAmountTransactionId":773752,"comments":null,"documentNumber":"2455803","noticeDate":1525233600000,"awardNumber":"029054-00001","transactionTypeCode":4,"_primaryKey":"773752"}]';
        // console.log(`${example2} as 2d array: ${JSON.stringify(arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(JSON.parse(example2)))}`);      
        // console.log(`${example3} as 2d array: ${JSON.stringify(arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(JSON.parse(example3)))}`);      
        // console.log(`${example4} as 2d array: ${JSON.stringify(arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(JSON.parse(example4)))}`);      
        // console.log(`${example5} as 2d array: ${JSON.stringify(arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(JSON.parse(example5)))}`);      
        // console.log(`${example6} as 2d array: ${JSON.stringify(arrayUtils.convertOneDimObjArrToTwoDimArrWithHeaderRow(JSON.parse(example6)))}`);

describe("missing-notice-dates", function() {
  
  describe("#findMaxPrimaryKeyValueInData()", function() {
    it("should given an array with a _primaryKey column and several values, return the numeric value of the largest primary key in all the data rows", function () {
      missingNoticeDates.findMaxPrimaryKeyValueInData([["_primaryKey"], [1], [2], [3], [5], [4]]).should.be.eql(5);
    });  
  });  
  
  describe("#isErrorObj()", function() {
    it("should given a js object with a few properties and no Error property return false", function () {
      const sampleObj = {};
      sampleObj.testProp1 = "A";
      sampleObj.testProp1 = 1;      
      missingNoticeDates.isErrorObj(sampleObj).should.eql(false);
    });  
  });   
  
  describe("#isErrorObj()", function() {
    it("should given a js object an Error property which is an array return true", function () {
      const sampleObj = {};
      sampleObj.Error = ["whateverArrElem"];  
      missingNoticeDates.isErrorObj(sampleObj).should.eql(true);
    });  
  });  
  
  describe("#isErrorObj()", function() {
    it("should given a js object an Error property which is a string return true", function () {
      const sampleObj = {};
      sampleObj.Error = "whateverString";  
      missingNoticeDates.isErrorObj(sampleObj).should.eql(true);
    });  
  });    
  
  describe("#apiCallOnNextHigherPrimaryKey()", function() {
    it("should given a passed in previous primary key of 1 return the mocked up object data for primary key 2", function () {
      const jsObjVersionOfApiDataForPrimaryKey2 = JSON.parse('{"testCol1":"B","_primaryKey":"2"}');
      missingNoticeDates.apiCallOnNextHigherPrimaryKey(1).should.be.eql(jsObjVersionOfApiDataForPrimaryKey2);
    }); 
    
    it("should given a passed in previous primary key of a string value of 1 return the mocked up object data for primary key 2 and not 21", function () {
      const jsObjVersionOfApiDataForPrimaryKey2 = JSON.parse('{"testCol1":"B","_primaryKey":"2"}');
      missingNoticeDates.apiCallOnNextHigherPrimaryKey("1").should.be.eql(jsObjVersionOfApiDataForPrimaryKey2);
    });     
  });    
  
  describe("#gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys()", function() {
    it("should given a passed in previous max primary key of 1 return the mocked up 2d array with header row data for primary key 2 but stop at the mocked up error on primary key 3", function () {
      missingNoticeDates.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys(1).should.be.eql([["testCol1", "_primaryKey"], ["B", "2"]]);
    });  
  });  
  
  describe("#gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys()", function() {
    it("should given a passed in previous max primary key of 773750 return the mocked up data for primary key 773751 and 773752 but stop at the mocked up error on primary key 773753", function () {
      missingNoticeDates.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys(773750)
      .should.be.eql(
          [
            ["awardAmountTransactionId","comments","documentNumber","noticeDate","awardNumber","transactionTypeCode","_primaryKey"],
            [773751,null,"2455782",1525233600000,"029053-00001",4,"773751"],
            [773752,null,"2455803",1525233600000,"029054-00001",4,"773752"]   
          ]
        );
    });  
  });   


});

