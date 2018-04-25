// /**Start of include-in-webpack.js**/
const jsUtils = require("./js-utils.js");
//add the imported modules to global, just like normal (except with this manual step - all subfunctions should be accessible)
global.jsUtils = jsUtils;

const alasqlUtils = require("./alasql-utils.js");
global.alasqlUtils = alasqlUtils;

const queriesLib = require("./queries.js");
global.queriesLib = queriesLib;
/**End of include-in-webpack.js**/
