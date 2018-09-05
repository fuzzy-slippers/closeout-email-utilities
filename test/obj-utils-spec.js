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

    it("should given an array of objects (example based on award-types) return back an array with each object having the property names prepended/prefaced with the endpoint name", function () {
      objUtils.prependAllArrOfObjKeys(
        [
        {"code":1,"description":"Grant","_primaryKey":"1"},
        {"code":3,"description":"Contract","_primaryKey":"3"},
        {"code":4,"description":"Indefinite Delivery Contract","_primaryKey":"4"},
        {"code":5,"description":"Cooperative Agreement","_primaryKey":"5"},
        {"code":8,"description":"Consortium Membership","_primaryKey":"8"},
        {"code":9,"description":"Other Transaction Agreement","_primaryKey":"9"},
        {"code":13,"description":"Non Disclosure Agreement","_primaryKey":"13"},
        {"code":14,"description":"Material Transfer Agreement","_primaryKey":"14"},
        {"code":15,"description":"Teaming Agreement","_primaryKey":"15"},
        {"code":16,"description":"Equipment Loan","_primaryKey":"16"},
        {"code":17,"description":"Memorandum of Understanding","_primaryKey":"17"},
        {"code":18,"description":"Intergovernmental Personnel Assignment","_primaryKey":"18"},
        {"code":19,"description":"CHOOSE AN AWARD TYPE - was blank in RAA - DO NOT USE","_primaryKey":"19"},
        {"code":20,"description":"Data Use Agreement","_primaryKey":"20"},
        {"code":21,"description":"Software License","_primaryKey":"21"}
        ],
        "award-types.")
      .should.be.eql(
        [
        {"award-types.code":1,"award-types.description":"Grant","award-types._primaryKey":"1"},
        {"award-types.code":3,"award-types.description":"Contract","award-types._primaryKey":"3"},
        {"award-types.code":4,"award-types.description":"Indefinite Delivery Contract","award-types._primaryKey":"4"},
        {"award-types.code":5,"award-types.description":"Cooperative Agreement","award-types._primaryKey":"5"},
        {"award-types.code":8,"award-types.description":"Consortium Membership","award-types._primaryKey":"8"},
        {"award-types.code":9,"award-types.description":"Other Transaction Agreement","award-types._primaryKey":"9"},
        {"award-types.code":13,"award-types.description":"Non Disclosure Agreement","award-types._primaryKey":"13"},
        {"award-types.code":14,"award-types.description":"Material Transfer Agreement","award-types._primaryKey":"14"},
        {"award-types.code":15,"award-types.description":"Teaming Agreement","award-types._primaryKey":"15"},
        {"award-types.code":16,"award-types.description":"Equipment Loan","award-types._primaryKey":"16"},
        {"award-types.code":17,"award-types.description":"Memorandum of Understanding","award-types._primaryKey":"17"},
        {"award-types.code":18,"award-types.description":"Intergovernmental Personnel Assignment","award-types._primaryKey":"18"},
        {"award-types.code":19,"award-types.description":"CHOOSE AN AWARD TYPE - was blank in RAA - DO NOT USE","award-types._primaryKey":"19"},
        {"award-types.code":20,"award-types.description":"Data Use Agreement","award-types._primaryKey":"20"},
        {"award-types.code":21,"award-types.description":"Software License","award-types._primaryKey":"21"}
        ]);
    });     
    
    //
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

