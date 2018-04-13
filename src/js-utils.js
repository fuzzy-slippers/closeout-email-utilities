

module.exports = {


//NEEDS UNIT TESTS!!!!!!!
// converts a two dimentional array with a header row into an array of objects (like the original data returned from KR APIs) - source https://stackoverflow.com/questions/22917269/javascript-convert-two-dimensional-array-to-array-of-objects-using-the-first-r
convertFromTwoDimArrWithHeaderToObjArr(twoDimArr) {
  var keys = twoDimArr.shift();
  var objects = twoDimArr.map(function(values) {
      return keys.reduce(function(o, k, i) {
          o[k] = values[i];
          return o;
      }, {});
  });
  return objects;
},



/**
 * function to take a Kuali API format integer date (millisecond from unix epoch as opposed to Unix seconds from epoch) and convert to a string format like "2/4/2018" - similar if not identical to JS "short date" format
 *
 * @param {number} a data in the Kuali API millisecond from unix epoch format - also used by js Date object constructors - for example 1512104400000
 * @return {string} the date in the string format MM/DD/YYYY, for example "12/1/2017" 
 */
  convertMsDateTimeToMMDDYYYYString(msSinceEpoch) {
    const jsDateObj = new Date(msSinceEpoch);
    return (jsDateObj.getMonth() + 1) + "/" + jsDateObj.getDate() + "/" + jsDateObj.getFullYear(); // i.e. 2/4/2018
  },
  
/**
 * helper function to strip html tags (not perfect for all HTML as many have pointed out online, but good enough for our simple html email templates eRA staff configure like we are using it for) - from https://stackoverflow.com/questions/5002111/javascript-how-to-strip-html-tags-from-string 
 *
 * @param {string} the html or pseudo html as one long string, that contains html style tags <p></p> or </br>
 * @return {string} the same html string is returned in plain text format (all tags removed so that it can be used for the plain text version of an email)
 */  
stripTagsFromHtmlString(htmlString) { return htmlString.replace(/<\/?[^>]+(>|$)/g, "") },
  
  
  //provides non-mutating (functional programming) way to replace an array element with a new item - returns a new array with the change, leaving the old array unchanged
  returnNewArrWithElemAtIndexReplaced(origArr, indexArrElemToReplace, replaceArrElemWithThis) {
    return origArr.map(function(currRow, currIndex) {
        if (currIndex === indexArrElemToReplace)
          return replaceArrElemWithThis;
        else
          return currRow;
      });
  },
  
  
  
  /**
   * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
   * @param obj1
   * @param obj2
   * @returns obj3 a new object based on obj1 and obj2
   * modified, based on: https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
   */
  mergeObjProperties(obj1,obj2){
      var obj3 = {};
      for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
      for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
      return obj3;
  },
  
  // similar to the above function, but just need to add all attributes but with empty values so that all rows have the same columns, even ones that have not been updated yet
  // for example if obj1 = { lastupdated: 'bar', unit: 42 }; obj2 = { lastupdated: 'baz', name: 13 }; will return {unit=42.0, name=, lastupdated=baz}
  mergeObjPropertiesAsBlank(objectWithValidData,exampleObjWithExtraPropsToAddAsBlank, blankValToUse){
      var mergedObj = {};
      for (var attrname in objectWithValidData) { mergedObj[attrname] = objectWithValidData[attrname]; }
      for (var attrname in exampleObjWithExtraPropsToAddAsBlank) { 
        //if the object to return doesnt already had this new attribute/column yet, add it in but with a blank value
        if (!mergedObj[attrname])
          mergedObj[attrname] =  blankValToUse;
        //otherwise if the merged object already has that attribute, leave it alone as we want to return an object with the data in the objectWithValidData passed into the function 
      }
      return mergedObj;
  },
  
  
  //used when adding data to a google sheet to make sure every row is the same length by adding in blank values to fill in gaps (used in the BoundSheetFunctions.gs script attached to the spreadsheet)
  addInEmptyValuesForTwoDimArrayRowsNotTheCorrectLenDueToErrors(twoDimArr, fillNewCellsWith) {
              //NO LONGER making the assumption that if we look at the first and last rows and use the longest of the two, its fairly accurate - hopefully both wont have errors
              //const maxRowLen = Math.max(twoDimArr[0].length, twoDimArr[twoDimArr.length - 1].length);
    //find the row with the maximum length
    //do this by mapping the outer array to an array of row lengths
    const arrOfRowLengths = twoDimArr.map(function (currRow) {
      return currRow.length;
    });
    // then finding the max of those row lengths 
    const maxRowLen = Math.max.apply(null, arrOfRowLengths);  
    const numRows = twoDimArr.length; 
    
    //map over every row in the array
    const arrWithSameLenRows = twoDimArr.map(function (currRow) { 
      //if we come across a row that is shorter than the rest (such as the first or last row)
      if (currRow.length < maxRowLen) {
        //push elements into the array, based on the number of missing elements in this row
        const numElementsToAddThisRow = maxRowLen - currRow.length;
        for (i=0; i < numElementsToAddThisRow; i++) 
        {
          currRow.push(fillNewCellsWith);
        }
      }
      return currRow;
    });
    return arrWithSameLenRows;  
  }

};


