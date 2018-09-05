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
      const retArr = apiUtils.apiGetCallKrNoPrefixes("/award/api/v1/award-types/");
      retArr[0].should.have.property("_primaryKey");
    }); 
    
    it("should if given a totally invalid url like /fakeApiUrl/ return an error object", function () {
      apiUtils.apiGetCallKrNoPrefixes("/fakeApiUrl/").should.have.property("Error");
    }); 
  });  
  
  describe("#apiGetCallKr()", function() {
    it("should if given a valid Uri like /award/api/v1/award-types/ return an object array generated from the JSON data and all objs should have prepended column names", function () {
      const retArr = apiUtils.apiGetCallKr("/award/api/v1/award-types/");
      retArr[0].should.have.property("award-types._primaryKey");
      retArr[0].should.have.property("award-types.code");
      retArr[1].should.have.property("award-types.description");
    }); 
    
    it("should if given a valid Uri returning a single object rather than an array like /award/api/v1/award-amount-transactions/773750 a single object with the column names from the API name (not primary key specified) prepended", function () {
      const retObj = apiUtils.apiGetCallKr("/award/api/v1/award-amount-transactions/773750");
      retObj.should.have.property("award-amount-transactions._primaryKey");
      retObj.should.have.property("award-amount-transactions.awardAmountTransactionId");
      retObj.should.have.property("award-amount-transactions.noticeDate");
    });     
    
    it("should if given a totally invalid url like /fakeApiUrl/ return an error object (no prepended column names)", function () {
      apiUtils.apiGetCallKr("/fakeApiUrl/").should.have.property("Error");
    }); 
  });    
  
   describe("#extractApiEndpointNameFromUri()", function() {
    it("should if given a relative Uri with multiple slashes including a trailing slash return just the name at the end between the last slashes", function () {
      apiUtils.extractApiEndpointNameFromUri("/a/b/c/d/e/f/uri-endpoint-name/").should.equal("uri-endpoint-name");
    });  
    
    it("should if given a relative Uri with multiple slashes but NOT including a trailing slash return just the name at the end", function () {
      apiUtils.extractApiEndpointNameFromUri("/a/b/c/d/e/f/uri-endpoint-name-no-slash").should.equal("uri-endpoint-name-no-slash");
    }); 
    
    it("should if given a relative Uri with multiple slashes and a number at the end (like specifying a primary key) return the endpoint name", function () {
      apiUtils.extractApiEndpointNameFromUri("/a/b/c/d/e/f/uri-endpoint-name/123456789").should.equal("uri-endpoint-name");
    });   
    
    it("should if given a relative Uri with multiple slashes and filtering by request variables with no trailing slash returns just the endpoint name", function () {
      apiUtils.extractApiEndpointNameFromUri("/a/b/c/d/e/f/uri-endpoint-name?someFilter=1").should.equal("uri-endpoint-name");
    });  
  
    it("should if given a relative Uri with multiple slashes and filtering by request variables WITH trailing slash returns just the endpoint name", function () {
      apiUtils.extractApiEndpointNameFromUri("/a/b/c/d/e/f/uri-endpoint-name/?someFilter=1").should.equal("uri-endpoint-name");
    });     
     
    it("should if given a relative uri /award/api/v1/award-types/ return just award-types", function () {
      apiUtils.extractApiEndpointNameFromUri("/award/api/v1/award-types/").should.equal("award-types");
    }); 
    
    it("should if given a real sample relative url /award/api/v1/award-amount-transactions/773750 return just award-amount-transactions", function () {
      apiUtils.extractApiEndpointNameFromUri("/award/api/v1/award-amount-transactions/773750").should.equal("award-amount-transactions");
    }); 
    
    it("should if given a full (including domain, etc) uri https://umd-sbx.kuali.co/res/award/api/v1/award-types/ return just award-types", function () {
      apiUtils.extractApiEndpointNameFromUri("https://umd-sbx.kuali.co/res/award/api/v1/award-types/").should.equal("award-types");
    });     
  }); 
  
  
  describe("#getAwardAmountTransactionByPrimaryKey()", function() {
    
    it("should if passed the _primaryKey 773750, return a valid js object (not raw JSON) with a awardAmountTransactionId property of 773750", function () {
                                      // console.log(`missingNoticeDates.getAwardAmountTransactionByPrimaryKey(773750) is returning: ${JSON.stringify(apiUtils.getAwardAmountTransactionByPrimaryKey("773750"))}\n`)
      apiUtils.getAwardAmountTransactionByPrimaryKey("773750").should.have.property("award-amount-transactions.awardAmountTransactionId", 773750);
    }); 
    
    it("should if given a totally invalid primary key like -1 return an error object", function () {
      apiUtils.getAwardAmountTransactionByPrimaryKey(-1).should.have.property("Error");
    }); 
    
  });  
  

});

