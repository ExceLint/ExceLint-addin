
var onedrive = require('./onedrive');

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

onedrive.getClient("xxxxxx-application-id", function(client) {
  client.createFolder("Test Folder", cb(function(err, result) {
    client.uploadOfficeFile("sample.docx", cb(function(err, result) {
      client.searchFile({title:"sample.docx"}, cb(function(err, result) {
         client.getFile(result.id, cb(function(err, result) {
           client.downloadFile(result.id, "download.docx", cb(function(err, result) {
           }));
         }));
      }));
    }));
  }));

  // client.searchFile({title:"あんけ.xlsx"}, cb);
  // client.getFile("01N4PX2S64BBH3ZWKCHBHKG7JTU6UR7OYN", cb);
  // client.createFolder("Test Folder2", cb);
  // client.uploadOfficeFile("sample.docx", cb);
  // client.uploadOfficeFile("sample2.docx", "01N4PX2S2IIM5GCHG73NHLKV2UXAIPW35U", "", cb);
  // client.downloadFile("01N4PX2S2IIM5GCHG73NHLKV2UXAIPW35U", "download3.docx", cb);
  // client.getFileByName("日報/日報テンプレ.docx", cb(function(err, result) {}));
});

