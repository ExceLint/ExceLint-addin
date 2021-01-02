// http://msdn.microsoft.com/en-us/office/office365/howto/common-file-tasks-client-library

var fs = require('fs');
var path = require('path');

var o365 = require("office365-js");
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

/*
var cb = function(err, response) {
    console.log(err);
    if (err && err.responseText) console.log(err.responseText);
    console.log(response);
};
*/

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
module.exports = {
  _client: null,
  getClient: function(clientId, callback) {
    if (typeof clientId == "string") {
      O365Auth.Settings.clientId = clientId;
    } else {
      callback = clientId;
    }
    var self = this;
    if (self._client)
      callback(self._client);
    else 
      acquireToken(function(token) {
        getClient(token, "MyFiles", SharePointClient, function(client) {
          callback(self._client = new Wrapper(client));
        });
     });
  }
};

function Wrapper(client) {
  this.client = client;
};

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

Wrapper.prototype.downloadFile = function(fileId, filepath, callback) {
    console.log("[Files] downloadFile: " + fileId);
    this.client.files.getItem(fileId).asFile().content().then(function (data) {
        console.log("[Files] saving to " + filepath);
        fs.writeFile(filepath, data, callback);
    }, callback);
}

Wrapper.prototype.getFile = function(fileId, callback) {
    console.log("[Files] getFile: " + fileId);
    this.client.files.getItem(fileId).asFile().fetch().then(function (result) {
        callback(null, result);
    }, callback);
}

Wrapper.prototype.getFolder = function(folderId, callback) {
    console.log("[Files] getFolder: " + folderId);
    this.client.files.getItem(folderId).asFolder().fetch().then(function (result) {
        callback(null, result);
    }, callback);
}

Wrapper.prototype.getFiles = function(folderId, callback) {
    console.log("[Files] getFiles in folder: " + folderId);
    var parent;
    if (typeof folderId === 'string') {
        parent = this.client.files.getItem(folderId).asFolder().children;
    } else {
        parent = this.client.files;
        callback = folderId;
    }
    parent.getItems().fetch().then(function (result) {
        callback(null, result.currentPage);
    }, callback);
}

Wrapper.prototype.getFileByName = function(title, folderId, callback) {
    console.log("[Files] getFileByName: " + title);
    var parent;
    if (typeof folderId === 'string') {
        parent = this.client.files.getItem(folderId).asFolder().children;
    } else {
        parent = this.client.files;
        callback = folderId;
    }
    parent.getByPath('/' + title).then(function (result) {
        callback(null, result);
    }, callback);
}

Wrapper.prototype.searchFile = function(query, callback) {
    console.log("[Files] searchFile: query = " + JSON.stringify(query));
    var titleQuery = query.title;
    var type = query.folder != null ? (query.folder ? "Folder" : "File") : null;
    this.getFiles(query.parentId, function (err, result) {
        if (err != null) {
            callback(err);
            return;
        }
        var file = result.filter(function (item) {
            return item.name.search(titleQuery) !== -1 && (!type || item.type == type);
        });
        if (file.length > 0 && (file = file[0])) {
            callback(null, file);
        } else {
            callback("Not found", null);
        }
    });
}

Wrapper.prototype.createFolder = function(title, callback) {
    console.log("[Files] createFolder: " + title);
    var folder = new Folder(this.client.context);
    folder.name = title;
    this.client.files.addItem(folder).then(function (item) {
        callback(null, item);
    }, callback);
}

Wrapper.prototype.createFile = function(title, folderId, callback) {
    console.log("[Files] createFile: " + title);
    var file = new File(this.client.context);
    file.name = title;
    if (typeof folderId == 'function') { callback = folderId; folderId = null; }
    var parent = folderId ? this.client.files.getItem(folderId).asFolder().children : this.client.files;
    parent.addItem(file).then(function (item) {
        callback(null, item);
    });
}

Wrapper.prototype.uploadContent = function(filepath, fileId, etag, callback) {
    console.log("[Files] uploadContent: " + filepath);
    var self = this, client = this.client;
    fs.readFile(filepath, function (err, data) {
        if (err) callback(err, null);
        else {
            client.files.getItem(fileId).asFile().uploadContent(data).then(function() {
                console.log("[Files] uploadFile: file uploaded.");
                self.getFile(fileId, callback);
            }, callback);
        }
    });
}

Wrapper.prototype.uploadOfficeFile = function(filepath, fileId, etag, callback) {
    console.log("[Files] uploadFile: " + filepath);
    var wrapper = this;
    if (typeof(fileId) == 'function') {
        // create
        callback = fileId;
        wrapper.createFile(path.basename(filepath), function(err, item) {
            console.log("[Files] uploadFile: file is created. id: " + item.id);
            wrapper.uploadContent(filepath, item.id, item.eTag, callback);
        });
    } else {
        // upload
        wrapper.uploadContent(filepath, fileId, etag, callback);
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
