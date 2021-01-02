
var props = {
    'onedrive':  './onedrive',
    'gdrive':    './googledrive',
    'gcalendar': './googlecalendar',
    'Word':      './word',
    'Excel':     './excel'
};

var index = {};
for (var name in props) {
    Object.defineProperty(index, name, {
        get: (function(path) { // delay
            return function() { return require(path); };
        })(props[name])
    });
}
module.exports = index;
