/*!
 * @microsoft/office-js-helpers v.1.0.2
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("OfficeHelpers", [], factory);
	else if(typeof exports === 'object')
		exports["OfficeHelpers"] = factory();
	else
		root["OfficeHelpers"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/lodash-es/_DataView.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getNative_js__ = __webpack_require__("./node_modules/lodash-es/_getNative.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__root_js__ = __webpack_require__("./node_modules/lodash-es/_root.js");



/* Built-in method references that are verified to be native. */
var DataView = Object(__WEBPACK_IMPORTED_MODULE_0__getNative_js__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_1__root_js__["a" /* default */], 'DataView');

/* harmony default export */ __webpack_exports__["a"] = (DataView);


/***/ }),

/***/ "./node_modules/lodash-es/_Map.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getNative_js__ = __webpack_require__("./node_modules/lodash-es/_getNative.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__root_js__ = __webpack_require__("./node_modules/lodash-es/_root.js");



/* Built-in method references that are verified to be native. */
var Map = Object(__WEBPACK_IMPORTED_MODULE_0__getNative_js__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_1__root_js__["a" /* default */], 'Map');

/* harmony default export */ __webpack_exports__["a"] = (Map);


/***/ }),

/***/ "./node_modules/lodash-es/_Promise.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getNative_js__ = __webpack_require__("./node_modules/lodash-es/_getNative.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__root_js__ = __webpack_require__("./node_modules/lodash-es/_root.js");



/* Built-in method references that are verified to be native. */
var Promise = Object(__WEBPACK_IMPORTED_MODULE_0__getNative_js__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_1__root_js__["a" /* default */], 'Promise');

/* harmony default export */ __webpack_exports__["a"] = (Promise);


/***/ }),

/***/ "./node_modules/lodash-es/_Set.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getNative_js__ = __webpack_require__("./node_modules/lodash-es/_getNative.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__root_js__ = __webpack_require__("./node_modules/lodash-es/_root.js");



/* Built-in method references that are verified to be native. */
var Set = Object(__WEBPACK_IMPORTED_MODULE_0__getNative_js__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_1__root_js__["a" /* default */], 'Set');

/* harmony default export */ __webpack_exports__["a"] = (Set);


/***/ }),

/***/ "./node_modules/lodash-es/_Symbol.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__root_js__ = __webpack_require__("./node_modules/lodash-es/_root.js");


/** Built-in value references. */
var Symbol = __WEBPACK_IMPORTED_MODULE_0__root_js__["a" /* default */].Symbol;

/* harmony default export */ __webpack_exports__["a"] = (Symbol);


/***/ }),

/***/ "./node_modules/lodash-es/_WeakMap.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getNative_js__ = __webpack_require__("./node_modules/lodash-es/_getNative.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__root_js__ = __webpack_require__("./node_modules/lodash-es/_root.js");



/* Built-in method references that are verified to be native. */
var WeakMap = Object(__WEBPACK_IMPORTED_MODULE_0__getNative_js__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_1__root_js__["a" /* default */], 'WeakMap');

/* harmony default export */ __webpack_exports__["a"] = (WeakMap);


/***/ }),

/***/ "./node_modules/lodash-es/_baseGetTag.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Symbol_js__ = __webpack_require__("./node_modules/lodash-es/_Symbol.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__getRawTag_js__ = __webpack_require__("./node_modules/lodash-es/_getRawTag.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__objectToString_js__ = __webpack_require__("./node_modules/lodash-es/_objectToString.js");




/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */] ? __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */].toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? Object(__WEBPACK_IMPORTED_MODULE_1__getRawTag_js__["a" /* default */])(value)
    : Object(__WEBPACK_IMPORTED_MODULE_2__objectToString_js__["a" /* default */])(value);
}

/* harmony default export */ __webpack_exports__["a"] = (baseGetTag);


/***/ }),

/***/ "./node_modules/lodash-es/_baseIsArguments.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__ = __webpack_require__("./node_modules/lodash-es/_baseGetTag.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__isObjectLike_js__ = __webpack_require__("./node_modules/lodash-es/isObjectLike.js");



/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return Object(__WEBPACK_IMPORTED_MODULE_1__isObjectLike_js__["a" /* default */])(value) && Object(__WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__["a" /* default */])(value) == argsTag;
}

/* harmony default export */ __webpack_exports__["a"] = (baseIsArguments);


/***/ }),

/***/ "./node_modules/lodash-es/_baseIsNative.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isFunction_js__ = __webpack_require__("./node_modules/lodash-es/isFunction.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__isMasked_js__ = __webpack_require__("./node_modules/lodash-es/_isMasked.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isObject_js__ = __webpack_require__("./node_modules/lodash-es/isObject.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__toSource_js__ = __webpack_require__("./node_modules/lodash-es/_toSource.js");





/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!Object(__WEBPACK_IMPORTED_MODULE_2__isObject_js__["a" /* default */])(value) || Object(__WEBPACK_IMPORTED_MODULE_1__isMasked_js__["a" /* default */])(value)) {
    return false;
  }
  var pattern = Object(__WEBPACK_IMPORTED_MODULE_0__isFunction_js__["a" /* default */])(value) ? reIsNative : reIsHostCtor;
  return pattern.test(Object(__WEBPACK_IMPORTED_MODULE_3__toSource_js__["a" /* default */])(value));
}

/* harmony default export */ __webpack_exports__["a"] = (baseIsNative);


/***/ }),

/***/ "./node_modules/lodash-es/_baseIsTypedArray.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__ = __webpack_require__("./node_modules/lodash-es/_baseGetTag.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__isLength_js__ = __webpack_require__("./node_modules/lodash-es/isLength.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isObjectLike_js__ = __webpack_require__("./node_modules/lodash-es/isObjectLike.js");




/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return Object(__WEBPACK_IMPORTED_MODULE_2__isObjectLike_js__["a" /* default */])(value) &&
    Object(__WEBPACK_IMPORTED_MODULE_1__isLength_js__["a" /* default */])(value.length) && !!typedArrayTags[Object(__WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__["a" /* default */])(value)];
}

/* harmony default export */ __webpack_exports__["a"] = (baseIsTypedArray);


/***/ }),

/***/ "./node_modules/lodash-es/_baseKeys.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isPrototype_js__ = __webpack_require__("./node_modules/lodash-es/_isPrototype.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__nativeKeys_js__ = __webpack_require__("./node_modules/lodash-es/_nativeKeys.js");



/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!Object(__WEBPACK_IMPORTED_MODULE_0__isPrototype_js__["a" /* default */])(object)) {
    return Object(__WEBPACK_IMPORTED_MODULE_1__nativeKeys_js__["a" /* default */])(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/* harmony default export */ __webpack_exports__["a"] = (baseKeys);


/***/ }),

/***/ "./node_modules/lodash-es/_baseUnary.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/* harmony default export */ __webpack_exports__["a"] = (baseUnary);


/***/ }),

/***/ "./node_modules/lodash-es/_coreJsData.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__root_js__ = __webpack_require__("./node_modules/lodash-es/_root.js");


/** Used to detect overreaching core-js shims. */
var coreJsData = __WEBPACK_IMPORTED_MODULE_0__root_js__["a" /* default */]['__core-js_shared__'];

/* harmony default export */ __webpack_exports__["a"] = (coreJsData);


/***/ }),

/***/ "./node_modules/lodash-es/_freeGlobal.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/* harmony default export */ __webpack_exports__["a"] = (freeGlobal);

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/lodash-es/_getNative.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__baseIsNative_js__ = __webpack_require__("./node_modules/lodash-es/_baseIsNative.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__getValue_js__ = __webpack_require__("./node_modules/lodash-es/_getValue.js");



/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = Object(__WEBPACK_IMPORTED_MODULE_1__getValue_js__["a" /* default */])(object, key);
  return Object(__WEBPACK_IMPORTED_MODULE_0__baseIsNative_js__["a" /* default */])(value) ? value : undefined;
}

/* harmony default export */ __webpack_exports__["a"] = (getNative);


/***/ }),

/***/ "./node_modules/lodash-es/_getRawTag.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Symbol_js__ = __webpack_require__("./node_modules/lodash-es/_Symbol.js");


/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */] ? __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */].toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/* harmony default export */ __webpack_exports__["a"] = (getRawTag);


/***/ }),

/***/ "./node_modules/lodash-es/_getTag.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__DataView_js__ = __webpack_require__("./node_modules/lodash-es/_DataView.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Map_js__ = __webpack_require__("./node_modules/lodash-es/_Map.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Promise_js__ = __webpack_require__("./node_modules/lodash-es/_Promise.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Set_js__ = __webpack_require__("./node_modules/lodash-es/_Set.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__WeakMap_js__ = __webpack_require__("./node_modules/lodash-es/_WeakMap.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__baseGetTag_js__ = __webpack_require__("./node_modules/lodash-es/_baseGetTag.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__toSource_js__ = __webpack_require__("./node_modules/lodash-es/_toSource.js");








/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = Object(__WEBPACK_IMPORTED_MODULE_6__toSource_js__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_0__DataView_js__["a" /* default */]),
    mapCtorString = Object(__WEBPACK_IMPORTED_MODULE_6__toSource_js__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_1__Map_js__["a" /* default */]),
    promiseCtorString = Object(__WEBPACK_IMPORTED_MODULE_6__toSource_js__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_2__Promise_js__["a" /* default */]),
    setCtorString = Object(__WEBPACK_IMPORTED_MODULE_6__toSource_js__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_3__Set_js__["a" /* default */]),
    weakMapCtorString = Object(__WEBPACK_IMPORTED_MODULE_6__toSource_js__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_4__WeakMap_js__["a" /* default */]);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = __WEBPACK_IMPORTED_MODULE_5__baseGetTag_js__["a" /* default */];

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((__WEBPACK_IMPORTED_MODULE_0__DataView_js__["a" /* default */] && getTag(new __WEBPACK_IMPORTED_MODULE_0__DataView_js__["a" /* default */](new ArrayBuffer(1))) != dataViewTag) ||
    (__WEBPACK_IMPORTED_MODULE_1__Map_js__["a" /* default */] && getTag(new __WEBPACK_IMPORTED_MODULE_1__Map_js__["a" /* default */]) != mapTag) ||
    (__WEBPACK_IMPORTED_MODULE_2__Promise_js__["a" /* default */] && getTag(__WEBPACK_IMPORTED_MODULE_2__Promise_js__["a" /* default */].resolve()) != promiseTag) ||
    (__WEBPACK_IMPORTED_MODULE_3__Set_js__["a" /* default */] && getTag(new __WEBPACK_IMPORTED_MODULE_3__Set_js__["a" /* default */]) != setTag) ||
    (__WEBPACK_IMPORTED_MODULE_4__WeakMap_js__["a" /* default */] && getTag(new __WEBPACK_IMPORTED_MODULE_4__WeakMap_js__["a" /* default */]) != weakMapTag)) {
  getTag = function(value) {
    var result = Object(__WEBPACK_IMPORTED_MODULE_5__baseGetTag_js__["a" /* default */])(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? Object(__WEBPACK_IMPORTED_MODULE_6__toSource_js__["a" /* default */])(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/* harmony default export */ __webpack_exports__["a"] = (getTag);


/***/ }),

/***/ "./node_modules/lodash-es/_getValue.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/* harmony default export */ __webpack_exports__["a"] = (getValue);


/***/ }),

/***/ "./node_modules/lodash-es/_isMasked.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__coreJsData_js__ = __webpack_require__("./node_modules/lodash-es/_coreJsData.js");


/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(__WEBPACK_IMPORTED_MODULE_0__coreJsData_js__["a" /* default */] && __WEBPACK_IMPORTED_MODULE_0__coreJsData_js__["a" /* default */].keys && __WEBPACK_IMPORTED_MODULE_0__coreJsData_js__["a" /* default */].keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/* harmony default export */ __webpack_exports__["a"] = (isMasked);


/***/ }),

/***/ "./node_modules/lodash-es/_isPrototype.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/* harmony default export */ __webpack_exports__["a"] = (isPrototype);


/***/ }),

/***/ "./node_modules/lodash-es/_nativeKeys.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__overArg_js__ = __webpack_require__("./node_modules/lodash-es/_overArg.js");


/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = Object(__WEBPACK_IMPORTED_MODULE_0__overArg_js__["a" /* default */])(Object.keys, Object);

/* harmony default export */ __webpack_exports__["a"] = (nativeKeys);


/***/ }),

/***/ "./node_modules/lodash-es/_nodeUtil.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__freeGlobal_js__ = __webpack_require__("./node_modules/lodash-es/_freeGlobal.js");


/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && __WEBPACK_IMPORTED_MODULE_0__freeGlobal_js__["a" /* default */].process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* harmony default export */ __webpack_exports__["a"] = (nodeUtil);

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__("./node_modules/webpack/buildin/harmony-module.js")(module)))

/***/ }),

/***/ "./node_modules/lodash-es/_objectToString.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/* harmony default export */ __webpack_exports__["a"] = (objectToString);


/***/ }),

/***/ "./node_modules/lodash-es/_overArg.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/* harmony default export */ __webpack_exports__["a"] = (overArg);


/***/ }),

/***/ "./node_modules/lodash-es/_root.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__freeGlobal_js__ = __webpack_require__("./node_modules/lodash-es/_freeGlobal.js");


/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = __WEBPACK_IMPORTED_MODULE_0__freeGlobal_js__["a" /* default */] || freeSelf || Function('return this')();

/* harmony default export */ __webpack_exports__["a"] = (root);


/***/ }),

/***/ "./node_modules/lodash-es/_toSource.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/* harmony default export */ __webpack_exports__["a"] = (toSource);


/***/ }),

/***/ "./node_modules/lodash-es/debounce.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isObject_js__ = __webpack_require__("./node_modules/lodash-es/isObject.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__now_js__ = __webpack_require__("./node_modules/lodash-es/now.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__toNumber_js__ = __webpack_require__("./node_modules/lodash-es/toNumber.js");




/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = Object(__WEBPACK_IMPORTED_MODULE_2__toNumber_js__["a" /* default */])(wait) || 0;
  if (Object(__WEBPACK_IMPORTED_MODULE_0__isObject_js__["a" /* default */])(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(Object(__WEBPACK_IMPORTED_MODULE_2__toNumber_js__["a" /* default */])(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = Object(__WEBPACK_IMPORTED_MODULE_1__now_js__["a" /* default */])();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Object(__WEBPACK_IMPORTED_MODULE_1__now_js__["a" /* default */])());
  }

  function debounced() {
    var time = Object(__WEBPACK_IMPORTED_MODULE_1__now_js__["a" /* default */])(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/* harmony default export */ __webpack_exports__["a"] = (debounce);


/***/ }),

/***/ "./node_modules/lodash-es/isArguments.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__baseIsArguments_js__ = __webpack_require__("./node_modules/lodash-es/_baseIsArguments.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__isObjectLike_js__ = __webpack_require__("./node_modules/lodash-es/isObjectLike.js");



/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = Object(__WEBPACK_IMPORTED_MODULE_0__baseIsArguments_js__["a" /* default */])(function() { return arguments; }()) ? __WEBPACK_IMPORTED_MODULE_0__baseIsArguments_js__["a" /* default */] : function(value) {
  return Object(__WEBPACK_IMPORTED_MODULE_1__isObjectLike_js__["a" /* default */])(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/* harmony default export */ __webpack_exports__["a"] = (isArguments);


/***/ }),

/***/ "./node_modules/lodash-es/isArray.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/* harmony default export */ __webpack_exports__["a"] = (isArray);


/***/ }),

/***/ "./node_modules/lodash-es/isArrayLike.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isFunction_js__ = __webpack_require__("./node_modules/lodash-es/isFunction.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__isLength_js__ = __webpack_require__("./node_modules/lodash-es/isLength.js");



/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && Object(__WEBPACK_IMPORTED_MODULE_1__isLength_js__["a" /* default */])(value.length) && !Object(__WEBPACK_IMPORTED_MODULE_0__isFunction_js__["a" /* default */])(value);
}

/* harmony default export */ __webpack_exports__["a"] = (isArrayLike);


/***/ }),

/***/ "./node_modules/lodash-es/isBuffer.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__root_js__ = __webpack_require__("./node_modules/lodash-es/_root.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__stubFalse_js__ = __webpack_require__("./node_modules/lodash-es/stubFalse.js");



/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? __WEBPACK_IMPORTED_MODULE_0__root_js__["a" /* default */].Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || __WEBPACK_IMPORTED_MODULE_1__stubFalse_js__["a" /* default */];

/* harmony default export */ __webpack_exports__["a"] = (isBuffer);

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__("./node_modules/webpack/buildin/harmony-module.js")(module)))

/***/ }),

/***/ "./node_modules/lodash-es/isEmpty.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__baseKeys_js__ = __webpack_require__("./node_modules/lodash-es/_baseKeys.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__getTag_js__ = __webpack_require__("./node_modules/lodash-es/_getTag.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isArguments_js__ = __webpack_require__("./node_modules/lodash-es/isArguments.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__isArray_js__ = __webpack_require__("./node_modules/lodash-es/isArray.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__isArrayLike_js__ = __webpack_require__("./node_modules/lodash-es/isArrayLike.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__isBuffer_js__ = __webpack_require__("./node_modules/lodash-es/isBuffer.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__isPrototype_js__ = __webpack_require__("./node_modules/lodash-es/_isPrototype.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__isTypedArray_js__ = __webpack_require__("./node_modules/lodash-es/isTypedArray.js");









/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (Object(__WEBPACK_IMPORTED_MODULE_4__isArrayLike_js__["a" /* default */])(value) &&
      (Object(__WEBPACK_IMPORTED_MODULE_3__isArray_js__["a" /* default */])(value) || typeof value == 'string' || typeof value.splice == 'function' ||
        Object(__WEBPACK_IMPORTED_MODULE_5__isBuffer_js__["a" /* default */])(value) || Object(__WEBPACK_IMPORTED_MODULE_7__isTypedArray_js__["a" /* default */])(value) || Object(__WEBPACK_IMPORTED_MODULE_2__isArguments_js__["a" /* default */])(value))) {
    return !value.length;
  }
  var tag = Object(__WEBPACK_IMPORTED_MODULE_1__getTag_js__["a" /* default */])(value);
  if (tag == mapTag || tag == setTag) {
    return !value.size;
  }
  if (Object(__WEBPACK_IMPORTED_MODULE_6__isPrototype_js__["a" /* default */])(value)) {
    return !Object(__WEBPACK_IMPORTED_MODULE_0__baseKeys_js__["a" /* default */])(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}

/* harmony default export */ __webpack_exports__["a"] = (isEmpty);


/***/ }),

/***/ "./node_modules/lodash-es/isFunction.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__ = __webpack_require__("./node_modules/lodash-es/_baseGetTag.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__isObject_js__ = __webpack_require__("./node_modules/lodash-es/isObject.js");



/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!Object(__WEBPACK_IMPORTED_MODULE_1__isObject_js__["a" /* default */])(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = Object(__WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__["a" /* default */])(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/* harmony default export */ __webpack_exports__["a"] = (isFunction);


/***/ }),

/***/ "./node_modules/lodash-es/isLength.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/* harmony default export */ __webpack_exports__["a"] = (isLength);


/***/ }),

/***/ "./node_modules/lodash-es/isNil.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
 * @example
 *
 * _.isNil(null);
 * // => true
 *
 * _.isNil(void 0);
 * // => true
 *
 * _.isNil(NaN);
 * // => false
 */
function isNil(value) {
  return value == null;
}

/* harmony default export */ __webpack_exports__["a"] = (isNil);


/***/ }),

/***/ "./node_modules/lodash-es/isObject.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/* harmony default export */ __webpack_exports__["a"] = (isObject);


/***/ }),

/***/ "./node_modules/lodash-es/isObjectLike.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/* harmony default export */ __webpack_exports__["a"] = (isObjectLike);


/***/ }),

/***/ "./node_modules/lodash-es/isString.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__ = __webpack_require__("./node_modules/lodash-es/_baseGetTag.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__isArray_js__ = __webpack_require__("./node_modules/lodash-es/isArray.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isObjectLike_js__ = __webpack_require__("./node_modules/lodash-es/isObjectLike.js");




/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!Object(__WEBPACK_IMPORTED_MODULE_1__isArray_js__["a" /* default */])(value) && Object(__WEBPACK_IMPORTED_MODULE_2__isObjectLike_js__["a" /* default */])(value) && Object(__WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__["a" /* default */])(value) == stringTag);
}

/* harmony default export */ __webpack_exports__["a"] = (isString);


/***/ }),

/***/ "./node_modules/lodash-es/isSymbol.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__ = __webpack_require__("./node_modules/lodash-es/_baseGetTag.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__isObjectLike_js__ = __webpack_require__("./node_modules/lodash-es/isObjectLike.js");



/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (Object(__WEBPACK_IMPORTED_MODULE_1__isObjectLike_js__["a" /* default */])(value) && Object(__WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__["a" /* default */])(value) == symbolTag);
}

/* harmony default export */ __webpack_exports__["a"] = (isSymbol);


/***/ }),

/***/ "./node_modules/lodash-es/isTypedArray.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__baseIsTypedArray_js__ = __webpack_require__("./node_modules/lodash-es/_baseIsTypedArray.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__baseUnary_js__ = __webpack_require__("./node_modules/lodash-es/_baseUnary.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__nodeUtil_js__ = __webpack_require__("./node_modules/lodash-es/_nodeUtil.js");




/* Node.js helper references. */
var nodeIsTypedArray = __WEBPACK_IMPORTED_MODULE_2__nodeUtil_js__["a" /* default */] && __WEBPACK_IMPORTED_MODULE_2__nodeUtil_js__["a" /* default */].isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? Object(__WEBPACK_IMPORTED_MODULE_1__baseUnary_js__["a" /* default */])(nodeIsTypedArray) : __WEBPACK_IMPORTED_MODULE_0__baseIsTypedArray_js__["a" /* default */];

/* harmony default export */ __webpack_exports__["a"] = (isTypedArray);


/***/ }),

/***/ "./node_modules/lodash-es/now.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__root_js__ = __webpack_require__("./node_modules/lodash-es/_root.js");


/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return __WEBPACK_IMPORTED_MODULE_0__root_js__["a" /* default */].Date.now();
};

/* harmony default export */ __webpack_exports__["a"] = (now);


/***/ }),

/***/ "./node_modules/lodash-es/stubFalse.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

/* harmony default export */ __webpack_exports__["a"] = (stubFalse);


/***/ }),

/***/ "./node_modules/lodash-es/toNumber.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isObject_js__ = __webpack_require__("./node_modules/lodash-es/isObject.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__isSymbol_js__ = __webpack_require__("./node_modules/lodash-es/isSymbol.js");



/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (Object(__WEBPACK_IMPORTED_MODULE_1__isSymbol_js__["a" /* default */])(value)) {
    return NAN;
  }
  if (Object(__WEBPACK_IMPORTED_MODULE_0__isObject_js__["a" /* default */])(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = Object(__WEBPACK_IMPORTED_MODULE_0__isObject_js__["a" /* default */])(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/* harmony default export */ __webpack_exports__["a"] = (toNumber);


/***/ }),

/***/ "./node_modules/rxjs/Observable.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var root_1 = __webpack_require__("./node_modules/rxjs/util/root.js");
var toSubscriber_1 = __webpack_require__("./node_modules/rxjs/util/toSubscriber.js");
var observable_1 = __webpack_require__("./node_modules/rxjs/symbol/observable.js");
var pipe_1 = __webpack_require__("./node_modules/rxjs/util/pipe.js");
/**
 * A representation of any set of values over any amount of time. This is the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
var Observable = (function () {
    /**
     * @constructor
     * @param {Function} subscribe the function that is called when the Observable is
     * initially subscribed to. This function is given a Subscriber, to which new values
     * can be `next`ed, or an `error` method can be called to raise an error, or
     * `complete` can be called to notify of a successful completion.
     */
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    /**
     * Creates a new Observable, with this Observable as the source, and the passed
     * operator defined as the new observable's operator.
     * @method lift
     * @param {Operator} operator the operator defining the operation to take on the observable
     * @return {Observable} a new observable with the Operator applied
     */
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    /**
     * Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.
     *
     * <span class="informal">Use it when you have all these Observables, but still nothing is happening.</span>
     *
     * `subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It
     * might be for example a function that you passed to a {@link create} static factory, but most of the time it is
     * a library implementation, which defines what and when will be emitted by an Observable. This means that calling
     * `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often
     * thought.
     *
     * Apart from starting the execution of an Observable, this method allows you to listen for values
     * that an Observable emits, as well as for when it completes or errors. You can achieve this in two
     * following ways.
     *
     * The first way is creating an object that implements {@link Observer} interface. It should have methods
     * defined by that interface, but note that it should be just a regular JavaScript object, which you can create
     * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular do
     * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
     * that your object does not have to implement all methods. If you find yourself creating a method that doesn't
     * do anything, you can simply omit it. Note however, that if `error` method is not provided, all errors will
     * be left uncaught.
     *
     * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.
     * This means you can provide three functions as arguments to `subscribe`, where first function is equivalent
     * of a `next` method, second of an `error` method and third of a `complete` method. Just as in case of Observer,
     * if you do not need to listen for something, you can omit a function, preferably by passing `undefined` or `null`,
     * since `subscribe` recognizes these functions by where they were placed in function call. When it comes
     * to `error` function, just as before, if not provided, errors emitted by an Observable will be thrown.
     *
     * Whatever style of calling `subscribe` you use, in both cases it returns a Subscription object.
     * This object allows you to call `unsubscribe` on it, which in turn will stop work that an Observable does and will clean
     * up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback
     * provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.
     *
     * Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.
     * It is an Observable itself that decides when these functions will be called. For example {@link of}
     * by default emits all its values synchronously. Always check documentation for how given Observable
     * will behave when subscribed and if its default behavior can be modified with a {@link Scheduler}.
     *
     * @example <caption>Subscribe with an Observer</caption>
     * const sumObserver = {
     *   sum: 0,
     *   next(value) {
     *     console.log('Adding: ' + value);
     *     this.sum = this.sum + value;
     *   },
     *   error() { // We actually could just remove this method,
     *   },        // since we do not really care about errors right now.
     *   complete() {
     *     console.log('Sum equals: ' + this.sum);
     *   }
     * };
     *
     * Rx.Observable.of(1, 2, 3) // Synchronously emits 1, 2, 3 and then completes.
     * .subscribe(sumObserver);
     *
     * // Logs:
     * // "Adding: 1"
     * // "Adding: 2"
     * // "Adding: 3"
     * // "Sum equals: 6"
     *
     *
     * @example <caption>Subscribe with functions</caption>
     * let sum = 0;
     *
     * Rx.Observable.of(1, 2, 3)
     * .subscribe(
     *   function(value) {
     *     console.log('Adding: ' + value);
     *     sum = sum + value;
     *   },
     *   undefined,
     *   function() {
     *     console.log('Sum equals: ' + sum);
     *   }
     * );
     *
     * // Logs:
     * // "Adding: 1"
     * // "Adding: 2"
     * // "Adding: 3"
     * // "Sum equals: 6"
     *
     *
     * @example <caption>Cancel a subscription</caption>
     * const subscription = Rx.Observable.interval(1000).subscribe(
     *   num => console.log(num),
     *   undefined,
     *   () => console.log('completed!') // Will not be called, even
     * );                                // when cancelling subscription
     *
     *
     * setTimeout(() => {
     *   subscription.unsubscribe();
     *   console.log('unsubscribed!');
     * }, 2500);
     *
     * // Logs:
     * // 0 after 1s
     * // 1 after 2s
     * // "unsubscribed!" after 2.5s
     *
     *
     * @param {Observer|Function} observerOrNext (optional) Either an observer with methods to be called,
     *  or the first of three possible handlers, which is the handler for each value emitted from the subscribed
     *  Observable.
     * @param {Function} error (optional) A handler for a terminal event resulting from an error. If no error handler is provided,
     *  the error will be thrown as unhandled.
     * @param {Function} complete (optional) A handler for a terminal event resulting from successful completion.
     * @return {ISubscription} a subscription reference to the registered handlers
     * @method subscribe
     */
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var operator = this.operator;
        var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
        if (operator) {
            operator.call(sink, this.source);
        }
        else {
            sink.add(this.source || !sink.syncErrorThrowable ? this._subscribe(sink) : this._trySubscribe(sink));
        }
        if (sink.syncErrorThrowable) {
            sink.syncErrorThrowable = false;
            if (sink.syncErrorThrown) {
                throw sink.syncErrorValue;
            }
        }
        return sink;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.syncErrorThrown = true;
            sink.syncErrorValue = err;
            sink.error(err);
        }
    };
    /**
     * @method forEach
     * @param {Function} next a handler for each value emitted by the observable
     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
     * @return {Promise} a promise that either resolves on observable completion or
     *  rejects with the handled error
     */
    Observable.prototype.forEach = function (next, PromiseCtor) {
        var _this = this;
        if (!PromiseCtor) {
            if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {
                PromiseCtor = root_1.root.Rx.config.Promise;
            }
            else if (root_1.root.Promise) {
                PromiseCtor = root_1.root.Promise;
            }
        }
        if (!PromiseCtor) {
            throw new Error('no Promise impl found');
        }
        return new PromiseCtor(function (resolve, reject) {
            // Must be declared in a separate statement to avoid a RefernceError when
            // accessing subscription below in the closure due to Temporal Dead Zone.
            var subscription;
            subscription = _this.subscribe(function (value) {
                if (subscription) {
                    // if there is a subscription, then we can surmise
                    // the next handling is asynchronous. Any errors thrown
                    // need to be rejected explicitly and unsubscribe must be
                    // called manually
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscription.unsubscribe();
                    }
                }
                else {
                    // if there is NO subscription, then we're getting a nexted
                    // value synchronously during subscription. We can just call it.
                    // If it errors, Observable's `subscribe` will ensure the
                    // unsubscription logic is called, then synchronously rethrow the error.
                    // After that, Promise will trap the error and send it
                    // down the rejection path.
                    next(value);
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        return this.source.subscribe(subscriber);
    };
    /**
     * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
     * @method Symbol.observable
     * @return {Observable} this instance of the observable
     */
    Observable.prototype[observable_1.observable] = function () {
        return this;
    };
    /* tslint:enable:max-line-length */
    /**
     * Used to stitch together functional operators into a chain.
     * @method pipe
     * @return {Observable} the Observable result of all of the operators having
     * been called in the order they were passed in.
     *
     * @example
     *
     * import { map, filter, scan } from 'rxjs/operators';
     *
     * Rx.Observable.interval(1000)
     *   .pipe(
     *     filter(x => x % 2 === 0),
     *     map(x => x + x),
     *     scan((acc, x) => acc + x)
     *   )
     *   .subscribe(x => console.log(x))
     */
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i - 0] = arguments[_i];
        }
        if (operations.length === 0) {
            return this;
        }
        return pipe_1.pipeFromArray(operations)(this);
    };
    /* tslint:enable:max-line-length */
    Observable.prototype.toPromise = function (PromiseCtor) {
        var _this = this;
        if (!PromiseCtor) {
            if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {
                PromiseCtor = root_1.root.Rx.config.Promise;
            }
            else if (root_1.root.Promise) {
                PromiseCtor = root_1.root.Promise;
            }
        }
        if (!PromiseCtor) {
            throw new Error('no Promise impl found');
        }
        return new PromiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    // HACK: Since TypeScript inherits static properties too, we have to
    // fight against TypeScript here so Subject can have a different static create signature
    /**
     * Creates a new cold Observable by calling the Observable constructor
     * @static true
     * @owner Observable
     * @method create
     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
     * @return {Observable} a new cold observable
     */
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
exports.Observable = Observable;
//# sourceMappingURL=Observable.js.map

/***/ }),

/***/ "./node_modules/rxjs/Observer.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.empty = {
    closed: true,
    next: function (value) { },
    error: function (err) { throw err; },
    complete: function () { }
};
//# sourceMappingURL=Observer.js.map

/***/ }),

/***/ "./node_modules/rxjs/Subscriber.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var isFunction_1 = __webpack_require__("./node_modules/rxjs/util/isFunction.js");
var Subscription_1 = __webpack_require__("./node_modules/rxjs/Subscription.js");
var Observer_1 = __webpack_require__("./node_modules/rxjs/Observer.js");
var rxSubscriber_1 = __webpack_require__("./node_modules/rxjs/symbol/rxSubscriber.js");
/**
 * Implements the {@link Observer} interface and extends the
 * {@link Subscription} class. While the {@link Observer} is the public API for
 * consuming the values of an {@link Observable}, all Observers get converted to
 * a Subscriber, in order to provide Subscription-like capabilities such as
 * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
 * implementing operators, but it is rarely used as a public API.
 *
 * @class Subscriber<T>
 */
var Subscriber = (function (_super) {
    __extends(Subscriber, _super);
    /**
     * @param {Observer|function(value: T): void} [destinationOrNext] A partially
     * defined Observer or a `next` callback function.
     * @param {function(e: ?any): void} [error] The `error` callback of an
     * Observer.
     * @param {function(): void} [complete] The `complete` callback of an
     * Observer.
     */
    function Subscriber(destinationOrNext, error, complete) {
        _super.call(this);
        this.syncErrorValue = null;
        this.syncErrorThrown = false;
        this.syncErrorThrowable = false;
        this.isStopped = false;
        switch (arguments.length) {
            case 0:
                this.destination = Observer_1.empty;
                break;
            case 1:
                if (!destinationOrNext) {
                    this.destination = Observer_1.empty;
                    break;
                }
                if (typeof destinationOrNext === 'object') {
                    if (destinationOrNext instanceof Subscriber) {
                        this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                        this.destination = destinationOrNext;
                        this.destination.add(this);
                    }
                    else {
                        this.syncErrorThrowable = true;
                        this.destination = new SafeSubscriber(this, destinationOrNext);
                    }
                    break;
                }
            default:
                this.syncErrorThrowable = true;
                this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);
                break;
        }
    }
    Subscriber.prototype[rxSubscriber_1.rxSubscriber] = function () { return this; };
    /**
     * A static factory for a Subscriber, given a (potentially partial) definition
     * of an Observer.
     * @param {function(x: ?T): void} [next] The `next` callback of an Observer.
     * @param {function(e: ?any): void} [error] The `error` callback of an
     * Observer.
     * @param {function(): void} [complete] The `complete` callback of an
     * Observer.
     * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)
     * Observer represented by the given arguments.
     */
    Subscriber.create = function (next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    /**
     * The {@link Observer} callback to receive notifications of type `next` from
     * the Observable, with a value. The Observable may call this method 0 or more
     * times.
     * @param {T} [value] The `next` value.
     * @return {void}
     */
    Subscriber.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    /**
     * The {@link Observer} callback to receive notifications of type `error` from
     * the Observable, with an attached {@link Error}. Notifies the Observer that
     * the Observable has experienced an error condition.
     * @param {any} [err] The `error` exception.
     * @return {void}
     */
    Subscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    /**
     * The {@link Observer} callback to receive a valueless notification of type
     * `complete` from the Observable. Notifies the Observer that the Observable
     * has finished sending push-based notifications.
     * @return {void}
     */
    Subscriber.prototype.complete = function () {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    Subscriber.prototype._unsubscribeAndRecycle = function () {
        var _a = this, _parent = _a._parent, _parents = _a._parents;
        this._parent = null;
        this._parents = null;
        this.unsubscribe();
        this.closed = false;
        this.isStopped = false;
        this._parent = _parent;
        this._parents = _parents;
        return this;
    };
    return Subscriber;
}(Subscription_1.Subscription));
exports.Subscriber = Subscriber;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var SafeSubscriber = (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
        _super.call(this);
        this._parentSubscriber = _parentSubscriber;
        var next;
        var context = this;
        if (isFunction_1.isFunction(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== Observer_1.empty) {
                context = Object.create(observerOrNext);
                if (isFunction_1.isFunction(context.unsubscribe)) {
                    this.add(context.unsubscribe.bind(context));
                }
                context.unsubscribe = this.unsubscribe.bind(this);
            }
        }
        this._context = context;
        this._next = next;
        this._error = error;
        this._complete = complete;
    }
    SafeSubscriber.prototype.next = function (value) {
        if (!this.isStopped && this._next) {
            var _parentSubscriber = this._parentSubscriber;
            if (!_parentSubscriber.syncErrorThrowable) {
                this.__tryOrUnsub(this._next, value);
            }
            else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._error) {
                if (!_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._error, err);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, this._error, err);
                    this.unsubscribe();
                }
            }
            else if (!_parentSubscriber.syncErrorThrowable) {
                this.unsubscribe();
                throw err;
            }
            else {
                _parentSubscriber.syncErrorValue = err;
                _parentSubscriber.syncErrorThrown = true;
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function () {
        var _this = this;
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._complete) {
                var wrappedComplete = function () { return _this._complete.call(_this._context); };
                if (!_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(wrappedComplete);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                    this.unsubscribe();
                }
            }
            else {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            this.unsubscribe();
            throw err;
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            parent.syncErrorValue = err;
            parent.syncErrorThrown = true;
            return true;
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function () {
        var _parentSubscriber = this._parentSubscriber;
        this._context = null;
        this._parentSubscriber = null;
        _parentSubscriber.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber));
//# sourceMappingURL=Subscriber.js.map

/***/ }),

/***/ "./node_modules/rxjs/Subscription.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var isArray_1 = __webpack_require__("./node_modules/rxjs/util/isArray.js");
var isObject_1 = __webpack_require__("./node_modules/rxjs/util/isObject.js");
var isFunction_1 = __webpack_require__("./node_modules/rxjs/util/isFunction.js");
var tryCatch_1 = __webpack_require__("./node_modules/rxjs/util/tryCatch.js");
var errorObject_1 = __webpack_require__("./node_modules/rxjs/util/errorObject.js");
var UnsubscriptionError_1 = __webpack_require__("./node_modules/rxjs/util/UnsubscriptionError.js");
/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Subscription has one important method, `unsubscribe`, that takes no argument
 * and just disposes the resource held by the subscription.
 *
 * Additionally, subscriptions may be grouped together through the `add()`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 *
 * @class Subscription
 */
var Subscription = (function () {
    /**
     * @param {function(): void} [unsubscribe] A function describing how to
     * perform the disposal of resources when the `unsubscribe` method is called.
     */
    function Subscription(unsubscribe) {
        /**
         * A flag to indicate whether this Subscription has already been unsubscribed.
         * @type {boolean}
         */
        this.closed = false;
        this._parent = null;
        this._parents = null;
        this._subscriptions = null;
        if (unsubscribe) {
            this._unsubscribe = unsubscribe;
        }
    }
    /**
     * Disposes the resources held by the subscription. May, for instance, cancel
     * an ongoing Observable execution or cancel any other type of work that
     * started when the Subscription was created.
     * @return {void}
     */
    Subscription.prototype.unsubscribe = function () {
        var hasErrors = false;
        var errors;
        if (this.closed) {
            return;
        }
        var _a = this, _parent = _a._parent, _parents = _a._parents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this.closed = true;
        this._parent = null;
        this._parents = null;
        // null out _subscriptions first so any child subscriptions that attempt
        // to remove themselves from this subscription will noop
        this._subscriptions = null;
        var index = -1;
        var len = _parents ? _parents.length : 0;
        // if this._parent is null, then so is this._parents, and we
        // don't have to remove ourselves from any parent subscriptions.
        while (_parent) {
            _parent.remove(this);
            // if this._parents is null or index >= len,
            // then _parent is set to null, and the loop exits
            _parent = ++index < len && _parents[index] || null;
        }
        if (isFunction_1.isFunction(_unsubscribe)) {
            var trial = tryCatch_1.tryCatch(_unsubscribe).call(this);
            if (trial === errorObject_1.errorObject) {
                hasErrors = true;
                errors = errors || (errorObject_1.errorObject.e instanceof UnsubscriptionError_1.UnsubscriptionError ?
                    flattenUnsubscriptionErrors(errorObject_1.errorObject.e.errors) : [errorObject_1.errorObject.e]);
            }
        }
        if (isArray_1.isArray(_subscriptions)) {
            index = -1;
            len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if (isObject_1.isObject(sub)) {
                    var trial = tryCatch_1.tryCatch(sub.unsubscribe).call(sub);
                    if (trial === errorObject_1.errorObject) {
                        hasErrors = true;
                        errors = errors || [];
                        var err = errorObject_1.errorObject.e;
                        if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {
                            errors = errors.concat(flattenUnsubscriptionErrors(err.errors));
                        }
                        else {
                            errors.push(err);
                        }
                    }
                }
            }
        }
        if (hasErrors) {
            throw new UnsubscriptionError_1.UnsubscriptionError(errors);
        }
    };
    /**
     * Adds a tear down to be called during the unsubscribe() of this
     * Subscription.
     *
     * If the tear down being added is a subscription that is already
     * unsubscribed, is the same reference `add` is being called on, or is
     * `Subscription.EMPTY`, it will not be added.
     *
     * If this subscription is already in an `closed` state, the passed
     * tear down logic will be executed immediately.
     *
     * @param {TeardownLogic} teardown The additional logic to execute on
     * teardown.
     * @return {Subscription} Returns the Subscription used or created to be
     * added to the inner subscriptions list. This Subscription can be used with
     * `remove()` to remove the passed teardown logic from the inner subscriptions
     * list.
     */
    Subscription.prototype.add = function (teardown) {
        if (!teardown || (teardown === Subscription.EMPTY)) {
            return Subscription.EMPTY;
        }
        if (teardown === this) {
            return this;
        }
        var subscription = teardown;
        switch (typeof teardown) {
            case 'function':
                subscription = new Subscription(teardown);
            case 'object':
                if (subscription.closed || typeof subscription.unsubscribe !== 'function') {
                    return subscription;
                }
                else if (this.closed) {
                    subscription.unsubscribe();
                    return subscription;
                }
                else if (typeof subscription._addParent !== 'function' /* quack quack */) {
                    var tmp = subscription;
                    subscription = new Subscription();
                    subscription._subscriptions = [tmp];
                }
                break;
            default:
                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
        }
        var subscriptions = this._subscriptions || (this._subscriptions = []);
        subscriptions.push(subscription);
        subscription._addParent(this);
        return subscription;
    };
    /**
     * Removes a Subscription from the internal list of subscriptions that will
     * unsubscribe during the unsubscribe process of this Subscription.
     * @param {Subscription} subscription The subscription to remove.
     * @return {void}
     */
    Subscription.prototype.remove = function (subscription) {
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.prototype._addParent = function (parent) {
        var _a = this, _parent = _a._parent, _parents = _a._parents;
        if (!_parent || _parent === parent) {
            // If we don't have a parent, or the new parent is the same as the
            // current parent, then set this._parent to the new parent.
            this._parent = parent;
        }
        else if (!_parents) {
            // If there's already one parent, but not multiple, allocate an Array to
            // store the rest of the parent Subscriptions.
            this._parents = [parent];
        }
        else if (_parents.indexOf(parent) === -1) {
            // Only add the new parent to the _parents list if it's not already there.
            _parents.push(parent);
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.closed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
}());
exports.Subscription = Subscription;
function flattenUnsubscriptionErrors(errors) {
    return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError_1.UnsubscriptionError) ? err.errors : err); }, []);
}
//# sourceMappingURL=Subscription.js.map

/***/ }),

/***/ "./node_modules/rxjs/symbol/observable.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var root_1 = __webpack_require__("./node_modules/rxjs/util/root.js");
function getSymbolObservable(context) {
    var $$observable;
    var Symbol = context.Symbol;
    if (typeof Symbol === 'function') {
        if (Symbol.observable) {
            $$observable = Symbol.observable;
        }
        else {
            $$observable = Symbol('observable');
            Symbol.observable = $$observable;
        }
    }
    else {
        $$observable = '@@observable';
    }
    return $$observable;
}
exports.getSymbolObservable = getSymbolObservable;
exports.observable = getSymbolObservable(root_1.root);
/**
 * @deprecated use observable instead
 */
exports.$$observable = exports.observable;
//# sourceMappingURL=observable.js.map

/***/ }),

/***/ "./node_modules/rxjs/symbol/rxSubscriber.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var root_1 = __webpack_require__("./node_modules/rxjs/util/root.js");
var Symbol = root_1.root.Symbol;
exports.rxSubscriber = (typeof Symbol === 'function' && typeof Symbol.for === 'function') ?
    Symbol.for('rxSubscriber') : '@@rxSubscriber';
/**
 * @deprecated use rxSubscriber instead
 */
exports.$$rxSubscriber = exports.rxSubscriber;
//# sourceMappingURL=rxSubscriber.js.map

/***/ }),

/***/ "./node_modules/rxjs/util/UnsubscriptionError.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 */
var UnsubscriptionError = (function (_super) {
    __extends(UnsubscriptionError, _super);
    function UnsubscriptionError(errors) {
        _super.call(this);
        this.errors = errors;
        var err = Error.call(this, errors ?
            errors.length + " errors occurred during unsubscription:\n  " + errors.map(function (err, i) { return ((i + 1) + ") " + err.toString()); }).join('\n  ') : '');
        this.name = err.name = 'UnsubscriptionError';
        this.stack = err.stack;
        this.message = err.message;
    }
    return UnsubscriptionError;
}(Error));
exports.UnsubscriptionError = UnsubscriptionError;
//# sourceMappingURL=UnsubscriptionError.js.map

/***/ }),

/***/ "./node_modules/rxjs/util/errorObject.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// typeof any so that it we don't have to cast when comparing a result to the error object
exports.errorObject = { e: {} };
//# sourceMappingURL=errorObject.js.map

/***/ }),

/***/ "./node_modules/rxjs/util/isArray.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.isArray = Array.isArray || (function (x) { return x && typeof x.length === 'number'; });
//# sourceMappingURL=isArray.js.map

/***/ }),

/***/ "./node_modules/rxjs/util/isFunction.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function isFunction(x) {
    return typeof x === 'function';
}
exports.isFunction = isFunction;
//# sourceMappingURL=isFunction.js.map

/***/ }),

/***/ "./node_modules/rxjs/util/isObject.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function isObject(x) {
    return x != null && typeof x === 'object';
}
exports.isObject = isObject;
//# sourceMappingURL=isObject.js.map

/***/ }),

/***/ "./node_modules/rxjs/util/noop.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* tslint:disable:no-empty */
function noop() { }
exports.noop = noop;
//# sourceMappingURL=noop.js.map

/***/ }),

/***/ "./node_modules/rxjs/util/pipe.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var noop_1 = __webpack_require__("./node_modules/rxjs/util/noop.js");
/* tslint:enable:max-line-length */
function pipe() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i - 0] = arguments[_i];
    }
    return pipeFromArray(fns);
}
exports.pipe = pipe;
/* @internal */
function pipeFromArray(fns) {
    if (!fns) {
        return noop_1.noop;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}
exports.pipeFromArray = pipeFromArray;
//# sourceMappingURL=pipe.js.map

/***/ }),

/***/ "./node_modules/rxjs/util/root.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
// CommonJS / Node have global context exposed as "global" variable.
// We don't want to include the whole node.d.ts this this compilation unit so we'll just fake
// the global "global" var for now.
var __window = typeof window !== 'undefined' && window;
var __self = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope && self;
var __global = typeof global !== 'undefined' && global;
var _root = __window || __global || __self;
exports.root = _root;
// Workaround Closure Compiler restriction: The body of a goog.module cannot use throw.
// This is needed when used with angular/tsickle which inserts a goog.module statement.
// Wrap in IIFE
(function () {
    if (!_root) {
        throw new Error('RxJS could not find any global context (window, self, global)');
    }
})();
//# sourceMappingURL=root.js.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/rxjs/util/toSubscriber.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Subscriber_1 = __webpack_require__("./node_modules/rxjs/Subscriber.js");
var rxSubscriber_1 = __webpack_require__("./node_modules/rxjs/symbol/rxSubscriber.js");
var Observer_1 = __webpack_require__("./node_modules/rxjs/Observer.js");
function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof Subscriber_1.Subscriber) {
            return nextOrObserver;
        }
        if (nextOrObserver[rxSubscriber_1.rxSubscriber]) {
            return nextOrObserver[rxSubscriber_1.rxSubscriber]();
        }
    }
    if (!nextOrObserver && !error && !complete) {
        return new Subscriber_1.Subscriber(Observer_1.empty);
    }
    return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
}
exports.toSubscriber = toSubscriber;
//# sourceMappingURL=toSubscriber.js.map

/***/ }),

/***/ "./node_modules/rxjs/util/tryCatch.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var errorObject_1 = __webpack_require__("./node_modules/rxjs/util/errorObject.js");
var tryCatchTarget;
function tryCatcher() {
    try {
        return tryCatchTarget.apply(this, arguments);
    }
    catch (e) {
        errorObject_1.errorObject.e = e;
        return errorObject_1.errorObject;
    }
}
function tryCatch(fn) {
    tryCatchTarget = fn;
    return tryCatcher;
}
exports.tryCatch = tryCatch;
;
//# sourceMappingURL=tryCatch.js.map

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./node_modules/webpack/buildin/harmony-module.js":
/***/ (function(module, exports) {

module.exports = function(originalModule) {
	if(!originalModule.webpackPolyfill) {
		var module = Object.create(originalModule);
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		Object.defineProperty(module, "exports", {
			enumerable: true,
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./src/authentication/authenticator.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AuthError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Authenticator; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__endpoint_manager__ = __webpack_require__("./src/authentication/endpoint.manager.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__token_manager__ = __webpack_require__("./src/authentication/token.manager.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__helpers_dialog__ = __webpack_require__("./src/helpers/dialog.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__errors_custom_error__ = __webpack_require__("./src/errors/custom.error.ts");
// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
var __extends = this && this.__extends || function () {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
    } || function (d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
        }
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = this && this.__generator || function (thisArg, body) {
    var _ = { label: 0, sent: function sent() {
            if (t[0] & 1) throw t[1];return t[1];
        }, trys: [], ops: [] },
        f,
        y,
        t,
        g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
    }), g;
    function verb(n) {
        return function (v) {
            return step([n, v]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) {
            try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0:case 1:
                        t = op;break;
                    case 4:
                        _.label++;return { value: op[1], done: false };
                    case 5:
                        _.label++;y = op[1];op = [0];continue;
                    case 7:
                        op = _.ops.pop();_.trys.pop();continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;continue;
                        }
                        if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                            _.label = op[1];break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];t = op;break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];_.ops.push(op);break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();continue;
                }
                op = body.call(thisArg, _);
            } catch (e) {
                op = [6, e];y = 0;
            } finally {
                f = t = 0;
            }
        }if (op[0] & 5) throw op[1];return { value: op[0] ? op[1] : void 0, done: true };
    }
};




/**
 * Custom error type to handle OAuth specific errors.
 */
var AuthError = /** @class */function (_super) {
    __extends(AuthError, _super);
    /**
     * @constructor
     *
     * @param message Error message to be propagated.
     * @param state OAuth state if available.
    */
    function AuthError(message, innerError) {
        var _this = _super.call(this, 'AuthError', message, innerError) || this;
        _this.innerError = innerError;
        return _this;
    }
    return AuthError;
}(__WEBPACK_IMPORTED_MODULE_3__errors_custom_error__["a" /* CustomError */]);

/**
 * Helper for performing Implicit OAuth Authentication with registered endpoints.
 */
var Authenticator = /** @class */function () {
    /**
     * @constructor
     *
     * @param endpoints Depends on an instance of EndpointStorage.
     * @param tokens Depends on an instance of TokenStorage.
    */
    function Authenticator(endpoints, tokens) {
        this.endpoints = endpoints;
        this.tokens = tokens;
        if (endpoints == null) {
            this.endpoints = new __WEBPACK_IMPORTED_MODULE_0__endpoint_manager__["b" /* EndpointStorage */]();
        }
        if (tokens == null) {
            this.tokens = new __WEBPACK_IMPORTED_MODULE_1__token_manager__["a" /* TokenStorage */]();
        }
    }
    /**
     * Authenticate based on the given provider.
     * Either uses DialogAPI or Window Popups based on where its being called from either Add-in or Web.
     * If the token was cached, the it retrieves the cached token.
     * If the cached token has expired then the authentication dialog is displayed.
     *
     * NOTE: you have to manually check the expires_in or expires_at property to determine
     * if the token has expired.
     *
     * @param {string} provider Link to the provider.
     * @param {boolean} force Force re-authentication.
     * @return {Promise<IToken|ICode>} Returns a promise of the token or code or error.
     */
    Authenticator.prototype.authenticate = function (provider, force, useMicrosoftTeams) {
        if (force === void 0) {
            force = false;
        }
        if (useMicrosoftTeams === void 0) {
            useMicrosoftTeams = false;
        }
        var token = this.tokens.get(provider);
        var hasTokenExpired = __WEBPACK_IMPORTED_MODULE_1__token_manager__["a" /* TokenStorage */].hasExpired(token);
        if (!hasTokenExpired && !force) {
            return Promise.resolve(token);
        }
        return this._openAuthDialog(provider, useMicrosoftTeams);
    };
    /**
     * Check if the currrent url is running inside of a Dialog that contains an access_token or code or error.
     * If true then it calls messageParent by extracting the token information, thereby closing the dialog.
     * Otherwise, the caller should proceed with normal initialization of their application.
     *
     * This logic assumes that the redirect url is your application and hence when your code runs again in
     * the dialog, this logic takes over and closes it for you.
     *
     * @return {boolean}
     * Returns false if the code is running inside of a dialog without the required information
     * or is not running inside of a dialog at all.
     */
    Authenticator.isAuthDialog = function (useMicrosoftTeams) {
        if (useMicrosoftTeams === void 0) {
            useMicrosoftTeams = false;
        }
        // If the url doesn't contain and access_token, code or error then return false.
        // This is in scenarios where we don't want to automatically control what happens to the dialog.
        if (!/(access_token|code|error|state)/gi.test(location.href)) {
            return false;
        }
        __WEBPACK_IMPORTED_MODULE_2__helpers_dialog__["a" /* Dialog */].close(location.href, useMicrosoftTeams);
        return true;
    };
    /**
     * Extract the token from the URL
     *
     * @param {string} url The url to extract the token from.
     * @param {string} exclude Exclude a particlaur string from the url, such as a query param or specific substring.
     * @param {string} delimiter[optional] Delimiter used by OAuth provider to mark the beginning of token response. Defaults to #.
     * @return {object} Returns the extracted token.
     */
    Authenticator.getUrlParams = function (url, exclude, delimiter) {
        if (url === void 0) {
            url = location.href;
        }
        if (exclude === void 0) {
            exclude = location.origin;
        }
        if (delimiter === void 0) {
            delimiter = '#';
        }
        if (exclude) {
            url = url.replace(exclude, '');
        }
        var _a = url.split(delimiter),
            left = _a[0],
            right = _a[1];
        var tokenString = right == null ? left : right;
        if (tokenString.indexOf('?') !== -1) {
            tokenString = tokenString.split('?')[1];
        }
        return Authenticator.extractParams(tokenString);
    };
    Authenticator.extractParams = function (segment) {
        if (segment == null || segment.trim() === '') {
            return null;
        }
        var params = {};
        var regex = /([^&=]+)=([^&]*)/g;
        var matchParts;
        while ((matchParts = regex.exec(segment)) !== null) {
            // Fixes bugs when the state parameters contains a / before them
            if (matchParts[1] === '/state') {
                matchParts[1] = matchParts[1].replace('/', '');
            }
            params[decodeURIComponent(matchParts[1])] = decodeURIComponent(matchParts[2]);
        }
        return params;
    };
    Authenticator.prototype._openAuthDialog = function (provider, useMicrosoftTeams) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, _a, state, url, redirectUrl;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        endpoint = this.endpoints.get(provider);
                        if (endpoint == null) {
                            return [2 /*return*/, Promise.reject(new AuthError("No such registered endpoint: " + provider + " could be found."))];
                        }
                        _a = __WEBPACK_IMPORTED_MODULE_0__endpoint_manager__["b" /* EndpointStorage */].getLoginParams(endpoint), state = _a.state, url = _a.url;
                        return [4 /*yield*/, new __WEBPACK_IMPORTED_MODULE_2__helpers_dialog__["a" /* Dialog */](url, 1024, 768, useMicrosoftTeams).result];
                    case 1:
                        redirectUrl = _b.sent();
                        // Try and extract the result and pass it along.
                        return [2 /*return*/, this._handleTokenResult(redirectUrl, endpoint, state)];
                }
            });
        });
    };
    /**
     * Helper for exchanging the code with a registered Endpoint.
     * The helper sends a POST request to the given Endpoint's tokenUrl.
     *
     * The Endpoint must accept the data JSON input and return an 'access_token'
     * in the JSON output.
     *
     * @param {Endpoint} endpoint Endpoint configuration.
     * @param {object} data Data to be sent to the tokenUrl.
     * @param {object} headers Headers to be sent to the tokenUrl.     *
     * @return {Promise<IToken>} Returns a promise of the token or error.
     */
    Authenticator.prototype._exchangeCodeForToken = function (endpoint, data, headers) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (endpoint.tokenUrl == null) {
                console.warn('We couldn\'t exchange the received code for an access_token. The value returned is not an access_token. Please set the tokenUrl property or refer to our docs.');
                return resolve(data);
            }
            var xhr = new XMLHttpRequest();
            xhr.open('POST', endpoint.tokenUrl);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'application/json');
            for (var header in headers) {
                if (header === 'Accept' || header === 'Content-Type') {
                    continue;
                }
                xhr.setRequestHeader(header, headers[header]);
            }
            xhr.onerror = function () {
                return reject(new AuthError('Unable to send request due to a Network error'));
            };
            xhr.onload = function () {
                try {
                    if (xhr.status === 200) {
                        var json = JSON.parse(xhr.responseText);
                        if (json == null) {
                            return reject(new AuthError('No access_token or code could be parsed.'));
                        } else if ('access_token' in json) {
                            _this.tokens.add(endpoint.provider, json);
                            return resolve(json);
                        } else {
                            return reject(new AuthError(json.error, json.state));
                        }
                    } else if (xhr.status !== 200) {
                        return reject(new AuthError('Request failed. ' + xhr.response));
                    }
                } catch (e) {
                    return reject(new AuthError('An error occured while parsing the response'));
                }
            };
            xhr.send(JSON.stringify(data));
        });
    };
    Authenticator.prototype._handleTokenResult = function (redirectUrl, endpoint, state) {
        var result = Authenticator.getUrlParams(redirectUrl, endpoint.redirectUrl);
        if (result == null) {
            throw new AuthError('No access_token or code could be parsed.');
        } else if (endpoint.state && +result.state !== state) {
            throw new AuthError('State couldn\'t be verified');
        } else if ('code' in result) {
            return this._exchangeCodeForToken(endpoint, result);
        } else if ('access_token' in result) {
            return this.tokens.add(endpoint.provider, result);
        } else {
            throw new AuthError(result.error);
        }
    };
    return Authenticator;
}();


/***/ }),

/***/ "./src/authentication/endpoint.manager.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DefaultEndpoints; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return EndpointStorage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__helpers_utilities__ = __webpack_require__("./src/helpers/utilities.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__helpers_storage__ = __webpack_require__("./src/helpers/storage.ts");
var __extends = this && this.__extends || function () {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
    } || function (d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
        }
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
var __assign = this && this.__assign || Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) {
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
    }
    return t;
};
// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.


var DefaultEndpoints = {
    Google: 'Google',
    Microsoft: 'Microsoft',
    Facebook: 'Facebook',
    AzureAD: 'AzureAD',
    Dropbox: 'Dropbox'
};
/**
 * Helper for creating and registering OAuth Endpoints.
 */
var EndpointStorage = /** @class */function (_super) {
    __extends(EndpointStorage, _super);
    /**
     * @constructor
    */
    function EndpointStorage(storageType) {
        if (storageType === void 0) {
            storageType = __WEBPACK_IMPORTED_MODULE_1__helpers_storage__["b" /* StorageType */].LocalStorage;
        }
        return _super.call(this, 'OAuth2Endpoints', storageType) || this;
    }
    /**
     * Extends Storage's default add method.
     * Registers a new OAuth Endpoint.
     *
     * @param {string} provider Unique name for the registered OAuth Endpoint.
     * @param {object} config Valid Endpoint configuration.
     * @see {@link IEndpointConfiguration}.
     * @return {object} Returns the added endpoint.
     */
    EndpointStorage.prototype.add = function (provider, config) {
        if (config.redirectUrl == null) {
            config.redirectUrl = window.location.origin;
        }
        config.provider = provider;
        return _super.prototype.set.call(this, provider, config);
    };
    /**
     * Register Google Implicit OAuth.
     * If overrides is left empty, the default scope is limited to basic profile information.
     *
     * @param {string} clientId ClientID for the Google App.
     * @param {object} config Valid Endpoint configuration to override the defaults.
     * @return {object} Returns the added endpoint.
     */
    EndpointStorage.prototype.registerGoogleAuth = function (clientId, overrides) {
        var defaults = {
            clientId: clientId,
            baseUrl: 'https://accounts.google.com',
            authorizeUrl: '/o/oauth2/v2/auth',
            resource: 'https://www.googleapis.com',
            responseType: 'token',
            scope: 'https://www.googleapis.com/auth/plus.me',
            state: true
        };
        var config = __assign({}, defaults, overrides);
        return this.add(DefaultEndpoints.Google, config);
    };
    /**
     * Register Microsoft Implicit OAuth.
     * If overrides is left empty, the default scope is limited to basic profile information.
     *
     * @param {string} clientId ClientID for the Microsoft App.
     * @param {object} config Valid Endpoint configuration to override the defaults.
     * @return {object} Returns the added endpoint.
     */
    EndpointStorage.prototype.registerMicrosoftAuth = function (clientId, overrides) {
        var defaults = {
            clientId: clientId,
            baseUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0',
            authorizeUrl: '/authorize',
            responseType: 'token',
            scope: 'https://graph.microsoft.com/user.read',
            extraQueryParameters: {
                response_mode: 'fragment'
            },
            nonce: true,
            state: true
        };
        var config = __assign({}, defaults, overrides);
        this.add(DefaultEndpoints.Microsoft, config);
    };
    /**
     * Register Facebook Implicit OAuth.
     * If overrides is left empty, the default scope is limited to basic profile information.
     *
     * @param {string} clientId ClientID for the Facebook App.
     * @param {object} config Valid Endpoint configuration to override the defaults.
     * @return {object} Returns the added endpoint.
     */
    EndpointStorage.prototype.registerFacebookAuth = function (clientId, overrides) {
        var defaults = {
            clientId: clientId,
            baseUrl: 'https://www.facebook.com',
            authorizeUrl: '/dialog/oauth',
            resource: 'https://graph.facebook.com',
            responseType: 'token',
            scope: 'public_profile',
            nonce: true,
            state: true
        };
        var config = __assign({}, defaults, overrides);
        this.add(DefaultEndpoints.Facebook, config);
    };
    /**
     * Register AzureAD Implicit OAuth.
     * If overrides is left empty, the default scope is limited to basic profile information.
     *
     * @param {string} clientId ClientID for the AzureAD App.
     * @param {string} tenant Tenant for the AzureAD App.
     * @param {object} config Valid Endpoint configuration to override the defaults.
     * @return {object} Returns the added endpoint.
     */
    EndpointStorage.prototype.registerAzureADAuth = function (clientId, tenant, overrides) {
        var defaults = {
            clientId: clientId,
            baseUrl: "https://login.windows.net/" + tenant,
            authorizeUrl: '/oauth2/authorize',
            resource: 'https://graph.microsoft.com',
            responseType: 'token',
            nonce: true,
            state: true
        };
        var config = __assign({}, defaults, overrides);
        this.add(DefaultEndpoints.AzureAD, config);
    };
    /**
     * Register Dropbox Implicit OAuth.
     * If overrides is left empty, the default scope is limited to basic profile information.
     *
     * @param {string} clientId ClientID for the Dropbox App.
     * @param {object} config Valid Endpoint configuration to override the defaults.
     * @return {object} Returns the added endpoint.
     */
    EndpointStorage.prototype.registerDropboxAuth = function (clientId, overrides) {
        var defaults = {
            clientId: clientId,
            baseUrl: "https://www.dropbox.com/1",
            authorizeUrl: '/oauth2/authorize',
            responseType: 'token',
            state: true
        };
        var config = __assign({}, defaults, overrides);
        this.add(DefaultEndpoints.Dropbox, config);
    };
    /**
     * Helper to generate the OAuth login url.
     *
     * @param {object} config Valid Endpoint configuration.
     * @return {object} Returns the added endpoint.
     */
    EndpointStorage.getLoginParams = function (endpointConfig) {
        var scope = endpointConfig.scope ? encodeURIComponent(endpointConfig.scope) : null;
        var resource = endpointConfig.resource ? encodeURIComponent(endpointConfig.resource) : null;
        var state = endpointConfig.state && __WEBPACK_IMPORTED_MODULE_0__helpers_utilities__["c" /* Utilities */].generateCryptoSafeRandom();
        var nonce = endpointConfig.nonce && __WEBPACK_IMPORTED_MODULE_0__helpers_utilities__["c" /* Utilities */].generateCryptoSafeRandom();
        var urlSegments = ["response_type=" + endpointConfig.responseType, "client_id=" + encodeURIComponent(endpointConfig.clientId), "redirect_uri=" + encodeURIComponent(endpointConfig.redirectUrl)];
        if (scope) {
            urlSegments.push("scope=" + scope);
        }
        if (resource) {
            urlSegments.push("resource=" + resource);
        }
        if (state) {
            urlSegments.push("state=" + state);
        }
        if (nonce) {
            urlSegments.push("nonce=" + nonce);
        }
        if (endpointConfig.extraQueryParameters) {
            for (var _i = 0, _a = Object.keys(endpointConfig.extraQueryParameters); _i < _a.length; _i++) {
                var param = _a[_i];
                urlSegments.push(param + "=" + encodeURIComponent(endpointConfig.extraQueryParameters[param]));
            }
        }
        return {
            url: "" + endpointConfig.baseUrl + endpointConfig.authorizeUrl + "?" + urlSegments.join('&'),
            state: state
        };
    };
    return EndpointStorage;
}(__WEBPACK_IMPORTED_MODULE_1__helpers_storage__["a" /* Storage */]);


/***/ }),

/***/ "./src/authentication/token.manager.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TokenStorage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__helpers_storage__ = __webpack_require__("./src/helpers/storage.ts");
// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
var __extends = this && this.__extends || function () {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
    } || function (d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
        }
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();

/**
 * Helper for caching and managing OAuth Tokens.
 */
var TokenStorage = /** @class */function (_super) {
    __extends(TokenStorage, _super);
    /**
     * @constructor
    */
    function TokenStorage(storageType) {
        if (storageType === void 0) {
            storageType = __WEBPACK_IMPORTED_MODULE_0__helpers_storage__["b" /* StorageType */].LocalStorage;
        }
        return _super.call(this, 'OAuth2Tokens', storageType) || this;
    }
    /**
     * Compute the expiration date based on the expires_in field in a OAuth token.
     */
    TokenStorage.setExpiry = function (token) {
        var expire = function expire(seconds) {
            return seconds == null ? null : new Date(new Date().getTime() + ~~seconds * 1000);
        };
        if (!(token == null) && token.expires_at == null) {
            token.expires_at = expire(token.expires_in);
        }
    };
    /**
     * Check if an OAuth token has expired.
     */
    TokenStorage.hasExpired = function (token) {
        if (token == null) {
            return true;
        }
        if (token.expires_at == null) {
            return false;
        } else {
            // If the token was stored, it's Date type property was stringified, so it needs to be converted back to Date.
            token.expires_at = token.expires_at instanceof Date ? token.expires_at : new Date(token.expires_at);
            return token.expires_at.getTime() - new Date().getTime() < 0;
        }
    };
    /**
     * Extends Storage's default get method
     * Gets an OAuth Token after checking its expiry
     *
     * @param {string} provider Unique name of the corresponding OAuth Token.
     * @return {object} Returns the token or null if its either expired or doesn't exist.
     */
    TokenStorage.prototype.get = function (provider) {
        var token = _super.prototype.get.call(this, provider);
        if (token == null) {
            return token;
        }
        var expired = TokenStorage.hasExpired(token);
        if (expired) {
            _super.prototype.delete.call(this, provider);
            return null;
        } else {
            return token;
        }
    };
    /**
     * Extends Storage's default add method
     * Adds a new OAuth Token after settings its expiry
     *
     * @param {string} provider Unique name of the corresponding OAuth Token.
     * @param {object} config valid Token
     * @see {@link IToken}.
     * @return {object} Returns the added token.
     */
    TokenStorage.prototype.add = function (provider, value) {
        value.provider = provider;
        TokenStorage.setExpiry(value);
        return _super.prototype.set.call(this, provider, value);
    };
    return TokenStorage;
}(__WEBPACK_IMPORTED_MODULE_0__helpers_storage__["a" /* Storage */]);


/***/ }),

/***/ "./src/errors/api.error.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return APIError; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__custom_error__ = __webpack_require__("./src/errors/custom.error.ts");
// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
var __extends = this && this.__extends || function () {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
    } || function (d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
        }
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();

/**
 * Custom error type to handle API specific errors.
 */
var APIError = /** @class */function (_super) {
    __extends(APIError, _super);
    /**
     * @constructor
     *
     * @param message: Error message to be propagated.
     * @param innerError: Inner error if any
    */
    function APIError(message, innerError) {
        var _this = _super.call(this, 'APIError', message, innerError) || this;
        _this.innerError = innerError;
        return _this;
    }
    return APIError;
}(__WEBPACK_IMPORTED_MODULE_0__custom_error__["a" /* CustomError */]);


/***/ }),

/***/ "./src/errors/custom.error.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CustomError; });
// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
var __extends = this && this.__extends || function () {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
    } || function (d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
        }
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
/**
 * Custom error type
 */
var CustomError = /** @class */function (_super) {
    __extends(CustomError, _super);
    function CustomError(name, message, innerError) {
        var _this = _super.call(this, message) || this;
        _this.name = name;
        _this.message = message;
        _this.innerError = innerError;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, _this.constructor);
        } else {
            var error = new Error();
            if (error.stack) {
                var last_part = error.stack.match(/[^\s]+$/);
                _this.stack = _this.name + " at " + last_part;
            }
        }
        return _this;
    }
    return CustomError;
}(Error);


/***/ }),

/***/ "./src/errors/exception.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Exception; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__custom_error__ = __webpack_require__("./src/errors/custom.error.ts");
var __extends = this && this.__extends || function () {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
    } || function (d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
        }
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();

/**
 * Error type to handle general errors.
 */
var Exception = /** @class */function (_super) {
    __extends(Exception, _super);
    /**
     * @constructor
     *
     * @param message: Error message to be propagated.
     * @param innerError: Inner error if any
    */
    function Exception(message, innerError) {
        var _this = _super.call(this, 'Exception', message, innerError) || this;
        _this.innerError = innerError;
        return _this;
    }
    return Exception;
}(__WEBPACK_IMPORTED_MODULE_0__custom_error__["a" /* CustomError */]);


/***/ }),

/***/ "./src/excel/utilities.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ExcelUtilities; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__errors_api_error__ = __webpack_require__("./src/errors/api.error.ts");
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = this && this.__generator || function (thisArg, body) {
    var _ = { label: 0, sent: function sent() {
            if (t[0] & 1) throw t[1];return t[1];
        }, trys: [], ops: [] },
        f,
        y,
        t,
        g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
    }), g;
    function verb(n) {
        return function (v) {
            return step([n, v]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) {
            try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0:case 1:
                        t = op;break;
                    case 4:
                        _.label++;return { value: op[1], done: false };
                    case 5:
                        _.label++;y = op[1];op = [0];continue;
                    case 7:
                        op = _.ops.pop();_.trys.pop();continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;continue;
                        }
                        if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                            _.label = op[1];break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];t = op;break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];_.ops.push(op);break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();continue;
                }
                op = body.call(thisArg, _);
            } catch (e) {
                op = [6, e];y = 0;
            } finally {
                f = t = 0;
            }
        }if (op[0] & 5) throw op[1];return { value: op[0] ? op[1] : void 0, done: true };
    }
};

/**
 * Helper exposing useful Utilities for Excel Add-ins.
 */
var ExcelUtilities = /** @class */function () {
    function ExcelUtilities() {}
    /**
     * Utility to create (or re-create) a worksheet, even if it already exists.
     * @param workbook
     * @param sheetName
     * @param clearOnly If the sheet already exists, keep it as is, and only clear its grid.
     * This results in a faster operation, and avoid a screen-update flash
     * (and the re-setting of the current selection).
     * Note: Clearing the grid does not remove floating objects like charts.
     * @returns the new worksheet
     */
    ExcelUtilities.forceCreateSheet = function (workbook, sheetName, clearOnly) {
        return __awaiter(this, void 0, void 0, function () {
            var sheet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (workbook == null && (typeof workbook === "undefined" ? "undefined" : _typeof(workbook)) !== _typeof(Excel.Workbook)) {
                            throw new __WEBPACK_IMPORTED_MODULE_0__errors_api_error__["a" /* APIError */]('Invalid workbook parameter.');
                        }
                        if (sheetName == null || sheetName.trim() === '') {
                            throw new __WEBPACK_IMPORTED_MODULE_0__errors_api_error__["a" /* APIError */]('Sheet name cannot be blank.');
                        }
                        if (sheetName.length > 31) {
                            throw new __WEBPACK_IMPORTED_MODULE_0__errors_api_error__["a" /* APIError */]('Sheet name cannot be greater than 31 characters.');
                        }
                        if (!clearOnly) return [3 /*break*/, 2];
                        return [4 /*yield*/, createOrClear(workbook.context, workbook, sheetName)];
                    case 1:
                        sheet = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        return [4 /*yield*/, recreateFromScratch(workbook.context, workbook, sheetName)];
                    case 3:
                        sheet = _a.sent();
                        _a.label = 4;
                    case 4:
                        // To work around an issue with Office Online (tracked by the API team), it is
                        // currently necessary to do a `context.sync()` before any call to `sheet.activate()`.
                        // So to be safe, in case the caller of this helper method decides to immediately
                        // turn around and call `sheet.activate()`, call `sync` before returning the sheet.
                        return [4 /*yield*/, workbook.context.sync()];
                    case 5:
                        // To work around an issue with Office Online (tracked by the API team), it is
                        // currently necessary to do a `context.sync()` before any call to `sheet.activate()`.
                        // So to be safe, in case the caller of this helper method decides to immediately
                        // turn around and call `sheet.activate()`, call `sync` before returning the sheet.
                        _a.sent();
                        return [2 /*return*/, sheet];
                }
            });
        });
    };
    return ExcelUtilities;
}();

/**
 * Helpers
 */
function createOrClear(context, workbook, sheetName) {
    return __awaiter(this, void 0, void 0, function () {
        var existingSheet, oldSheet, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!Office.context.requirements.isSetSupported('ExcelApi', 1.4)) return [3 /*break*/, 2];
                    existingSheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
                    return [4 /*yield*/, context.sync()];
                case 1:
                    _a.sent();
                    if (existingSheet.isNullObject) {
                        return [2 /*return*/, context.workbook.worksheets.add(sheetName)];
                    } else {
                        existingSheet.getRange().clear();
                        return [2 /*return*/, existingSheet];
                    }
                    return [3 /*break*/, 7];
                case 2:
                    // Flush anything already in the queue, so as to scope the error handling logic below.
                    return [4 /*yield*/, context.sync()];
                case 3:
                    // Flush anything already in the queue, so as to scope the error handling logic below.
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6,, 7]);
                    oldSheet = workbook.worksheets.getItem(sheetName);
                    oldSheet.getRange().clear();
                    return [4 /*yield*/, context.sync()];
                case 5:
                    _a.sent();
                    return [2 /*return*/, oldSheet];
                case 6:
                    error_1 = _a.sent();
                    if (error_1 instanceof OfficeExtension.Error && error_1.code === Excel.ErrorCodes.itemNotFound) {
                        // This is an expected case where the sheet didn't exist. Create it now.
                        return [2 /*return*/, workbook.worksheets.add(sheetName)];
                    } else {
                        throw new __WEBPACK_IMPORTED_MODULE_0__errors_api_error__["a" /* APIError */]('Unexpected error while trying to delete sheet.', error_1);
                    }
                    return [3 /*break*/, 7];
                case 7:
                    return [2 /*return*/];
            }
        });
    });
}
function recreateFromScratch(context, workbook, sheetName) {
    return __awaiter(this, void 0, void 0, function () {
        var newSheet, oldSheet, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newSheet = workbook.worksheets.add();
                    if (!Office.context.requirements.isSetSupported('ExcelApi', 1.4)) return [3 /*break*/, 1];
                    context.workbook.worksheets.getItemOrNullObject(sheetName).delete();
                    return [3 /*break*/, 6];
                case 1:
                    // Flush anything already in the queue, so as to scope the error handling logic below.
                    return [4 /*yield*/, context.sync()];
                case 2:
                    // Flush anything already in the queue, so as to scope the error handling logic below.
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5,, 6]);
                    oldSheet = workbook.worksheets.getItem(sheetName);
                    oldSheet.delete();
                    return [4 /*yield*/, context.sync()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    if (error_2 instanceof OfficeExtension.Error && error_2.code === Excel.ErrorCodes.itemNotFound) {
                        // This is an expected case where the sheet didn't exist. Hence no-op.
                    } else {
                        throw new __WEBPACK_IMPORTED_MODULE_0__errors_api_error__["a" /* APIError */]('Unexpected error while trying to delete sheet.', error_2);
                    }
                    return [3 /*break*/, 6];
                case 6:
                    newSheet.name = sheetName;
                    return [2 /*return*/, newSheet];
            }
        });
    });
}

/***/ }),

/***/ "./src/helpers/dialog.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return DialogError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Dialog; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utilities__ = __webpack_require__("./src/helpers/utilities.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__errors_custom_error__ = __webpack_require__("./src/errors/custom.error.ts");
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
var __extends = this && this.__extends || function () {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
    } || function (d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
        }
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();


/**
 * Custom error type to handle API specific errors.
 */
var DialogError = /** @class */function (_super) {
    __extends(DialogError, _super);
    /**
     * @constructor
     *
     * @param message Error message to be propagated.
     * @param state OAuth state if available.
    */
    function DialogError(message, innerError) {
        var _this = _super.call(this, 'DialogError', message, innerError) || this;
        _this.innerError = innerError;
        return _this;
    }
    return DialogError;
}(__WEBPACK_IMPORTED_MODULE_1__errors_custom_error__["a" /* CustomError */]);

var Dialog = /** @class */function () {
    /**
     * @constructor
     *
     * @param url Url to be opened in the dialog.
     * @param width Width of the dialog.
     * @param height Height of the dialog.
    */
    function Dialog(url, width, height, useTeamsDialog) {
        if (url === void 0) {
            url = location.origin;
        }
        if (width === void 0) {
            width = 1024;
        }
        if (height === void 0) {
            height = 768;
        }
        if (useTeamsDialog === void 0) {
            useTeamsDialog = false;
        }
        this.url = url;
        this.useTeamsDialog = useTeamsDialog;
        this._windowFeatures = ',menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no';
        if (!/^https/.test(url)) {
            throw new DialogError('URL has to be loaded over HTTPS.');
        }
        this.size = this._optimizeSize(width, height);
    }
    Object.defineProperty(Dialog.prototype, "result", {
        get: function get() {
            if (this._result == null) {
                if (this.useTeamsDialog) {
                    this._result = this._teamsDialog();
                } else if (__WEBPACK_IMPORTED_MODULE_0__utilities__["c" /* Utilities */].isAddin) {
                    this._result = this._addinDialog();
                } else {
                    this._result = this._webDialog();
                }
            }
            return this._result;
        },
        enumerable: true,
        configurable: true
    });
    Dialog.prototype._addinDialog = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            Office.context.ui.displayDialogAsync(_this.url, { width: _this.size.width$, height: _this.size.height$ }, function (result) {
                if (result.status === Office.AsyncResultStatus.Failed) {
                    reject(new DialogError(result.error.message, result.error));
                } else {
                    var dialog_1 = result.value;
                    dialog_1.addEventHandler(Office.EventType.DialogMessageReceived, function (args) {
                        var result = _this._safeParse(args.message);
                        resolve(result);
                        dialog_1.close();
                    });
                    dialog_1.addEventHandler(Office.EventType.DialogEventReceived, function (args) {
                        reject(new DialogError(args.message, args.error));
                        dialog_1.close();
                    });
                }
            });
        });
    };
    Dialog.prototype._teamsDialog = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            microsoftTeams.initialize();
            microsoftTeams.authentication.authenticate({
                url: _this.url,
                width: _this.size.width,
                height: _this.size.height,
                failureCallback: function failureCallback(exception) {
                    return reject(new DialogError('Error while launching dialog', exception));
                },
                successCallback: function successCallback(message) {
                    return resolve(_this._safeParse(message));
                }
            });
        });
    };
    Dialog.prototype._webDialog = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var options = 'width=' + _this.size.width + ',height=' + _this.size.height + _this._windowFeatures;
                window.open(_this.url, _this.url, options);
                if (__WEBPACK_IMPORTED_MODULE_0__utilities__["c" /* Utilities */].isIEOrEdge) {
                    _this._pollLocalStorageForToken(resolve, reject);
                } else {
                    var handler_1 = function handler_1(event) {
                        if (event.origin === location.origin) {
                            window.removeEventListener('message', handler_1, false);
                            resolve(_this._safeParse(event.data));
                        }
                    };
                    window.addEventListener('message', handler_1);
                }
            } catch (exception) {
                return reject(new DialogError('Unexpected error occured while creating popup', exception));
            }
        });
    };
    Dialog.prototype._pollLocalStorageForToken = function (resolve, reject) {
        var _this = this;
        localStorage.removeItem(Dialog.key);
        var POLL_INTERVAL = 400;
        var interval = setInterval(function () {
            try {
                var data = localStorage.getItem(Dialog.key);
                if (!(data == null)) {
                    clearInterval(interval);
                    localStorage.removeItem(Dialog.key);
                    return resolve(_this._safeParse(data));
                }
            } catch (exception) {
                clearInterval(interval);
                localStorage.removeItem(Dialog.key);
                return reject(new DialogError('Unexpected error occured in the dialog', exception));
            }
        }, POLL_INTERVAL);
    };
    /**
     * Close any open dialog by providing an optional message.
     * If more than one dialogs are attempted to be opened
     * an expcetion will be created.
     */
    Dialog.close = function (message, useTeamsDialog) {
        if (useTeamsDialog === void 0) {
            useTeamsDialog = false;
        }
        var parse = false;
        var value = message;
        if (typeof message === 'function') {
            throw new DialogError('Invalid message. Cannot pass functions as arguments');
        } else if (!(value == null) && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
            parse = true;
            value = JSON.stringify(value);
        }
        try {
            if (useTeamsDialog) {
                microsoftTeams.initialize();
                microsoftTeams.authentication.notifySuccess(JSON.stringify({ parse: parse, value: value }));
            } else if (__WEBPACK_IMPORTED_MODULE_0__utilities__["c" /* Utilities */].isAddin) {
                Office.context.ui.messageParent(JSON.stringify({ parse: parse, value: value }));
            } else {
                if (__WEBPACK_IMPORTED_MODULE_0__utilities__["c" /* Utilities */].isIEOrEdge) {
                    localStorage.setItem(Dialog.key, JSON.stringify({ parse: parse, value: value }));
                } else if (window.opener) {
                    window.opener.postMessage(JSON.stringify({ parse: parse, value: value }), location.origin);
                }
                window.close();
            }
        } catch (error) {
            throw new DialogError('Cannot close dialog', error);
        }
    };
    Dialog.prototype._optimizeSize = function (desiredWidth, desiredHeight) {
        var _a = window.screen,
            screenWidth = _a.width,
            screenHeight = _a.height;
        var width = this._maxSize(desiredWidth, screenWidth);
        var height = this._maxSize(desiredHeight, screenHeight);
        var width$ = this._percentage(width, screenWidth);
        var height$ = this._percentage(height, screenHeight);
        return { width$: width$, height$: height$, width: width, height: height };
    };
    Dialog.prototype._maxSize = function (value, max) {
        return value < max - 30 ? value : max - 30;
    };
    Dialog.prototype._percentage = function (value, max) {
        return value * 100 / max;
    };
    Dialog.prototype._safeParse = function (data) {
        try {
            var result = JSON.parse(data);
            if (result.parse === true) {
                return this._safeParse(result.value);
            }
            return result.value;
        } catch (_e) {
            return data;
        }
    };
    Dialog.key = 'VGVtcG9yYXJ5S2V5Rm9yT0pIQXV0aA==';
    return Dialog;
}();


/***/ }),

/***/ "./src/helpers/dictionary.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Dictionary; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_es_isEmpty__ = __webpack_require__("./node_modules/lodash-es/isEmpty.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash_es_isString__ = __webpack_require__("./node_modules/lodash-es/isString.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lodash_es_isNil__ = __webpack_require__("./node_modules/lodash-es/isNil.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_lodash_es_isObject__ = __webpack_require__("./node_modules/lodash-es/isObject.js");



 // Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Helper for creating and querying Dictionaries.
 * A wrapper around ES6 Maps.
 */
var Dictionary = /** @class */function () {
    /**
     * @constructor
     * @param {object} items Initial seed of items.
     */
    function Dictionary(items) {
        if (Object(__WEBPACK_IMPORTED_MODULE_2_lodash_es_isNil__["a" /* default */])(items)) {
            this._items = new Map();
        } else if (items instanceof Set) {
            throw new TypeError("Invalid type of argument: Set");
        } else if (items instanceof Map) {
            this._items = new Map(items);
        } else if (Array.isArray(items)) {
            this._items = new Map(items);
        } else if (Object(__WEBPACK_IMPORTED_MODULE_3_lodash_es_isObject__["a" /* default */])(items)) {
            this._items = new Map();
            for (var _i = 0, _a = Object.keys(items); _i < _a.length; _i++) {
                var key = _a[_i];
                this._items.set(key, items[key]);
            }
        } else {
            throw new TypeError("Invalid type of argument: " + (typeof items === "undefined" ? "undefined" : _typeof(items)));
        }
    }
    /**
     * Gets an item from the dictionary.
     *
     * @param {string} key The key of the item.
     * @return {object} Returns an item if found.
     */
    Dictionary.prototype.get = function (key) {
        return this._items.get(key);
    };
    /**
     * Inserts an item into the dictionary.
     * If an item already exists with the same key, it will be overridden by the new value.
     *
     * @param {string} key The key of the item.
     * @param {object} value The item to be added.
     * @return {object} Returns the added item.
     */
    Dictionary.prototype.set = function (key, value) {
        this._validateKey(key);
        this._items.set(key, value);
        return value;
    };
    /**
     * Removes an item from the dictionary.
     * Will throw if the key doesn't exist.
     *
     * @param {string} key The key of the item.
     * @return {object} Returns the deleted item.
     */
    Dictionary.prototype.delete = function (key) {
        if (!this.has(key)) {
            throw new ReferenceError("Key: " + key + " not found.");
        }
        var value = this._items.get(key);
        this._items.delete(key);
        return value;
    };
    /**
     * Clears the dictionary.
     */
    Dictionary.prototype.clear = function () {
        this._items.clear();
    };
    /**
     * Check if the dictionary contains the given key.
     *
     * @param {string} key The key of the item.
     * @return {boolean} Returns true if the key was found.
     */
    Dictionary.prototype.has = function (key) {
        this._validateKey(key);
        return this._items.has(key);
    };
    /**
     * Lists all the keys in the dictionary.
     *
     * @return {array} Returns all the keys.
     */
    Dictionary.prototype.keys = function () {
        return Array.from(this._items.keys());
    };
    /**
     * Lists all the values in the dictionary.
     *
     * @return {array} Returns all the values.
     */
    Dictionary.prototype.values = function () {
        return Array.from(this._items.values());
    };
    /**
     * Get a shallow copy of the underlying map.
     *
     * @return {object} Returns the shallow copy of the map.
     */
    Dictionary.prototype.clone = function () {
        return new Map(this._items);
    };
    Object.defineProperty(Dictionary.prototype, "count", {
        /**
         * Number of items in the dictionary.
         *
         * @return {number} Returns the number of items in the dictionary.
         */
        get: function get() {
            return this._items.size;
        },
        enumerable: true,
        configurable: true
    });
    Dictionary.prototype._validateKey = function (key) {
        if (!Object(__WEBPACK_IMPORTED_MODULE_1_lodash_es_isString__["a" /* default */])(key) || Object(__WEBPACK_IMPORTED_MODULE_0_lodash_es_isEmpty__["a" /* default */])(key)) {
            throw new TypeError('Key needs to be a string');
        }
    };
    return Dictionary;
}();


/***/ }),

/***/ "./src/helpers/storage.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return StorageType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Storage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_es_isNil__ = __webpack_require__("./node_modules/lodash-es/isNil.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash_es_isString__ = __webpack_require__("./node_modules/lodash-es/isString.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lodash_es_isEmpty__ = __webpack_require__("./node_modules/lodash-es/isEmpty.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_lodash_es_debounce__ = __webpack_require__("./node_modules/lodash-es/debounce.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__ = __webpack_require__("./node_modules/rxjs/Observable.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__errors_exception__ = __webpack_require__("./src/errors/exception.ts");



 /* Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. */



var NOTIFICATION_DEBOUNCE = 300;
var DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
var StorageType;
(function (StorageType) {
    StorageType[StorageType["LocalStorage"] = 0] = "LocalStorage";
    StorageType[StorageType["SessionStorage"] = 1] = "SessionStorage";
    StorageType[StorageType["InMemoryStorage"] = 2] = "InMemoryStorage";
})(StorageType || (StorageType = {}));
/**
 * Helper for creating and querying Local Storage or Session Storage.
 * Uses {@link Dictionary} so all the data is encapsulated in a single
 * storage namespace. Writes update the actual storage.
 */
var Storage = /** @class */function () {
    /**
     * @constructor
     * @param {string} container Container name to be created in the LocalStorage.
     * @param {StorageType} type[optional] Storage Type to be used, defaults to Local Storage.
     */
    function Storage(container, _type) {
        if (_type === void 0) {
            _type = StorageType.LocalStorage;
        }
        this.container = container;
        this._type = _type;
        this._observable = null;
        this._containerRegex = null;
        this._validateKey(container);
        this._containerRegex = new RegExp("^@" + this.container + "/");
        this.switchStorage(this._type);
    }
    /**
     * Switch the storage type.
     * Switches the storage type and then reloads the in-memory collection.
     *
     * @type {StorageType} type The desired storage to be used.
     */
    Storage.prototype.switchStorage = function (type) {
        switch (type) {
            case StorageType.LocalStorage:
                this._storage = window.localStorage;
                break;
            case StorageType.SessionStorage:
                this._storage = window.sessionStorage;
                break;
            case StorageType.InMemoryStorage:
                this._storage = new InMemoryStorage();
                break;
        }
        if (Object(__WEBPACK_IMPORTED_MODULE_0_lodash_es_isNil__["a" /* default */])(this._storage)) {
            throw new __WEBPACK_IMPORTED_MODULE_5__errors_exception__["a" /* Exception */]('Browser local or session storage is not supported.');
        }
        if (!this._storage.hasOwnProperty(this.container)) {
            this._storage[this.container] = null;
        }
    };
    /**
     * Gets an item from the storage.
     *
     * @param {string} key The key of the item.
     * @return {object} Returns an item if found.
     */
    Storage.prototype.get = function (key) {
        var scopedKey = this._scope(key);
        var item = this._storage.getItem(scopedKey);
        try {
            return JSON.parse(item, this._reviver.bind(this));
        } catch (_error) {
            return item;
        }
    };
    /**
     * Inserts an item into the storage.
     * If an item already exists with the same key,
     * it will be overridden by the new value.
     *
     * @param {string} key The key of the item.
     * @param {object} value The item to be added.
     * @return {object} Returns the added item.
     */
    Storage.prototype.set = function (key, value) {
        this._validateKey(key);
        try {
            var scopedKey = this._scope(key);
            var item = JSON.stringify(value);
            this._storage.setItem(scopedKey, item);
            return value;
        } catch (error) {
            throw new __WEBPACK_IMPORTED_MODULE_5__errors_exception__["a" /* Exception */]("Unable to serialize value for: " + key + " ", error);
        }
    };
    /**
     * Removes an item from the storage.
     * Will throw if the key doesn't exist.
     *
     * @param {string} key The key of the item.
     * @return {object} Returns the deleted item.
     */
    Storage.prototype.delete = function (key) {
        try {
            var value = this.get(key);
            if (value === undefined) {
                throw new ReferenceError("Key: " + key + " not found.");
            }
            var scopedKey = this._scope(key);
            this._storage.removeItem(scopedKey);
            return value;
        } catch (error) {
            throw new __WEBPACK_IMPORTED_MODULE_5__errors_exception__["a" /* Exception */]("Unable to delete '" + key + "' from storage", error);
        }
    };
    /**
     * Clear the storage.
     */
    Storage.prototype.clear = function () {
        this._storage.removeItem(this.container);
    };
    /**
     * Check if the storage contains the given key.
     *
     * @param {string} key The key of the item.
     * @return {boolean} Returns true if the key was found.
     */
    Storage.prototype.has = function (key) {
        this._validateKey(key);
        return this.get(key) !== undefined;
    };
    /**
     * Lists all the keys in the storage.
     *
     * @return {array} Returns all the keys.
     */
    Storage.prototype.keys = function () {
        var _this = this;
        try {
            return Object.keys(this._storage).filter(function (key) {
                return _this._containerRegex.test(key);
            });
        } catch (error) {
            throw new __WEBPACK_IMPORTED_MODULE_5__errors_exception__["a" /* Exception */]("Unable to get keys from storage", error);
        }
    };
    /**
     * Lists all the values in the storage.
     *
     * @return {array} Returns all the values.
     */
    Storage.prototype.values = function () {
        var _this = this;
        try {
            return this.keys().map(function (key) {
                return _this.get(key);
            });
        } catch (error) {
            throw new __WEBPACK_IMPORTED_MODULE_5__errors_exception__["a" /* Exception */]("Unable to get values from storage", error);
        }
    };
    Object.defineProperty(Storage.prototype, "count", {
        /**
         * Number of items in the store.
         *
         * @return {number} Returns the number of items in the dictionary.
         */
        get: function get() {
            try {
                return this.keys().length;
            } catch (error) {
                throw new __WEBPACK_IMPORTED_MODULE_5__errors_exception__["a" /* Exception */]("Unable to get size of localStorage", error);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clear all storages.
     * Completely clears both the localStorage and sessionStorage.
     */
    Storage.clearAll = function () {
        window.localStorage.clear();
        window.sessionStorage.clear();
    };
    /**
     * Returns an observable that triggers everytime there's a Storage Event
     * or if the collection is modified in a different tab.
     */
    Storage.prototype.notify = function (next, error, complete) {
        var _this = this;
        if (!(this._observable == null)) {
            return this._observable.subscribe(next, error, complete);
        }
        this._observable = new __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__["Observable"](function (observer) {
            // Debounced listener to storage events
            var debouncedUpdate = Object(__WEBPACK_IMPORTED_MODULE_3_lodash_es_debounce__["a" /* default */])(function (event) {
                try {
                    // If the change is on the current container
                    if (_this._containerRegex.test(event.key)) {
                        // Notify the listener of the change
                        observer.next(event.key);
                    }
                } catch (e) {
                    observer.error(e);
                }
            }, NOTIFICATION_DEBOUNCE);
            window.addEventListener('storage', debouncedUpdate, false);
            // Teardown
            return function () {
                window.removeEventListener('storage', debouncedUpdate, false);
                _this._observable = null;
            };
        });
        return this._observable.subscribe(next, error, complete);
    };
    Storage.prototype._validateKey = function (key) {
        if (!Object(__WEBPACK_IMPORTED_MODULE_1_lodash_es_isString__["a" /* default */])(key) || Object(__WEBPACK_IMPORTED_MODULE_2_lodash_es_isEmpty__["a" /* default */])(key)) {
            throw new TypeError('Key needs to be a string');
        }
    };
    /**
     * Determine if the value was a Date type and if so return a Date object instead.
     * https://blog.mariusschulz.com/2016/04/28/deserializing-json-strings-as-javascript-date-objects
     */
    Storage.prototype._reviver = function (_key, value) {
        if (Object(__WEBPACK_IMPORTED_MODULE_1_lodash_es_isString__["a" /* default */])(value) && DATE_REGEX.test(value)) {
            return new Date(value);
        }
        return value;
    };
    /**
     * Scope the key to the container as @<container>/<key> so as to easily identify
     * the item in localStorage and reduce collisions
     * @param key key to be scoped
     */
    Storage.prototype._scope = function (key) {
        if (Object(__WEBPACK_IMPORTED_MODULE_2_lodash_es_isEmpty__["a" /* default */])(this.container)) {
            return key;
        }
        return "@" + this.container + "/" + key;
    };
    return Storage;
}();

/**
 * Creating a mock for folks who don't want to use localStorage.
 * This will still allow them to use the APIs.
*/
var InMemoryStorage = /** @class */function () {
    function InMemoryStorage() {
        console.warn("Using non persistant storage. Data will be lost when browser is refreshed/closed");
        this._map = new Map();
    }
    Object.defineProperty(InMemoryStorage.prototype, "length", {
        get: function get() {
            return this._map.size;
        },
        enumerable: true,
        configurable: true
    });
    InMemoryStorage.prototype.clear = function () {
        this._map.clear();
    };
    InMemoryStorage.prototype.getItem = function (key) {
        return this._map.get(key);
    };
    InMemoryStorage.prototype.removeItem = function (key) {
        return this._map.delete(key);
    };
    InMemoryStorage.prototype.setItem = function (key, data) {
        this._map.set(key, data);
    };
    InMemoryStorage.prototype.key = function (index) {
        var result = undefined;
        var ctr = 0;
        this._map.forEach(function (_val, key) {
            if (++ctr === index) {
                result = key;
            }
        });
        return result;
    };
    return InMemoryStorage;
}();

/***/ }),

/***/ "./src/helpers/utilities.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HostType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return PlatformType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return Utilities; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__errors_custom_error__ = __webpack_require__("./src/errors/custom.error.ts");
/* Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. */

/**
 * Constant strings for the host types
 */
var HostType = {
    WEB: 'WEB',
    ACCESS: 'ACCESS',
    EXCEL: 'EXCEL',
    ONENOTE: 'ONENOTE',
    OUTLOOK: 'OUTLOOK',
    POWERPOINT: 'POWERPOINT',
    PROJECT: 'PROJECT',
    WORD: 'WORD'
};
/**
 * Constant strings for the host platforms
 */
var PlatformType = {
    IOS: 'IOS',
    MAC: 'MAC',
    OFFICE_ONLINE: 'OFFICE_ONLINE',
    PC: 'PC'
};
/*
* Retrieves host info using a workaround that utilizes the internals of the
* Office.js library. Such workarounds should be avoided, as they can lead to
* a break in behavior, if the internals are ever changed. In this case, however,
* Office.js will soon be delivering a new API to provide the host and platform
* information.
*/
function getHostInfo() {
    // A forthcoming API (partially rolled-out) will expose the host and platform info natively
    // when queried from within an add-in.
    // If the platform already exposes that info, then just return it
    // (but only after massaging it to fit the return types expected by this function)
    var context = window.Office && window.Office.context || useHostInfoFallbackLogic();
    return {
        host: convertHostValue(context.host),
        platform: convertPlatformValue(context.platform)
    };
}
function useHostInfoFallbackLogic() {
    try {
        if (window.sessionStorage == null) {
            throw new Error("Session Storage isn't supported");
        }
        var hostInfoValue = window.sessionStorage['hostInfoValue'];
        var _a = hostInfoValue.split('$'),
            hostRaw = _a[0],
            platformRaw = _a[1],
            extras = _a[2];
        // Older hosts used "|", so check for that as well:
        if (extras == null) {
            _b = hostInfoValue.split('|'), hostRaw = _b[0], platformRaw = _b[1];
        }
        var host = hostRaw.toUpperCase() || 'WEB';
        var platform = null;
        if (Utilities.host !== HostType.WEB) {
            var platforms = {
                'IOS': PlatformType.IOS,
                'MAC': PlatformType.MAC,
                'WEB': PlatformType.OFFICE_ONLINE,
                'WIN32': PlatformType.PC
            };
            platform = platforms[platformRaw.toUpperCase()] || null;
        }
        return { host: host, platform: platform };
    } catch (error) {
        return { host: 'WEB', platform: null };
    }
    var _b;
}
/** Convert the Office.context.host value to one of the Office JS Helpers constants. */
function convertHostValue(host) {
    var officeJsToHelperEnumMapping = {
        'Word': HostType.WORD,
        'Excel': HostType.EXCEL,
        'PowerPoint': HostType.POWERPOINT,
        'Outlook': HostType.OUTLOOK,
        'OneNote': HostType.ONENOTE,
        'Project': HostType.PROJECT,
        'Access': HostType.ACCESS
    };
    return officeJsToHelperEnumMapping[host] || host;
}
/** Convert the Office.context.platform value to one of the Office JS Helpers constants. */
function convertPlatformValue(platform) {
    var officeJsToHelperEnumMapping = {
        'PC': PlatformType.PC,
        'OfficeOnline': PlatformType.OFFICE_ONLINE,
        'Mac': PlatformType.MAC,
        'iOS': PlatformType.IOS
    };
    return officeJsToHelperEnumMapping[platform] || platform;
}
/**
 * Helper exposing useful Utilities for Office-Add-ins.
 */
var Utilities = /** @class */function () {
    function Utilities() {}
    /**
     * A promise based helper for Office initialize.
     * If Office.js was found, the 'initialize' event is waited for and
     * the promise is resolved with the right reason.
     *
     * Else the application starts as a web application.
     */
    Utilities.initialize = function () {
        return new Promise(function (resolve, reject) {
            try {
                Office.initialize = function (reason) {
                    return resolve(reason);
                };
            } catch (exception) {
                if (window['Office']) {
                    reject(exception);
                } else {
                    resolve('Office was not found. Running as web application.');
                }
            }
        });
    };
    Object.defineProperty(Utilities, "host", {
        /*
         * Returns the current host which is either the name of the application where the
         * Office Add-in is running ("EXCEL", "WORD", etc.) or simply "WEB" for all other platforms.
         * The property is always returned in ALL_CAPS.
         * Note that this property is guaranteed to return the correct value ONLY after Office has
         * initialized (i.e., inside, or sequentially after, an Office.initialize = function() { ... }; statement).
         *
         * This code currently uses a workaround that relies on the internals of Office.js.
         * A more robust approach is forthcoming within the official  Office.js library.
         * Once the new approach is released, this implementation will switch to using it
         * instead of the current workaround.
         */
        get: function get() {
            return getHostInfo().host;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Utilities, "platform", {
        /*
        * Returns the host application's platform ("IOS", "MAC", "OFFICE_ONLINE", or "PC").
        * This is only valid for Office Add-ins, and hence returns null if the HostType is WEB.
        * The platform is in ALL-CAPS.
        * Note that this property is guaranteed to return the correct value ONLY after Office has
        * initialized (i.e., inside, or sequentially after, an Office.initialize = function() { ... }; statement).
        *
        * This code currently uses a workaround that relies on the internals of Office.js.
        * A more robust approach is forthcoming within the official  Office.js library.
        * Once the new approach is released, this implementation will switch to using it
        * instead of the current workaround.
        */
        get: function get() {
            return getHostInfo().platform;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Utilities, "isAddin", {
        /**
         * Utility to check if the code is running inside of an add-in.
         */
        get: function get() {
            return Utilities.host !== HostType.WEB;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Utilities, "isIEOrEdge", {
        /**
         * Utility to check if the browser is IE11 or Edge.
         */
        get: function get() {
            return (/Edge\/|Trident\//gi.test(window.navigator.userAgent)
            );
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Utility to generate crypto safe random numbers
     */
    Utilities.generateCryptoSafeRandom = function () {
        var random = new Uint32Array(1);
        if ('msCrypto' in window) {
            window.msCrypto.getRandomValues(random);
        } else if ('crypto' in window) {
            window.crypto.getRandomValues(random);
        } else {
            throw new Error('The platform doesn\'t support generation of cryptographically safe randoms. Please disable the state flag and try again.');
        }
        return random[0];
    };
    /**
     * Utility to print prettified errors.
     * If multiple parameters are sent then it just logs them instead.
     */
    Utilities.log = function (exception, extras) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (!(extras == null)) {
            return console.log.apply(console, [exception, extras].concat(args));
        }
        if (exception == null) {
            console.error(exception);
        } else if (typeof exception === 'string') {
            console.error(exception);
        } else {
            console.group(exception.name + ": " + exception.message);
            {
                var innerException = exception;
                if (exception instanceof __WEBPACK_IMPORTED_MODULE_0__errors_custom_error__["a" /* CustomError */]) {
                    innerException = exception.innerError;
                }
                if (window.OfficeExtension && innerException instanceof OfficeExtension.Error) {
                    console.groupCollapsed('Debug Info');
                    console.error(innerException.debugInfo);
                    console.groupEnd();
                }
                {
                    console.groupCollapsed('Stack Trace');
                    console.error(exception.stack);
                    console.groupEnd();
                }
                {
                    console.groupCollapsed('Inner Error');
                    console.error(innerException);
                    console.groupEnd();
                }
            }
            console.groupEnd();
        }
    };
    return Utilities;
}();


/***/ }),

/***/ "./src/index.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__errors_custom_error__ = __webpack_require__("./src/errors/custom.error.ts");
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "CustomError", function() { return __WEBPACK_IMPORTED_MODULE_0__errors_custom_error__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__helpers_dialog__ = __webpack_require__("./src/helpers/dialog.ts");
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "DialogError", function() { return __WEBPACK_IMPORTED_MODULE_1__helpers_dialog__["b"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Dialog", function() { return __WEBPACK_IMPORTED_MODULE_1__helpers_dialog__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__helpers_utilities__ = __webpack_require__("./src/helpers/utilities.ts");
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "HostType", function() { return __WEBPACK_IMPORTED_MODULE_2__helpers_utilities__["a"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "PlatformType", function() { return __WEBPACK_IMPORTED_MODULE_2__helpers_utilities__["b"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Utilities", function() { return __WEBPACK_IMPORTED_MODULE_2__helpers_utilities__["c"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__helpers_dictionary__ = __webpack_require__("./src/helpers/dictionary.ts");
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Dictionary", function() { return __WEBPACK_IMPORTED_MODULE_3__helpers_dictionary__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__helpers_storage__ = __webpack_require__("./src/helpers/storage.ts");
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "StorageType", function() { return __WEBPACK_IMPORTED_MODULE_4__helpers_storage__["b"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Storage", function() { return __WEBPACK_IMPORTED_MODULE_4__helpers_storage__["a"]; });
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__authentication_token_manager__ = __webpack_require__("./src/authentication/token.manager.ts");
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "TokenStorage", function() { return __WEBPACK_IMPORTED_MODULE_5__authentication_token_manager__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__authentication_endpoint_manager__ = __webpack_require__("./src/authentication/endpoint.manager.ts");
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "DefaultEndpoints", function() { return __WEBPACK_IMPORTED_MODULE_6__authentication_endpoint_manager__["a"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "EndpointStorage", function() { return __WEBPACK_IMPORTED_MODULE_6__authentication_endpoint_manager__["b"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__authentication_authenticator__ = __webpack_require__("./src/authentication/authenticator.ts");
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "AuthError", function() { return __WEBPACK_IMPORTED_MODULE_7__authentication_authenticator__["a"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Authenticator", function() { return __WEBPACK_IMPORTED_MODULE_7__authentication_authenticator__["b"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__excel_utilities__ = __webpack_require__("./src/excel/utilities.ts");
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "ExcelUtilities", function() { return __WEBPACK_IMPORTED_MODULE_8__excel_utilities__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__ui_ui__ = __webpack_require__("./src/ui/ui.ts");
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "UI", function() { return __WEBPACK_IMPORTED_MODULE_9__ui_ui__["a"]; });
/* Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. */












/***/ }),

/***/ "./src/ui/message-banner.html":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ("<div class=\"office-js-helpers-notification ms-font-m ms-MessageBar @@CLASS\">\n  <style>\n    .office-js-helpers-notification {\n      position: fixed;\n      z-index: 2147483647;\n      top: 0;\n      left: 0;\n      right: 0;\n      width: 100%;\n      padding: 0 0 10px 0;\n    }\n\n    .office-js-helpers-notification > div > div {\n      padding: 10px 15px;\n      box-sizing: border-box;\n    }\n\n    .office-js-helpers-notification pre {\n      white-space: pre-wrap;\n      word-wrap: break-word;\n      margin: 0px;\n      font-size: smaller;\n    }\n\n    .office-js-helpers-notification > button {\n      height: 52px;\n      width: 40px;\n      cursor: pointer;\n      float: right;\n      background: transparent;\n      border: 0;\n      margin-left: 10px;\n      margin-right: '@@PADDING'\n    }\n  </style>\n  <button>\n      <i class=\"ms-Icon ms-Icon--Clear\"></i>\n  </button>\n</div>");

/***/ }),

/***/ "./src/ui/ui.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UI; });
/* unused harmony export _parseNotificationParams */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__helpers_utilities__ = __webpack_require__("./src/helpers/utilities.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_stringify__ = __webpack_require__("./src/util/stringify.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__message_banner_html__ = __webpack_require__("./src/ui/message-banner.html");
/* Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. */



var DEFAULT_WHITESPACE = 2;
var UI = /** @class */function () {
    function UI() {}
    UI.notify = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var params = _parseNotificationParams(args);
        if (params == null) {
            console.error(new Error('Invalid params. Cannot create a notification'));
            return null;
        }
        var messageBarClasses = {
            'success': 'ms-MessageBar--success',
            'error': 'ms-MessageBar--error',
            'warning': 'ms-MessageBar--warning',
            'severe-warning': 'ms-MessageBar--severeWarning'
        };
        var messageBarTypeClass = messageBarClasses[params.type] || '';
        var paddingForPersonalityMenu = '0';
        if (__WEBPACK_IMPORTED_MODULE_0__helpers_utilities__["c" /* Utilities */].platform === __WEBPACK_IMPORTED_MODULE_0__helpers_utilities__["b" /* PlatformType */].PC) {
            paddingForPersonalityMenu = '20px';
        } else if (__WEBPACK_IMPORTED_MODULE_0__helpers_utilities__["c" /* Utilities */].platform === __WEBPACK_IMPORTED_MODULE_0__helpers_utilities__["b" /* PlatformType */].MAC) {
            paddingForPersonalityMenu = '40px';
        }
        var messageBannerHtml = __WEBPACK_IMPORTED_MODULE_2__message_banner_html__["a" /* default */].replace('@@CLASS', messageBarTypeClass).replace('\'@@PADDING\'', paddingForPersonalityMenu);
        var existingNotifications = document.getElementsByClassName('office-js-helpers-notification');
        while (existingNotifications[0]) {
            existingNotifications[0].parentNode.removeChild(existingNotifications[0]);
        }
        document.body.insertAdjacentHTML('afterbegin', messageBannerHtml);
        var notificationDiv = document.getElementsByClassName('office-js-helpers-notification')[0];
        var messageTextArea = document.createElement('div');
        notificationDiv.insertAdjacentElement('beforeend', messageTextArea);
        if (params.title) {
            var titleDiv = document.createElement('div');
            titleDiv.textContent = params.title;
            titleDiv.classList.add('ms-fontWeight-semibold');
            messageTextArea.insertAdjacentElement('beforeend', titleDiv);
        }
        params.message.split('\n').forEach(function (text) {
            var div = document.createElement('div');
            div.textContent = text;
            messageTextArea.insertAdjacentElement('beforeend', div);
        });
        if (params.details) {
            var labelDiv_1 = document.createElement('div');
            messageTextArea.insertAdjacentElement('beforeend', labelDiv_1);
            var label = document.createElement('a');
            label.setAttribute('href', 'javascript:void(0)');
            label.onclick = function () {
                document.querySelector('.office-js-helpers-notification pre').parentElement.style.display = 'block';
                labelDiv_1.style.display = 'none';
            };
            label.textContent = 'Details';
            labelDiv_1.insertAdjacentElement('beforeend', label);
            var preDiv = document.createElement('div');
            preDiv.style.display = 'none';
            messageTextArea.insertAdjacentElement('beforeend', preDiv);
            var detailsDiv = document.createElement('pre');
            detailsDiv.textContent = params.details;
            preDiv.insertAdjacentElement('beforeend', detailsDiv);
        }
        document.querySelector('.office-js-helpers-notification > button').onclick = function () {
            return notificationDiv.parentNode.removeChild(notificationDiv);
        };
    };
    return UI;
}();

function _parseNotificationParams(params) {
    if (params == null) {
        return null;
    }
    var body = params[0],
        title = params[1],
        type = params[2];
    if (body instanceof Error) {
        var details = '';
        var _a = body,
            innerError = _a.innerError,
            stack = _a.stack;
        if (innerError) {
            var error = JSON.stringify(innerError.debugInfo || innerError, null, DEFAULT_WHITESPACE);
            details += "Inner Error: \n" + error + "\n";
        }
        if (stack) {
            details += "Stack Trace: \n" + body.stack + "\n";
        }
        return {
            message: body.message,
            title: title || body.name,
            type: 'error',
            details: details
        };
    } else {
        return {
            message: Object(__WEBPACK_IMPORTED_MODULE_1__util_stringify__["a" /* default */])(body),
            title: title,
            type: type || 'default',
            details: null
        };
    }
}

/***/ }),

/***/ "./src/util/stringify.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = stringify;
function stringify(value) {
    // JSON.stringify of undefined will return undefined rather than 'undefined'
    if (value === undefined) {
        return 'undefined';
    }
    // Don't JSON.stringify strings, we don't want quotes in the output
    if (typeof value === 'string') {
        return value;
    }
    // Use toString() only if it's useful
    if (typeof value.toString === 'function' && value.toString() !== '[object Object]') {
        return value.toString();
    }
    // Otherwise, JSON stringify the object
    return JSON.stringify(value, null, 2);
}

/***/ })

/******/ });
});
//# sourceMappingURL=office.helpers.js.map