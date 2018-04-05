/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
require("mocha");
const should = require("should");

var jsUtils = require("../src/js-utils.js");

describe("#stripTagsFromHtmlString()", function() {
      
    it("should given a paragraph statement <p>sometext</p>, return just the sometext inside the tags", function () {
     const testString = "<p>sometext</p>";
     jsUtils.stripTagsFromHtmlString(testString).should.be.eql("sometext");
    });  

});
   
