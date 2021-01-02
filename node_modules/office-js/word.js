var fs	= require('fs');

var Enumerable = require("openxml-js").Enumerable;
var Ltxml   = require("openxml-js").Ltxml;
var openXml = require("openxml-js").openXml;

var XElement = Ltxml.XElement;
var W = openXml.W;

function Editor() {
}

Editor.prototype.open = function(docFilePath) {
    this.doc = new openXml.OpenXmlPackage(fs.readFileSync(docFilePath));
    this.mainPart = this.doc.mainDocumentPart();
    this.mainPartXDoc = this.mainPart.getXDocument();
    return this;
};

Editor.prototype.forEachParagraph = function(cb) {
    this.mainPartXDoc.descendants(W.p).forEach(cb);
    return this;
};

Editor.prototype.forEachRun = function(cb) {
    this.mainPartXDoc.descendants(W.r).forEach(cb);
    return this;
};

Editor.prototype.forEachText = function(cb) {
    this.mainPartXDoc.descendants(W.t).forEach(cb);
    return this;
};

Editor.prototype.addParagraph = function(paraText, parent) {
    var p = new XElement(W.p, new XElement(W.r, new XElement(W.t, paraText)));
    if (!parent) parent = this.mainPartXDoc.root.element(W.body);
    parent.addAfterSelf(p);
    return this;
};

Editor.prototype.replaceText = function(oldText, newText) {
    var self = this;
    this.forEachText(function(t) {
        var newValue = t.value.replace(oldText, newText);

        var lines = newValue.split("\n");
        if (lines.length > 1) {
            t.value = "";
            var p = t.ancestors(W.p).first(), templ = p.toString();
            t.value = lines[0];
            for (var i = 1, len = lines.length; i < len; i++) {
                var newP = XElement.parse(templ);
                newP.descendants(W.t).first().value = lines[i];
                p.addAfterSelf(newP);
                p = newP;
            }
        } else {
            t.value = newValue;
        }
    });
    return self;
};

Editor.prototype.save = function(docFilePath) {
    fs.writeFileSync(docFilePath, this.doc.saveToBuffer());
    return this;
};

module.exports = Editor;
