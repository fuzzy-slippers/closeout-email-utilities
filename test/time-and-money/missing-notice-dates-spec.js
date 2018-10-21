/* 
It does not appear to be possible to do integration testing, at least with rewire (maybe too simplistic type of mocking for this scenario)
For example, any meaningful test would need you to pass in data and check the result, but the problem is that any part you would want to test
at some level below is making an API call, or google sheet call, etc. But rewire only lets you mock out functions 2 levels deep. For example,
if I want to test that some sample primary key when passed to the first module is transformed, then passed to the second module...well you would
basically have to mock out the data returned from each function of each module (because some level below there, there is an API call...except a function that is very trivial like array utils)
so anything that relates at any level to API calls needs to be mocked out (you have to set up...if this data was passed to the function, this result is passed back) - this sort of defeats the purpose
of your integration testing because you are essentially mocking out all the functions in all the modules. Since our missing-notice-dates module logic is very simple, when you mock
out all the modules below it with hard coded results, you are not really testing much in the end 

*/

/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
//not fully working...got overwhelmed with the number of sub functions and GAS cache values that would need to be mocked out and that sinon spy's would be needed to test if the spreadsheet was going to be updated with the correct data
require("mocha");
const should = require("should");
const rewire = require("rewire");

const missingNoticeDates = rewire("../../src/time-and-money/missing-notice-dates.js");
// using rewire to mock out the responses from the latestByPrimaryKey function called inside the latest-by-primary-key module used inside missing-notice-dates
const latestByPrimaryKey = require("../../src/latest-by-primary-key.js");

// using rewire to mock out the responses from the callKrGetApiWithWait function (api call results) called inside the missing-notice-dates module - use switch statement to return json for known primary keys and otherwise return json example when an error occurs
missingNoticeDates.__set__({
    // googleAppsScriptWrappers: {
    //     callKrGetApiWithWait: function (relativeApiUri) {
    //                                                       console.log(`************************inside rewiring of googleAppsScriptWrappers.callKrGetApiWithWait, relativeApiUri detected as: ${JSON.stringify(relativeApiUri)}*********************`)      
    //       return "foofoofoo";
          
    //     switch (relativeApiUri) {
    //       case "/award/api/v1/award-amount-transactions/7001":
    //         return '{"ColOne":1, "ColTwo":2,"_primaryKey":7001"}';
    //       case "/award/api/v1/award-types/":
    //         return '[{"code":1,"description":"Grant","_primaryKey":"1"},{"code":3,"description":"Contract","_primaryKey":"3"},{"code":4,"description":"Indefinite Delivery Contract","_primaryKey":"4"},{"code":5,"description":"Cooperative Agreement","_primaryKey":"5"},{"code":8,"description":"Consortium Membership","_primaryKey":"8"},{"code":9,"description":"Other Transaction Agreement","_primaryKey":"9"},{"code":13,"description":"Non Disclosure Agreement","_primaryKey":"13"},{"code":14,"description":"Material Transfer Agreement","_primaryKey":"14"},{"code":15,"description":"Teaming Agreement","_primaryKey":"15"},{"code":16,"description":"Equipment Loan","_primaryKey":"16"},{"code":17,"description":"Memorandum of Understanding","_primaryKey":"17"},{"code":18,"description":"Intergovernmental Personnel Assignment","_primaryKey":"18"},{"code":19,"description":"CHOOSE AN AWARD TYPE - was blank in RAA - DO NOT USE","_primaryKey":"19"},{"code":20,"description":"Data Use Agreement","_primaryKey":"20"},{"code":21,"description":"Software License","_primaryKey":"21"}]';
    //       default:
    //         return '{"Error":{"errors":["not found for key -1"]}}';
    //     }
    //   }
    // },
    latestByPrimaryKey: {

        //definitely need to mock out  findMaxPrimaryKeyValueInData due to it calling inside another module googleAppsScriptWrappers.setScriptProperty and queries.findMaxColValInAllDataRows     
        findMaxPrimaryKeyValueInData: function (colToFindMax, twoDimArrWHeader, relativeUriPath) {
                                                              console.log(`************************inside rewiring of latestByPrimaryKey.findMaxPrimaryKeyValueInData, twoDimArrWHeader detected as: ${JSON.stringify(twoDimArrWHeader)}*********************`)      
          if (twoDimArrWHeader.length === 0)
          {
                                                              console.log(`RETURNING 8000 when empty array with no header passed in...pretending when no header passed it there is really a last primary key of 8000 in the google property store from last time (for example if someone clears the sheet but there were prior runs)`)
            return "8000"; // google property store returns null if no property exists yet under that name
          }
          else if (JSON.stringify(twoDimArrWHeader) === JSON.stringify([["award-amount-transactions.NoMockedPropertyInGooglePropertyStoreItsNull", "award-amount-transactions.ColB", "award-amount-transactions._primaryKey"]]))
          {
                                                              console.log(`RETURNING null when array with just header with column name award-amount-transactions.NoMockedPropertyInGooglePropertyStoreItsNull passed in...pretending nothing in the cached google property store value yet - from mock latestByPrimaryKey.findMaxPrimaryKeyValueInData`)
            return null; // google property store returns null if no property exists yet under that name
          } 
          else if (JSON.stringify(twoDimArrWHeader) === JSON.stringify([["award-amount-transactions.UseMockedPropertyValueSevenThousand","award-amount-transactions.ColB","award-amount-transactions._primaryKey"]]))
          {
                                                              console.log(`RETURNING 7000 - from mock latestByPrimaryKey.findMaxPrimaryKeyValueInData`)
            return "7000";
          }
          else if (JSON.stringify(twoDimArrWHeader) === JSON.stringify(
            [["award-amount-transactions.UseMockedPropertyValueSevenThousand", "award-amount-transactions.ColB", "award-amount-transactions._primaryKey"],
            ["existing sheet data row 1","A","10"],
            ["existing sheet data row 2","B","20"]]
            )
          )
          {
                                                              console.log(`RETURNING 7000 - from mock latestByPrimaryKey.findMaxPrimaryKeyValueInData`)
            return "7000";
          }          
          else if (JSON.stringify(twoDimArrWHeader) === JSON.stringify(
            [["award-amount-transactions.UseMockedPropertyValueNineThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],
            ["existing sheet data row 1","A","10"],
            ["existing sheet data row 2","B","20"]]))
          {
                                                              console.log(`RETURNING 9000 - from mock latestByPrimaryKey.findMaxPrimaryKeyValueInData`)
            return "9000";
          } 
          else if (JSON.stringify(twoDimArrWHeader) === JSON.stringify(
            [["award-amount-transactions.UseMockedPropertyValueTenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],
            ["existing sheet data row 1","","10"],
            ["existing sheet data row 2","","20"]]))
          {
                                                              console.log(`RETURNING 10000 - from mock latestByPrimaryKey.findMaxPrimaryKeyValueInData`)
            return "10000";
          }     
          else if (JSON.stringify(twoDimArrWHeader) === JSON.stringify(          
          [["award-amount-transactions.UseMockedPropertyValueElevenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],
          ["existing sheet data row 1","","10"],
          ["existing sheet data row 2","","20"],
          ["existing sheet data row 3","","30"]]))
          {
                                                              console.log(`RETURNING 11000 - from mock latestByPrimaryKey.findMaxPrimaryKeyValueInData`)
            return "11000";
          }
          else if (JSON.stringify(twoDimArrWHeader) === JSON.stringify(             
          [["award-amount-transactions.UseMockedPropertyValueElevenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],
          ["existing sheet data row 1","","10"],
          ["existing sheet data row 2","2026-06-26"],
          ["existing sheet data row 3","","30"]])) 
          {
                                                              console.log(`RETURNING 11000 also - from mock latestByPrimaryKey.findMaxPrimaryKeyValueInData`)
            return "11000";
          }
          else if (JSON.stringify(twoDimArrWHeader) === JSON.stringify(             
          [["award-amount-transactions.UseMockedPropertyValueElevenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey", "extraSpreadsheetColumn1", "extraSpreadsheetColumn2", "extraSpreadsheetColumn3"],
          ["existing sheet data row 1","","10","manually entered into sheet 1", "", ""],
          ["existing sheet data row 2","","20","manually entered into sheet 1", "manually entered into sheet 2", ""],
          ["existing sheet data row 3","","30","manually entered into sheet 1", "manually entered into sheet 2", "manually entered into sheet 3"]])) 
          {
                                                              console.log(`RETURNING 11000 also - from mock latestByPrimaryKey.findMaxPrimaryKeyValueInData`)
            return "11000";
          }          
          else
            return "findMaxPrimaryKeyValueInData twoDimArrWHeader DID NOT MATCH ANYTHING";
        },
        
        // have to mock out gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys due to calls insde to other modules such as apiUtils.hasErrorProperty and arrayUtils.lastArrElement
        gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys: (maxPreviouslyUsedPrimaryKey, relativeUriPath) => {
                                                            console.log(`************************inside rewiring of latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys, maxPreviouslyUsedPrimaryKey detected as: ${maxPreviouslyUsedPrimaryKey}*********************`)      
          if (maxPreviouslyUsedPrimaryKey === "7000")                                     
            return [["award-amount-transactions.UseMockedPropertyValueSevenThousand","award-amount-transactions.ColB","award-amount-transactions._primaryKey"],["1","2","7001"]];
          else if (maxPreviouslyUsedPrimaryKey === "8000") {
                                                            console.log(`-=-----------============-===========RETURNING [["award-amount-transactions.NoMockedPropertyInGooglePropertyStoreItsNull", "award-amount-transactions.ColB", "award-amount-transactions._primaryKey"]["A","B","8001"]]`);
            return [["award-amount-transactions.NoMockedPropertyInGooglePropertyStoreItsNull", "award-amount-transactions.ColB", "award-amount-transactions._primaryKey"],["A","B","8001"]];
          }
          else if (maxPreviouslyUsedPrimaryKey === "9000") {
                                                            console.log(`-=-=-=-=-=-=--=-=-=RETURNING [["award-amount-transactions.UseMockedPropertyValueNineThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],["from mocked API data row 3","","9001"]]`);
            return [["award-amount-transactions.UseMockedPropertyValueNineThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],["from mocked API data row 3","","9001"]];
          }      
          else if (maxPreviouslyUsedPrimaryKey === "10000") {
                                                            console.log(`-=-=-=-=-=-=--=-=-=RETURNING [["award-amount-transactions.UseMockedPropertyValueTenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],["will be excluded since noticce date is not blank/null","2026-05-31","10001"]]`);
            return [["award-amount-transactions.UseMockedPropertyValueTenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],["will be excluded since noticce date is not blank/null","2026-05-31","10001"]];
          } 
          else if (maxPreviouslyUsedPrimaryKey === "11000") {
                                                            console.log(`-=-=-=-=-=-=--=-=-=RETURNING [["award-amount-transactions.UseMockedPropertyValueElevenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],["from mocked API data row 3","null",11001]]`);
            return [["award-amount-transactions.UseMockedPropertyValueElevenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],["from mocked API data row 4","","11001"]];
          }          
          else (maxPreviouslyUsedPrimaryKey === null)
            return ["DID NOT MATCH ANY maxPreviouslyUsedPrimaryKey values"];
        },
    },
});



describe("missing-notice-dates", function() {
  
  describe("#updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates()", function() {
    it("should when previous array (sheet) data is empty with just a header row with a 'UseMockedPropertyValueSevenThousand' and 'award-amount-transactions._primaryKey' columns (with mocked last primary key value of 7000), should return an array with mocked data for primary key 7000", function () {
      missingNoticeDates.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(
        [["award-amount-transactions.UseMockedPropertyValueSevenThousand", "award-amount-transactions.ColB", "award-amount-transactions._primaryKey"]])
        .should.be.eql([["award-amount-transactions.UseMockedPropertyValueSevenThousand","award-amount-transactions.ColB","award-amount-transactions._primaryKey","award-amount-transactions.computedRefreshed","award-amount-transactions.computedIsAutoSaved"],["1","2","7001","",""]]);
    });    

    it("should when the previous array (sheet) data is empty with just a header row (and a mocked last primary key value is not yet in the google property store - its null), set the sheet to empty array - corresponds to the scenario that google property store is empty and the spreadsheet passed in is empty", function () {
      missingNoticeDates.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(
        [["award-amount-transactions.NoMockedPropertyInGooglePropertyStoreItsNull", "award-amount-transactions.ColB", "award-amount-transactions._primaryKey"]])
        .should.be.eql([]);
    });
    
    it("should when the previous array (sheet) data is empty with no header rows (and a mocked last primary key value IS in the google property store - 8000), set the sheet to pretend data listed for primary key 8000", function () {
      missingNoticeDates.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(
        []).should.be.eql(
        [["award-amount-transactions.NoMockedPropertyInGooglePropertyStoreItsNull", "award-amount-transactions.ColB", "award-amount-transactions._primaryKey","award-amount-transactions.computedRefreshed","award-amount-transactions.computedIsAutoSaved"],["A","B","8001","",""]]);
    }); 
    
    
    it("should when previous array (sheet) data has two rows already (and use mocked last primary key value of 7000 to simulate an additional row of data), should return an array with the original sheet data plus the mocked data for primary key 7000", function () {
      missingNoticeDates.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(
        [["award-amount-transactions.UseMockedPropertyValueSevenThousand", "award-amount-transactions.ColB", "award-amount-transactions._primaryKey"],
        ["existing sheet data row 1","A","10"],
        ["existing sheet data row 2","B","20"]])
        .should.be.eql([["award-amount-transactions.UseMockedPropertyValueSevenThousand", "award-amount-transactions.ColB", "award-amount-transactions._primaryKey","award-amount-transactions.computedRefreshed","award-amount-transactions.computedIsAutoSaved"],
        ["existing sheet data row 1","A","10","",""],
        ["existing sheet data row 2","B","20","",""],
        ["1","2","7001","",""]]);
    });    
    
    it("should when previous array (sheet) data (2 rows) have award-amount-transactions.noticeDate and award-amount-transactions._primaryKey columns (and use mocked last primary key value of 9000 to simulate an additional row of data with a null notice date), should return an array with the original sheet data plus the mocked data for primary key 9000", function () {
      missingNoticeDates.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(
        [["award-amount-transactions.UseMockedPropertyValueNineThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey",],
        ["existing sheet data row 1","A","10"],
        ["existing sheet data row 2","B","20"]])
        .should.be.eql([["award-amount-transactions.UseMockedPropertyValueNineThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey","award-amount-transactions.computedRefreshed","award-amount-transactions.computedIsAutoSaved"],
        ["existing sheet data row 1","A","10","",""],
        ["existing sheet data row 2","B","20","",""],
        ["from mocked API data row 3","","9001","",""]]);
    });  

    it("should when previous array (sheet) data (2 rows) have award-amount-transactions.noticeDate and mocked API row returned has notice date that is NOT NULL/BLANK so is excluded from results (mocked primary key 10000)", function () {
      missingNoticeDates.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(
        [["award-amount-transactions.UseMockedPropertyValueTenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],
        ["existing sheet data row 1","","10"],
        ["existing sheet data row 2","","20"]])
        .should.be.eql([["award-amount-transactions.UseMockedPropertyValueTenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey","award-amount-transactions.computedRefreshed","award-amount-transactions.computedIsAutoSaved"],
        ["existing sheet data row 1","","10","",""],
        ["existing sheet data row 2","","20","",""]]);
    }); 
    
    
    it("should when previous array (sheet) data (3 rows) have award-amount-transactions.noticeDate and mocked API row returned has notice date that is null it is not excluded from results (mocked primary key 11000)", function () {
      missingNoticeDates.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(
        [["award-amount-transactions.UseMockedPropertyValueElevenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],
        ["existing sheet data row 1","","10"],
        ["existing sheet data row 2","","20"],
        ["existing sheet data row 3","","30"]])
        .should.be.eql([["award-amount-transactions.UseMockedPropertyValueElevenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey","award-amount-transactions.computedRefreshed","award-amount-transactions.computedIsAutoSaved"],
        ["existing sheet data row 1","","10","",""],
        ["existing sheet data row 2","","20","",""],
        ["existing sheet data row 3","","30","",""],
        ["from mocked API data row 4","","11001","",""]]);
    });    
    
    it("should when previous array (sheet) data (3 rows) have award-amount-transactions.noticeDate entered in one row but not the others and mocked API row returned has notice date that is null it is not excluded from results (mocked primary key again using 11000) - should not include the row in the mocked spreadsheet existing data that had a notice date entered", function () {
      missingNoticeDates.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(
        [["award-amount-transactions.UseMockedPropertyValueElevenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey"],
        ["existing sheet data row 1","","10"],
        ["existing sheet data row 2","2026-06-26"],
        ["existing sheet data row 3","","30"]])
        .should.be.eql([["award-amount-transactions.UseMockedPropertyValueElevenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey","award-amount-transactions.computedRefreshed","award-amount-transactions.computedIsAutoSaved"],
        ["existing sheet data row 1","","10","",""],
        ["existing sheet data row 3","","30","",""],
        ["from mocked API data row 4","","11001","",""]]);
    });   
    
    it("should when previous array (sheet) data (3 rows) has extra columns, simulating manually entered data into the google sheet for example, the results will include both those extra columns for the spreadsheet data and the appropriate columns for the mocked API data (which would have the normal amount of columns) (mocked primary key 11000)", function () {
      missingNoticeDates.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates(
        [["award-amount-transactions.UseMockedPropertyValueElevenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey", "extraSpreadsheetColumn1", "extraSpreadsheetColumn2", "extraSpreadsheetColumn3"],
        ["existing sheet data row 1","","10","manually entered into sheet 1", "", ""],
        ["existing sheet data row 2","","20","manually entered into sheet 1", "manually entered into sheet 2", ""],
        ["existing sheet data row 3","","30","manually entered into sheet 1", "manually entered into sheet 2", "manually entered into sheet 3"]])
        .should.be.eql(        [["award-amount-transactions.UseMockedPropertyValueElevenThousand", "award-amount-transactions.noticeDate", "award-amount-transactions._primaryKey", "extraSpreadsheetColumn1", "extraSpreadsheetColumn2", "extraSpreadsheetColumn3","award-amount-transactions.computedRefreshed","award-amount-transactions.computedIsAutoSaved"],
        ["existing sheet data row 1","","10","manually entered into sheet 1", "", "","",""],
        ["existing sheet data row 2","","20","manually entered into sheet 1", "manually entered into sheet 2", "","",""],
        ["existing sheet data row 3","","30","manually entered into sheet 1", "manually entered into sheet 2", "manually entered into sheet 3","",""],
        ["from mocked API data row 4","","11001","","","","",""]]);
    });     
     
    
    
    // it("should when previous array (sheet) data is empty with just a header row with an 'award-amount-transactions._primaryKey' column, but no data rows (and a mocked last primary key value that points to empty data), should return an empty array", function () {
    //   missingNoticeDates.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates([["ColA", "ColB", "award-amount-transactions._primaryKey"]]).should.be.eql([]);
    // });    
    
  
    
  });
  

  
  
});








