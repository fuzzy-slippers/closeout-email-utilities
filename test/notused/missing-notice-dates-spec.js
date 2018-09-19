/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
//not fully working...got overwhelmed with the number of sub functions and GAS cache values that would need to be mocked out and that sinon spy's would be needed to test if the spreadsheet was going to be updated with the correct data
require("mocha");
const should = require("should");
const rewire = require("rewire");

 const missingNoticeDates = rewire("../../src/time-and-money/missing-notice-dates.js");
// using rewire to mock out the responses from the callKrGetApiWithWait function called inside the missing-notice-dates module - use switch statement to return json for known primary keys and otherwise return json example when an error occurs
const latestByPrimaryKey = rewire("../../src/latest-by-primary-key.js");
missingNoticeDates.__set__("latestByPrimaryKey", {
    findMaxPrimaryKeyValueInData: function (colToFindMax, twoDimArrWHeader, relativeUriPath) {
                                                          // console.log(`inside rewiring of callKrGetApiWithWait, relativeApiUri detected as: ${relativeApiUri}`)      
      switch (twoDimArrWHeader) {
      case (twoDimArrWHeader.length === 0):
        return null;
      default:
        return '{"Error":{"errors":["not found for key -1"]}}';
      }
    },
    
    gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys: (maxPreviouslyUsedPrimaryKey, relativeUriPath) => latestByPrimaryKey.gatherAdditionalRowsBasedOnTryingApiCallsWithIncreasingPrimaryKeys(maxPreviouslyUsedPrimaryKey, relativeUriPath)
});
describe("missing-notice-dates", function() {
  
  describe("#updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates()", function() {
    it("should when the sheet is empty with no header rows (and a mocked last primary key value that points to empty data), set the sheet to empty array", function () {
      missingNoticeDates.updateArrDataAddAdditionalFlaggedEmptyTimeAndMoneyNoticeDates([]).should.be.eql([]);
    }); 
  
    
  });
  

  
  
});

