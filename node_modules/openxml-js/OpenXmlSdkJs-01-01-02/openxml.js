/***************************************************************************

Copyright (c) Microsoft Corporation 2013.

This code is licensed using the Microsoft Public License (Ms-PL).  You can find the text of the license here:

http://www.microsoft.com/resources/sharedsource/licensingbasics/publiclicense.mspx

Published at http://OpenXmlDeveloper.org
Resource Center and Documentation: http://openxmldeveloper.org/wiki/w/wiki/open-xml-sdk-for-javascript.aspx

Developer: Eric White
Blog: http://www.ericwhite.com
Twitter: @EricWhiteDev
Email: eric@ericwhite.com

Version: 1.01.01
    Fixed a problem where serialization of UTF8 was not correct if the XDocument for the
    part was not loaded.

Version: 1.01
    Added support for loading and saving blobs.
    In distribution, replaced jszip.js, jszip-load.js, jszip-inflate.js, jszip-deflate.js
    Added support for asynchronous loading and saving of blobs, flatOpc, and base64

Version: 1.00
    Initial release.

***************************************************************************/

/*
OpenXmlPackage(document)
- document can be either base64 DOCX or FlatOPC in string form
- fields:
  - parts: hash of OpenXmlPart objects, by uri
  - ctXDoc: XDocument of content type file

- addPart(uri, contentType, partType, data)
- addRelationship(rId, relationshipType, target, targetMode) - if targetMode is not set, then it is internal
- deletePart(part)
- deleteRelationship(rId)
- getContentType(uri)
- getPartById(rId) - gets part that is target of the package
- getPartByRelationshipType(relationshipType)
- getPartByUri(uri) - gets any part in the package
- getParts() - returns all parts in the package
- getPartsByContentType(contentType)
- getPartsByRelationshipType(relationshipType)
- getRelationshipById(rId) - gets one of the 2 or 3 relationships from the package
- getRelationships() - gets the relationships from the package
- getRelationshipsByContentType(contentType) - gets the relationships from the package
- getRelationshipsByRelationshipType(relationshipType)
- saveToBase64() - returns base64
- saveToFlatOpc() - returns flatOpc

OpenXmlPart(pkg, uri, contentType, partType, data)
- fields:
  - pkg
  - uri
  - contentType
  - partType   // "binary", "base64", "xml"
  - data

- addRelationship(rId, relationshipType, target, targetMode) - if targetMode is not set, then it is internal
- deleteRelationship(rId)
- getPartById(rId)
- getPartByRelationshipType(relationshipType)
- getParts() - returns all related parts of the source part
- getPartsByContentType(contentType)
- getPartsByRelationshipType(relationshipType)
- getRelationshipById(rId) - gets the relationship from the part
- getRelationships() - gets the relationships from the package
- getRelationshipsByContentType(contentType) - gets the relationships from the part
- getRelationshipsByRelationshipType(relationshipType) - gets the relationships from the part
- getXDocument()

OpenXmlRelationship
- fields:
  - fromPkg - if from a part, this will be null
  - fromPart - if from the package, this will be null.
  - relationshipId
  - relationshipType
  - target
  - targetMode
  - targetFullName
*/

(function (root) {
    "use strict";

    function defineOpenXml(Enumerable, Ltxml, XEnumerable) {

        var openXml = {};

        var XAttribute = Ltxml.XAttribute;
        var XCData = Ltxml.XCData;
        var XComment = Ltxml.XComment;
        var XContainer = Ltxml.XContainer;
        var XDeclaration = Ltxml.XDeclaration;
        var XDocument = Ltxml.XDocument;
        var XElement = Ltxml.XElement;
        var XEntity = Ltxml.XEntity;
        var XName = Ltxml.XName;
        var XNamespace = Ltxml.XNamespace;
        var XNode = Ltxml.XNode;
        var XObject = Ltxml.XObject;
        var XProcessingInstruction = Ltxml.XProcessingInstruction;
        var XText = Ltxml.XText;
        var cast = Ltxml.cast;
        var castInt = Ltxml.castInt;

        /******************************** OpenXmlPackage ********************************/

        function openFromZip(zip, pkg) {
            for (var f in zip.files) {
                var zipFile = zip.files[f];
                if (!openXml.util.endsWith(f, "/")) {
                    var partType = null;

                    var f2 = f;
                    if (f !== "[Content_Types].xml")
                        f2 = "/" + f;
                    var newPart = new openXml.OpenXmlPart(pkg, f2, null, null, zipFile.asBinary());
                    pkg.parts[f2] = newPart;

                }
            }
            var ctf = pkg.parts["[Content_Types].xml"];
            if (ctf === null) {
                throw "Invalid Open XML document: no [Content_Types].xml";
            }
            pkg.ctXDoc = XDocument.parse(ctf.data);

            for (var part in pkg.parts) {
                if (part === "[Content_Types].xml")
                    continue;
                if (part.indexOf("[trash]") != -1)
                    continue; // handle trash items https://openxmlsdkjs.codeplex.com/workitem/1
                var ct = pkg.getContentType(part);
                if (ct === null)
                    throw "Invalid Open XML document: content type of "+part+" is undefined";
                var thisPart = pkg.parts[part];
                thisPart.contentType = ct;
                if (openXml.util.endsWith(ct, "xml")) {
                    thisPart.partType = "xml";
                }
                if (!openXml.util.endsWith(ct, "xml")) {
                    thisPart.partType = "binary";
                }
            }
        }

        function openFromBase64Internal(pkg, base64data) {
            var zip = new JSZip(base64data, {
                base64: true,
                checkCRC32: false
            });
            openFromZip(zip, pkg)
        }
        
        function openFromBase64InternalAsync(pkg, base64data, cb) {
            var zip = null;
            var state = 1;
            var intervalId = setInterval(function () {
                if (state === 1) {
                    zip = new JSZip(base64data, {
                        base64: true,
                        checkCRC32: false
                    });
                    state = 2;
                    return;
                }
                if (state === 2) {
                    openFromZip(zip, pkg, cb)
                    clearInterval(intervalId);
                    cb(pkg);
                    return;
                }
            }, 10);
        }

        function openFromBlobInternal(pkg, blob) {
            var zip = new JSZip(blob);
            openFromZip(zip, pkg)
        }

        function openFromBlobInternalAsync(pkg, blob, cb) {
            var zip = null;
            var state = 1;
            var intervalId = setInterval(function () {
                if (state === 1) {
                    zip = new JSZip(blob);
                    state = 2;
                    return;
                }
                if (state === 2) {
                    openFromZip(zip, pkg)
                    clearInterval(intervalId);
                    cb(pkg);
                    return;
                }
            }, 10);
        }

        function openFlatOpcFromXDoc(pkg, doc) {
            var root = doc.getRoot();
            pkg.ctXDoc = new XDocument(
                new XDeclaration("1.0", "utf-8", "yes"),
                new XElement(CT.Types,
                    new XAttribute("xmlns", ctNs.namespaceName),
                    new XElement(CT.Default,
                        new XAttribute("Extension", "rels"),
                        new XAttribute("ContentType", openXml.contentTypes.relationships)),
                    new XElement(CT.Default,
                        new XAttribute("Extension", "xml"),
                        new XAttribute("ContentType", "application/xml"))));
            root.elements(FLATOPC.part).forEach(function (p) {
                var uri = p.attribute(FLATOPC.name).value;
                var contentType = p.attribute(FLATOPC.contentType).value;
                var partType = "xml";
                if (!openXml.util.endsWith(contentType, "xml"))
                    partType = "base64";
                if (partType === "xml") {
                    var newPart = new openXml.OpenXmlPart(pkg, uri, contentType, partType,
                        new XDocument(p.element(FLATOPC.xmlData).elements().firstOrDefault()));
                    pkg.parts[uri] = newPart;
                    if (contentType !== 'application/vnd.openxmlformats-package.relationships+xml') {
                        pkg.ctXDoc.getRoot().add(
                            new XElement(CT.Override,
                                new XAttribute("PartName", uri),
                                new XAttribute("ContentType", contentType)));
                    }
                }
                if (partType === "base64") {
                    var newPart = new openXml.OpenXmlPart(pkg, uri, contentType, partType, p.element(FLATOPC.binaryData).value);
                    pkg.parts[uri] = newPart;
                    pkg.ctXDoc.getRoot().add(
                        new XElement(CT.Override,
                            new XAttribute("PartName", uri),
                            new XAttribute("ContentType", contentType)));
                }
            })
            var newPart = new openXml.OpenXmlPart(pkg, "[Content_Types].xml", null, "xml", pkg.ctXDoc);
            pkg.parts["[Content_Types].xml"] = newPart;
        }

        function openFromFlatOpcInternal(pkg, flatOpc) {
            var xDoc = XDocument.parse(flatOpc);
            openFlatOpcFromXDoc(pkg, xDoc);
        }
        
        function openFromFlatOpcInternalAsync(pkg, flatOpc, cb) {
            var doc = null;
            var state = 1;
            var intervalId = setInterval(function () {
                if (state === 1) {
                    doc = XDocument.parse(flatOpc);
                    state = 2;
                    return;
                }
                if (state === 2) {
                    openFlatOpcFromXDoc(pkg, doc);
                    clearInterval(intervalId);
                    cb(pkg);
                    return;
                }
            }, 10);
        }

        openXml.OpenXmlPackage = function (documentToOpen) {
            this.parts = {};
            this.ctXDoc = null;
            if (documentToOpen !== undefined) {
                if (openXml.util.isBase64(documentToOpen)) {
                    openFromBase64Internal(this, documentToOpen);
                }
                else if (typeof documentToOpen === 'string') {
                    openFromFlatOpcInternal(this, documentToOpen);
                }
                else {
                    openFromBlobInternal(this, documentToOpen);
                }
            }
        }

        openXml.OpenXmlPackage.prototype.openFromBase64 = function (base64data) {
            openFromBase64Internal(this, base64data);
        }
        
        openXml.OpenXmlPackage.prototype.openFromBase64Async = function (base64data, cb) {
            openFromBase64InternalAsync(this, base64data, cb);
        }

        openXml.OpenXmlPackage.prototype.openFromFlatOpc = function (flatOpc) {
            openFromFlatOpcInternal(this, flatOpc);
        }

        openXml.OpenXmlPackage.prototype.openFromFlatOpcAsync = function (flatOpc, cb) {
            openFromFlatOpcInternalAsync(this, flatOpc, cb);
        }

        openXml.OpenXmlPackage.prototype.openFromBlob = function (blob) {
            openFromBlobInternal(this, blob);
        }

        openXml.OpenXmlPackage.prototype.openFromBlobAsync = function (blob, cb) {
            openFromBlobInternalAsync(this, blob, cb);
        }

        openXml.OpenXmlPackage.prototype.openFromBuffer = function (blob) {
            openFromBlobInternal(this, blob);
        }

        openXml.OpenXmlPackage.prototype.openFromBufferAsync = function (blob, cb) {
            openFromBlobInternalAsync(this, blob, cb);
        }

        function saveToZip(that) {
            var zip = new JSZip();
            for (var part in that.parts) {
                var ct;
                var thisPart = that.parts[part];
                // test for null because if the part was deleted, it will be set to null, not undefined
                if (thisPart !== null) {
                    if (part === "[Content_Types].xml") {
                        zip.file("[Content_Types].xml", that.ctXDoc.toString(false));
                    }
                    else if (part.indexOf("[trash]") != -1) {
                        // ignore trash items
                    }
                    else {
                        var cte = that.ctXDoc.getRoot().elements(CT.Override).firstOrDefault(function (e) {
                            return e.attribute("PartName").value === part;
                        });
                        if (cte === null) {
                            var extension = part
                                .substring(part.lastIndexOf('.') + 1)
                                .toLowerCase();
                            var dct = that.ctXDoc.getRoot().elements(CT.Default).firstOrDefault(function (e) {
                                return e.attribute("Extension").value.toLowerCase() === extension;
                            });
                            if (!dct) {
                                throw "internal error";
                            }
                            ct = dct.attribute("ContentType").value;
                        }
                        else {
                            ct = cte.attribute("ContentType").value;
                        }

                        var name = part;
                        if (name.charAt(0) === "/") {
                            name = name.substring(1);
                        }

                        if (thisPart.partType === "binary") {
                            zip.file(name, thisPart.data, { binary: true});
                        }
                        if (thisPart.partType === "xml" && typeof thisPart.data === "string") {
                            var data = thisPart.data;
                            var utf8 = openXml.util.decode_utf8(data);
                            zip.file(name, utf8);
                        }
                        if (thisPart.partType === "xml" && thisPart.data.nodeType) {
                            zip.file(name, thisPart.data.toString(false));
                        }
                        if (thisPart.partType === "base64") {
                            var nsp = thisPart.data;
                            var sp = [];
                            var pos = 0;
                            var len = nsp.length;
                            while (true) {
                                if (pos >= len) { break; }
                                sp.push(nsp.substring(pos, pos + 76) + '\n');
                                pos += 76;
                            }
                            zip.file(name, sp.join(''), { base64: true });
                        }
                    }
                }
            }
            return zip;
        }

        openXml.OpenXmlPackage.prototype.saveToBase64 = function () {
            var zip = saveToZip(this);
            var b64 = zip.generate({
                base64: true,
                compression: "deflate",
                type: "base64"
            });
            return b64;
        };
        
        openXml.OpenXmlPackage.prototype.saveToBase64Async = function (cb) {
            var zip = null;
            var state = 1;
            var pkg = this;
            var intervalId = setInterval(function () {
                if (state === 1) {
                    zip = saveToZip(pkg);
                    state = 2;
                    return;
                }
                if (state === 2) {
                    var b64 = zip.generate({
                        base64: true,
                        compression: "deflate",
                        type: "base64"
                    });
                    clearInterval(intervalId);
                    cb(b64);
                    return;
                }
            }, 10);
        };

        openXml.OpenXmlPackage.prototype.saveToBlob = function () {
            var zip = saveToZip(this);
            var blob = zip.generate({
                blob: true,
                base64: false,
                type: "blob"
            });
            return blob;
        };

        openXml.OpenXmlPackage.prototype.saveToBlobAsync = function (cb) {
            var zip = null;
            var state = 1;
            var pkg = this;
            var intervalId = setInterval(function () {
                if (state === 1) {
                    zip = saveToZip(pkg);
                    state = 2;
                    return;
                }
                if (state === 2) {
                    var blob = zip.generate({
                        blob: true,
                        base64: false,
                        type: "blob"
                    });
                    clearInterval(intervalId);
                    cb(blob);
                    return;
                }
            }, 10);
        };

        openXml.OpenXmlPackage.prototype.saveToBuffer = function () {
            var zip = saveToZip(this);
            var buffer = zip.generate({
                type: "nodebuffer"
            });
            return buffer;
        };

        openXml.OpenXmlPackage.prototype.saveToBufferAsync = function (cb) {
            var zip = null;
            var state = 1;
            var pkg = this;
            var intervalId = setInterval(function () {
                if (state === 1) {
                    zip = saveToZip(pkg);
                    state = 2;
                    return;
                }
                if (state === 2) {
                    var buffer = zip.generate({
                        type: "nodebuffer"
                    });
                    clearInterval(intervalId);
                    cb(buffer);
                    return;
                }
            }, 10);
        };

        openXml.OpenXmlPackage.prototype.saveToFlatOpc = function () {
            var xdec = new XDeclaration("1.0", "UTF-8", "yes");
            var nsa = new XAttribute(XNamespace.xmlns + "pkg",
                "http://schemas.microsoft.com/office/2006/xmlPackage");
            var pkg = new XElement(FLATOPC._package, nsa);
            var flatOpc = new XDocument(xdec,
                new XProcessingInstruction('mso-application', 'progid="Word.Document"'),
                pkg);
            for (var part in this.parts) {
                if (part !== "[Content_Types].xml") {
                    var ct;
                    var thisPart = this.parts[part];
                    // test for null because if the part was deleted, it will be set to null, not undefined
                    if (thisPart !== null) {
                        var cte = this.ctXDoc.getRoot().elements(CT.Override).firstOrDefault(function (e) {
                            var ctpn = e.attribute("PartName").value;
                            var thpn = part;
                            var b = ctpn === thpn;
                            return b;
                        });
                        if (cte === null) {
                            var extension = part
                                .substring(part.lastIndexOf('.') + 1).toLowerCase();
                            var dct = this.ctXDoc.getRoot().elements(CT.Default).firstOrDefault(function (e) {
                                return e.attribute("Extension").value.toLowerCase() === extension;
                            });
                            if (!dct) {
                                throw "internal error";
                            }
                            ct = dct.attribute("ContentType").value;
                        }
                        else {
                            ct = cte.attribute("ContentType").value;
                        }
                        var compression = null;
                        var partContent = null;

                        if (thisPart.partType === "xml" && typeof thisPart.data === "string") {
                            partContent = XDocument.parse(openXml.util.decode_utf8(thisPart.data)).root;
                            partContent = transformToEntities(partContent);
                        }
                        if (thisPart.partType === "xml" && thisPart.data.nodeType) {
                            if (thisPart.data.nodeType === "Document") {
                                partContent = thisPart.data.getRoot();
                            }
                            else if (thisPart.data.nodeType === "Element") {
                                partContent = thisPart.data;
                            }
                            else {
                                throw "internal error";
                            }
                        }
                        if (thisPart.partType === "base64") {
                            var nsp = thisPart.data;
                            var sp = [];
                            var pos = 0;
                            var len = nsp.length;
                            while (true) {
                                if (pos >= len) { break; }
                                sp.push(nsp.substring(pos, pos + 76) + '\n');
                                pos += 76;
                            }
                            partContent = sp.join('');
                            compression = 'store';
                        }
                        if (thisPart.partType === "binary") {
                            partContent = openXml.util.encode64(thisPart.data);
                            compression = 'store';
                        }

                        var nameAtt = new XAttribute(FLATOPC.name, part);
                        var ctAtt = new XAttribute(FLATOPC.contentType, ct);
                        var compressionAtt = null;
                        if (compression) {
                            compressionAtt = new XAttribute(FLATOPC.compression, compression);
                        }
                        var dataElement = null;
                        if (thisPart.partType === 'base64' || thisPart.partType === 'binary') {
                            dataElement = new XElement(FLATOPC.binaryData, partContent);
                        }
                        if (thisPart.partType === 'xml') {
                            dataElement = new XElement(FLATOPC.xmlData, partContent);
                        }
                        var partElement = new XElement(FLATOPC.part, nameAtt, ctAtt, compressionAtt, dataElement);
                        pkg.add(partElement);
                    }
                }
            }
            return flatOpc.toString(true);
        };
        
        openXml.OpenXmlPackage.prototype.saveToFlatOpcAsync = function (cb) {
            var xdec = new XDeclaration("1.0", "UTF-8", "yes");
            var nsa = new XAttribute(XNamespace.xmlns + "pkg",
                "http://schemas.microsoft.com/office/2006/xmlPackage");
            var pkg = new XElement(FLATOPC._package, nsa);
            var flatOpc = new XDocument(xdec,
                new XProcessingInstruction('mso-application', 'progid="Word.Document"'),
                pkg);

            var partQueue = [];
            for (var part in this.parts) {
                if (part !== "[Content_Types].xml") {
                    var thisPart = this.parts[part];
                    // test for null because if the part was deleted, it will be set to null, not undefined
                    if (thisPart !== null) {
                        partQueue.push(thisPart);
                    }
                }
            }

            var count = 0;
            var docpkg = this;
            var partCount = partQueue.length;

            var intervalId = setInterval(function () {
                if (count < partCount) {
                    for (var i = 0; i < 10; i++) {
                        var thisPart = partQueue[count];
                        var cte = docpkg.ctXDoc.getRoot().elements(CT.Override).firstOrDefault(function (e) {
                            var ctpn = e.attribute("PartName").value;
                            var thpn = thisPart.uri;
                            var b = ctpn === thpn;
                            return b;
                        });
                        var ct = null;
                        if (cte === null) {
                            var extension = thisPart.uri
                                .substring(thisPart.uri.lastIndexOf('.') + 1).toLowerCase();
                            var dct = docpkg.ctXDoc.getRoot().elements(CT.Default).firstOrDefault(function (e) {
                                return e.attribute("Extension").value.toLowerCase() === extension;
                            });
                            if (!dct) {
                                throw "internal error";
                            }
                            ct = dct.attribute("ContentType").value;
                        }
                        else {
                            ct = cte.attribute("ContentType").value;
                        }
                        var compression = null;
                        var partContent = null;

                        if (thisPart.partType === "xml" && typeof thisPart.data === "string") {
                            partContent = XDocument.parse(openXml.util.decode_utf8(thisPart.data)).root;
                            partContent = transformToEntities(partContent);
                        }
                        if (thisPart.partType === "xml" && thisPart.data.nodeType) {
                            if (thisPart.data.nodeType === "Document") {
                                partContent = thisPart.data.getRoot();
                            }
                            else if (thisPart.data.nodeType === "Element") {
                                partContent = thisPart.data;
                            }
                            else {
                                throw "internal error";
                            }
                        }
                        if (thisPart.partType === "base64") {
                            var nsp = thisPart.data;
                            var sp = [];
                            var pos = 0;
                            var len = nsp.length;
                            while (true) {
                                if (pos >= len) { break; }
                                sp.push(nsp.substring(pos, pos + 76) + '\n');
                                pos += 76;
                            }
                            partContent = sp.join('');
                            compression = 'store';
                        }
                        if (thisPart.partType === "binary") {
                            partContent = openXml.util.encode64(thisPart.data);
                            compression = 'store';
                        }

                        var nameAtt = new XAttribute(FLATOPC.name, thisPart.uri);
                        var ctAtt = new XAttribute(FLATOPC.contentType, ct);
                        var compressionAtt = null;
                        if (compression) {
                            compressionAtt = new XAttribute(FLATOPC.compression, compression);
                        }
                        var dataElement = null;
                        if (thisPart.partType === 'base64' || thisPart.partType === 'binary') {
                            dataElement = new XElement(FLATOPC.binaryData, partContent);
                        }
                        if (thisPart.partType === 'xml') {
                            dataElement = new XElement(FLATOPC.xmlData, partContent);
                        }
                        var partElement = new XElement(FLATOPC.part, nameAtt, ctAtt, compressionAtt, dataElement);
                        pkg.add(partElement);
                        count += 1;
                        if (count >= partCount) {
                            break;
                        }
                    }
                    return;
                }
                else {
                    clearInterval(intervalId);
                    cb(flatOpc.toString(true));
                    return;
                }
            }, 10);
        };


        openXml.OpenXmlPackage.prototype.addPart = function (uri, contentType, partType, data) {
            var ctEl = this.ctXDoc.getRoot().elements(CT.Override)
                .firstOrDefault(function (or) {
                    var orn = or.attribute("PartName").value;
                    if (uri === orn) {
                        return true;
                    }
                    return false;
                });
            if (ctEl || this.parts[uri]) {
                throw "Invalid operation, trying to add a part that already exists";
            }

            var newPart = new openXml.OpenXmlPart(this, uri, contentType, partType, data);
            this.parts[uri] = newPart;

            // update [Content_Types].xml
            this.ctXDoc.getRoot().add(
                new XElement(CT.Override,
                    new XAttribute("PartName", uri),
                    new XAttribute("ContentType", contentType)));

            return newPart;
        }
        
        openXml.OpenXmlPackage.prototype.deletePart = function (part) {
            var uri = part.uri;
            this.parts[uri] = null;

            // update [Content_Types].xml
            var ctEl = this.ctXDoc.getRoot().elements(CT.Override)
                .firstOrDefault(function (or) {
                    var orn = or.attribute("PartName").value;
                    if (uri === orn) {
                        return true;
                    }
                    return false;
                });
            if (ctEl) {
                ctEl.remove();
            }
        }
        
        function getRelationshipsFromRelsXml(pkg, part, relationshipPart) {
            var rxDoc = relationshipPart.getXDocument();
            var rels = rxDoc.getRoot().elements(PKGREL.Relationship)
                .select(function (r) {
                    var targetMode = null;
                    var tm = r.attribute("TargetMode");
                    if (tm) {
                        targetMode = tm.value;
                    }
                    var theRel = new openXml.OpenXmlRelationship(
                        pkg,
                        part,
                        r.attribute("Id").value,
                        r.attribute("Type").value,
                        r.attribute("Target").value,
                        targetMode);
                    return theRel;
                })
                .toArray();
            return rels;
        }

        openXml.OpenXmlPackage.prototype.getRelationships = function () {
            var rootRelationshipsPart = this.getPartByUri("/_rels/.rels");
            var rels = getRelationshipsFromRelsXml(this, null, rootRelationshipsPart);
            return rels;
        }
        
        openXml.OpenXmlPackage.prototype.getParts = function () {
            var parts = [];
            for (var part in this.parts) {
                if (this.parts[part].contentType !== openXml.contentTypes.relationships &&
                    part !== "[Content_Types].xml") {
                    parts.push(this.parts[part]);
                }
            }
            return parts;
        }
        
        openXml.OpenXmlPackage.prototype.getRelationshipsByRelationshipType = function (relationshipType) {
            var rootRelationshipsPart = this.getPartByUri("/_rels/.rels");
            var rxDoc = rootRelationshipsPart.getXDocument();
            var that = this;
            var rels = rxDoc.getRoot().elements(PKGREL.Relationship)
                .where(function (r) {
                    return r.attribute("Type").value === relationshipType;
                })
                .select(function (r) {
                    var targetMode = null;
                    var tm = r.attribute("TargetMode");
                    if (tm) {
                        targetMode = tm.value;
                    }
                    var theRel = new openXml.OpenXmlRelationship(
                        that,
                        null,
                        r.attribute("Id").value,
                        relationshipType,
                        r.attribute("Target").value,
                        targetMode);
                    return theRel;
                })
                .toArray();
            return rels;
        }
        
        openXml.OpenXmlPackage.prototype.getPartsByRelationshipType = function (relationshipType) {
            var rels = this.getRelationshipsByRelationshipType(relationshipType);
            var parts = [];
            for (var i = 0; i < rels.length; ++i) {
                var part = this.getPartByUri(rels[i].targetFullName);
                parts.push(part);
            }
            return parts;
        }

        openXml.OpenXmlPackage.prototype.getPartByRelationshipType = function (relationshipType) {
            var parts = this.getPartsByRelationshipType(relationshipType);
            if (parts.length < 1) {
                return null;
            }
            return parts[0];
        }
        
        openXml.OpenXmlPackage.prototype.getRelationshipsByContentType = function (contentType) {
            var rootRelationshipsPart = this.getPartByUri("/_rels/.rels");
            if (rootRelationshipsPart) {
                var allRels = getRelationshipsFromRelsXml(this, null, rootRelationshipsPart);
                var rels = [];
                for (var i = 0; i < allRels.length; ++i) {
                    if (allRels[i].targetMode === "External") {
                        continue;
                    }
                    var ct = this.getContentType(allRels[i].targetFullName);
                    if (ct !== contentType) {
                        continue;
                    }
                    rels.push(allRels[i]);
                }
                return rels;
            }
            return [];
        }
        
        openXml.OpenXmlPackage.prototype.getPartsByContentType = function (contentType) {
            var rels = this.getRelationshipsByContentType(contentType);
            var parts = [];
            for (var i = 0; i < rels.length; ++i) {
                var part = this.getPartByUri(rels[i].targetFullName);
                parts.push(part);
            }
            return parts;
        };

        openXml.OpenXmlPackage.prototype.getRelationshipById = function (rId) {
            var rel = Enumerable.from(this.getRelationships())
                .firstOrDefault(function (r) {
                    return r.relationshipId == rId;
                });
            return rel;
        }
        
        openXml.OpenXmlPackage.prototype.getPartById = function (rId) {
            var rel = Enumerable.from(this.getRelationships())
                .firstOrDefault(function (r) {
                    return r.relationshipId == rId;
                });
            if (!rel) {
                return null;
            }
            var part = this.getPartByUri(rel.targetFullName);
            return part;
        }
        
        openXml.OpenXmlPackage.prototype.getPartByUri = function (uri) {
            var part = this.parts[uri];
            return part;
        }

        function addRelationshipToRelPart(part, relationshipId, relationshipType, target, targetMode) {
            var rxDoc = part.getXDocument();
            var tm = null;
            if (targetMode !== "Internal")
                tm = new XAttribute("TargetMode", "External");
            rxDoc.getRoot().add(
                new XElement(PKGREL.Relationship,
                    new XAttribute("Id", relationshipId),
                    new XAttribute("Type", relationshipType),
                    new XAttribute("Target", target),
                    tm));
        }

        openXml.OpenXmlPackage.prototype.addRelationship = function (relationshipId, relationshipType, target, targetMode) {
            if (!targetMode) {
                targetMode = "Internal";
            }
            var rootRelationshipPart = this.getPartByUri("/_rels/.rels");
            if (!rootRelationshipPart) {
                rootRelationshipsPart = this.addPart("/_rels/.rels", this.contentTypes.relationships, "xml",
                    new XDocument(
                        new XElement(PKGREL.Relationships,
                            new XAttribute("xmlns", pkgRelNs.namespaceName))));
            }
            addRelationshipToRelPart(rootRelationshipPart, relationshipId, relationshipType, target, targetMode);
        }

        openXml.OpenXmlPackage.prototype.deleteRelationship = function (relationshipId) {
            var rootRelationshipsPart = this.getPartByUri("/_rels/.rels");
            var rxDoc = rootRelationshipsPart.getXDocument();
            var rxe = rxDoc.getRoot().elements(PKGREL.Relationship)
                .firstOrDefault(function (r) {
                    return r.attribute("Id").value == relationshipId;
                });
            if (rxe) {
                rxe.remove();
            }
        }

        openXml.OpenXmlPackage.prototype.getContentType = function (uri) {
            var ctfile, ct, c;
                
            ct = this.ctXDoc.descendants(CT.Override)
                .firstOrDefault(function (o) {
                    return o.attribute("PartName").value === uri;
                });
            if (ct === null) {
                var exti = uri.lastIndexOf(".");
                var ext = uri.substring(exti + 1);
                var dct = this.ctXDoc.descendants(CT.Default)
                    .firstOrDefault(function (d) {
                        return d.attribute("Extension").value === ext;
                    });
                if (dct !== null) {
                    return dct.attribute("ContentType").value;
                }
                return null;
            }
            c = ct.attribute("ContentType").value;
            return c;
        };

        // The following on OpenXmlPackage because they have a relationship from the package to the part.
        openXml.OpenXmlPackage.prototype.mainDocumentPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.mainDocument);
        };

        openXml.OpenXmlPackage.prototype.coreFilePropertiesPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.coreFileProperties);
        };

        openXml.OpenXmlPackage.prototype.extendedFilePropertiesPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.extendedFileProperties);
        };

        openXml.OpenXmlPackage.prototype.workbookPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.workbook);
        };

        openXml.OpenXmlPackage.prototype.customFilePropertiesPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.customFileProperties);
        };

        openXml.OpenXmlPackage.prototype.presentationPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.presentation);
        };

        openXml.OpenXmlPackage.prototype.contentParts = function () {
            var main = this.mainDocumentPart();
            var pa = [main];
            var headers = main.headerParts();
            for (var i = 0; i < headers.length; i++) {
                pa.push(headers[i]);
            }
            var footers = main.footerParts();
            for (var i = 0; i < footers.length; i++) {
                pa.push(footers[i]);
            }
            var endNotes = main.endnotesPart();
            var footNotes = main.footnotesPart();
            if (endNotes) {
                pa.push(endNotes);
            }
            if (footNotes) {
                pa.push(footNotes);
            }
            return pa;
        };
        
        /*********** OpenXmlPart ***********/

        openXml.OpenXmlPart = function (pkg, uri, contentType, partType, data) {
            this.pkg = pkg;      // reference to the parent package
            this.uri = uri;      // the part is also indexed by uri in the package
            this.contentType = contentType;
            this.partType = partType;
            if (uri === "[Content_Types].xml") {
                partType = "xml";
            }
            this.data = data;
        };
        
        openXml.OpenXmlPart.prototype.getXDocument = function () {
            if (this.partType === 'xml' && typeof this.data === 'string') {
                var data = this.data;
                var utf = openXml.util.decode_utf8(data);
                this.data = XDocument.parse(utf);
                this.partType = 'xml';
            }
            return this.data;
        };

        openXml.OpenXmlPart.prototype.putXDocument = function (xDoc) {
            if (xDoc) {
                this.data = xDoc;
            }
        };

        function getRelsPartUriOfPart(part) {
            var uri = part.uri;
            var lastSlash = uri.lastIndexOf('/');
            var partFileName = uri.substring(lastSlash + 1);
            var relsFileName = uri.substring(0, lastSlash) + "/_rels/" + partFileName + ".rels";
            return relsFileName;
        }
        
        function getRelsPartOfPart(part) {
            var relsFileName = getRelsPartUriOfPart(part);
            var relsPart = part.pkg.getPartByUri(relsFileName);
            return relsPart;
        }
        
        // returns all relationships
        openXml.OpenXmlPart.prototype.getRelationships = function () {
            var relsPart = getRelsPartOfPart(this);
            if (relsPart) {
                var rels = getRelationshipsFromRelsXml(null, this, relsPart);
                return rels;
            }
            return [];
        }
        
        // returns all related parts of the source part
        openXml.OpenXmlPart.prototype.getParts = function () {
            var parts = [];
            var rels = this.getRelationships();
            for (var i = 0; i < rels.length; ++i) {
                if (rels[i].targetMode === "Internal") {
                    var part = this.pkg.getPartByUri(rels[i].targetFullName);
                    parts.push(part);
                }
            }
            return parts;
        }
        
        openXml.OpenXmlPart.prototype.getRelationshipsByRelationshipType = function (relationshipType) {
            var rels = [];
            var allRels = this.getRelationships();
            for (var i = 0; i < allRels.length; ++i) {
                if (allRels[i].relationshipType === relationshipType) {
                    rels.push(allRels[i]);
                }
            }
            return rels;
        }
        
        // returns all related parts of the source part with the given relationship type
        openXml.OpenXmlPart.prototype.getPartsByRelationshipType = function (relationshipType) {
            var parts = [];
            var rels = this.getRelationshipsByRelationshipType(relationshipType);
            for (var i = 0; i < rels.length; ++i) {
                var part = this.pkg.getPartByUri(rels[i].targetFullName);
                parts.push(part);
            }
            return parts;
        }

        openXml.OpenXmlPart.prototype.getPartByRelationshipType = function (relationshipType) {
            var parts = this.getPartsByRelationshipType(relationshipType);
            if (parts.length < 1) {
                return null;
            }
            return parts[0];
        }

        openXml.OpenXmlPart.prototype.getRelationshipsByContentType = function (contentType) {
            var rels = [];
            var allRels = this.getRelationships();
            for (var i = 0; i < allRels.length; ++i) {
                if (allRels[i].targetMode === "Internal") {
                    var ct = this.pkg.getContentType(allRels[i].targetFullName);
                    if (ct === contentType) {
                        rels.push(allRels[i]);
                    }
                }
            }
            return rels;
        }
        
        openXml.OpenXmlPart.prototype.getPartsByContentType = function (contentType) {
            var parts = [];
            var rels = this.getRelationshipsByContentType(contentType);
            for (var i = 0; i < rels.length; ++i) {
                var part = this.pkg.getPartByUri(rels[i].targetFullName);
                parts.push(part);
            }
            return parts;
        }

        openXml.OpenXmlPart.prototype.getRelationshipById = function (relationshipId) {
            var rels = this.getRelationships();
            for (var i = 0; i < rels.length; ++i) {
                if (rels[i].relationshipId === relationshipId) {
                    return rels[i];
                }
            }
            return null;
        }

        openXml.OpenXmlPart.prototype.getPartById = function (relationshipId) {
            var rel = this.getRelationshipById(relationshipId);
            if (rel) {
                var part = this.pkg.getPartByUri(rel.targetFullName);
                return part;
            }
            return null;
        }

        // if targetMode is not set, then it is Internal
        openXml.OpenXmlPart.prototype.addRelationship = function (relationshipId, relationshipType, target, targetMode) {
            var relsPart = getRelsPartOfPart(this);
            if (!relsPart) {
                var relsPartUri = getRelsPartUriOfPart(this);
                relsPart = this.pkg.addPart(relsPartUri, openXml.contentTypes.relationships, "xml",
                    new XDocument(
                        new XElement(PKGREL.Relationships,
                            new XAttribute(XNamespace.xmlns + "rel", pkgRelNs.namespaceName))));
            }
            addRelationshipToRelPart(relsPart, relationshipId, relationshipType, target, targetMode);
        }

        openXml.OpenXmlPart.prototype.deleteRelationship = function (relationshipId) {
            var relsPart = getRelsPartOfPart(this);
            if (relsPart) {
                var relsPartXDoc = relsPart.getXDocument();
                var theRel = relsPartXDoc.getRoot().elements(PKGREL.Relationship).firstOrDefault(function (r) {
                    if (r.attribute("Id").value === relationshipId) {
                        return true;
                    }
                });
            }
            if (theRel) {
                theRel.remove();
            }
        }

        openXml.OpenXmlPart.prototype.wordprocessingCommentsPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.wordprocessingComments);
        };

        openXml.OpenXmlPart.prototype.fontTablePart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.fontTable);
        };

        openXml.OpenXmlPart.prototype.numberingDefinitionsPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.numberingDefinitions);
        };

        openXml.OpenXmlPart.prototype.headerParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.header);
        };

        openXml.OpenXmlPart.prototype.footerParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.footer);
        };

        openXml.OpenXmlPart.prototype.customXmlPropertiesPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.customXmlProperties);
        };

        openXml.OpenXmlPart.prototype.footnotesPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.footnotes);
        };

        openXml.OpenXmlPart.prototype.endnotesPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.endnotes);
        };

        openXml.OpenXmlPart.prototype.styleDefinitionsPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.styles);
        };

        openXml.OpenXmlPart.prototype.webSettingsPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.webSettings);
        };

        openXml.OpenXmlPart.prototype.documentSettingsPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.documentSettings);
        };

        openXml.OpenXmlPart.prototype.glossaryDocumentPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.glossaryDocument);
        };

        openXml.OpenXmlPart.prototype.calculationChainPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.calculationChain);
        };

        openXml.OpenXmlPart.prototype.cellMetadataPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.cellMetadata);
        };

        openXml.OpenXmlPart.prototype.chartsheetParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.chartsheet);
        };

        openXml.OpenXmlPart.prototype.sharedStringTablePart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.sharedStringTable);
        };

        openXml.OpenXmlPart.prototype.themePart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.theme);
        };

        openXml.OpenXmlPart.prototype.thumbnailPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.thumbnail);
        };

        openXml.OpenXmlPart.prototype.workbookRevisionHeaderPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.workbookRevisionHeader);
        };

        openXml.OpenXmlPart.prototype.workbookStylesPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.workbookStyles);
        };

        openXml.OpenXmlPart.prototype.worksheetParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.worksheet);
        };

        openXml.OpenXmlPart.prototype.drawingsPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.drawings);  // todo is this plural?
        };

        openXml.OpenXmlPart.prototype.imageParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.image);
        };

        openXml.OpenXmlPart.prototype.pivotTableParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.pivotTable);
        };

        openXml.OpenXmlPart.prototype.queryTableParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.queryTable);
        };

        openXml.OpenXmlPart.prototype.tableDefinitionParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.tableDefinition);
        };

        openXml.OpenXmlPart.prototype.timeLineParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.timeLine);
        };

        openXml.OpenXmlPart.prototype.worksheetCommentsPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.worksheetComments);
        };

        openXml.OpenXmlPart.prototype.commentAuthorsPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.commentAuthors);
        };

        openXml.OpenXmlPart.prototype.customXmlParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.customXml);
        };

        openXml.OpenXmlPart.prototype.fontParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.font);
        };

        openXml.OpenXmlPart.prototype.handoutMasterPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.handoutMaster);
        };

        openXml.OpenXmlPart.prototype.notesMasterPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.notesMaster);
        };

        openXml.OpenXmlPart.prototype.notesSlidePart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.notesSlide);
        };

        openXml.OpenXmlPart.prototype.presentationPropertiesPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.presentationProperties);
        };

        openXml.OpenXmlPart.prototype.slideMasterParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.slideMaster);
        };

        openXml.OpenXmlPart.prototype.slideParts = function () {
            return this.getPartsByRelationshipType(openXml.relationshipTypes.slide);
        };

        openXml.OpenXmlPart.prototype.tableStylesPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.tableStyles);
        };

        openXml.OpenXmlPart.prototype.themePart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.theme);
        };

        openXml.OpenXmlPart.prototype.userDefinedTagsPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.userDefinedTags);
        };

        openXml.OpenXmlPart.prototype.viewPropertiesPart = function () {
            return this.getPartByRelationshipType(openXml.relationshipTypes.viewProperties);
        };

        /******************************** OpenXmlRelationship ********************************/

        openXml.OpenXmlRelationship = function (pkg, part, relationshipId, relationshipType, target, targetMode) {
            this.fromPkg = pkg;        // if from a part, this will be null
            this.fromPart = part;      // if from a package, this will be null;
            this.relationshipId = relationshipId;
            this.relationshipType = relationshipType;
            this.target = target;
            this.targetMode = targetMode;
            if (!targetMode)
                this.targetMode = "Internal";

            var workingTarget = target;
            var workingCurrentPath;
            if (this.fromPkg) {
                workingCurrentPath = "/";
            }
            if (this.fromPart) {
                var slashIndex = this.fromPart.uri.lastIndexOf('/');
                if (slashIndex === -1) {
                    workingCurrentPath = "/";
                }
                else {
                    workingCurrentPath = this.fromPart.uri.substring(0, slashIndex) + "/";
                }
            }
            if (targetMode === "External") {
                this.targetFullName = this.target;
                return;
            }
            while (openXml.util.startsWith(workingTarget, '../')) {
                if (openXml.util.endsWith(workingCurrentPath, '/')) {
                    workingCurrentPath = workingCurrentPath.substring(0, workingCurrentPath.length - 1);
                }
                var indexOfLastSlash = workingCurrentPath.lastIndexOf('/');
                if (indexOfLastSlash === -1) {
                    throw "internal error when processing relationships";
                }
                workingCurrentPath = workingCurrentPath.substring(0, indexOfLastSlash + 1);
                workingTarget = workingTarget.substring(3);
            }

            this.targetFullName = workingCurrentPath + workingTarget;
        }
        
        /******************************** OpenXmlRelationship ********************************/

        openXml.util = {};

        openXml.util.isBase64 = function (str) {
            if (typeof str !== 'string') {
                return false;
            }
            var sub = str.substring(0, 500);
            for (var i = 0; i < sub.length; i++) {
                var s = sub[i];
                if (s >= 'A' && s <= 'Z') continue;
                if (s >= 'a' && s <= 'z') continue;
                if (s >= '0' && s <= '9') continue;
                if (s === '+' || s === '/') continue;
                return false;
            }
            return true;
        }

        openXml.util.trim = function (str, arg) {
            var pat1, pat2;

            if (!arg) {
                arg = '\\s\\xA0\\t';
            }
            pat1 = '^[' + arg + ']+';
            pat2 = '[' + arg + ']+$';
            return (str.replace(new RegExp(pat1), "").replace(new RegExp(pat2), ""));
        };

        openXml.util.trimStart = function (str, arg) {
            var pat1;

            if (!arg) {
                arg = '\\s\\xA0\\t';
            }
            pat1 = '^[' + arg + ']+';
            return (str.replace(new RegExp(pat1), ""));
        };

        openXml.util.trimEnd = function (str, arg) {
            var pat2;

            if (!arg) {
                arg = '\\s\\xA0\\t';
            }
            pat2 = '[' + arg + ']+$';
            return (str.replace(new RegExp(pat2), ""));
        };

        openXml.util.startsWith = function (str, mat) {
            var m = str.match("^" + mat);
            if (m) {
                return m.join('') === mat;
            }
            return false;
        };

        openXml.util.endsWith = function (str, mat) {
            var m = str.match(mat + "$");
            if (m) {
                return m.join('') === mat;
            }
            return false;
        };

        openXml.util.trimEndingNewlines = function (str) {
            var newStr;

            newStr = str;
            while (newStr.substr(newStr.length - 1) === '\n') {
                newStr = newStr.substr(0, newStr.length - 1);
            }
            return newStr;
        };

        openXml.util.bucketTimer = {};

        var bucketTimer = openXml.util.bucketTimer;

        bucketTimer.init = function () {
            var prop;

            bucketTimer.currentTime = (new Date()).getTime();
            bucketTimer.beginningTime = bucketTimer.currentTime;
            bucketTimer.currentBucket = '';
            for (prop in bucketTimer) {
                if (typeof bucketTimer[prop] !== 'function' &&
                            prop !== 'currentTime' &&
                            prop !== 'currentBucket' &&
                            prop !== 'beginningTime') {
                    delete bucketTimer[prop];
                }
            }
        };

        bucketTimer.bucket = function (b) {
            var ct, diff, z;

            ct = (new Date()).getTime();
            diff = ct - bucketTimer.currentTime;
            if (bucketTimer.currentBucket !== '') {
                if (bucketTimer[bucketTimer.currentBucket]) {
                    bucketTimer[bucketTimer.currentBucket].time += diff;
                    bucketTimer[bucketTimer.currentBucket].count += 1;
                }
                else {
                    z = {};
                    z.time = diff;
                    z.count = 1;
                    bucketTimer[bucketTimer.currentBucket] = z;
                }
            }
            bucketTimer.currentTime = ct;
            bucketTimer.currentBucket = b;
        };

        openXml.util.lPad = function (str, padLength, padChar) {
            //Use: openXml.util.lPad(string, Number of Characters, Character to Pad)
            //Returns: string with the padChar appended to the left until the string
            // is padLength in length
            var p = Math.max((padLength + 1) - str.length, 0);
            return Array(p).join(padChar) + str;
        };

        openXml.util.rPad = function (str, padLength, padChar) {
            //Use: openXml.util.rPad(string, Number of Characters, Character to Pad)
            //Returns: string with the padChar appended to the right until the string 
            // is padLength in length
            var p = Math.max((padLength + 1) - str.length, 0);  //ignore jslint
            return str + Array(p).join(padChar);
        };

        bucketTimer.dump = function () {
            var prop, s, a, a2, a3, a4, diffFromBeginning, i;

            bucketTimer.bucket('');
            s = '';
            a = [];
            for (prop in bucketTimer) {
                if (typeof bucketTimer[prop] !== 'function' &&
                            prop !== 'currentTime' &&
                            prop !== 'currentBucket' &&
                            prop !== 'beginningTime') {
                    a.push(openXml.util.rPad(prop.toString(), 50, "-") + ': ' +
                        openXml.util.lPad(bucketTimer[prop].time.toString(), 8, " ") +
                        " " + openXml.util.lPad(bucketTimer[prop].count.toString(), 8, " "));
                }
            }
            a2 = Enumerable.from(a);
            a3 = a2.orderBy("z=>z");
            a4 = a3.toArray();
            for (i = 0; i < a4.length; i += 1) {
                s += a4[i] + '\n';
            }

            diffFromBeginning = bucketTimer.currentTime - bucketTimer.beginningTime;
            s += "total time: " + diffFromBeginning + "\n";
            return s;
        };

        openXml.util.encode_utf8 = function (s) {
            return unescape(encodeURIComponent(s));
        }

        openXml.util.decode_utf8 = function (s) {
            return decodeURIComponent(escape(s));
        }

        var keyStr = "ABCDEFGHIJKLMNOP" +
                       "QRSTUVWXYZabcdef" +
                       "ghijklmnopqrstuv" +
                       "wxyz0123456789+/" +
                       "=";

        function getChar(input, i) {
            if (input.charAt(i) === '%') {
                i++;
                var h1 = input.charAt(i++);
                h1 += input.charAt(i++);
                var chr = parseInt(h1, 16);
                return {
                    chr: chr,
                    i: i
                }
            }
            var chr = input.charCodeAt(i);
            i++;
            return {
                chr: chr,
                i: i
            }
        }
        
        openXml.util.encode64 = function (input) {
            input = escape(input);
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";

            var i = 0;

            do {
                var r = getChar(input, i);
                chr1 = r.chr;
                i = r.i;
                var r = getChar(input, i);
                chr2 = r.chr;
                i = r.i;
                var r = getChar(input, i);
                chr3 = r.chr;
                i = r.i;

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                   keyStr.charAt(enc1) +
                   keyStr.charAt(enc2) +
                   keyStr.charAt(enc3) +
                   keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        }
        
        openXml.util.decode64 = function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                      "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                      "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return unescape(output);
        }
        
        openXml.entityMap =
        {
            "160": "nbsp",
            "161": "iexcl",
            "162": "cent",
            "163": "pound",
            "164": "curren",
            "165": "yen",
            "166": "brvbar",
            "167": "sect",
            "168": "uml",
            "169": "copy",
            "170": "ordf",
            "171": "laquo",
            "172": "not",
            "173": "shy",
            "174": "reg",
            "175": "macr",
            "176": "deg",
            "177": "plusmn",
            "178": "sup2",
            "179": "sup3",
            "180": "acute",
            "181": "micro",
            "182": "para",
            "183": "middot",
            "184": "cedil",
            "185": "sup1",
            "186": "ordm",
            "187": "raquo",
            "188": "frac14",
            "189": "frac12",
            "190": "frac34",
            "191": "iquest",
            "192": "Agrave",
            "193": "Aacute",
            "194": "Acirc",
            "195": "Atilde",
            "196": "Auml",
            "197": "Aring",
            "198": "AElig",
            "199": "Ccedil",
            "200": "Egrave",
            "201": "Eacute",
            "202": "Ecirc",
            "203": "Euml",
            "204": "Igrave",
            "205": "Iacute",
            "206": "Icirc",
            "207": "Iuml",
            "208": "ETH",
            "209": "Ntilde",
            "210": "Ograve",
            "211": "Oacute",
            "212": "Ocirc",
            "213": "Otilde",
            "214": "Ouml",
            "215": "times",
            "216": "Oslash",
            "217": "Ugrave",
            "218": "Uacute",
            "219": "Ucirc",
            "220": "Uuml",
            "221": "Yacute",
            "222": "THORN",
            "223": "szlig",
            "224": "agrave",
            "225": "aacute",
            "226": "acirc",
            "227": "atilde",
            "228": "auml",
            "229": "aring",
            "230": "aelig",
            "231": "ccedil",
            "232": "egrave",
            "233": "eacute",
            "234": "ecirc",
            "235": "euml",
            "236": "igrave",
            "237": "iacute",
            "238": "icirc",
            "239": "iuml",
            "240": "eth",
            "241": "ntilde",
            "242": "ograve",
            "243": "oacute",
            "244": "ocirc",
            "245": "otilde",
            "246": "ouml",
            "247": "divide",
            "248": "oslash",
            "249": "ugrave",
            "250": "uacute",
            "251": "ucirc",
            "252": "uuml",
            "253": "yacute",
            "254": "thorn",
            "255": "yuml",
            "338": "OElig",
            "339": "oelig",
            "352": "Scaron",
            "353": "scaron",
            "376": "Yuml",
            "402": "fnof",
            "710": "circ",
            "732": "tilde",
            "913": "Alpha",
            "914": "Beta",
            "915": "Gamma",
            "916": "Delta",
            "917": "Epsilon",
            "918": "Zeta",
            "919": "Eta",
            "920": "Theta",
            "921": "Iota",
            "922": "Kappa",
            "923": "Lambda",
            "924": "Mu",
            "925": "Nu",
            "926": "Xi",
            "927": "Omicron",
            "928": "Pi",
            "929": "Rho",
            "931": "Sigma",
            "932": "Tau",
            "933": "Upsilon",
            "934": "Phi",
            "935": "Chi",
            "936": "Psi",
            "937": "Omega",
            "945": "alpha",
            "946": "beta",
            "947": "gamma",
            "948": "delta",
            "949": "epsilon",
            "950": "zeta",
            "951": "eta",
            "952": "theta",
            "953": "iota",
            "954": "kappa",
            "955": "lambda",
            "956": "mu",
            "957": "nu",
            "958": "xi",
            "959": "omicron",
            "960": "pi",
            "961": "rho",
            "962": "sigmaf",
            "963": "sigma",
            "964": "tau",
            "965": "upsilon",
            "966": "phi",
            "967": "chi",
            "968": "psi",
            "969": "omega",
            "977": "thetasym",
            "978": "upsih",
            "982": "piv",
            "8194": "ensp",
            "8195": "emsp",
            "8201": "thinsp",
            "8204": "zwnj",
            "8205": "zwj",
            "8206": "lrm",
            "8207": "rlm",
            "8211": "ndash",
            "8212": "mdash",
            "8216": "lsquo",
            "8217": "rsquo",
            "8218": "sbquo",
            "8220": "ldquo",
            "8221": "rdquo",
            "8222": "bdquo",
            "8224": "dagger",
            "8225": "Dagger",
            "8226": "bull",
            "8230": "hellip",
            "8240": "permil",
            "8242": "prime",
            "8243": "Prime",
            "8249": "lsaquo",
            "8250": "rsaquo",
            "8254": "oline",
            "8260": "frasl",
            "8364": "euro",
            "8465": "image",
            "8472": "weierp",
            "8476": "real",
            "8482": "trade",
            "8501": "alefsym",
            "8592": "larr",
            "8593": "uarr",
            "8594": "rarr",
            "8595": "darr",
            "8596": "harr",
            "8629": "crarr",
            "8656": "lArr",
            "8657": "uArr",
            "8658": "rArr",
            "8659": "dArr",
            "8660": "hArr",
            "8704": "forall",
            "8706": "part",
            "8707": "exist",
            "8709": "empty",
            "8711": "nabla",
            "8712": "isin",
            "8713": "notin",
            "8715": "ni",
            "8719": "prod",
            "8721": "sum",
            "8722": "minus",
            "8727": "lowast",
            "8730": "radic",
            "8733": "prop",
            "8734": "infin",
            "8736": "ang",
            "8743": "and",
            "8744": "or",
            "8745": "cap",
            "8746": "cup",
            "8747": "int",
            "8756": "there4",
            "8764": "sim",
            "8773": "cong",
            "8776": "asymp",
            "8800": "ne",
            "8801": "equiv",
            "8804": "le",
            "8805": "ge",
            "8834": "sub",
            "8835": "sup",
            "8836": "nsub",
            "8838": "sube",
            "8839": "supe",
            "8853": "oplus",
            "8855": "otimes",
            "8869": "perp",
            "8901": "sdot",
            "8968": "lceil",
            "8969": "rceil",
            "8970": "lfloor",
            "8971": "rfloor",
            "9001": "lang",
            "9002": "rang",
            "9674": "loz",
            "9824": "spades",
            "9827": "clubs",
            "9829": "hearts",
            "9830": "diams"
        };
        
        function convertToEntities(text) {
            var o, len, i, c, cs, em, grouped, retValue, str;

            if (text === null) {
                return null;
            }
            o = [];
            len = text.length;
            for (i = 0; i < len; i += 1) {
                c = text.charCodeAt(i);
                if (c === 0xf0b7 ||
                    c === 0xf0a7 ||
                    c === 0xf076 ||
                    c === 0xf0d8 ||
                    c === 0xf0a8 ||
                    c === 0xf0fc ||
                    c === 0xf0e0 ||
                    c === 0xf0b2) {
                    o.push(new XEntity("bull"));
                    continue; //ignore jslint
                }
                if (c >= 0xf000) {
                    o.push(new XEntity("loz"));
                    continue; //ignore jslint
                }
                if (c >= 128) {
                    cs = c.toString();
                    em = openXml.entityMap[cs];
                    if (em) {
                        o.push(new XEntity(em));
                        continue; //ignore jslint
                    }
                    var zz = c.toString(16);//ignore jslint
                    o.push(new XEntity("#" + zz));
                    //o.push("ÆŒŠ" + c.toString());
                    continue; //ignore jslint
                }
                o.push(text.charAt(i));
            }
            grouped = new XEnumerable(Enumerable.from(o)).groupAdjacent(function (e) {
                var b = typeof e === 'string';
                return b;
            });
            retValue = grouped.select(function (g) {
                if (g.Key === true) {
                    str = g.Group.toJoinedString();
                    return str;
                }
                return g.Group;
            });
            return retValue;
        };

        function transformToEntities(node) {
            if (node.nodeType === 'Element') {
                return new XElement(node.name,
                    node.attributes(),
                    node.nodes().select(function (n) { return transformToEntities(n); }));
            }
            if (node.nodeType === 'Text') {
                return convertToEntities(node.value);
            }
            return node;
        };

        // ********************* content types ***********************
        openXml.contentTypes = {
            calculationChain: "application/vnd.openxmlformats-officedocument.spreadsheetml.calcChain+xml",
            cellMetadata: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetMetadata+xml",
            chart: "application/vnd.openxmlformats-officedocument.drawingml.chart+xml",
            chartColorStyle: "application/vnd.ms-office.chartcolorstyle+xml",
            chartDrawing: "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml",
            chartsheet: "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml",
            chartStyle: "application/vnd.ms-office.chartstyle+xml",
            commentAuthors: "application/vnd.openxmlformats-officedocument.presentationml.commentAuthors+xml",
            connections: "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml",
            coreFileProperties: "application/vnd.openxmlformats-package.core-properties+xml",
            customFileProperties: "application/vnd.openxmlformats-officedocument.custom-properties+xml",
            customization: "application/vnd.ms-word.keyMapCustomizations+xml",
            customProperty: "application/vnd.openxmlformats-officedocument.spreadsheetml.customProperty",
            customXmlProperties: "application/vnd.openxmlformats-officedocument.customXmlProperties+xml",
            diagramColors: "application/vnd.openxmlformats-officedocument.drawingml.diagramColors+xml",
            diagramData: "application/vnd.openxmlformats-officedocument.drawingml.diagramData+xml",
            diagramLayoutDefinition: "application/vnd.openxmlformats-officedocument.drawingml.diagramLayout+xml",
            diagramPersistLayout: "application/vnd.ms-office.drawingml.diagramDrawing+xml",
            diagramStyle: "application/vnd.openxmlformats-officedocument.drawingml.diagramStyle+xml",
            dialogsheet: "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml",
            digitalSignatureOrigin: "application/vnd.openxmlformats-package.digital-signature-origin",
            documentSettings: "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml",
            drawings: "application/vnd.openxmlformats-officedocument.drawing+xml",
            endnotes: "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml",
            excelAttachedToolbars: "application/vnd.ms-excel.attachedToolbars",
            extendedFileProperties: "application/vnd.openxmlformats-officedocument.extended-properties+xml",
            externalWorkbook: "application/vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml",
            fontData: "application/x-fontdata",
            fontTable: "application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml",
            footer: "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml",
            footnotes: "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml",
            gif: "image/gif",
            glossaryDocument: "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml",
            handoutMaster: "application/vnd.openxmlformats-officedocument.presentationml.handoutMaster+xml",
            header: "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml",
            jpeg: "image/jpeg",
            mainDocument: "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
            notesMaster: "application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml",
            notesSlide: "application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml",
            numberingDefinitions: "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml",
            pict: "image/pict",
            pivotTable: "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotTable+xml",
            pivotTableCacheDefinition: "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheDefinition+xml",
            pivotTableCacheRecords: "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheRecords+xml",
            png: "image/png",
            presentation: "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
            presentationProperties: "application/vnd.openxmlformats-officedocument.presentationml.presProps+xml",
            presentationTemplate: "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml",
            queryTable: "application/vnd.openxmlformats-officedocument.spreadsheetml.queryTable+xml",
            relationships: "application/vnd.openxmlformats-package.relationships+xml",
            ribbonAndBackstageCustomizations: "http://schemas.microsoft.com/office/2009/07/customui",
            sharedStringTable: "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml",
            singleCellTable: "application/vnd.openxmlformats-officedocument.spreadsheetml.tableSingleCells+xml",
            slicerCache: "application/vnd.openxmlformats-officedocument.spreadsheetml.slicerCache+xml",
            slicers: "application/vnd.openxmlformats-officedocument.spreadsheetml.slicer+xml",
            slide: "application/vnd.openxmlformats-officedocument.presentationml.slide+xml",
            slideComments: "application/vnd.openxmlformats-officedocument.presentationml.comments+xml",
            slideLayout: "application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml",
            slideMaster: "application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml",
            slideShow: "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml",
            slideSyncData: "application/vnd.openxmlformats-officedocument.presentationml.slideUpdateInfo+xml",
            styles: "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml",
            tableDefinition: "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml",
            tableStyles: "application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml",
            theme: "application/vnd.openxmlformats-officedocument.theme+xml",
            themeOverride: "application/vnd.openxmlformats-officedocument.themeOverride+xml",
            tiff: "image/tiff",
            trueTypeFont: "application/x-font-ttf",
            userDefinedTags: "application/vnd.openxmlformats-officedocument.presentationml.tags+xml",
            viewProperties: "application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml",
            vmlDrawing: "application/vnd.openxmlformats-officedocument.vmlDrawing",
            volatileDependencies: "application/vnd.openxmlformats-officedocument.spreadsheetml.volatileDependencies+xml",
            webSettings: "application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml",
            wordAttachedToolbars: "application/vnd.ms-word.attachedToolbars",
            wordprocessingComments: "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml",
            wordprocessingTemplate: "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml",
            workbook: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
            workbookRevisionHeader: "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionHeaders+xml",
            workbookRevisionLog: "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionLog+xml",
            workbookStyles: "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml",
            workbookTemplate: "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml",
            workbookUserData: "application/vnd.openxmlformats-officedocument.spreadsheetml.userNames+xml",
            worksheet: "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
            worksheetComments: "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml",
            worksheetSortMap: "application/vnd.ms-excel.wsSortMap+xml",
            xmlSignature: "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml",
        };

        // *********** relationship types ***********
        openXml.relationshipTypes = {
            alternativeFormatImport: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk",
            calculationChain: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/calcChain",
            cellMetadata: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sheetMetadata",
            chart: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart",
            chartColorStyle: "http://schemas.microsoft.com/office/2011/relationships/chartColorStyle",
            chartDrawing: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chartUserShapes",
            chartsheet: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chartsheet",
            chartStyle: "http://schemas.microsoft.com/office/2011/relationships/chartStyle",
            commentAuthors: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/commentAuthors",
            connections: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/connections",
            coreFileProperties: "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties",
            customFileProperties: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties",
            customization: "http://schemas.microsoft.com/office/2006/relationships/keyMapCustomizations",
            customProperty: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customProperty",
            customXml: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml",
            customXmlMappings: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/xmlMaps",
            customXmlProperties: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXmlProps",
            diagramColors: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/diagramColors",
            diagramData: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/diagramData",
            diagramLayoutDefinition: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/diagramLayout",
            diagramPersistLayout: "http://schemas.microsoft.com/office/2007/relationships/diagramDrawing",
            diagramStyle: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/diagramQuickStyle",
            dialogsheet: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/dialogsheet",
            digitalSignatureOrigin: "http://schemas.openxmlformats.org/package/2006/relationships/digital-signature/origin",
            documentSettings: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings",
            drawings: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing",
            endnotes: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes",
            excelAttachedToolbars: "http://schemas.microsoft.com/office/2006/relationships/attachedToolbars",
            extendedFileProperties: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties",
            externalWorkbook: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLink",
            font: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/font",
            fontTable: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable",
            footer: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer",
            footnotes: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes",
            glossaryDocument: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/glossaryDocument",
            handoutMaster: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/handoutMaster",
            header: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/header",
            image: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
            mainDocument: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
            notesSlide: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide",
            numberingDefinitions: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering",
            pivotTable: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/pivotTable",
            pivotTableCacheDefinition: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/pivotCacheDefinition",
            pivotTableCacheRecords: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/ pivotCacheRecords",
            presentation: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
            presentationProperties: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps",
            queryTable: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/queryTable",
            ribbonAndBackstageCustomizations: "http://schemas.microsoft.com/office/2007/relationships/ui/extensibility",
            sharedStringTable: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings",
            singleCellTable: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableSingleCells",
            slide: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide",
            slideComments: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments",
            slideLayout: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout",
            slideMaster: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster",
            slideSyncData: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideUpdateInfo",
            styles: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
            tableDefinition: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/table",
            tableStyles: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles",
            theme: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
            themeOverride: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/themeOverride",
            thumbnail: "http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail",
            userDefinedTags: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/tags",
            viewProperties: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps",
            vmlDrawing: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing",
            volatileDependencies: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/volatileDependencies",
            webSettings: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings",
            wordAttachedToolbars: "http://schemas.microsoft.com/office/2006/relationships/attachedToolbars",
            wordprocessingComments: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments",
            workbook: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
            workbookRevisionHeader: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/revisionHeaders",
            workbookRevisionLog: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/revisionLog",
            workbookStyles: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
            workbookUserData: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/usernames",
            worksheet: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
            worksheetComments: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments",
            worksheetSortMap: "http://schemas.microsoft.com/office/2006/relationships/wsSortMap",
            xmlSignature: "http://schemas.openxmlformats.org/package/2006/relationships/digital-signature/signature",
        };

        /******************************** automatically generated code ********************************/

        openXml.aNs = new XNamespace("http://schemas.openxmlformats.org/drawingml/2006/main");
        var aNs = openXml.aNs;
        openXml.A = {
            accent1: new XName(aNs, "accent1"),
            accent2: new XName(aNs, "accent2"),
            accent3: new XName(aNs, "accent3"),
            accent4: new XName(aNs, "accent4"),
            accent5: new XName(aNs, "accent5"),
            accent6: new XName(aNs, "accent6"),
            ahLst: new XName(aNs, "ahLst"),
            ahPolar: new XName(aNs, "ahPolar"),
            ahXY: new XName(aNs, "ahXY"),
            alpha: new XName(aNs, "alpha"),
            alphaBiLevel: new XName(aNs, "alphaBiLevel"),
            alphaCeiling: new XName(aNs, "alphaCeiling"),
            alphaFloor: new XName(aNs, "alphaFloor"),
            alphaInv: new XName(aNs, "alphaInv"),
            alphaMod: new XName(aNs, "alphaMod"),
            alphaModFix: new XName(aNs, "alphaModFix"),
            alphaOff: new XName(aNs, "alphaOff"),
            alphaOutset: new XName(aNs, "alphaOutset"),
            alphaRepl: new XName(aNs, "alphaRepl"),
            anchor: new XName(aNs, "anchor"),
            arcTo: new XName(aNs, "arcTo"),
            audioCd: new XName(aNs, "audioCd"),
            audioFile: new XName(aNs, "audioFile"),
            avLst: new XName(aNs, "avLst"),
            backdrop: new XName(aNs, "backdrop"),
            band1H: new XName(aNs, "band1H"),
            band1V: new XName(aNs, "band1V"),
            band2H: new XName(aNs, "band2H"),
            band2V: new XName(aNs, "band2V"),
            bevel: new XName(aNs, "bevel"),
            bevelB: new XName(aNs, "bevelB"),
            bevelT: new XName(aNs, "bevelT"),
            bgClr: new XName(aNs, "bgClr"),
            bgFillStyleLst: new XName(aNs, "bgFillStyleLst"),
            biLevel: new XName(aNs, "biLevel"),
            bldChart: new XName(aNs, "bldChart"),
            bldDgm: new XName(aNs, "bldDgm"),
            blend: new XName(aNs, "blend"),
            blip: new XName(aNs, "blip"),
            blipFill: new XName(aNs, "blipFill"),
            blue: new XName(aNs, "blue"),
            blueMod: new XName(aNs, "blueMod"),
            blueOff: new XName(aNs, "blueOff"),
            blur: new XName(aNs, "blur"),
            bodyPr: new XName(aNs, "bodyPr"),
            bottom: new XName(aNs, "bottom"),
            br: new XName(aNs, "br"),
            buAutoNum: new XName(aNs, "buAutoNum"),
            buBlip: new XName(aNs, "buBlip"),
            buChar: new XName(aNs, "buChar"),
            buClr: new XName(aNs, "buClr"),
            buClrTx: new XName(aNs, "buClrTx"),
            buFont: new XName(aNs, "buFont"),
            buFontTx: new XName(aNs, "buFontTx"),
            buNone: new XName(aNs, "buNone"),
            buSzPct: new XName(aNs, "buSzPct"),
            buSzPts: new XName(aNs, "buSzPts"),
            buSzTx: new XName(aNs, "buSzTx"),
            camera: new XName(aNs, "camera"),
            cell3D: new XName(aNs, "cell3D"),
            chart: new XName(aNs, "chart"),
            chExt: new XName(aNs, "chExt"),
            chOff: new XName(aNs, "chOff"),
            close: new XName(aNs, "close"),
            clrChange: new XName(aNs, "clrChange"),
            clrFrom: new XName(aNs, "clrFrom"),
            clrMap: new XName(aNs, "clrMap"),
            clrRepl: new XName(aNs, "clrRepl"),
            clrScheme: new XName(aNs, "clrScheme"),
            clrTo: new XName(aNs, "clrTo"),
            cNvCxnSpPr: new XName(aNs, "cNvCxnSpPr"),
            cNvGraphicFramePr: new XName(aNs, "cNvGraphicFramePr"),
            cNvGrpSpPr: new XName(aNs, "cNvGrpSpPr"),
            cNvPicPr: new XName(aNs, "cNvPicPr"),
            cNvPr: new XName(aNs, "cNvPr"),
            cNvSpPr: new XName(aNs, "cNvSpPr"),
            comp: new XName(aNs, "comp"),
            cont: new XName(aNs, "cont"),
            contourClr: new XName(aNs, "contourClr"),
            cs: new XName(aNs, "cs"),
            cubicBezTo: new XName(aNs, "cubicBezTo"),
            custClr: new XName(aNs, "custClr"),
            custClrLst: new XName(aNs, "custClrLst"),
            custDash: new XName(aNs, "custDash"),
            custGeom: new XName(aNs, "custGeom"),
            cxn: new XName(aNs, "cxn"),
            cxnLst: new XName(aNs, "cxnLst"),
            cxnSp: new XName(aNs, "cxnSp"),
            cxnSpLocks: new XName(aNs, "cxnSpLocks"),
            defPPr: new XName(aNs, "defPPr"),
            defRPr: new XName(aNs, "defRPr"),
            dgm: new XName(aNs, "dgm"),
            dk1: new XName(aNs, "dk1"),
            dk2: new XName(aNs, "dk2"),
            ds: new XName(aNs, "ds"),
            duotone: new XName(aNs, "duotone"),
            ea: new XName(aNs, "ea"),
            effect: new XName(aNs, "effect"),
            effectDag: new XName(aNs, "effectDag"),
            effectLst: new XName(aNs, "effectLst"),
            effectRef: new XName(aNs, "effectRef"),
            effectStyle: new XName(aNs, "effectStyle"),
            effectStyleLst: new XName(aNs, "effectStyleLst"),
            end: new XName(aNs, "end"),
            endCxn: new XName(aNs, "endCxn"),
            endParaRPr: new XName(aNs, "endParaRPr"),
            ext: new XName(aNs, "ext"),
            extLst: new XName(aNs, "extLst"),
            extraClrScheme: new XName(aNs, "extraClrScheme"),
            extraClrSchemeLst: new XName(aNs, "extraClrSchemeLst"),
            extrusionClr: new XName(aNs, "extrusionClr"),
            fgClr: new XName(aNs, "fgClr"),
            fill: new XName(aNs, "fill"),
            fillOverlay: new XName(aNs, "fillOverlay"),
            fillRect: new XName(aNs, "fillRect"),
            fillRef: new XName(aNs, "fillRef"),
            fillStyleLst: new XName(aNs, "fillStyleLst"),
            fillToRect: new XName(aNs, "fillToRect"),
            firstCol: new XName(aNs, "firstCol"),
            firstRow: new XName(aNs, "firstRow"),
            flatTx: new XName(aNs, "flatTx"),
            fld: new XName(aNs, "fld"),
            fmtScheme: new XName(aNs, "fmtScheme"),
            folHlink: new XName(aNs, "folHlink"),
            font: new XName(aNs, "font"),
            fontRef: new XName(aNs, "fontRef"),
            fontScheme: new XName(aNs, "fontScheme"),
            gamma: new XName(aNs, "gamma"),
            gd: new XName(aNs, "gd"),
            gdLst: new XName(aNs, "gdLst"),
            glow: new XName(aNs, "glow"),
            gradFill: new XName(aNs, "gradFill"),
            graphic: new XName(aNs, "graphic"),
            graphicData: new XName(aNs, "graphicData"),
            graphicFrame: new XName(aNs, "graphicFrame"),
            graphicFrameLocks: new XName(aNs, "graphicFrameLocks"),
            gray: new XName(aNs, "gray"),
            grayscl: new XName(aNs, "grayscl"),
            green: new XName(aNs, "green"),
            greenMod: new XName(aNs, "greenMod"),
            greenOff: new XName(aNs, "greenOff"),
            gridCol: new XName(aNs, "gridCol"),
            grpFill: new XName(aNs, "grpFill"),
            grpSp: new XName(aNs, "grpSp"),
            grpSpLocks: new XName(aNs, "grpSpLocks"),
            grpSpPr: new XName(aNs, "grpSpPr"),
            gs: new XName(aNs, "gs"),
            gsLst: new XName(aNs, "gsLst"),
            headEnd: new XName(aNs, "headEnd"),
            highlight: new XName(aNs, "highlight"),
            hlink: new XName(aNs, "hlink"),
            hlinkClick: new XName(aNs, "hlinkClick"),
            hlinkHover: new XName(aNs, "hlinkHover"),
            hlinkMouseOver: new XName(aNs, "hlinkMouseOver"),
            hsl: new XName(aNs, "hsl"),
            hslClr: new XName(aNs, "hslClr"),
            hue: new XName(aNs, "hue"),
            hueMod: new XName(aNs, "hueMod"),
            hueOff: new XName(aNs, "hueOff"),
            innerShdw: new XName(aNs, "innerShdw"),
            insideH: new XName(aNs, "insideH"),
            insideV: new XName(aNs, "insideV"),
            inv: new XName(aNs, "inv"),
            invGamma: new XName(aNs, "invGamma"),
            lastCol: new XName(aNs, "lastCol"),
            lastRow: new XName(aNs, "lastRow"),
            latin: new XName(aNs, "latin"),
            left: new XName(aNs, "left"),
            lightRig: new XName(aNs, "lightRig"),
            lin: new XName(aNs, "lin"),
            ln: new XName(aNs, "ln"),
            lnB: new XName(aNs, "lnB"),
            lnBlToTr: new XName(aNs, "lnBlToTr"),
            lnDef: new XName(aNs, "lnDef"),
            lnL: new XName(aNs, "lnL"),
            lnR: new XName(aNs, "lnR"),
            lnRef: new XName(aNs, "lnRef"),
            lnSpc: new XName(aNs, "lnSpc"),
            lnStyleLst: new XName(aNs, "lnStyleLst"),
            lnT: new XName(aNs, "lnT"),
            lnTlToBr: new XName(aNs, "lnTlToBr"),
            lnTo: new XName(aNs, "lnTo"),
            lstStyle: new XName(aNs, "lstStyle"),
            lt1: new XName(aNs, "lt1"),
            lt2: new XName(aNs, "lt2"),
            lum: new XName(aNs, "lum"),
            lumMod: new XName(aNs, "lumMod"),
            lumOff: new XName(aNs, "lumOff"),
            lvl1pPr: new XName(aNs, "lvl1pPr"),
            lvl2pPr: new XName(aNs, "lvl2pPr"),
            lvl3pPr: new XName(aNs, "lvl3pPr"),
            lvl4pPr: new XName(aNs, "lvl4pPr"),
            lvl5pPr: new XName(aNs, "lvl5pPr"),
            lvl6pPr: new XName(aNs, "lvl6pPr"),
            lvl7pPr: new XName(aNs, "lvl7pPr"),
            lvl8pPr: new XName(aNs, "lvl8pPr"),
            lvl9pPr: new XName(aNs, "lvl9pPr"),
            majorFont: new XName(aNs, "majorFont"),
            masterClrMapping: new XName(aNs, "masterClrMapping"),
            minorFont: new XName(aNs, "minorFont"),
            miter: new XName(aNs, "miter"),
            moveTo: new XName(aNs, "moveTo"),
            neCell: new XName(aNs, "neCell"),
            noAutofit: new XName(aNs, "noAutofit"),
            noFill: new XName(aNs, "noFill"),
            norm: new XName(aNs, "norm"),
            normAutofit: new XName(aNs, "normAutofit"),
            nvCxnSpPr: new XName(aNs, "nvCxnSpPr"),
            nvGraphicFramePr: new XName(aNs, "nvGraphicFramePr"),
            nvGrpSpPr: new XName(aNs, "nvGrpSpPr"),
            nvPicPr: new XName(aNs, "nvPicPr"),
            nvSpPr: new XName(aNs, "nvSpPr"),
            nwCell: new XName(aNs, "nwCell"),
            objectDefaults: new XName(aNs, "objectDefaults"),
            off: new XName(aNs, "off"),
            outerShdw: new XName(aNs, "outerShdw"),
            overrideClrMapping: new XName(aNs, "overrideClrMapping"),
            p: new XName(aNs, "p"),
            path: new XName(aNs, "path"),
            pathLst: new XName(aNs, "pathLst"),
            pattFill: new XName(aNs, "pattFill"),
            pic: new XName(aNs, "pic"),
            picLocks: new XName(aNs, "picLocks"),
            pos: new XName(aNs, "pos"),
            pPr: new XName(aNs, "pPr"),
            prstClr: new XName(aNs, "prstClr"),
            prstDash: new XName(aNs, "prstDash"),
            prstGeom: new XName(aNs, "prstGeom"),
            prstShdw: new XName(aNs, "prstShdw"),
            prstTxWarp: new XName(aNs, "prstTxWarp"),
            pt: new XName(aNs, "pt"),
            quadBezTo: new XName(aNs, "quadBezTo"),
            quickTimeFile: new XName(aNs, "quickTimeFile"),
            r: new XName(aNs, "r"),
            rect: new XName(aNs, "rect"),
            red: new XName(aNs, "red"),
            redMod: new XName(aNs, "redMod"),
            redOff: new XName(aNs, "redOff"),
            reflection: new XName(aNs, "reflection"),
            relIds: new XName(aNs, "relIds"),
            relOff: new XName(aNs, "relOff"),
            right: new XName(aNs, "right"),
            rot: new XName(aNs, "rot"),
            round: new XName(aNs, "round"),
            rPr: new XName(aNs, "rPr"),
            sat: new XName(aNs, "sat"),
            satMod: new XName(aNs, "satMod"),
            satOff: new XName(aNs, "satOff"),
            scene3d: new XName(aNs, "scene3d"),
            schemeClr: new XName(aNs, "schemeClr"),
            scrgbClr: new XName(aNs, "scrgbClr"),
            seCell: new XName(aNs, "seCell"),
            shade: new XName(aNs, "shade"),
            snd: new XName(aNs, "snd"),
            softEdge: new XName(aNs, "softEdge"),
            solidFill: new XName(aNs, "solidFill"),
            sp: new XName(aNs, "sp"),
            sp3d: new XName(aNs, "sp3d"),
            spAutoFit: new XName(aNs, "spAutoFit"),
            spcAft: new XName(aNs, "spcAft"),
            spcBef: new XName(aNs, "spcBef"),
            spcPct: new XName(aNs, "spcPct"),
            spcPts: new XName(aNs, "spcPts"),
            spDef: new XName(aNs, "spDef"),
            spLocks: new XName(aNs, "spLocks"),
            spPr: new XName(aNs, "spPr"),
            srcRect: new XName(aNs, "srcRect"),
            srgbClr: new XName(aNs, "srgbClr"),
            st: new XName(aNs, "st"),
            stCxn: new XName(aNs, "stCxn"),
            stretch: new XName(aNs, "stretch"),
            style: new XName(aNs, "style"),
            swCell: new XName(aNs, "swCell"),
            sx: new XName(aNs, "sx"),
            sy: new XName(aNs, "sy"),
            sym: new XName(aNs, "sym"),
            sysClr: new XName(aNs, "sysClr"),
            t: new XName(aNs, "t"),
            tab: new XName(aNs, "tab"),
            tableStyle: new XName(aNs, "tableStyle"),
            tableStyleId: new XName(aNs, "tableStyleId"),
            tabLst: new XName(aNs, "tabLst"),
            tailEnd: new XName(aNs, "tailEnd"),
            tbl: new XName(aNs, "tbl"),
            tblBg: new XName(aNs, "tblBg"),
            tblGrid: new XName(aNs, "tblGrid"),
            tblPr: new XName(aNs, "tblPr"),
            tblStyle: new XName(aNs, "tblStyle"),
            tblStyleLst: new XName(aNs, "tblStyleLst"),
            tc: new XName(aNs, "tc"),
            tcBdr: new XName(aNs, "tcBdr"),
            tcPr: new XName(aNs, "tcPr"),
            tcStyle: new XName(aNs, "tcStyle"),
            tcTxStyle: new XName(aNs, "tcTxStyle"),
            theme: new XName(aNs, "theme"),
            themeElements: new XName(aNs, "themeElements"),
            themeOverride: new XName(aNs, "themeOverride"),
            tile: new XName(aNs, "tile"),
            tileRect: new XName(aNs, "tileRect"),
            tint: new XName(aNs, "tint"),
            top: new XName(aNs, "top"),
            tr: new XName(aNs, "tr"),
            txBody: new XName(aNs, "txBody"),
            txDef: new XName(aNs, "txDef"),
            txSp: new XName(aNs, "txSp"),
            uFill: new XName(aNs, "uFill"),
            uFillTx: new XName(aNs, "uFillTx"),
            uLn: new XName(aNs, "uLn"),
            uLnTx: new XName(aNs, "uLnTx"),
            up: new XName(aNs, "up"),
            useSpRect: new XName(aNs, "useSpRect"),
            videoFile: new XName(aNs, "videoFile"),
            wavAudioFile: new XName(aNs, "wavAudioFile"),
            wholeTbl: new XName(aNs, "wholeTbl"),
            xfrm: new XName(aNs, "xfrm"),
        }
        var A = openXml.A;

        openXml.a14Ns = new XNamespace("http://schemas.microsoft.com/office/drawing/2010/main");
        var a14Ns = openXml.a14Ns;
        openXml.A14 = {
            artisticChalkSketch: new XName(a14Ns, "artisticChalkSketch"),
            artisticGlass: new XName(a14Ns, "artisticGlass"),
            artisticGlowEdges: new XName(a14Ns, "artisticGlowEdges"),
            artisticLightScreen: new XName(a14Ns, "artisticLightScreen"),
            artisticPlasticWrap: new XName(a14Ns, "artisticPlasticWrap"),
            artisticTexturizer: new XName(a14Ns, "artisticTexturizer"),
            backgroundMark: new XName(a14Ns, "backgroundMark"),
            backgroundRemoval: new XName(a14Ns, "backgroundRemoval"),
            brightnessContrast: new XName(a14Ns, "brightnessContrast"),
            cameraTool: new XName(a14Ns, "cameraTool"),
            colorTemperature: new XName(a14Ns, "colorTemperature"),
            compatExt: new XName(a14Ns, "compatExt"),
            cpLocks: new XName(a14Ns, "cpLocks"),
            extLst: new XName(a14Ns, "extLst"),
            foregroundMark: new XName(a14Ns, "foregroundMark"),
            hiddenEffects: new XName(a14Ns, "hiddenEffects"),
            hiddenFill: new XName(a14Ns, "hiddenFill"),
            hiddenLine: new XName(a14Ns, "hiddenLine"),
            hiddenScene3d: new XName(a14Ns, "hiddenScene3d"),
            hiddenSp3d: new XName(a14Ns, "hiddenSp3d"),
            imgEffect: new XName(a14Ns, "imgEffect"),
            imgLayer: new XName(a14Ns, "imgLayer"),
            imgProps: new XName(a14Ns, "imgProps"),
            legacySpreadsheetColorIndex: new XName(a14Ns, "legacySpreadsheetColorIndex"),
            m: new XName(a14Ns, "m"),
            saturation: new XName(a14Ns, "saturation"),
            shadowObscured: new XName(a14Ns, "shadowObscured"),
            sharpenSoften: new XName(a14Ns, "sharpenSoften"),
            useLocalDpi: new XName(a14Ns, "useLocalDpi"),
        }
        var A14 = openXml.A14;

        openXml.cNs = new XNamespace("http://schemas.openxmlformats.org/drawingml/2006/chart");
        var cNs = openXml.cNs;
        openXml.C = {
            applyToEnd: new XName(cNs, "applyToEnd"),
            applyToFront: new XName(cNs, "applyToFront"),
            applyToSides: new XName(cNs, "applyToSides"),
            area3DChart: new XName(cNs, "area3DChart"),
            areaChart: new XName(cNs, "areaChart"),
            auto: new XName(cNs, "auto"),
            autoTitleDeleted: new XName(cNs, "autoTitleDeleted"),
            autoUpdate: new XName(cNs, "autoUpdate"),
            axId: new XName(cNs, "axId"),
            axPos: new XName(cNs, "axPos"),
            backWall: new XName(cNs, "backWall"),
            backward: new XName(cNs, "backward"),
            bandFmt: new XName(cNs, "bandFmt"),
            bandFmts: new XName(cNs, "bandFmts"),
            bar3DChart: new XName(cNs, "bar3DChart"),
            barChart: new XName(cNs, "barChart"),
            barDir: new XName(cNs, "barDir"),
            baseTimeUnit: new XName(cNs, "baseTimeUnit"),
            bubble3D: new XName(cNs, "bubble3D"),
            bubbleChart: new XName(cNs, "bubbleChart"),
            bubbleScale: new XName(cNs, "bubbleScale"),
            bubbleSize: new XName(cNs, "bubbleSize"),
            builtInUnit: new XName(cNs, "builtInUnit"),
            cat: new XName(cNs, "cat"),
            catAx: new XName(cNs, "catAx"),
            chart: new XName(cNs, "chart"),
            chartObject: new XName(cNs, "chartObject"),
            chartSpace: new XName(cNs, "chartSpace"),
            clrMapOvr: new XName(cNs, "clrMapOvr"),
            crossAx: new XName(cNs, "crossAx"),
            crossBetween: new XName(cNs, "crossBetween"),
            crosses: new XName(cNs, "crosses"),
            crossesAt: new XName(cNs, "crossesAt"),
            custSplit: new XName(cNs, "custSplit"),
            custUnit: new XName(cNs, "custUnit"),
            data: new XName(cNs, "data"),
            date1904: new XName(cNs, "date1904"),
            dateAx: new XName(cNs, "dateAx"),
            delete: new XName(cNs, "delete"),
            depthPercent: new XName(cNs, "depthPercent"),
            dispBlanksAs: new XName(cNs, "dispBlanksAs"),
            dispEq: new XName(cNs, "dispEq"),
            dispRSqr: new XName(cNs, "dispRSqr"),
            dispUnits: new XName(cNs, "dispUnits"),
            dispUnitsLbl: new XName(cNs, "dispUnitsLbl"),
            dLbl: new XName(cNs, "dLbl"),
            dLblPos: new XName(cNs, "dLblPos"),
            dLbls: new XName(cNs, "dLbls"),
            doughnutChart: new XName(cNs, "doughnutChart"),
            downBars: new XName(cNs, "downBars"),
            dPt: new XName(cNs, "dPt"),
            dropLines: new XName(cNs, "dropLines"),
            dTable: new XName(cNs, "dTable"),
            errBars: new XName(cNs, "errBars"),
            errBarType: new XName(cNs, "errBarType"),
            errDir: new XName(cNs, "errDir"),
            errValType: new XName(cNs, "errValType"),
            explosion: new XName(cNs, "explosion"),
            ext: new XName(cNs, "ext"),
            externalData: new XName(cNs, "externalData"),
            extLst: new XName(cNs, "extLst"),
            f: new XName(cNs, "f"),
            firstSliceAng: new XName(cNs, "firstSliceAng"),
            floor: new XName(cNs, "floor"),
            fmtId: new XName(cNs, "fmtId"),
            formatCode: new XName(cNs, "formatCode"),
            formatting: new XName(cNs, "formatting"),
            forward: new XName(cNs, "forward"),
            gapDepth: new XName(cNs, "gapDepth"),
            gapWidth: new XName(cNs, "gapWidth"),
            grouping: new XName(cNs, "grouping"),
            h: new XName(cNs, "h"),
            headerFooter: new XName(cNs, "headerFooter"),
            hiLowLines: new XName(cNs, "hiLowLines"),
            hMode: new XName(cNs, "hMode"),
            holeSize: new XName(cNs, "holeSize"),
            hPercent: new XName(cNs, "hPercent"),
            idx: new XName(cNs, "idx"),
            intercept: new XName(cNs, "intercept"),
            invertIfNegative: new XName(cNs, "invertIfNegative"),
            lang: new XName(cNs, "lang"),
            layout: new XName(cNs, "layout"),
            layoutTarget: new XName(cNs, "layoutTarget"),
            lblAlgn: new XName(cNs, "lblAlgn"),
            lblOffset: new XName(cNs, "lblOffset"),
            leaderLines: new XName(cNs, "leaderLines"),
            legend: new XName(cNs, "legend"),
            legendEntry: new XName(cNs, "legendEntry"),
            legendPos: new XName(cNs, "legendPos"),
            line3DChart: new XName(cNs, "line3DChart"),
            lineChart: new XName(cNs, "lineChart"),
            logBase: new XName(cNs, "logBase"),
            lvl: new XName(cNs, "lvl"),
            majorGridlines: new XName(cNs, "majorGridlines"),
            majorTickMark: new XName(cNs, "majorTickMark"),
            majorTimeUnit: new XName(cNs, "majorTimeUnit"),
            majorUnit: new XName(cNs, "majorUnit"),
            manualLayout: new XName(cNs, "manualLayout"),
            marker: new XName(cNs, "marker"),
            max: new XName(cNs, "max"),
            min: new XName(cNs, "min"),
            minorGridlines: new XName(cNs, "minorGridlines"),
            minorTickMark: new XName(cNs, "minorTickMark"),
            minorTimeUnit: new XName(cNs, "minorTimeUnit"),
            minorUnit: new XName(cNs, "minorUnit"),
            minus: new XName(cNs, "minus"),
            multiLvlStrCache: new XName(cNs, "multiLvlStrCache"),
            multiLvlStrRef: new XName(cNs, "multiLvlStrRef"),
            name: new XName(cNs, "name"),
            noEndCap: new XName(cNs, "noEndCap"),
            noMultiLvlLbl: new XName(cNs, "noMultiLvlLbl"),
            numCache: new XName(cNs, "numCache"),
            numFmt: new XName(cNs, "numFmt"),
            numLit: new XName(cNs, "numLit"),
            numRef: new XName(cNs, "numRef"),
            oddFooter: new XName(cNs, "oddFooter"),
            oddHeader: new XName(cNs, "oddHeader"),
            ofPieChart: new XName(cNs, "ofPieChart"),
            ofPieType: new XName(cNs, "ofPieType"),
            order: new XName(cNs, "order"),
            orientation: new XName(cNs, "orientation"),
            overlap: new XName(cNs, "overlap"),
            overlay: new XName(cNs, "overlay"),
            pageMargins: new XName(cNs, "pageMargins"),
            pageSetup: new XName(cNs, "pageSetup"),
            period: new XName(cNs, "period"),
            perspective: new XName(cNs, "perspective"),
            pictureFormat: new XName(cNs, "pictureFormat"),
            pictureOptions: new XName(cNs, "pictureOptions"),
            pictureStackUnit: new XName(cNs, "pictureStackUnit"),
            pie3DChart: new XName(cNs, "pie3DChart"),
            pieChart: new XName(cNs, "pieChart"),
            pivotFmt: new XName(cNs, "pivotFmt"),
            pivotFmts: new XName(cNs, "pivotFmts"),
            pivotSource: new XName(cNs, "pivotSource"),
            plotArea: new XName(cNs, "plotArea"),
            plotVisOnly: new XName(cNs, "plotVisOnly"),
            plus: new XName(cNs, "plus"),
            printSettings: new XName(cNs, "printSettings"),
            protection: new XName(cNs, "protection"),
            pt: new XName(cNs, "pt"),
            ptCount: new XName(cNs, "ptCount"),
            radarChart: new XName(cNs, "radarChart"),
            radarStyle: new XName(cNs, "radarStyle"),
            rAngAx: new XName(cNs, "rAngAx"),
            rich: new XName(cNs, "rich"),
            rotX: new XName(cNs, "rotX"),
            rotY: new XName(cNs, "rotY"),
            roundedCorners: new XName(cNs, "roundedCorners"),
            scaling: new XName(cNs, "scaling"),
            scatterChart: new XName(cNs, "scatterChart"),
            scatterStyle: new XName(cNs, "scatterStyle"),
            secondPiePt: new XName(cNs, "secondPiePt"),
            secondPieSize: new XName(cNs, "secondPieSize"),
            selection: new XName(cNs, "selection"),
            separator: new XName(cNs, "separator"),
            ser: new XName(cNs, "ser"),
            serAx: new XName(cNs, "serAx"),
            serLines: new XName(cNs, "serLines"),
            shape: new XName(cNs, "shape"),
            showBubbleSize: new XName(cNs, "showBubbleSize"),
            showCatName: new XName(cNs, "showCatName"),
            showDLblsOverMax: new XName(cNs, "showDLblsOverMax"),
            showHorzBorder: new XName(cNs, "showHorzBorder"),
            showKeys: new XName(cNs, "showKeys"),
            showLeaderLines: new XName(cNs, "showLeaderLines"),
            showLegendKey: new XName(cNs, "showLegendKey"),
            showNegBubbles: new XName(cNs, "showNegBubbles"),
            showOutline: new XName(cNs, "showOutline"),
            showPercent: new XName(cNs, "showPercent"),
            showSerName: new XName(cNs, "showSerName"),
            showVal: new XName(cNs, "showVal"),
            showVertBorder: new XName(cNs, "showVertBorder"),
            sideWall: new XName(cNs, "sideWall"),
            size: new XName(cNs, "size"),
            sizeRepresents: new XName(cNs, "sizeRepresents"),
            smooth: new XName(cNs, "smooth"),
            splitPos: new XName(cNs, "splitPos"),
            splitType: new XName(cNs, "splitType"),
            spPr: new XName(cNs, "spPr"),
            stockChart: new XName(cNs, "stockChart"),
            strCache: new XName(cNs, "strCache"),
            strLit: new XName(cNs, "strLit"),
            strRef: new XName(cNs, "strRef"),
            style: new XName(cNs, "style"),
            surface3DChart: new XName(cNs, "surface3DChart"),
            surfaceChart: new XName(cNs, "surfaceChart"),
            symbol: new XName(cNs, "symbol"),
            thickness: new XName(cNs, "thickness"),
            tickLblPos: new XName(cNs, "tickLblPos"),
            tickLblSkip: new XName(cNs, "tickLblSkip"),
            tickMarkSkip: new XName(cNs, "tickMarkSkip"),
            title: new XName(cNs, "title"),
            trendline: new XName(cNs, "trendline"),
            trendlineLbl: new XName(cNs, "trendlineLbl"),
            trendlineType: new XName(cNs, "trendlineType"),
            tx: new XName(cNs, "tx"),
            txPr: new XName(cNs, "txPr"),
            upBars: new XName(cNs, "upBars"),
            upDownBars: new XName(cNs, "upDownBars"),
            userInterface: new XName(cNs, "userInterface"),
            userShapes: new XName(cNs, "userShapes"),
            v: new XName(cNs, "v"),
            val: new XName(cNs, "val"),
            valAx: new XName(cNs, "valAx"),
            varyColors: new XName(cNs, "varyColors"),
            view3D: new XName(cNs, "view3D"),
            w: new XName(cNs, "w"),
            wireframe: new XName(cNs, "wireframe"),
            wMode: new XName(cNs, "wMode"),
            x: new XName(cNs, "x"),
            xMode: new XName(cNs, "xMode"),
            xVal: new XName(cNs, "xVal"),
            y: new XName(cNs, "y"),
            yMode: new XName(cNs, "yMode"),
            yVal: new XName(cNs, "yVal"),
        }
        var C = openXml.C;

        openXml.cdrNs = new XNamespace("http://schemas.openxmlformats.org/drawingml/2006/chartDrawing");
        var cdrNs = openXml.cdrNs;
        openXml.CDR = {
            absSizeAnchor: new XName(cdrNs, "absSizeAnchor"),
            blipFill: new XName(cdrNs, "blipFill"),
            cNvCxnSpPr: new XName(cdrNs, "cNvCxnSpPr"),
            cNvGraphicFramePr: new XName(cdrNs, "cNvGraphicFramePr"),
            cNvGrpSpPr: new XName(cdrNs, "cNvGrpSpPr"),
            cNvPicPr: new XName(cdrNs, "cNvPicPr"),
            cNvPr: new XName(cdrNs, "cNvPr"),
            cNvSpPr: new XName(cdrNs, "cNvSpPr"),
            cxnSp: new XName(cdrNs, "cxnSp"),
            ext: new XName(cdrNs, "ext"),
            from: new XName(cdrNs, "from"),
            graphicFrame: new XName(cdrNs, "graphicFrame"),
            grpSp: new XName(cdrNs, "grpSp"),
            grpSpPr: new XName(cdrNs, "grpSpPr"),
            nvCxnSpPr: new XName(cdrNs, "nvCxnSpPr"),
            nvGraphicFramePr: new XName(cdrNs, "nvGraphicFramePr"),
            nvGrpSpPr: new XName(cdrNs, "nvGrpSpPr"),
            nvPicPr: new XName(cdrNs, "nvPicPr"),
            nvSpPr: new XName(cdrNs, "nvSpPr"),
            pic: new XName(cdrNs, "pic"),
            relSizeAnchor: new XName(cdrNs, "relSizeAnchor"),
            sp: new XName(cdrNs, "sp"),
            spPr: new XName(cdrNs, "spPr"),
            style: new XName(cdrNs, "style"),
            to: new XName(cdrNs, "to"),
            txBody: new XName(cdrNs, "txBody"),
            x: new XName(cdrNs, "x"),
            xfrm: new XName(cdrNs, "xfrm"),
            y: new XName(cdrNs, "y"),
        }
        var CDR = openXml.CDR;

        openXml.comNs = new XNamespace("http://schemas.openxmlformats.org/drawingml/2006/compatibility");
        var comNs = openXml.comNs;
        openXml.COM = {
            legacyDrawing: new XName(comNs, "legacyDrawing"),
        }
        var COM = openXml.COM;

        openXml.cpNs = new XNamespace("http://schemas.openxmlformats.org/package/2006/metadata/core-properties");
        var cpNs = openXml.cpNs;
        openXml.CP = {
            category: new XName(cpNs, "category"),
            contentStatus: new XName(cpNs, "contentStatus"),
            contentType: new XName(cpNs, "contentType"),
            coreProperties: new XName(cpNs, "coreProperties"),
            keywords: new XName(cpNs, "keywords"),
            lastModifiedBy: new XName(cpNs, "lastModifiedBy"),
            lastPrinted: new XName(cpNs, "lastPrinted"),
            revision: new XName(cpNs, "revision"),
        }
        var CP = openXml.CP;

        openXml.custproNs = new XNamespace("http://schemas.openxmlformats.org/officeDocument/2006/custom-properties");
        var custproNs = openXml.custproNs;
        openXml.CUSTPRO = {
            Properties: new XName(custproNs, "Properties"),
            property: new XName(custproNs, "property"),
        }
        var CUSTPRO = openXml.CUSTPRO;

        openXml.dcNs = new XNamespace("http://purl.org/dc/elements/1.1/");
        var dcNs = openXml.dcNs;
        openXml.DC = {
            creator: new XName(dcNs, "creator"),
            description: new XName(dcNs, "description"),
            subject: new XName(dcNs, "subject"),
            title: new XName(dcNs, "title"),
        }
        var DC = openXml.DC;

        openXml.dctermsNs = new XNamespace("http://purl.org/dc/terms/");
        var dctermsNs = openXml.dctermsNs;
        openXml.DCTERMS = {
            created: new XName(dctermsNs, "created"),
            modified: new XName(dctermsNs, "modified"),
        }
        var DCTERMS = openXml.DCTERMS;

        openXml.dgmNs = new XNamespace("http://schemas.openxmlformats.org/drawingml/2006/diagram");
        var dgmNs = openXml.dgmNs;
        openXml.DGM = {
            adj: new XName(dgmNs, "adj"),
            adjLst: new XName(dgmNs, "adjLst"),
            alg: new XName(dgmNs, "alg"),
            animLvl: new XName(dgmNs, "animLvl"),
            animOne: new XName(dgmNs, "animOne"),
            bg: new XName(dgmNs, "bg"),
            bulletEnabled: new XName(dgmNs, "bulletEnabled"),
            cat: new XName(dgmNs, "cat"),
            catLst: new XName(dgmNs, "catLst"),
            chMax: new XName(dgmNs, "chMax"),
            choose: new XName(dgmNs, "choose"),
            chPref: new XName(dgmNs, "chPref"),
            clrData: new XName(dgmNs, "clrData"),
            colorsDef: new XName(dgmNs, "colorsDef"),
            constr: new XName(dgmNs, "constr"),
            constrLst: new XName(dgmNs, "constrLst"),
            cxn: new XName(dgmNs, "cxn"),
            cxnLst: new XName(dgmNs, "cxnLst"),
            dataModel: new XName(dgmNs, "dataModel"),
            desc: new XName(dgmNs, "desc"),
            dir: new XName(dgmNs, "dir"),
            effectClrLst: new XName(dgmNs, "effectClrLst"),
            _else: new XName(dgmNs, "else"),
            extLst: new XName(dgmNs, "extLst"),
            fillClrLst: new XName(dgmNs, "fillClrLst"),
            forEach: new XName(dgmNs, "forEach"),
            hierBranch: new XName(dgmNs, "hierBranch"),
            _if: new XName(dgmNs, "if"),
            layoutDef: new XName(dgmNs, "layoutDef"),
            layoutNode: new XName(dgmNs, "layoutNode"),
            linClrLst: new XName(dgmNs, "linClrLst"),
            orgChart: new XName(dgmNs, "orgChart"),
            param: new XName(dgmNs, "param"),
            presLayoutVars: new XName(dgmNs, "presLayoutVars"),
            presOf: new XName(dgmNs, "presOf"),
            prSet: new XName(dgmNs, "prSet"),
            pt: new XName(dgmNs, "pt"),
            ptLst: new XName(dgmNs, "ptLst"),
            relIds: new XName(dgmNs, "relIds"),
            resizeHandles: new XName(dgmNs, "resizeHandles"),
            rule: new XName(dgmNs, "rule"),
            ruleLst: new XName(dgmNs, "ruleLst"),
            sampData: new XName(dgmNs, "sampData"),
            scene3d: new XName(dgmNs, "scene3d"),
            shape: new XName(dgmNs, "shape"),
            sp3d: new XName(dgmNs, "sp3d"),
            spPr: new XName(dgmNs, "spPr"),
            style: new XName(dgmNs, "style"),
            styleData: new XName(dgmNs, "styleData"),
            styleDef: new XName(dgmNs, "styleDef"),
            styleLbl: new XName(dgmNs, "styleLbl"),
            t: new XName(dgmNs, "t"),
            title: new XName(dgmNs, "title"),
            txEffectClrLst: new XName(dgmNs, "txEffectClrLst"),
            txFillClrLst: new XName(dgmNs, "txFillClrLst"),
            txLinClrLst: new XName(dgmNs, "txLinClrLst"),
            txPr: new XName(dgmNs, "txPr"),
            varLst: new XName(dgmNs, "varLst"),
            whole: new XName(dgmNs, "whole"),
        }
        var DGM = openXml.DGM;

        openXml.dgm14Ns = new XNamespace("http://schemas.microsoft.com/office/drawing/2010/diagram");
        var dgm14Ns = openXml.dgm14Ns;
        openXml.DGM14 = {
            cNvPr: new XName(dgm14Ns, "cNvPr"),
            recolorImg: new XName(dgm14Ns, "recolorImg"),
        }
        var DGM14 = openXml.DGM14;

        openXml.digsigNs = new XNamespace("http://schemas.microsoft.com/office/2006/digsig");
        var digsigNs = openXml.digsigNs;
        openXml.DIGSIG = {
            ApplicationVersion: new XName(digsigNs, "ApplicationVersion"),
            ColorDepth: new XName(digsigNs, "ColorDepth"),
            HorizontalResolution: new XName(digsigNs, "HorizontalResolution"),
            ManifestHashAlgorithm: new XName(digsigNs, "ManifestHashAlgorithm"),
            Monitors: new XName(digsigNs, "Monitors"),
            OfficeVersion: new XName(digsigNs, "OfficeVersion"),
            SetupID: new XName(digsigNs, "SetupID"),
            SignatureComments: new XName(digsigNs, "SignatureComments"),
            SignatureImage: new XName(digsigNs, "SignatureImage"),
            SignatureInfoV1: new XName(digsigNs, "SignatureInfoV1"),
            SignatureProviderDetails: new XName(digsigNs, "SignatureProviderDetails"),
            SignatureProviderId: new XName(digsigNs, "SignatureProviderId"),
            SignatureProviderUrl: new XName(digsigNs, "SignatureProviderUrl"),
            SignatureText: new XName(digsigNs, "SignatureText"),
            SignatureType: new XName(digsigNs, "SignatureType"),
            VerticalResolution: new XName(digsigNs, "VerticalResolution"),
            WindowsVersion: new XName(digsigNs, "WindowsVersion"),
        }
        var DIGSIG = openXml.DIGSIG;

        openXml.dsNs = new XNamespace("http://schemas.openxmlformats.org/officeDocument/2006/customXml");
        var dsNs = openXml.dsNs;
        openXml.DS = {
            datastoreItem: new XName(dsNs, "datastoreItem"),
            itemID: new XName(dsNs, "itemID"),
            schemaRef: new XName(dsNs, "schemaRef"),
            schemaRefs: new XName(dsNs, "schemaRefs"),
            uri: new XName(dsNs, "uri"),
        }
        var DS = openXml.DS;

        openXml.dspNs = new XNamespace("http://schemas.microsoft.com/office/drawing/2008/diagram");
        var dspNs = openXml.dspNs;
        openXml.DSP = {
            dataModelExt: new XName(dspNs, "dataModelExt"),
        }
        var DSP = openXml.DSP;

        openXml.epNs = new XNamespace("http://schemas.openxmlformats.org/officeDocument/2006/extended-properties");
        var epNs = openXml.epNs;
        openXml.EP = {
            Application: new XName(epNs, "Application"),
            AppVersion: new XName(epNs, "AppVersion"),
            Characters: new XName(epNs, "Characters"),
            CharactersWithSpaces: new XName(epNs, "CharactersWithSpaces"),
            Company: new XName(epNs, "Company"),
            DocSecurity: new XName(epNs, "DocSecurity"),
            HeadingPairs: new XName(epNs, "HeadingPairs"),
            HiddenSlides: new XName(epNs, "HiddenSlides"),
            HLinks: new XName(epNs, "HLinks"),
            HyperlinkBase: new XName(epNs, "HyperlinkBase"),
            HyperlinksChanged: new XName(epNs, "HyperlinksChanged"),
            Lines: new XName(epNs, "Lines"),
            LinksUpToDate: new XName(epNs, "LinksUpToDate"),
            Manager: new XName(epNs, "Manager"),
            MMClips: new XName(epNs, "MMClips"),
            Notes: new XName(epNs, "Notes"),
            Pages: new XName(epNs, "Pages"),
            Paragraphs: new XName(epNs, "Paragraphs"),
            PresentationFormat: new XName(epNs, "PresentationFormat"),
            Properties: new XName(epNs, "Properties"),
            ScaleCrop: new XName(epNs, "ScaleCrop"),
            SharedDoc: new XName(epNs, "SharedDoc"),
            Slides: new XName(epNs, "Slides"),
            Template: new XName(epNs, "Template"),
            TitlesOfParts: new XName(epNs, "TitlesOfParts"),
            TotalTime: new XName(epNs, "TotalTime"),
            Words: new XName(epNs, "Words"),
        }
        var EP = openXml.EP;

        openXml.lcNs = new XNamespace("http://schemas.openxmlformats.org/drawingml/2006/lockedCanvas");
        var lcNs = openXml.lcNs;
        openXml.LC = {
            lockedCanvas: new XName(lcNs, "lockedCanvas"),
        }
        var LC = openXml.LC;

        openXml.mNs = new XNamespace("http://schemas.openxmlformats.org/officeDocument/2006/math");
        var mNs = openXml.mNs;
        openXml.M = {
            acc: new XName(mNs, "acc"),
            accPr: new XName(mNs, "accPr"),
            aln: new XName(mNs, "aln"),
            alnAt: new XName(mNs, "alnAt"),
            alnScr: new XName(mNs, "alnScr"),
            argPr: new XName(mNs, "argPr"),
            argSz: new XName(mNs, "argSz"),
            bar: new XName(mNs, "bar"),
            barPr: new XName(mNs, "barPr"),
            baseJc: new XName(mNs, "baseJc"),
            begChr: new XName(mNs, "begChr"),
            borderBox: new XName(mNs, "borderBox"),
            borderBoxPr: new XName(mNs, "borderBoxPr"),
            box: new XName(mNs, "box"),
            boxPr: new XName(mNs, "boxPr"),
            brk: new XName(mNs, "brk"),
            brkBin: new XName(mNs, "brkBin"),
            brkBinSub: new XName(mNs, "brkBinSub"),
            cGp: new XName(mNs, "cGp"),
            cGpRule: new XName(mNs, "cGpRule"),
            chr: new XName(mNs, "chr"),
            count: new XName(mNs, "count"),
            cSp: new XName(mNs, "cSp"),
            ctrlPr: new XName(mNs, "ctrlPr"),
            d: new XName(mNs, "d"),
            defJc: new XName(mNs, "defJc"),
            deg: new XName(mNs, "deg"),
            degHide: new XName(mNs, "degHide"),
            den: new XName(mNs, "den"),
            diff: new XName(mNs, "diff"),
            dispDef: new XName(mNs, "dispDef"),
            dPr: new XName(mNs, "dPr"),
            e: new XName(mNs, "e"),
            endChr: new XName(mNs, "endChr"),
            eqArr: new XName(mNs, "eqArr"),
            eqArrPr: new XName(mNs, "eqArrPr"),
            f: new XName(mNs, "f"),
            fName: new XName(mNs, "fName"),
            fPr: new XName(mNs, "fPr"),
            func: new XName(mNs, "func"),
            funcPr: new XName(mNs, "funcPr"),
            groupChr: new XName(mNs, "groupChr"),
            groupChrPr: new XName(mNs, "groupChrPr"),
            grow: new XName(mNs, "grow"),
            hideBot: new XName(mNs, "hideBot"),
            hideLeft: new XName(mNs, "hideLeft"),
            hideRight: new XName(mNs, "hideRight"),
            hideTop: new XName(mNs, "hideTop"),
            interSp: new XName(mNs, "interSp"),
            intLim: new XName(mNs, "intLim"),
            intraSp: new XName(mNs, "intraSp"),
            jc: new XName(mNs, "jc"),
            lim: new XName(mNs, "lim"),
            limLoc: new XName(mNs, "limLoc"),
            limLow: new XName(mNs, "limLow"),
            limLowPr: new XName(mNs, "limLowPr"),
            limUpp: new XName(mNs, "limUpp"),
            limUppPr: new XName(mNs, "limUppPr"),
            lit: new XName(mNs, "lit"),
            lMargin: new XName(mNs, "lMargin"),
            _m: new XName(mNs, "m"),
            mathFont: new XName(mNs, "mathFont"),
            mathPr: new XName(mNs, "mathPr"),
            maxDist: new XName(mNs, "maxDist"),
            mc: new XName(mNs, "mc"),
            mcJc: new XName(mNs, "mcJc"),
            mcPr: new XName(mNs, "mcPr"),
            mcs: new XName(mNs, "mcs"),
            mPr: new XName(mNs, "mPr"),
            mr: new XName(mNs, "mr"),
            nary: new XName(mNs, "nary"),
            naryLim: new XName(mNs, "naryLim"),
            naryPr: new XName(mNs, "naryPr"),
            noBreak: new XName(mNs, "noBreak"),
            nor: new XName(mNs, "nor"),
            num: new XName(mNs, "num"),
            objDist: new XName(mNs, "objDist"),
            oMath: new XName(mNs, "oMath"),
            oMathPara: new XName(mNs, "oMathPara"),
            oMathParaPr: new XName(mNs, "oMathParaPr"),
            opEmu: new XName(mNs, "opEmu"),
            phant: new XName(mNs, "phant"),
            phantPr: new XName(mNs, "phantPr"),
            plcHide: new XName(mNs, "plcHide"),
            pos: new XName(mNs, "pos"),
            postSp: new XName(mNs, "postSp"),
            preSp: new XName(mNs, "preSp"),
            r: new XName(mNs, "r"),
            rad: new XName(mNs, "rad"),
            radPr: new XName(mNs, "radPr"),
            rMargin: new XName(mNs, "rMargin"),
            rPr: new XName(mNs, "rPr"),
            rSp: new XName(mNs, "rSp"),
            rSpRule: new XName(mNs, "rSpRule"),
            scr: new XName(mNs, "scr"),
            sepChr: new XName(mNs, "sepChr"),
            show: new XName(mNs, "show"),
            shp: new XName(mNs, "shp"),
            smallFrac: new XName(mNs, "smallFrac"),
            sPre: new XName(mNs, "sPre"),
            sPrePr: new XName(mNs, "sPrePr"),
            sSub: new XName(mNs, "sSub"),
            sSubPr: new XName(mNs, "sSubPr"),
            sSubSup: new XName(mNs, "sSubSup"),
            sSubSupPr: new XName(mNs, "sSubSupPr"),
            sSup: new XName(mNs, "sSup"),
            sSupPr: new XName(mNs, "sSupPr"),
            strikeBLTR: new XName(mNs, "strikeBLTR"),
            strikeH: new XName(mNs, "strikeH"),
            strikeTLBR: new XName(mNs, "strikeTLBR"),
            strikeV: new XName(mNs, "strikeV"),
            sty: new XName(mNs, "sty"),
            sub: new XName(mNs, "sub"),
            subHide: new XName(mNs, "subHide"),
            sup: new XName(mNs, "sup"),
            supHide: new XName(mNs, "supHide"),
            t: new XName(mNs, "t"),
            transp: new XName(mNs, "transp"),
            type: new XName(mNs, "type"),
            val: new XName(mNs, "val"),
            vertJc: new XName(mNs, "vertJc"),
            wrapIndent: new XName(mNs, "wrapIndent"),
            wrapRight: new XName(mNs, "wrapRight"),
            zeroAsc: new XName(mNs, "zeroAsc"),
            zeroDesc: new XName(mNs, "zeroDesc"),
            zeroWid: new XName(mNs, "zeroWid"),
        }
        var M = openXml.M;

        openXml.mcNs = new XNamespace("http://schemas.openxmlformats.org/markup-compatibility/2006");
        var mcNs = openXml.mcNs;
        openXml.MC = {
            AlternateContent: new XName(mcNs, "AlternateContent"),
            Choice: new XName(mcNs, "Choice"),
            Fallback: new XName(mcNs, "Fallback"),
            Ignorable: new XName(mcNs, "Ignorable"),
            PreserveAttributes: new XName(mcNs, "PreserveAttributes"),
        }
        var MC = openXml.MC;

        openXml.mdssiNs = new XNamespace("http://schemas.openxmlformats.org/package/2006/digital-signature");
        var mdssiNs = openXml.mdssiNs;
        openXml.MDSSI = {
            Format: new XName(mdssiNs, "Format"),
            RelationshipReference: new XName(mdssiNs, "RelationshipReference"),
            SignatureTime: new XName(mdssiNs, "SignatureTime"),
            Value: new XName(mdssiNs, "Value"),
        }
        var MDSSI = openXml.MDSSI;

        openXml.mpNs = new XNamespace("http://schemas.microsoft.com/office/mac/powerpoint/2008/main");
        var mpNs = openXml.mpNs;
        openXml.MP = {
            cube: new XName(mpNs, "cube"),
            flip: new XName(mpNs, "flip"),
            transition: new XName(mpNs, "transition"),
        }
        var MP = openXml.MP;

        openXml.mvNs = new XNamespace("urn:schemas-microsoft-com:mac:vml");
        var mvNs = openXml.mvNs;
        openXml.MV = {
            blur: new XName(mvNs, "blur"),
            complextextbox: new XName(mvNs, "complextextbox"),
        }
        var MV = openXml.MV;

        openXml.NoNamespace = {
            a: new XName("a"),
            accent1: new XName("accent1"),
            accent2: new XName("accent2"),
            accent3: new XName("accent3"),
            accent4: new XName("accent4"),
            accent5: new XName("accent5"),
            accent6: new XName("accent6"),
            action: new XName("action"),
            activeCell: new XName("activeCell"),
            activeCol: new XName("activeCol"),
            activePane: new XName("activePane"),
            activeRow: new XName("activeRow"),
            advise: new XName("advise"),
            algn: new XName("algn"),
            Algorithm: new XName("Algorithm"),
            alignWithMargins: new XName("alignWithMargins"),
            allowcomments: new XName("allowcomments"),
            allowOverlap: new XName("allowOverlap"),
            allUniqueName: new XName("allUniqueName"),
            alt: new XName("alt"),
            alwaysShow: new XName("alwaysShow"),
            amount: new XName("amount"),
            amt: new XName("amt"),
            anchor: new XName("anchor"),
            anchorCtr: new XName("anchorCtr"),
            ang: new XName("ang"),
            animBg: new XName("animBg"),
            annotation: new XName("annotation"),
            applyAlignment: new XName("applyAlignment"),
            applyAlignmentFormats: new XName("applyAlignmentFormats"),
            applyBorder: new XName("applyBorder"),
            applyBorderFormats: new XName("applyBorderFormats"),
            applyFill: new XName("applyFill"),
            applyFont: new XName("applyFont"),
            applyFontFormats: new XName("applyFontFormats"),
            applyNumberFormat: new XName("applyNumberFormat"),
            applyNumberFormats: new XName("applyNumberFormats"),
            applyPatternFormats: new XName("applyPatternFormats"),
            applyProtection: new XName("applyProtection"),
            applyWidthHeightFormats: new XName("applyWidthHeightFormats"),
            arcsize: new XName("arcsize"),
            arg: new XName("arg"),
            aspectratio: new XName("aspectratio"),
            assign: new XName("assign"),
            attribute: new XName("attribute"),
            author: new XName("author"),
            authorId: new XName("authorId"),
            auto: new XName("auto"),
            autoEnd: new XName("autoEnd"),
            autoFormatId: new XName("autoFormatId"),
            autoLine: new XName("autoLine"),
            autoStart: new XName("autoStart"),
            axis: new XName("axis"),
            b: new XName("b"),
            backdepth: new XName("backdepth"),
            bandRow: new XName("bandRow"),
            _base: new XName("base"),
            baseField: new XName("baseField"),
            baseItem: new XName("baseItem"),
            baseline: new XName("baseline"),
            baseType: new XName("baseType"),
            behindDoc: new XName("behindDoc"),
            bestFit: new XName("bestFit"),
            bg1: new XName("bg1"),
            bg2: new XName("bg2"),
            bIns: new XName("bIns"),
            bld: new XName("bld"),
            bldStep: new XName("bldStep"),
            blend: new XName("blend"),
            blurRad: new XName("blurRad"),
            bmkName: new XName("bmkName"),
            borderId: new XName("borderId"),
            bottom: new XName("bottom"),
            bright: new XName("bright"),
            brightness: new XName("brightness"),
            builtinId: new XName("builtinId"),
            bwMode: new XName("bwMode"),
            by: new XName("by"),
            c: new XName("c"),
            cacheId: new XName("cacheId"),
            cacheIndex: new XName("cacheIndex"),
            calcmode: new XName("calcmode"),
            cap: new XName("cap"),
            caption: new XName("caption"),
            categoryIdx: new XName("categoryIdx"),
            cell: new XName("cell"),
            cellColor: new XName("cellColor"),
            cellRange: new XName("cellRange"),
            _char: new XName("char"),
            charset: new XName("charset"),
            chart: new XName("chart"),
            clearComments: new XName("clearComments"),
            clearFormats: new XName("clearFormats"),
            click: new XName("click"),
            clientInsertedTime: new XName("clientInsertedTime"),
            clrIdx: new XName("clrIdx"),
            clrSpc: new XName("clrSpc"),
            cmd: new XName("cmd"),
            cmpd: new XName("cmpd"),
            codeName: new XName("codeName"),
            coerce: new XName("coerce"),
            colId: new XName("colId"),
            color: new XName("color"),
            colors: new XName("colors"),
            colorTemp: new XName("colorTemp"),
            colPageCount: new XName("colPageCount"),
            cols: new XName("cols"),
            comma: new XName("comma"),
            command: new XName("command"),
            commandType: new XName("commandType"),
            comment: new XName("comment"),
            compatLnSpc: new XName("compatLnSpc"),
            concurrent: new XName("concurrent"),
            connection: new XName("connection"),
            connectionId: new XName("connectionId"),
            connectloc: new XName("connectloc"),
            consecutive: new XName("consecutive"),
            constrainbounds: new XName("constrainbounds"),
            containsInteger: new XName("containsInteger"),
            containsNumber: new XName("containsNumber"),
            containsSemiMixedTypes: new XName("containsSemiMixedTypes"),
            containsString: new XName("containsString"),
            contrast: new XName("contrast"),
            control1: new XName("control1"),
            control2: new XName("control2"),
            coordorigin: new XName("coordorigin"),
            coordsize: new XName("coordsize"),
            copy: new XName("copy"),
            count: new XName("count"),
            createdVersion: new XName("createdVersion"),
            cryptAlgorithmClass: new XName("cryptAlgorithmClass"),
            cryptAlgorithmSid: new XName("cryptAlgorithmSid"),
            cryptAlgorithmType: new XName("cryptAlgorithmType"),
            cryptProviderType: new XName("cryptProviderType"),
            csCatId: new XName("csCatId"),
            cstate: new XName("cstate"),
            csTypeId: new XName("csTypeId"),
            culture: new XName("culture"),
            current: new XName("current"),
            customFormat: new XName("customFormat"),
            customList: new XName("customList"),
            customWidth: new XName("customWidth"),
            cx: new XName("cx"),
            cy: new XName("cy"),
            d: new XName("d"),
            data: new XName("data"),
            dataCaption: new XName("dataCaption"),
            dataDxfId: new XName("dataDxfId"),
            dataField: new XName("dataField"),
            dateTime: new XName("dateTime"),
            dateTimeGrouping: new XName("dateTimeGrouping"),
            dde: new XName("dde"),
            ddeService: new XName("ddeService"),
            ddeTopic: new XName("ddeTopic"),
            def: new XName("def"),
            defaultMemberUniqueName: new XName("defaultMemberUniqueName"),
            defaultPivotStyle: new XName("defaultPivotStyle"),
            defaultRowHeight: new XName("defaultRowHeight"),
            defaultSize: new XName("defaultSize"),
            defaultTableStyle: new XName("defaultTableStyle"),
            defStyle: new XName("defStyle"),
            defTabSz: new XName("defTabSz"),
            degree: new XName("degree"),
            delay: new XName("delay"),
            descending: new XName("descending"),
            descr: new XName("descr"),
            destId: new XName("destId"),
            destination: new XName("destination"),
            destinationFile: new XName("destinationFile"),
            destOrd: new XName("destOrd"),
            dgmfontsize: new XName("dgmfontsize"),
            dgmstyle: new XName("dgmstyle"),
            diagonalDown: new XName("diagonalDown"),
            diagonalUp: new XName("diagonalUp"),
            dimension: new XName("dimension"),
            dimensionUniqueName: new XName("dimensionUniqueName"),
            dir: new XName("dir"),
            dirty: new XName("dirty"),
            display: new XName("display"),
            displayFolder: new XName("displayFolder"),
            displayName: new XName("displayName"),
            dist: new XName("dist"),
            distB: new XName("distB"),
            distL: new XName("distL"),
            distR: new XName("distR"),
            distT: new XName("distT"),
            divId: new XName("divId"),
            dpi: new XName("dpi"),
            dr: new XName("dr"),
            DrawAspect: new XName("DrawAspect"),
            dt: new XName("dt"),
            dur: new XName("dur"),
            dx: new XName("dx"),
            dxfId: new XName("dxfId"),
            dy: new XName("dy"),
            dz: new XName("dz"),
            eaLnBrk: new XName("eaLnBrk"),
            eb: new XName("eb"),
            edited: new XName("edited"),
            editPage: new XName("editPage"),
            end: new XName("end"),
            endA: new XName("endA"),
            endangle: new XName("endangle"),
            endDate: new XName("endDate"),
            endPos: new XName("endPos"),
            endSnd: new XName("endSnd"),
            eqn: new XName("eqn"),
            evalOrder: new XName("evalOrder"),
            evt: new XName("evt"),
            exp: new XName("exp"),
            extProperty: new XName("extProperty"),
            f: new XName("f"),
            fact: new XName("fact"),
            field: new XName("field"),
            fieldId: new XName("fieldId"),
            fieldListSortAscending: new XName("fieldListSortAscending"),
            fieldPosition: new XName("fieldPosition"),
            fileType: new XName("fileType"),
            fillcolor: new XName("fillcolor"),
            filled: new XName("filled"),
            fillId: new XName("fillId"),
            filter: new XName("filter"),
            filterVal: new XName("filterVal"),
            first: new XName("first"),
            firstDataCol: new XName("firstDataCol"),
            firstDataRow: new XName("firstDataRow"),
            firstHeaderRow: new XName("firstHeaderRow"),
            firstRow: new XName("firstRow"),
            fitshape: new XName("fitshape"),
            fitToPage: new XName("fitToPage"),
            fld: new XName("fld"),
            flip: new XName("flip"),
            fmla: new XName("fmla"),
            fmtid: new XName("fmtid"),
            folHlink: new XName("folHlink"),
            followColorScheme: new XName("followColorScheme"),
            fontId: new XName("fontId"),
            footer: new XName("footer"),
            _for: new XName("for"),
            forceAA: new XName("forceAA"),
            format: new XName("format"),
            formatCode: new XName("formatCode"),
            formula: new XName("formula"),
            forName: new XName("forName"),
            fov: new XName("fov"),
            frame: new XName("frame"),
            from: new XName("from"),
            fromWordArt: new XName("fromWordArt"),
            fullCalcOnLoad: new XName("fullCalcOnLoad"),
            func: new XName("func"),
            g: new XName("g"),
            gdRefAng: new XName("gdRefAng"),
            gdRefR: new XName("gdRefR"),
            gdRefX: new XName("gdRefX"),
            gdRefY: new XName("gdRefY"),
            goal: new XName("goal"),
            gradientshapeok: new XName("gradientshapeok"),
            groupBy: new XName("groupBy"),
            grpId: new XName("grpId"),
            guid: new XName("guid"),
            h: new XName("h"),
            hangingPunct: new XName("hangingPunct"),
            hashData: new XName("hashData"),
            header: new XName("header"),
            headerRowBorderDxfId: new XName("headerRowBorderDxfId"),
            headerRowDxfId: new XName("headerRowDxfId"),
            hidden: new XName("hidden"),
            hier: new XName("hier"),
            hierarchy: new XName("hierarchy"),
            hierarchyUsage: new XName("hierarchyUsage"),
            highlightClick: new XName("highlightClick"),
            hlink: new XName("hlink"),
            horizontal: new XName("horizontal"),
            horizontalCentered: new XName("horizontalCentered"),
            horizontalDpi: new XName("horizontalDpi"),
            horzOverflow: new XName("horzOverflow"),
            hR: new XName("hR"),
            htmlFormat: new XName("htmlFormat"),
            htmlTables: new XName("htmlTables"),
            hue: new XName("hue"),
            i: new XName("i"),
            i1: new XName("i1"),
            iconId: new XName("iconId"),
            iconSet: new XName("iconSet"),
            id: new XName("id"),
            Id: new XName("Id"),
            iddest: new XName("iddest"),
            idref: new XName("idref"),
            idsrc: new XName("idsrc"),
            idx: new XName("idx"),
            imgH: new XName("imgH"),
            imgW: new XName("imgW"),
            _in: new XName("in"),
            includeNewItemsInFilter: new XName("includeNewItemsInFilter"),
            indent: new XName("indent"),
            index: new XName("index"),
            indexed: new XName("indexed"),
            initials: new XName("initials"),
            insetpen: new XName("insetpen"),
            invalEndChars: new XName("invalEndChars"),
            invalidUrl: new XName("invalidUrl"),
            invalStChars: new XName("invalStChars"),
            isInverted: new XName("isInverted"),
            issignatureline: new XName("issignatureline"),
            item: new XName("item"),
            itemPrintTitles: new XName("itemPrintTitles"),
            joinstyle: new XName("joinstyle"),
            justifyLastLine: new XName("justifyLastLine"),
            key: new XName("key"),
            keyAttribute: new XName("keyAttribute"),
            l: new XName("l"),
            lang: new XName("lang"),
            lastClr: new XName("lastClr"),
            lastIdx: new XName("lastIdx"),
            lat: new XName("lat"),
            latinLnBrk: new XName("latinLnBrk"),
            layout: new XName("layout"),
            layoutInCell: new XName("layoutInCell"),
            left: new XName("left"),
            len: new XName("len"),
            length: new XName("length"),
            level: new XName("level"),
            lightharsh2: new XName("lightharsh2"),
            lightlevel: new XName("lightlevel"),
            lightlevel2: new XName("lightlevel2"),
            lightposition: new XName("lightposition"),
            lightposition2: new XName("lightposition2"),
            lim: new XName("lim"),
            link: new XName("link"),
            lIns: new XName("lIns"),
            loCatId: new XName("loCatId"),
            locked: new XName("locked"),
            lon: new XName("lon"),
            loop: new XName("loop"),
            loTypeId: new XName("loTypeId"),
            lum: new XName("lum"),
            lvl: new XName("lvl"),
            macro: new XName("macro"),
            man: new XName("man"),
            manualBreakCount: new XName("manualBreakCount"),
            mapId: new XName("mapId"),
            marL: new XName("marL"),
            max: new XName("max"),
            maxAng: new XName("maxAng"),
            maxR: new XName("maxR"),
            maxRank: new XName("maxRank"),
            maxSheetId: new XName("maxSheetId"),
            maxValue: new XName("maxValue"),
            maxX: new XName("maxX"),
            maxY: new XName("maxY"),
            mdx: new XName("mdx"),
            measureGroup: new XName("measureGroup"),
            memberName: new XName("memberName"),
            merge: new XName("merge"),
            meth: new XName("meth"),
            min: new XName("min"),
            minAng: new XName("minAng"),
            minR: new XName("minR"),
            minRefreshableVersion: new XName("minRefreshableVersion"),
            minSupportedVersion: new XName("minSupportedVersion"),
            minValue: new XName("minValue"),
            minVer: new XName("minVer"),
            minX: new XName("minX"),
            minY: new XName("minY"),
            modelId: new XName("modelId"),
            moveWithCells: new XName("moveWithCells"),
            n: new XName("n"),
            name: new XName("name"),
            _new: new XName("new"),
            newLength: new XName("newLength"),
            newName: new XName("newName"),
            nextAc: new XName("nextAc"),
            nextId: new XName("nextId"),
            noChangeArrowheads: new XName("noChangeArrowheads"),
            noChangeAspect: new XName("noChangeAspect"),
            noChangeShapeType: new XName("noChangeShapeType"),
            nodeType: new XName("nodeType"),
            noEditPoints: new XName("noEditPoints"),
            noGrp: new XName("noGrp"),
            noRot: new XName("noRot"),
            noUngrp: new XName("noUngrp"),
            np: new XName("np"),
            ns: new XName("ns"),
            numCol: new XName("numCol"),
            numFmtId: new XName("numFmtId"),
            o: new XName("o"),
            ObjectID: new XName("ObjectID"),
            objects: new XName("objects"),
            ObjectType: new XName("ObjectType"),
            objId: new XName("objId"),
            offset: new XName("offset"),
            old: new XName("old"),
            oldComment: new XName("oldComment"),
            oldName: new XName("oldName"),
            oleUpdate: new XName("oleUpdate"),
            on: new XName("on"),
            op: new XName("op"),
            orient: new XName("orient"),
            orientation: new XName("orientation"),
            origin: new XName("origin"),
            _out: new XName("out"),
            outline: new XName("outline"),
            outlineData: new XName("outlineData"),
            p: new XName("p"),
            pane: new XName("pane"),
            panose: new XName("panose"),
            paperSize: new XName("paperSize"),
            par: new XName("par"),
            parameterType: new XName("parameterType"),
            parent: new XName("parent"),
            password: new XName("password"),
            pasteAll: new XName("pasteAll"),
            pasteValues: new XName("pasteValues"),
            path: new XName("path"),
            pathEditMode: new XName("pathEditMode"),
            patternType: new XName("patternType"),
            phldr: new XName("phldr"),
            pid: new XName("pid"),
            pitchFamily: new XName("pitchFamily"),
            pivot: new XName("pivot"),
            points: new XName("points"),
            pos: new XName("pos"),
            position: new XName("position"),
            post: new XName("post"),
            preferPic: new XName("preferPic"),
            preserve: new XName("preserve"),
            pressure: new XName("pressure"),
            previousCol: new XName("previousCol"),
            previousRow: new XName("previousRow"),
            pri: new XName("pri"),
            priority: new XName("priority"),
            progId: new XName("progId"),
            ProgID: new XName("ProgID"),
            provid: new XName("provid"),
            prst: new XName("prst"),
            prstMaterial: new XName("prstMaterial"),
            ptsTypes: new XName("ptsTypes"),
            ptType: new XName("ptType"),
            qsCatId: new XName("qsCatId"),
            qsTypeId: new XName("qsTypeId"),
            r: new XName("r"),
            rad: new XName("rad"),
            readingOrder: new XName("readingOrder"),
            recordCount: new XName("recordCount"),
            _ref: new XName("ref"),
            ref3D: new XName("ref3D"),
            refersTo: new XName("refersTo"),
            refreshedBy: new XName("refreshedBy"),
            refreshedDate: new XName("refreshedDate"),
            refreshedVersion: new XName("refreshedVersion"),
            refreshOnLoad: new XName("refreshOnLoad"),
            refType: new XName("refType"),
            relativeFrom: new XName("relativeFrom"),
            relativeHeight: new XName("relativeHeight"),
            relId: new XName("relId"),
            Requires: new XName("Requires"),
            restart: new XName("restart"),
            rev: new XName("rev"),
            rgb: new XName("rgb"),
            rId: new XName("rId"),
            rig: new XName("rig"),
            right: new XName("right"),
            rIns: new XName("rIns"),
            rot: new XName("rot"),
            rotWithShape: new XName("rotWithShape"),
            rowColShift: new XName("rowColShift"),
            rowDrillCount: new XName("rowDrillCount"),
            rowPageCount: new XName("rowPageCount"),
            rows: new XName("rows"),
            rtl: new XName("rtl"),
            rtlCol: new XName("rtlCol"),
            s: new XName("s"),
            saltData: new XName("saltData"),
            sat: new XName("sat"),
            saveData: new XName("saveData"),
            saveSubsetFonts: new XName("saveSubsetFonts"),
            sb: new XName("sb"),
            scaled: new XName("scaled"),
            scaling: new XName("scaling"),
            scenarios: new XName("scenarios"),
            scope: new XName("scope"),
            script: new XName("script"),
            securityDescriptor: new XName("securityDescriptor"),
            seek: new XName("seek"),
            sendLocale: new XName("sendLocale"),
            series: new XName("series"),
            seriesIdx: new XName("seriesIdx"),
            serverSldId: new XName("serverSldId"),
            serverSldModifiedTime: new XName("serverSldModifiedTime"),
            setDefinition: new XName("setDefinition"),
            shapeId: new XName("shapeId"),
            ShapeID: new XName("ShapeID"),
            sheet: new XName("sheet"),
            sheetId: new XName("sheetId"),
            sheetPosition: new XName("sheetPosition"),
            show: new XName("show"),
            showAll: new XName("showAll"),
            showCaptions: new XName("showCaptions"),
            showColHeaders: new XName("showColHeaders"),
            showColStripes: new XName("showColStripes"),
            showColumnStripes: new XName("showColumnStripes"),
            showErrorMessage: new XName("showErrorMessage"),
            showFirstColumn: new XName("showFirstColumn"),
            showHeader: new XName("showHeader"),
            showInputMessage: new XName("showInputMessage"),
            showLastColumn: new XName("showLastColumn"),
            showRowHeaders: new XName("showRowHeaders"),
            showRowStripes: new XName("showRowStripes"),
            showValue: new XName("showValue"),
            shrinkToFit: new XName("shrinkToFit"),
            si: new XName("si"),
            sId: new XName("sId"),
            simplePos: new XName("simplePos"),
            size: new XName("size"),
            skewangle: new XName("skewangle"),
            smoothness: new XName("smoothness"),
            smtClean: new XName("smtClean"),
            source: new XName("source"),
            sourceFile: new XName("sourceFile"),
            SourceId: new XName("SourceId"),
            sourceLinked: new XName("sourceLinked"),
            sourceSheetId: new XName("sourceSheetId"),
            sourceType: new XName("sourceType"),
            sp: new XName("sp"),
            spans: new XName("spans"),
            spcCol: new XName("spcCol"),
            spcFirstLastPara: new XName("spcFirstLastPara"),
            spid: new XName("spid"),
            spidmax: new XName("spidmax"),
            spinCount: new XName("spinCount"),
            splitFirst: new XName("splitFirst"),
            spokes: new XName("spokes"),
            sqlType: new XName("sqlType"),
            sqref: new XName("sqref"),
            src: new XName("src"),
            srcId: new XName("srcId"),
            srcOrd: new XName("srcOrd"),
            st: new XName("st"),
            stA: new XName("stA"),
            stAng: new XName("stAng"),
            start: new XName("start"),
            startangle: new XName("startangle"),
            startDate: new XName("startDate"),
            status: new XName("status"),
            strike: new XName("strike"),
            _string: new XName("string"),
            strokecolor: new XName("strokecolor"),
            stroked: new XName("stroked"),
            strokeweight: new XName("strokeweight"),
            style: new XName("style"),
            styleId: new XName("styleId"),
            styleName: new XName("styleName"),
            subtotal: new XName("subtotal"),
            summaryBelow: new XName("summaryBelow"),
            swAng: new XName("swAng"),
            sx: new XName("sx"),
            sy: new XName("sy"),
            sz: new XName("sz"),
            t: new XName("t"),
            tab: new XName("tab"),
            tableBorderDxfId: new XName("tableBorderDxfId"),
            tableColumnId: new XName("tableColumnId"),
            Target: new XName("Target"),
            textlink: new XName("textlink"),
            textRotation: new XName("textRotation"),
            theme: new XName("theme"),
            thresh: new XName("thresh"),
            thruBlk: new XName("thruBlk"),
            time: new XName("time"),
            tIns: new XName("tIns"),
            tint: new XName("tint"),
            tm: new XName("tm"),
            to: new XName("to"),
            tooltip: new XName("tooltip"),
            top: new XName("top"),
            topLabels: new XName("topLabels"),
            topLeftCell: new XName("topLeftCell"),
            totalsRowShown: new XName("totalsRowShown"),
            track: new XName("track"),
            trans: new XName("trans"),
            transition: new XName("transition"),
            trend: new XName("trend"),
            twoDigitTextYear: new XName("twoDigitTextYear"),
            tx: new XName("tx"),
            tx1: new XName("tx1"),
            tx2: new XName("tx2"),
            txBox: new XName("txBox"),
            txbxSeq: new XName("txbxSeq"),
            txbxStory: new XName("txbxStory"),
            ty: new XName("ty"),
            type: new XName("type"),
            Type: new XName("Type"),
            typeface: new XName("typeface"),
            u: new XName("u"),
            ua: new XName("ua"),
            uiExpand: new XName("uiExpand"),
            unbalanced: new XName("unbalanced"),
            uniqueCount: new XName("uniqueCount"),
            uniqueId: new XName("uniqueId"),
            uniqueName: new XName("uniqueName"),
            uniqueParent: new XName("uniqueParent"),
            updateAutomatic: new XName("updateAutomatic"),
            updatedVersion: new XName("updatedVersion"),
            uri: new XName("uri"),
            URI: new XName("URI"),
            url: new XName("url"),
            useAutoFormatting: new XName("useAutoFormatting"),
            useDef: new XName("useDef"),
            user: new XName("user"),
            userName: new XName("userName"),
            v: new XName("v"),
            val: new XName("val"),
            value: new XName("value"),
            valueType: new XName("valueType"),
            varScale: new XName("varScale"),
            vert: new XName("vert"),
            vertical: new XName("vertical"),
            verticalCentered: new XName("verticalCentered"),
            verticalDpi: new XName("verticalDpi"),
            vertOverflow: new XName("vertOverflow"),
            viewpoint: new XName("viewpoint"),
            viewpointorigin: new XName("viewpointorigin"),
            w: new XName("w"),
            weight: new XName("weight"),
            width: new XName("width"),
            workbookViewId: new XName("workbookViewId"),
            wR: new XName("wR"),
            wrap: new XName("wrap"),
            wrapText: new XName("wrapText"),
            x: new XName("x"),
            x1: new XName("x1"),
            x2: new XName("x2"),
            xfId: new XName("xfId"),
            xl97: new XName("xl97"),
            xmlDataType: new XName("xmlDataType"),
            xpath: new XName("xpath"),
            xSplit: new XName("xSplit"),
            y: new XName("y"),
            y1: new XName("y1"),
            y2: new XName("y2"),
            year: new XName("year"),
            yrange: new XName("yrange"),
            ySplit: new XName("ySplit"),
            z: new XName("z"),
        }
        var NoNamespace = openXml.NoNamespace;

        openXml.oNs = new XNamespace("urn:schemas-microsoft-com:office:office");
        var oNs = openXml.oNs;
        openXml.O = {
            allowincell: new XName(oNs, "allowincell"),
            allowoverlap: new XName(oNs, "allowoverlap"),
            althref: new XName(oNs, "althref"),
            borderbottomcolor: new XName(oNs, "borderbottomcolor"),
            borderleftcolor: new XName(oNs, "borderleftcolor"),
            borderrightcolor: new XName(oNs, "borderrightcolor"),
            bordertopcolor: new XName(oNs, "bordertopcolor"),
            bottom: new XName(oNs, "bottom"),
            bullet: new XName(oNs, "bullet"),
            button: new XName(oNs, "button"),
            bwmode: new XName(oNs, "bwmode"),
            bwnormal: new XName(oNs, "bwnormal"),
            bwpure: new XName(oNs, "bwpure"),
            callout: new XName(oNs, "callout"),
            clip: new XName(oNs, "clip"),
            clippath: new XName(oNs, "clippath"),
            cliptowrap: new XName(oNs, "cliptowrap"),
            colormenu: new XName(oNs, "colormenu"),
            colormru: new XName(oNs, "colormru"),
            column: new XName(oNs, "column"),
            complex: new XName(oNs, "complex"),
            connectangles: new XName(oNs, "connectangles"),
            connectlocs: new XName(oNs, "connectlocs"),
            connectortype: new XName(oNs, "connectortype"),
            connecttype: new XName(oNs, "connecttype"),
            detectmouseclick: new XName(oNs, "detectmouseclick"),
            dgmlayout: new XName(oNs, "dgmlayout"),
            dgmlayoutmru: new XName(oNs, "dgmlayoutmru"),
            dgmnodekind: new XName(oNs, "dgmnodekind"),
            diagram: new XName(oNs, "diagram"),
            doubleclicknotify: new XName(oNs, "doubleclicknotify"),
            entry: new XName(oNs, "entry"),
            extrusion: new XName(oNs, "extrusion"),
            extrusionok: new XName(oNs, "extrusionok"),
            FieldCodes: new XName(oNs, "FieldCodes"),
            fill: new XName(oNs, "fill"),
            forcedash: new XName(oNs, "forcedash"),
            gfxdata: new XName(oNs, "gfxdata"),
            hr: new XName(oNs, "hr"),
            hralign: new XName(oNs, "hralign"),
            href: new XName(oNs, "href"),
            hrnoshade: new XName(oNs, "hrnoshade"),
            hrpct: new XName(oNs, "hrpct"),
            hrstd: new XName(oNs, "hrstd"),
            idmap: new XName(oNs, "idmap"),
            ink: new XName(oNs, "ink"),
            insetmode: new XName(oNs, "insetmode"),
            left: new XName(oNs, "left"),
            LinkType: new XName(oNs, "LinkType"),
            _lock: new XName(oNs, "lock"),
            LockedField: new XName(oNs, "LockedField"),
            master: new XName(oNs, "master"),
            ole: new XName(oNs, "ole"),
            oleicon: new XName(oNs, "oleicon"),
            OLEObject: new XName(oNs, "OLEObject"),
            oned: new XName(oNs, "oned"),
            opacity2: new XName(oNs, "opacity2"),
            preferrelative: new XName(oNs, "preferrelative"),
            proxy: new XName(oNs, "proxy"),
            r: new XName(oNs, "r"),
            regroupid: new XName(oNs, "regroupid"),
            regrouptable: new XName(oNs, "regrouptable"),
            rel: new XName(oNs, "rel"),
            relationtable: new XName(oNs, "relationtable"),
            relid: new XName(oNs, "relid"),
            right: new XName(oNs, "right"),
            rules: new XName(oNs, "rules"),
            shapedefaults: new XName(oNs, "shapedefaults"),
            shapelayout: new XName(oNs, "shapelayout"),
            signatureline: new XName(oNs, "signatureline"),
            singleclick: new XName(oNs, "singleclick"),
            skew: new XName(oNs, "skew"),
            spid: new XName(oNs, "spid"),
            spt: new XName(oNs, "spt"),
            suggestedsigner: new XName(oNs, "suggestedsigner"),
            suggestedsigner2: new XName(oNs, "suggestedsigner2"),
            suggestedsigneremail: new XName(oNs, "suggestedsigneremail"),
            tablelimits: new XName(oNs, "tablelimits"),
            tableproperties: new XName(oNs, "tableproperties"),
            targetscreensize: new XName(oNs, "targetscreensize"),
            title: new XName(oNs, "title"),
            top: new XName(oNs, "top"),
            userdrawn: new XName(oNs, "userdrawn"),
            userhidden: new XName(oNs, "userhidden"),
            v: new XName(oNs, "v"),
        }
        var O = openXml.O;

        openXml.pNs = new XNamespace("http://schemas.openxmlformats.org/presentationml/2006/main");
        var pNs = openXml.pNs;
        openXml.P = {
            anim: new XName(pNs, "anim"),
            animClr: new XName(pNs, "animClr"),
            animEffect: new XName(pNs, "animEffect"),
            animMotion: new XName(pNs, "animMotion"),
            animRot: new XName(pNs, "animRot"),
            animScale: new XName(pNs, "animScale"),
            attrName: new XName(pNs, "attrName"),
            attrNameLst: new XName(pNs, "attrNameLst"),
            audio: new XName(pNs, "audio"),
            bg: new XName(pNs, "bg"),
            bgPr: new XName(pNs, "bgPr"),
            bgRef: new XName(pNs, "bgRef"),
            bldAsOne: new XName(pNs, "bldAsOne"),
            bldDgm: new XName(pNs, "bldDgm"),
            bldGraphic: new XName(pNs, "bldGraphic"),
            bldLst: new XName(pNs, "bldLst"),
            bldOleChart: new XName(pNs, "bldOleChart"),
            bldP: new XName(pNs, "bldP"),
            bldSub: new XName(pNs, "bldSub"),
            blinds: new XName(pNs, "blinds"),
            blipFill: new XName(pNs, "blipFill"),
            bodyStyle: new XName(pNs, "bodyStyle"),
            bold: new XName(pNs, "bold"),
            boldItalic: new XName(pNs, "boldItalic"),
            boolVal: new XName(pNs, "boolVal"),
            by: new XName(pNs, "by"),
            cBhvr: new XName(pNs, "cBhvr"),
            charRg: new XName(pNs, "charRg"),
            checker: new XName(pNs, "checker"),
            childTnLst: new XName(pNs, "childTnLst"),
            circle: new XName(pNs, "circle"),
            clrMap: new XName(pNs, "clrMap"),
            clrMapOvr: new XName(pNs, "clrMapOvr"),
            clrVal: new XName(pNs, "clrVal"),
            cm: new XName(pNs, "cm"),
            cmAuthor: new XName(pNs, "cmAuthor"),
            cmAuthorLst: new XName(pNs, "cmAuthorLst"),
            cmd: new XName(pNs, "cmd"),
            cMediaNode: new XName(pNs, "cMediaNode"),
            cmLst: new XName(pNs, "cmLst"),
            cNvCxnSpPr: new XName(pNs, "cNvCxnSpPr"),
            cNvGraphicFramePr: new XName(pNs, "cNvGraphicFramePr"),
            cNvGrpSpPr: new XName(pNs, "cNvGrpSpPr"),
            cNvPicPr: new XName(pNs, "cNvPicPr"),
            cNvPr: new XName(pNs, "cNvPr"),
            cNvSpPr: new XName(pNs, "cNvSpPr"),
            comb: new XName(pNs, "comb"),
            cond: new XName(pNs, "cond"),
            contentPart: new XName(pNs, "contentPart"),
            control: new XName(pNs, "control"),
            controls: new XName(pNs, "controls"),
            cover: new XName(pNs, "cover"),
            cSld: new XName(pNs, "cSld"),
            cSldViewPr: new XName(pNs, "cSldViewPr"),
            cTn: new XName(pNs, "cTn"),
            custData: new XName(pNs, "custData"),
            custDataLst: new XName(pNs, "custDataLst"),
            custShow: new XName(pNs, "custShow"),
            custShowLst: new XName(pNs, "custShowLst"),
            cut: new XName(pNs, "cut"),
            cViewPr: new XName(pNs, "cViewPr"),
            cxnSp: new XName(pNs, "cxnSp"),
            defaultTextStyle: new XName(pNs, "defaultTextStyle"),
            diamond: new XName(pNs, "diamond"),
            dissolve: new XName(pNs, "dissolve"),
            embed: new XName(pNs, "embed"),
            embeddedFont: new XName(pNs, "embeddedFont"),
            embeddedFontLst: new XName(pNs, "embeddedFontLst"),
            endCondLst: new XName(pNs, "endCondLst"),
            endSnd: new XName(pNs, "endSnd"),
            endSync: new XName(pNs, "endSync"),
            ext: new XName(pNs, "ext"),
            extLst: new XName(pNs, "extLst"),
            fade: new XName(pNs, "fade"),
            fltVal: new XName(pNs, "fltVal"),
            font: new XName(pNs, "font"),
            from: new XName(pNs, "from"),
            graphicEl: new XName(pNs, "graphicEl"),
            graphicFrame: new XName(pNs, "graphicFrame"),
            gridSpacing: new XName(pNs, "gridSpacing"),
            grpSp: new XName(pNs, "grpSp"),
            grpSpPr: new XName(pNs, "grpSpPr"),
            guide: new XName(pNs, "guide"),
            guideLst: new XName(pNs, "guideLst"),
            handoutMaster: new XName(pNs, "handoutMaster"),
            handoutMasterId: new XName(pNs, "handoutMasterId"),
            handoutMasterIdLst: new XName(pNs, "handoutMasterIdLst"),
            hf: new XName(pNs, "hf"),
            hsl: new XName(pNs, "hsl"),
            inkTgt: new XName(pNs, "inkTgt"),
            italic: new XName(pNs, "italic"),
            iterate: new XName(pNs, "iterate"),
            kinsoku: new XName(pNs, "kinsoku"),
            link: new XName(pNs, "link"),
            modifyVerifier: new XName(pNs, "modifyVerifier"),
            newsflash: new XName(pNs, "newsflash"),
            nextCondLst: new XName(pNs, "nextCondLst"),
            normalViewPr: new XName(pNs, "normalViewPr"),
            notes: new XName(pNs, "notes"),
            notesMaster: new XName(pNs, "notesMaster"),
            notesMasterId: new XName(pNs, "notesMasterId"),
            notesMasterIdLst: new XName(pNs, "notesMasterIdLst"),
            notesStyle: new XName(pNs, "notesStyle"),
            notesSz: new XName(pNs, "notesSz"),
            notesTextViewPr: new XName(pNs, "notesTextViewPr"),
            notesViewPr: new XName(pNs, "notesViewPr"),
            nvCxnSpPr: new XName(pNs, "nvCxnSpPr"),
            nvGraphicFramePr: new XName(pNs, "nvGraphicFramePr"),
            nvGrpSpPr: new XName(pNs, "nvGrpSpPr"),
            nvPicPr: new XName(pNs, "nvPicPr"),
            nvPr: new XName(pNs, "nvPr"),
            nvSpPr: new XName(pNs, "nvSpPr"),
            oleChartEl: new XName(pNs, "oleChartEl"),
            oleObj: new XName(pNs, "oleObj"),
            origin: new XName(pNs, "origin"),
            otherStyle: new XName(pNs, "otherStyle"),
            outlineViewPr: new XName(pNs, "outlineViewPr"),
            par: new XName(pNs, "par"),
            ph: new XName(pNs, "ph"),
            photoAlbum: new XName(pNs, "photoAlbum"),
            pic: new XName(pNs, "pic"),
            plus: new XName(pNs, "plus"),
            pos: new XName(pNs, "pos"),
            presentation: new XName(pNs, "presentation"),
            prevCondLst: new XName(pNs, "prevCondLst"),
            pRg: new XName(pNs, "pRg"),
            pull: new XName(pNs, "pull"),
            push: new XName(pNs, "push"),
            random: new XName(pNs, "random"),
            randomBar: new XName(pNs, "randomBar"),
            rCtr: new XName(pNs, "rCtr"),
            regular: new XName(pNs, "regular"),
            restoredLeft: new XName(pNs, "restoredLeft"),
            restoredTop: new XName(pNs, "restoredTop"),
            rgb: new XName(pNs, "rgb"),
            rtn: new XName(pNs, "rtn"),
            scale: new XName(pNs, "scale"),
            seq: new XName(pNs, "seq"),
            set: new XName(pNs, "set"),
            sld: new XName(pNs, "sld"),
            sldId: new XName(pNs, "sldId"),
            sldIdLst: new XName(pNs, "sldIdLst"),
            sldLayout: new XName(pNs, "sldLayout"),
            sldLayoutId: new XName(pNs, "sldLayoutId"),
            sldLayoutIdLst: new XName(pNs, "sldLayoutIdLst"),
            sldLst: new XName(pNs, "sldLst"),
            sldMaster: new XName(pNs, "sldMaster"),
            sldMasterId: new XName(pNs, "sldMasterId"),
            sldMasterIdLst: new XName(pNs, "sldMasterIdLst"),
            sldSyncPr: new XName(pNs, "sldSyncPr"),
            sldSz: new XName(pNs, "sldSz"),
            sldTgt: new XName(pNs, "sldTgt"),
            slideViewPr: new XName(pNs, "slideViewPr"),
            snd: new XName(pNs, "snd"),
            sndAc: new XName(pNs, "sndAc"),
            sndTgt: new XName(pNs, "sndTgt"),
            sorterViewPr: new XName(pNs, "sorterViewPr"),
            sp: new XName(pNs, "sp"),
            split: new XName(pNs, "split"),
            spPr: new XName(pNs, "spPr"),
            spTgt: new XName(pNs, "spTgt"),
            spTree: new XName(pNs, "spTree"),
            stCondLst: new XName(pNs, "stCondLst"),
            strips: new XName(pNs, "strips"),
            strVal: new XName(pNs, "strVal"),
            stSnd: new XName(pNs, "stSnd"),
            style: new XName(pNs, "style"),
            subSp: new XName(pNs, "subSp"),
            subTnLst: new XName(pNs, "subTnLst"),
            tag: new XName(pNs, "tag"),
            tagLst: new XName(pNs, "tagLst"),
            tags: new XName(pNs, "tags"),
            tav: new XName(pNs, "tav"),
            tavLst: new XName(pNs, "tavLst"),
            text: new XName(pNs, "text"),
            tgtEl: new XName(pNs, "tgtEl"),
            timing: new XName(pNs, "timing"),
            titleStyle: new XName(pNs, "titleStyle"),
            tmAbs: new XName(pNs, "tmAbs"),
            tmPct: new XName(pNs, "tmPct"),
            tmpl: new XName(pNs, "tmpl"),
            tmplLst: new XName(pNs, "tmplLst"),
            tn: new XName(pNs, "tn"),
            tnLst: new XName(pNs, "tnLst"),
            to: new XName(pNs, "to"),
            transition: new XName(pNs, "transition"),
            txBody: new XName(pNs, "txBody"),
            txEl: new XName(pNs, "txEl"),
            txStyles: new XName(pNs, "txStyles"),
            val: new XName(pNs, "val"),
            video: new XName(pNs, "video"),
            viewPr: new XName(pNs, "viewPr"),
            wedge: new XName(pNs, "wedge"),
            wheel: new XName(pNs, "wheel"),
            wipe: new XName(pNs, "wipe"),
            xfrm: new XName(pNs, "xfrm"),
            zoom: new XName(pNs, "zoom"),
        }
        var P = openXml.P;

        openXml.p14Ns = new XNamespace("http://schemas.microsoft.com/office/powerpoint/2010/main");
        var p14Ns = openXml.p14Ns;
        openXml.P14 = {
            bmk: new XName(p14Ns, "bmk"),
            bmkLst: new XName(p14Ns, "bmkLst"),
            bmkTgt: new XName(p14Ns, "bmkTgt"),
            bounceEnd: new XName(p14Ns, "bounceEnd"),
            bwMode: new XName(p14Ns, "bwMode"),
            cNvContentPartPr: new XName(p14Ns, "cNvContentPartPr"),
            cNvPr: new XName(p14Ns, "cNvPr"),
            conveyor: new XName(p14Ns, "conveyor"),
            creationId: new XName(p14Ns, "creationId"),
            doors: new XName(p14Ns, "doors"),
            dur: new XName(p14Ns, "dur"),
            extLst: new XName(p14Ns, "extLst"),
            fade: new XName(p14Ns, "fade"),
            ferris: new XName(p14Ns, "ferris"),
            flash: new XName(p14Ns, "flash"),
            flip: new XName(p14Ns, "flip"),
            flythrough: new XName(p14Ns, "flythrough"),
            gallery: new XName(p14Ns, "gallery"),
            glitter: new XName(p14Ns, "glitter"),
            honeycomb: new XName(p14Ns, "honeycomb"),
            laserTraceLst: new XName(p14Ns, "laserTraceLst"),
            media: new XName(p14Ns, "media"),
            modId: new XName(p14Ns, "modId"),
            nvContentPartPr: new XName(p14Ns, "nvContentPartPr"),
            nvPr: new XName(p14Ns, "nvPr"),
            pan: new XName(p14Ns, "pan"),
            pauseEvt: new XName(p14Ns, "pauseEvt"),
            playEvt: new XName(p14Ns, "playEvt"),
            presetBounceEnd: new XName(p14Ns, "presetBounceEnd"),
            prism: new XName(p14Ns, "prism"),
            resumeEvt: new XName(p14Ns, "resumeEvt"),
            reveal: new XName(p14Ns, "reveal"),
            ripple: new XName(p14Ns, "ripple"),
            section: new XName(p14Ns, "section"),
            sectionLst: new XName(p14Ns, "sectionLst"),
            seekEvt: new XName(p14Ns, "seekEvt"),
            showEvtLst: new XName(p14Ns, "showEvtLst"),
            shred: new XName(p14Ns, "shred"),
            sldId: new XName(p14Ns, "sldId"),
            sldIdLst: new XName(p14Ns, "sldIdLst"),
            stopEvt: new XName(p14Ns, "stopEvt"),
            _switch: new XName(p14Ns, "switch"),
            tracePt: new XName(p14Ns, "tracePt"),
            tracePtLst: new XName(p14Ns, "tracePtLst"),
            triggerEvt: new XName(p14Ns, "triggerEvt"),
            trim: new XName(p14Ns, "trim"),
            vortex: new XName(p14Ns, "vortex"),
            warp: new XName(p14Ns, "warp"),
            wheelReverse: new XName(p14Ns, "wheelReverse"),
            window: new XName(p14Ns, "window"),
            xfrm: new XName(p14Ns, "xfrm"),
        }
        var P14 = openXml.P14;

        openXml.p15Ns = new XNamespace("http://schemas.microsoft.com/office15/powerpoint");
        var p15Ns = openXml.p15Ns;
        openXml.P15 = {
            extElement: new XName(p15Ns, "extElement"),
        }
        var P15 = openXml.P15;

        openXml.picNs = new XNamespace("http://schemas.openxmlformats.org/drawingml/2006/picture");
        var picNs = openXml.picNs;
        openXml.Pic = {
            blipFill: new XName(picNs, "blipFill"),
            cNvPicPr: new XName(picNs, "cNvPicPr"),
            cNvPr: new XName(picNs, "cNvPr"),
            nvPicPr: new XName(picNs, "nvPicPr"),
            _pic: new XName(picNs, "pic"),
            spPr: new XName(picNs, "spPr"),
        }
        var Pic = openXml.Pic;

        openXml.rNs = new XNamespace("http://schemas.openxmlformats.org/officeDocument/2006/relationships");

        var rNs = openXml.rNs;
        openXml.R = {
            blip: new XName(rNs, "blip"),
            cs: new XName(rNs, "cs"),
            dm: new XName(rNs, "dm"),
            embed: new XName(rNs, "embed"),
            href: new XName(rNs, "href"),
            id: new XName(rNs, "id"),
            link: new XName(rNs, "link"),
            lo: new XName(rNs, "lo"),
            pict: new XName(rNs, "pict"),
            qs: new XName(rNs, "qs"),
            verticalDpi: new XName(rNs, "verticalDpi"),
        }
        var R = openXml.R;

        openXml.sNs = new XNamespace("http://schemas.openxmlformats.org/spreadsheetml/2006/main");
        var sNs = openXml.sNs;
        openXml.S = {
            alignment: new XName(sNs, "alignment"),
            anchor: new XName(sNs, "anchor"),
            author: new XName(sNs, "author"),
            authors: new XName(sNs, "authors"),
            autoFilter: new XName(sNs, "autoFilter"),
            autoSortScope: new XName(sNs, "autoSortScope"),
            b: new XName(sNs, "b"),
            bgColor: new XName(sNs, "bgColor"),
            bk: new XName(sNs, "bk"),
            border: new XName(sNs, "border"),
            borders: new XName(sNs, "borders"),
            bottom: new XName(sNs, "bottom"),
            brk: new XName(sNs, "brk"),
            c: new XName(sNs, "c"),
            cacheField: new XName(sNs, "cacheField"),
            cacheFields: new XName(sNs, "cacheFields"),
            cacheHierarchies: new XName(sNs, "cacheHierarchies"),
            cacheHierarchy: new XName(sNs, "cacheHierarchy"),
            cacheSource: new XName(sNs, "cacheSource"),
            calcChain: new XName(sNs, "calcChain"),
            calcPr: new XName(sNs, "calcPr"),
            calculatedColumnFormula: new XName(sNs, "calculatedColumnFormula"),
            calculatedItem: new XName(sNs, "calculatedItem"),
            calculatedItems: new XName(sNs, "calculatedItems"),
            calculatedMember: new XName(sNs, "calculatedMember"),
            calculatedMembers: new XName(sNs, "calculatedMembers"),
            cell: new XName(sNs, "cell"),
            cellMetadata: new XName(sNs, "cellMetadata"),
            cellSmartTag: new XName(sNs, "cellSmartTag"),
            cellSmartTagPr: new XName(sNs, "cellSmartTagPr"),
            cellSmartTags: new XName(sNs, "cellSmartTags"),
            cellStyle: new XName(sNs, "cellStyle"),
            cellStyles: new XName(sNs, "cellStyles"),
            cellStyleXfs: new XName(sNs, "cellStyleXfs"),
            cellWatch: new XName(sNs, "cellWatch"),
            cellWatches: new XName(sNs, "cellWatches"),
            cellXfs: new XName(sNs, "cellXfs"),
            cfRule: new XName(sNs, "cfRule"),
            cfvo: new XName(sNs, "cfvo"),
            charset: new XName(sNs, "charset"),
            chartFormat: new XName(sNs, "chartFormat"),
            chartFormats: new XName(sNs, "chartFormats"),
            chartsheet: new XName(sNs, "chartsheet"),
            col: new XName(sNs, "col"),
            colBreaks: new XName(sNs, "colBreaks"),
            colFields: new XName(sNs, "colFields"),
            colHierarchiesUsage: new XName(sNs, "colHierarchiesUsage"),
            colHierarchyUsage: new XName(sNs, "colHierarchyUsage"),
            colItems: new XName(sNs, "colItems"),
            color: new XName(sNs, "color"),
            colorFilter: new XName(sNs, "colorFilter"),
            colors: new XName(sNs, "colors"),
            colorScale: new XName(sNs, "colorScale"),
            cols: new XName(sNs, "cols"),
            comment: new XName(sNs, "comment"),
            commentList: new XName(sNs, "commentList"),
            comments: new XName(sNs, "comments"),
            condense: new XName(sNs, "condense"),
            conditionalFormat: new XName(sNs, "conditionalFormat"),
            conditionalFormats: new XName(sNs, "conditionalFormats"),
            conditionalFormatting: new XName(sNs, "conditionalFormatting"),
            connection: new XName(sNs, "connection"),
            connections: new XName(sNs, "connections"),
            consolidation: new XName(sNs, "consolidation"),
            control: new XName(sNs, "control"),
            controlPr: new XName(sNs, "controlPr"),
            controls: new XName(sNs, "controls"),
            customFilter: new XName(sNs, "customFilter"),
            customFilters: new XName(sNs, "customFilters"),
            customPr: new XName(sNs, "customPr"),
            customProperties: new XName(sNs, "customProperties"),
            customSheetView: new XName(sNs, "customSheetView"),
            customSheetViews: new XName(sNs, "customSheetViews"),
            d: new XName(sNs, "d"),
            dataBar: new XName(sNs, "dataBar"),
            dataConsolidate: new XName(sNs, "dataConsolidate"),
            dataField: new XName(sNs, "dataField"),
            dataFields: new XName(sNs, "dataFields"),
            dataRef: new XName(sNs, "dataRef"),
            dataRefs: new XName(sNs, "dataRefs"),
            dataValidation: new XName(sNs, "dataValidation"),
            dataValidations: new XName(sNs, "dataValidations"),
            dateGroupItem: new XName(sNs, "dateGroupItem"),
            dbPr: new XName(sNs, "dbPr"),
            ddeItem: new XName(sNs, "ddeItem"),
            ddeItems: new XName(sNs, "ddeItems"),
            ddeLink: new XName(sNs, "ddeLink"),
            definedName: new XName(sNs, "definedName"),
            definedNames: new XName(sNs, "definedNames"),
            deletedField: new XName(sNs, "deletedField"),
            diagonal: new XName(sNs, "diagonal"),
            dialogsheet: new XName(sNs, "dialogsheet"),
            dimension: new XName(sNs, "dimension"),
            dimensions: new XName(sNs, "dimensions"),
            discretePr: new XName(sNs, "discretePr"),
            drawing: new XName(sNs, "drawing"),
            dxf: new XName(sNs, "dxf"),
            dxfs: new XName(sNs, "dxfs"),
            dynamicFilter: new XName(sNs, "dynamicFilter"),
            e: new XName(sNs, "e"),
            entries: new XName(sNs, "entries"),
            evenFooter: new XName(sNs, "evenFooter"),
            evenHeader: new XName(sNs, "evenHeader"),
            ext: new XName(sNs, "ext"),
            extend: new XName(sNs, "extend"),
            externalBook: new XName(sNs, "externalBook"),
            externalLink: new XName(sNs, "externalLink"),
            extLst: new XName(sNs, "extLst"),
            f: new XName(sNs, "f"),
            family: new XName(sNs, "family"),
            fgColor: new XName(sNs, "fgColor"),
            field: new XName(sNs, "field"),
            fieldGroup: new XName(sNs, "fieldGroup"),
            fieldsUsage: new XName(sNs, "fieldsUsage"),
            fieldUsage: new XName(sNs, "fieldUsage"),
            fill: new XName(sNs, "fill"),
            fills: new XName(sNs, "fills"),
            filter: new XName(sNs, "filter"),
            filterColumn: new XName(sNs, "filterColumn"),
            filters: new XName(sNs, "filters"),
            firstFooter: new XName(sNs, "firstFooter"),
            firstHeader: new XName(sNs, "firstHeader"),
            font: new XName(sNs, "font"),
            fonts: new XName(sNs, "fonts"),
            foo: new XName(sNs, "foo"),
            format: new XName(sNs, "format"),
            formats: new XName(sNs, "formats"),
            formula: new XName(sNs, "formula"),
            formula1: new XName(sNs, "formula1"),
            formula2: new XName(sNs, "formula2"),
            from: new XName(sNs, "from"),
            futureMetadata: new XName(sNs, "futureMetadata"),
            gradientFill: new XName(sNs, "gradientFill"),
            group: new XName(sNs, "group"),
            groupItems: new XName(sNs, "groupItems"),
            groupLevel: new XName(sNs, "groupLevel"),
            groupLevels: new XName(sNs, "groupLevels"),
            groupMember: new XName(sNs, "groupMember"),
            groupMembers: new XName(sNs, "groupMembers"),
            groups: new XName(sNs, "groups"),
            header: new XName(sNs, "header"),
            headerFooter: new XName(sNs, "headerFooter"),
            headers: new XName(sNs, "headers"),
            horizontal: new XName(sNs, "horizontal"),
            hyperlink: new XName(sNs, "hyperlink"),
            hyperlinks: new XName(sNs, "hyperlinks"),
            i: new XName(sNs, "i"),
            iconFilter: new XName(sNs, "iconFilter"),
            iconSet: new XName(sNs, "iconSet"),
            ignoredError: new XName(sNs, "ignoredError"),
            ignoredErrors: new XName(sNs, "ignoredErrors"),
            indexedColors: new XName(sNs, "indexedColors"),
            inputCells: new XName(sNs, "inputCells"),
            _is: new XName(sNs, "is"),
            item: new XName(sNs, "item"),
            items: new XName(sNs, "items"),
            k: new XName(sNs, "k"),
            kpi: new XName(sNs, "kpi"),
            kpis: new XName(sNs, "kpis"),
            left: new XName(sNs, "left"),
            legacyDrawing: new XName(sNs, "legacyDrawing"),
            legacyDrawingHF: new XName(sNs, "legacyDrawingHF"),
            location: new XName(sNs, "location"),
            m: new XName(sNs, "m"),
            main: new XName(sNs, "main"),
            map: new XName(sNs, "map"),
            maps: new XName(sNs, "maps"),
            mdx: new XName(sNs, "mdx"),
            mdxMetadata: new XName(sNs, "mdxMetadata"),
            measureGroup: new XName(sNs, "measureGroup"),
            measureGroups: new XName(sNs, "measureGroups"),
            member: new XName(sNs, "member"),
            members: new XName(sNs, "members"),
            mergeCell: new XName(sNs, "mergeCell"),
            mergeCells: new XName(sNs, "mergeCells"),
            metadata: new XName(sNs, "metadata"),
            metadataStrings: new XName(sNs, "metadataStrings"),
            metadataType: new XName(sNs, "metadataType"),
            metadataTypes: new XName(sNs, "metadataTypes"),
            mp: new XName(sNs, "mp"),
            mpMap: new XName(sNs, "mpMap"),
            mps: new XName(sNs, "mps"),
            mruColors: new XName(sNs, "mruColors"),
            ms: new XName(sNs, "ms"),
            n: new XName(sNs, "n"),
            name: new XName(sNs, "name"),
            nc: new XName(sNs, "nc"),
            ndxf: new XName(sNs, "ndxf"),
            numFmt: new XName(sNs, "numFmt"),
            numFmts: new XName(sNs, "numFmts"),
            objectPr: new XName(sNs, "objectPr"),
            oc: new XName(sNs, "oc"),
            oddFooter: new XName(sNs, "oddFooter"),
            oddHeader: new XName(sNs, "oddHeader"),
            odxf: new XName(sNs, "odxf"),
            olapPr: new XName(sNs, "olapPr"),
            oldFormula: new XName(sNs, "oldFormula"),
            oleItem: new XName(sNs, "oleItem"),
            oleItems: new XName(sNs, "oleItems"),
            oleLink: new XName(sNs, "oleLink"),
            oleObject: new XName(sNs, "oleObject"),
            oleObjects: new XName(sNs, "oleObjects"),
            outline: new XName(sNs, "outline"),
            outlinePr: new XName(sNs, "outlinePr"),
            p: new XName(sNs, "p"),
            page: new XName(sNs, "page"),
            pageField: new XName(sNs, "pageField"),
            pageFields: new XName(sNs, "pageFields"),
            pageItem: new XName(sNs, "pageItem"),
            pageMargins: new XName(sNs, "pageMargins"),
            pages: new XName(sNs, "pages"),
            pageSetup: new XName(sNs, "pageSetup"),
            pageSetUpPr: new XName(sNs, "pageSetUpPr"),
            pane: new XName(sNs, "pane"),
            parameter: new XName(sNs, "parameter"),
            parameters: new XName(sNs, "parameters"),
            patternFill: new XName(sNs, "patternFill"),
            phoneticPr: new XName(sNs, "phoneticPr"),
            picture: new XName(sNs, "picture"),
            pivotArea: new XName(sNs, "pivotArea"),
            pivotAreas: new XName(sNs, "pivotAreas"),
            pivotCache: new XName(sNs, "pivotCache"),
            pivotCacheDefinition: new XName(sNs, "pivotCacheDefinition"),
            pivotCacheRecords: new XName(sNs, "pivotCacheRecords"),
            pivotCaches: new XName(sNs, "pivotCaches"),
            pivotField: new XName(sNs, "pivotField"),
            pivotFields: new XName(sNs, "pivotFields"),
            pivotHierarchies: new XName(sNs, "pivotHierarchies"),
            pivotHierarchy: new XName(sNs, "pivotHierarchy"),
            pivotSelection: new XName(sNs, "pivotSelection"),
            pivotTableDefinition: new XName(sNs, "pivotTableDefinition"),
            pivotTableStyleInfo: new XName(sNs, "pivotTableStyleInfo"),
            printOptions: new XName(sNs, "printOptions"),
            protectedRange: new XName(sNs, "protectedRange"),
            protectedRanges: new XName(sNs, "protectedRanges"),
            protection: new XName(sNs, "protection"),
            query: new XName(sNs, "query"),
            queryCache: new XName(sNs, "queryCache"),
            queryTable: new XName(sNs, "queryTable"),
            queryTableDeletedFields: new XName(sNs, "queryTableDeletedFields"),
            queryTableField: new XName(sNs, "queryTableField"),
            queryTableFields: new XName(sNs, "queryTableFields"),
            queryTableRefresh: new XName(sNs, "queryTableRefresh"),
            r: new XName(sNs, "r"),
            raf: new XName(sNs, "raf"),
            rangePr: new XName(sNs, "rangePr"),
            rangeSet: new XName(sNs, "rangeSet"),
            rangeSets: new XName(sNs, "rangeSets"),
            rc: new XName(sNs, "rc"),
            rcc: new XName(sNs, "rcc"),
            rcft: new XName(sNs, "rcft"),
            rcmt: new XName(sNs, "rcmt"),
            rcv: new XName(sNs, "rcv"),
            rdn: new XName(sNs, "rdn"),
            reference: new XName(sNs, "reference"),
            references: new XName(sNs, "references"),
            reviewed: new XName(sNs, "reviewed"),
            reviewedList: new XName(sNs, "reviewedList"),
            revisions: new XName(sNs, "revisions"),
            rfmt: new XName(sNs, "rfmt"),
            rFont: new XName(sNs, "rFont"),
            rgbColor: new XName(sNs, "rgbColor"),
            right: new XName(sNs, "right"),
            ris: new XName(sNs, "ris"),
            rm: new XName(sNs, "rm"),
            row: new XName(sNs, "row"),
            rowBreaks: new XName(sNs, "rowBreaks"),
            rowFields: new XName(sNs, "rowFields"),
            rowHierarchiesUsage: new XName(sNs, "rowHierarchiesUsage"),
            rowHierarchyUsage: new XName(sNs, "rowHierarchyUsage"),
            rowItems: new XName(sNs, "rowItems"),
            rPh: new XName(sNs, "rPh"),
            rPr: new XName(sNs, "rPr"),
            rqt: new XName(sNs, "rqt"),
            rrc: new XName(sNs, "rrc"),
            rsnm: new XName(sNs, "rsnm"),
            _s: new XName(sNs, "s"),
            scenario: new XName(sNs, "scenario"),
            scenarios: new XName(sNs, "scenarios"),
            scheme: new XName(sNs, "scheme"),
            selection: new XName(sNs, "selection"),
            serverFormat: new XName(sNs, "serverFormat"),
            serverFormats: new XName(sNs, "serverFormats"),
            set: new XName(sNs, "set"),
            sets: new XName(sNs, "sets"),
            shadow: new XName(sNs, "shadow"),
            sharedItems: new XName(sNs, "sharedItems"),
            sheet: new XName(sNs, "sheet"),
            sheetCalcPr: new XName(sNs, "sheetCalcPr"),
            sheetData: new XName(sNs, "sheetData"),
            sheetDataSet: new XName(sNs, "sheetDataSet"),
            sheetFormatPr: new XName(sNs, "sheetFormatPr"),
            sheetId: new XName(sNs, "sheetId"),
            sheetIdMap: new XName(sNs, "sheetIdMap"),
            sheetName: new XName(sNs, "sheetName"),
            sheetNames: new XName(sNs, "sheetNames"),
            sheetPr: new XName(sNs, "sheetPr"),
            sheetProtection: new XName(sNs, "sheetProtection"),
            sheets: new XName(sNs, "sheets"),
            sheetView: new XName(sNs, "sheetView"),
            sheetViews: new XName(sNs, "sheetViews"),
            si: new XName(sNs, "si"),
            singleXmlCell: new XName(sNs, "singleXmlCell"),
            singleXmlCells: new XName(sNs, "singleXmlCells"),
            smartTags: new XName(sNs, "smartTags"),
            sortByTuple: new XName(sNs, "sortByTuple"),
            sortCondition: new XName(sNs, "sortCondition"),
            sortState: new XName(sNs, "sortState"),
            sst: new XName(sNs, "sst"),
            stop: new XName(sNs, "stop"),
            stp: new XName(sNs, "stp"),
            strike: new XName(sNs, "strike"),
            styleSheet: new XName(sNs, "styleSheet"),
            sz: new XName(sNs, "sz"),
            t: new XName(sNs, "t"),
            tabColor: new XName(sNs, "tabColor"),
            table: new XName(sNs, "table"),
            tableColumn: new XName(sNs, "tableColumn"),
            tableColumns: new XName(sNs, "tableColumns"),
            tablePart: new XName(sNs, "tablePart"),
            tableParts: new XName(sNs, "tableParts"),
            tables: new XName(sNs, "tables"),
            tableStyle: new XName(sNs, "tableStyle"),
            tableStyleElement: new XName(sNs, "tableStyleElement"),
            tableStyleInfo: new XName(sNs, "tableStyleInfo"),
            tableStyles: new XName(sNs, "tableStyles"),
            text: new XName(sNs, "text"),
            textField: new XName(sNs, "textField"),
            textFields: new XName(sNs, "textFields"),
            textPr: new XName(sNs, "textPr"),
            to: new XName(sNs, "to"),
            top: new XName(sNs, "top"),
            top10: new XName(sNs, "top10"),
            totalsRowFormula: new XName(sNs, "totalsRowFormula"),
            tp: new XName(sNs, "tp"),
            tpl: new XName(sNs, "tpl"),
            tpls: new XName(sNs, "tpls"),
            tr: new XName(sNs, "tr"),
            tupleCache: new XName(sNs, "tupleCache"),
            u: new XName(sNs, "u"),
            undo: new XName(sNs, "undo"),
            userInfo: new XName(sNs, "userInfo"),
            users: new XName(sNs, "users"),
            v: new XName(sNs, "v"),
            val: new XName(sNs, "val"),
            value: new XName(sNs, "value"),
            valueMetadata: new XName(sNs, "valueMetadata"),
            values: new XName(sNs, "values"),
            vertAlign: new XName(sNs, "vertAlign"),
            vertical: new XName(sNs, "vertical"),
            volType: new XName(sNs, "volType"),
            volTypes: new XName(sNs, "volTypes"),
            webPr: new XName(sNs, "webPr"),
            webPublishItem: new XName(sNs, "webPublishItem"),
            webPublishItems: new XName(sNs, "webPublishItems"),
            worksheet: new XName(sNs, "worksheet"),
            worksheetEx14: new XName(sNs, "worksheetEx14"),
            worksheetSource: new XName(sNs, "worksheetSource"),
            x: new XName(sNs, "x"),
            xf: new XName(sNs, "xf"),
            xmlCellPr: new XName(sNs, "xmlCellPr"),
            xmlColumnPr: new XName(sNs, "xmlColumnPr"),
            xmlPr: new XName(sNs, "xmlPr"),
        }
        var S = openXml.S;

        openXml.slNs = new XNamespace("http://schemas.openxmlformats.org/schemaLibrary/2006/main");
        var slNs = openXml.slNs;
        openXml.SL = {
            manifestLocation: new XName(slNs, "manifestLocation"),
            schema: new XName(slNs, "schema"),
            schemaLibrary: new XName(slNs, "schemaLibrary"),
            uri: new XName(slNs, "uri"),
        }
        var SL = openXml.SL;

        openXml.sleNs = new XNamespace("http://schemas.microsoft.com/office/drawing/2010/slicer");
        var sleNs = openXml.sleNs;
        openXml.SLE = {
            slicer: new XName(sleNs, "slicer"),
        }
        var SLE = openXml.SLE;

        openXml.vmlNs = new XNamespace("urn:schemas-microsoft-com:vml");
        var vmlNs = openXml.vmlNs;
        openXml.VML = {
            arc: new XName(vmlNs, "arc"),
            background: new XName(vmlNs, "background"),
            curve: new XName(vmlNs, "curve"),
            ext: new XName(vmlNs, "ext"),
            f: new XName(vmlNs, "f"),
            fill: new XName(vmlNs, "fill"),
            formulas: new XName(vmlNs, "formulas"),
            group: new XName(vmlNs, "group"),
            h: new XName(vmlNs, "h"),
            handles: new XName(vmlNs, "handles"),
            image: new XName(vmlNs, "image"),
            imagedata: new XName(vmlNs, "imagedata"),
            line: new XName(vmlNs, "line"),
            oval: new XName(vmlNs, "oval"),
            path: new XName(vmlNs, "path"),
            polyline: new XName(vmlNs, "polyline"),
            rect: new XName(vmlNs, "rect"),
            roundrect: new XName(vmlNs, "roundrect"),
            shadow: new XName(vmlNs, "shadow"),
            shape: new XName(vmlNs, "shape"),
            shapetype: new XName(vmlNs, "shapetype"),
            stroke: new XName(vmlNs, "stroke"),
            textbox: new XName(vmlNs, "textbox"),
            textpath: new XName(vmlNs, "textpath"),
        }
        var VML = openXml.VML;

        openXml.vtNs = new XNamespace("http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes");
        var vtNs = openXml.vtNs;
        openXml.VT = {
            _bool: new XName(vtNs, "bool"),
            filetime: new XName(vtNs, "filetime"),
            i4: new XName(vtNs, "i4"),
            lpstr: new XName(vtNs, "lpstr"),
            lpwstr: new XName(vtNs, "lpwstr"),
            r8: new XName(vtNs, "r8"),
            variant: new XName(vtNs, "variant"),
            vector: new XName(vtNs, "vector"),
        }
        var VT = openXml.VT;

        openXml.wNs = new XNamespace("http://schemas.openxmlformats.org/wordprocessingml/2006/main");
        var wNs = openXml.wNs;
        openXml.W = {
            abstractNum: new XName(wNs, "abstractNum"),
            abstractNumId: new XName(wNs, "abstractNumId"),
            accent1: new XName(wNs, "accent1"),
            accent2: new XName(wNs, "accent2"),
            accent3: new XName(wNs, "accent3"),
            accent4: new XName(wNs, "accent4"),
            accent5: new XName(wNs, "accent5"),
            accent6: new XName(wNs, "accent6"),
            activeRecord: new XName(wNs, "activeRecord"),
            activeWritingStyle: new XName(wNs, "activeWritingStyle"),
            actualPg: new XName(wNs, "actualPg"),
            addressFieldName: new XName(wNs, "addressFieldName"),
            adjustLineHeightInTable: new XName(wNs, "adjustLineHeightInTable"),
            adjustRightInd: new XName(wNs, "adjustRightInd"),
            after: new XName(wNs, "after"),
            afterAutospacing: new XName(wNs, "afterAutospacing"),
            afterLines: new XName(wNs, "afterLines"),
            algIdExt: new XName(wNs, "algIdExt"),
            algIdExtSource: new XName(wNs, "algIdExtSource"),
            alias: new XName(wNs, "alias"),
            aliases: new XName(wNs, "aliases"),
            alignBordersAndEdges: new XName(wNs, "alignBordersAndEdges"),
            alignment: new XName(wNs, "alignment"),
            alignTablesRowByRow: new XName(wNs, "alignTablesRowByRow"),
            allowPNG: new XName(wNs, "allowPNG"),
            allowSpaceOfSameStyleInTable: new XName(wNs, "allowSpaceOfSameStyleInTable"),
            altChunk: new XName(wNs, "altChunk"),
            altChunkPr: new XName(wNs, "altChunkPr"),
            altName: new XName(wNs, "altName"),
            alwaysMergeEmptyNamespace: new XName(wNs, "alwaysMergeEmptyNamespace"),
            alwaysShowPlaceholderText: new XName(wNs, "alwaysShowPlaceholderText"),
            anchor: new XName(wNs, "anchor"),
            anchorLock: new XName(wNs, "anchorLock"),
            annotationRef: new XName(wNs, "annotationRef"),
            applyBreakingRules: new XName(wNs, "applyBreakingRules"),
            appName: new XName(wNs, "appName"),
            ascii: new XName(wNs, "ascii"),
            asciiTheme: new XName(wNs, "asciiTheme"),
            attachedSchema: new XName(wNs, "attachedSchema"),
            attachedTemplate: new XName(wNs, "attachedTemplate"),
            attr: new XName(wNs, "attr"),
            author: new XName(wNs, "author"),
            autofitToFirstFixedWidthCell: new XName(wNs, "autofitToFirstFixedWidthCell"),
            autoFormatOverride: new XName(wNs, "autoFormatOverride"),
            autoHyphenation: new XName(wNs, "autoHyphenation"),
            autoRedefine: new XName(wNs, "autoRedefine"),
            autoSpaceDE: new XName(wNs, "autoSpaceDE"),
            autoSpaceDN: new XName(wNs, "autoSpaceDN"),
            autoSpaceLikeWord95: new XName(wNs, "autoSpaceLikeWord95"),
            b: new XName(wNs, "b"),
            background: new XName(wNs, "background"),
            balanceSingleByteDoubleByteWidth: new XName(wNs, "balanceSingleByteDoubleByteWidth"),
            bar: new XName(wNs, "bar"),
            basedOn: new XName(wNs, "basedOn"),
            bCs: new XName(wNs, "bCs"),
            bdr: new XName(wNs, "bdr"),
            before: new XName(wNs, "before"),
            beforeAutospacing: new XName(wNs, "beforeAutospacing"),
            beforeLines: new XName(wNs, "beforeLines"),
            behavior: new XName(wNs, "behavior"),
            behaviors: new XName(wNs, "behaviors"),
            between: new XName(wNs, "between"),
            bg1: new XName(wNs, "bg1"),
            bg2: new XName(wNs, "bg2"),
            bibliography: new XName(wNs, "bibliography"),
            bidi: new XName(wNs, "bidi"),
            bidiVisual: new XName(wNs, "bidiVisual"),
            blockQuote: new XName(wNs, "blockQuote"),
            body: new XName(wNs, "body"),
            bodyDiv: new XName(wNs, "bodyDiv"),
            bookFoldPrinting: new XName(wNs, "bookFoldPrinting"),
            bookFoldPrintingSheets: new XName(wNs, "bookFoldPrintingSheets"),
            bookFoldRevPrinting: new XName(wNs, "bookFoldRevPrinting"),
            bookmarkEnd: new XName(wNs, "bookmarkEnd"),
            bookmarkStart: new XName(wNs, "bookmarkStart"),
            bordersDoNotSurroundFooter: new XName(wNs, "bordersDoNotSurroundFooter"),
            bordersDoNotSurroundHeader: new XName(wNs, "bordersDoNotSurroundHeader"),
            bottom: new XName(wNs, "bottom"),
            bottomFromText: new XName(wNs, "bottomFromText"),
            br: new XName(wNs, "br"),
            cachedColBalance: new XName(wNs, "cachedColBalance"),
            calcOnExit: new XName(wNs, "calcOnExit"),
            calendar: new XName(wNs, "calendar"),
            cantSplit: new XName(wNs, "cantSplit"),
            caps: new XName(wNs, "caps"),
            category: new XName(wNs, "category"),
            cellDel: new XName(wNs, "cellDel"),
            cellIns: new XName(wNs, "cellIns"),
            cellMerge: new XName(wNs, "cellMerge"),
            chapSep: new XName(wNs, "chapSep"),
            chapStyle: new XName(wNs, "chapStyle"),
            _char: new XName(wNs, "char"),
            characterSpacingControl: new XName(wNs, "characterSpacingControl"),
            charset: new XName(wNs, "charset"),
            charSpace: new XName(wNs, "charSpace"),
            checkBox: new XName(wNs, "checkBox"),
            _checked: new XName(wNs, "checked"),
            checkErrors: new XName(wNs, "checkErrors"),
            checkStyle: new XName(wNs, "checkStyle"),
            citation: new XName(wNs, "citation"),
            clear: new XName(wNs, "clear"),
            clickAndTypeStyle: new XName(wNs, "clickAndTypeStyle"),
            clrSchemeMapping: new XName(wNs, "clrSchemeMapping"),
            cnfStyle: new XName(wNs, "cnfStyle"),
            code: new XName(wNs, "code"),
            col: new XName(wNs, "col"),
            colDelim: new XName(wNs, "colDelim"),
            colFirst: new XName(wNs, "colFirst"),
            colLast: new XName(wNs, "colLast"),
            color: new XName(wNs, "color"),
            cols: new XName(wNs, "cols"),
            column: new XName(wNs, "column"),
            combine: new XName(wNs, "combine"),
            combineBrackets: new XName(wNs, "combineBrackets"),
            comboBox: new XName(wNs, "comboBox"),
            comment: new XName(wNs, "comment"),
            commentRangeEnd: new XName(wNs, "commentRangeEnd"),
            commentRangeStart: new XName(wNs, "commentRangeStart"),
            commentReference: new XName(wNs, "commentReference"),
            comments: new XName(wNs, "comments"),
            compat: new XName(wNs, "compat"),
            compatSetting: new XName(wNs, "compatSetting"),
            connectString: new XName(wNs, "connectString"),
            consecutiveHyphenLimit: new XName(wNs, "consecutiveHyphenLimit"),
            contextualSpacing: new XName(wNs, "contextualSpacing"),
            continuationSeparator: new XName(wNs, "continuationSeparator"),
            control: new XName(wNs, "control"),
            convMailMergeEsc: new XName(wNs, "convMailMergeEsc"),
            count: new XName(wNs, "count"),
            countBy: new XName(wNs, "countBy"),
            cr: new XName(wNs, "cr"),
            cryptAlgorithmClass: new XName(wNs, "cryptAlgorithmClass"),
            cryptAlgorithmSid: new XName(wNs, "cryptAlgorithmSid"),
            cryptAlgorithmType: new XName(wNs, "cryptAlgorithmType"),
            cryptProvider: new XName(wNs, "cryptProvider"),
            cryptProviderType: new XName(wNs, "cryptProviderType"),
            cryptProviderTypeExt: new XName(wNs, "cryptProviderTypeExt"),
            cryptProviderTypeExtSource: new XName(wNs, "cryptProviderTypeExtSource"),
            cryptSpinCount: new XName(wNs, "cryptSpinCount"),
            cs: new XName(wNs, "cs"),
            csb0: new XName(wNs, "csb0"),
            csb1: new XName(wNs, "csb1"),
            cstheme: new XName(wNs, "cstheme"),
            customMarkFollows: new XName(wNs, "customMarkFollows"),
            customStyle: new XName(wNs, "customStyle"),
            customXml: new XName(wNs, "customXml"),
            customXmlDelRangeEnd: new XName(wNs, "customXmlDelRangeEnd"),
            customXmlDelRangeStart: new XName(wNs, "customXmlDelRangeStart"),
            customXmlInsRangeEnd: new XName(wNs, "customXmlInsRangeEnd"),
            customXmlInsRangeStart: new XName(wNs, "customXmlInsRangeStart"),
            customXmlMoveFromRangeEnd: new XName(wNs, "customXmlMoveFromRangeEnd"),
            customXmlMoveFromRangeStart: new XName(wNs, "customXmlMoveFromRangeStart"),
            customXmlMoveToRangeEnd: new XName(wNs, "customXmlMoveToRangeEnd"),
            customXmlMoveToRangeStart: new XName(wNs, "customXmlMoveToRangeStart"),
            customXmlPr: new XName(wNs, "customXmlPr"),
            dataBinding: new XName(wNs, "dataBinding"),
            dataSource: new XName(wNs, "dataSource"),
            dataType: new XName(wNs, "dataType"),
            date: new XName(wNs, "date"),
            dateFormat: new XName(wNs, "dateFormat"),
            dayLong: new XName(wNs, "dayLong"),
            dayShort: new XName(wNs, "dayShort"),
            ddList: new XName(wNs, "ddList"),
            decimalSymbol: new XName(wNs, "decimalSymbol"),
            _default: new XName(wNs, "default"),
            defaultTableStyle: new XName(wNs, "defaultTableStyle"),
            defaultTabStop: new XName(wNs, "defaultTabStop"),
            defLockedState: new XName(wNs, "defLockedState"),
            defQFormat: new XName(wNs, "defQFormat"),
            defSemiHidden: new XName(wNs, "defSemiHidden"),
            defUIPriority: new XName(wNs, "defUIPriority"),
            defUnhideWhenUsed: new XName(wNs, "defUnhideWhenUsed"),
            del: new XName(wNs, "del"),
            delInstrText: new XName(wNs, "delInstrText"),
            delText: new XName(wNs, "delText"),
            description: new XName(wNs, "description"),
            destination: new XName(wNs, "destination"),
            dirty: new XName(wNs, "dirty"),
            displacedByCustomXml: new XName(wNs, "displacedByCustomXml"),
            display: new XName(wNs, "display"),
            displayBackgroundShape: new XName(wNs, "displayBackgroundShape"),
            displayHangulFixedWidth: new XName(wNs, "displayHangulFixedWidth"),
            displayHorizontalDrawingGridEvery: new XName(wNs, "displayHorizontalDrawingGridEvery"),
            displayText: new XName(wNs, "displayText"),
            displayVerticalDrawingGridEvery: new XName(wNs, "displayVerticalDrawingGridEvery"),
            distance: new XName(wNs, "distance"),
            div: new XName(wNs, "div"),
            divBdr: new XName(wNs, "divBdr"),
            divId: new XName(wNs, "divId"),
            divs: new XName(wNs, "divs"),
            divsChild: new XName(wNs, "divsChild"),
            dllVersion: new XName(wNs, "dllVersion"),
            docDefaults: new XName(wNs, "docDefaults"),
            docGrid: new XName(wNs, "docGrid"),
            docLocation: new XName(wNs, "docLocation"),
            docPart: new XName(wNs, "docPart"),
            docPartBody: new XName(wNs, "docPartBody"),
            docPartCategory: new XName(wNs, "docPartCategory"),
            docPartGallery: new XName(wNs, "docPartGallery"),
            docPartList: new XName(wNs, "docPartList"),
            docPartObj: new XName(wNs, "docPartObj"),
            docPartPr: new XName(wNs, "docPartPr"),
            docParts: new XName(wNs, "docParts"),
            docPartUnique: new XName(wNs, "docPartUnique"),
            document: new XName(wNs, "document"),
            documentProtection: new XName(wNs, "documentProtection"),
            documentType: new XName(wNs, "documentType"),
            docVar: new XName(wNs, "docVar"),
            docVars: new XName(wNs, "docVars"),
            doNotAutoCompressPictures: new XName(wNs, "doNotAutoCompressPictures"),
            doNotAutofitConstrainedTables: new XName(wNs, "doNotAutofitConstrainedTables"),
            doNotBreakConstrainedForcedTable: new XName(wNs, "doNotBreakConstrainedForcedTable"),
            doNotBreakWrappedTables: new XName(wNs, "doNotBreakWrappedTables"),
            doNotDemarcateInvalidXml: new XName(wNs, "doNotDemarcateInvalidXml"),
            doNotDisplayPageBoundaries: new XName(wNs, "doNotDisplayPageBoundaries"),
            doNotEmbedSmartTags: new XName(wNs, "doNotEmbedSmartTags"),
            doNotExpandShiftReturn: new XName(wNs, "doNotExpandShiftReturn"),
            doNotHyphenateCaps: new XName(wNs, "doNotHyphenateCaps"),
            doNotIncludeSubdocsInStats: new XName(wNs, "doNotIncludeSubdocsInStats"),
            doNotLeaveBackslashAlone: new XName(wNs, "doNotLeaveBackslashAlone"),
            doNotOrganizeInFolder: new XName(wNs, "doNotOrganizeInFolder"),
            doNotRelyOnCSS: new XName(wNs, "doNotRelyOnCSS"),
            doNotSaveAsSingleFile: new XName(wNs, "doNotSaveAsSingleFile"),
            doNotShadeFormData: new XName(wNs, "doNotShadeFormData"),
            doNotSnapToGridInCell: new XName(wNs, "doNotSnapToGridInCell"),
            doNotSuppressBlankLines: new XName(wNs, "doNotSuppressBlankLines"),
            doNotSuppressIndentation: new XName(wNs, "doNotSuppressIndentation"),
            doNotSuppressParagraphBorders: new XName(wNs, "doNotSuppressParagraphBorders"),
            doNotTrackFormatting: new XName(wNs, "doNotTrackFormatting"),
            doNotTrackMoves: new XName(wNs, "doNotTrackMoves"),
            doNotUseEastAsianBreakRules: new XName(wNs, "doNotUseEastAsianBreakRules"),
            doNotUseHTMLParagraphAutoSpacing: new XName(wNs, "doNotUseHTMLParagraphAutoSpacing"),
            doNotUseIndentAsNumberingTabStop: new XName(wNs, "doNotUseIndentAsNumberingTabStop"),
            doNotUseLongFileNames: new XName(wNs, "doNotUseLongFileNames"),
            doNotUseMarginsForDrawingGridOrigin: new XName(wNs, "doNotUseMarginsForDrawingGridOrigin"),
            doNotValidateAgainstSchema: new XName(wNs, "doNotValidateAgainstSchema"),
            doNotVertAlignCellWithSp: new XName(wNs, "doNotVertAlignCellWithSp"),
            doNotVertAlignInTxbx: new XName(wNs, "doNotVertAlignInTxbx"),
            doNotWrapTextWithPunct: new XName(wNs, "doNotWrapTextWithPunct"),
            drawing: new XName(wNs, "drawing"),
            drawingGridHorizontalOrigin: new XName(wNs, "drawingGridHorizontalOrigin"),
            drawingGridHorizontalSpacing: new XName(wNs, "drawingGridHorizontalSpacing"),
            drawingGridVerticalOrigin: new XName(wNs, "drawingGridVerticalOrigin"),
            drawingGridVerticalSpacing: new XName(wNs, "drawingGridVerticalSpacing"),
            dropCap: new XName(wNs, "dropCap"),
            dropDownList: new XName(wNs, "dropDownList"),
            dstrike: new XName(wNs, "dstrike"),
            dxaOrig: new XName(wNs, "dxaOrig"),
            dyaOrig: new XName(wNs, "dyaOrig"),
            dynamicAddress: new XName(wNs, "dynamicAddress"),
            eastAsia: new XName(wNs, "eastAsia"),
            eastAsianLayout: new XName(wNs, "eastAsianLayout"),
            eastAsiaTheme: new XName(wNs, "eastAsiaTheme"),
            ed: new XName(wNs, "ed"),
            edGrp: new XName(wNs, "edGrp"),
            edit: new XName(wNs, "edit"),
            effect: new XName(wNs, "effect"),
            element: new XName(wNs, "element"),
            em: new XName(wNs, "em"),
            embedBold: new XName(wNs, "embedBold"),
            embedBoldItalic: new XName(wNs, "embedBoldItalic"),
            embedItalic: new XName(wNs, "embedItalic"),
            embedRegular: new XName(wNs, "embedRegular"),
            embedSystemFonts: new XName(wNs, "embedSystemFonts"),
            embedTrueTypeFonts: new XName(wNs, "embedTrueTypeFonts"),
            emboss: new XName(wNs, "emboss"),
            enabled: new XName(wNs, "enabled"),
            encoding: new XName(wNs, "encoding"),
            endnote: new XName(wNs, "endnote"),
            endnotePr: new XName(wNs, "endnotePr"),
            endnoteRef: new XName(wNs, "endnoteRef"),
            endnoteReference: new XName(wNs, "endnoteReference"),
            endnotes: new XName(wNs, "endnotes"),
            enforcement: new XName(wNs, "enforcement"),
            entryMacro: new XName(wNs, "entryMacro"),
            equalWidth: new XName(wNs, "equalWidth"),
            equation: new XName(wNs, "equation"),
            evenAndOddHeaders: new XName(wNs, "evenAndOddHeaders"),
            exitMacro: new XName(wNs, "exitMacro"),
            family: new XName(wNs, "family"),
            ffData: new XName(wNs, "ffData"),
            fHdr: new XName(wNs, "fHdr"),
            fieldMapData: new XName(wNs, "fieldMapData"),
            fill: new XName(wNs, "fill"),
            first: new XName(wNs, "first"),
            firstColumn: new XName(wNs, "firstColumn"),
            firstLine: new XName(wNs, "firstLine"),
            firstLineChars: new XName(wNs, "firstLineChars"),
            firstRow: new XName(wNs, "firstRow"),
            fitText: new XName(wNs, "fitText"),
            flatBorders: new XName(wNs, "flatBorders"),
            fldChar: new XName(wNs, "fldChar"),
            fldCharType: new XName(wNs, "fldCharType"),
            fldData: new XName(wNs, "fldData"),
            fldLock: new XName(wNs, "fldLock"),
            fldSimple: new XName(wNs, "fldSimple"),
            fmt: new XName(wNs, "fmt"),
            followedHyperlink: new XName(wNs, "followedHyperlink"),
            font: new XName(wNs, "font"),
            fontKey: new XName(wNs, "fontKey"),
            fonts: new XName(wNs, "fonts"),
            fontSz: new XName(wNs, "fontSz"),
            footer: new XName(wNs, "footer"),
            footerReference: new XName(wNs, "footerReference"),
            footnote: new XName(wNs, "footnote"),
            footnoteLayoutLikeWW8: new XName(wNs, "footnoteLayoutLikeWW8"),
            footnotePr: new XName(wNs, "footnotePr"),
            footnoteRef: new XName(wNs, "footnoteRef"),
            footnoteReference: new XName(wNs, "footnoteReference"),
            footnotes: new XName(wNs, "footnotes"),
            forceUpgrade: new XName(wNs, "forceUpgrade"),
            forgetLastTabAlignment: new XName(wNs, "forgetLastTabAlignment"),
            format: new XName(wNs, "format"),
            formatting: new XName(wNs, "formatting"),
            formProt: new XName(wNs, "formProt"),
            formsDesign: new XName(wNs, "formsDesign"),
            frame: new XName(wNs, "frame"),
            frameLayout: new XName(wNs, "frameLayout"),
            framePr: new XName(wNs, "framePr"),
            frameset: new XName(wNs, "frameset"),
            framesetSplitbar: new XName(wNs, "framesetSplitbar"),
            ftr: new XName(wNs, "ftr"),
            fullDate: new XName(wNs, "fullDate"),
            gallery: new XName(wNs, "gallery"),
            glossaryDocument: new XName(wNs, "glossaryDocument"),
            grammar: new XName(wNs, "grammar"),
            gridAfter: new XName(wNs, "gridAfter"),
            gridBefore: new XName(wNs, "gridBefore"),
            gridCol: new XName(wNs, "gridCol"),
            gridSpan: new XName(wNs, "gridSpan"),
            group: new XName(wNs, "group"),
            growAutofit: new XName(wNs, "growAutofit"),
            guid: new XName(wNs, "guid"),
            gutter: new XName(wNs, "gutter"),
            gutterAtTop: new XName(wNs, "gutterAtTop"),
            h: new XName(wNs, "h"),
            hAnchor: new XName(wNs, "hAnchor"),
            hanging: new XName(wNs, "hanging"),
            hangingChars: new XName(wNs, "hangingChars"),
            hAnsi: new XName(wNs, "hAnsi"),
            hAnsiTheme: new XName(wNs, "hAnsiTheme"),
            hash: new XName(wNs, "hash"),
            hdr: new XName(wNs, "hdr"),
            hdrShapeDefaults: new XName(wNs, "hdrShapeDefaults"),
            header: new XName(wNs, "header"),
            headerReference: new XName(wNs, "headerReference"),
            headerSource: new XName(wNs, "headerSource"),
            helpText: new XName(wNs, "helpText"),
            hidden: new XName(wNs, "hidden"),
            hideGrammaticalErrors: new XName(wNs, "hideGrammaticalErrors"),
            hideMark: new XName(wNs, "hideMark"),
            hideSpellingErrors: new XName(wNs, "hideSpellingErrors"),
            highlight: new XName(wNs, "highlight"),
            hint: new XName(wNs, "hint"),
            history: new XName(wNs, "history"),
            hMerge: new XName(wNs, "hMerge"),
            horzAnchor: new XName(wNs, "horzAnchor"),
            hps: new XName(wNs, "hps"),
            hpsBaseText: new XName(wNs, "hpsBaseText"),
            hpsRaise: new XName(wNs, "hpsRaise"),
            hRule: new XName(wNs, "hRule"),
            hSpace: new XName(wNs, "hSpace"),
            hyperlink: new XName(wNs, "hyperlink"),
            hyphenationZone: new XName(wNs, "hyphenationZone"),
            i: new XName(wNs, "i"),
            iCs: new XName(wNs, "iCs"),
            id: new XName(wNs, "id"),
            ignoreMixedContent: new XName(wNs, "ignoreMixedContent"),
            ilvl: new XName(wNs, "ilvl"),
            imprint: new XName(wNs, "imprint"),
            ind: new XName(wNs, "ind"),
            initials: new XName(wNs, "initials"),
            inkAnnotations: new XName(wNs, "inkAnnotations"),
            ins: new XName(wNs, "ins"),
            insDel: new XName(wNs, "insDel"),
            insideH: new XName(wNs, "insideH"),
            insideV: new XName(wNs, "insideV"),
            instr: new XName(wNs, "instr"),
            instrText: new XName(wNs, "instrText"),
            isLgl: new XName(wNs, "isLgl"),
            jc: new XName(wNs, "jc"),
            keepLines: new XName(wNs, "keepLines"),
            keepNext: new XName(wNs, "keepNext"),
            kern: new XName(wNs, "kern"),
            kinsoku: new XName(wNs, "kinsoku"),
            lang: new XName(wNs, "lang"),
            lastColumn: new XName(wNs, "lastColumn"),
            lastRenderedPageBreak: new XName(wNs, "lastRenderedPageBreak"),
            lastRow: new XName(wNs, "lastRow"),
            lastValue: new XName(wNs, "lastValue"),
            latentStyles: new XName(wNs, "latentStyles"),
            layoutRawTableWidth: new XName(wNs, "layoutRawTableWidth"),
            layoutTableRowsApart: new XName(wNs, "layoutTableRowsApart"),
            leader: new XName(wNs, "leader"),
            left: new XName(wNs, "left"),
            leftChars: new XName(wNs, "leftChars"),
            leftFromText: new XName(wNs, "leftFromText"),
            legacy: new XName(wNs, "legacy"),
            legacyIndent: new XName(wNs, "legacyIndent"),
            legacySpace: new XName(wNs, "legacySpace"),
            lid: new XName(wNs, "lid"),
            line: new XName(wNs, "line"),
            linePitch: new XName(wNs, "linePitch"),
            lineRule: new XName(wNs, "lineRule"),
            lines: new XName(wNs, "lines"),
            lineWrapLikeWord6: new XName(wNs, "lineWrapLikeWord6"),
            link: new XName(wNs, "link"),
            linkedToFile: new XName(wNs, "linkedToFile"),
            linkStyles: new XName(wNs, "linkStyles"),
            linkToQuery: new XName(wNs, "linkToQuery"),
            listEntry: new XName(wNs, "listEntry"),
            listItem: new XName(wNs, "listItem"),
            listSeparator: new XName(wNs, "listSeparator"),
            lnNumType: new XName(wNs, "lnNumType"),
            _lock: new XName(wNs, "lock"),
            locked: new XName(wNs, "locked"),
            lsdException: new XName(wNs, "lsdException"),
            lvl: new XName(wNs, "lvl"),
            lvlJc: new XName(wNs, "lvlJc"),
            lvlOverride: new XName(wNs, "lvlOverride"),
            lvlPicBulletId: new XName(wNs, "lvlPicBulletId"),
            lvlRestart: new XName(wNs, "lvlRestart"),
            lvlText: new XName(wNs, "lvlText"),
            mailAsAttachment: new XName(wNs, "mailAsAttachment"),
            mailMerge: new XName(wNs, "mailMerge"),
            mailSubject: new XName(wNs, "mailSubject"),
            mainDocumentType: new XName(wNs, "mainDocumentType"),
            mappedName: new XName(wNs, "mappedName"),
            marBottom: new XName(wNs, "marBottom"),
            marH: new XName(wNs, "marH"),
            markup: new XName(wNs, "markup"),
            marLeft: new XName(wNs, "marLeft"),
            marRight: new XName(wNs, "marRight"),
            marTop: new XName(wNs, "marTop"),
            marW: new XName(wNs, "marW"),
            matchSrc: new XName(wNs, "matchSrc"),
            maxLength: new XName(wNs, "maxLength"),
            mirrorIndents: new XName(wNs, "mirrorIndents"),
            mirrorMargins: new XName(wNs, "mirrorMargins"),
            monthLong: new XName(wNs, "monthLong"),
            monthShort: new XName(wNs, "monthShort"),
            moveFrom: new XName(wNs, "moveFrom"),
            moveFromRangeEnd: new XName(wNs, "moveFromRangeEnd"),
            moveFromRangeStart: new XName(wNs, "moveFromRangeStart"),
            moveTo: new XName(wNs, "moveTo"),
            moveToRangeEnd: new XName(wNs, "moveToRangeEnd"),
            moveToRangeStart: new XName(wNs, "moveToRangeStart"),
            multiLevelType: new XName(wNs, "multiLevelType"),
            multiLine: new XName(wNs, "multiLine"),
            mwSmallCaps: new XName(wNs, "mwSmallCaps"),
            name: new XName(wNs, "name"),
            namespaceuri: new XName(wNs, "namespaceuri"),
            next: new XName(wNs, "next"),
            nlCheck: new XName(wNs, "nlCheck"),
            noBorder: new XName(wNs, "noBorder"),
            noBreakHyphen: new XName(wNs, "noBreakHyphen"),
            noColumnBalance: new XName(wNs, "noColumnBalance"),
            noEndnote: new XName(wNs, "noEndnote"),
            noExtraLineSpacing: new XName(wNs, "noExtraLineSpacing"),
            noHBand: new XName(wNs, "noHBand"),
            noLeading: new XName(wNs, "noLeading"),
            noLineBreaksAfter: new XName(wNs, "noLineBreaksAfter"),
            noLineBreaksBefore: new XName(wNs, "noLineBreaksBefore"),
            noProof: new XName(wNs, "noProof"),
            noPunctuationKerning: new XName(wNs, "noPunctuationKerning"),
            noResizeAllowed: new XName(wNs, "noResizeAllowed"),
            noSpaceRaiseLower: new XName(wNs, "noSpaceRaiseLower"),
            noTabHangInd: new XName(wNs, "noTabHangInd"),
            notTrueType: new XName(wNs, "notTrueType"),
            noVBand: new XName(wNs, "noVBand"),
            noWrap: new XName(wNs, "noWrap"),
            nsid: new XName(wNs, "nsid"),
            _null: new XName(wNs, "null"),
            num: new XName(wNs, "num"),
            numbering: new XName(wNs, "numbering"),
            numberingChange: new XName(wNs, "numberingChange"),
            numFmt: new XName(wNs, "numFmt"),
            numId: new XName(wNs, "numId"),
            numIdMacAtCleanup: new XName(wNs, "numIdMacAtCleanup"),
            numPicBullet: new XName(wNs, "numPicBullet"),
            numPicBulletId: new XName(wNs, "numPicBulletId"),
            numPr: new XName(wNs, "numPr"),
            numRestart: new XName(wNs, "numRestart"),
            numStart: new XName(wNs, "numStart"),
            numStyleLink: new XName(wNs, "numStyleLink"),
            _object: new XName(wNs, "object"),
            odso: new XName(wNs, "odso"),
            offsetFrom: new XName(wNs, "offsetFrom"),
            oMath: new XName(wNs, "oMath"),
            optimizeForBrowser: new XName(wNs, "optimizeForBrowser"),
            orient: new XName(wNs, "orient"),
            original: new XName(wNs, "original"),
            other: new XName(wNs, "other"),
            outline: new XName(wNs, "outline"),
            outlineLvl: new XName(wNs, "outlineLvl"),
            overflowPunct: new XName(wNs, "overflowPunct"),
            p: new XName(wNs, "p"),
            pageBreakBefore: new XName(wNs, "pageBreakBefore"),
            panose1: new XName(wNs, "panose1"),
            paperSrc: new XName(wNs, "paperSrc"),
            pBdr: new XName(wNs, "pBdr"),
            percent: new XName(wNs, "percent"),
            permEnd: new XName(wNs, "permEnd"),
            permStart: new XName(wNs, "permStart"),
            personal: new XName(wNs, "personal"),
            personalCompose: new XName(wNs, "personalCompose"),
            personalReply: new XName(wNs, "personalReply"),
            pgBorders: new XName(wNs, "pgBorders"),
            pgMar: new XName(wNs, "pgMar"),
            pgNum: new XName(wNs, "pgNum"),
            pgNumType: new XName(wNs, "pgNumType"),
            pgSz: new XName(wNs, "pgSz"),
            pict: new XName(wNs, "pict"),
            picture: new XName(wNs, "picture"),
            pitch: new XName(wNs, "pitch"),
            pixelsPerInch: new XName(wNs, "pixelsPerInch"),
            placeholder: new XName(wNs, "placeholder"),
            pos: new XName(wNs, "pos"),
            position: new XName(wNs, "position"),
            pPr: new XName(wNs, "pPr"),
            pPrChange: new XName(wNs, "pPrChange"),
            pPrDefault: new XName(wNs, "pPrDefault"),
            prefixMappings: new XName(wNs, "prefixMappings"),
            printBodyTextBeforeHeader: new XName(wNs, "printBodyTextBeforeHeader"),
            printColBlack: new XName(wNs, "printColBlack"),
            printerSettings: new XName(wNs, "printerSettings"),
            printFormsData: new XName(wNs, "printFormsData"),
            printFractionalCharacterWidth: new XName(wNs, "printFractionalCharacterWidth"),
            printPostScriptOverText: new XName(wNs, "printPostScriptOverText"),
            printTwoOnOne: new XName(wNs, "printTwoOnOne"),
            proofErr: new XName(wNs, "proofErr"),
            proofState: new XName(wNs, "proofState"),
            pStyle: new XName(wNs, "pStyle"),
            ptab: new XName(wNs, "ptab"),
            qFormat: new XName(wNs, "qFormat"),
            query: new XName(wNs, "query"),
            r: new XName(wNs, "r"),
            readModeInkLockDown: new XName(wNs, "readModeInkLockDown"),
            recipientData: new XName(wNs, "recipientData"),
            recommended: new XName(wNs, "recommended"),
            relativeTo: new XName(wNs, "relativeTo"),
            relyOnVML: new XName(wNs, "relyOnVML"),
            removeDateAndTime: new XName(wNs, "removeDateAndTime"),
            removePersonalInformation: new XName(wNs, "removePersonalInformation"),
            restart: new XName(wNs, "restart"),
            result: new XName(wNs, "result"),
            revisionView: new XName(wNs, "revisionView"),
            rFonts: new XName(wNs, "rFonts"),
            right: new XName(wNs, "right"),
            rightChars: new XName(wNs, "rightChars"),
            rightFromText: new XName(wNs, "rightFromText"),
            rPr: new XName(wNs, "rPr"),
            rPrChange: new XName(wNs, "rPrChange"),
            rPrDefault: new XName(wNs, "rPrDefault"),
            rsid: new XName(wNs, "rsid"),
            rsidDel: new XName(wNs, "rsidDel"),
            rsidP: new XName(wNs, "rsidP"),
            rsidR: new XName(wNs, "rsidR"),
            rsidRDefault: new XName(wNs, "rsidRDefault"),
            rsidRoot: new XName(wNs, "rsidRoot"),
            rsidRPr: new XName(wNs, "rsidRPr"),
            rsids: new XName(wNs, "rsids"),
            rsidSect: new XName(wNs, "rsidSect"),
            rsidTr: new XName(wNs, "rsidTr"),
            rStyle: new XName(wNs, "rStyle"),
            rt: new XName(wNs, "rt"),
            rtl: new XName(wNs, "rtl"),
            rtlGutter: new XName(wNs, "rtlGutter"),
            ruby: new XName(wNs, "ruby"),
            rubyAlign: new XName(wNs, "rubyAlign"),
            rubyBase: new XName(wNs, "rubyBase"),
            rubyPr: new XName(wNs, "rubyPr"),
            salt: new XName(wNs, "salt"),
            saveFormsData: new XName(wNs, "saveFormsData"),
            saveInvalidXml: new XName(wNs, "saveInvalidXml"),
            savePreviewPicture: new XName(wNs, "savePreviewPicture"),
            saveSmartTagsAsXml: new XName(wNs, "saveSmartTagsAsXml"),
            saveSubsetFonts: new XName(wNs, "saveSubsetFonts"),
            saveThroughXslt: new XName(wNs, "saveThroughXslt"),
            saveXmlDataOnly: new XName(wNs, "saveXmlDataOnly"),
            scrollbar: new XName(wNs, "scrollbar"),
            sdt: new XName(wNs, "sdt"),
            sdtContent: new XName(wNs, "sdtContent"),
            sdtEndPr: new XName(wNs, "sdtEndPr"),
            sdtPr: new XName(wNs, "sdtPr"),
            sectPr: new XName(wNs, "sectPr"),
            sectPrChange: new XName(wNs, "sectPrChange"),
            selectFldWithFirstOrLastChar: new XName(wNs, "selectFldWithFirstOrLastChar"),
            semiHidden: new XName(wNs, "semiHidden"),
            sep: new XName(wNs, "sep"),
            separator: new XName(wNs, "separator"),
            settings: new XName(wNs, "settings"),
            shadow: new XName(wNs, "shadow"),
            shapeDefaults: new XName(wNs, "shapeDefaults"),
            shapeid: new XName(wNs, "shapeid"),
            shapeLayoutLikeWW8: new XName(wNs, "shapeLayoutLikeWW8"),
            shd: new XName(wNs, "shd"),
            showBreaksInFrames: new XName(wNs, "showBreaksInFrames"),
            showEnvelope: new XName(wNs, "showEnvelope"),
            showingPlcHdr: new XName(wNs, "showingPlcHdr"),
            showXMLTags: new XName(wNs, "showXMLTags"),
            sig: new XName(wNs, "sig"),
            size: new XName(wNs, "size"),
            sizeAuto: new XName(wNs, "sizeAuto"),
            smallCaps: new XName(wNs, "smallCaps"),
            smartTag: new XName(wNs, "smartTag"),
            smartTagPr: new XName(wNs, "smartTagPr"),
            smartTagType: new XName(wNs, "smartTagType"),
            snapToGrid: new XName(wNs, "snapToGrid"),
            softHyphen: new XName(wNs, "softHyphen"),
            solutionID: new XName(wNs, "solutionID"),
            sourceFileName: new XName(wNs, "sourceFileName"),
            space: new XName(wNs, "space"),
            spaceForUL: new XName(wNs, "spaceForUL"),
            spacing: new XName(wNs, "spacing"),
            spacingInWholePoints: new XName(wNs, "spacingInWholePoints"),
            specVanish: new XName(wNs, "specVanish"),
            spelling: new XName(wNs, "spelling"),
            splitPgBreakAndParaMark: new XName(wNs, "splitPgBreakAndParaMark"),
            src: new XName(wNs, "src"),
            start: new XName(wNs, "start"),
            startOverride: new XName(wNs, "startOverride"),
            statusText: new XName(wNs, "statusText"),
            storeItemID: new XName(wNs, "storeItemID"),
            storeMappedDataAs: new XName(wNs, "storeMappedDataAs"),
            strictFirstAndLastChars: new XName(wNs, "strictFirstAndLastChars"),
            strike: new XName(wNs, "strike"),
            style: new XName(wNs, "style"),
            styleId: new XName(wNs, "styleId"),
            styleLink: new XName(wNs, "styleLink"),
            styleLockQFSet: new XName(wNs, "styleLockQFSet"),
            styleLockTheme: new XName(wNs, "styleLockTheme"),
            stylePaneFormatFilter: new XName(wNs, "stylePaneFormatFilter"),
            stylePaneSortMethod: new XName(wNs, "stylePaneSortMethod"),
            styles: new XName(wNs, "styles"),
            subDoc: new XName(wNs, "subDoc"),
            subFontBySize: new XName(wNs, "subFontBySize"),
            subsetted: new XName(wNs, "subsetted"),
            suff: new XName(wNs, "suff"),
            summaryLength: new XName(wNs, "summaryLength"),
            suppressAutoHyphens: new XName(wNs, "suppressAutoHyphens"),
            suppressBottomSpacing: new XName(wNs, "suppressBottomSpacing"),
            suppressLineNumbers: new XName(wNs, "suppressLineNumbers"),
            suppressOverlap: new XName(wNs, "suppressOverlap"),
            suppressSpacingAtTopOfPage: new XName(wNs, "suppressSpacingAtTopOfPage"),
            suppressSpBfAfterPgBrk: new XName(wNs, "suppressSpBfAfterPgBrk"),
            suppressTopSpacing: new XName(wNs, "suppressTopSpacing"),
            suppressTopSpacingWP: new XName(wNs, "suppressTopSpacingWP"),
            swapBordersFacingPages: new XName(wNs, "swapBordersFacingPages"),
            sym: new XName(wNs, "sym"),
            sz: new XName(wNs, "sz"),
            szCs: new XName(wNs, "szCs"),
            t: new XName(wNs, "t"),
            t1: new XName(wNs, "t1"),
            t2: new XName(wNs, "t2"),
            tab: new XName(wNs, "tab"),
            table: new XName(wNs, "table"),
            tabs: new XName(wNs, "tabs"),
            tag: new XName(wNs, "tag"),
            targetScreenSz: new XName(wNs, "targetScreenSz"),
            tbl: new XName(wNs, "tbl"),
            tblBorders: new XName(wNs, "tblBorders"),
            tblCellMar: new XName(wNs, "tblCellMar"),
            tblCellSpacing: new XName(wNs, "tblCellSpacing"),
            tblGrid: new XName(wNs, "tblGrid"),
            tblGridChange: new XName(wNs, "tblGridChange"),
            tblHeader: new XName(wNs, "tblHeader"),
            tblInd: new XName(wNs, "tblInd"),
            tblLayout: new XName(wNs, "tblLayout"),
            tblLook: new XName(wNs, "tblLook"),
            tblOverlap: new XName(wNs, "tblOverlap"),
            tblpPr: new XName(wNs, "tblpPr"),
            tblPr: new XName(wNs, "tblPr"),
            tblPrChange: new XName(wNs, "tblPrChange"),
            tblPrEx: new XName(wNs, "tblPrEx"),
            tblPrExChange: new XName(wNs, "tblPrExChange"),
            tblpX: new XName(wNs, "tblpX"),
            tblpXSpec: new XName(wNs, "tblpXSpec"),
            tblpY: new XName(wNs, "tblpY"),
            tblpYSpec: new XName(wNs, "tblpYSpec"),
            tblStyle: new XName(wNs, "tblStyle"),
            tblStyleColBandSize: new XName(wNs, "tblStyleColBandSize"),
            tblStylePr: new XName(wNs, "tblStylePr"),
            tblStyleRowBandSize: new XName(wNs, "tblStyleRowBandSize"),
            tblW: new XName(wNs, "tblW"),
            tc: new XName(wNs, "tc"),
            tcBorders: new XName(wNs, "tcBorders"),
            tcFitText: new XName(wNs, "tcFitText"),
            tcMar: new XName(wNs, "tcMar"),
            tcPr: new XName(wNs, "tcPr"),
            tcPrChange: new XName(wNs, "tcPrChange"),
            tcW: new XName(wNs, "tcW"),
            temporary: new XName(wNs, "temporary"),
            tentative: new XName(wNs, "tentative"),
            text: new XName(wNs, "text"),
            textAlignment: new XName(wNs, "textAlignment"),
            textboxTightWrap: new XName(wNs, "textboxTightWrap"),
            textDirection: new XName(wNs, "textDirection"),
            textInput: new XName(wNs, "textInput"),
            tgtFrame: new XName(wNs, "tgtFrame"),
            themeColor: new XName(wNs, "themeColor"),
            themeFill: new XName(wNs, "themeFill"),
            themeFillShade: new XName(wNs, "themeFillShade"),
            themeFillTint: new XName(wNs, "themeFillTint"),
            themeFontLang: new XName(wNs, "themeFontLang"),
            themeShade: new XName(wNs, "themeShade"),
            themeTint: new XName(wNs, "themeTint"),
            titlePg: new XName(wNs, "titlePg"),
            tl2br: new XName(wNs, "tl2br"),
            tmpl: new XName(wNs, "tmpl"),
            tooltip: new XName(wNs, "tooltip"),
            top: new XName(wNs, "top"),
            topFromText: new XName(wNs, "topFromText"),
            topLinePunct: new XName(wNs, "topLinePunct"),
            tplc: new XName(wNs, "tplc"),
            tr: new XName(wNs, "tr"),
            tr2bl: new XName(wNs, "tr2bl"),
            trackRevisions: new XName(wNs, "trackRevisions"),
            trHeight: new XName(wNs, "trHeight"),
            trPr: new XName(wNs, "trPr"),
            trPrChange: new XName(wNs, "trPrChange"),
            truncateFontHeightsLikeWP6: new XName(wNs, "truncateFontHeightsLikeWP6"),
            txbxContent: new XName(wNs, "txbxContent"),
            type: new XName(wNs, "type"),
            types: new XName(wNs, "types"),
            u: new XName(wNs, "u"),
            udl: new XName(wNs, "udl"),
            uiCompat97To2003: new XName(wNs, "uiCompat97To2003"),
            uiPriority: new XName(wNs, "uiPriority"),
            ulTrailSpace: new XName(wNs, "ulTrailSpace"),
            underlineTabInNumList: new XName(wNs, "underlineTabInNumList"),
            unhideWhenUsed: new XName(wNs, "unhideWhenUsed"),
            updateFields: new XName(wNs, "updateFields"),
            uri: new XName(wNs, "uri"),
            url: new XName(wNs, "url"),
            usb0: new XName(wNs, "usb0"),
            usb1: new XName(wNs, "usb1"),
            usb2: new XName(wNs, "usb2"),
            usb3: new XName(wNs, "usb3"),
            useAltKinsokuLineBreakRules: new XName(wNs, "useAltKinsokuLineBreakRules"),
            useAnsiKerningPairs: new XName(wNs, "useAnsiKerningPairs"),
            useFELayout: new XName(wNs, "useFELayout"),
            useNormalStyleForList: new XName(wNs, "useNormalStyleForList"),
            usePrinterMetrics: new XName(wNs, "usePrinterMetrics"),
            useSingleBorderforContiguousCells: new XName(wNs, "useSingleBorderforContiguousCells"),
            useWord2002TableStyleRules: new XName(wNs, "useWord2002TableStyleRules"),
            useWord97LineBreakRules: new XName(wNs, "useWord97LineBreakRules"),
            useXSLTWhenSaving: new XName(wNs, "useXSLTWhenSaving"),
            val: new XName(wNs, "val"),
            vAlign: new XName(wNs, "vAlign"),
            value: new XName(wNs, "value"),
            vAnchor: new XName(wNs, "vAnchor"),
            vanish: new XName(wNs, "vanish"),
            vendorID: new XName(wNs, "vendorID"),
            vert: new XName(wNs, "vert"),
            vertAlign: new XName(wNs, "vertAlign"),
            vertAnchor: new XName(wNs, "vertAnchor"),
            vertCompress: new XName(wNs, "vertCompress"),
            view: new XName(wNs, "view"),
            viewMergedData: new XName(wNs, "viewMergedData"),
            vMerge: new XName(wNs, "vMerge"),
            vMergeOrig: new XName(wNs, "vMergeOrig"),
            vSpace: new XName(wNs, "vSpace"),
            _w: new XName(wNs, "w"),
            wAfter: new XName(wNs, "wAfter"),
            wBefore: new XName(wNs, "wBefore"),
            webHidden: new XName(wNs, "webHidden"),
            webSettings: new XName(wNs, "webSettings"),
            widowControl: new XName(wNs, "widowControl"),
            wordWrap: new XName(wNs, "wordWrap"),
            wpJustification: new XName(wNs, "wpJustification"),
            wpSpaceWidth: new XName(wNs, "wpSpaceWidth"),
            wrap: new XName(wNs, "wrap"),
            wrapTrailSpaces: new XName(wNs, "wrapTrailSpaces"),
            writeProtection: new XName(wNs, "writeProtection"),
            x: new XName(wNs, "x"),
            xAlign: new XName(wNs, "xAlign"),
            xpath: new XName(wNs, "xpath"),
            y: new XName(wNs, "y"),
            yAlign: new XName(wNs, "yAlign"),
            yearLong: new XName(wNs, "yearLong"),
            yearShort: new XName(wNs, "yearShort"),
            zoom: new XName(wNs, "zoom"),
            zOrder: new XName(wNs, "zOrder"),
        }
        var W = openXml.W;

        openXml.w10Ns = new XNamespace("urn:schemas-microsoft-com:office:word");
        var w10Ns = openXml.w10Ns;
        openXml.W10 = {
            anchorlock: new XName(w10Ns, "anchorlock"),
            borderbottom: new XName(w10Ns, "borderbottom"),
            borderleft: new XName(w10Ns, "borderleft"),
            borderright: new XName(w10Ns, "borderright"),
            bordertop: new XName(w10Ns, "bordertop"),
            wrap: new XName(w10Ns, "wrap"),
        }
        var W10 = openXml.W10;

        openXml.w14Ns = new XNamespace("http://schemas.microsoft.com/office/word/2010/wordml");
        var w14Ns = openXml.w14Ns;
        openXml.W14 = {
            algn: new XName(w14Ns, "algn"),
            alpha: new XName(w14Ns, "alpha"),
            ang: new XName(w14Ns, "ang"),
            b: new XName(w14Ns, "b"),
            bevel: new XName(w14Ns, "bevel"),
            bevelB: new XName(w14Ns, "bevelB"),
            bevelT: new XName(w14Ns, "bevelT"),
            blurRad: new XName(w14Ns, "blurRad"),
            camera: new XName(w14Ns, "camera"),
            cap: new XName(w14Ns, "cap"),
            checkbox: new XName(w14Ns, "checkbox"),
            _checked: new XName(w14Ns, "checked"),
            checkedState: new XName(w14Ns, "checkedState"),
            cmpd: new XName(w14Ns, "cmpd"),
            cntxtAlts: new XName(w14Ns, "cntxtAlts"),
            cNvContentPartPr: new XName(w14Ns, "cNvContentPartPr"),
            conflictMode: new XName(w14Ns, "conflictMode"),
            contentPart: new XName(w14Ns, "contentPart"),
            contourClr: new XName(w14Ns, "contourClr"),
            contourW: new XName(w14Ns, "contourW"),
            defaultImageDpi: new XName(w14Ns, "defaultImageDpi"),
            dir: new XName(w14Ns, "dir"),
            discardImageEditingData: new XName(w14Ns, "discardImageEditingData"),
            dist: new XName(w14Ns, "dist"),
            docId: new XName(w14Ns, "docId"),
            editId: new XName(w14Ns, "editId"),
            enableOpenTypeKerning: new XName(w14Ns, "enableOpenTypeKerning"),
            endA: new XName(w14Ns, "endA"),
            endPos: new XName(w14Ns, "endPos"),
            entityPicker: new XName(w14Ns, "entityPicker"),
            extrusionClr: new XName(w14Ns, "extrusionClr"),
            extrusionH: new XName(w14Ns, "extrusionH"),
            fadeDir: new XName(w14Ns, "fadeDir"),
            fillToRect: new XName(w14Ns, "fillToRect"),
            font: new XName(w14Ns, "font"),
            glow: new XName(w14Ns, "glow"),
            gradFill: new XName(w14Ns, "gradFill"),
            gs: new XName(w14Ns, "gs"),
            gsLst: new XName(w14Ns, "gsLst"),
            h: new XName(w14Ns, "h"),
            hueMod: new XName(w14Ns, "hueMod"),
            id: new XName(w14Ns, "id"),
            kx: new XName(w14Ns, "kx"),
            ky: new XName(w14Ns, "ky"),
            l: new XName(w14Ns, "l"),
            lat: new XName(w14Ns, "lat"),
            ligatures: new XName(w14Ns, "ligatures"),
            lightRig: new XName(w14Ns, "lightRig"),
            lim: new XName(w14Ns, "lim"),
            lin: new XName(w14Ns, "lin"),
            lon: new XName(w14Ns, "lon"),
            lumMod: new XName(w14Ns, "lumMod"),
            lumOff: new XName(w14Ns, "lumOff"),
            miter: new XName(w14Ns, "miter"),
            noFill: new XName(w14Ns, "noFill"),
            numForm: new XName(w14Ns, "numForm"),
            numSpacing: new XName(w14Ns, "numSpacing"),
            nvContentPartPr: new XName(w14Ns, "nvContentPartPr"),
            paraId: new XName(w14Ns, "paraId"),
            path: new XName(w14Ns, "path"),
            pos: new XName(w14Ns, "pos"),
            props3d: new XName(w14Ns, "props3d"),
            prst: new XName(w14Ns, "prst"),
            prstDash: new XName(w14Ns, "prstDash"),
            prstMaterial: new XName(w14Ns, "prstMaterial"),
            r: new XName(w14Ns, "r"),
            rad: new XName(w14Ns, "rad"),
            reflection: new XName(w14Ns, "reflection"),
            rev: new XName(w14Ns, "rev"),
            rig: new XName(w14Ns, "rig"),
            rot: new XName(w14Ns, "rot"),
            round: new XName(w14Ns, "round"),
            sat: new XName(w14Ns, "sat"),
            satMod: new XName(w14Ns, "satMod"),
            satOff: new XName(w14Ns, "satOff"),
            scaled: new XName(w14Ns, "scaled"),
            scene3d: new XName(w14Ns, "scene3d"),
            schemeClr: new XName(w14Ns, "schemeClr"),
            shade: new XName(w14Ns, "shade"),
            shadow: new XName(w14Ns, "shadow"),
            solidFill: new XName(w14Ns, "solidFill"),
            srgbClr: new XName(w14Ns, "srgbClr"),
            stA: new XName(w14Ns, "stA"),
            stPos: new XName(w14Ns, "stPos"),
            styleSet: new XName(w14Ns, "styleSet"),
            stylisticSets: new XName(w14Ns, "stylisticSets"),
            sx: new XName(w14Ns, "sx"),
            sy: new XName(w14Ns, "sy"),
            t: new XName(w14Ns, "t"),
            textFill: new XName(w14Ns, "textFill"),
            textId: new XName(w14Ns, "textId"),
            textOutline: new XName(w14Ns, "textOutline"),
            tint: new XName(w14Ns, "tint"),
            uncheckedState: new XName(w14Ns, "uncheckedState"),
            val: new XName(w14Ns, "val"),
            w: new XName(w14Ns, "w"),
            wProps3d: new XName(w14Ns, "wProps3d"),
            wScene3d: new XName(w14Ns, "wScene3d"),
            wShadow: new XName(w14Ns, "wShadow"),
            wTextFill: new XName(w14Ns, "wTextFill"),
            wTextOutline: new XName(w14Ns, "wTextOutline"),
            xfrm: new XName(w14Ns, "xfrm"),
        }
        var W14 = openXml.W14;

        openXml.w3digsigNs = new XNamespace("http://www.w3.org/2000/09/xmldsig#");
        var w3digsigNs = openXml.w3digsigNs;
        openXml.W3DIGSIG = {
            CanonicalizationMethod: new XName(w3digsigNs, "CanonicalizationMethod"),
            DigestMethod: new XName(w3digsigNs, "DigestMethod"),
            DigestValue: new XName(w3digsigNs, "DigestValue"),
            Exponent: new XName(w3digsigNs, "Exponent"),
            KeyInfo: new XName(w3digsigNs, "KeyInfo"),
            KeyValue: new XName(w3digsigNs, "KeyValue"),
            Manifest: new XName(w3digsigNs, "Manifest"),
            Modulus: new XName(w3digsigNs, "Modulus"),
            Object: new XName(w3digsigNs, "Object"),
            Reference: new XName(w3digsigNs, "Reference"),
            RSAKeyValue: new XName(w3digsigNs, "RSAKeyValue"),
            Signature: new XName(w3digsigNs, "Signature"),
            SignatureMethod: new XName(w3digsigNs, "SignatureMethod"),
            SignatureProperties: new XName(w3digsigNs, "SignatureProperties"),
            SignatureProperty: new XName(w3digsigNs, "SignatureProperty"),
            SignatureValue: new XName(w3digsigNs, "SignatureValue"),
            SignedInfo: new XName(w3digsigNs, "SignedInfo"),
            Transform: new XName(w3digsigNs, "Transform"),
            Transforms: new XName(w3digsigNs, "Transforms"),
            X509Certificate: new XName(w3digsigNs, "X509Certificate"),
            X509Data: new XName(w3digsigNs, "X509Data"),
            X509IssuerName: new XName(w3digsigNs, "X509IssuerName"),
            X509SerialNumber: new XName(w3digsigNs, "X509SerialNumber"),
        }
        var W3DIGSIG = openXml.W3DIGSIG;

        openXml.wpNs = new XNamespace("http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing");
        var wpNs = openXml.wpNs;
        openXml.WP = {
            align: new XName(wpNs, "align"),
            anchor: new XName(wpNs, "anchor"),
            cNvGraphicFramePr: new XName(wpNs, "cNvGraphicFramePr"),
            docPr: new XName(wpNs, "docPr"),
            effectExtent: new XName(wpNs, "effectExtent"),
            extent: new XName(wpNs, "extent"),
            inline: new XName(wpNs, "inline"),
            lineTo: new XName(wpNs, "lineTo"),
            positionH: new XName(wpNs, "positionH"),
            positionV: new XName(wpNs, "positionV"),
            posOffset: new XName(wpNs, "posOffset"),
            simplePos: new XName(wpNs, "simplePos"),
            start: new XName(wpNs, "start"),
            wrapNone: new XName(wpNs, "wrapNone"),
            wrapPolygon: new XName(wpNs, "wrapPolygon"),
            wrapSquare: new XName(wpNs, "wrapSquare"),
            wrapThrough: new XName(wpNs, "wrapThrough"),
            wrapTight: new XName(wpNs, "wrapTight"),
            wrapTopAndBottom: new XName(wpNs, "wrapTopAndBottom"),
        }
        var WP = openXml.WP;

        openXml.wp14Ns = new XNamespace("http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing");
        var wp14Ns = openXml.wp14Ns;
        openXml.WP14 = {
            editId: new XName(wp14Ns, "editId"),
            pctHeight: new XName(wp14Ns, "pctHeight"),
            pctPosVOffset: new XName(wp14Ns, "pctPosVOffset"),
            pctWidth: new XName(wp14Ns, "pctWidth"),
            sizeRelH: new XName(wp14Ns, "sizeRelH"),
            sizeRelV: new XName(wp14Ns, "sizeRelV"),
        }
        var WP14 = openXml.WP14;

        openXml.wpsNs = new XNamespace("http://schemas.microsoft.com/office/word/2010/wordprocessingShape");
        var wpsNs = openXml.wpsNs;
        openXml.WPS = {
            altTxbx: new XName(wpsNs, "altTxbx"),
            bodyPr: new XName(wpsNs, "bodyPr"),
            cNvSpPr: new XName(wpsNs, "cNvSpPr"),
            spPr: new XName(wpsNs, "spPr"),
            style: new XName(wpsNs, "style"),
            textbox: new XName(wpsNs, "textbox"),
            txbx: new XName(wpsNs, "txbx"),
            wsp: new XName(wpsNs, "wsp"),
        }
        var WPS = openXml.WPS;

        openXml.xNs = new XNamespace("urn:schemas-microsoft-com:office:excel");
        var xNs = openXml.xNs;
        openXml.X = {
            Anchor: new XName(xNs, "Anchor"),
            AutoFill: new XName(xNs, "AutoFill"),
            ClientData: new XName(xNs, "ClientData"),
            Column: new XName(xNs, "Column"),
            MoveWithCells: new XName(xNs, "MoveWithCells"),
            Row: new XName(xNs, "Row"),
            SizeWithCells: new XName(xNs, "SizeWithCells"),
        }
        var X = openXml.X;

        openXml.xdrNs = new XNamespace("http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing");
        var xdrNs = openXml.xdrNs;
        openXml.XDR = {
            absoluteAnchor: new XName(xdrNs, "absoluteAnchor"),
            blipFill: new XName(xdrNs, "blipFill"),
            clientData: new XName(xdrNs, "clientData"),
            cNvCxnSpPr: new XName(xdrNs, "cNvCxnSpPr"),
            cNvGraphicFramePr: new XName(xdrNs, "cNvGraphicFramePr"),
            cNvGrpSpPr: new XName(xdrNs, "cNvGrpSpPr"),
            cNvPicPr: new XName(xdrNs, "cNvPicPr"),
            cNvPr: new XName(xdrNs, "cNvPr"),
            cNvSpPr: new XName(xdrNs, "cNvSpPr"),
            col: new XName(xdrNs, "col"),
            colOff: new XName(xdrNs, "colOff"),
            contentPart: new XName(xdrNs, "contentPart"),
            cxnSp: new XName(xdrNs, "cxnSp"),
            ext: new XName(xdrNs, "ext"),
            from: new XName(xdrNs, "from"),
            graphicFrame: new XName(xdrNs, "graphicFrame"),
            grpSp: new XName(xdrNs, "grpSp"),
            grpSpPr: new XName(xdrNs, "grpSpPr"),
            nvCxnSpPr: new XName(xdrNs, "nvCxnSpPr"),
            nvGraphicFramePr: new XName(xdrNs, "nvGraphicFramePr"),
            nvGrpSpPr: new XName(xdrNs, "nvGrpSpPr"),
            nvPicPr: new XName(xdrNs, "nvPicPr"),
            nvSpPr: new XName(xdrNs, "nvSpPr"),
            oneCellAnchor: new XName(xdrNs, "oneCellAnchor"),
            pic: new XName(xdrNs, "pic"),
            pos: new XName(xdrNs, "pos"),
            row: new XName(xdrNs, "row"),
            rowOff: new XName(xdrNs, "rowOff"),
            sp: new XName(xdrNs, "sp"),
            spPr: new XName(xdrNs, "spPr"),
            style: new XName(xdrNs, "style"),
            to: new XName(xdrNs, "to"),
            twoCellAnchor: new XName(xdrNs, "twoCellAnchor"),
            txBody: new XName(xdrNs, "txBody"),
            wsDr: new XName(xdrNs, "wsDr"),
            xfrm: new XName(xdrNs, "xfrm"),
        }
        var XDR = openXml.XDR;

        openXml.xdr14Ns = new XNamespace("http://schemas.microsoft.com/office/excel/2010/spreadsheetDrawing");
        var xdr14Ns = openXml.xdr14Ns;
        openXml.XDR14 = {
            cNvContentPartPr: new XName(xdr14Ns, "cNvContentPartPr"),
            cNvPr: new XName(xdr14Ns, "cNvPr"),
            nvContentPartPr: new XName(xdr14Ns, "nvContentPartPr"),
            nvPr: new XName(xdr14Ns, "nvPr"),
            xfrm: new XName(xdr14Ns, "xfrm"),
        }
        var XDR14 = openXml.XDR14;

        openXml.xmNs = new XNamespace("http://schemas.microsoft.com/office/excel/2006/main");
        var xmNs = openXml.xmNs;
        openXml.XM = {
            f: new XName(xmNs, "f"),
            _ref: new XName(xmNs, "ref"),
            sqref: new XName(xmNs, "sqref"),
        }
        var XM = openXml.XM;

        openXml.xsiNs = new XNamespace("http://www.w3.org/2001/XMLSchema-instance");
        var xsiNs = openXml.xsiNs;
        openXml.XSI = {
            type: new XName(xsiNs, "type"),
        }
        var XSI = openXml.XSI;

        /******************************** end automatically generated code ********************************/

        openXml.ctNs = new XNamespace("http://schemas.openxmlformats.org/package/2006/content-types");
        var ctNs = openXml.ctNs;
        openXml.CT = {
            Override: new XName(ctNs, "Override"),
            Default: new XName(ctNs, "Default"),
            Types: new XName(ctNs, "Types"),
        }
        var CT = openXml.CT;

        openXml.pkgRelNs = new XNamespace("http://schemas.openxmlformats.org/package/2006/relationships");
        var pkgRelNs = openXml.pkgRelNs;
        openXml.PKGREL = {
            Relationships: new XName(pkgRelNs, "Relationships"),
            Relationship: new XName(pkgRelNs, "Relationship"),
        }
        var PKGREL = openXml.PKGREL;

        openXml.flatOpcPkgNs = new XNamespace("http://schemas.microsoft.com/office/2006/xmlPackage");
        var flatOpcPkgNs = openXml.flatOpcPkgNs;
        openXml.FLATOPC = {
            _package: new XName(flatOpcPkgNs + "package"),
            part: new XName(flatOpcPkgNs + "part"),
            name: new XName(flatOpcPkgNs + "name"),
            contentType: new XName(flatOpcPkgNs + "contentType"),
            padding: new XName(flatOpcPkgNs + "padding"),
            xmlData: new XName(flatOpcPkgNs + "xmlData"),
            binaryData: new XName(flatOpcPkgNs + "binaryData"),
            compression: new XName(flatOpcPkgNs + "compression"),
        }
        var FLATOPC = openXml.FLATOPC;

        return openXml;
    }

    // module export
    if (typeof define === typeof function () { } && define.amd) { // AMD
        define("openxml", ["linq", "ltxml", "ltxml-extensions"],
            function (Enumerable, Ltxml, XEnumerable) {
                var openXml = defineOpenXml(Enumerable, Ltxml, XEnumerable);
                return openXml;
            });
    }
    else if (typeof module !== typeof undefined && module.exports) { // Node
        var openXml = defineOpenXml(Enumerable, Ltxml, XEnumerable);
        module.exports = openXml;
    }
    else {
        // Enumerable, Ltxml, and XEnumerable must be defined before including ltxml.js.
        var openXml = defineOpenXml(Enumerable, Ltxml, XEnumerable);
        root.openXml = openXml;
    }

}(this));
