// /**Start of include-in-webpack.js**/

// core.js polyfills first - only loading specific ones, see:
const core = require('core-js/library');
global.core = core;
// const Set = require("core-js/fn/set");
// global.Set = Set;
// require('core-js/fn/array/');

//add the imported modules to global, just like normal (except with this manual step - all subfunctions should be accessible)

// const jsUtils = require("./js-utils.js");
// global.jsUtils = jsUtils;

const arrayUtils = require("./array-utils.js");
global.arrayUtils = arrayUtils;

const alasqlUtils = require("./alasql-utils.js");
global.alasqlUtils = alasqlUtils;

const queriesLib = require("./queries.js");
global.queriesLib = queriesLib;

const apiUtils = require("./api-utils.js");
global.apiUtils = apiUtils;


const missingNoticeDates = require("./time-and-money/missing-notice-dates.js");
global.missingNoticeDates = missingNoticeDates;

const googleAppsScriptWrappers = require("./google-apps-script-wrappers/google-apps-script-wrappers.js");
global.googleAppsScriptWrappers = googleAppsScriptWrappers;

/**End of include-in-webpack.js**/
