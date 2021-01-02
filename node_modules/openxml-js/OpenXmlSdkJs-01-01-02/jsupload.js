/*
  JsUpload: Client Side File Uploading
  JavaScript + Flash Library
  
  Version B: 1.0 Forked by Eric White

  Copyright (c) 2009 Douglas C. Neiner

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/

(function () {
    JsUpload = window.JsUpload = {
        queue: {},
        uid: new Date().getTime(),
        getFileFilterDescription: function (queue) {
            var obj = JsUpload.queue[queue];
            if (obj) return obj.getFileFilterDescription();
            return "";
        },
        getFileFilterWildcards: function (queue) {
            var obj = JsUpload.queue[queue];
            if (obj) return obj.getFileFilterWildcards();
            return "";
        },
        loadComplete: function (queue, fileName, theData) {
            var obj = JsUpload.queue[queue];
            if (obj) obj.complete(fileName, theData);
            return true;
        },
        select: function (queue) {
            var obj = JsUpload.queue[queue];
            if (obj) obj.select();
            return true;
        },
        loadCancel: function (queue) {
            var obj = JsUpload.queue[queue];
            if (obj) obj.cancel();
            return true;
        },
        loadCancel: function (queue) {
            var obj = JsUpload.queue[queue];
            if (obj) obj.cancel();
            return true;
        },
        alert: function (queue, text) {
            var obj = JsUpload.queue[queue];
            if (obj) obj.alert(text);
            return true;
        },
        addToQueue: function (container) {
            JsUpload.queue[container.queue_name] = container;
        },
        // Concept adapted from: http://tinyurl.com/yzsyfto
        // SWF object runs off of ID's, so this is the good way to get a unique ID
        getUID: function (el) {
            if (el.id == "") el.id = 'jsupload_' + JsUpload.uid++;
            return el.id;
        }
    };

    JsUpload.create = function (idOrDOM, options) {
        var el = (typeof (idOrDOM) == "string" ? document.getElementById(idOrDOM) : idOrDOM);
        return new JsUpload.Container(el, options);
    };

    JsUpload.Container = function (el, options) {
        var base = this;

        base.el = el;
        base.enabled = true;
        base.dataCallback = null;
        base.filenameCallback = null;
        base.data = null;
        base.filename = null;

        var init = function () {
            base.options = options;

            var oldinner = base.el.innerHTML;
            if (!base.options.append) base.el.innerHTML = "";

            base.flashContainer = document.createElement('span');
            base.el.appendChild(base.flashContainer);

            base.queue_name = JsUpload.getUID(base.flashContainer);

            if (typeof (base.options.filename) === "function")
                base.filenameCallback = base.options.filename;
            else if (base.options.filename)
                base.filename = base.options.filename;

            if (typeof (base.options.data) === "function")
                base.dataCallback = base.options.data;
            else if (base.options.data)
                base.data = base.options.data;

            var flashVars = {
                queue_name: base.queue_name,
                width: base.options.width,
                height: base.options.height,
                dataTypeForLoad: base.options.dataTypeForLoad
            };

            var params = {
                allowScriptAccess: 'always'
            };

            var attributes = {
                id: base.flashContainer.id,
                name: base.flashContainer.id
            };

            if (base.options.enabled === false) base.enabled = false;

            if (base.options.transparent === true) params.wmode = "transparent";

            if (base.options.uploadImage) flashVars.uploadImage = base.options.uploadImage;

            if (base.options.fileFilterDescription) base.fileFilterDescription = base.options.fileFilterDescription;

            if (base.options.fileFilterWildcards) base.fileFilterWildcards = base.options.fileFilterWildcards;

            if (base.options.dataTypeForLoad) base.dataTypeForLoad = base.options.dataTypeForLoad;

            function callbackFn(e) {
                if (!e.success) {
                    base.el.innerHTML = oldinner;
                }
            }
            try {
                swfobject.embedSWF(base.options.swf, base.flashContainer.id, base.options.width, base.options.height, "10", null, flashVars, params, attributes, callbackFn);
            }
            catch (e) {
                base.el.innerHTML = oldinner;
            }

            JsUpload.addToQueue(base);
        };

        base.enable = function () {
            var swf = document.getElementById(base.flashContainer.id);
            swf.setEnabled(true);
            base.enabled = true;
        };

        base.disable = function () {
            var swf = document.getElementById(base.flashContainer.id);
            swf.setEnabled(false);
            base.enabled = false;
        };

        base.getFileFilterDescription = function () {
            if (!base.enabled) return "";
            else if (base.fileFilterDescription) return base.fileFilterDescription;
            else return "";
        };

        base.getFileFilterWildcards = function () {
            if (!base.enabled) return "";
            else if (base.fileFilterWildcards) return base.fileFilterWildcards;
            else return "";
        };

        base.complete = function (fileName, theData) {
            if (typeof (base.options.onComplete) === "function") base.options.onComplete(fileName, theData);
        };

        base.select = function () {
            if (typeof (base.options.onSelect) === "function") base.options.onSelect();
        };

        base.cancel = function () {
            if (typeof (base.options.onCancel) === "function") base.options.onCancel();
        };

        base.error = function () {
            if (typeof (base.options.onError) === "function") base.options.onError();
        };

        base.alert = function (text) {
            if (typeof (base.options.alert) === "function") base.options.alert(text);
        };

        init();
    };

    JsUpload.defaultOptions = {
        swf: 'media/jsupload.swf',
        uploadImage: 'images/upload.png',
        width: 100,
        height: 30,
        transparent: true,
        append: false,
        dataTypeForLoad: ""
    };
})();

// Support for jQuery
if (typeof (jQuery) != "undefined") {
    (function ($) {
        $.fn.jsupload = function (options) {
            return this.each(function () {
                options = $.extend({}, JsUpload.defaultOptions, options);
                var dl = JsUpload.create(this, options);
                $(this).data('JsUpload', dl);
            });
        };
    })(jQuery);
};

/* mootools helper */
if (typeof (MooTools) != 'undefined') {
    Element.implement({
        jsupload: function (options) {
            options = $merge(JsUpload.defaultOptions, options);
            return this.store('JsUpload', JsUpload.create(this, options));
        }
    });
};

