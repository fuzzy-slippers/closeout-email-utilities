/**Start of test-using-alasql.js**/
const alasql = require("alasql/dist/alasql.js");
global.alasql = alasql;

module.exports = {
    
    testAlasqlWorking()
    {
        alasql("CREATE TABLE cities (city string, population number)");
        alasql("INSERT INTO cities VALUES ('Rome',2863223),('Paris',2249975),('Berlin',3517424),('Madrid',3041579)");
        var res = alasql("SELECT * FROM cities WHERE population < 3500000 ORDER BY population DESC");
        return res;
    }

}