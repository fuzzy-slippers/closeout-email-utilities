// /**Start of include-in-webpack.js**/
const jsUtils = require("./js-utils.js");
//add the imported modules to global, just like normal (except with this manual step - all subfunctions should be accessible)
global.jsUtils = jsUtils;

//const testUsingAlasql = require("./test-using-alasql.js");
//global.testUsingAlasql = testUsingAlasql;
/**End of include-in-webpack.js**/
