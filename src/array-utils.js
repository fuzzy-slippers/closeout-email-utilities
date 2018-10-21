/**Start of array-utils.js**/

//using core-js polyfills to allow us to use new ES6+ language features (at least some of them seem to work in GAS with the polyfills) - reference info: https://www.npmjs.com/package/core-js
const core_Set = require('core-js/library/fn/set');
const core_Array_from = require('core-js/library/fn/array/from');
const core_Object_values = require("core-js/fn/object/values")
const core_Array_fill = require('core-js/library/fn/array/virtual/fill');
const log = require("../src/log-utils.js");

module.exports = {
    
    /**
     * takes an two dimentional array with column headers in the first array element/row and converts to a one dimentional array of objects with the property names coming from that header row
     * for example [['col1', 'col2'], [1,2], ['A', 'B']] will return a 1d array [{col1: 1, col2: 2}, {col1: 'A', col2: 'B'}]"
     *
     * @return {object} returns a one dimentional array of objects with the property names coming from the passed in array header
     */
    convertFromTwoDimArrWithHeaderToObjArr: (twoDimArr) => {
      log.trace(`array-utils convertFromTwoDimArrWithHeaderToObjArr(${JSON.stringify(twoDimArr)}) called...`);        
      const copyOfTwoDimArrNoHeaderRow = twoDimArr.slice(1);
      const headerRow = twoDimArr[0];
      const oneDimArrObjs = copyOfTwoDimArrNoHeaderRow.map(function(colName) {
          return headerRow.reduce(function(o, k, i) {
              o[k] = colName[i];
              return o;
          }, {});
      });
      return oneDimArrObjs;
    },
    
    /**
     *  Computes the union of the passed-in arrays: the list of unique items, in order, that are present in one or more of the arrays. - inspired by (but then had to modify as my version of node was complaining about not having a new keyword in front of Set) https://gist.github.com/bendc/9b05735dfa6966859025
     * 
     */
    unionArrs: (...arrays) => {
      log.trace(`array-utils unionArrs(${arrays}) called...`);          
      const valuesFromAllArrays = [].concat(...arrays);
      const setVersionValuesFromAllArrays = new core_Set(valuesFromAllArrays);
      const uniqueValuesInArrayForm = core_Array_from(setVersionValuesFromAllArrays);
      return uniqueValuesInArrayForm;
    },
    
    /**
     *  Fills an entire array (all array elements) with the value passed in - returns as a new array, does not mutate the original - basically had to create this because Array.fill was not working with the core-js polyfill, so spinning my own
     *  in order to support arrays created with the Array constructor (like "new Array(5)", which fills arrays with "holes" (see http://2ality.com/2012/07/apply-tricks.html) we are utilizing the ES5 friendly Array.apply as a first step on the array (https://stackoverflow.com/questions/37487602/using-array-map-with-new-array-constructor)
     * @param {object[]} an array of any length that should have every element overwritten
     * @param {object} the string, number, null, etc to fill every character of the array with
     */
                                                                    //    duplicateArrayReplaceAllElementsWith: (arr, replaceArrElementsWith) => arr.map(currArrElem => replaceArrElementsWith)
    duplicateArrayReplaceAllElementsWith: (arr, replaceArrElementsWith) => Array.apply(null, arr).map(currArrElem => replaceArrElementsWith)
    ,  
    
    /**
     * converts a 1d array of objects and turns them into a 2 dimentional array with a header row (based on the property names of the objects)
     *
     * @return {object} returns a two dimentional array with the first row 0 index array element just being the property names as the "column" headers
     */
    convertOneDimObjArrToTwoDimArrWithHeaderRow: (objArr) => {
      log.trace(`array-utils convertOneDimObjArrToTwoDimArrWithHeaderRow(${JSON.stringify(objArr)}) called...`);       
      //make sure an array and it has at least one element/object inside
      if (Array.isArray(objArr) && objArr.length) {    
        //generate the header - if there are different numbers of properties in different objects in the array, consolidate them into a comprehensive header (preserving the order)
        //first generate individual arrays for each row/object with the keys/column headers for each rows object
        const twoDArrHeadersKeys = objArr.map(currObj => Object.keys(currObj));
        //now that we have arrays with all of the headers from each of the rows, consolidate them into a master single header row that includes (in order) a consolidated list of all column headers for all rows/objects in the list/objArray
        const oneDArrComprehensiveHeaderRow = module.exports.unionArrs(...twoDArrHeadersKeys);
        // ARE THE BELOW TWO STATEMENTS/LINES USED AT ALL??????????????????
        //generate the data rows - two dim array of object values (at this point without the header which will be added at the end)
        //used below to make sure all rows are the same length
        //we create an empty array the same length as the header row above
        const uninitializedArrWithLengthBasedOnCombinedHeaderRow = Array(oneDArrComprehensiveHeaderRow.length);
        //transform the array (same length) to an identical array filled with all null values (avoiding the ES6 Array.fill method as having trouble getting it to transpile in Google Apps Script)
        const arrWithAllNullsSameLengthAsHeaderRow = module.exports.duplicateArrayReplaceAllElementsWith(uninitializedArrWithLengthBasedOnCombinedHeaderRow, null);
                                                                              // console.log(`uninitializedArrWithLengthBasedOnCombinedHeaderRow: ${JSON.stringify(uninitializedArrWithLengthBasedOnCombinedHeaderRow)}`);
                                                                              // console.log(`arrWithAllNullsSameLengthAsHeaderRow: ${JSON.stringify(arrWithAllNullsSameLengthAsHeaderRow)}`);
                                                                              //const arrWithAllNullsSameLengthAsHeaderRow = uninitializedArrWithLengthBasedOnCombinedHeaderRow.fill(null);        
        //map over each object in the original object array and transform it from an object into an array of its values (fill with nulls to make each row a uniform length)                            
        const twoDArrDataRows = objArr.map(currObj => {
           //convert object propery values to an array of values
          const currRowArrValues = core_Object_values(currObj);
                                                                              //console.log(`[].concat(...currRowArrValues, ...arrWithAllNullsSameLengthAsHeaderRow) is: ${JSON.stringify([].concat(...currRowArrValues, ...arrWithAllNullsSameLengthAsHeaderRow))}`);
                                                                              //console.log(`[].concat(...currRowArrValues, ...arrWithAllNullsSameLengthAsHeaderRow).slice(0, oneDArrComprehensiveHeaderRow.length) is: ${JSON.stringify([].concat(...currRowArrValues, ...arrWithAllNullsSameLengthAsHeaderRow).slice(0, oneDArrComprehensiveHeaderRow.length))}`);          //ensure each row is the same length as the full header row/array - if not pad with null values on the right side to make them all the same length
                                                                              //        console.log(`>>>>>>>>[].concat(...currRowArrValues, ...arrWithAllNullsSameLengthAsHeaderRow).slice(0, oneDArrComprehensiveHeaderRow.length): ${JSON.stringify([].concat(...currRowArrValues, ...arrWithAllNullsSameLengthAsHeaderRow).slice(0, oneDArrComprehensiveHeaderRow.length))}`);
          return [].concat(...currRowArrValues, ...arrWithAllNullsSameLengthAsHeaderRow).slice(0, oneDArrComprehensiveHeaderRow.length);
        });  
                                                                              // console.log(`oneDArrComprehensiveHeaderRow: ${JSON.stringify(oneDArrComprehensiveHeaderRow)}`);
                                                                              // console.log(`[oneDArrComprehensiveHeaderRow]: ${JSON.stringify([oneDArrComprehensiveHeaderRow])}`);
                                                                              // console.log(`twoDArrDataRows: ${JSON.stringify(twoDArrDataRows)}`);                  
                                                                              // console.log(`[].concat([oneDArrComprehensiveHeaderRow], twoDArrDataRows): ${JSON.stringify([].concat([oneDArrComprehensiveHeaderRow], twoDArrDataRows))}`);         
        //return the header (inner array) as the 0th (first row) in the 2d array and the rest of the data arrays as the following elements in the array
        return [].concat([oneDArrComprehensiveHeaderRow], twoDArrDataRows);
      } 
      // if the array length is 0 or undefined, return back an empty array
      else
        return [];
    },
    
    /**
     * if passed an array returns the last element or undefined if not an array with elements - just for code readability/convenience
     * 
     * @param {object[]} an array to search for the last element of
     * @return {obj} the value of the last element in the array (if a 1d array, just the element not an array)
     */     
     //the queries.findMaxPrimaryKeyInAllDataRows returns an array with a single column of max_prim_key and single data row with the max primary key value - returning just the number in the 2nd row (array row position 1), first column (0th array column position) which is the max primary key as this function returns just the numeric primary key value
     lastArrElement: (arr) => {
        log.trace(`array-utils lastArrElement(${JSON.stringify(arr)}) called...`);        
        //make sure array passed in is 1) not undefined 2) is an array and 3) has at least one element - otherwise return undefined
        if (arr && Array.isArray(arr) && arr.length > 0)
          return arr.slice(-1)[0];
        else 
          return undefined;
     },
     
     
    /**
     * goes through all elements in a two dimentional array and replace all occurances of a certain value specified with the replacement value specified
     * 
     * @param {object[][]} a two dimentional array to search through
     * @param {object} the object/value of the array element(s) to search for (to be replaced)
     * @param {object} the object/value to replace those array elements with
     * @return {object[][]} the two dimentional array passed in with the elements specified replaced
     */     
     replaceAllOccurancesInTwoDimArr: (twoDimArr, replaceThis, withThis) => {
        log.trace(`array-utils replaceAllOccurancesInTwoDimArr(${JSON.stringify(twoDimArr)}, ${replaceThis}, ${withThis}) called...`);       
        return twoDimArr.map( function(row) {
            return row.map( function( cell ) { 
                if (Object.is(cell, replaceThis))
                  return withThis;
                else
                  return cell;
            } );
        } );
     },
     
    /**
     * trims whitespace (any blank spaces, newlines, etc on the left or right hand side of the string text only) for all cells in a 2d array - hopefully helpful in catching random blank strings entered in sheet cells
     * 
     * @param {object[][]} a two dimentional array to go through and trim all cell values
     * @return {object[][]} the two dimentional array passed in with a js trim done on all elements/cell values
     */     
     trimAllCellsInTwoDimArr: (twoDimArr) => {
        log.trace(`array-utils trimAllCellsInTwoDimArr(${JSON.stringify(twoDimArr)}) called...`);
        //if it's not a 2d array, just return the array unchanged (based on https://stackoverflow.com/questions/31104879/how-to-check-if-array-is-multidimensional-jquery)
        if (!twoDimArr[0] || twoDimArr[0].constructor !== Array)
          return twoDimArr;
        else {
          return twoDimArr.map( function(row) {
              return row.map( function( cell ) { 
                  //since numbers, booleans, etc dont have a trim function (and its unnecessary) only try to trim string values, anything other than a string return unchanged
                  if (typeof cell === 'string')
                    return cell.trim();
                  else
                    return cell;
              } );
          } );
        }  
     },     


    /**
     * goes through every cell in a 2d array (including the header row) and converts each cell to a JS string - null/undefined values become empty strings, js objects are turned into json
     * 
     * @param {object[][]} a two dimentional array to go through and convert each cell to strings
     * @return {object[][]} the two dimentional array passed in with each cell converted to a js string
     */     
     convertTwoDimArrToAllStrings: (twoDimArr) => {
        log.trace(`array-utils convertToStringAllCellsInTwoDimArr(${JSON.stringify(twoDimArr)}) called...`);
        //if it's not a 2d array, just return the array unchanged (based on https://stackoverflow.com/questions/31104879/how-to-check-if-array-is-multidimensional-jquery)
        if (!twoDimArr[0] || twoDimArr[0].constructor !== Array)
          return twoDimArr;
        else {
          return twoDimArr.map( function(row) {
              return row.map( function( cell ) { 
                  //if already a string, return that cell value unchanged
                  if (typeof cell === 'string')
                    return cell;
                  //check not null/undefined (cant use truthy check as 0's and false values will be converted to empty strings which we dont want)
                  else if (cell !== null && cell !== undefined)
                    return JSON.stringify(cell);
                  //if is null/undefined convert to empty string (stringify default is "null"/undefined which we don't want  
                  else
                    return ""
              } );
          } );
        }  
     }, 
    

}