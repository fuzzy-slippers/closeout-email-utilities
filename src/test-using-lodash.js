/**Start of test-using-alasql.js**/
const lodash = require("lodash");
global.lodash = lodash;

function testAlasqlWorking()
{
    return lodash.random(10, 40);
}