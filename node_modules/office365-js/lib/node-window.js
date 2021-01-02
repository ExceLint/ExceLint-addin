//
// enumerate browser window
//

var window = {
    atob: function (str) {
        return new Buffer(str, 'base64').toString('binary');
    },
    localStorage: {
        _path: "./.storage",
        _items: null,
        getItems: function() {
            var items = this._items;
            if (!items) {
                try { items = JSON.parse(require('fs').readFileSync(this._path)); } catch (x) {}
                this._items = items || (items = {});
            }
            return items;
        },
        getItem: function (key) {
            return this.getItems()[key];
        },
        setItem: function (key, value) {
            this.getItems()[key] = value;
            require('fs').writeFile(this._path, JSON.stringify(this.getItems()));
        }
    },
    open: function (url) {
        console.log(url);
        return {
            addEventListener: function (name, callback) {
                require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                }).question("redirect url? ", function(url) {
                    callback({ url:url });
                });
            },
            close: function() {}
        };
    }
};

module.exports = window;
