/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
require("mocha");
const should = require("should");
const rewire = require("rewire");


// using rewire to mock out the responses from the callKrGetApiWithWait function called inside the missing-notice-dates module - use switch statement to return json for known primary keys and otherwise return json example when an error occurs
const apiUtils = rewire("../src/api-utils.js");
apiUtils.__set__("googleAppsScriptWrappers", {
    callKrGetApiWithWait: function (relativeApiUri) {
                                                          // console.log(`inside rewiring of callKrGetApiWithWait, relativeApiUri detected as: ${relativeApiUri}`)      
      switch (relativeApiUri) {
      case "/award/api/v1/award-amount-transactions/" + "773750":
        return '{"awardAmountTransactionId":773750,"comments":null,"documentNumber":"2455782","noticeDate":1525233600000,"awardNumber":"029053-00001","transactionTypeCode":4,"_primaryKey":"773750"}';
      case "/award/api/v1/award-types/":
        return '[{"code":1,"description":"Grant","_primaryKey":"1"},{"code":3,"description":"Contract","_primaryKey":"3"},{"code":4,"description":"Indefinite Delivery Contract","_primaryKey":"4"},{"code":5,"description":"Cooperative Agreement","_primaryKey":"5"},{"code":8,"description":"Consortium Membership","_primaryKey":"8"},{"code":9,"description":"Other Transaction Agreement","_primaryKey":"9"},{"code":13,"description":"Non Disclosure Agreement","_primaryKey":"13"},{"code":14,"description":"Material Transfer Agreement","_primaryKey":"14"},{"code":15,"description":"Teaming Agreement","_primaryKey":"15"},{"code":16,"description":"Equipment Loan","_primaryKey":"16"},{"code":17,"description":"Memorandum of Understanding","_primaryKey":"17"},{"code":18,"description":"Intergovernmental Personnel Assignment","_primaryKey":"18"},{"code":19,"description":"CHOOSE AN AWARD TYPE - was blank in RAA - DO NOT USE","_primaryKey":"19"},{"code":20,"description":"Data Use Agreement","_primaryKey":"20"},{"code":21,"description":"Software License","_primaryKey":"21"}]';
      default:
        return '{"Error":{"errors":["not found for key -1"]}}';
      }
    }
});



describe("api-utils", function() {

  describe("#apiGetCallKr()", function() {
    it("should if given a valid Uri like /award/api/v1/award-types/ return an object (array) generated from the JSON data returned with the array position 1 object having a _primaryKey property", function () {
      const retArr = apiUtils.apiGetCallKr("/award/api/v1/award-types/");
                                          // console.log(`retArr is: ${JSON.stringify(retArr)}`);
                                          // console.log(`retArr[0] is: ${JSON.stringify(retArr[0])}`);      
      retArr[0].should.have.property("_primaryKey");
    }); 
    
    it("should if given a totally invalid url like /fakeApiUrl/ return an error object", function () {
      apiUtils.apiGetCallKr("/fakeApiUrl/").should.have.property("Error");
    }); 
  });  
  
  
  describe("#getAwardAmountTransactionByPrimaryKey()", function() {
    
    it("should if passed the _primaryKey 773750, return a valid js object (not raw JSON) with a awardAmountTransactionId property of 773750", function () {
                                      // console.log(`missingNoticeDates.getAwardAmountTransactionByPrimaryKey(773750) is returning: ${JSON.stringify(apiUtils.getAwardAmountTransactionByPrimaryKey("773750"))}\n`)
      apiUtils.getAwardAmountTransactionByPrimaryKey("773750").should.have.property("awardAmountTransactionId", 773750);
    }); 
    
    it("should if given a totally invalid primary key like -1 return an error object", function () {
      apiUtils.getAwardAmountTransactionByPrimaryKey(-1).should.have.property("Error");
    }); 

  describe("#isErrorObj()", function() {
    it("should given a js object with a few properties and no Error property return false", function () {
      const sampleObj = {};
      sampleObj.testProp1 = "A";
      sampleObj.testProp1 = 1;      
      apiUtils.isErrorObj(sampleObj).should.eql(false);
    });  
  });   
  
  describe("#isErrorObj()", function() {
    it("should given a js object an Error property which is an array return true", function () {
      const sampleObj = {};
      sampleObj.Error = ["whateverArrElem"];  
      apiUtils.isErrorObj(sampleObj).should.eql(true);
    });  
  });  
  
  describe("#isErrorObj()", function() {
    it("should given a js object an Error property which is a string return true", function () {
      const sampleObj = {};
      sampleObj.Error = "whateverString";  
      apiUtils.isErrorObj(sampleObj).should.eql(true);
    });  
  });
  
  describe("#apiGetCallKrWDotEndpointNames()", function() {
    it("should if given a valid Uri like /award/api/v1/award-types/ return an object (array) generated from the JSON data returned with the array position 1 object having a award_types._primaryKey property (endpoint name plus dot prepended to all property names returned)", function () {
      const retArr = apiUtils.apiGetCallKrWDotEndpointNames("/award/api/v1/award-types/");
      console.log(`********************************** retArr is: ${JSON.stringify(retArr)} *************`)
      //retArr[0].should.have.property("award-types._primaryKey");
    }); 
    
    it("should if given a totally invalid url like /fakeApiUrl/ return an Error object (no enpoint names/dots prepended to Error properties returned)", function () {
      apiUtils.apiGetCallKrWDotEndpointNames("/fakeApiUrl/").should.have.property("Error");
    }); 
  }); 

    
  });  
  

});

