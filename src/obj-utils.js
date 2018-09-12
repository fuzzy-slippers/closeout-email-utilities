/** utility/helper functions for manipulating js objects
 * @module obj-utils
 */
 
const log = require("../src/log-utils.js");

module.exports = {
    
    /**
     * checks if the passed in object is the result of an API call that threw an error (we are expecting all API calls that return an error to have an Error property on th object to indicate an error of some sort was thrown)
     * 
     * @param {object} a javascript object representing either 1) the data result of an API call..converted from JSON to a js object or 2) an API call error returned, and converted from JSON about the error to a js object with an Error property
     * @return {boolean} the result of trying to detect if either true: the js object represents a failed API call/error or false: it's valid data in the js object
     */
    hasErrorProperty: (jsObj) => {
        //if the object passed in is undefined, return false that it is not an Error object
        if (!jsObj) {
            return false;
        }    
        //if it's a valid object, check that it has an Error property
        else {
            return jsObj.hasOwnProperty("Error");
        }        
    },    
    
    /**
     * prepends a string to every key/property name of a js object on the left hand side of the key/property name
     * loosely based on general advice in https://stackoverflow.com/questions/43839400/change-object-key-using-object-keys-es6
     * @example
     * // returns {"award-contact.name": 0, "award-contact.mobile":"444-444-4444"}
     * objUtils.prependAllObjKeys({"name": 0, "mobile":"444-444-4444"}, "award-contact.");
     * 
     * @param {object} a single standalone js Object (not an array of objects!)
     * @return {object} the original object with the property/key names all updated to prepend the string preface on the left hand side of each key/property name
     */
    prependAllObjKeys: (jsObj, stringToPrependToKeys) => 
    {
        log.trace(`obj-utils prependAllObjKeys: (${JSON.stringify(jsObj)}, ${stringToPrependToKeys}) called...`);           
        // if passed in object is undefined, null, or an error object just return it back without any processing
        log.trace("about to test jsObj");
        // log.trace(`next running hasErrorProperty on : ${JSON.stringify(jsObj)}`);
        log.trace(`module.exports.hasErrorProperty(jsObj) returns: ${module.exports.hasErrorProperty(jsObj)}`)
        if (!jsObj || module.exports.hasErrorProperty(jsObj)) {
            log.trace(`testing !jsObj: ${!jsObj}`);            
            log.trace("TRUE...so returning jsObj")
            return jsObj;
        }    
        //otherwise attempt to add strings to all object properties    
        else {
            log.trace("about to loop through all the key names and for each create an object with the new key name with new part concatenated on the left side and the same value as before");
            //loop through all the key names and for each create an object with the new key name with new part concatenated on the left side and the same value as before
            const objsWithPrependedKeyNames = Object.keys(jsObj).map((key) => {
                log.trace(`for this key: ${key}`);
                log.trace(`return out of map for this current key ${JSON.stringify(key)}`);
                log.trace(`trying to assign [${stringToPrependToKeys + key}] : ${jsObj[key]}`);                
                return { [stringToPrependToKeys + key] : jsObj[key] };
            });
            log.trace(`objsWithPrependedKeyNames is: ${JSON.stringify(objsWithPrependedKeyNames)}`);
            //the above returns an array of objects, each with one key/value pair - the below squishes them all back into one single object
            log.trace("squishes them all into one single object")
            const singleObjWithPrependedKeyNames = module.exports.mergeObjArrIntoSingleObj(objsWithPrependedKeyNames);
            log.trace(`singleObjWithPrependedKeyNames: ${singleObjWithPrependedKeyNames}`)
            return singleObjWithPrependedKeyNames;            
        }
    },
    
    /**
     * prepends a string to every key/property name to the left hand side of the key/property name of every property/key in every object inside an array of objects or the single object passed in
     * @example
     * // returns [{"award-contact.name": 0, "award-contact.mobile":"444-444-4444"}{"award-contact.name": 1}]
     * objUtils.prependAllArrOfObjKeys([{"name": 0, "mobile":"444-444-4444"}, {"name":1}], "award-contact.");
     * 
     * @param {object} an array of js objects or a standalone js object
     * @return {object} the original object or array of objects with the property/key names for all objects and all properties updated to prepend the string preface on the left hand side of each key/property name
     */    
    prependAllArrOfObjKeys: (objArr, stringToPrependToAllKeys) => {
        log.trace(`obj-utils prependAllArrOfObjKeys: (${JSON.stringify(objArr)}, ${stringToPrependToAllKeys}) called...`);        
        // if a single object is passed in rather than an array of objects just run prependAllObjKeys on the single object
        if (!Array.isArray(objArr))
            return module.exports.prependAllObjKeys(objArr, stringToPrependToAllKeys);
        // if it is an array of objects, run prependAllObjKeys on each object in the array and return the transformed array
        else
            return objArr.map(currObj => module.exports.prependAllObjKeys(currObj, stringToPrependToAllKeys));
    },
    

    /**
     * creates a single object out of an array full of objects by squishing all their properties/values into that one single object returned - if some properties are listed on one or more of the objects in the array, use the value from last (rightmost) object in the array that has that property
     * @example
     * // returns {"name": "Fred", "email":"foo@gmail.com"}
     * objUtils.mergeObjArrIntoSingleObj([{"name": "Zach", "email":"foo@gmail.com"},{"name": "Fred"}]);
     * 
     * @param {object} an array of js objects 
     * @return {object} a single js object that will have all the properties combined from the objects in the array of js objects passed in
     */    
    mergeObjArrIntoSingleObj: (objArr) => {
        log.trace(`obj-utils mergeObjArrIntoSingleObj: (${JSON.stringify(objArr)}) called...`);  
        //if passed in undefined or null etc, return the object unchanged
        if (!objArr)
            return objArr;
        //if passed an empty array, return an empty object    
        else if (objArr.length === 0)    
            return {};
        //if passed an array, attempt to squish it into a single object    
        else
            return objArr.reduce(module.exports.objectAssignSingleObjEs3Friendly )
            //return Object.assign({}, ...objArr);
    },    
    
    objectAssignSingleObjEs3Friendly: (targetObj, sourceObj) => {
    log.trace(`obj-utils objectAssignSingleObjEs3Friendly (usually called multiple times by reduce) called on: (${JSON.stringify(targetObj), JSON.stringify(sourceObj)}) called...`);     
      if (targetObj == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(targetObj);
      console.log(`to: ${JSON.stringify(to)}`);       

        if (sourceObj != null) { // Skip over if undefined or null
          for (var nextKey in sourceObj) {
            to[nextKey] = sourceObj[nextKey];
          }
        }
      return to;
    }

};