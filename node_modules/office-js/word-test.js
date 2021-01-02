
var office = require("./index");
var editor = new office.Word();

console.log("open from file: " + process.argv[2]);
editor.open(process.argv[2]);

console.log("show all text.");
editor.forEachText(function(t) {
    console.log(t.value);
});

console.log("replace text: " + "Hello world!" + " to " + "Hi Everyone!");
editor.replaceText("Hello world!", "Hi Everyone!");

console.log("save to file: out_" + process.argv[2]);
editor.save("out_" + process.argv[2]);
