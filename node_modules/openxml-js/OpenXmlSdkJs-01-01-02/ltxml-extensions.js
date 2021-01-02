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

***************************************************************************/

(function (root) {  // root = global
    "use strict";

    var XEnumerable;

    // Ltxml encapsulation function
    function defineXEnumerable(root, Enumerable, Ltxml) {

        var ancestors, ancestorsAndSelf, attributes, descendantNodes, descendantNodesAndSelf, descendants,
        descendantsAndSelf, elements, inDocumentOrder, nodes, remove, groupAdjacent, XEnumerable;

        ancestors = function (xname) {
            var source, result;

            if (xname && typeof xname === 'string') {
                xname = new Ltxml.XName(xname);
            }

            source = this.source ? this.source : this;  //ignore jslint
            result = source
                .selectMany(
                    function (e) {
                        if (e.nodeType &&
                            (e.nodeType === 'Element' ||
                                e.nodeType === 'Comment' ||
                                e.nodeType === 'ProcessingInstruction' ||
                                e.nodeType === 'Text' ||
                                e.nodeType === 'CDATA' ||
                                e.nodeType === 'Entity')) {
                            return e.ancestors(xname);
                        }
                        return Enumerable.empty();
                    });
            return new XEnumerable(result);
        };

        ancestorsAndSelf = function (xname) {
            var source, result;

            if (xname && typeof xname === 'string') {
                xname = new Ltxml.XName(xname);
            }
            source = this.source ? this.source : this;  //ignore jslint
            result = source
                .selectMany(
                    function (e) {
                        if (e.nodeType && e.nodeType === 'Element') {
                            return e.ancestorsAndSelf(xname);
                        }
                        return Enumerable.empty();
                    });
            return new XEnumerable(result);
        };

        attributes = function (xname) {
            var source, result;

            if (xname && typeof xname === 'string') {
                xname = new Ltxml.XName(xname);
            }
            source = this.source ? this.source : this;  //ignore jslint
            result = source
                .selectMany(
                    function (e) {
                        if (e.nodeType && e.nodeType === 'Element') {
                            return e.attributes(xname);
                        }
                        return Enumerable.empty();
                    });
            return new XEnumerable(result);
        };

        descendantNodes = function () {
            var source, result;

            source = this.source ? this.source : this;  //ignore jslint
            result = source
                .selectMany(
                    function (e) {
                        if (e.nodeType &&
                            (e.nodeType === 'Element' ||
                                e.nodeType === 'Comment' ||
                                e.nodeType === 'ProcessingInstruction' ||
                                e.nodeType === 'Text' ||
                                e.nodeType === 'CDATA' ||
                                e.nodeType === 'Entity')) {
                            return e.descendantNodes();
                        }
                        return Enumerable.empty();
                    });
            return new XEnumerable(result);
        };

        descendantNodesAndSelf = function () {
            var source, result;

            source = this.source ? this.source : this; //ignore jslint
            result = source
                .selectMany(
                    function (e) {
                        if (e.nodeType &&
                            (e.nodeType === 'Element' ||
                                e.nodeType === 'Comment' ||
                                e.nodeType === 'ProcessingInstruction' ||
                                e.nodeType === 'Text' ||
                                e.nodeType === 'CDATA' ||
                                e.nodeType === 'Entity')) {
                            return e.descendantNodesAndSelf();
                        }
                        return Enumerable.empty();
                    });
            return new XEnumerable(result);
        };

        descendants = function (xname) {
            var source, result;

            if (xname && typeof xname === 'string') {
                xname = new Ltxml.XName(xname);
            }
            source = this.source ? this.source : this;  //ignore jslint
            result = source
                .selectMany(
                    function (e) {
                        if (e.nodeType && e.nodeType === 'Element') {
                            return e.descendants(xname);
                        }
                        return Enumerable.empty();
                    });
            return new XEnumerable(result);
        };

        descendantsAndSelf = function (xname) {
            var source, result;

            if (xname && typeof xname === 'string') {
                xname = new Ltxml.XName(xname);
            }
            source = this.source ? this.source : this;  //ignore jslint
            result = source
                .selectMany(
                    function (e) {
                        if (e.nodeType && e.nodeType === 'Element') {
                            return e.descendantsAndSelf(xname);
                        }
                        return Enumerable.empty();
                    });
            return new XEnumerable(result);
        };

        elements = function (xname) {
            var source, result;

            if (xname && typeof xname === 'string') {
                xname = new Ltxml.XName(xname);
            }
            source = this.source ? this.source : this;  //ignore jslint
            result = source
                .select(
                    function (e) {
                        if (e.nodeType &&
                            (e.nodeType === 'Element' || e.nodeType === 'Document')) {
                            return e.elements(xname);
                        }
                        return Enumerable.empty();
                    })
                .selectMany("i=>i");
            return new XEnumerable(result);
        };

        inDocumentOrder = function () {
            throw "Not implemented";
        };

        nodes = function () {
            var source, result;

            source = this.source ? this.source : this;  //ignore jslint
            result = source
                .selectMany(
                    function (e) {
                        if (e.nodeType &&
                            (e.nodeType === 'Element' ||
                                e.nodeType === 'Document')) {
                            return e.nodes();
                        }
                        return Enumerable.empty();
                    });
            return new XEnumerable(result);
        };

        remove = function (xname) {
            var source, toRemove, i;

            if (xname && typeof xname === 'string') {
                xname = new Ltxml.XName(xname);
            }
            source = this.source ? this.source : this;  //ignore jslint
            toRemove = source.toArray();
            for (i = 0; i < toRemove.length; i += 1) {
                if (xname === undefined) {
                    toRemove[i].remove();
                }
                else {
                    if (toRemove[i].name && toRemove[i].name === xname) {
                        toRemove[i].remove();
                    }
                }
            }
        };

        groupAdjacent = function (keySelector) {
            var last, haveLast, listOfLists, list, source;

            source = this.source ? this.source : this;  //ignore jslint
            last = null;
            haveLast = false;
            listOfLists = [];
            list = [];

            source.forEach(function (s) {
                var k;

                k = keySelector(s);
                if (haveLast) {
                    if (k !== last) {
                        listOfLists.push({
                            Key: last,
                            Group: Enumerable.from(list)
                        });
                        list = [];
                        list.push(s);
                        last = k;
                    }
                    else {
                        list.push(s);
                        last = k;
                    }
                }
                else {
                    list.push(s);
                    last = k;
                    haveLast = true;
                }
            });
            if (haveLast) {
                listOfLists.push({
                    Key: last,
                    Group: Enumerable.from(list)
                });
            }
            return Enumerable.from(listOfLists);
        };

        XEnumerable = function (source) {
            this.source = source;
            this.isXEnumerable = true;
        };

        XEnumerable.prototype = new Enumerable();
        XEnumerable.prototype.getEnumerator = function () {
            return this.source.getEnumerator();
        };
        XEnumerable.prototype.asEnumerable = function () {
            return this.source;
        };
        XEnumerable.prototype.ancestors = ancestors;
        XEnumerable.prototype.ancestorsAndSelf = ancestorsAndSelf;
        XEnumerable.prototype.attributes = attributes;
        XEnumerable.prototype.descendantNodes = descendantNodes;
        XEnumerable.prototype.descendantNodesAndSelf = descendantNodesAndSelf;
        XEnumerable.prototype.descendants = descendants;
        XEnumerable.prototype.descendantsAndSelf = descendantsAndSelf;
        XEnumerable.prototype.elements = elements;
        XEnumerable.prototype.inDocumentOrder = inDocumentOrder;
        XEnumerable.prototype.nodes = nodes;
        XEnumerable.prototype.remove = remove;
        XEnumerable.prototype.groupAdjacent = groupAdjacent;
        return XEnumerable;
    }

    /*ignore jslint start*/
    // module export
    if (typeof define === typeof function () { } && define.amd) { // AMD
        define("ltxml-extensions", ["linq", "ltxml"], function (Enumerable, Ltxml) {
            XEnumerable = defineXEnumerable(root, Enumerable, Ltxml);
            return XEnumerable;
        });
    }
    else if (typeof module !== typeof undefined && module.exports) { // Node
        XEnumerable = defineXEnumerable(root, Enumerable, Ltxml);
        module.exports = XEnumerable;
    }
    else {
        // Enumerable must be defined before including ltxml-extensions.js.
        // Ltxml must be defined before including ltxml-extensions.js.
        XEnumerable = defineXEnumerable(root, Enumerable, Ltxml);
        root.XEnumerable = XEnumerable;
    }
    /*ignore jslint end*/

}(this));