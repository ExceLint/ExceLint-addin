//
// Requires
//
var sys = require('sys');
var fs	= require('fs');
var vm	= require('vm');

var Enumerable = require("../index").Enumerable;
var Ltxml   = require("../index").Ltxml;
var openXml = require("../index").openXml;

//
// Aliases
//
var XAttribute = Ltxml.XAttribute;
var XCData = Ltxml.XCData;
var XComment = Ltxml.XComment;
var XContainer = Ltxml.XContainer;
var XDeclaration = Ltxml.XDeclaration;
var XDocument = Ltxml.XDocument;
var XElement = Ltxml.XElement;
var XName = Ltxml.XName;
var XNamespace = Ltxml.XNamespace;
var XNode = Ltxml.XNode;
var XObject = Ltxml.XObject;
var XProcessingInstruction = Ltxml.XProcessingInstruction;
var XText = Ltxml.XText;
var XEntity = Ltxml.XEntity;
var cast = Ltxml.cast;
var castInt = Ltxml.castInt;

var S = openXml.S;
var R = openXml.R;

//
// Main
//
var beginTime = (new Date()).getTime();
var doc = new openXml.OpenXmlPackage(fs.readFileSync('sample.xlsx'));
var workbookPart = doc.workbookPart();
var wbXDoc = workbookPart.getXDocument();

var sharedStringTablePart = workbookPart.sharedStringTablePart();
var sst = sharedStringTablePart.getXDocument().root;
var strings = sst.elements(S.si).select(function(si) { 
    return si.descendants(S.t).aggregate("", function(text, t) { return text += t.value.replace(/\n/g, "\\n"); });
}).toArray();

wbXDoc.root.element(S.sheets).elements(S.sheet).forEach(function(sheet) {
    console.log(sheet.attribute("name").value);

    var id = sheet.attribute(R.id).value;
    var worksheetPart = workbookPart.getPartById(id);
    var wsXDoc = worksheetPart.getXDocument();
    wsXDoc.descendants(S.row).forEach(function(row) {
        row.descendants(S.c).forEach(function(cell) {
            console.log("r: "+(cell.attribute("r") != null ? cell.attribute("r").value  : "")
                        + ", t: "+(cell.attribute("t") != null ? cell.attribute("t").value : "")
                        + ", v=" + cell.element(S.v).value
                        + " " + (cell.attribute("t") != null && cell.attribute("t").value == "s" 
                           ? strings[cell.element(S.v).value] : ""));
        });
        console.log("-----");
    });
});

var endTime = (new Date()).getTime();
var deltaTime = endTime - beginTime;

console.log("Finished writing a document in " + (deltaTime / 1000).toString() + " seconds.");
