/**Start of test-using-alasql.js**/
const alasql = require("alasql/dist/alasql.js");
global.alasql = alasql;

module.exports = {
    
localDupConvertFromTwoDimArrWithHeaderToObjArr(twoDimArr) {
  var keys = twoDimArr.shift();
  var objects = twoDimArr.map(function(values) {
      return keys.reduce(function(o, k, i) {
          o[k] = values[i];
          return o;
      }, {});
  });
  return objects;
},    
    
    //DELETE LATER
    testAlasqlWorking()
    {
        alasql("CREATE TABLE cities (city string, population number)");
        alasql("INSERT INTO cities VALUES ('Rome',2863223),('Paris',2249975),('Berlin',3517424),('Madrid',3041579)");
        var res = alasql("SELECT * FROM cities WHERE population < 3500000 ORDER BY population DESC");
        return res;
    },
    
    testAlasqlWorking2(twoDimArrPassedIn)
    {
        var objArrDataPassedIn = this.localDupConvertFromTwoDimArrWithHeaderToObjArr(twoDimArrPassedIn);
        alasql("CREATE TABLE testtabledata (Col1 string, Col2 string, Col3 string, Col4 string, Col5 string, Col6 string, Col7 string, Col8 string, Col9 string)");
        alasql.tables.testtabledata.data = objArrDataPassedIn; 
        var res = alasql("SELECT * FROM testtabledata WHERE Col1 > 10");
        return res;
    }
    
    

}