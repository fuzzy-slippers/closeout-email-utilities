/**Start of array-utils.js**/

module.exports = {
    
    /**
     * takes an two dimentional array with column headers in the first array element/row and converts to a one dimentional array of objects with the property names coming from that header row
     * for example [['col1', 'col2'], [1,2], ['A', 'B']] will return a 1d array [{col1: 1, col2: 2}, {col1: 'A', col2: 'B'}]"
     *
     * @return {object} returns a one dimentional array of objects with the property names coming from the passed in array header
     */
    convertFromTwoDimArrWithHeaderToObjArr: (twoDimArr) => {
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
     *  Computes the union of the passed-in arrays: the list of unique items, in order, that are present in one or more of the arrays. - inspired by (but then had to modify as my version of node was complaining about not having a new keyword in front of Set) https://gist.github.com/bendc/9b05735dfa6966859025
     * 
     */
    unionArrs: (...arrays) => {
      const valuesFromAllArrays = [].concat(...arrays);
      const setVersionValuesFromAllArrays = new Set(valuesFromAllArrays);
      const uniqueValuesInArrayForm = [...setVersionValuesFromAllArrays];
      return uniqueValuesInArrayForm;
    },
    
    /**
     * converts a 1d array of objects and turns them into a 2 dimentional array with a header row (based on the property names of the objects)
     *
     * @return {object} returns a two dimentional array with the first row 0 index array element just being the property names as the "column" headers
     */
    convertOneDimObjArrToTwoDimArrWithHeaderRow: (objArr) => {
      //make sure an array and it has at least one element/object inside
      if (Array.isArray(objArr) && objArr.length) {    
        //generate the header - if there are different numbers of properties in different objects in the array, consolidate them into a comprehensive header (preserving the order)
        //first generate individual arrays for each row/object with the keys/column headers for each rows object
        const twoDArrHeadersKeys = objArr.map(currObj => Object.keys(currObj));
        //now that we have arrays with all of the headers from each of the rows, consolidate them into a master single header row that includes (in order) a consolidated list of all column headers for all rows/objects in the list/objArray
        const oneDArrComprehensiveHeaderRow = module.exports.unionArrs(...twoDArrHeadersKeys);
        //generate the data rows - two dim array of object values (at this point without the header which will be added at the end)
        //used below to make sure all rows are the same length - we create an empty array filled with null values the same length as the header row above
        const arrWithAllNullsSameLengthAsHeaderRow = Array(oneDArrComprehensiveHeaderRow.length).fill(null); 
        //map over each object in the original object array and transform it from an object into an array of its values (fill with nulls to make each row a uniform length)                            
        const twoDArrDataRows = objArr.map(currObj => {
          //convert object propery values to an array of values
          const currRowArrValues = Object.values(currObj);
          //ensure each row is the same length as the full header row/array - if not pad with null values on the right side to make them all the same length
          return [].concat(...currRowArrValues, ...arrWithAllNullsSameLengthAsHeaderRow).slice(0, oneDArrComprehensiveHeaderRow.length);
        });  
        //return the header (inner array) as the 0th (first row) in the 2d array and the rest of the data arrays as the following elements in the array
        return [].concat([oneDArrComprehensiveHeaderRow], twoDArrDataRows);
      } 
      // if the array length is 0 or undefined, return back an empty array
      else
        return [];
    }    
    

}