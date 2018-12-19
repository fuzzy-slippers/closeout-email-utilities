/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
require("mocha");
const should = require("should");
const rewire = require("rewire");

// using rewire to mock out the responses from the callKrGetApiWithWait function called inside the missing-notice-dates module - use switch statement to return json for known primary keys and otherwise return json example when an error occurs
const latestByPrimaryKey = rewire("../src/latest-by-primary-key.js");
const nonMockedApiUtils = require("../src/api-utils.js");

latestByPrimaryKey.__set__("apiUtils", {

    apiGetCallKr: function (relativeApiUri) {
                                                          //console.log(`inside rewiring of latestByPrimaryKey calls of apiUtils.apiGetCallKr, relativeApiUri detected as: ${relativeApiUri}`)      
      switch (relativeApiUri) {
      //award amount transaction api mock data  
      case "/award/api/v1/award-amount-transactions/" + "1":
        return JSON.parse('{"award-amount-transactions.testCol1":"A","award-amount-transactions._primaryKey":"1","award-amount-transactions.documentNumber":"88888888"}');
      case "/award/api/v1/award-amount-transactions/" + "2":
        return JSON.parse('{"award-amount-transactions.testCol1":"B","award-amount-transactions._primaryKey":"2","award-amount-transactions.documentNumber":"88888888"}');
      case "/award/api/v1/award-amount-transactions/" + "3":
        return JSON.parse('{"Error":{"errors":["not found for key 3"]}}');
      case "/award/api/v1/award-amount-transactions/" + "7001":
        return JSON.parse('{"award-amount-transactions.testCol1":"DOESNOTMATCHDOCNUMTODOCROUTEHEADERVALAPI","award-amount-transactions._primaryKey":"7001","award-amount-transactions.documentNumber":"-9999"}');
      case "/award/api/v1/award-amount-transactions/" + "773750":
        return JSON.parse('{"award-amount-transactions.awardAmountTransactionId":773750,"award-amount-transactions.comments":null,"award-amount-transactions.documentNumber":"2455782","award-amount-transactions.noticeDate":1525233600000,"award-amount-transactions.awardNumber":"029053-00001","award-amount-transactions.transactionTypeCode":4,"award-amount-transactions._primaryKey":"773750"}');
      case "/award/api/v1/award-amount-transactions/" + "773751":
        return JSON.parse('{"award-amount-transactions.awardAmountTransactionId":773751,"award-amount-transactions.comments":null,"award-amount-transactions.documentNumber":"2455782","award-amount-transactions.noticeDate":1525233600000,"award-amount-transactions.awardNumber":"029053-00001","award-amount-transactions.transactionTypeCode":4,"award-amount-transactions._primaryKey":"773751"}');
      case "/award/api/v1/award-amount-transactions/" + "773752":
        return JSON.parse('{"award-amount-transactions.awardAmountTransactionId":773752,"award-amount-transactions.comments":null,"award-amount-transactions.documentNumber":"2455803","award-amount-transactions.noticeDate":1525233600000,"award-amount-transactions.awardNumber":"029054-00001","award-amount-transactions.transactionTypeCode":4,"award-amount-transactions._primaryKey":"773752"}');     
      case "/award/api/v1/award-amount-transactions/" + "773753":
        return JSON.parse('{"Error":{"errors":["not found for key 773753"]}}');
      //document route header values (status) api mock data
      case "/research-sys/api/v1/document-route-header-values/" + "88888888":
        return JSON.parse(`{"document-route-header-values.documentId":"88888888","document-route-header-values._primaryKey":"88888888"}`);
      case "/research-sys/api/v1/document-route-header-values/" + "2455782":
        return JSON.parse(`{"document-route-header-values.finalizedDate":"1525267469000","document-route-header-values.appDocStatus":"","document-route-header-values.routeStatusDate":"1525267469000","document-route-header-values.documentTypeId":"2326828","document-route-header-values.dateModified":"1525267469000","document-route-header-values.docTitle":"KC TimeAndMoney - SAB","document-route-header-values.appDocId":"","document-route-header-values.approvedDate":"1525267468000","document-route-header-values.appDocStatusDate":"","document-route-header-values.docRouteStatus":"F","document-route-header-values.initiatorWorkflowId":"113187162","document-route-header-values.documentId":"2455782","document-route-header-values._primaryKey":"2455782","document-route-header-values.docRouteLevel":"0","document-route-header-values.docVersion":"1","document-route-header-values.createDate":"1525267431000","document-route-header-values.routedByUserWorkflowId":"113187162"}`);
      case "/research-sys/api/v1/document-route-header-values/" + "2455803":
        return JSON.parse(`{"document-route-header-values.finalizedDate":"1525269344000","document-route-header-values.appDocStatus":"","document-route-header-values.routeStatusDate":"1525269344000","document-route-header-values.documentTypeId":"2326828","document-route-header-values.dateModified":"1525269344000","document-route-header-values.docTitle":"KC TimeAndMoney - SAB","document-route-header-values.appDocId":"","document-route-header-values.approvedDate":"1525269344000","document-route-header-values.appDocStatusDate":"","document-route-header-values.docRouteStatus":"F","document-route-header-values.initiatorWorkflowId":"113187162","document-route-header-values.documentId":"2455803","document-route-header-values._primaryKey":"2455803","document-route-header-values.docRouteLevel":"0","document-route-header-values.docVersion":"1","document-route-header-values.createDate":"1525269293000","document-route-header-values.routedByUserWorkflowId":"113187162"}`);
      case "/research-sys/api/v1/document-route-header-values/" + "-9999":
        return JSON.parse('{"Error":{"errors":["not found for key -9999"]}}')
      }
    },
    //call the real versions of the below functions in apiUtils (we don't want to mock these ones)
    hasErrorProperty: (jsObj) => nonMockedApiUtils.hasErrorProperty(jsObj),
    extractApiEndpointNameFromUri: (partialOrFullUriString) => nonMockedApiUtils.extractApiEndpointNameFromUri(partialOrFullUriString),
    
    
});

// using rewire to mock out the responses from the getScriptProperty function called inside the googleAppsScriptWrappers module & just mock a setScriptProperty function that does nothing (so that no errors are thrown)
const googleAppsScriptWrappers = require("../src/google-apps-script-wrappers/google-apps-script-wrappers.js");
latestByPrimaryKey.__set__("googleAppsScriptWrappers", {
    getScriptProperty: function (key) {
      return "7";  // for our simple test purposes, pretend the last highest primary key is always 7
    },
    setScriptProperty: function (key, value) {
      return "true"; // for our simple test purposes, mock out function to always return true...we just dont want it to throw an error because the script properies classes dont exist
    },    
});

describe("latest-by-primary-key", function() {
  
  describe("#findMaxPrimaryKeyValueInData()", function() {
    it("should given an array with a column award-amount-transactions._primaryKey and several values, return the numeric value of the largest primary key in all the data rows", function () {
      latestByPrimaryKey.findMaxPrimaryKeyValueInData("award-amount-transactions._primaryKey", [["award-amount-transactions._primaryKey"], ["1"], ["2"], ["3"], ["5"], ["4"]], "/award/api/v1/award-amount-transactions/")
      .should.be.eql("5");
    });  

    it("should given empty data (empty data array), return the cached largest primary key (should be numeric) and since we can check the GAS property directly, the function return should match it", function () {
      latestByPrimaryKey.findMaxPrimaryKeyValueInData("doesNotMatterDataEmpty", [], "/award/api/v1/award-amount-transactions/").should.be.String();
      Number.parseInt(latestByPrimaryKey.findMaxPrimaryKeyValueInData("doesNotMatterDataEmpty", [], "/award/api/v1/award-amount-transactions/")).should.be.Number();
    });  

    it("should given empty data (empty data array), return the last primary key value stored in the script property data store (which we mocked out in this case to always return 7 since we can't access the real GAS script data store from our test scripts", function () {      
      latestByPrimaryKey.findMaxPrimaryKeyValueInData("doesNotMatterDataEmpty", [], "/award/api/v1/award-amount-transactions/").should.eql("7");
    });  
  });  
  
  describe("#apiCallOnNextHigherPrimaryKey()", function() {
    it("should given a passed in previous primary key of 1 return the mocked up object data for primary key 2 (including info from document status api call with matching document id 88888888)", function () {
      const jsObjVersionOfApiDataForPrimaryKey2 = JSON.parse('{"award-amount-transactions.testCol1":"B","award-amount-transactions._primaryKey":"2","award-amount-transactions.documentNumber":"88888888", "document-route-header-values.documentId":"88888888","document-route-header-values._primaryKey":"88888888"}');
      latestByPrimaryKey.apiCallsOnNextHigherPrimaryKey("1", "/award/api/v1/award-amount-transactions/", "award-amount-transactions.documentNumber", "/research-sys/api/v1/document-route-header-values/").should.be.eql(jsObjVersionOfApiDataForPrimaryKey2);
    }); 
    
    it("should given a passed in previous primary key of a string value of 1 return the mocked up object data for primary key 2 (including info from document status api call with matching document id 88888888)", function () {
      const jsObjVersionOfApiDataForPrimaryKey2 = JSON.parse('{"award-amount-transactions.testCol1":"B","award-amount-transactions._primaryKey":"2","award-amount-transactions.documentNumber":"88888888", "document-route-header-values.documentId":"88888888","document-route-header-values._primaryKey":"88888888"}');
      latestByPrimaryKey.apiCallsOnNextHigherPrimaryKey("1", "/award/api/v1/award-amount-transactions/", "award-amount-transactions.documentNumber", "/research-sys/api/v1/document-route-header-values/").should.be.eql(jsObjVersionOfApiDataForPrimaryKey2);
    });  
    
    it("should given a passed in previous primary key of 2 return the an error object (would look up primary key 3 which does not exist yet in our mocked data)", function () {
      latestByPrimaryKey.apiCallsOnNextHigherPrimaryKey("2", "/award/api/v1/award-amount-transactions/", "award-amount-transactions.documentNumber", "/research-sys/api/v1/document-route-header-values/").should.be.eql({"Error":{"errors":["not found for key 3"]}});
    }); 
    
    it("should when the first API call returns valid data but the doc number in that data when queried against the second api returns an error for not found (or other error), also return an error", function () {
      latestByPrimaryKey.apiCallsOnNextHigherPrimaryKey("7000", "/award/api/v1/award-amount-transactions/", "award-amount-transactions.documentNumber", "/research-sys/api/v1/document-route-header-values/").should.be.eql({"Error":{"errors":["not found for key -9999"]}});
    });     
  });    
  
  describe("#gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys()", function() {
    it("should given a passed in previous max primary key of 1 return the mocked up 2d array with header row data for primary key 2 but stop at the mocked up error on primary key 3 (based on rewire sample data primary key 3 not found)", function () {
      latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys("1", "/award/api/v1/award-amount-transactions/", "award-amount-transactions._primaryKey", "/research-sys/api/v1/document-route-header-values/", "award-amount-transactions.documentNumber").should.be.eql([["award-amount-transactions.testCol1", "award-amount-transactions._primaryKey","award-amount-transactions.documentNumber","document-route-header-values.documentId","document-route-header-values._primaryKey"], ["B", "2","88888888","88888888","88888888"]]);
    });  
    
    it("should given a passed in previous max primary key of string 2 return an empty array (based on rewire sample data primary key 3 not found/API returns error object)", function () {
      latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys("2", "/award/api/v1/award-amount-transactions/", "award-amount-transactions._primaryKey", "/research-sys/api/v1/document-route-header-values/", "award-amount-transactions.documentNumber").should.be.eql([]);
    });    
    
    it("should given a passed in previous max primary key null which is the value that the google property store will return if the cached property does not exist yet (so when we have an empty sheet plus no cached last highest primary key value) should return back an empty array", function () {
      latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys("2", "/award/api/v1/award-amount-transactions/", "award-amount-transactions._primaryKey", "/research-sys/api/v1/document-route-header-values/", "award-amount-transactions.documentNumber").should.be.eql([]);
    });     

    it("should given a passed in previous max primary key of 773750 return the mocked up data for primary key 773751 and 773752 but stop at the mocked up error on primary key 773753 (based on rewire sample data primary key 773753 not found)", function () {
      latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys("773750", "/award/api/v1/award-amount-transactions/", "award-amount-transactions._primaryKey", "/research-sys/api/v1/document-route-header-values/", "award-amount-transactions.documentNumber")
      .should.be.eql(
          [
            ["award-amount-transactions.awardAmountTransactionId","award-amount-transactions.comments","award-amount-transactions.documentNumber","award-amount-transactions.noticeDate","award-amount-transactions.awardNumber","award-amount-transactions.transactionTypeCode","award-amount-transactions._primaryKey","document-route-header-values.finalizedDate","document-route-header-values.appDocStatus","document-route-header-values.routeStatusDate","document-route-header-values.documentTypeId","document-route-header-values.dateModified","document-route-header-values.docTitle","document-route-header-values.appDocId","document-route-header-values.approvedDate","document-route-header-values.appDocStatusDate","document-route-header-values.docRouteStatus","document-route-header-values.initiatorWorkflowId","document-route-header-values.documentId","document-route-header-values._primaryKey","document-route-header-values.docRouteLevel","document-route-header-values.docVersion","document-route-header-values.createDate","document-route-header-values.routedByUserWorkflowId"],
            ["773751","","2455782","1525233600000","029053-00001","4","773751","1525267469000","","1525267469000","2326828","1525267469000","KC TimeAndMoney - SAB","","1525267468000","","F","113187162","2455782","2455782","0","1","1525267431000","113187162"],
            ["773752","","2455803","1525233600000","029054-00001","4","773752","1525269344000","","1525269344000","2326828","1525269344000","KC TimeAndMoney - SAB","","1525269344000","","F","113187162","2455803","2455803","0","1","1525269293000","113187162"]   
          ]
        );
    });  

    it("should given a passed in previous max primary key of 7000, which finds a award-amount-transaction of 7001 but then cant find a document status via the second api, should return an error", function () {
      latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys("7000", "/award/api/v1/award-amount-transactions/", "award-amount-transactions._primaryKey", "/research-sys/api/v1/document-route-header-values/", "award-amount-transactions.documentNumber")
      .should.be.eql([]);
    });    
    
  });   


});


