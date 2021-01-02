// http://msdn.microsoft.com/en-us/office/office365/howto/common-file-tasks-client-library

var fs = require('fs');
var path = require('path');

var o365 = require("../index");
var O365Auth  = o365.O365Auth;
var O365Discovery = o365.O365Discovery;
var SharePointClient = o365.Microsoft.CoreServices.SharePointClient;
var OutlookServicesClient = o365.Microsoft.OutlookServices.Client;
var Folder = o365.Microsoft.FileServices.Folder;
var File = o365.Microsoft.FileServices.File;
var CommonAuthority = "https://login.windows.net/common";
var DiscoveryResourceId = "https://api.office.com/discovery/";

O365Auth.Settings = {
    clientId: process.env.O365_CLIENT_ID,
    redirectUri: "http://localhost/"
};

var cb = function(callback) {
  return function(err, response) {
    if (err) {
      console.log("[ERROR] " + (err.responseText || ""));
      console.log(err);
    } else {
      console.log(response);
      callback(err, response);
    };
  };
};

/* // mail task
acquireToken(function(token) {
    getClient(token, "Mail", OutlookServicesClient, function(client) {
        getMyMails(client);
    });
});
*/

/* // calendar task
acquireToken(function(token) {
    getClient(token, "Calendar", OutlookServicesClient, function(client) {
        getMyEvents(client);
    });
});
*/

/* // contacts task
acquireToken(function(token) {
    getClient(token, "Contacts", OutlookServicesClient, function(client) {
        getMyContacts(client);
    });
});
*/

// sharepoint task
acquireToken(function(token) {
    getClient(token, "MyFiles", SharePointClient, function(client) {
        createFolder(client, "Test Folder", cb(function(err, result) {
         uploadOfficeFile(client, "sample.docx", cb(function(err, result) {
          searchFile(client, {title:"sample.docx"}, cb(function(err, result) {
           getFile(client, result.id, cb(function(err, result) {
             downloadFile(client, result.id, "download.docx", cb(function(err, result) {
             }));
           }));
          }));
         }));
        }));
    });
});

function acquireToken(callback) {
    console.log("[Auth] OAuth2 " + CommonAuthority);
    var ResourceId = DiscoveryResourceId;
    var authContext = new O365Auth.Context(CommonAuthority);
    authContext.getIdToken(ResourceId).then(function (token) {
        console.log("[Auth] Success");
        callback(token);
    }, function (reason) {
        console.log("[Auth] Failure");
        console.log(reason);
    });
}

function getClient(token, capability, clientClass, callback) {
    console.log("[Client] finding service client: " + capability);
    discoveryService(token, function (services) {
        var service = services.filter(function (s) {
            return s.capability == capability;
        });
        if (service.length > 0 && (service = service[0])) {
            var endpoint = service.endpointUri.replace(/(\/v1.0)?$/, "/v1.0"); // sharepoint bug
            console.log("[Client] endpointUri: " + endpoint + "\n  resourceId: " + service.resourceId);
            callback(new clientClass(endpoint, token.getAccessTokenFn(service.resourceId)));
        } else {
            console.log("[Client] Not Found!");
        }
    });
}

function discoveryService(token, callback) {
    console.log("[Discovery] get services");
    var context = new O365Discovery.Context();
    context.services(token.getAccessTokenFn(DiscoveryResourceId)).then(function (services) {
        console.log("[Discovery] Success");
        callback(services);
    }, function (reason) {
        console.log("[Discovery] Failure");
        console.log(reason);
    });
}

function downloadFile(client, fileId, filepath, callback) {
    console.log("[Files] downloadFile: " + fileId);
    client.files.getItem(fileId).asFile().content().then(function (data) {
        console.log("[Files] saving to " + filepath);
        fs.writeFile(filepath, data, callback);
    }, callback);
}

function getFile(client, fileId, callback) {
    console.log("[Files] getFile: " + fileId);
    client.files.getItem(fileId).asFile().fetch().then(function (result) {
        callback(null, result);
    }, callback);
}

function searchFile(client, query, callback) {
    console.log("[Files] searchFile: query = " + JSON.stringify(query));
    var title = query.title;
    var type = query.folder != null ? (query.folder ? "Folder" : "File") : null;
    client.files.getItems().fetch().then(function (result) {
        var file = result.currentPage.filter(function (item) {
            return item.name == title && (!type || item.type == type);
        });
        if (file.length > 0 && (file = file[0])) {
            callback(null, file);
        } else {
            callback("Not found", null);
        }
    }, callback);
}

function createFolder(client, title, callback) {
    console.log("[Files] createFolder: " + title);
    var folder = new Folder(client.context);
    folder.name = title;
    client.files.addItem(folder).then(function (item) {
        callback(null, item);
    }, callback);
}

function createFile(client, title, callback) {
    console.log("[Files] createFile: " + title);
    var file = new File(client.context);
    file.name = title;
    client.files.addItem(file).then(function (item) {
        callback(item);
    });
}

function uploadContent(client, filepath, fileId, etag, callback) {
    console.log("[Files] uploadContent: " + filepath);
    fs.readFile(filepath, function (err, data) {
        if (err) callback(err, null);
        else client.files.getItem(fileId).asFile().uploadContent(data).then(function(result) {
            console.log("[Files] uploadFile: file uploaded.");
            callback(null, result);
        }, callback);
    });
}

function uploadOfficeFile(client, filepath, fileId, etag, callback) {
    console.log("[Files] uploadFile: " + filepath);
    if (typeof(fileId) == 'function') {
        // create
        callback = fileId;
        createFile(client, path.basename(filepath), function(item) {
            console.log("[Files] uploadFile: file is created. id: " + item.id);
            uploadContent(client, filepath, item.id, item.eTag, callback);
        });
    } else {
        // upload
        uploadContent(client, filepath, fileId, etag, callback);
    }
}

function getMyEvents(client) {
    console.log("[Event] getMyEvents");
    client.me.calendar.events.getEvents().fetch()
            .then(function (events) {
                var myevents = events.currentPage;
                console.log("[Event] Success");
                console.log(myevents);
            }, function (reason) {
                console.log("[Event] Failure");
                console.log(reason);
            });
}
