/** utility/helper functions for manipulating js objects
 * @module obj-utils
 */

module.exports = {
    
    /**
     * checks if the passed in object is the result of an API call that threw an error (we are expecting all API calls that return an error to have an Error property on th object to indicate an error of some sort was thrown)
     * 
     * @param {object} a javascript object representing either 1) the data result of an API call..converted from JSON to a js object or 2) an API call error returned, and converted from JSON about the error to a js object with an Error property
     * @return {boolean} the result of trying to detect if either true: the js object represents a failed API call/error or false: it's valid data in the js object
     */
    isErrorObj: (jsObj) => jsObj.hasOwnProperty("Error"),    
    
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
        // if passed in object is undefined, null, or an error object just return it back without any processing
        if (!jsObj || module.exports.isErrorObj(jsObj))
            return jsObj;
        //otherwise attempt to add strings to all object properties    
        else {
            //loop through all the key names and for each create an object with the new key name with new part concatenated on the left side and the same value as before
            const objsWithPrependedKeyNames = Object.keys(jsObj).map((key) => {
              return { [stringToPrependToKeys + key] : jsObj[key] };
            });
            //the above returns an array of objects, each with one key/value pair - the below squishes them all back into one single object
            const singleObjWithPrependedKeyNames = Object.assign({}, ...objsWithPrependedKeyNames);
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
        // if a single object is passed in rather than an array of objects just run prependAllObjKeys on the single object
        if (!Array.isArray(objArr))
            return module.exports.prependAllObjKeys(objArr, stringToPrependToAllKeys);
        // if it is an array of objects, run prependAllObjKeys on each object in the array and return the transformed array
        else
            return objArr.map(currObj => module.exports.prependAllObjKeys(currObj, stringToPrependToAllKeys));
    }
    

};