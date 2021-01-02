
var google = require('googleapis');
var auth = require('./googleauth');

module.exports = {
    getClient: auth(google.calendar, 'v3', ['https://www.googleapis.com/auth/calendar'], Wrapper)
};

function Wrapper(client) {
  this.client = client;
};

Wrapper.prototype.quickAdd = function(id, text, cb) {
    this.client.events.quickAdd({
        calendarId: id,
        text: text
    }, cb);
};

Wrapper.prototype.getItems = function(id, query, min, max, cb) {
    this.client.events.list({
        calendarId: id,
        q: query,
        timeMin: min,
        timeMax: max
    }, cb);
};
