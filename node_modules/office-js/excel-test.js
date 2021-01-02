
var office = require("./index");
var editor = new office.Excel();

console.log("open from file: " + process.argv[2]);
editor.open(process.argv[2]);

console.log("show all text.");
editor.forEachSheet(function(sheet) {
    editor.forEachRow(sheet, function(row) {
        editor.forEachCell(row, function(cell) {
            console.log("r: " + editor.rowOfCell(cell)
                        + ", t: " + editor.typeOfCell(cell)
                        + ", v=" + editor.valueOfCell(cell)
                        + " " + editor.textOfCell(cell));
        });
        console.log("-----");
    });
});

//console.log("replace text: " + "Hello world!" + " to " + "Hi Everyone!");
//editor.replaceText("Hello world!", "Hi Everyone!");

console.log("save to file: out_" + process.argv[2]);
editor.save("out_" + process.argv[2]);
