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

var W = openXml.W;
var NN = openXml.NoNamespace;
var wNs = openXml.wNs;

//
// Arguments
//
if (process.argv.length < 3) {
    console.log("node word.js <doc_file_path>");
    process.exit(1);
}
var docFilePath = process.argv[2];

//
// Main
//
var doc = new openXml.OpenXmlPackage(fs.readFileSync(docFilePath));
var mainPart = doc.mainDocumentPart();
var mainPartXDoc = mainPart.getXDocument();

mainPartXDoc.descendants(W.t).forEach(function(t) {
    var text = t.value;
    console.log(text);
    console.log("===");
});

var newP = function(i) {
    var paraText = "Hello Open XML World.  This is paragraph #" + i + ".";
    var p = new XElement(W.p,
			 new XElement(W.r,
				      new XElement(W.t, paraText)));
    return p;
}

var newBodyElement = new XElement(W.body, Enumerable.range(0, 20).select(newP));
mainPartXDoc.root.element(W.body).addAfterSelf(newBodyElement);

fs.writeFileSync("out_"+docFilePath, doc.saveToBuffer());
