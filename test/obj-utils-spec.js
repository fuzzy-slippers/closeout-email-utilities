/*jshint curly:true, debug:true esversion:6 strict:true undef:true unused:true varstmt:true mocha:true node:true */
require("mocha");
const should = require("should");

var objUtils = require("../src/obj-utils.js");

describe("obj-utils", function() {
  
  describe("#isErrorObj()", function() {
    it("should given a js object with a few properties and no Error property return false", function () {
      const sampleObj = {};
      sampleObj.testProp1 = "A";
      sampleObj.testProp1 = 1;      
      objUtils.isErrorObj(sampleObj).should.eql(false);
    });  
  });   
  
  describe("#isErrorObj()", function() {
    it("should given a js object an Error property which is an array return true", function () {
      const sampleObj = {};
      sampleObj.Error = ["whateverArrElem"];  
      objUtils.isErrorObj(sampleObj).should.eql(true);
    });  
  });  
  
  describe("#isErrorObj()", function() {
    it("should given a js object an Error property which is a string return true", function () {
      const sampleObj = {};
      sampleObj.Error = "whateverString";  
      objUtils.isErrorObj(sampleObj).should.eql(true);
    });  
  });  

  describe("#prependAllObjKeys()", function() {
    it("should given an object with a single key {key1: 0} and the string to add 'add-to-left-side.' return back {add-to-left-side..key1: 0}", function () {
      objUtils.prependAllObjKeys({"key1": 0}, "add-to-left-side.").should.be.eql({"add-to-left-side.key1": 0});
    }); 
    
    it("should given an object with multiple properties {key1: 0, key2: 1} and the string to add 'appendThis' return back {appendThiskey1: 0, , appendThiskey2: 1}", function () {
      objUtils.prependAllObjKeys({key1: "A", key2: "B"}, "appendThis").should.be.eql({appendThiskey1: "A", appendThiskey2: "B"});
    });    
    
    it("should given an empty object return an empty object", function () {
      objUtils.prependAllObjKeys({}, "doesNotMatter").should.be.eql({});
    });  
    
    it("should given undefined return undefined", function () {
      should.equal(objUtils.prependAllObjKeys(undefined, "doesNotMatter"), undefined);
    });   

    it("should if given an error object (object with Error property) return that error object unchanged", function () {
      objUtils.prependAllObjKeys({"Error":{"errors":["some error"]}}, "doesNotMatter").should.be.eql({"Error":{"errors":["some error"]}});
    });    
    
  });
  
  describe("#prependAllArrOfObjKeys()", function() {
    it("should given a standalone object (not in an array) with a single key {'A': 0} and the string to add 'entity.' return back {'entity.A': 0}", function () {
      objUtils.prependAllArrOfObjKeys({"A": 0}, "entity.").should.be.eql({"entity.A": 0});
    }); 
    
    it("should given an array with just a single object inside with multiple object key value pairs should return back the single object in the array but with the property names prepended", function () {
      objUtils.prependAllArrOfObjKeys([{"A": 0, "B": 1}], "award-unit.").should.be.eql([{"award-unit.A": 0, "award-unit.B": 1}]);
    });   

    it("should given an array with three objects inside some with one property and some with multiple properties should append the string passed in to the left side of all property names", function () {
      objUtils.prependAllArrOfObjKeys([{"prop1": null},{prop1: "A", prop2: "B"}, {"otherProp1": 1, "otherProp2": 2}], "prepend-this.")
      .should.be.eql([{"prepend-this.prop1": null},{"prepend-this.prop1": "A", "prepend-this.prop2": "B"}, {"prepend-this.otherProp1": 1, "prepend-this.otherProp2": 2}]);
    });    
    
    it("should given an empty array return an empty array", function () {
      objUtils.prependAllArrOfObjKeys({}, "doesNotMatter").should.be.eql({});
    });  
    
    it("should given an empty object not in an array return that empty object", function () {
      objUtils.prependAllArrOfObjKeys({}, "doesNotMatter").should.be.eql({});
    });  
    
    it("should given an object with just an empty object inside return that same array with the empty object", function () {
      objUtils.prependAllArrOfObjKeys({}, "doesNotMatter").should.be.eql({});
    });      
    
    it("should given undefined return undefined", function () {
      should.equal(objUtils.prependAllArrOfObjKeys(undefined, "doesNotMatter"), undefined);
    });    
    
    it("should if given an error object (object with Error property) return that error object unchanged", function () {
      objUtils.prependAllArrOfObjKeys({"Error":{"errors":["some error"]}}, "doesNotMatter").should.be.eql({"Error":{"errors":["some error"]}});
    });     
    
  });  
  
  
});

