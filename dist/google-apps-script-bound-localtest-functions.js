function testBoundSheetLibraryFunctions() {
  Logger.log("data in this test sheet");
  Logger.log(BoundSheetUtils.readDataInSheetByNameWithHeader("testdata"));
  Logger.log("loading that data into alasql - then doing a where clause on only rows where the first column is more than 12 (*updated*): ");
//  Logger.log(alasqlUtils.testAlasqlWorking2(BoundSheetUtils.readDataInSheetByNameWithHeader("testdata")));
  Logger.log(queriesLib.testSelect(BoundSheetUtils.readDataInSheetByNameWithHeader("testdata")));
}


//works, just commenting for now so that the dropdown in google apps will default to the above test
// function testGoogleAppsScriptLibAccessability()
// {
//     Logger.log("testing libraries and their accessibility locally in google apps script - need this kind of thing for google apps script to pick up the function - the ones in webpack it does not pick up in the dropdown");
//     Logger.log("convertMsDateTimeToMMDDYYYYString function working ok?: ");
//     Logger.log(jsUtils.convertMsDateTimeToMMDDYYYYString(1512104400000));
//     Logger.log("what about stripTagsFromHtmlString('hi there, hopefully the br tab here <br> is removed')? : ");
//     Logger.log(jsUtils.stripTagsFromHtmlString('hi there, hopefully the br tab here <br> is removed'));
//     // Logger.log("alasqlUtils.testAlasqlWorking() returned: ");
//     // Logger.log(alasqlUtils.testAlasqlWorking());
    
// }