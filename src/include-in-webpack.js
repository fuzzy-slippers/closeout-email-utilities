// /**Start of include-in-webpack.js**/

// core.js polyfills first - only loading specific ones, see:
const core = require('core-js/library');
global.core = core;
// const Set = require("core-js/fn/set");
// global.Set = Set;
// require('core-js/fn/array/');

const jsUtils = require("./js-utils.js");
//add the imported modules to global, just like normal (except with this manual step - all subfunctions should be accessible)
global.jsUtils = jsUtils;

const alasqlUtils = require("./alasql-utils.js");
global.alasqlUtils = alasqlUtils;

const queriesLib = require("./queries.js");
global.queriesLib = queriesLib;
/**End of include-in-webpack.js**/
