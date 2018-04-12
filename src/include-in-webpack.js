// /**Start of include-in-webpack.js**/
const jsUtils = require("./js-utils.js");
//add the imported modules to global, just like normal (except with this manual step - all subfunctions should be accessible)
global.jsUtils = jsUtils;


//  const testUsingLodash = require("./test-using-lodash.js");
//  global.testUsingLodash = testUsingLodash;
/**End of include-in-webpack.js**/

const alasqlUtils = require("./alasql-utils.js");
global.alasqlUtils = alasqlUtils;
/**End of include-in-webpack.js**/
