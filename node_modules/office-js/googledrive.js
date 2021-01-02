
var fs = require('fs');
var path = require('path');
var google = require('googleapis');
var auth = require('./googleauth');

module.exports = {
    getClient: auth(google.drive, 'v2', ['https://www.googleapis.com/auth/drive'], Wrapper)
};

function Wrapper(client) {
  this.client = client;
};

Wrapper.prototype.downloadFile = function(file, filepath, callback) {
  console.log("[Files] downloadFile: " + (typeof file === 'string' ? file : file.id));
  var self = this;
  function download(err, file) {
      if (err) {
          callback(err);
          return;
      }
      var url = null;
      for (var key in file.exportLinks) {
          if (key.indexOf('openxml') >= 0) {
              url = file.exportLinks[key];
              break;
          }
      }
      if (! url) {
          callback("Not Found: exportLinks = " + JSON.stringify(file.exportLinks));
          return;
      }

      console.log("[Files] downloading: " + url);
      self.client._options.auth.request({ method: 'GET', url: url })
              .pipe(fs.createWriteStream(filepath))
              .on('error',  callback)
              .on('finish', function() {
                  console.log("[Files] saving to " + filepath);
                  callback();
              });
  }
  if (typeof file === 'string') {
    this.getFile(file, donwload);
  } else {
    download(null, file);
  }
}

Wrapper.prototype.getFile = function(fileId, callback) {
  console.log("[Files] getFile: " + fileId);
  this.client.files.get({
    fileId: fileId
  }, callback);
}

Wrapper.prototype.getFolder = function(fileId, callback) {
  console.log("[Files] getFolder: " + fileId);
  this.client.files.get({
    fileId: fileId
  }, callback);
}

Wrapper.prototype.getFiles = function(folderId, callback) {
  console.log("[Files] getFiles in folder: " + folderId);
  if (typeof folderId !== 'string') {
    callback = folderId;
    folderId = 'root';
  }
  this.client.files.children.list({
    folderId: folderId
  }, callback);
}

Wrapper.prototype.getFileByName = function(title, folderId, callback) {
  console.log("[Files] getFileByName: " + title);
  var q = ['trashed=false', "title = '"+title+"'"];
  if (typeof folderId === 'string') {
    q.push("'"+folderId+"' in parents");
  } else {
    callback = folderId;
  }
  this.client.files.list({
    q: q.join(" and "),
    maxResults: 1
  }, function(err, result) {
    if (err) {
        callback(err);
    } else if (result.items && result.items.length > 0) {
        callback(null, result.items[0]);
    } else {
        callback("Not found");
    }
  });
}

Wrapper.prototype.searchFile = function(query, callback) {
  console.log("[Files] searchFile: query = " + JSON.stringify(query));
  var q = ['trashed=false'];
  if (query.title) {
    q.push("title contains '" + query.title +"'");
  }
  if (query.folder !== undefined) {
    q.push("mimeType "+ (query.folder ? "=" : "!=") +" 'application/vnd.google-apps.folder'");
  }
  if (query.folderId) {
    q.push("'" + query.folderId + "' in parents");
  }

  this.client.files.list({
    q: q.join(" and "),
    maxResults: 1
  }, function(err, result) {
    if (err) {
        callback(err);
    } else if (result.items && result.items.length > 0) {
        callback(null, result.items[0]);
    } else {
        callback("Not found");
    }
  });
}

Wrapper.prototype.createFolder = function(title, callback) {
  console.log("[Files] createFolder: " + title);
  this.client.files.insert({
    resource: {
      title: title,
      mimeType: "application/vnd.google-apps.folder"
    }
  }, callback);
}

Wrapper.prototype.createFile = function(title, folderId, callback) {
    console.log("[Files] createFile: " + title);
    var randomId = title + new Date().getTime();
    var file = {
      id: randomId,
      title: title
    };
    if (typeof folderId === 'string') {
      file.folderId = folderId;
    } else {
      callback = folderId;
    }
    if (! this._newfiles) this._newfiles = {};
    this._newfiles[randomId] = file;
    callback(null, file);
}

Wrapper.prototype.uploadContent = function(filepath, fileId, etag, callback) {
  console.log("[Files] uploadContent: " + filepath);
  var ext = path.extname(filepath);
  var mimeType = {
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }[ext];
  if (! mimeType) throw "invalid file type.";

  var resource = {
    title: path.basename(filepath, ext),
    mimeType: mimeType
  };

  var file = this._newfiles ? this._newfiles[fileId] : null;
  if (file) {
    resource.title = file.title;
    if (file.folderId) {
      resource.parents = [{ id:file.folderId, kind:"drive#parentReference" }];
    }
    delete this._newfiles[file.id];
    fileId = callback;
  }

  var params = {
    convert: true,
    resource: resource,
    media: {
      mimeType: mimeType,
      body: fs.createReadStream(filepath)
    }
  };

  var method;
  if (typeof(fileId) == 'function') {
    method = this.client.files.insert;
    callback = fileId;
  } else {
    method = this.client.files.update;
    params.fileId = fileId;
    params.options = {
      headers: {
        // "If-Match": etag
      }
    };
  }
  method(params, callback);
}

Wrapper.prototype.uploadOfficeFile = Wrapper.prototype.uploadContent;
