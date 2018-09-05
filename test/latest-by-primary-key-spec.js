/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
require("mocha");
const should = require("should");
const rewire = require("rewire");

// using rewire to mock out the responses from the callKrGetApiWithWait function called inside the missing-notice-dates module - use switch statement to return json for known primary keys and otherwise return json example when an error occurs
const latestByPrimaryKey = rewire("../src/latest-by-primary-key.js");
latestByPrimaryKey.__set__("apiUtils", {
    apiGetCallKr: function (relativeApiUri) {
                                                          //console.log(`inside rewiring of latestByPrimaryKey calls of apiUtils.apiGetCallKr, relativeApiUri detected as: ${relativeApiUri}`)      
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

// using rewire to mock out the responses from the getScriptProperty function called inside the googleAppsScriptWrappers module & just mock a setScriptProperty function that does nothing (so that no errors are thrown)
const googleAppsScriptWrappers = require("../src/google-apps-script-wrappers/google-apps-script-wrappers.js");
latestByPrimaryKey.__set__("googleAppsScriptWrappers", {
    getScriptProperty: function (key) {
      return 7;  // for our simple test purposes, pretend the last highest primary key is always 7
    },
    setScriptProperty: function (key, value) {
      return true; // for our simple test purposes, mock out function to always return true...we just dont want it to throw an error because the script properies classes dont exist
    },    
});

          //ARRAY-UTILS IMPORT TEMPORARY FOR CONVERSION OF TEST DATA - REMOVE LATER
          // const arrayUtils = require("../src/array-utils.js");
          
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

describe("latest-by-primary-key", function() {
  
  describe("#findMaxPrimaryKeyValueInData()", function() {
    it("should given an array with a column award-amount-transactions._primaryKey and several values, return the numeric value of the largest primary key in all the data rows", function () {
      latestByPrimaryKey.findMaxPrimaryKeyValueInData("award-amount-transactions._primaryKey", [["award-amount-transactions._primaryKey"], [1], [2], [3], [5], [4]], "/award/api/v1/award-amount-transactions/")
      .should.be.eql(5);
    });  

    it("should given empty data (empty data array), return the cached largest primary key (should be numeric) and since we can check the GAS property directly, the function return should match it", function () {
      latestByPrimaryKey.findMaxPrimaryKeyValueInData("doesNotMatterDataEmpty", [], "/award/api/v1/award-amount-transactions/").should.be.Number();
    });  

    it("should given empty data (empty data array), return the last primary key value stored in the script property data store (which we mocked out in this case to always return 7 since we can't access the real GAS script data store from our test scripts", function () {
      latestByPrimaryKey.findMaxPrimaryKeyValueInData("doesNotMatterDataEmpty", [], "/award/api/v1/award-amount-transactions/").should.eql(7);
    });  
  });  
  
  describe("#apiCallOnNextHigherPrimaryKey()", function() {
    it("should given a passed in previous primary key of 1 return the mocked up object data for primary key 2", function () {
      const jsObjVersionOfApiDataForPrimaryKey2 = JSON.parse('{"award-amount-transactions.testCol1":"B","award-amount-transactions._primaryKey":"2"}');
      latestByPrimaryKey.apiCallOnNextHigherPrimaryKey(1, "/award/api/v1/award-amount-transactions/").should.be.eql(jsObjVersionOfApiDataForPrimaryKey2);
    }); 
    
    // it("should given a passed in previous primary key of a string value of 1 return the mocked up object data for primary key 2 and not 21", function () {
    //   const jsObjVersionOfApiDataForPrimaryKey2 = JSON.parse('{"award-amount-transactions.testCol1":"B","award-amount-transactions._primaryKey":"2"}');
    //   latestByPrimaryKey.apiCallOnNextHigherPrimaryKey("1", "/award/api/v1/award-amount-transactions/").should.be.eql(jsObjVersionOfApiDataForPrimaryKey2);
    // });     
  });    
  
  describe("#gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys()", function() {
    // it("should given a passed in previous max primary key of 1 return the mocked up 2d array with header row data for primary key 2 but stop at the mocked up error on primary key 3", function () {
    //   latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys(1, "/award/api/v1/award-amount-transactions/").should.be.eql([["award-amount-transactions.testCol1", "award-amount-transactions._primaryKey"], ["B", "2"]]);
    // });  

    // it("should given a passed in previous max primary key of 773750 return the mocked up data for primary key 773751 and 773752 but stop at the mocked up error on primary key 773753", function () {
    //   latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys(773750, "/award/api/v1/award-amount-transactions/")
    //   .should.be.eql(
    //       [
    //         ["award-amount-transactions.awardAmountTransactionId","award-amount-transactions.comments","award-amount-transactions.documentNumber","award-amount-transactions.noticeDate","award-amount-transactions.awardNumber","award-amount-transactions.transactionTypeCode","award-amount-transactions._primaryKey"],
    //         [773751,null,"2455782",1525233600000,"029053-00001",4,"773751"],
    //         [773752,null,"2455803",1525233600000,"029054-00001",4,"773752"]   
    //       ]
    //     );
    // });  
  });   


});


