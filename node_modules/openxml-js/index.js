// Open XML SDK
// Microsoft Public License (Ms-PL)

var vm = require('vm');
var fs = require('fs');
var path = require('path');

var SDK = "OpenXmlSdkJs-01-01-02";

function createContext(obj) {
    for (var key in this) if (this.hasOwnProperty(key)) obj[key] = this[key];
    return vm.createContext(obj);
}

var context = createContext({
  Enumerable: require('linq'),
  JSZip: require('jszip')
});
['ltxml.js', 'ltxml-extensions.js', 'openxml.js']
.forEach(function(name) {
  vm.runInContext(fs.readFileSync(path.join(path.dirname(module.filename), SDK, name), 'utf8'), context, name);
});

var DOMParser = require('xmldom').DOMParser;
context.Ltxml.DOMParser = DOMParser;

module.exports = context;

