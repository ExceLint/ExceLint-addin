/// Microsoft.Office365.ClientLib.JS
/// MICROSOFT SOFTWARE LICENSE TERMS
/// MICROSOFT .NET LIBRARY

var vm = require('vm');
var fs = require('fs');
var path = require('path');

var SDK = "Microsoft.Office365.ClientLib.JS.1.0.22/content/services/office365/scripts";

function createContext(obj) {
    for (var key in this) if (this.hasOwnProperty(key)) obj[key] = this[key];
    return vm.createContext(obj);
}

var context = createContext({
  window: require('./lib/node-window'),
  XMLHttpRequest: require("xmlhttprequest").XMLHttpRequest
});
['utility.js', 'o365auth.js', 'o365discovery.js', 'exchange.js', 'sharepoint.js']
.forEach(function(name) {
  vm.runInContext(fs.readFileSync(path.join(path.dirname(module.filename), SDK, name), 'utf8'), context, name);
});

module.exports = context;

