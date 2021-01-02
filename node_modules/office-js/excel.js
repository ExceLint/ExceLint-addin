var sys = require('sys');
var fs	= require('fs');
var vm	= require('vm');

var Enumerable = require("openxml-js").Enumerable;
var Ltxml   = require("openxml-js").Ltxml;
var openXml = require("openxml-js").openXml;

var S = openXml.S;
var R = openXml.R;

function Editor() {
}

Editor.prototype.open = function(docFilePath) {
    this.doc = new openXml.OpenXmlPackage(fs.readFileSync(docFilePath));
    var workbookPart = this.doc.workbookPart();
    this.wbXDoc = workbookPart.getXDocument();
    return this;
};

Editor.prototype.rowOfCell = function(cell) {
    return cell.attribute("r") ? cell.attribute("r").value : "";
};
Editor.prototype.typeOfCell = function(cell) {
    return cell.attribute("t") ? cell.attribute("t").value : "";
};
Editor.prototype.valueOfCell = function(cell) {
    return cell.element(S.v).value;
};
Editor.prototype.textOfCell = function(cell) {
    if (this.typeOfCell(cell) !== 's') return "";
    if (! this.strings) {
        var sharedStringTablePart = this.doc.workbookPart().sharedStringTablePart();
        var sst = sharedStringTablePart.getXDocument().root;
        this.strings = sst.elements(S.si).select(function(si) { 
            return si.descendants(S.t).aggregate("", function(text, t) { return text += t.value.replace(/\n/g, "\\n"); });
        }).toArray();
    }
    return this.strings[this.valueOfCell(cell)];
};

Editor.prototype.forEachSheet = function(cb) {
    this.wbXDoc.root.element(S.sheets).elements(S.sheet).forEach(cb);
};

Editor.prototype.forEachRow = function(sheet, cb) {
    var id = sheet.attribute(R.id).value;
    var wsXDoc = this.doc.workbookPart().getPartById(id).getXDocument();
    wsXDoc.descendants(S.row).forEach(cb);
};

Editor.prototype.forEachCell = function(row, cb) {
    row.descendants(S.c).forEach(cb);
};

Editor.prototype.save = function(docFilePath) {
    fs.writeFileSync(docFilePath, this.doc.saveToBuffer());
    return this;
};

module.exports = Editor;
