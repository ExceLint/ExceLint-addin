
var gdrive = require('./googledrive');

var cb = function(callback) {
  return function(err, response) {
    if (err) {
      console.log("[ERROR] " + (err.responseText || ""));
      console.log(err);
    } else {
      console.log("[Success]");
      console.log(response);
      callback(err, response);
    }
  };
};

var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var REDIRECT_URL = process.env.REDIRECT_URL;

var info = {
    clientId: "xxxxxx-client-id",
    clientSecret: "xxxxxx-client-secret",
    redirectUrl: "urn:ietf:wg:oauth:2.0:oob"
};

gdrive.getClient(info, function(client) {
  client.createFolder("Test Folder", cb(function(err, result) {
    client.uploadOfficeFile("sample.docx", cb(function(err, result) {
      client.searchFile({title:"sample"}, cb(function(err, result) {
         client.getFile(result.id, cb(function(err, result) {
           client.downloadFile(result, "download.docx", cb(function(err, result) {
           }));
         }));
      }));
    }));
  }));
/*
    client.downloadFile("https://docs.google.com/feeds/download/documents/export/Export?id=1gGTTkVopMenWsoIIySFUbdVxdQV4O2fNPSrAupL91NM&exportFormat=docx", "download.docx", cb);
    client.getFile("1gGTTkVopMenWsoIIySFUbdVxdQV4O2fNPSrAupL91NM", cb);
    client.searchFile({title:"sample2"}, cb);  
    client.createFolder("test", cb);
    client.uploadOfficeFile("sample.docx", cb);
    client.uploadOfficeFile("sample.xlsx", cb);

    client.uploadOfficeFile("sample2.docx", 
                            '1gGTTkVopMenWsoIIySFUbdVxdQV4O2fNPSrAupL91NM',
                            '"FOqBqQg9G61-Vqm3H4L68x7OCKU/MTQxNjQ2MzI3ODMxOA"',
                            cb);
*/
});

