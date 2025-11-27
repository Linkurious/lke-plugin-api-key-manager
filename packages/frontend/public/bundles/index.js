"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // ../../node_modules/component-emitter/index.js
  var require_component_emitter = __commonJS({
    "../../node_modules/component-emitter/index.js"(exports, module) {
      if (typeof module !== "undefined") {
        module.exports = Emitter;
      }
      function Emitter(obj) {
        if (obj)
          return mixin(obj);
      }
      function mixin(obj) {
        for (var key in Emitter.prototype) {
          obj[key] = Emitter.prototype[key];
        }
        return obj;
      }
      Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
        this._callbacks = this._callbacks || {};
        (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
        return this;
      };
      Emitter.prototype.once = function(event, fn) {
        function on() {
          this.off(event, on);
          fn.apply(this, arguments);
        }
        on.fn = fn;
        this.on(event, on);
        return this;
      };
      Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
        this._callbacks = this._callbacks || {};
        if (0 == arguments.length) {
          this._callbacks = {};
          return this;
        }
        var callbacks = this._callbacks["$" + event];
        if (!callbacks)
          return this;
        if (1 == arguments.length) {
          delete this._callbacks["$" + event];
          return this;
        }
        var cb;
        for (var i = 0; i < callbacks.length; i++) {
          cb = callbacks[i];
          if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1);
            break;
          }
        }
        if (callbacks.length === 0) {
          delete this._callbacks["$" + event];
        }
        return this;
      };
      Emitter.prototype.emit = function(event) {
        this._callbacks = this._callbacks || {};
        var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event];
        for (var i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i];
        }
        if (callbacks) {
          callbacks = callbacks.slice(0);
          for (var i = 0, len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
          }
        }
        return this;
      };
      Emitter.prototype.listeners = function(event) {
        this._callbacks = this._callbacks || {};
        return this._callbacks["$" + event] || [];
      };
      Emitter.prototype.hasListeners = function(event) {
        return !!this.listeners(event).length;
      };
    }
  });

  // ../../node_modules/fast-safe-stringify/index.js
  var require_fast_safe_stringify = __commonJS({
    "../../node_modules/fast-safe-stringify/index.js"(exports, module) {
      module.exports = stringify;
      stringify.default = stringify;
      stringify.stable = deterministicStringify;
      stringify.stableStringify = deterministicStringify;
      var LIMIT_REPLACE_NODE = "[...]";
      var CIRCULAR_REPLACE_NODE = "[Circular]";
      var arr = [];
      var replacerStack = [];
      function defaultOptions() {
        return {
          depthLimit: Number.MAX_SAFE_INTEGER,
          edgesLimit: Number.MAX_SAFE_INTEGER
        };
      }
      function stringify(obj, replacer, spacer, options) {
        if (typeof options === "undefined") {
          options = defaultOptions();
        }
        decirc(obj, "", 0, [], void 0, 0, options);
        var res;
        try {
          if (replacerStack.length === 0) {
            res = JSON.stringify(obj, replacer, spacer);
          } else {
            res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
          }
        } catch (_) {
          return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]");
        } finally {
          while (arr.length !== 0) {
            var part = arr.pop();
            if (part.length === 4) {
              Object.defineProperty(part[0], part[1], part[3]);
            } else {
              part[0][part[1]] = part[2];
            }
          }
        }
        return res;
      }
      function setReplace(replace, val, k, parent) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
        if (propertyDescriptor.get !== void 0) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: replace });
            arr.push([parent, k, val, propertyDescriptor]);
          } else {
            replacerStack.push([val, k, replace]);
          }
        } else {
          parent[k] = replace;
          arr.push([parent, k, val]);
        }
      }
      function decirc(val, k, edgeIndex, stack, parent, depth, options) {
        depth += 1;
        var i;
        if (typeof val === "object" && val !== null) {
          for (i = 0; i < stack.length; i++) {
            if (stack[i] === val) {
              setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
              return;
            }
          }
          if (typeof options.depthLimit !== "undefined" && depth > options.depthLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k, parent);
            return;
          }
          if (typeof options.edgesLimit !== "undefined" && edgeIndex + 1 > options.edgesLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k, parent);
            return;
          }
          stack.push(val);
          if (Array.isArray(val)) {
            for (i = 0; i < val.length; i++) {
              decirc(val[i], i, i, stack, val, depth, options);
            }
          } else {
            var keys = Object.keys(val);
            for (i = 0; i < keys.length; i++) {
              var key = keys[i];
              decirc(val[key], key, i, stack, val, depth, options);
            }
          }
          stack.pop();
        }
      }
      function compareFunction(a, b) {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      }
      function deterministicStringify(obj, replacer, spacer, options) {
        if (typeof options === "undefined") {
          options = defaultOptions();
        }
        var tmp = deterministicDecirc(obj, "", 0, [], void 0, 0, options) || obj;
        var res;
        try {
          if (replacerStack.length === 0) {
            res = JSON.stringify(tmp, replacer, spacer);
          } else {
            res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
          }
        } catch (_) {
          return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]");
        } finally {
          while (arr.length !== 0) {
            var part = arr.pop();
            if (part.length === 4) {
              Object.defineProperty(part[0], part[1], part[3]);
            } else {
              part[0][part[1]] = part[2];
            }
          }
        }
        return res;
      }
      function deterministicDecirc(val, k, edgeIndex, stack, parent, depth, options) {
        depth += 1;
        var i;
        if (typeof val === "object" && val !== null) {
          for (i = 0; i < stack.length; i++) {
            if (stack[i] === val) {
              setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
              return;
            }
          }
          try {
            if (typeof val.toJSON === "function") {
              return;
            }
          } catch (_) {
            return;
          }
          if (typeof options.depthLimit !== "undefined" && depth > options.depthLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k, parent);
            return;
          }
          if (typeof options.edgesLimit !== "undefined" && edgeIndex + 1 > options.edgesLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k, parent);
            return;
          }
          stack.push(val);
          if (Array.isArray(val)) {
            for (i = 0; i < val.length; i++) {
              deterministicDecirc(val[i], i, i, stack, val, depth, options);
            }
          } else {
            var tmp = {};
            var keys = Object.keys(val).sort(compareFunction);
            for (i = 0; i < keys.length; i++) {
              var key = keys[i];
              deterministicDecirc(val[key], key, i, stack, val, depth, options);
              tmp[key] = val[key];
            }
            if (typeof parent !== "undefined") {
              arr.push([parent, k, val]);
              parent[k] = tmp;
            } else {
              return tmp;
            }
          }
          stack.pop();
        }
      }
      function replaceGetterValues(replacer) {
        replacer = typeof replacer !== "undefined" ? replacer : function(k, v) {
          return v;
        };
        return function(key, val) {
          if (replacerStack.length > 0) {
            for (var i = 0; i < replacerStack.length; i++) {
              var part = replacerStack[i];
              if (part[1] === key && part[0] === val) {
                val = part[2];
                replacerStack.splice(i, 1);
                break;
              }
            }
          }
          return replacer.call(this, key, val);
        };
      }
    }
  });

  // ../../node_modules/es-errors/type.js
  var require_type = __commonJS({
    "../../node_modules/es-errors/type.js"(exports, module) {
      "use strict";
      module.exports = TypeError;
    }
  });

  // (disabled):../../node_modules/object-inspect/util.inspect
  var require_util = __commonJS({
    "(disabled):../../node_modules/object-inspect/util.inspect"() {
    }
  });

  // ../../node_modules/object-inspect/index.js
  var require_object_inspect = __commonJS({
    "../../node_modules/object-inspect/index.js"(exports, module) {
      var hasMap = typeof Map === "function" && Map.prototype;
      var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
      var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
      var mapForEach = hasMap && Map.prototype.forEach;
      var hasSet = typeof Set === "function" && Set.prototype;
      var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
      var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
      var setForEach = hasSet && Set.prototype.forEach;
      var hasWeakMap = typeof WeakMap === "function" && WeakMap.prototype;
      var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
      var hasWeakSet = typeof WeakSet === "function" && WeakSet.prototype;
      var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
      var hasWeakRef = typeof WeakRef === "function" && WeakRef.prototype;
      var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
      var booleanValueOf = Boolean.prototype.valueOf;
      var objectToString = Object.prototype.toString;
      var functionToString = Function.prototype.toString;
      var $match = String.prototype.match;
      var $slice = String.prototype.slice;
      var $replace = String.prototype.replace;
      var $toUpperCase = String.prototype.toUpperCase;
      var $toLowerCase = String.prototype.toLowerCase;
      var $test = RegExp.prototype.test;
      var $concat = Array.prototype.concat;
      var $join = Array.prototype.join;
      var $arrSlice = Array.prototype.slice;
      var $floor = Math.floor;
      var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
      var gOPS = Object.getOwnPropertySymbols;
      var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
      var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
      var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
      var isEnumerable = Object.prototype.propertyIsEnumerable;
      var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
        return O.__proto__;
      } : null);
      function addNumericSeparator(num, str) {
        if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) {
          return str;
        }
        var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
        if (typeof num === "number") {
          var int = num < 0 ? -$floor(-num) : $floor(num);
          if (int !== num) {
            var intStr = String(int);
            var dec = $slice.call(str, intStr.length + 1);
            return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
          }
        }
        return $replace.call(str, sepRegex, "$&_");
      }
      var utilInspect = require_util();
      var inspectCustom = utilInspect.custom;
      var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
      var quotes = {
        __proto__: null,
        "double": '"',
        single: "'"
      };
      var quoteREs = {
        __proto__: null,
        "double": /(["\\])/g,
        single: /(['\\])/g
      };
      module.exports = function inspect_(obj, options, depth, seen) {
        var opts = options || {};
        if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) {
          throw new TypeError('option "quoteStyle" must be "single" or "double"');
        }
        if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
          throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
        }
        var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
        if (typeof customInspect !== "boolean" && customInspect !== "symbol") {
          throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
        }
        if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
          throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
        }
        if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") {
          throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
        }
        var numericSeparator = opts.numericSeparator;
        if (typeof obj === "undefined") {
          return "undefined";
        }
        if (obj === null) {
          return "null";
        }
        if (typeof obj === "boolean") {
          return obj ? "true" : "false";
        }
        if (typeof obj === "string") {
          return inspectString(obj, opts);
        }
        if (typeof obj === "number") {
          if (obj === 0) {
            return Infinity / obj > 0 ? "0" : "-0";
          }
          var str = String(obj);
          return numericSeparator ? addNumericSeparator(obj, str) : str;
        }
        if (typeof obj === "bigint") {
          var bigIntStr = String(obj) + "n";
          return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
        }
        var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
        if (typeof depth === "undefined") {
          depth = 0;
        }
        if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") {
          return isArray(obj) ? "[Array]" : "[Object]";
        }
        var indent = getIndent(opts, depth);
        if (typeof seen === "undefined") {
          seen = [];
        } else if (indexOf(seen, obj) >= 0) {
          return "[Circular]";
        }
        function inspect(value, from, noIndent) {
          if (from) {
            seen = $arrSlice.call(seen);
            seen.push(from);
          }
          if (noIndent) {
            var newOpts = {
              depth: opts.depth
            };
            if (has(opts, "quoteStyle")) {
              newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
          }
          return inspect_(value, opts, depth + 1, seen);
        }
        if (typeof obj === "function" && !isRegExp(obj)) {
          var name = nameOf(obj);
          var keys = arrObjKeys(obj, inspect);
          return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
        }
        if (isSymbol(obj)) {
          var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
          return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
        }
        if (isElement(obj)) {
          var s = "<" + $toLowerCase.call(String(obj.nodeName));
          var attrs = obj.attributes || [];
          for (var i = 0; i < attrs.length; i++) {
            s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
          }
          s += ">";
          if (obj.childNodes && obj.childNodes.length) {
            s += "...";
          }
          s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
          return s;
        }
        if (isArray(obj)) {
          if (obj.length === 0) {
            return "[]";
          }
          var xs = arrObjKeys(obj, inspect);
          if (indent && !singleLineValues(xs)) {
            return "[" + indentedJoin(xs, indent) + "]";
          }
          return "[ " + $join.call(xs, ", ") + " ]";
        }
        if (isError(obj)) {
          var parts = arrObjKeys(obj, inspect);
          if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) {
            return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect(obj.cause), parts), ", ") + " }";
          }
          if (parts.length === 0) {
            return "[" + String(obj) + "]";
          }
          return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
        }
        if (typeof obj === "object" && customInspect) {
          if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) {
            return utilInspect(obj, { depth: maxDepth - depth });
          } else if (customInspect !== "symbol" && typeof obj.inspect === "function") {
            return obj.inspect();
          }
        }
        if (isMap(obj)) {
          var mapParts = [];
          if (mapForEach) {
            mapForEach.call(obj, function(value, key) {
              mapParts.push(inspect(key, obj, true) + " => " + inspect(value, obj));
            });
          }
          return collectionOf("Map", mapSize.call(obj), mapParts, indent);
        }
        if (isSet(obj)) {
          var setParts = [];
          if (setForEach) {
            setForEach.call(obj, function(value) {
              setParts.push(inspect(value, obj));
            });
          }
          return collectionOf("Set", setSize.call(obj), setParts, indent);
        }
        if (isWeakMap(obj)) {
          return weakCollectionOf("WeakMap");
        }
        if (isWeakSet(obj)) {
          return weakCollectionOf("WeakSet");
        }
        if (isWeakRef(obj)) {
          return weakCollectionOf("WeakRef");
        }
        if (isNumber(obj)) {
          return markBoxed(inspect(Number(obj)));
        }
        if (isBigInt(obj)) {
          return markBoxed(inspect(bigIntValueOf.call(obj)));
        }
        if (isBoolean(obj)) {
          return markBoxed(booleanValueOf.call(obj));
        }
        if (isString(obj)) {
          return markBoxed(inspect(String(obj)));
        }
        if (typeof window !== "undefined" && obj === window) {
          return "{ [object Window] }";
        }
        if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) {
          return "{ [object globalThis] }";
        }
        if (!isDate(obj) && !isRegExp(obj)) {
          var ys = arrObjKeys(obj, inspect);
          var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
          var protoTag = obj instanceof Object ? "" : "null prototype";
          var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
          var constructorTag = isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
          var tag = constructorTag + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
          if (ys.length === 0) {
            return tag + "{}";
          }
          if (indent) {
            return tag + "{" + indentedJoin(ys, indent) + "}";
          }
          return tag + "{ " + $join.call(ys, ", ") + " }";
        }
        return String(obj);
      };
      function wrapQuotes(s, defaultStyle, opts) {
        var style = opts.quoteStyle || defaultStyle;
        var quoteChar = quotes[style];
        return quoteChar + s + quoteChar;
      }
      function quote(s) {
        return $replace.call(String(s), /"/g, "&quot;");
      }
      function canTrustToString(obj) {
        return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
      }
      function isArray(obj) {
        return toStr(obj) === "[object Array]" && canTrustToString(obj);
      }
      function isDate(obj) {
        return toStr(obj) === "[object Date]" && canTrustToString(obj);
      }
      function isRegExp(obj) {
        return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
      }
      function isError(obj) {
        return toStr(obj) === "[object Error]" && canTrustToString(obj);
      }
      function isString(obj) {
        return toStr(obj) === "[object String]" && canTrustToString(obj);
      }
      function isNumber(obj) {
        return toStr(obj) === "[object Number]" && canTrustToString(obj);
      }
      function isBoolean(obj) {
        return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
      }
      function isSymbol(obj) {
        if (hasShammedSymbols) {
          return obj && typeof obj === "object" && obj instanceof Symbol;
        }
        if (typeof obj === "symbol") {
          return true;
        }
        if (!obj || typeof obj !== "object" || !symToString) {
          return false;
        }
        try {
          symToString.call(obj);
          return true;
        } catch (e) {
        }
        return false;
      }
      function isBigInt(obj) {
        if (!obj || typeof obj !== "object" || !bigIntValueOf) {
          return false;
        }
        try {
          bigIntValueOf.call(obj);
          return true;
        } catch (e) {
        }
        return false;
      }
      var hasOwn = Object.prototype.hasOwnProperty || function(key) {
        return key in this;
      };
      function has(obj, key) {
        return hasOwn.call(obj, key);
      }
      function toStr(obj) {
        return objectToString.call(obj);
      }
      function nameOf(f) {
        if (f.name) {
          return f.name;
        }
        var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
        if (m) {
          return m[1];
        }
        return null;
      }
      function indexOf(xs, x) {
        if (xs.indexOf) {
          return xs.indexOf(x);
        }
        for (var i = 0, l = xs.length; i < l; i++) {
          if (xs[i] === x) {
            return i;
          }
        }
        return -1;
      }
      function isMap(x) {
        if (!mapSize || !x || typeof x !== "object") {
          return false;
        }
        try {
          mapSize.call(x);
          try {
            setSize.call(x);
          } catch (s) {
            return true;
          }
          return x instanceof Map;
        } catch (e) {
        }
        return false;
      }
      function isWeakMap(x) {
        if (!weakMapHas || !x || typeof x !== "object") {
          return false;
        }
        try {
          weakMapHas.call(x, weakMapHas);
          try {
            weakSetHas.call(x, weakSetHas);
          } catch (s) {
            return true;
          }
          return x instanceof WeakMap;
        } catch (e) {
        }
        return false;
      }
      function isWeakRef(x) {
        if (!weakRefDeref || !x || typeof x !== "object") {
          return false;
        }
        try {
          weakRefDeref.call(x);
          return true;
        } catch (e) {
        }
        return false;
      }
      function isSet(x) {
        if (!setSize || !x || typeof x !== "object") {
          return false;
        }
        try {
          setSize.call(x);
          try {
            mapSize.call(x);
          } catch (m) {
            return true;
          }
          return x instanceof Set;
        } catch (e) {
        }
        return false;
      }
      function isWeakSet(x) {
        if (!weakSetHas || !x || typeof x !== "object") {
          return false;
        }
        try {
          weakSetHas.call(x, weakSetHas);
          try {
            weakMapHas.call(x, weakMapHas);
          } catch (s) {
            return true;
          }
          return x instanceof WeakSet;
        } catch (e) {
        }
        return false;
      }
      function isElement(x) {
        if (!x || typeof x !== "object") {
          return false;
        }
        if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
          return true;
        }
        return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
      }
      function inspectString(str, opts) {
        if (str.length > opts.maxStringLength) {
          var remaining = str.length - opts.maxStringLength;
          var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
          return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
        }
        var quoteRE = quoteREs[opts.quoteStyle || "single"];
        quoteRE.lastIndex = 0;
        var s = $replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte);
        return wrapQuotes(s, "single", opts);
      }
      function lowbyte(c) {
        var n = c.charCodeAt(0);
        var x = {
          8: "b",
          9: "t",
          10: "n",
          12: "f",
          13: "r"
        }[n];
        if (x) {
          return "\\" + x;
        }
        return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
      }
      function markBoxed(str) {
        return "Object(" + str + ")";
      }
      function weakCollectionOf(type) {
        return type + " { ? }";
      }
      function collectionOf(type, size, entries, indent) {
        var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
        return type + " (" + size + ") {" + joinedEntries + "}";
      }
      function singleLineValues(xs) {
        for (var i = 0; i < xs.length; i++) {
          if (indexOf(xs[i], "\n") >= 0) {
            return false;
          }
        }
        return true;
      }
      function getIndent(opts, depth) {
        var baseIndent;
        if (opts.indent === "	") {
          baseIndent = "	";
        } else if (typeof opts.indent === "number" && opts.indent > 0) {
          baseIndent = $join.call(Array(opts.indent + 1), " ");
        } else {
          return null;
        }
        return {
          base: baseIndent,
          prev: $join.call(Array(depth + 1), baseIndent)
        };
      }
      function indentedJoin(xs, indent) {
        if (xs.length === 0) {
          return "";
        }
        var lineJoiner = "\n" + indent.prev + indent.base;
        return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
      }
      function arrObjKeys(obj, inspect) {
        var isArr = isArray(obj);
        var xs = [];
        if (isArr) {
          xs.length = obj.length;
          for (var i = 0; i < obj.length; i++) {
            xs[i] = has(obj, i) ? inspect(obj[i], obj) : "";
          }
        }
        var syms = typeof gOPS === "function" ? gOPS(obj) : [];
        var symMap;
        if (hasShammedSymbols) {
          symMap = {};
          for (var k = 0; k < syms.length; k++) {
            symMap["$" + syms[k]] = syms[k];
          }
        }
        for (var key in obj) {
          if (!has(obj, key)) {
            continue;
          }
          if (isArr && String(Number(key)) === key && key < obj.length) {
            continue;
          }
          if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) {
            continue;
          } else if ($test.call(/[^\w$]/, key)) {
            xs.push(inspect(key, obj) + ": " + inspect(obj[key], obj));
          } else {
            xs.push(key + ": " + inspect(obj[key], obj));
          }
        }
        if (typeof gOPS === "function") {
          for (var j = 0; j < syms.length; j++) {
            if (isEnumerable.call(obj, syms[j])) {
              xs.push("[" + inspect(syms[j]) + "]: " + inspect(obj[syms[j]], obj));
            }
          }
        }
        return xs;
      }
    }
  });

  // ../../node_modules/side-channel-list/index.js
  var require_side_channel_list = __commonJS({
    "../../node_modules/side-channel-list/index.js"(exports, module) {
      "use strict";
      var inspect = require_object_inspect();
      var $TypeError = require_type();
      var listGetNode = function(list, key, isDelete) {
        var prev = list;
        var curr;
        for (; (curr = prev.next) != null; prev = curr) {
          if (curr.key === key) {
            prev.next = curr.next;
            if (!isDelete) {
              curr.next = /** @type {NonNullable<typeof list.next>} */
              list.next;
              list.next = curr;
            }
            return curr;
          }
        }
      };
      var listGet = function(objects, key) {
        if (!objects) {
          return void 0;
        }
        var node = listGetNode(objects, key);
        return node && node.value;
      };
      var listSet = function(objects, key, value) {
        var node = listGetNode(objects, key);
        if (node) {
          node.value = value;
        } else {
          objects.next = /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */
          {
            // eslint-disable-line no-param-reassign, no-extra-parens
            key,
            next: objects.next,
            value
          };
        }
      };
      var listHas = function(objects, key) {
        if (!objects) {
          return false;
        }
        return !!listGetNode(objects, key);
      };
      var listDelete = function(objects, key) {
        if (objects) {
          return listGetNode(objects, key, true);
        }
      };
      module.exports = function getSideChannelList() {
        var $o;
        var channel = {
          assert: function(key) {
            if (!channel.has(key)) {
              throw new $TypeError("Side channel does not contain " + inspect(key));
            }
          },
          "delete": function(key) {
            var root = $o && $o.next;
            var deletedNode = listDelete($o, key);
            if (deletedNode && root && root === deletedNode) {
              $o = void 0;
            }
            return !!deletedNode;
          },
          get: function(key) {
            return listGet($o, key);
          },
          has: function(key) {
            return listHas($o, key);
          },
          set: function(key, value) {
            if (!$o) {
              $o = {
                next: void 0
              };
            }
            listSet(
              /** @type {NonNullable<typeof $o>} */
              $o,
              key,
              value
            );
          }
        };
        return channel;
      };
    }
  });

  // ../../node_modules/es-object-atoms/index.js
  var require_es_object_atoms = __commonJS({
    "../../node_modules/es-object-atoms/index.js"(exports, module) {
      "use strict";
      module.exports = Object;
    }
  });

  // ../../node_modules/es-errors/index.js
  var require_es_errors = __commonJS({
    "../../node_modules/es-errors/index.js"(exports, module) {
      "use strict";
      module.exports = Error;
    }
  });

  // ../../node_modules/es-errors/eval.js
  var require_eval = __commonJS({
    "../../node_modules/es-errors/eval.js"(exports, module) {
      "use strict";
      module.exports = EvalError;
    }
  });

  // ../../node_modules/es-errors/range.js
  var require_range = __commonJS({
    "../../node_modules/es-errors/range.js"(exports, module) {
      "use strict";
      module.exports = RangeError;
    }
  });

  // ../../node_modules/es-errors/ref.js
  var require_ref = __commonJS({
    "../../node_modules/es-errors/ref.js"(exports, module) {
      "use strict";
      module.exports = ReferenceError;
    }
  });

  // ../../node_modules/es-errors/syntax.js
  var require_syntax = __commonJS({
    "../../node_modules/es-errors/syntax.js"(exports, module) {
      "use strict";
      module.exports = SyntaxError;
    }
  });

  // ../../node_modules/es-errors/uri.js
  var require_uri = __commonJS({
    "../../node_modules/es-errors/uri.js"(exports, module) {
      "use strict";
      module.exports = URIError;
    }
  });

  // ../../node_modules/math-intrinsics/abs.js
  var require_abs = __commonJS({
    "../../node_modules/math-intrinsics/abs.js"(exports, module) {
      "use strict";
      module.exports = Math.abs;
    }
  });

  // ../../node_modules/math-intrinsics/floor.js
  var require_floor = __commonJS({
    "../../node_modules/math-intrinsics/floor.js"(exports, module) {
      "use strict";
      module.exports = Math.floor;
    }
  });

  // ../../node_modules/math-intrinsics/max.js
  var require_max = __commonJS({
    "../../node_modules/math-intrinsics/max.js"(exports, module) {
      "use strict";
      module.exports = Math.max;
    }
  });

  // ../../node_modules/math-intrinsics/min.js
  var require_min = __commonJS({
    "../../node_modules/math-intrinsics/min.js"(exports, module) {
      "use strict";
      module.exports = Math.min;
    }
  });

  // ../../node_modules/math-intrinsics/pow.js
  var require_pow = __commonJS({
    "../../node_modules/math-intrinsics/pow.js"(exports, module) {
      "use strict";
      module.exports = Math.pow;
    }
  });

  // ../../node_modules/math-intrinsics/round.js
  var require_round = __commonJS({
    "../../node_modules/math-intrinsics/round.js"(exports, module) {
      "use strict";
      module.exports = Math.round;
    }
  });

  // ../../node_modules/math-intrinsics/isNaN.js
  var require_isNaN = __commonJS({
    "../../node_modules/math-intrinsics/isNaN.js"(exports, module) {
      "use strict";
      module.exports = Number.isNaN || function isNaN2(a) {
        return a !== a;
      };
    }
  });

  // ../../node_modules/math-intrinsics/sign.js
  var require_sign = __commonJS({
    "../../node_modules/math-intrinsics/sign.js"(exports, module) {
      "use strict";
      var $isNaN = require_isNaN();
      module.exports = function sign(number) {
        if ($isNaN(number) || number === 0) {
          return number;
        }
        return number < 0 ? -1 : 1;
      };
    }
  });

  // ../../node_modules/gopd/gOPD.js
  var require_gOPD = __commonJS({
    "../../node_modules/gopd/gOPD.js"(exports, module) {
      "use strict";
      module.exports = Object.getOwnPropertyDescriptor;
    }
  });

  // ../../node_modules/gopd/index.js
  var require_gopd = __commonJS({
    "../../node_modules/gopd/index.js"(exports, module) {
      "use strict";
      var $gOPD = require_gOPD();
      if ($gOPD) {
        try {
          $gOPD([], "length");
        } catch (e) {
          $gOPD = null;
        }
      }
      module.exports = $gOPD;
    }
  });

  // ../../node_modules/es-define-property/index.js
  var require_es_define_property = __commonJS({
    "../../node_modules/es-define-property/index.js"(exports, module) {
      "use strict";
      var $defineProperty = Object.defineProperty || false;
      if ($defineProperty) {
        try {
          $defineProperty({}, "a", { value: 1 });
        } catch (e) {
          $defineProperty = false;
        }
      }
      module.exports = $defineProperty;
    }
  });

  // ../../node_modules/has-symbols/shams.js
  var require_shams = __commonJS({
    "../../node_modules/has-symbols/shams.js"(exports, module) {
      "use strict";
      module.exports = function hasSymbols() {
        if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
          return false;
        }
        if (typeof Symbol.iterator === "symbol") {
          return true;
        }
        var obj = {};
        var sym = Symbol("test");
        var symObj = Object(sym);
        if (typeof sym === "string") {
          return false;
        }
        if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
          return false;
        }
        if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
          return false;
        }
        var symVal = 42;
        obj[sym] = symVal;
        for (var _ in obj) {
          return false;
        }
        if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
          return false;
        }
        if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
          return false;
        }
        var syms = Object.getOwnPropertySymbols(obj);
        if (syms.length !== 1 || syms[0] !== sym) {
          return false;
        }
        if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
          return false;
        }
        if (typeof Object.getOwnPropertyDescriptor === "function") {
          var descriptor = (
            /** @type {PropertyDescriptor} */
            Object.getOwnPropertyDescriptor(obj, sym)
          );
          if (descriptor.value !== symVal || descriptor.enumerable !== true) {
            return false;
          }
        }
        return true;
      };
    }
  });

  // ../../node_modules/has-symbols/index.js
  var require_has_symbols = __commonJS({
    "../../node_modules/has-symbols/index.js"(exports, module) {
      "use strict";
      var origSymbol = typeof Symbol !== "undefined" && Symbol;
      var hasSymbolSham = require_shams();
      module.exports = function hasNativeSymbols() {
        if (typeof origSymbol !== "function") {
          return false;
        }
        if (typeof Symbol !== "function") {
          return false;
        }
        if (typeof origSymbol("foo") !== "symbol") {
          return false;
        }
        if (typeof Symbol("bar") !== "symbol") {
          return false;
        }
        return hasSymbolSham();
      };
    }
  });

  // ../../node_modules/get-proto/Reflect.getPrototypeOf.js
  var require_Reflect_getPrototypeOf = __commonJS({
    "../../node_modules/get-proto/Reflect.getPrototypeOf.js"(exports, module) {
      "use strict";
      module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
    }
  });

  // ../../node_modules/get-proto/Object.getPrototypeOf.js
  var require_Object_getPrototypeOf = __commonJS({
    "../../node_modules/get-proto/Object.getPrototypeOf.js"(exports, module) {
      "use strict";
      var $Object = require_es_object_atoms();
      module.exports = $Object.getPrototypeOf || null;
    }
  });

  // ../../node_modules/function-bind/implementation.js
  var require_implementation = __commonJS({
    "../../node_modules/function-bind/implementation.js"(exports, module) {
      "use strict";
      var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
      var toStr = Object.prototype.toString;
      var max = Math.max;
      var funcType = "[object Function]";
      var concatty = function concatty2(a, b) {
        var arr = [];
        for (var i = 0; i < a.length; i += 1) {
          arr[i] = a[i];
        }
        for (var j = 0; j < b.length; j += 1) {
          arr[j + a.length] = b[j];
        }
        return arr;
      };
      var slicy = function slicy2(arrLike, offset) {
        var arr = [];
        for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
          arr[j] = arrLike[i];
        }
        return arr;
      };
      var joiny = function(arr, joiner) {
        var str = "";
        for (var i = 0; i < arr.length; i += 1) {
          str += arr[i];
          if (i + 1 < arr.length) {
            str += joiner;
          }
        }
        return str;
      };
      module.exports = function bind(that) {
        var target = this;
        if (typeof target !== "function" || toStr.apply(target) !== funcType) {
          throw new TypeError(ERROR_MESSAGE + target);
        }
        var args = slicy(arguments, 1);
        var bound;
        var binder = function() {
          if (this instanceof bound) {
            var result = target.apply(
              this,
              concatty(args, arguments)
            );
            if (Object(result) === result) {
              return result;
            }
            return this;
          }
          return target.apply(
            that,
            concatty(args, arguments)
          );
        };
        var boundLength = max(0, target.length - args.length);
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
          boundArgs[i] = "$" + i;
        }
        bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
        if (target.prototype) {
          var Empty = function Empty2() {
          };
          Empty.prototype = target.prototype;
          bound.prototype = new Empty();
          Empty.prototype = null;
        }
        return bound;
      };
    }
  });

  // ../../node_modules/function-bind/index.js
  var require_function_bind = __commonJS({
    "../../node_modules/function-bind/index.js"(exports, module) {
      "use strict";
      var implementation = require_implementation();
      module.exports = Function.prototype.bind || implementation;
    }
  });

  // ../../node_modules/call-bind-apply-helpers/functionCall.js
  var require_functionCall = __commonJS({
    "../../node_modules/call-bind-apply-helpers/functionCall.js"(exports, module) {
      "use strict";
      module.exports = Function.prototype.call;
    }
  });

  // ../../node_modules/call-bind-apply-helpers/functionApply.js
  var require_functionApply = __commonJS({
    "../../node_modules/call-bind-apply-helpers/functionApply.js"(exports, module) {
      "use strict";
      module.exports = Function.prototype.apply;
    }
  });

  // ../../node_modules/call-bind-apply-helpers/reflectApply.js
  var require_reflectApply = __commonJS({
    "../../node_modules/call-bind-apply-helpers/reflectApply.js"(exports, module) {
      "use strict";
      module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
    }
  });

  // ../../node_modules/call-bind-apply-helpers/actualApply.js
  var require_actualApply = __commonJS({
    "../../node_modules/call-bind-apply-helpers/actualApply.js"(exports, module) {
      "use strict";
      var bind = require_function_bind();
      var $apply = require_functionApply();
      var $call = require_functionCall();
      var $reflectApply = require_reflectApply();
      module.exports = $reflectApply || bind.call($call, $apply);
    }
  });

  // ../../node_modules/call-bind-apply-helpers/index.js
  var require_call_bind_apply_helpers = __commonJS({
    "../../node_modules/call-bind-apply-helpers/index.js"(exports, module) {
      "use strict";
      var bind = require_function_bind();
      var $TypeError = require_type();
      var $call = require_functionCall();
      var $actualApply = require_actualApply();
      module.exports = function callBindBasic(args) {
        if (args.length < 1 || typeof args[0] !== "function") {
          throw new $TypeError("a function is required");
        }
        return $actualApply(bind, $call, args);
      };
    }
  });

  // ../../node_modules/dunder-proto/get.js
  var require_get = __commonJS({
    "../../node_modules/dunder-proto/get.js"(exports, module) {
      "use strict";
      var callBind = require_call_bind_apply_helpers();
      var gOPD = require_gopd();
      var hasProtoAccessor;
      try {
        hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
        [].__proto__ === Array.prototype;
      } catch (e) {
        if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
          throw e;
        }
      }
      var desc = !!hasProtoAccessor && gOPD && gOPD(
        Object.prototype,
        /** @type {keyof typeof Object.prototype} */
        "__proto__"
      );
      var $Object = Object;
      var $getPrototypeOf = $Object.getPrototypeOf;
      module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
        /** @type {import('./get')} */
        function getDunder(value) {
          return $getPrototypeOf(value == null ? value : $Object(value));
        }
      ) : false;
    }
  });

  // ../../node_modules/get-proto/index.js
  var require_get_proto = __commonJS({
    "../../node_modules/get-proto/index.js"(exports, module) {
      "use strict";
      var reflectGetProto = require_Reflect_getPrototypeOf();
      var originalGetProto = require_Object_getPrototypeOf();
      var getDunderProto = require_get();
      module.exports = reflectGetProto ? function getProto(O) {
        return reflectGetProto(O);
      } : originalGetProto ? function getProto(O) {
        if (!O || typeof O !== "object" && typeof O !== "function") {
          throw new TypeError("getProto: not an object");
        }
        return originalGetProto(O);
      } : getDunderProto ? function getProto(O) {
        return getDunderProto(O);
      } : null;
    }
  });

  // ../../node_modules/hasown/index.js
  var require_hasown = __commonJS({
    "../../node_modules/hasown/index.js"(exports, module) {
      "use strict";
      var call = Function.prototype.call;
      var $hasOwn = Object.prototype.hasOwnProperty;
      var bind = require_function_bind();
      module.exports = bind.call(call, $hasOwn);
    }
  });

  // ../../node_modules/get-intrinsic/index.js
  var require_get_intrinsic = __commonJS({
    "../../node_modules/get-intrinsic/index.js"(exports, module) {
      "use strict";
      var undefined2;
      var $Object = require_es_object_atoms();
      var $Error = require_es_errors();
      var $EvalError = require_eval();
      var $RangeError = require_range();
      var $ReferenceError = require_ref();
      var $SyntaxError = require_syntax();
      var $TypeError = require_type();
      var $URIError = require_uri();
      var abs = require_abs();
      var floor = require_floor();
      var max = require_max();
      var min = require_min();
      var pow = require_pow();
      var round = require_round();
      var sign = require_sign();
      var $Function = Function;
      var getEvalledConstructor = function(expressionSyntax) {
        try {
          return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
        } catch (e) {
        }
      };
      var $gOPD = require_gopd();
      var $defineProperty = require_es_define_property();
      var throwTypeError = function() {
        throw new $TypeError();
      };
      var ThrowTypeError = $gOPD ? function() {
        try {
          arguments.callee;
          return throwTypeError;
        } catch (calleeThrows) {
          try {
            return $gOPD(arguments, "callee").get;
          } catch (gOPDthrows) {
            return throwTypeError;
          }
        }
      }() : throwTypeError;
      var hasSymbols = require_has_symbols()();
      var getProto = require_get_proto();
      var $ObjectGPO = require_Object_getPrototypeOf();
      var $ReflectGPO = require_Reflect_getPrototypeOf();
      var $apply = require_functionApply();
      var $call = require_functionCall();
      var needsEval = {};
      var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
      var INTRINSICS = {
        __proto__: null,
        "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
        "%Array%": Array,
        "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
        "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
        "%AsyncFromSyncIteratorPrototype%": undefined2,
        "%AsyncFunction%": needsEval,
        "%AsyncGenerator%": needsEval,
        "%AsyncGeneratorFunction%": needsEval,
        "%AsyncIteratorPrototype%": needsEval,
        "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
        "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
        "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
        "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
        "%Boolean%": Boolean,
        "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
        "%Date%": Date,
        "%decodeURI%": decodeURI,
        "%decodeURIComponent%": decodeURIComponent,
        "%encodeURI%": encodeURI,
        "%encodeURIComponent%": encodeURIComponent,
        "%Error%": $Error,
        "%eval%": eval,
        // eslint-disable-line no-eval
        "%EvalError%": $EvalError,
        "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
        "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
        "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
        "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
        "%Function%": $Function,
        "%GeneratorFunction%": needsEval,
        "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
        "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
        "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
        "%isFinite%": isFinite,
        "%isNaN%": isNaN,
        "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
        "%JSON%": typeof JSON === "object" ? JSON : undefined2,
        "%Map%": typeof Map === "undefined" ? undefined2 : Map,
        "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
        "%Math%": Math,
        "%Number%": Number,
        "%Object%": $Object,
        "%Object.getOwnPropertyDescriptor%": $gOPD,
        "%parseFloat%": parseFloat,
        "%parseInt%": parseInt,
        "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
        "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
        "%RangeError%": $RangeError,
        "%ReferenceError%": $ReferenceError,
        "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
        "%RegExp%": RegExp,
        "%Set%": typeof Set === "undefined" ? undefined2 : Set,
        "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
        "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
        "%String%": String,
        "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
        "%Symbol%": hasSymbols ? Symbol : undefined2,
        "%SyntaxError%": $SyntaxError,
        "%ThrowTypeError%": ThrowTypeError,
        "%TypedArray%": TypedArray,
        "%TypeError%": $TypeError,
        "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
        "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
        "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
        "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
        "%URIError%": $URIError,
        "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
        "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
        "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
        "%Function.prototype.call%": $call,
        "%Function.prototype.apply%": $apply,
        "%Object.defineProperty%": $defineProperty,
        "%Object.getPrototypeOf%": $ObjectGPO,
        "%Math.abs%": abs,
        "%Math.floor%": floor,
        "%Math.max%": max,
        "%Math.min%": min,
        "%Math.pow%": pow,
        "%Math.round%": round,
        "%Math.sign%": sign,
        "%Reflect.getPrototypeOf%": $ReflectGPO
      };
      if (getProto) {
        try {
          null.error;
        } catch (e) {
          errorProto = getProto(getProto(e));
          INTRINSICS["%Error.prototype%"] = errorProto;
        }
      }
      var errorProto;
      var doEval = function doEval2(name) {
        var value;
        if (name === "%AsyncFunction%") {
          value = getEvalledConstructor("async function () {}");
        } else if (name === "%GeneratorFunction%") {
          value = getEvalledConstructor("function* () {}");
        } else if (name === "%AsyncGeneratorFunction%") {
          value = getEvalledConstructor("async function* () {}");
        } else if (name === "%AsyncGenerator%") {
          var fn = doEval2("%AsyncGeneratorFunction%");
          if (fn) {
            value = fn.prototype;
          }
        } else if (name === "%AsyncIteratorPrototype%") {
          var gen = doEval2("%AsyncGenerator%");
          if (gen && getProto) {
            value = getProto(gen.prototype);
          }
        }
        INTRINSICS[name] = value;
        return value;
      };
      var LEGACY_ALIASES = {
        __proto__: null,
        "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
        "%ArrayPrototype%": ["Array", "prototype"],
        "%ArrayProto_entries%": ["Array", "prototype", "entries"],
        "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
        "%ArrayProto_keys%": ["Array", "prototype", "keys"],
        "%ArrayProto_values%": ["Array", "prototype", "values"],
        "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
        "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
        "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
        "%BooleanPrototype%": ["Boolean", "prototype"],
        "%DataViewPrototype%": ["DataView", "prototype"],
        "%DatePrototype%": ["Date", "prototype"],
        "%ErrorPrototype%": ["Error", "prototype"],
        "%EvalErrorPrototype%": ["EvalError", "prototype"],
        "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
        "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
        "%FunctionPrototype%": ["Function", "prototype"],
        "%Generator%": ["GeneratorFunction", "prototype"],
        "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
        "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
        "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
        "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
        "%JSONParse%": ["JSON", "parse"],
        "%JSONStringify%": ["JSON", "stringify"],
        "%MapPrototype%": ["Map", "prototype"],
        "%NumberPrototype%": ["Number", "prototype"],
        "%ObjectPrototype%": ["Object", "prototype"],
        "%ObjProto_toString%": ["Object", "prototype", "toString"],
        "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
        "%PromisePrototype%": ["Promise", "prototype"],
        "%PromiseProto_then%": ["Promise", "prototype", "then"],
        "%Promise_all%": ["Promise", "all"],
        "%Promise_reject%": ["Promise", "reject"],
        "%Promise_resolve%": ["Promise", "resolve"],
        "%RangeErrorPrototype%": ["RangeError", "prototype"],
        "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
        "%RegExpPrototype%": ["RegExp", "prototype"],
        "%SetPrototype%": ["Set", "prototype"],
        "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
        "%StringPrototype%": ["String", "prototype"],
        "%SymbolPrototype%": ["Symbol", "prototype"],
        "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
        "%TypedArrayPrototype%": ["TypedArray", "prototype"],
        "%TypeErrorPrototype%": ["TypeError", "prototype"],
        "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
        "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
        "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
        "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
        "%URIErrorPrototype%": ["URIError", "prototype"],
        "%WeakMapPrototype%": ["WeakMap", "prototype"],
        "%WeakSetPrototype%": ["WeakSet", "prototype"]
      };
      var bind = require_function_bind();
      var hasOwn = require_hasown();
      var $concat = bind.call($call, Array.prototype.concat);
      var $spliceApply = bind.call($apply, Array.prototype.splice);
      var $replace = bind.call($call, String.prototype.replace);
      var $strSlice = bind.call($call, String.prototype.slice);
      var $exec = bind.call($call, RegExp.prototype.exec);
      var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
      var reEscapeChar = /\\(\\)?/g;
      var stringToPath = function stringToPath2(string) {
        var first = $strSlice(string, 0, 1);
        var last = $strSlice(string, -1);
        if (first === "%" && last !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
        } else if (last === "%" && first !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
        }
        var result = [];
        $replace(string, rePropName, function(match, number, quote, subString) {
          result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
        });
        return result;
      };
      var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
        var intrinsicName = name;
        var alias;
        if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
          alias = LEGACY_ALIASES[intrinsicName];
          intrinsicName = "%" + alias[0] + "%";
        }
        if (hasOwn(INTRINSICS, intrinsicName)) {
          var value = INTRINSICS[intrinsicName];
          if (value === needsEval) {
            value = doEval(intrinsicName);
          }
          if (typeof value === "undefined" && !allowMissing) {
            throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
          }
          return {
            alias,
            name: intrinsicName,
            value
          };
        }
        throw new $SyntaxError("intrinsic " + name + " does not exist!");
      };
      module.exports = function GetIntrinsic(name, allowMissing) {
        if (typeof name !== "string" || name.length === 0) {
          throw new $TypeError("intrinsic name must be a non-empty string");
        }
        if (arguments.length > 1 && typeof allowMissing !== "boolean") {
          throw new $TypeError('"allowMissing" argument must be a boolean');
        }
        if ($exec(/^%?[^%]*%?$/, name) === null) {
          throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
        }
        var parts = stringToPath(name);
        var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
        var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
        var intrinsicRealName = intrinsic.name;
        var value = intrinsic.value;
        var skipFurtherCaching = false;
        var alias = intrinsic.alias;
        if (alias) {
          intrinsicBaseName = alias[0];
          $spliceApply(parts, $concat([0, 1], alias));
        }
        for (var i = 1, isOwn = true; i < parts.length; i += 1) {
          var part = parts[i];
          var first = $strSlice(part, 0, 1);
          var last = $strSlice(part, -1);
          if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
            throw new $SyntaxError("property names with quotes must have matching quotes");
          }
          if (part === "constructor" || !isOwn) {
            skipFurtherCaching = true;
          }
          intrinsicBaseName += "." + part;
          intrinsicRealName = "%" + intrinsicBaseName + "%";
          if (hasOwn(INTRINSICS, intrinsicRealName)) {
            value = INTRINSICS[intrinsicRealName];
          } else if (value != null) {
            if (!(part in value)) {
              if (!allowMissing) {
                throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
              }
              return void 0;
            }
            if ($gOPD && i + 1 >= parts.length) {
              var desc = $gOPD(value, part);
              isOwn = !!desc;
              if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
                value = desc.get;
              } else {
                value = value[part];
              }
            } else {
              isOwn = hasOwn(value, part);
              value = value[part];
            }
            if (isOwn && !skipFurtherCaching) {
              INTRINSICS[intrinsicRealName] = value;
            }
          }
        }
        return value;
      };
    }
  });

  // ../../node_modules/call-bound/index.js
  var require_call_bound = __commonJS({
    "../../node_modules/call-bound/index.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var callBindBasic = require_call_bind_apply_helpers();
      var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
      module.exports = function callBoundIntrinsic(name, allowMissing) {
        var intrinsic = (
          /** @type {(this: unknown, ...args: unknown[]) => unknown} */
          GetIntrinsic(name, !!allowMissing)
        );
        if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
          return callBindBasic(
            /** @type {const} */
            [intrinsic]
          );
        }
        return intrinsic;
      };
    }
  });

  // ../../node_modules/side-channel-map/index.js
  var require_side_channel_map = __commonJS({
    "../../node_modules/side-channel-map/index.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var callBound = require_call_bound();
      var inspect = require_object_inspect();
      var $TypeError = require_type();
      var $Map = GetIntrinsic("%Map%", true);
      var $mapGet = callBound("Map.prototype.get", true);
      var $mapSet = callBound("Map.prototype.set", true);
      var $mapHas = callBound("Map.prototype.has", true);
      var $mapDelete = callBound("Map.prototype.delete", true);
      var $mapSize = callBound("Map.prototype.size", true);
      module.exports = !!$Map && /** @type {Exclude<import('.'), false>} */
      function getSideChannelMap() {
        var $m;
        var channel = {
          assert: function(key) {
            if (!channel.has(key)) {
              throw new $TypeError("Side channel does not contain " + inspect(key));
            }
          },
          "delete": function(key) {
            if ($m) {
              var result = $mapDelete($m, key);
              if ($mapSize($m) === 0) {
                $m = void 0;
              }
              return result;
            }
            return false;
          },
          get: function(key) {
            if ($m) {
              return $mapGet($m, key);
            }
          },
          has: function(key) {
            if ($m) {
              return $mapHas($m, key);
            }
            return false;
          },
          set: function(key, value) {
            if (!$m) {
              $m = new $Map();
            }
            $mapSet($m, key, value);
          }
        };
        return channel;
      };
    }
  });

  // ../../node_modules/side-channel-weakmap/index.js
  var require_side_channel_weakmap = __commonJS({
    "../../node_modules/side-channel-weakmap/index.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var callBound = require_call_bound();
      var inspect = require_object_inspect();
      var getSideChannelMap = require_side_channel_map();
      var $TypeError = require_type();
      var $WeakMap = GetIntrinsic("%WeakMap%", true);
      var $weakMapGet = callBound("WeakMap.prototype.get", true);
      var $weakMapSet = callBound("WeakMap.prototype.set", true);
      var $weakMapHas = callBound("WeakMap.prototype.has", true);
      var $weakMapDelete = callBound("WeakMap.prototype.delete", true);
      module.exports = $WeakMap ? (
        /** @type {Exclude<import('.'), false>} */
        function getSideChannelWeakMap() {
          var $wm;
          var $m;
          var channel = {
            assert: function(key) {
              if (!channel.has(key)) {
                throw new $TypeError("Side channel does not contain " + inspect(key));
              }
            },
            "delete": function(key) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if ($wm) {
                  return $weakMapDelete($wm, key);
                }
              } else if (getSideChannelMap) {
                if ($m) {
                  return $m["delete"](key);
                }
              }
              return false;
            },
            get: function(key) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if ($wm) {
                  return $weakMapGet($wm, key);
                }
              }
              return $m && $m.get(key);
            },
            has: function(key) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if ($wm) {
                  return $weakMapHas($wm, key);
                }
              }
              return !!$m && $m.has(key);
            },
            set: function(key, value) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if (!$wm) {
                  $wm = new $WeakMap();
                }
                $weakMapSet($wm, key, value);
              } else if (getSideChannelMap) {
                if (!$m) {
                  $m = getSideChannelMap();
                }
                $m.set(key, value);
              }
            }
          };
          return channel;
        }
      ) : getSideChannelMap;
    }
  });

  // ../../node_modules/side-channel/index.js
  var require_side_channel = __commonJS({
    "../../node_modules/side-channel/index.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var inspect = require_object_inspect();
      var getSideChannelList = require_side_channel_list();
      var getSideChannelMap = require_side_channel_map();
      var getSideChannelWeakMap = require_side_channel_weakmap();
      var makeChannel = getSideChannelWeakMap || getSideChannelMap || getSideChannelList;
      module.exports = function getSideChannel() {
        var $channelData;
        var channel = {
          assert: function(key) {
            if (!channel.has(key)) {
              throw new $TypeError("Side channel does not contain " + inspect(key));
            }
          },
          "delete": function(key) {
            return !!$channelData && $channelData["delete"](key);
          },
          get: function(key) {
            return $channelData && $channelData.get(key);
          },
          has: function(key) {
            return !!$channelData && $channelData.has(key);
          },
          set: function(key, value) {
            if (!$channelData) {
              $channelData = makeChannel();
            }
            $channelData.set(key, value);
          }
        };
        return channel;
      };
    }
  });

  // ../../node_modules/@linkurious/rest-client/node_modules/qs/lib/formats.js
  var require_formats = __commonJS({
    "../../node_modules/@linkurious/rest-client/node_modules/qs/lib/formats.js"(exports, module) {
      "use strict";
      var replace = String.prototype.replace;
      var percentTwenties = /%20/g;
      var Format = {
        RFC1738: "RFC1738",
        RFC3986: "RFC3986"
      };
      module.exports = {
        "default": Format.RFC3986,
        formatters: {
          RFC1738: function(value) {
            return replace.call(value, percentTwenties, "+");
          },
          RFC3986: function(value) {
            return String(value);
          }
        },
        RFC1738: Format.RFC1738,
        RFC3986: Format.RFC3986
      };
    }
  });

  // ../../node_modules/@linkurious/rest-client/node_modules/qs/lib/utils.js
  var require_utils = __commonJS({
    "../../node_modules/@linkurious/rest-client/node_modules/qs/lib/utils.js"(exports, module) {
      "use strict";
      var formats = require_formats();
      var has = Object.prototype.hasOwnProperty;
      var isArray = Array.isArray;
      var hexTable = function() {
        var array = [];
        for (var i = 0; i < 256; ++i) {
          array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
        }
        return array;
      }();
      var compactQueue = function compactQueue2(queue) {
        while (queue.length > 1) {
          var item = queue.pop();
          var obj = item.obj[item.prop];
          if (isArray(obj)) {
            var compacted = [];
            for (var j = 0; j < obj.length; ++j) {
              if (typeof obj[j] !== "undefined") {
                compacted.push(obj[j]);
              }
            }
            item.obj[item.prop] = compacted;
          }
        }
      };
      var arrayToObject = function arrayToObject2(source, options) {
        var obj = options && options.plainObjects ? { __proto__: null } : {};
        for (var i = 0; i < source.length; ++i) {
          if (typeof source[i] !== "undefined") {
            obj[i] = source[i];
          }
        }
        return obj;
      };
      var merge = function merge2(target, source, options) {
        if (!source) {
          return target;
        }
        if (typeof source !== "object" && typeof source !== "function") {
          if (isArray(target)) {
            target.push(source);
          } else if (target && typeof target === "object") {
            if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
              target[source] = true;
            }
          } else {
            return [target, source];
          }
          return target;
        }
        if (!target || typeof target !== "object") {
          return [target].concat(source);
        }
        var mergeTarget = target;
        if (isArray(target) && !isArray(source)) {
          mergeTarget = arrayToObject(target, options);
        }
        if (isArray(target) && isArray(source)) {
          source.forEach(function(item, i) {
            if (has.call(target, i)) {
              var targetItem = target[i];
              if (targetItem && typeof targetItem === "object" && item && typeof item === "object") {
                target[i] = merge2(targetItem, item, options);
              } else {
                target.push(item);
              }
            } else {
              target[i] = item;
            }
          });
          return target;
        }
        return Object.keys(source).reduce(function(acc, key) {
          var value = source[key];
          if (has.call(acc, key)) {
            acc[key] = merge2(acc[key], value, options);
          } else {
            acc[key] = value;
          }
          return acc;
        }, mergeTarget);
      };
      var assign = function assignSingleSource(target, source) {
        return Object.keys(source).reduce(function(acc, key) {
          acc[key] = source[key];
          return acc;
        }, target);
      };
      var decode = function(str, defaultDecoder, charset) {
        var strWithoutPlus = str.replace(/\+/g, " ");
        if (charset === "iso-8859-1") {
          return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
        }
        try {
          return decodeURIComponent(strWithoutPlus);
        } catch (e) {
          return strWithoutPlus;
        }
      };
      var limit = 1024;
      var encode = function encode2(str, defaultEncoder, charset, kind, format) {
        if (str.length === 0) {
          return str;
        }
        var string = str;
        if (typeof str === "symbol") {
          string = Symbol.prototype.toString.call(str);
        } else if (typeof str !== "string") {
          string = String(str);
        }
        if (charset === "iso-8859-1") {
          return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
            return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
          });
        }
        var out = "";
        for (var j = 0; j < string.length; j += limit) {
          var segment = string.length >= limit ? string.slice(j, j + limit) : string;
          var arr = [];
          for (var i = 0; i < segment.length; ++i) {
            var c = segment.charCodeAt(i);
            if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === formats.RFC1738 && (c === 40 || c === 41)) {
              arr[arr.length] = segment.charAt(i);
              continue;
            }
            if (c < 128) {
              arr[arr.length] = hexTable[c];
              continue;
            }
            if (c < 2048) {
              arr[arr.length] = hexTable[192 | c >> 6] + hexTable[128 | c & 63];
              continue;
            }
            if (c < 55296 || c >= 57344) {
              arr[arr.length] = hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
              continue;
            }
            i += 1;
            c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
            arr[arr.length] = hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
          }
          out += arr.join("");
        }
        return out;
      };
      var compact = function compact2(value) {
        var queue = [{ obj: { o: value }, prop: "o" }];
        var refs = [];
        for (var i = 0; i < queue.length; ++i) {
          var item = queue[i];
          var obj = item.obj[item.prop];
          var keys = Object.keys(obj);
          for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === "object" && val !== null && refs.indexOf(val) === -1) {
              queue.push({ obj, prop: key });
              refs.push(val);
            }
          }
        }
        compactQueue(queue);
        return value;
      };
      var isRegExp = function isRegExp2(obj) {
        return Object.prototype.toString.call(obj) === "[object RegExp]";
      };
      var isBuffer = function isBuffer2(obj) {
        if (!obj || typeof obj !== "object") {
          return false;
        }
        return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
      };
      var combine = function combine2(a, b) {
        return [].concat(a, b);
      };
      var maybeMap = function maybeMap2(val, fn) {
        if (isArray(val)) {
          var mapped = [];
          for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
          }
          return mapped;
        }
        return fn(val);
      };
      module.exports = {
        arrayToObject,
        assign,
        combine,
        compact,
        decode,
        encode,
        isBuffer,
        isRegExp,
        maybeMap,
        merge
      };
    }
  });

  // ../../node_modules/@linkurious/rest-client/node_modules/qs/lib/stringify.js
  var require_stringify = __commonJS({
    "../../node_modules/@linkurious/rest-client/node_modules/qs/lib/stringify.js"(exports, module) {
      "use strict";
      var getSideChannel = require_side_channel();
      var utils = require_utils();
      var formats = require_formats();
      var has = Object.prototype.hasOwnProperty;
      var arrayPrefixGenerators = {
        brackets: function brackets(prefix) {
          return prefix + "[]";
        },
        comma: "comma",
        indices: function indices(prefix, key) {
          return prefix + "[" + key + "]";
        },
        repeat: function repeat(prefix) {
          return prefix;
        }
      };
      var isArray = Array.isArray;
      var push = Array.prototype.push;
      var pushToArray = function(arr, valueOrArray) {
        push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
      };
      var toISO = Date.prototype.toISOString;
      var defaultFormat = formats["default"];
      var defaults = {
        addQueryPrefix: false,
        allowDots: false,
        allowEmptyArrays: false,
        arrayFormat: "indices",
        charset: "utf-8",
        charsetSentinel: false,
        commaRoundTrip: false,
        delimiter: "&",
        encode: true,
        encodeDotInKeys: false,
        encoder: utils.encode,
        encodeValuesOnly: false,
        filter: void 0,
        format: defaultFormat,
        formatter: formats.formatters[defaultFormat],
        // deprecated
        indices: false,
        serializeDate: function serializeDate(date) {
          return toISO.call(date);
        },
        skipNulls: false,
        strictNullHandling: false
      };
      var isNonNullishPrimitive = function isNonNullishPrimitive2(v) {
        return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
      };
      var sentinel = {};
      var stringify = function stringify2(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
        var obj = object;
        var tmpSc = sideChannel;
        var step = 0;
        var findFlag = false;
        while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
          var pos = tmpSc.get(object);
          step += 1;
          if (typeof pos !== "undefined") {
            if (pos === step) {
              throw new RangeError("Cyclic object value");
            } else {
              findFlag = true;
            }
          }
          if (typeof tmpSc.get(sentinel) === "undefined") {
            step = 0;
          }
        }
        if (typeof filter === "function") {
          obj = filter(prefix, obj);
        } else if (obj instanceof Date) {
          obj = serializeDate(obj);
        } else if (generateArrayPrefix === "comma" && isArray(obj)) {
          obj = utils.maybeMap(obj, function(value2) {
            if (value2 instanceof Date) {
              return serializeDate(value2);
            }
            return value2;
          });
        }
        if (obj === null) {
          if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, "key", format) : prefix;
          }
          obj = "";
        }
        if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
          if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
            return [formatter(keyValue) + "=" + formatter(encoder(obj, defaults.encoder, charset, "value", format))];
          }
          return [formatter(prefix) + "=" + formatter(String(obj))];
        }
        var values = [];
        if (typeof obj === "undefined") {
          return values;
        }
        var objKeys;
        if (generateArrayPrefix === "comma" && isArray(obj)) {
          if (encodeValuesOnly && encoder) {
            obj = utils.maybeMap(obj, encoder);
          }
          objKeys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
        } else if (isArray(filter)) {
          objKeys = filter;
        } else {
          var keys = Object.keys(obj);
          objKeys = sort ? keys.sort(sort) : keys;
        }
        var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
        var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encodedPrefix + "[]" : encodedPrefix;
        if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
          return adjustedPrefix + "[]";
        }
        for (var j = 0; j < objKeys.length; ++j) {
          var key = objKeys[j];
          var value = typeof key === "object" && key && typeof key.value !== "undefined" ? key.value : obj[key];
          if (skipNulls && value === null) {
            continue;
          }
          var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, "%2E") : String(key);
          var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix : adjustedPrefix + (allowDots ? "." + encodedKey : "[" + encodedKey + "]");
          sideChannel.set(object, step);
          var valueSideChannel = getSideChannel();
          valueSideChannel.set(sentinel, sideChannel);
          pushToArray(values, stringify2(
            value,
            keyPrefix,
            generateArrayPrefix,
            commaRoundTrip,
            allowEmptyArrays,
            strictNullHandling,
            skipNulls,
            encodeDotInKeys,
            generateArrayPrefix === "comma" && encodeValuesOnly && isArray(obj) ? null : encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            format,
            formatter,
            encodeValuesOnly,
            charset,
            valueSideChannel
          ));
        }
        return values;
      };
      var normalizeStringifyOptions = function normalizeStringifyOptions2(opts) {
        if (!opts) {
          return defaults;
        }
        if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
          throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
        }
        if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
          throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
        }
        if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
          throw new TypeError("Encoder has to be a function.");
        }
        var charset = opts.charset || defaults.charset;
        if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
          throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        }
        var format = formats["default"];
        if (typeof opts.format !== "undefined") {
          if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError("Unknown format option provided.");
          }
          format = opts.format;
        }
        var formatter = formats.formatters[format];
        var filter = defaults.filter;
        if (typeof opts.filter === "function" || isArray(opts.filter)) {
          filter = opts.filter;
        }
        var arrayFormat;
        if (opts.arrayFormat in arrayPrefixGenerators) {
          arrayFormat = opts.arrayFormat;
        } else if ("indices" in opts) {
          arrayFormat = opts.indices ? "indices" : "repeat";
        } else {
          arrayFormat = defaults.arrayFormat;
        }
        if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
          throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
        }
        var allowDots = typeof opts.allowDots === "undefined" ? opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
        return {
          addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
          allowDots,
          allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
          arrayFormat,
          charset,
          charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
          commaRoundTrip: !!opts.commaRoundTrip,
          delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
          encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
          encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
          encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
          encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
          filter,
          format,
          formatter,
          serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
          skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
          sort: typeof opts.sort === "function" ? opts.sort : null,
          strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
        };
      };
      module.exports = function(object, opts) {
        var obj = object;
        var options = normalizeStringifyOptions(opts);
        var objKeys;
        var filter;
        if (typeof options.filter === "function") {
          filter = options.filter;
          obj = filter("", obj);
        } else if (isArray(options.filter)) {
          filter = options.filter;
          objKeys = filter;
        }
        var keys = [];
        if (typeof obj !== "object" || obj === null) {
          return "";
        }
        var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
        var commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
        if (!objKeys) {
          objKeys = Object.keys(obj);
        }
        if (options.sort) {
          objKeys.sort(options.sort);
        }
        var sideChannel = getSideChannel();
        for (var i = 0; i < objKeys.length; ++i) {
          var key = objKeys[i];
          var value = obj[key];
          if (options.skipNulls && value === null) {
            continue;
          }
          pushToArray(keys, stringify(
            value,
            key,
            generateArrayPrefix,
            commaRoundTrip,
            options.allowEmptyArrays,
            options.strictNullHandling,
            options.skipNulls,
            options.encodeDotInKeys,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.format,
            options.formatter,
            options.encodeValuesOnly,
            options.charset,
            sideChannel
          ));
        }
        var joined = keys.join(options.delimiter);
        var prefix = options.addQueryPrefix === true ? "?" : "";
        if (options.charsetSentinel) {
          if (options.charset === "iso-8859-1") {
            prefix += "utf8=%26%2310003%3B&";
          } else {
            prefix += "utf8=%E2%9C%93&";
          }
        }
        return joined.length > 0 ? prefix + joined : "";
      };
    }
  });

  // ../../node_modules/@linkurious/rest-client/node_modules/qs/lib/parse.js
  var require_parse = __commonJS({
    "../../node_modules/@linkurious/rest-client/node_modules/qs/lib/parse.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var has = Object.prototype.hasOwnProperty;
      var isArray = Array.isArray;
      var defaults = {
        allowDots: false,
        allowEmptyArrays: false,
        allowPrototypes: false,
        allowSparse: false,
        arrayLimit: 20,
        charset: "utf-8",
        charsetSentinel: false,
        comma: false,
        decodeDotInKeys: false,
        decoder: utils.decode,
        delimiter: "&",
        depth: 5,
        duplicates: "combine",
        ignoreQueryPrefix: false,
        interpretNumericEntities: false,
        parameterLimit: 1e3,
        parseArrays: true,
        plainObjects: false,
        strictDepth: false,
        strictNullHandling: false,
        throwOnLimitExceeded: false
      };
      var interpretNumericEntities = function(str) {
        return str.replace(/&#(\d+);/g, function($0, numberStr) {
          return String.fromCharCode(parseInt(numberStr, 10));
        });
      };
      var parseArrayValue = function(val, options, currentArrayLength) {
        if (val && typeof val === "string" && options.comma && val.indexOf(",") > -1) {
          return val.split(",");
        }
        if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
          throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
        }
        return val;
      };
      var isoSentinel = "utf8=%26%2310003%3B";
      var charsetSentinel = "utf8=%E2%9C%93";
      var parseValues = function parseQueryStringValues(str, options) {
        var obj = { __proto__: null };
        var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
        cleanStr = cleanStr.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
        var limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
        var parts = cleanStr.split(
          options.delimiter,
          options.throwOnLimitExceeded ? limit + 1 : limit
        );
        if (options.throwOnLimitExceeded && parts.length > limit) {
          throw new RangeError("Parameter limit exceeded. Only " + limit + " parameter" + (limit === 1 ? "" : "s") + " allowed.");
        }
        var skipIndex = -1;
        var i;
        var charset = options.charset;
        if (options.charsetSentinel) {
          for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf("utf8=") === 0) {
              if (parts[i] === charsetSentinel) {
                charset = "utf-8";
              } else if (parts[i] === isoSentinel) {
                charset = "iso-8859-1";
              }
              skipIndex = i;
              i = parts.length;
            }
          }
        }
        for (i = 0; i < parts.length; ++i) {
          if (i === skipIndex) {
            continue;
          }
          var part = parts[i];
          var bracketEqualsPos = part.indexOf("]=");
          var pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
          var key;
          var val;
          if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, "key");
            val = options.strictNullHandling ? null : "";
          } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
            val = utils.maybeMap(
              parseArrayValue(
                part.slice(pos + 1),
                options,
                isArray(obj[key]) ? obj[key].length : 0
              ),
              function(encodedVal) {
                return options.decoder(encodedVal, defaults.decoder, charset, "value");
              }
            );
          }
          if (val && options.interpretNumericEntities && charset === "iso-8859-1") {
            val = interpretNumericEntities(String(val));
          }
          if (part.indexOf("[]=") > -1) {
            val = isArray(val) ? [val] : val;
          }
          var existing = has.call(obj, key);
          if (existing && options.duplicates === "combine") {
            obj[key] = utils.combine(obj[key], val);
          } else if (!existing || options.duplicates === "last") {
            obj[key] = val;
          }
        }
        return obj;
      };
      var parseObject = function(chain, val, options, valuesParsed) {
        var currentArrayLength = 0;
        if (chain.length > 0 && chain[chain.length - 1] === "[]") {
          var parentKey = chain.slice(0, -1).join("");
          currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
        }
        var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);
        for (var i = chain.length - 1; i >= 0; --i) {
          var obj;
          var root = chain[i];
          if (root === "[]" && options.parseArrays) {
            obj = options.allowEmptyArrays && (leaf === "" || options.strictNullHandling && leaf === null) ? [] : utils.combine([], leaf);
          } else {
            obj = options.plainObjects ? { __proto__: null } : {};
            var cleanRoot = root.charAt(0) === "[" && root.charAt(root.length - 1) === "]" ? root.slice(1, -1) : root;
            var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, ".") : cleanRoot;
            var index = parseInt(decodedRoot, 10);
            if (!options.parseArrays && decodedRoot === "") {
              obj = { 0: leaf };
            } else if (!isNaN(index) && root !== decodedRoot && String(index) === decodedRoot && index >= 0 && (options.parseArrays && index <= options.arrayLimit)) {
              obj = [];
              obj[index] = leaf;
            } else if (decodedRoot !== "__proto__") {
              obj[decodedRoot] = leaf;
            }
          }
          leaf = obj;
        }
        return leaf;
      };
      var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
        if (!givenKey) {
          return;
        }
        var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, "[$1]") : givenKey;
        var brackets = /(\[[^[\]]*])/;
        var child = /(\[[^[\]]*])/g;
        var segment = options.depth > 0 && brackets.exec(key);
        var parent = segment ? key.slice(0, segment.index) : key;
        var keys = [];
        if (parent) {
          if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
              return;
            }
          }
          keys.push(parent);
        }
        var i = 0;
        while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
          i += 1;
          if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
              return;
            }
          }
          keys.push(segment[1]);
        }
        if (segment) {
          if (options.strictDepth === true) {
            throw new RangeError("Input depth exceeded depth option of " + options.depth + " and strictDepth is true");
          }
          keys.push("[" + key.slice(segment.index) + "]");
        }
        return parseObject(keys, val, options, valuesParsed);
      };
      var normalizeParseOptions = function normalizeParseOptions2(opts) {
        if (!opts) {
          return defaults;
        }
        if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
          throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
        }
        if (typeof opts.decodeDotInKeys !== "undefined" && typeof opts.decodeDotInKeys !== "boolean") {
          throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
        }
        if (opts.decoder !== null && typeof opts.decoder !== "undefined" && typeof opts.decoder !== "function") {
          throw new TypeError("Decoder has to be a function.");
        }
        if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
          throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        }
        if (typeof opts.throwOnLimitExceeded !== "undefined" && typeof opts.throwOnLimitExceeded !== "boolean") {
          throw new TypeError("`throwOnLimitExceeded` option must be a boolean");
        }
        var charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
        var duplicates = typeof opts.duplicates === "undefined" ? defaults.duplicates : opts.duplicates;
        if (duplicates !== "combine" && duplicates !== "first" && duplicates !== "last") {
          throw new TypeError("The duplicates option must be either combine, first, or last");
        }
        var allowDots = typeof opts.allowDots === "undefined" ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
        return {
          allowDots,
          allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
          allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
          allowSparse: typeof opts.allowSparse === "boolean" ? opts.allowSparse : defaults.allowSparse,
          arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
          charset,
          charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
          comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
          decodeDotInKeys: typeof opts.decodeDotInKeys === "boolean" ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
          decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
          delimiter: typeof opts.delimiter === "string" || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
          // eslint-disable-next-line no-implicit-coercion, no-extra-parens
          depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
          duplicates,
          ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
          interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
          parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
          parseArrays: opts.parseArrays !== false,
          plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
          strictDepth: typeof opts.strictDepth === "boolean" ? !!opts.strictDepth : defaults.strictDepth,
          strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling,
          throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === "boolean" ? opts.throwOnLimitExceeded : false
        };
      };
      module.exports = function(str, opts) {
        var options = normalizeParseOptions(opts);
        if (str === "" || str === null || typeof str === "undefined") {
          return options.plainObjects ? { __proto__: null } : {};
        }
        var tempObj = typeof str === "string" ? parseValues(str, options) : str;
        var obj = options.plainObjects ? { __proto__: null } : {};
        var keys = Object.keys(tempObj);
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          var newObj = parseKeys(key, tempObj[key], options, typeof str === "string");
          obj = utils.merge(obj, newObj, options);
        }
        if (options.allowSparse === true) {
          return obj;
        }
        return utils.compact(obj);
      };
    }
  });

  // ../../node_modules/@linkurious/rest-client/node_modules/qs/lib/index.js
  var require_lib = __commonJS({
    "../../node_modules/@linkurious/rest-client/node_modules/qs/lib/index.js"(exports, module) {
      "use strict";
      var stringify = require_stringify();
      var parse = require_parse();
      var formats = require_formats();
      module.exports = {
        formats,
        parse,
        stringify
      };
    }
  });

  // (disabled):../../node_modules/semver/index.js
  var require_semver = __commonJS({
    "(disabled):../../node_modules/semver/index.js"() {
    }
  });

  // ../../node_modules/@linkurious/rest-client/node_modules/superagent/lib/utils.js
  var require_utils2 = __commonJS({
    "../../node_modules/@linkurious/rest-client/node_modules/superagent/lib/utils.js"(exports) {
      "use strict";
      function _createForOfIteratorHelper(o, allowArrayLike) {
        var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
        if (!it) {
          if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it)
              o = it;
            var i = 0;
            var F = function F2() {
            };
            return { s: F, n: function n() {
              if (i >= o.length)
                return { done: true };
              return { done: false, value: o[i++] };
            }, e: function e(_e) {
              throw _e;
            }, f: F };
          }
          throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        var normalCompletion = true, didErr = false, err;
        return { s: function s() {
          it = it.call(o);
        }, n: function n() {
          var step = it.next();
          normalCompletion = step.done;
          return step;
        }, e: function e(_e2) {
          didErr = true;
          err = _e2;
        }, f: function f() {
          try {
            if (!normalCompletion && it.return != null)
              it.return();
          } finally {
            if (didErr)
              throw err;
          }
        } };
      }
      function _unsupportedIterableToArray(o, minLen) {
        if (!o)
          return;
        if (typeof o === "string")
          return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor)
          n = o.constructor.name;
        if (n === "Map" || n === "Set")
          return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
          return _arrayLikeToArray(o, minLen);
      }
      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length)
          len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++)
          arr2[i] = arr[i];
        return arr2;
      }
      exports.type = (string_) => string_.split(/ *; */).shift();
      exports.params = (value) => {
        const object = {};
        var _iterator = _createForOfIteratorHelper(value.split(/ *; */)), _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            const string_ = _step.value;
            const parts = string_.split(/ *= */);
            const key = parts.shift();
            const value2 = parts.shift();
            if (key && value2)
              object[key] = value2;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return object;
      };
      exports.parseLinks = (value) => {
        const object = {};
        var _iterator2 = _createForOfIteratorHelper(value.split(/ *, */)), _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
            const string_ = _step2.value;
            const parts = string_.split(/ *; */);
            const url = parts[0].slice(1, -1);
            const rel = parts[1].split(/ *= */)[1].slice(1, -1);
            object[rel] = url;
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        return object;
      };
      exports.cleanHeader = (header, changesOrigin) => {
        delete header["content-type"];
        delete header["content-length"];
        delete header["transfer-encoding"];
        delete header.host;
        if (changesOrigin) {
          delete header.authorization;
          delete header.cookie;
        }
        return header;
      };
      exports.isObject = (object) => {
        return object !== null && typeof object === "object";
      };
      exports.hasOwn = Object.hasOwn || function(object, property) {
        if (object == null) {
          throw new TypeError("Cannot convert undefined or null to object");
        }
        return Object.prototype.hasOwnProperty.call(new Object(object), property);
      };
      exports.mixin = (target, source) => {
        for (const key in source) {
          if (exports.hasOwn(source, key)) {
            target[key] = source[key];
          }
        }
      };
    }
  });

  // ../../node_modules/@linkurious/rest-client/node_modules/superagent/lib/request-base.js
  var require_request_base = __commonJS({
    "../../node_modules/@linkurious/rest-client/node_modules/superagent/lib/request-base.js"(exports, module) {
      "use strict";
      var semver = require_semver();
      var _require = require_utils2();
      var isObject = _require.isObject;
      var hasOwn = _require.hasOwn;
      module.exports = RequestBase;
      function RequestBase() {
      }
      RequestBase.prototype.clearTimeout = function() {
        clearTimeout(this._timer);
        clearTimeout(this._responseTimeoutTimer);
        clearTimeout(this._uploadTimeoutTimer);
        delete this._timer;
        delete this._responseTimeoutTimer;
        delete this._uploadTimeoutTimer;
        return this;
      };
      RequestBase.prototype.parse = function(fn) {
        this._parser = fn;
        return this;
      };
      RequestBase.prototype.responseType = function(value) {
        this._responseType = value;
        return this;
      };
      RequestBase.prototype.serialize = function(fn) {
        this._serializer = fn;
        return this;
      };
      RequestBase.prototype.timeout = function(options) {
        if (!options || typeof options !== "object") {
          this._timeout = options;
          this._responseTimeout = 0;
          this._uploadTimeout = 0;
          return this;
        }
        for (const option in options) {
          if (hasOwn(options, option)) {
            switch (option) {
              case "deadline":
                this._timeout = options.deadline;
                break;
              case "response":
                this._responseTimeout = options.response;
                break;
              case "upload":
                this._uploadTimeout = options.upload;
                break;
              default:
                console.warn("Unknown timeout option", option);
            }
          }
        }
        return this;
      };
      RequestBase.prototype.retry = function(count, fn) {
        if (arguments.length === 0 || count === true)
          count = 1;
        if (count <= 0)
          count = 0;
        this._maxRetries = count;
        this._retries = 0;
        this._retryCallback = fn;
        return this;
      };
      var ERROR_CODES = /* @__PURE__ */ new Set(["ETIMEDOUT", "ECONNRESET", "EADDRINUSE", "ECONNREFUSED", "EPIPE", "ENOTFOUND", "ENETUNREACH", "EAI_AGAIN"]);
      var STATUS_CODES = /* @__PURE__ */ new Set([408, 413, 429, 500, 502, 503, 504, 521, 522, 524]);
      RequestBase.prototype._shouldRetry = function(error, res) {
        if (!this._maxRetries || this._retries++ >= this._maxRetries) {
          return false;
        }
        if (this._retryCallback) {
          try {
            const override = this._retryCallback(error, res);
            if (override === true)
              return true;
            if (override === false)
              return false;
          } catch (err) {
            console.error(err);
          }
        }
        if (res && res.status && STATUS_CODES.has(res.status))
          return true;
        if (error) {
          if (error.code && ERROR_CODES.has(error.code))
            return true;
          if (error.timeout && error.code === "ECONNABORTED")
            return true;
          if (error.crossDomain)
            return true;
        }
        return false;
      };
      RequestBase.prototype._retry = function() {
        this.clearTimeout();
        if (this.req) {
          this.req = null;
          this.req = this.request();
        }
        this._aborted = false;
        this.timedout = false;
        this.timedoutError = null;
        return this._end();
      };
      RequestBase.prototype.then = function(resolve, reject) {
        if (!this._fullfilledPromise) {
          const self2 = this;
          if (this._endCalled) {
            console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises");
          }
          this._fullfilledPromise = new Promise((resolve2, reject2) => {
            self2.on("abort", () => {
              if (this._maxRetries && this._maxRetries > this._retries) {
                return;
              }
              if (this.timedout && this.timedoutError) {
                reject2(this.timedoutError);
                return;
              }
              const error = new Error("Aborted");
              error.code = "ABORTED";
              error.status = this.status;
              error.method = this.method;
              error.url = this.url;
              reject2(error);
            });
            self2.end((error, res) => {
              if (error)
                reject2(error);
              else
                resolve2(res);
            });
          });
        }
        return this._fullfilledPromise.then(resolve, reject);
      };
      RequestBase.prototype.catch = function(callback) {
        return this.then(void 0, callback);
      };
      RequestBase.prototype.use = function(fn) {
        fn(this);
        return this;
      };
      RequestBase.prototype.ok = function(callback) {
        if (typeof callback !== "function")
          throw new Error("Callback required");
        this._okCallback = callback;
        return this;
      };
      RequestBase.prototype._isResponseOK = function(res) {
        if (!res) {
          return false;
        }
        if (this._okCallback) {
          return this._okCallback(res);
        }
        return res.status >= 200 && res.status < 300;
      };
      RequestBase.prototype.get = function(field) {
        return this._header[field.toLowerCase()];
      };
      RequestBase.prototype.getHeader = RequestBase.prototype.get;
      RequestBase.prototype.set = function(field, value) {
        if (isObject(field)) {
          for (const key in field) {
            if (hasOwn(field, key))
              this.set(key, field[key]);
          }
          return this;
        }
        this._header[field.toLowerCase()] = value;
        this.header[field] = value;
        return this;
      };
      RequestBase.prototype.unset = function(field) {
        delete this._header[field.toLowerCase()];
        delete this.header[field];
        return this;
      };
      RequestBase.prototype.field = function(name, value, options) {
        if (name === null || void 0 === name) {
          throw new Error(".field(name, val) name can not be empty");
        }
        if (this._data) {
          throw new Error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
        }
        if (isObject(name)) {
          for (const key in name) {
            if (hasOwn(name, key))
              this.field(key, name[key]);
          }
          return this;
        }
        if (Array.isArray(value)) {
          for (const i in value) {
            if (hasOwn(value, i))
              this.field(name, value[i]);
          }
          return this;
        }
        if (value === null || void 0 === value) {
          throw new Error(".field(name, val) val can not be empty");
        }
        if (typeof value === "boolean") {
          value = String(value);
        }
        if (options)
          this._getFormData().append(name, value, options);
        else
          this._getFormData().append(name, value);
        return this;
      };
      RequestBase.prototype.abort = function() {
        if (this._aborted) {
          return this;
        }
        this._aborted = true;
        if (this.xhr)
          this.xhr.abort();
        if (this.req) {
          if (semver.gte(process.version, "v13.0.0") && semver.lt(process.version, "v14.0.0")) {
            throw new Error("Superagent does not work in v13 properly with abort() due to Node.js core changes");
          }
          this.req.abort();
        }
        this.clearTimeout();
        this.emit("abort");
        return this;
      };
      RequestBase.prototype._auth = function(user, pass, options, base64Encoder) {
        switch (options.type) {
          case "basic":
            this.set("Authorization", `Basic ${base64Encoder(`${user}:${pass}`)}`);
            break;
          case "auto":
            this.username = user;
            this.password = pass;
            break;
          case "bearer":
            this.set("Authorization", `Bearer ${user}`);
            break;
          default:
            break;
        }
        return this;
      };
      RequestBase.prototype.withCredentials = function(on) {
        if (on === void 0)
          on = true;
        this._withCredentials = on;
        return this;
      };
      RequestBase.prototype.redirects = function(n) {
        this._maxRedirects = n;
        return this;
      };
      RequestBase.prototype.maxResponseSize = function(n) {
        if (typeof n !== "number") {
          throw new TypeError("Invalid argument");
        }
        this._maxResponseSize = n;
        return this;
      };
      RequestBase.prototype.toJSON = function() {
        return {
          method: this.method,
          url: this.url,
          data: this._data,
          headers: this._header
        };
      };
      RequestBase.prototype.send = function(data) {
        const isObject_ = isObject(data);
        let type = this._header["content-type"];
        if (this._formData) {
          throw new Error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
        }
        if (isObject_ && !this._data) {
          if (Array.isArray(data)) {
            this._data = [];
          } else if (!this._isHost(data)) {
            this._data = {};
          }
        } else if (data && this._data && this._isHost(this._data)) {
          throw new Error("Can't merge these send calls");
        }
        if (isObject_ && isObject(this._data)) {
          for (const key in data) {
            if (typeof data[key] == "bigint" && !data[key].toJSON)
              throw new Error("Cannot serialize BigInt value to json");
            if (hasOwn(data, key))
              this._data[key] = data[key];
          }
        } else if (typeof data === "bigint")
          throw new Error("Cannot send value of type BigInt");
        else if (typeof data === "string") {
          if (!type)
            this.type("form");
          type = this._header["content-type"];
          if (type)
            type = type.toLowerCase().trim();
          if (type === "application/x-www-form-urlencoded") {
            this._data = this._data ? `${this._data}&${data}` : data;
          } else {
            this._data = (this._data || "") + data;
          }
        } else {
          this._data = data;
        }
        if (!isObject_ || this._isHost(data)) {
          return this;
        }
        if (!type)
          this.type("json");
        return this;
      };
      RequestBase.prototype.sortQuery = function(sort) {
        this._sort = typeof sort === "undefined" ? true : sort;
        return this;
      };
      RequestBase.prototype._finalizeQueryString = function() {
        const query = this._query.join("&");
        if (query) {
          this.url += (this.url.includes("?") ? "&" : "?") + query;
        }
        this._query.length = 0;
        if (this._sort) {
          const index = this.url.indexOf("?");
          if (index >= 0) {
            const queryArray = this.url.slice(index + 1).split("&");
            if (typeof this._sort === "function") {
              queryArray.sort(this._sort);
            } else {
              queryArray.sort();
            }
            this.url = this.url.slice(0, index) + "?" + queryArray.join("&");
          }
        }
      };
      RequestBase.prototype._appendQueryString = () => {
        console.warn("Unsupported");
      };
      RequestBase.prototype._timeoutError = function(reason, timeout, errno) {
        if (this._aborted) {
          return;
        }
        const error = new Error(`${reason + timeout}ms exceeded`);
        error.timeout = timeout;
        error.code = "ECONNABORTED";
        error.errno = errno;
        this.timedout = true;
        this.timedoutError = error;
        this.abort();
        this.callback(error);
      };
      RequestBase.prototype._setTimeouts = function() {
        const self2 = this;
        if (this._timeout && !this._timer) {
          this._timer = setTimeout(() => {
            self2._timeoutError("Timeout of ", self2._timeout, "ETIME");
          }, this._timeout);
        }
        if (this._responseTimeout && !this._responseTimeoutTimer) {
          this._responseTimeoutTimer = setTimeout(() => {
            self2._timeoutError("Response timeout of ", self2._responseTimeout, "ETIMEDOUT");
          }, this._responseTimeout);
        }
      };
    }
  });

  // ../../node_modules/@linkurious/rest-client/node_modules/superagent/lib/response-base.js
  var require_response_base = __commonJS({
    "../../node_modules/@linkurious/rest-client/node_modules/superagent/lib/response-base.js"(exports, module) {
      "use strict";
      var utils = require_utils2();
      module.exports = ResponseBase;
      function ResponseBase() {
      }
      ResponseBase.prototype.get = function(field) {
        return this.header[field.toLowerCase()];
      };
      ResponseBase.prototype._setHeaderProperties = function(header) {
        const ct = header["content-type"] || "";
        this.type = utils.type(ct);
        const parameters = utils.params(ct);
        for (const key in parameters) {
          if (Object.prototype.hasOwnProperty.call(parameters, key))
            this[key] = parameters[key];
        }
        this.links = {};
        try {
          if (header.link) {
            this.links = utils.parseLinks(header.link);
          }
        } catch (err) {
        }
      };
      ResponseBase.prototype._setStatusProperties = function(status) {
        const type = Math.trunc(status / 100);
        this.statusCode = status;
        this.status = this.statusCode;
        this.statusType = type;
        this.info = type === 1;
        this.ok = type === 2;
        this.redirect = type === 3;
        this.clientError = type === 4;
        this.serverError = type === 5;
        this.error = type === 4 || type === 5 ? this.toError() : false;
        this.created = status === 201;
        this.accepted = status === 202;
        this.noContent = status === 204;
        this.badRequest = status === 400;
        this.unauthorized = status === 401;
        this.notAcceptable = status === 406;
        this.forbidden = status === 403;
        this.notFound = status === 404;
        this.unprocessableEntity = status === 422;
      };
    }
  });

  // ../../node_modules/@linkurious/rest-client/node_modules/superagent/lib/agent-base.js
  var require_agent_base = __commonJS({
    "../../node_modules/@linkurious/rest-client/node_modules/superagent/lib/agent-base.js"(exports, module) {
      "use strict";
      function _createForOfIteratorHelper(o, allowArrayLike) {
        var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
        if (!it) {
          if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it)
              o = it;
            var i = 0;
            var F = function F2() {
            };
            return { s: F, n: function n() {
              if (i >= o.length)
                return { done: true };
              return { done: false, value: o[i++] };
            }, e: function e(_e) {
              throw _e;
            }, f: F };
          }
          throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        var normalCompletion = true, didErr = false, err;
        return { s: function s() {
          it = it.call(o);
        }, n: function n() {
          var step = it.next();
          normalCompletion = step.done;
          return step;
        }, e: function e(_e2) {
          didErr = true;
          err = _e2;
        }, f: function f() {
          try {
            if (!normalCompletion && it.return != null)
              it.return();
          } finally {
            if (didErr)
              throw err;
          }
        } };
      }
      function _unsupportedIterableToArray(o, minLen) {
        if (!o)
          return;
        if (typeof o === "string")
          return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor)
          n = o.constructor.name;
        if (n === "Map" || n === "Set")
          return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
          return _arrayLikeToArray(o, minLen);
      }
      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length)
          len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++)
          arr2[i] = arr[i];
        return arr2;
      }
      function Agent() {
        this._defaults = [];
      }
      for (_i = 0, _arr = ["use", "on", "once", "set", "query", "type", "accept", "auth", "withCredentials", "sortQuery", "retry", "ok", "redirects", "timeout", "buffer", "serialize", "parse", "ca", "key", "pfx", "cert", "disableTLSCerts"]; _i < _arr.length; _i++) {
        const fn = _arr[_i];
        Agent.prototype[fn] = function() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          this._defaults.push({
            fn,
            args
          });
          return this;
        };
      }
      var _i;
      var _arr;
      Agent.prototype._setDefaults = function(request) {
        var _iterator = _createForOfIteratorHelper(this._defaults), _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            const def = _step.value;
            request[def.fn](...def.args);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      };
      module.exports = Agent;
    }
  });

  // ../../node_modules/@linkurious/rest-client/node_modules/superagent/lib/client.js
  var require_client = __commonJS({
    "../../node_modules/@linkurious/rest-client/node_modules/superagent/lib/client.js"(exports, module) {
      "use strict";
      function _createForOfIteratorHelper(o, allowArrayLike) {
        var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
        if (!it) {
          if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it)
              o = it;
            var i = 0;
            var F = function F2() {
            };
            return { s: F, n: function n() {
              if (i >= o.length)
                return { done: true };
              return { done: false, value: o[i++] };
            }, e: function e(_e) {
              throw _e;
            }, f: F };
          }
          throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        var normalCompletion = true, didErr = false, err;
        return { s: function s() {
          it = it.call(o);
        }, n: function n() {
          var step = it.next();
          normalCompletion = step.done;
          return step;
        }, e: function e(_e2) {
          didErr = true;
          err = _e2;
        }, f: function f() {
          try {
            if (!normalCompletion && it.return != null)
              it.return();
          } finally {
            if (didErr)
              throw err;
          }
        } };
      }
      function _unsupportedIterableToArray(o, minLen) {
        if (!o)
          return;
        if (typeof o === "string")
          return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor)
          n = o.constructor.name;
        if (n === "Map" || n === "Set")
          return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
          return _arrayLikeToArray(o, minLen);
      }
      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length)
          len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++)
          arr2[i] = arr[i];
        return arr2;
      }
      var root;
      if (typeof window !== "undefined") {
        root = window;
      } else if (typeof self === "undefined") {
        console.warn("Using browser-only version of superagent in non-browser environment");
        root = void 0;
      } else {
        root = self;
      }
      var Emitter = require_component_emitter();
      var safeStringify = require_fast_safe_stringify();
      var qs = require_lib();
      var RequestBase = require_request_base();
      var _require = require_utils2();
      var isObject = _require.isObject;
      var mixin = _require.mixin;
      var hasOwn = _require.hasOwn;
      var ResponseBase = require_response_base();
      var Agent = require_agent_base();
      function noop() {
      }
      module.exports = function(method, url) {
        if (typeof url === "function") {
          return new exports.Request("GET", method).end(url);
        }
        if (arguments.length === 1) {
          return new exports.Request("GET", method);
        }
        return new exports.Request(method, url);
      };
      exports = module.exports;
      var request = exports;
      exports.Request = Request;
      request.getXHR = () => {
        if (root.XMLHttpRequest) {
          return new root.XMLHttpRequest();
        }
        throw new Error("Browser-only version of superagent could not find XHR");
      };
      var trim = "".trim ? (s) => s.trim() : (s) => s.replace(/(^\s*|\s*$)/g, "");
      function serialize(object) {
        if (!isObject(object))
          return object;
        const pairs = [];
        for (const key in object) {
          if (hasOwn(object, key))
            pushEncodedKeyValuePair(pairs, key, object[key]);
        }
        return pairs.join("&");
      }
      function pushEncodedKeyValuePair(pairs, key, value) {
        if (value === void 0)
          return;
        if (value === null) {
          pairs.push(encodeURI(key));
          return;
        }
        if (Array.isArray(value)) {
          var _iterator = _createForOfIteratorHelper(value), _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done; ) {
              const v = _step.value;
              pushEncodedKeyValuePair(pairs, key, v);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        } else if (isObject(value)) {
          for (const subkey in value) {
            if (hasOwn(value, subkey))
              pushEncodedKeyValuePair(pairs, `${key}[${subkey}]`, value[subkey]);
          }
        } else {
          pairs.push(encodeURI(key) + "=" + encodeURIComponent(value));
        }
      }
      request.serializeObject = serialize;
      function parseString(string_) {
        const object = {};
        const pairs = string_.split("&");
        let pair;
        let pos;
        for (let i = 0, length_ = pairs.length; i < length_; ++i) {
          pair = pairs[i];
          pos = pair.indexOf("=");
          if (pos === -1) {
            object[decodeURIComponent(pair)] = "";
          } else {
            object[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
          }
        }
        return object;
      }
      request.parseString = parseString;
      request.types = {
        html: "text/html",
        json: "application/json",
        xml: "text/xml",
        urlencoded: "application/x-www-form-urlencoded",
        form: "application/x-www-form-urlencoded",
        "form-data": "application/x-www-form-urlencoded"
      };
      request.serialize = {
        "application/x-www-form-urlencoded": qs.stringify,
        "application/json": safeStringify
      };
      request.parse = {
        "application/x-www-form-urlencoded": parseString,
        "application/json": JSON.parse
      };
      function parseHeader(string_) {
        const lines = string_.split(/\r?\n/);
        const fields = {};
        let index;
        let line;
        let field;
        let value;
        for (let i = 0, length_ = lines.length; i < length_; ++i) {
          line = lines[i];
          index = line.indexOf(":");
          if (index === -1) {
            continue;
          }
          field = line.slice(0, index).toLowerCase();
          value = trim(line.slice(index + 1));
          fields[field] = value;
        }
        return fields;
      }
      function isJSON(mime) {
        return /[/+]json($|[^-\w])/i.test(mime);
      }
      function Response(request_) {
        this.req = request_;
        this.xhr = this.req.xhr;
        this.text = this.req.method !== "HEAD" && (this.xhr.responseType === "" || this.xhr.responseType === "text") || typeof this.xhr.responseType === "undefined" ? this.xhr.responseText : null;
        this.statusText = this.req.xhr.statusText;
        let status = this.xhr.status;
        if (status === 1223) {
          status = 204;
        }
        this._setStatusProperties(status);
        this.headers = parseHeader(this.xhr.getAllResponseHeaders());
        this.header = this.headers;
        this.header["content-type"] = this.xhr.getResponseHeader("content-type");
        this._setHeaderProperties(this.header);
        if (this.text === null && request_._responseType) {
          this.body = this.xhr.response;
        } else {
          this.body = this.req.method === "HEAD" ? null : this._parseBody(this.text ? this.text : this.xhr.response);
        }
      }
      mixin(Response.prototype, ResponseBase.prototype);
      Response.prototype._parseBody = function(string_) {
        let parse = request.parse[this.type];
        if (this.req._parser) {
          return this.req._parser(this, string_);
        }
        if (!parse && isJSON(this.type)) {
          parse = request.parse["application/json"];
        }
        return parse && string_ && (string_.length > 0 || string_ instanceof Object) ? parse(string_) : null;
      };
      Response.prototype.toError = function() {
        const req = this.req;
        const method = req.method;
        const url = req.url;
        const message = `cannot ${method} ${url} (${this.status})`;
        const error = new Error(message);
        error.status = this.status;
        error.method = method;
        error.url = url;
        return error;
      };
      request.Response = Response;
      function Request(method, url) {
        const self2 = this;
        this._query = this._query || [];
        this.method = method;
        this.url = url;
        this.header = {};
        this._header = {};
        this.on("end", () => {
          let error = null;
          let res = null;
          try {
            res = new Response(self2);
          } catch (err) {
            error = new Error("Parser is unable to parse the response");
            error.parse = true;
            error.original = err;
            if (self2.xhr) {
              error.rawResponse = typeof self2.xhr.responseType === "undefined" ? self2.xhr.responseText : self2.xhr.response;
              error.status = self2.xhr.status ? self2.xhr.status : null;
              error.statusCode = error.status;
            } else {
              error.rawResponse = null;
              error.status = null;
            }
            return self2.callback(error);
          }
          self2.emit("response", res);
          let new_error;
          try {
            if (!self2._isResponseOK(res)) {
              new_error = new Error(res.statusText || res.text || "Unsuccessful HTTP response");
            }
          } catch (err) {
            new_error = err;
          }
          if (new_error) {
            new_error.original = error;
            new_error.response = res;
            new_error.status = new_error.status || res.status;
            self2.callback(new_error, res);
          } else {
            self2.callback(null, res);
          }
        });
      }
      Emitter(Request.prototype);
      mixin(Request.prototype, RequestBase.prototype);
      Request.prototype.type = function(type) {
        this.set("Content-Type", request.types[type] || type);
        return this;
      };
      Request.prototype.accept = function(type) {
        this.set("Accept", request.types[type] || type);
        return this;
      };
      Request.prototype.auth = function(user, pass, options) {
        if (arguments.length === 1)
          pass = "";
        if (typeof pass === "object" && pass !== null) {
          options = pass;
          pass = "";
        }
        if (!options) {
          options = {
            type: typeof btoa === "function" ? "basic" : "auto"
          };
        }
        const encoder = options.encoder ? options.encoder : (string) => {
          if (typeof btoa === "function") {
            return btoa(string);
          }
          throw new Error("Cannot use basic auth, btoa is not a function");
        };
        return this._auth(user, pass, options, encoder);
      };
      Request.prototype.query = function(value) {
        if (typeof value !== "string")
          value = serialize(value);
        if (value)
          this._query.push(value);
        return this;
      };
      Request.prototype.attach = function(field, file, options) {
        if (file) {
          if (this._data) {
            throw new Error("superagent can't mix .send() and .attach()");
          }
          this._getFormData().append(field, file, options || file.name);
        }
        return this;
      };
      Request.prototype._getFormData = function() {
        if (!this._formData) {
          this._formData = new root.FormData();
        }
        return this._formData;
      };
      Request.prototype.callback = function(error, res) {
        if (this._shouldRetry(error, res)) {
          return this._retry();
        }
        const fn = this._callback;
        this.clearTimeout();
        if (error) {
          if (this._maxRetries)
            error.retries = this._retries - 1;
          this.emit("error", error);
        }
        fn(error, res);
      };
      Request.prototype.crossDomainError = function() {
        const error = new Error("Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.");
        error.crossDomain = true;
        error.status = this.status;
        error.method = this.method;
        error.url = this.url;
        this.callback(error);
      };
      Request.prototype.agent = function() {
        console.warn("This is not supported in browser version of superagent");
        return this;
      };
      Request.prototype.ca = Request.prototype.agent;
      Request.prototype.buffer = Request.prototype.ca;
      Request.prototype.write = () => {
        throw new Error("Streaming is not supported in browser version of superagent");
      };
      Request.prototype.pipe = Request.prototype.write;
      Request.prototype._isHost = function(object) {
        return object && typeof object === "object" && !Array.isArray(object) && Object.prototype.toString.call(object) !== "[object Object]";
      };
      Request.prototype.end = function(fn) {
        if (this._endCalled) {
          console.warn("Warning: .end() was called twice. This is not supported in superagent");
        }
        this._endCalled = true;
        this._callback = fn || noop;
        this._finalizeQueryString();
        this._end();
      };
      Request.prototype._setUploadTimeout = function() {
        const self2 = this;
        if (this._uploadTimeout && !this._uploadTimeoutTimer) {
          this._uploadTimeoutTimer = setTimeout(() => {
            self2._timeoutError("Upload timeout of ", self2._uploadTimeout, "ETIMEDOUT");
          }, this._uploadTimeout);
        }
      };
      Request.prototype._end = function() {
        if (this._aborted)
          return this.callback(new Error("The request has been aborted even before .end() was called"));
        const self2 = this;
        this.xhr = request.getXHR();
        const xhr = this.xhr;
        let data = this._formData || this._data;
        this._setTimeouts();
        xhr.addEventListener("readystatechange", () => {
          const readyState = xhr.readyState;
          if (readyState >= 2 && self2._responseTimeoutTimer) {
            clearTimeout(self2._responseTimeoutTimer);
          }
          if (readyState !== 4) {
            return;
          }
          let status;
          try {
            status = xhr.status;
          } catch (err) {
            status = 0;
          }
          if (!status) {
            if (self2.timedout || self2._aborted)
              return;
            return self2.crossDomainError();
          }
          self2.emit("end");
        });
        const handleProgress = (direction, e) => {
          if (e.total > 0) {
            e.percent = e.loaded / e.total * 100;
            if (e.percent === 100) {
              clearTimeout(self2._uploadTimeoutTimer);
            }
          }
          e.direction = direction;
          self2.emit("progress", e);
        };
        if (this.hasListeners("progress")) {
          try {
            xhr.addEventListener("progress", handleProgress.bind(null, "download"));
            if (xhr.upload) {
              xhr.upload.addEventListener("progress", handleProgress.bind(null, "upload"));
            }
          } catch (err) {
          }
        }
        if (xhr.upload) {
          this._setUploadTimeout();
        }
        try {
          if (this.username && this.password) {
            xhr.open(this.method, this.url, true, this.username, this.password);
          } else {
            xhr.open(this.method, this.url, true);
          }
        } catch (err) {
          return this.callback(err);
        }
        if (this._withCredentials)
          xhr.withCredentials = true;
        if (!this._formData && this.method !== "GET" && this.method !== "HEAD" && typeof data !== "string" && !this._isHost(data)) {
          const contentType = this._header["content-type"];
          let serialize2 = this._serializer || request.serialize[contentType ? contentType.split(";")[0] : ""];
          if (!serialize2 && isJSON(contentType)) {
            serialize2 = request.serialize["application/json"];
          }
          if (serialize2)
            data = serialize2(data);
        }
        for (const field in this.header) {
          if (this.header[field] === null)
            continue;
          if (hasOwn(this.header, field))
            xhr.setRequestHeader(field, this.header[field]);
        }
        if (this._responseType) {
          xhr.responseType = this._responseType;
        }
        this.emit("request", this);
        xhr.send(typeof data === "undefined" ? null : data);
      };
      request.agent = () => new Agent();
      for (_i = 0, _arr = ["GET", "POST", "OPTIONS", "PATCH", "PUT", "DELETE"]; _i < _arr.length; _i++) {
        const method = _arr[_i];
        Agent.prototype[method.toLowerCase()] = function(url, fn) {
          const request_ = new request.Request(method, url);
          this._setDefaults(request_);
          if (fn) {
            request_.end(fn);
          }
          return request_;
        };
      }
      var _i;
      var _arr;
      Agent.prototype.del = Agent.prototype.delete;
      request.get = (url, data, fn) => {
        const request_ = request("GET", url);
        if (typeof data === "function") {
          fn = data;
          data = null;
        }
        if (data)
          request_.query(data);
        if (fn)
          request_.end(fn);
        return request_;
      };
      request.head = (url, data, fn) => {
        const request_ = request("HEAD", url);
        if (typeof data === "function") {
          fn = data;
          data = null;
        }
        if (data)
          request_.query(data);
        if (fn)
          request_.end(fn);
        return request_;
      };
      request.options = (url, data, fn) => {
        const request_ = request("OPTIONS", url);
        if (typeof data === "function") {
          fn = data;
          data = null;
        }
        if (data)
          request_.send(data);
        if (fn)
          request_.end(fn);
        return request_;
      };
      function del(url, data, fn) {
        const request_ = request("DELETE", url);
        if (typeof data === "function") {
          fn = data;
          data = null;
        }
        if (data)
          request_.send(data);
        if (fn)
          request_.end(fn);
        return request_;
      }
      request.del = del;
      request.delete = del;
      request.patch = (url, data, fn) => {
        const request_ = request("PATCH", url);
        if (typeof data === "function") {
          fn = data;
          data = null;
        }
        if (data)
          request_.send(data);
        if (fn)
          request_.end(fn);
        return request_;
      };
      request.post = (url, data, fn) => {
        const request_ = request("POST", url);
        if (typeof data === "function") {
          fn = data;
          data = null;
        }
        if (data)
          request_.send(data);
        if (fn)
          request_.end(fn);
        return request_;
      };
      request.put = (url, data, fn) => {
        const request_ = request("PUT", url);
        if (typeof data === "function") {
          fn = data;
          data = null;
        }
        if (data)
          request_.send(data);
        if (fn)
          request_.end(fn);
        return request_;
      };
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/errorListener.js
  var require_errorListener = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/errorListener.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ErrorListener = exports.UnexpectedServerError = void 0;
      var UnexpectedServerError = (
        /** @class */
        function(_super) {
          __extends(UnexpectedServerError2, _super);
          function UnexpectedServerError2(originalResponse) {
            var _this = _super.call(this, "Unexpected error: ".concat(JSON.stringify(originalResponse.body))) || this;
            _this.originalResponse = originalResponse;
            return _this;
          }
          return UnexpectedServerError2;
        }(Error)
      );
      exports.UnexpectedServerError = UnexpectedServerError;
      var ErrorListener = (
        /** @class */
        function() {
          function ErrorListener2() {
            this.listeners = {};
          }
          ErrorListener2.prototype.dispatchError = function(key, payload) {
            if (Object.prototype.hasOwnProperty.call(this.listeners, key) && typeof this.listeners[key] === "function") {
              this.listeners[key](payload);
            }
          };
          ErrorListener2.prototype.setErrorListener = function(key, callback) {
            this.listeners[key] = callback;
          };
          ErrorListener2.prototype.removeErrorListener = function(key) {
            delete this.listeners[key];
          };
          ErrorListener2.prototype.getErrorKeysListened = function() {
            return Object.keys(this.listeners);
          };
          return ErrorListener2;
        }()
      );
      exports.ErrorListener = ErrorListener;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/utils.js
  var require_utils3 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.hasValue = exports.endsWith = exports.find = exports.includes = void 0;
      function includes(array, element) {
        return array.indexOf(element) !== -1;
      }
      exports.includes = includes;
      function find(array, predicate) {
        for (var i = 0; i < array.length; i++) {
          if (predicate(array[i])) {
            return array[i];
          }
        }
        return void 0;
      }
      exports.find = find;
      function endsWith(str, search) {
        return str.substring(str.length - search.length, str.length) === search;
      }
      exports.endsWith = endsWith;
      function hasValue(o) {
        return o !== void 0 && o !== null;
      }
      exports.hasValue = hasValue;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/http/response.js
  var require_response = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/http/response.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.UnauthorizedErrorReason = exports.Response = exports.LkErrorKey = void 0;
      var utils_1 = require_utils3();
      var LkErrorKey;
      (function(LkErrorKey2) {
        LkErrorKey2["CONNECTION_REFUSED"] = "connection_refused";
        LkErrorKey2["FEATURE_DISABLED"] = "feature_disabled";
        LkErrorKey2["UNAUTHORIZED"] = "unauthorized";
        LkErrorKey2["DATA_SOURCE_UNAVAILABLE"] = "dataSource_unavailable";
        LkErrorKey2["GUEST_DISABLED"] = "guest_disabled";
        LkErrorKey2["FORBIDDEN"] = "forbidden";
        LkErrorKey2["NOT_FOUND"] = "not_found";
        LkErrorKey2["BAD_GRAPH_REQUEST"] = "bad_graph_request";
        LkErrorKey2["GRAPH_REQUEST_TIMEOUT"] = "graph_request_timeout";
        LkErrorKey2["CONSTRAINT_VIOLATION"] = "constraint_violation";
        LkErrorKey2["MALFORMED_CUSTOM_ACTION_TEMPLATE"] = "malformed_custom_action_template";
        LkErrorKey2["MALFORMED_QUERY_TEMPLATE"] = "malformed_query_template";
        LkErrorKey2["MALFORMED_SEARCH_SYNTAX"] = "malformed_search_syntax";
        LkErrorKey2["INVALID_LICENSE"] = "invalid_license";
        LkErrorKey2["INVALID_ALERT_QUERY"] = "invalid_alert_query";
        LkErrorKey2["INVALID_ALERT_TARGET"] = "invalid_alert_target";
        LkErrorKey2["ILLEGAL_SOURCE_STATE"] = "illegal_source_state";
        LkErrorKey2["FOLDER_DELETION_FAILED"] = "folder_deletion_failed";
        LkErrorKey2["ALREADY_EXISTS"] = "already_exists";
        LkErrorKey2["STRICT_SCHEMA_REQUIRED"] = "strict_schema_required";
        LkErrorKey2["PROPERTY_KEY_ACCESS_RIGHTS_REQUIRED"] = "property_key_access_rights_required";
        LkErrorKey2["INVALID_PROPERTY_KEY_ACCESS_LEVEL"] = "invalid_property_key_access_level";
        LkErrorKey2["EDIT_CONFLICT"] = "edit_conflict";
        LkErrorKey2["VISUALIZATION_LOCKED"] = "visualization_locked";
        LkErrorKey2["NOT_SUPPORTED"] = "not_supported";
        LkErrorKey2["SOURCE_ACTION_NEEDED"] = "source_action_needed";
        LkErrorKey2["MISSING_SEARCH_ENTITIES"] = "missing_search_entities";
        LkErrorKey2["SEARCH_DISABLED"] = "search_disabled";
        LkErrorKey2["REDUNDANT_ACTION"] = "redundant_action";
        LkErrorKey2["INVALID_PARAMETER"] = "invalid_parameter";
        LkErrorKey2["CRITICAL"] = "critical";
        LkErrorKey2["BUG"] = "bug";
        LkErrorKey2["SOCKET_ERROR"] = "socket_error";
        LkErrorKey2["API_NOT_FOUND"] = "api_not_found";
        LkErrorKey2["PLUGIN_NOT_READY"] = "plugin_not_ready";
        LkErrorKey2["PLUGIN_SERVICE_NOT_READY"] = "plugin_service_not_ready";
        LkErrorKey2["INVALID_CONFIGURATION"] = "invalid_configuration";
        LkErrorKey2["EMAIL_FORMAT"] = "email_format";
        LkErrorKey2["NOT_IMPLEMENTED"] = "not_implemented";
        LkErrorKey2["SEND_MAIL_FAILED"] = "send_mail_failed";
        LkErrorKey2["CASES_EXTRACT_LIMIT_EXCEEDED"] = "cases_extract_limit_exceeded";
        LkErrorKey2["INVALID_CASE_ATTRIBUTES_QUERY"] = "invalid_case_attributes_query";
        LkErrorKey2["SPACE_DELETION_FAILED"] = "space_deletion_failed";
        LkErrorKey2["INVALID_PARENT_FOLDER"] = "invalid_parent_folder";
      })(LkErrorKey = exports.LkErrorKey || (exports.LkErrorKey = {}));
      var Response = (
        /** @class */
        function() {
          function Response2(options) {
            this.body = options.body;
            this.status = options.status || 0;
            this.header = options.header || {};
          }
          Response2.prototype.isSuccess = function() {
            return this.status >= 200 && this.status < 300;
          };
          Response2.prototype.isError = function(key) {
            return (0, utils_1.hasValue)(this.body) && this.body.key === key;
          };
          return Response2;
        }()
      );
      exports.Response = Response;
      var UnauthorizedErrorReason;
      (function(UnauthorizedErrorReason2) {
        UnauthorizedErrorReason2["LICENSE_MISSING"] = "license_missing";
        UnauthorizedErrorReason2["SESSION_EXPIRED"] = "session_expired";
        UnauthorizedErrorReason2["SESSION_EVICTED"] = "session_evicted";
        UnauthorizedErrorReason2["SERVER_FULL"] = "server_full";
      })(UnauthorizedErrorReason = exports.UnauthorizedErrorReason || (exports.UnauthorizedErrorReason = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/http/request.js
  var require_request = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/http/request.js"(exports) {
      "use strict";
      var __assign = exports && exports.__assign || function() {
        __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
              if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
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
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      var __generator = exports && exports.__generator || function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1)
            throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f)
            throw new TypeError("Generator is already executing.");
          while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                return t;
              if (y = 0, t)
                op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return { value: op[1], done: false };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2])
                    _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5)
            throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Request = void 0;
      var errorListener_1 = require_errorListener();
      var utils_1 = require_utils3();
      var response_1 = require_response();
      var Request = (
        /** @class */
        function() {
          function Request2(props) {
            this.props = props;
          }
          Request2.renderURL = function(config, moduleProps) {
            var configParams = config.params ? __assign({}, config.params) : {};
            var renderedURL = config.url;
            var regexp = /:[^/]+/g;
            var match;
            while ((match = regexp.exec(config.url)) !== null) {
              var key = match[0].substring(1);
              var paramValue = void 0;
              if (key === "sourceKey" && moduleProps.clientState.currentSource) {
                if ((0, utils_1.hasValue)(configParams["sourceKey"]) && typeof configParams["sourceKey"] === "string") {
                  paramValue = configParams["sourceKey"];
                } else if (moduleProps.clientState.currentSource.key) {
                  paramValue = moduleProps.clientState.currentSource.key;
                } else {
                  throw {
                    key: response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE,
                    message: 'Current source "'.concat(moduleProps.clientState.currentSource.name, '" is not ready.')
                  };
                }
              }
              if ((0, utils_1.hasValue)(configParams[key])) {
                paramValue = configParams[key];
                delete configParams[key];
              }
              if ((0, utils_1.hasValue)(paramValue)) {
                renderedURL = renderedURL.replace(":" + key, encodeURIComponent(paramValue));
              } else {
                throw new Error('Request::renderURL - You need to set "'.concat(key, '" to fetch this API (').concat(renderedURL, ")."));
              }
            }
            return {
              errors: config.errors || [],
              url: renderedURL,
              method: config.method,
              params: configParams
            };
          };
          Request2.toSnakeCaseKeys = function(obj) {
            var result = {};
            for (var key in obj) {
              var fixedKey = key.replace(/(^[A-Z])/, function(first) {
                return first.toLowerCase();
              }).replace(/([A-Z])/g, function(letter) {
                return "_".concat(letter.toLowerCase());
              });
              result[fixedKey] = obj[key];
            }
            return result;
          };
          Request2.splitParams = function(config, moduleProps) {
            var body;
            var query = {
              _: Date.now(),
              guest: moduleProps.clientState.guestMode ? true : void 0
            };
            if ((0, utils_1.includes)(["GET", "DELETE"], config.method)) {
              query = __assign(__assign({}, query), config.params);
            } else {
              body = config.params;
            }
            return {
              method: config.method,
              url: moduleProps.baseUrl + config.url,
              body,
              query: Request2.toSnakeCaseKeys(query)
            };
          };
          Request2.prototype.sendBeacon = function(rawFetchConfig) {
            return __awaiter(this, void 0, void 0, function() {
              var requiredConfig, fetchConfig;
              return __generator(this, function(_a) {
                requiredConfig = Request2.renderURL(rawFetchConfig, this.props);
                fetchConfig = Request2.splitParams(requiredConfig, this.props);
                navigator.sendBeacon(fetchConfig.url);
                return [
                  2
                  /*return*/
                ];
              });
            });
          };
          Request2.prototype.request = function(rawFetchConfig) {
            var _a;
            return __awaiter(this, void 0, void 0, function() {
              var requiredConfig, fetchConfig, response, ex_1, error;
              return __generator(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    try {
                      requiredConfig = Request2.renderURL(rawFetchConfig, this.props);
                    } catch (error2) {
                      if (this.isDataSourceUnavailableError(error2)) {
                        this.props.dispatchError(error2.key, error2);
                        return [2, new response_1.Response({ body: error2 })];
                      } else {
                        throw error2;
                      }
                    }
                    fetchConfig = Request2.splitParams(requiredConfig, this.props);
                    _b.label = 1;
                  case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4, this.props.agent[fetchConfig.method.toLowerCase()](fetchConfig.url).ok(function(res) {
                      return res.status < 500;
                    }).withCredentials().send(fetchConfig.body).query(fetchConfig.query)];
                  case 2:
                    response = _b.sent();
                    return [3, 4];
                  case 3:
                    ex_1 = _b.sent();
                    if (!this.hasResponse(ex_1)) {
                      error = {
                        key: response_1.LkErrorKey.CONNECTION_REFUSED,
                        message: "offline",
                        fetchConfig
                      };
                      this.props.dispatchError(error.key, error);
                      return [2, new response_1.Response({ body: error })];
                    }
                    throw new Error("Internal server error: " + JSON.stringify(ex_1.response.body));
                  case 4:
                    if (response.body && (0, utils_1.includes)(requiredConfig.errors, response.body.key)) {
                      this.props.dispatchError(response.body.key, response.body);
                      return [2, new response_1.Response({
                        status: response.status,
                        header: response.header,
                        body: response.body
                      })];
                    } else if ((response.status < 200 || response.status >= 300) && ((_a = response.body) === null || _a === void 0 ? void 0 : _a.key)) {
                      throw new errorListener_1.UnexpectedServerError(response);
                    }
                    if (!(0, utils_1.includes)([200, 201, 204], response.status)) {
                      throw new Error('Unexpected status code "'.concat(response.status, '": ').concat(JSON.stringify(response.body)));
                    }
                    return [2, new response_1.Response({
                      status: response.status,
                      header: response.header,
                      body: response.body
                    })];
                }
              });
            });
          };
          Request2.prototype.isDataSourceUnavailableError = function(error) {
            return error.key !== void 0 && error.key === response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
          };
          Request2.prototype.hasResponse = function(error) {
            return error.response !== void 0;
          };
          return Request2;
        }()
      );
      exports.Request = Request;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/AccessRight/types.js
  var require_types = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/AccessRight/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.TargetType = exports.AlertAccessRightType = exports.ActionAccessRightType = exports.PropertyAccessRightType = exports.ItemTypeAccessRightType = exports.AdminAction = exports.Action = void 0;
      var Action;
      (function(Action2) {
        Action2["ADMIN_CONNECT"] = "admin.connect";
        Action2["ADMIN_INDEX"] = "admin.index";
        Action2["ADMIN_USERS"] = "admin.users";
        Action2["ADMIN_SCHEMA"] = "admin.schema";
        Action2["ADMIN_SCHEMA_READ"] = "admin.schema.read";
        Action2["ADMIN_ALERTS"] = "admin.alerts";
        Action2["MANAGE_ALERT"] = "manageAlert";
        Action2["ADMIN_REPORT"] = "admin.report";
        Action2["ADMIN_STYLES"] = "admin.styles";
        Action2["ADMIN_SPACES"] = "admin.spaces";
        Action2["RUN_QUERY"] = "runQuery";
        Action2["RAW_READ_QUERY"] = "rawReadQuery";
        Action2["RAW_WRITE_QUERY"] = "rawWriteQuery";
        Action2["MANAGE_QUERY"] = "manageQuery";
        Action2["RUN_CUSTOM_ACTION"] = "runCustomAction";
        Action2["WRITE_CUSTOM_ACTION"] = "writeCustomAction";
        Action2["MANAGE_CUSTOM_ACTION"] = "manageCustomAction";
        Action2["APPLY_NODE_GROUPING"] = "applyNodeGrouping";
        Action2["CREATE_NODE_GROUPING"] = "createNodeGrouping";
        Action2["MANAGE_NODE_GROUPING"] = "manageNodeGrouping";
      })(Action = exports.Action || (exports.Action = {}));
      var AdminAction;
      (function(AdminAction2) {
        AdminAction2["ADMIN_APP"] = "admin.app";
        AdminAction2["ADMIN_USERS_DELETE"] = "admin.users.delete";
        AdminAction2["ADMIN_CONFIG"] = "admin.config";
        AdminAction2["ADMIN_WEBHOOKS"] = "admin.webhooks";
      })(AdminAction = exports.AdminAction || (exports.AdminAction = {}));
      var ItemTypeAccessRightType;
      (function(ItemTypeAccessRightType2) {
        ItemTypeAccessRightType2["READ"] = "read";
        ItemTypeAccessRightType2["EDIT"] = "edit";
        ItemTypeAccessRightType2["WRITE"] = "write";
        ItemTypeAccessRightType2["NONE"] = "none";
      })(ItemTypeAccessRightType = exports.ItemTypeAccessRightType || (exports.ItemTypeAccessRightType = {}));
      var PropertyAccessRightType;
      (function(PropertyAccessRightType2) {
        PropertyAccessRightType2["READ"] = "read";
        PropertyAccessRightType2["EDIT"] = "edit";
        PropertyAccessRightType2["NONE"] = "none";
      })(PropertyAccessRightType = exports.PropertyAccessRightType || (exports.PropertyAccessRightType = {}));
      var ActionAccessRightType;
      (function(ActionAccessRightType2) {
        ActionAccessRightType2["DO"] = "do";
        ActionAccessRightType2["NONE"] = "none";
      })(ActionAccessRightType = exports.ActionAccessRightType || (exports.ActionAccessRightType = {}));
      var AlertAccessRightType;
      (function(AlertAccessRightType2) {
        AlertAccessRightType2["READ"] = "read";
        AlertAccessRightType2["NONE"] = "none";
      })(AlertAccessRightType = exports.AlertAccessRightType || (exports.AlertAccessRightType = {}));
      var TargetType;
      (function(TargetType2) {
        TargetType2["NODE_CATEGORY"] = "nodeCategory";
        TargetType2["EDGE_TYPE"] = "edgeType";
        TargetType2["NODE_PROPERTY_KEY"] = "nodePropertyKey";
        TargetType2["EDGE_PROPERTY_KEY"] = "edgePropertyKey";
        TargetType2["ACTION"] = "action";
        TargetType2["ALERT"] = "alert";
      })(TargetType = exports.TargetType || (exports.TargetType = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/AccessRight/index.js
  var require_AccessRight = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/AccessRight/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
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
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      var __generator = exports && exports.__generator || function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1)
            throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f)
            throw new TypeError("Generator is already executing.");
          while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                return t;
              if (y = 0, t)
                op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return { value: op[1], done: false };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2])
                    _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5)
            throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.AccessRightAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var PROPERTY_KEY_ACCESS_RIGHTS_REQUIRED = response_1.LkErrorKey.PROPERTY_KEY_ACCESS_RIGHTS_REQUIRED;
      var INVALID_PROPERTY_KEY_ACCESS_LEVEL = response_1.LkErrorKey.INVALID_PROPERTY_KEY_ACCESS_LEVEL;
      var STRICT_SCHEMA_REQUIRED = response_1.LkErrorKey.STRICT_SCHEMA_REQUIRED;
      var AccessRightAPI = (
        /** @class */
        function(_super) {
          __extends(AccessRightAPI2, _super);
          function AccessRightAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          AccessRightAPI2.prototype.setAccessRights = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                NOT_FOUND,
                PROPERTY_KEY_ACCESS_RIGHTS_REQUIRED,
                INVALID_PROPERTY_KEY_ACCESS_LEVEL
              ],
              url: "/admin/:sourceKey/groups/:id/access_rights",
              method: "PUT",
              params
            });
          };
          AccessRightAPI2.prototype.updateAccessRightsSettings = function(params) {
            return __awaiter(this, void 0, void 0, function() {
              return __generator(this, function(_a) {
                return [2, this.request({
                  errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, STRICT_SCHEMA_REQUIRED],
                  url: "/admin/:sourceKey/accessRights/settings",
                  method: "PATCH",
                  params
                })];
              });
            });
          };
          return AccessRightAPI2;
        }(request_1.Request)
      );
      exports.AccessRightAPI = AccessRightAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/commonTypes.js
  var require_commonTypes = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/commonTypes.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.CurrencyFormat = exports.SharingMode = exports.SortDirection = void 0;
      var SortDirection;
      (function(SortDirection2) {
        SortDirection2["ASC"] = "asc";
        SortDirection2["DESC"] = "desc";
      })(SortDirection = exports.SortDirection || (exports.SortDirection = {}));
      var SharingMode;
      (function(SharingMode2) {
        SharingMode2["PRIVATE"] = "private";
        SharingMode2["SOURCE"] = "source";
        SharingMode2["GROUPS"] = "groups";
      })(SharingMode = exports.SharingMode || (exports.SharingMode = {}));
      var CurrencyFormat;
      (function(CurrencyFormat2) {
        CurrencyFormat2["SYMBOL_COMMAS_DOT"] = "[Symbol] #,###.##";
        CurrencyFormat2["DOTS_COMMA_SYMBOL"] = "#.###,## [Symbol]";
        CurrencyFormat2["SPACES_COMMA_SYMBOL"] = "# ###,## [Symbol]";
        CurrencyFormat2["SYMBOL_COMMAS"] = "[Symbol] #,###";
        CurrencyFormat2["DOTS_SYMBOL"] = "#.### [Symbol]";
        CurrencyFormat2["SPACES_SYMBOL"] = "# ### [Symbol]";
      })(CurrencyFormat = exports.CurrencyFormat || (exports.CurrencyFormat = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Alert/types.js
  var require_types2 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Alert/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.FULL_CASE_LIST_DEFAULT_SORTBY = exports.FullCaseListSortProperties = exports.CaseActionType = exports.ColumnSortAndFilterBy = exports.CaseListSortBy = exports.CaseStatus = exports.AlertQueryUpdateOperation = exports.AlertColumnType = void 0;
      var commonTypes_1 = require_commonTypes();
      var AlertColumnType;
      (function(AlertColumnType2) {
        AlertColumnType2["STRING"] = "string";
        AlertColumnType2["NUMBER"] = "number";
      })(AlertColumnType = exports.AlertColumnType || (exports.AlertColumnType = {}));
      var AlertQueryUpdateOperation;
      (function(AlertQueryUpdateOperation2) {
        AlertQueryUpdateOperation2["CREATE"] = "create";
        AlertQueryUpdateOperation2["UPDATE"] = "update";
        AlertQueryUpdateOperation2["DELETE"] = "delete";
      })(AlertQueryUpdateOperation = exports.AlertQueryUpdateOperation || (exports.AlertQueryUpdateOperation = {}));
      var CaseStatus;
      (function(CaseStatus2) {
        CaseStatus2["UNCONFIRMED"] = "unconfirmed";
        CaseStatus2["CONFIRMED"] = "confirmed";
        CaseStatus2["DISMISSED"] = "dismissed";
        CaseStatus2["IN_PROGRESS"] = "in-progress";
      })(CaseStatus = exports.CaseStatus || (exports.CaseStatus = {}));
      var CaseListSortBy;
      (function(CaseListSortBy2) {
        CaseListSortBy2["DATE"] = "date";
      })(CaseListSortBy = exports.CaseListSortBy || (exports.CaseListSortBy = {}));
      var ColumnSortAndFilterBy;
      (function(ColumnSortAndFilterBy2) {
        ColumnSortAndFilterBy2["ZERO"] = "0";
        ColumnSortAndFilterBy2["ONE"] = "1";
        ColumnSortAndFilterBy2["TWO"] = "2";
        ColumnSortAndFilterBy2["THREE"] = "3";
        ColumnSortAndFilterBy2["FOUR"] = "4";
        ColumnSortAndFilterBy2["FIVE"] = "5";
        ColumnSortAndFilterBy2["SIX"] = "6";
        ColumnSortAndFilterBy2["SEVEN"] = "7";
        ColumnSortAndFilterBy2["EIGHT"] = "8";
        ColumnSortAndFilterBy2["NINE"] = "9";
        ColumnSortAndFilterBy2["TEN"] = "10";
        ColumnSortAndFilterBy2["ELEVEN"] = "11";
        ColumnSortAndFilterBy2["TWELVE"] = "12";
        ColumnSortAndFilterBy2["THIRTEEN"] = "13";
        ColumnSortAndFilterBy2["FOURTEEN"] = "14";
        ColumnSortAndFilterBy2["FIFTEEN"] = "15";
        ColumnSortAndFilterBy2["SIXTEEN"] = "16";
        ColumnSortAndFilterBy2["SEVENTEEN"] = "17";
        ColumnSortAndFilterBy2["EIGHTEEN"] = "18";
        ColumnSortAndFilterBy2["NINETEEN"] = "19";
        ColumnSortAndFilterBy2["TWENTY"] = "20";
        ColumnSortAndFilterBy2["TWENTY_ONE"] = "21";
        ColumnSortAndFilterBy2["TWENTY_TWO"] = "22";
        ColumnSortAndFilterBy2["TWENTY_THREE"] = "23";
        ColumnSortAndFilterBy2["TWENTY_FOUR"] = "24";
        ColumnSortAndFilterBy2["TWENTY_FIVE"] = "25";
        ColumnSortAndFilterBy2["TWENTY_SIX"] = "26";
        ColumnSortAndFilterBy2["TWENTY_SEVEN"] = "27";
        ColumnSortAndFilterBy2["TWENTY_EIGHT"] = "28";
        ColumnSortAndFilterBy2["TWENTY_NINE"] = "29";
        ColumnSortAndFilterBy2["THIRTY"] = "30";
        ColumnSortAndFilterBy2["THIRTY_ONE"] = "31";
        ColumnSortAndFilterBy2["THIRTY_TWO"] = "32";
        ColumnSortAndFilterBy2["THIRTY_THREE"] = "33";
        ColumnSortAndFilterBy2["THIRTY_FOUR"] = "34";
        ColumnSortAndFilterBy2["THIRTY_FIVE"] = "35";
        ColumnSortAndFilterBy2["THIRTY_SIX"] = "36";
        ColumnSortAndFilterBy2["THIRTY_SEVEN"] = "37";
        ColumnSortAndFilterBy2["THIRTY_EIGHT"] = "38";
        ColumnSortAndFilterBy2["THIRTY_NINE"] = "39";
      })(ColumnSortAndFilterBy = exports.ColumnSortAndFilterBy || (exports.ColumnSortAndFilterBy = {}));
      var CaseActionType;
      (function(CaseActionType2) {
        CaseActionType2["CONFIRM"] = "confirm";
        CaseActionType2["DISMISS"] = "dismiss";
        CaseActionType2["UNCONFIRM"] = "unconfirm";
        CaseActionType2["OPEN"] = "open";
        CaseActionType2["COMMENT"] = "comment";
        CaseActionType2["IN_PROGRESS"] = "in-progress";
        CaseActionType2["ASSIGN"] = "assign";
      })(CaseActionType = exports.CaseActionType || (exports.CaseActionType = {}));
      var FullCaseListSortProperties;
      (function(FullCaseListSortProperties2) {
        FullCaseListSortProperties2["CASE_ID"] = "id";
        FullCaseListSortProperties2["ALERT_NAME"] = "alertName";
        FullCaseListSortProperties2["ALERT_FOLDER"] = "alertFolder";
        FullCaseListSortProperties2["CREATED_AT"] = "createdAt";
        FullCaseListSortProperties2["UPDATED_AT"] = "updatedAt";
        FullCaseListSortProperties2["STATUS"] = "status";
        FullCaseListSortProperties2["STATUS_CHANGED_BY"] = "statusChangedBy";
        FullCaseListSortProperties2["STATUS_CHANGED_ON"] = "statusChangedOn";
        FullCaseListSortProperties2["ASSIGNEE"] = "assignedUser";
        FullCaseListSortProperties2["ALERT_QUERIES_COUNT"] = "alertQueriesCount";
      })(FullCaseListSortProperties = exports.FullCaseListSortProperties || (exports.FullCaseListSortProperties = {}));
      exports.FULL_CASE_LIST_DEFAULT_SORTBY = {
        by: FullCaseListSortProperties.CASE_ID,
        direction: commonTypes_1.SortDirection.DESC
      };
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Alert/index.js
  var require_Alert = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Alert/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __assign = exports && exports.__assign || function() {
        __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
              if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.AlertAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types2(), exports);
      var INVALID_PARAMETER = response_1.LkErrorKey.INVALID_PARAMETER;
      var FEATURE_DISABLED = response_1.LkErrorKey.FEATURE_DISABLED;
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var BAD_GRAPH_REQUEST = response_1.LkErrorKey.BAD_GRAPH_REQUEST;
      var GRAPH_REQUEST_TIMEOUT = response_1.LkErrorKey.GRAPH_REQUEST_TIMEOUT;
      var CONSTRAINT_VIOLATION = response_1.LkErrorKey.CONSTRAINT_VIOLATION;
      var FOLDER_DELETION_FAILED = response_1.LkErrorKey.FOLDER_DELETION_FAILED;
      var ALREADY_EXISTS = response_1.LkErrorKey.ALREADY_EXISTS;
      var INVALID_ALERT_QUERY = response_1.LkErrorKey.INVALID_ALERT_QUERY;
      var INVALID_ALERT_TARGET = response_1.LkErrorKey.INVALID_ALERT_TARGET;
      var REDUNDANT_ACTION = response_1.LkErrorKey.REDUNDANT_ACTION;
      var EDIT_CONFLICT = response_1.LkErrorKey.EDIT_CONFLICT;
      var AlertAPI = (
        /** @class */
        function(_super) {
          __extends(AlertAPI2, _super);
          function AlertAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          AlertAPI2.prototype.runAlert = function(params) {
            return this.request({
              errors: [
                FEATURE_DISABLED,
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                NOT_FOUND,
                CONSTRAINT_VIOLATION
              ],
              url: "/admin/:sourceKey/alerts/:id/run",
              method: "POST",
              params
            });
          };
          AlertAPI2.prototype.createAlert = function(params) {
            return this.request({
              errors: [
                FEATURE_DISABLED,
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                CONSTRAINT_VIOLATION
              ],
              url: "/admin/:sourceKey/alerts",
              method: "POST",
              params
            });
          };
          AlertAPI2.prototype.updateAlert = function(params) {
            return this.request({
              errors: [
                FEATURE_DISABLED,
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                NOT_FOUND,
                CONSTRAINT_VIOLATION
              ],
              url: "/admin/:sourceKey/alerts/:id",
              method: "PATCH",
              params
            });
          };
          AlertAPI2.prototype.deleteAlert = function(params) {
            return this.request({
              errors: [
                FEATURE_DISABLED,
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                NOT_FOUND,
                EDIT_CONFLICT
              ],
              url: "/admin/:sourceKey/alerts/:id",
              method: "DELETE",
              params
            });
          };
          AlertAPI2.prototype.createAlertFolder = function(params) {
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, ALREADY_EXISTS],
              url: "/admin/:sourceKey/alerts/folder",
              method: "POST",
              params
            });
          };
          AlertAPI2.prototype.updateAlertFolder = function(params) {
            return this.request({
              errors: [
                FEATURE_DISABLED,
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                NOT_FOUND,
                ALREADY_EXISTS
              ],
              url: "/admin/:sourceKey/alerts/folder/:id",
              method: "PATCH",
              params
            });
          };
          AlertAPI2.prototype.deleteAlertFolder = function(params) {
            return this.request({
              errors: [
                FEATURE_DISABLED,
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                NOT_FOUND,
                FOLDER_DELETION_FAILED
              ],
              url: "/admin/:sourceKey/alerts/folder/:id",
              method: "DELETE",
              params
            });
          };
          AlertAPI2.prototype.getAlertTree = function(params) {
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN],
              url: "/:sourceKey/alerts/tree",
              method: "GET",
              params
            });
          };
          AlertAPI2.prototype.getAlert = function(params) {
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/:id",
              method: "GET",
              params
            });
          };
          AlertAPI2.prototype.getCaseListInfoExtract = function(params) {
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/:alertId/cases/extract",
              method: "GET",
              params
            });
          };
          AlertAPI2.prototype.getCase = function(params) {
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/:alertId/cases/:caseId",
              method: "GET",
              params
            });
          };
          AlertAPI2.prototype.updateCase = function(params) {
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/:alertId/cases/:caseId",
              method: "PATCH",
              params
            });
          };
          AlertAPI2.prototype.assignCases = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/:alertId/cases/assignments",
              method: "POST",
              params
            });
          };
          AlertAPI2.prototype.bulkAssignCases = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/cases/assignments",
              method: "POST",
              params
            });
          };
          AlertAPI2.prototype.getAlertUsers = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/:alertId/users",
              method: "GET",
              params
            });
          };
          AlertAPI2.prototype.getCases = function(params) {
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/:alertId/cases",
              method: "GET",
              params
            });
          };
          AlertAPI2.prototype.getCaseActions = function(params) {
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/:alertId/cases/:caseId/actions",
              method: "GET",
              params
            });
          };
          AlertAPI2.prototype.deleteCaseComment = function(params) {
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alert/case/comment/:commentId",
              method: "DELETE",
              params
            });
          };
          AlertAPI2.prototype.doCaseAction = function(params) {
            return this.request({
              errors: [
                FEATURE_DISABLED,
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                NOT_FOUND,
                REDUNDANT_ACTION
              ],
              url: "/:sourceKey/alerts/:alertId/cases/:caseId/action",
              method: "POST",
              params
            });
          };
          AlertAPI2.prototype.alertPreview = function(params) {
            return this.request({
              errors: [
                INVALID_PARAMETER,
                FEATURE_DISABLED,
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                BAD_GRAPH_REQUEST,
                GRAPH_REQUEST_TIMEOUT,
                CONSTRAINT_VIOLATION,
                INVALID_ALERT_QUERY,
                INVALID_ALERT_TARGET
              ],
              url: "/:sourceKey/graph/alertPreview",
              method: "POST",
              params
            });
          };
          AlertAPI2.prototype.getFullCaseList = function(params) {
            var _a, _b, _c, _d;
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/cases/list",
              method: "GET",
              params: __assign(__assign({}, params), { sortBy: JSON.stringify(params.sortBy), alertIdsFilter: (_a = params.alertIdsFilter) === null || _a === void 0 ? void 0 : _a.join(","), assignedUserIdsFilter: (_b = params.assignedUserIdsFilter) === null || _b === void 0 ? void 0 : _b.join(","), caseStatusesFilter: (_c = params.caseStatusesFilter) === null || _c === void 0 ? void 0 : _c.join(","), caseColumnsFilter: JSON.stringify(params.caseColumnsFilter), alertQueryModelKeysFilter: (_d = params.alertQueryModelKeysFilter) === null || _d === void 0 ? void 0 : _d.join(",") })
            });
          };
          AlertAPI2.prototype.getFullCaseListExtract = function(params) {
            var _a, _b, _c, _d;
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/cases/extract",
              method: "GET",
              params: __assign(__assign({}, params), { sortBy: JSON.stringify(params.sortBy), alertIdsFilter: (_a = params.alertIdsFilter) === null || _a === void 0 ? void 0 : _a.join(","), assignedUserIdsFilter: (_b = params.assignedUserIdsFilter) === null || _b === void 0 ? void 0 : _b.join(","), caseStatusesFilter: (_c = params.caseStatusesFilter) === null || _c === void 0 ? void 0 : _c.join(","), caseColumnsFilter: JSON.stringify(params.caseColumnsFilter), alertQueryModelKeysFilter: (_d = params.alertQueryModelKeysFilter) === null || _d === void 0 ? void 0 : _d.join(",") })
            });
          };
          AlertAPI2.prototype.getAllAlertsUsers = function(params) {
            var _a;
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/users",
              method: "GET",
              params: __assign(__assign({}, params), { mutualAlertIds: (_a = params === null || params === void 0 ? void 0 : params.mutualAlertIds) === null || _a === void 0 ? void 0 : _a.join(",") })
            });
          };
          AlertAPI2.prototype.searchColumnValuesForAlertCases = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/:alertId/cases/values",
              method: "GET",
              params
            });
          };
          AlertAPI2.prototype.getCasePreview = function(params) {
            return this.request({
              errors: [FEATURE_DISABLED, UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/:alertId/cases/:caseId/preview",
              method: "GET",
              params
            });
          };
          AlertAPI2.prototype.getFullCaseListPreferences = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/cases/list/preferences",
              method: "GET",
              params
            });
          };
          AlertAPI2.prototype.setFullCaseListPreferences = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/alerts/cases/list/preferences",
              method: "PUT",
              params
            });
          };
          return AlertAPI2;
        }(request_1.Request)
      );
      exports.AlertAPI = AlertAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Application/types.js
  var require_types3 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Application/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ApiRight = void 0;
      var ApiRight;
      (function(ApiRight2) {
        ApiRight2["VISUALIZATION_READ"] = "visualization.read";
        ApiRight2["VISUALIZATION_CREATE"] = "visualization.create";
        ApiRight2["VISUALIZATION_DUPLICATE"] = "visualization.duplicate";
        ApiRight2["VISUALIZATION_EDIT"] = "visualization.edit";
        ApiRight2["VISUALIZATION_DELETE"] = "visualization.delete";
        ApiRight2["VISUALIZATION_LIST"] = "visualization.list";
        ApiRight2["VISUALIZATION_FOLDER_CREATE"] = "visualizationFolder.create";
        ApiRight2["VISUALIZATION_FOLDER_EDIT"] = "visualizationFolder.edit";
        ApiRight2["VISUALIZATION_FOLDER_DELETE"] = "visualizationFolder.delete";
        ApiRight2["VISUALIZATION_SHARE_READ"] = "visualizationShare.read";
        ApiRight2["VISUALIZATION_SHARE_CREATE"] = "visualizationShare.create";
        ApiRight2["VISUALIZATION_SHARE_DELETE"] = "visualizationShare.delete";
        ApiRight2["SANDBOX"] = "sandbox";
        ApiRight2["WIDGET_READ"] = "widget.read";
        ApiRight2["WIDGET_CREATE"] = "widget.create";
        ApiRight2["WIDGET_EDIT"] = "widget.edit";
        ApiRight2["WIDGET_DELETE"] = "widget.delete";
        ApiRight2["GRAPH_ITEM_READ"] = "graphItem.read";
        ApiRight2["GRAPH_ITEM_CREATE"] = "graphItem.create";
        ApiRight2["GRAPH_ITEM_EDIT"] = "graphItem.edit";
        ApiRight2["GRAPH_ITEM_DELETE"] = "graphItem.delete";
        ApiRight2["GRAPH_ITEM_SEARCH"] = "graphItem.search";
        ApiRight2["SAVED_GRAPH_QUERY_READ"] = "savedGraphQuery.read";
        ApiRight2["SAVED_GRAPH_QUERY_CREATE"] = "savedGraphQuery.create";
        ApiRight2["SAVED_GRAPH_QUERY_EDIT"] = "savedGraphQuery.edit";
        ApiRight2["SAVED_GRAPH_QUERY_DELETE"] = "savedGraphQuery.delete";
        ApiRight2["GRAPH_RUN_QUERY"] = "graph.runQuery";
        ApiRight2["ALERT_READ"] = "alert.read";
        ApiRight2["ALERT_DO_ACTION"] = "alert.doAction";
        ApiRight2["ADMIN_ALERTS"] = "admin.alerts";
        ApiRight2["SCHEMA"] = "schema";
        ApiRight2["ADMIN_INDEX"] = "admin.index";
      })(ApiRight = exports.ApiRight || (exports.ApiRight = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Application/index.js
  var require_Application = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Application/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ApplicationAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types3(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var ApplicationAPI = (
        /** @class */
        function(_super) {
          __extends(ApplicationAPI2, _super);
          function ApplicationAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          ApplicationAPI2.prototype.getApplications = function() {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN],
              url: "/admin/applications",
              method: "GET"
            });
          };
          ApplicationAPI2.prototype.createApplication = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, NOT_FOUND],
              url: "/admin/applications",
              method: "POST",
              params
            });
          };
          ApplicationAPI2.prototype.updateApplication = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, NOT_FOUND],
              url: "/admin/applications/:id",
              method: "PATCH",
              params
            });
          };
          return ApplicationAPI2;
        }(request_1.Request)
      );
      exports.ApplicationAPI = ApplicationAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Auth/types.js
  var require_types4 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Auth/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Auth/index.js
  var require_Auth = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Auth/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
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
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      var __generator = exports && exports.__generator || function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1)
            throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f)
            throw new TypeError("Generator is already executing.");
          while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                return t;
              if (y = 0, t)
                op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return { value: op[1], done: false };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2])
                    _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5)
            throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.AuthAPI = void 0;
      var response_1 = require_response();
      var request_1 = require_request();
      __exportStar(require_types4(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var GUEST_DISABLED = response_1.LkErrorKey.GUEST_DISABLED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var INVALID_LICENSE = response_1.LkErrorKey.INVALID_LICENSE;
      var ALREADY_EXISTS = response_1.LkErrorKey.ALREADY_EXISTS;
      var AuthAPI = (
        /** @class */
        function(_super) {
          __extends(AuthAPI2, _super);
          function AuthAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          AuthAPI2.prototype.login = function(params) {
            return __awaiter(this, void 0, void 0, function() {
              var response;
              return __generator(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    delete this.props.clientState.currentSource;
                    delete this.props.clientState.guestMode;
                    delete this.props.clientState.sources;
                    delete this.props.clientState.user;
                    return [4, this.request({
                      errors: [UNAUTHORIZED],
                      url: "/auth/login",
                      method: "POST",
                      params
                    })];
                  case 1:
                    response = _a.sent();
                    if (response.isSuccess()) {
                      this.props.clientState.user = response.body;
                    }
                    return [2, response];
                }
              });
            });
          };
          AuthAPI2.prototype.loginOAuth2 = function(params) {
            return this.request({
              url: "/auth/sso/return",
              method: "GET",
              params
            });
          };
          AuthAPI2.prototype.logout = function() {
            return __awaiter(this, void 0, void 0, function() {
              var response;
              return __generator(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return [4, this.request({
                      errors: [UNAUTHORIZED],
                      url: "/auth/logout",
                      method: "GET"
                    })];
                  case 1:
                    response = _a.sent();
                    delete this.props.clientState.currentSource;
                    delete this.props.clientState.guestMode;
                    delete this.props.clientState.sources;
                    delete this.props.clientState.user;
                    return [2, response];
                }
              });
            });
          };
          AuthAPI2.prototype.getCurrentUser = function() {
            return __awaiter(this, void 0, void 0, function() {
              var response;
              return __generator(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return [4, this.request({
                      errors: [UNAUTHORIZED, GUEST_DISABLED],
                      url: "/auth/me",
                      method: "GET"
                    })];
                  case 1:
                    response = _a.sent();
                    if (response.isSuccess()) {
                      this.props.clientState.user = response.body;
                    }
                    return [2, response];
                }
              });
            });
          };
          AuthAPI2.prototype.setupAuthentication = function(params) {
            return __awaiter(this, void 0, void 0, function() {
              var response;
              return __generator(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return [4, this.request({
                      errors: [FORBIDDEN, INVALID_LICENSE],
                      url: "/auth/me",
                      method: "POST",
                      params
                    })];
                  case 1:
                    response = _a.sent();
                    if (response.isSuccess()) {
                      this.props.clientState.user = response.body;
                    }
                    return [2, response];
                }
              });
            });
          };
          AuthAPI2.prototype.updateCurrentUser = function(params) {
            return __awaiter(this, void 0, void 0, function() {
              var response;
              return __generator(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return [4, this.request({
                      errors: [UNAUTHORIZED, FORBIDDEN, ALREADY_EXISTS],
                      url: "/auth/me",
                      method: "PATCH",
                      params
                    })];
                  case 1:
                    response = _a.sent();
                    if (response.isSuccess()) {
                      this.props.clientState.user = response.body;
                    }
                    return [2, response];
                }
              });
            });
          };
          return AuthAPI2;
        }(request_1.Request)
      );
      exports.AuthAPI = AuthAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Config/types.js
  var require_types5 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Config/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ImgCrossOrigin = exports.OgmaRenderer = exports.AntiAliasing = exports.UILayout = exports.AuditTrailMode = void 0;
      var AuditTrailMode;
      (function(AuditTrailMode2) {
        AuditTrailMode2["READ"] = "r";
        AuditTrailMode2["WRITE"] = "w";
        AuditTrailMode2["READ_WRITE"] = "rw";
      })(AuditTrailMode = exports.AuditTrailMode || (exports.AuditTrailMode = {}));
      var UILayout;
      (function(UILayout2) {
        UILayout2["REGULAR"] = "regular";
        UILayout2["SIMPLE"] = "simple";
        UILayout2["NONE"] = "none";
      })(UILayout = exports.UILayout || (exports.UILayout = {}));
      var AntiAliasing;
      (function(AntiAliasing2) {
        AntiAliasing2["SUPER_SAMPLING"] = "super-sampling";
        AntiAliasing2["NATIVE"] = "native";
        AntiAliasing2["NONE"] = "none";
      })(AntiAliasing = exports.AntiAliasing || (exports.AntiAliasing = {}));
      var OgmaRenderer;
      (function(OgmaRenderer2) {
        OgmaRenderer2["WEBGL"] = "webgl";
        OgmaRenderer2["CANVAS"] = "canvas";
      })(OgmaRenderer = exports.OgmaRenderer || (exports.OgmaRenderer = {}));
      var ImgCrossOrigin;
      (function(ImgCrossOrigin2) {
        ImgCrossOrigin2["ANONYMOUS"] = "anonymous";
        ImgCrossOrigin2["USE_CREDENTIALS"] = "use-credentials";
      })(ImgCrossOrigin = exports.ImgCrossOrigin || (exports.ImgCrossOrigin = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Config/index.js
  var require_Config = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Config/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ConfigAPI = void 0;
      var response_1 = require_response();
      var request_1 = require_request();
      __exportStar(require_types5(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var INVALID_PARAMETER = response_1.LkErrorKey.INVALID_PARAMETER;
      var ILLEGAL_SOURCE_STATE = response_1.LkErrorKey.ILLEGAL_SOURCE_STATE;
      var ConfigAPI = (
        /** @class */
        function(_super) {
          __extends(ConfigAPI2, _super);
          function ConfigAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          ConfigAPI2.prototype.getConfiguration = function(params) {
            return this.request({
              url: "/config",
              method: "GET",
              params
            });
          };
          ConfigAPI2.prototype.updateConfiguration = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, INVALID_PARAMETER, ILLEGAL_SOURCE_STATE],
              url: "/config",
              method: "POST",
              params
            });
          };
          return ConfigAPI2;
        }(request_1.Request)
      );
      exports.ConfigAPI = ConfigAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/CustomAction/types.js
  var require_types6 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/CustomAction/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.CustomActionParsingErrorKey = exports.CustomActionRight = exports.CustomActionVariable = exports.CustomActionType = void 0;
      var CustomActionType;
      (function(CustomActionType2) {
        CustomActionType2["NON_GRAPH"] = "non-graph";
        CustomActionType2["NODE"] = "node";
        CustomActionType2["EDGE"] = "edge";
        CustomActionType2["NODESET"] = "nodeset";
        CustomActionType2["EDGESET"] = "edgeset";
      })(CustomActionType = exports.CustomActionType || (exports.CustomActionType = {}));
      var CustomActionVariable;
      (function(CustomActionVariable2) {
        CustomActionVariable2["BASE_URL"] = "baseurl";
        CustomActionVariable2["PAGE"] = "page";
        CustomActionVariable2["VISUALIZATION"] = "visualization";
        CustomActionVariable2["ALERT"] = "alert";
        CustomActionVariable2["CASE"] = "case";
        CustomActionVariable2["SOURCE_KEY"] = "sourcekey";
        CustomActionVariable2["NODE"] = "node";
        CustomActionVariable2["EDGE"] = "edge";
        CustomActionVariable2["NODE_SET"] = "nodeset";
        CustomActionVariable2["EDGE_SET"] = "edgeset";
      })(CustomActionVariable = exports.CustomActionVariable || (exports.CustomActionVariable = {}));
      var CustomActionRight;
      (function(CustomActionRight2) {
        CustomActionRight2["MANAGE"] = "manage";
        CustomActionRight2["READ"] = "read";
      })(CustomActionRight = exports.CustomActionRight || (exports.CustomActionRight = {}));
      var CustomActionParsingErrorKey;
      (function(CustomActionParsingErrorKey2) {
        CustomActionParsingErrorKey2["UNCLOSED_EXPRESSION"] = "unclosed-expression";
        CustomActionParsingErrorKey2["EMPTY_EXPRESSION"] = "empty-expression";
        CustomActionParsingErrorKey2["INVALID_EXPRESSION_SYNTAX"] = "invalid-expression-syntax";
        CustomActionParsingErrorKey2["INVALID_VARIABLE"] = "invalid-variable";
        CustomActionParsingErrorKey2["INVALID_SEMANTIC"] = "invalid-semantic";
        CustomActionParsingErrorKey2["UNKNOWN_NODE_CATEGORY"] = "unknown-node-category";
        CustomActionParsingErrorKey2["UNKNOWN_EDGE_TYPE"] = "unknown-edge-type";
        CustomActionParsingErrorKey2["NO_EXPRESSIONS"] = "no-expressions";
        CustomActionParsingErrorKey2["INVALID_TEMPLATE_COMBINATION"] = "invalid-template-combination";
        CustomActionParsingErrorKey2["INCOMPATIBLE_RESTRICTIONS"] = "incompatible-restrictions";
      })(CustomActionParsingErrorKey = exports.CustomActionParsingErrorKey || (exports.CustomActionParsingErrorKey = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/CustomAction/index.js
  var require_CustomAction = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/CustomAction/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.CustomActionAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types6(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var GUEST_DISABLED = response_1.LkErrorKey.GUEST_DISABLED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var MALFORMED_CUSTOM_ACTION_TEMPLATE = response_1.LkErrorKey.MALFORMED_CUSTOM_ACTION_TEMPLATE;
      var CustomActionAPI = (
        /** @class */
        function(_super) {
          __extends(CustomActionAPI2, _super);
          function CustomActionAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          CustomActionAPI2.prototype.getCustomActions = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED, FORBIDDEN],
              url: "/:sourceKey/customAction",
              method: "GET",
              params
            });
          };
          CustomActionAPI2.prototype.createCustomAction = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, MALFORMED_CUSTOM_ACTION_TEMPLATE],
              url: "/:sourceKey/customAction",
              method: "POST",
              params
            });
          };
          CustomActionAPI2.prototype.updateCustomAction = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                NOT_FOUND,
                MALFORMED_CUSTOM_ACTION_TEMPLATE
              ],
              url: "/:sourceKey/customAction/:id",
              method: "PATCH",
              params
            });
          };
          CustomActionAPI2.prototype.deleteCustomAction = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/customAction/:id",
              method: "DELETE",
              params
            });
          };
          return CustomActionAPI2;
        }(request_1.Request)
      );
      exports.CustomActionAPI = CustomActionAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/DataSource/types.js
  var require_types7 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/DataSource/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DataSourceState = void 0;
      var DataSourceState;
      (function(DataSourceState2) {
        DataSourceState2["READY"] = "ready";
        DataSourceState2["NEED_INDEX"] = "needIndex";
        DataSourceState2["NEED_CONFIG"] = "needConfig";
        DataSourceState2["INDEXING"] = "indexing";
        DataSourceState2["DISCOVERING_SCHEMA"] = "discoveringSchema";
        DataSourceState2["OFFLINE"] = "offline";
        DataSourceState2["CONNECTING"] = "connecting";
        DataSourceState2["STORE_ID_CHANGED"] = "storeIdChanged";
      })(DataSourceState = exports.DataSourceState || (exports.DataSourceState = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/DataSource/index.js
  var require_DataSource = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/DataSource/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
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
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      var __generator = exports && exports.__generator || function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1)
            throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f)
            throw new TypeError("Generator is already executing.");
          while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                return t;
              if (y = 0, t)
                op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return { value: op[1], done: false };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2])
                    _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5)
            throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DataSourceAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      var utils_1 = require_utils3();
      var index_1 = require_src();
      __exportStar(require_types7(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var GUEST_DISABLED = response_1.LkErrorKey.GUEST_DISABLED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var ILLEGAL_SOURCE_STATE = response_1.LkErrorKey.ILLEGAL_SOURCE_STATE;
      var INVALID_PARAMETER = response_1.LkErrorKey.INVALID_PARAMETER;
      var DataSourceAPI = (
        /** @class */
        function(_super) {
          __extends(DataSourceAPI2, _super);
          function DataSourceAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          DataSourceAPI2.prototype.getDataSources = function(params) {
            return __awaiter(this, void 0, void 0, function() {
              var response, currentSource;
              return __generator(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return [4, this.request({
                      errors: [UNAUTHORIZED, GUEST_DISABLED],
                      url: "/dataSources",
                      method: "GET",
                      params
                    })];
                  case 1:
                    response = _a.sent();
                    if (response.isSuccess()) {
                      this.props.clientState.sources = response.body;
                      if (!(0, utils_1.hasValue)(this.props.clientState.currentSource)) {
                        try {
                          currentSource = index_1.RestClient.getCurrentSource(this.props.clientState.sources || [], this.props.clientState.user && { userId: this.props.clientState.user.id });
                          this.props.clientState.currentSource = currentSource;
                          if ((0, utils_1.hasValue)(currentSource.key) && (0, utils_1.hasValue)(this.props.clientState.user)) {
                            localStorage.setItem("lk-lastSeenSourceKey-".concat(this.props.clientState.user.id), currentSource.key);
                          }
                        } catch (_) {
                        }
                      }
                    }
                    return [2, response];
                }
              });
            });
          };
          DataSourceAPI2.prototype.setDefaultSourceStyles = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN],
              url: "/admin/source/:sourceKey/setDefaults",
              method: "POST",
              params
            });
          };
          DataSourceAPI2.prototype.resetSourceStyles = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN],
              url: "/admin/source/:sourceKey/resetDefaults",
              method: "POST",
              params
            });
          };
          DataSourceAPI2.prototype.connectDataSource = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, ILLEGAL_SOURCE_STATE],
              url: "/admin/source/:sourceIndex/connect",
              method: "POST",
              params
            });
          };
          DataSourceAPI2.prototype.deleteSourceData = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN],
              url: "/admin/sources/data/:sourceKey",
              method: "DELETE",
              params
            });
          };
          DataSourceAPI2.prototype.deleteSourceConfig = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, ILLEGAL_SOURCE_STATE],
              url: "/admin/sources/config/:configIndex",
              method: "DELETE",
              params
            });
          };
          DataSourceAPI2.prototype.getDataSourcesAdminInfo = function() {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN],
              url: "/admin/sources",
              method: "GET"
            });
          };
          DataSourceAPI2.prototype.createSourceConfig = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, INVALID_PARAMETER],
              url: "/admin/sources/config",
              method: "POST",
              params
            });
          };
          return DataSourceAPI2;
        }(request_1.Request)
      );
      exports.DataSourceAPI = DataSourceAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/favorite/types.js
  var require_types8 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/favorite/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.FavoriteType = void 0;
      var FavoriteType;
      (function(FavoriteType2) {
        FavoriteType2["GRAPH_QUERY"] = "graph-query";
      })(FavoriteType = exports.FavoriteType || (exports.FavoriteType = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/favorite/index.js
  var require_favorite = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/favorite/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.FavoriteAPI = void 0;
      var response_1 = require_response();
      var request_1 = require_request();
      __exportStar(require_types8(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var FavoriteAPI = (
        /** @class */
        function(_super) {
          __extends(FavoriteAPI2, _super);
          function FavoriteAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          FavoriteAPI2.prototype.createFavorite = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/favorites/:type/:itemId",
              method: "POST",
              params
            });
          };
          FavoriteAPI2.prototype.deleteFavorite = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/favorites/:type/:itemId",
              method: "DELETE",
              params
            });
          };
          return FavoriteAPI2;
        }(request_1.Request)
      );
      exports.FavoriteAPI = FavoriteAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/GraphEdge/types.js
  var require_types9 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/GraphEdge/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/GraphEdge/index.js
  var require_GraphEdge = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/GraphEdge/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.GraphEdgeAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types9(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var GUEST_DISABLED = response_1.LkErrorKey.GUEST_DISABLED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var EDIT_CONFLICT = response_1.LkErrorKey.EDIT_CONFLICT;
      var GraphEdgeAPI = (
        /** @class */
        function(_super) {
          __extends(GraphEdgeAPI2, _super);
          function GraphEdgeAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          GraphEdgeAPI2.prototype.getEdge = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED, NOT_FOUND],
              url: "/:sourceKey/graph/edges/:id",
              method: "POST",
              params
            });
          };
          GraphEdgeAPI2.prototype.createEdge = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN],
              url: "/:sourceKey/graph/edges",
              method: "POST",
              params
            });
          };
          GraphEdgeAPI2.prototype.updateEdge = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND, EDIT_CONFLICT],
              url: "/:sourceKey/graph/edges/:id",
              method: "PATCH",
              params
            });
          };
          GraphEdgeAPI2.prototype.deleteEdge = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/graph/edges/:id",
              method: "DELETE",
              params
            });
          };
          GraphEdgeAPI2.prototype.getEdgeCount = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED],
              url: "/:sourceKey/graph/edges/count",
              method: "GET",
              params
            });
          };
          return GraphEdgeAPI2;
        }(request_1.Request)
      );
      exports.GraphEdgeAPI = GraphEdgeAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/GraphNode/types.js
  var require_types10 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/GraphNode/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.LimitType = void 0;
      var LimitType;
      (function(LimitType2) {
        LimitType2["ID"] = "id";
        LimitType2["HIGHEST_DEGREE"] = "highestDegree";
        LimitType2["LOWEST_DEGREE"] = "lowestDegree";
      })(LimitType = exports.LimitType || (exports.LimitType = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/GraphNode/index.js
  var require_GraphNode = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/GraphNode/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.GraphNodeAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types10(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var GUEST_DISABLED = response_1.LkErrorKey.GUEST_DISABLED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var EDIT_CONFLICT = response_1.LkErrorKey.EDIT_CONFLICT;
      var NOT_SUPPORTED = response_1.LkErrorKey.NOT_SUPPORTED;
      var INVALID_PARAMETER = response_1.LkErrorKey.INVALID_PARAMETER;
      var CONSTRAINT_VIOLATION = response_1.LkErrorKey.CONSTRAINT_VIOLATION;
      var GraphNodeAPI = (
        /** @class */
        function(_super) {
          __extends(GraphNodeAPI2, _super);
          function GraphNodeAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          GraphNodeAPI2.prototype.getNode = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED, NOT_FOUND],
              url: "/:sourceKey/graph/nodes/:id",
              method: "POST",
              params
            });
          };
          GraphNodeAPI2.prototype.createNode = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                INVALID_PARAMETER,
                CONSTRAINT_VIOLATION
              ],
              url: "/:sourceKey/graph/nodes",
              method: "POST",
              params
            });
          };
          GraphNodeAPI2.prototype.updateNode = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                NOT_FOUND,
                EDIT_CONFLICT,
                NOT_SUPPORTED,
                INVALID_PARAMETER,
                CONSTRAINT_VIOLATION
              ],
              url: "/:sourceKey/graph/nodes/:id",
              method: "PATCH",
              params
            });
          };
          GraphNodeAPI2.prototype.deleteNode = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/graph/nodes/:id",
              method: "DELETE",
              params
            });
          };
          GraphNodeAPI2.prototype.getNodeCount = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED],
              url: "/:sourceKey/graph/nodes/count",
              method: "GET",
              params
            });
          };
          GraphNodeAPI2.prototype.getStatistics = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED, NOT_FOUND],
              url: "/:sourceKey/graph/neighborhood/statistics",
              method: "POST",
              params
            });
          };
          GraphNodeAPI2.prototype.getAdjacentNodes = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED, NOT_FOUND],
              url: "/:sourceKey/graph/nodes/expand",
              method: "POST",
              params
            });
          };
          return GraphNodeAPI2;
        }(request_1.Request)
      );
      exports.GraphNodeAPI = GraphNodeAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/GraphQuery/types.js
  var require_types11 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/GraphQuery/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.GraphQueryType = exports.GraphQueryRight = exports.GraphQueryDialect = exports.GraphQueryInputType = exports.DatetimeTemplateFormat = exports.EnvTemplateValues = exports.DateTemplateFormat = exports.TemplateFieldType = void 0;
      var TemplateFieldType;
      (function(TemplateFieldType2) {
        TemplateFieldType2["NUMBER"] = "number";
        TemplateFieldType2["STRING"] = "string";
        TemplateFieldType2["ENUM"] = "enum";
        TemplateFieldType2["NODE"] = "node";
        TemplateFieldType2["NODE_SET"] = "nodeset";
        TemplateFieldType2["EDGE"] = "edge";
        TemplateFieldType2["EDGE_SET"] = "edgeset";
        TemplateFieldType2["DATE"] = "date";
        TemplateFieldType2["DATE_TIME"] = "datetime";
        TemplateFieldType2["BOOLEAN"] = "boolean";
        TemplateFieldType2["ENV"] = "env";
        TemplateFieldType2["LIST"] = "list";
      })(TemplateFieldType = exports.TemplateFieldType || (exports.TemplateFieldType = {}));
      var DateTemplateFormat;
      (function(DateTemplateFormat2) {
        DateTemplateFormat2["TIMESTAMP"] = "timestamp";
        DateTemplateFormat2["TIMESTAMP_MS"] = "timestamp-ms";
        DateTemplateFormat2["ISO"] = "iso";
        DateTemplateFormat2["ISO_YYYY_MM_DD"] = "yyyy-mm-dd";
        DateTemplateFormat2["DD_MM_YYYY"] = "dd/mm/yyyy";
        DateTemplateFormat2["MM_DD_YYYY"] = "mm/dd/yyyy";
        DateTemplateFormat2["NATIVE"] = "native";
      })(DateTemplateFormat = exports.DateTemplateFormat || (exports.DateTemplateFormat = {}));
      var EnvTemplateValues;
      (function(EnvTemplateValues2) {
        EnvTemplateValues2["EMAIL"] = "email";
      })(EnvTemplateValues = exports.EnvTemplateValues || (exports.EnvTemplateValues = {}));
      var DatetimeTemplateFormat;
      (function(DatetimeTemplateFormat2) {
        DatetimeTemplateFormat2["TIMESTAMP"] = "timestamp";
        DatetimeTemplateFormat2["TIMESTAMP_MS"] = "timestamp-ms";
        DatetimeTemplateFormat2["ISO"] = "iso";
        DatetimeTemplateFormat2["YYYY_MM_DD_T"] = "YYYY-MM-DDThh:mm:ss";
        DatetimeTemplateFormat2["NATIVE"] = "native";
      })(DatetimeTemplateFormat = exports.DatetimeTemplateFormat || (exports.DatetimeTemplateFormat = {}));
      var GraphQueryInputType;
      (function(GraphQueryInputType2) {
        GraphQueryInputType2["NONE"] = "none";
        GraphQueryInputType2["_1_NODE"] = "1-node";
        GraphQueryInputType2["_1_EDGE"] = "1-edge";
        GraphQueryInputType2["_2_NODES"] = "2-nodes";
        GraphQueryInputType2["NODESET"] = "nodeset";
        GraphQueryInputType2["EDGESET"] = "edgeset";
      })(GraphQueryInputType = exports.GraphQueryInputType || (exports.GraphQueryInputType = {}));
      var GraphQueryDialect;
      (function(GraphQueryDialect2) {
        GraphQueryDialect2["CYPHER"] = "cypher";
        GraphQueryDialect2["GREMLIN"] = "gremlin";
      })(GraphQueryDialect = exports.GraphQueryDialect || (exports.GraphQueryDialect = {}));
      var GraphQueryRight;
      (function(GraphQueryRight2) {
        GraphQueryRight2["MANAGE"] = "manage";
        GraphQueryRight2["READ"] = "read";
      })(GraphQueryRight = exports.GraphQueryRight || (exports.GraphQueryRight = {}));
      var GraphQueryType;
      (function(GraphQueryType2) {
        GraphQueryType2["STATIC"] = "static";
        GraphQueryType2["TEMPLATE"] = "template";
      })(GraphQueryType = exports.GraphQueryType || (exports.GraphQueryType = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/GraphQuery/index.js
  var require_GraphQuery = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/GraphQuery/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.GraphQueryAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types11(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var GUEST_DISABLED = response_1.LkErrorKey.GUEST_DISABLED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var BAD_GRAPH_REQUEST = response_1.LkErrorKey.BAD_GRAPH_REQUEST;
      var GRAPH_REQUEST_TIMEOUT = response_1.LkErrorKey.GRAPH_REQUEST_TIMEOUT;
      var CONSTRAINT_VIOLATION = response_1.LkErrorKey.CONSTRAINT_VIOLATION;
      var MALFORMED_QUERY_TEMPLATE = response_1.LkErrorKey.MALFORMED_QUERY_TEMPLATE;
      var INVALID_CASE_ATTRIBUTES_QUERY = response_1.LkErrorKey.INVALID_CASE_ATTRIBUTES_QUERY;
      var INVALID_PARAMETER = response_1.LkErrorKey.INVALID_PARAMETER;
      var CRITICAL = response_1.LkErrorKey.CRITICAL;
      var GraphQueryAPI = (
        /** @class */
        function(_super) {
          __extends(GraphQueryAPI2, _super);
          function GraphQueryAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          GraphQueryAPI2.prototype.getQuery = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/graph/query/:id",
              method: "GET",
              params
            });
          };
          GraphQueryAPI2.prototype.getQueries = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED, FORBIDDEN],
              url: "/:sourceKey/graph/query",
              method: "GET",
              params
            });
          };
          GraphQueryAPI2.prototype.createQuery = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, MALFORMED_QUERY_TEMPLATE],
              url: "/:sourceKey/graph/query",
              method: "POST",
              params
            });
          };
          GraphQueryAPI2.prototype.updateQuery = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                NOT_FOUND,
                MALFORMED_QUERY_TEMPLATE
              ],
              url: "/:sourceKey/graph/query/:id",
              method: "PATCH",
              params
            });
          };
          GraphQueryAPI2.prototype.deleteQuery = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/:sourceKey/graph/query/:id",
              method: "DELETE",
              params
            });
          };
          GraphQueryAPI2.prototype.checkQuery = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                BAD_GRAPH_REQUEST,
                GRAPH_REQUEST_TIMEOUT,
                INVALID_PARAMETER,
                CRITICAL,
                MALFORMED_QUERY_TEMPLATE,
                INVALID_CASE_ATTRIBUTES_QUERY
              ],
              url: "/:sourceKey/graph/check/query",
              method: "POST",
              params
            });
          };
          GraphQueryAPI2.prototype.runQuery = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                NOT_FOUND,
                BAD_GRAPH_REQUEST,
                GRAPH_REQUEST_TIMEOUT,
                CONSTRAINT_VIOLATION,
                MALFORMED_QUERY_TEMPLATE
              ],
              url: "/:sourceKey/graph/run/query",
              method: "POST",
              params
            });
          };
          GraphQueryAPI2.prototype.runQueryById = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                GUEST_DISABLED,
                FORBIDDEN,
                NOT_FOUND,
                BAD_GRAPH_REQUEST,
                GRAPH_REQUEST_TIMEOUT,
                CONSTRAINT_VIOLATION
              ],
              url: "/:sourceKey/graph/run/query/:id",
              method: "POST",
              params
            });
          };
          return GraphQueryAPI2;
        }(request_1.Request)
      );
      exports.GraphQueryAPI = GraphQueryAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/GraphSchema/types.js
  var require_types12 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/GraphSchema/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DateTimeFormat = exports.DateFormat = exports.PropertyTypeName = exports.DataVisibility = exports.EntityType = exports.SamplingStatus = void 0;
      var SamplingStatus;
      (function(SamplingStatus2) {
        SamplingStatus2["ONGOING"] = "ongoing";
        SamplingStatus2["DONE"] = "done";
        SamplingStatus2["ERROR"] = "error";
      })(SamplingStatus = exports.SamplingStatus || (exports.SamplingStatus = {}));
      var EntityType;
      (function(EntityType2) {
        EntityType2["NODE"] = "node";
        EntityType2["EDGE"] = "edge";
      })(EntityType = exports.EntityType || (exports.EntityType = {}));
      var DataVisibility;
      (function(DataVisibility2) {
        DataVisibility2["NONE"] = "none";
        DataVisibility2["AVAILABLE"] = "available";
        DataVisibility2["SEARCHABLE"] = "searchable";
      })(DataVisibility = exports.DataVisibility || (exports.DataVisibility = {}));
      var PropertyTypeName;
      (function(PropertyTypeName2) {
        PropertyTypeName2["AUTO"] = "auto";
        PropertyTypeName2["BOOLEAN"] = "boolean";
        PropertyTypeName2["DATE"] = "date";
        PropertyTypeName2["DATETIME"] = "datetime";
        PropertyTypeName2["NUMBER"] = "number";
        PropertyTypeName2["STRING"] = "string";
      })(PropertyTypeName = exports.PropertyTypeName || (exports.PropertyTypeName = {}));
      var DateFormat;
      (function(DateFormat2) {
        DateFormat2["NATIVE"] = "native";
        DateFormat2["ISO"] = "iso";
        DateFormat2["DD_MM_YYYY"] = "dd/mm/yyyy";
        DateFormat2["MM_DD_YYYY"] = "mm/dd/yyyy";
        DateFormat2["TIMESTAMP"] = "timestamp";
        DateFormat2["TIMESTAMP_MS"] = "timestamp-ms";
      })(DateFormat = exports.DateFormat || (exports.DateFormat = {}));
      var DateTimeFormat;
      (function(DateTimeFormat2) {
        DateTimeFormat2["NATIVE"] = "native";
        DateTimeFormat2["ISO"] = "iso";
        DateTimeFormat2["TIMESTAMP"] = "timestamp";
        DateTimeFormat2["TIMESTAMP_MS"] = "timestamp-ms";
      })(DateTimeFormat = exports.DateTimeFormat || (exports.DateTimeFormat = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/GraphSchema/index.js
  var require_GraphSchema = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/GraphSchema/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.GraphSchemaAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types12(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var GUEST_DISABLED = response_1.LkErrorKey.GUEST_DISABLED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var STRICT_SCHEMA_REQUIRED = response_1.LkErrorKey.STRICT_SCHEMA_REQUIRED;
      var ALREADY_EXISTS = response_1.LkErrorKey.ALREADY_EXISTS;
      var GraphSchemaAPI = (
        /** @class */
        function(_super) {
          __extends(GraphSchemaAPI2, _super);
          function GraphSchemaAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          GraphSchemaAPI2.prototype.startSchemaSampling = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN],
              url: "/admin/:sourceKey/schema/sampling/start",
              method: "POST",
              params
            });
          };
          GraphSchemaAPI2.prototype.getSamplingStatus = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED],
              url: "/:sourceKey/schema/sampling/status",
              method: "GET",
              params
            });
          };
          GraphSchemaAPI2.prototype.stopSchemaSampling = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE],
              url: "/admin/:sourceKey/schema/sampling/stop",
              method: "POST",
              params
            });
          };
          GraphSchemaAPI2.prototype.updateSchemaSettings = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, STRICT_SCHEMA_REQUIRED],
              url: "/admin/:sourceKey/graph/schema/settings",
              method: "PATCH",
              params
            });
          };
          GraphSchemaAPI2.prototype.createType = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, ALREADY_EXISTS],
              url: "/admin/:sourceKey/graph/schema/:entityType/types",
              method: "POST",
              params
            });
          };
          GraphSchemaAPI2.prototype.updateType = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/admin/:sourceKey/graph/schema/:entityType/types",
              method: "PATCH",
              params
            });
          };
          GraphSchemaAPI2.prototype.createProperty = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, ALREADY_EXISTS],
              url: "/admin/:sourceKey/graph/schema/:entityType/properties",
              method: "POST",
              params
            });
          };
          GraphSchemaAPI2.prototype.updateProperty = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/admin/:sourceKey/graph/schema/:entityType/properties",
              method: "PATCH",
              params
            });
          };
          GraphSchemaAPI2.prototype.getTypes = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN],
              url: "/admin/:sourceKey/graph/schema/:entityType/types",
              method: "GET",
              params
            });
          };
          GraphSchemaAPI2.prototype.getTypesWithAccess = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED],
              url: "/:sourceKey/graph/schema/:entityType/types",
              method: "GET",
              params
            });
          };
          return GraphSchemaAPI2;
        }(request_1.Request)
      );
      exports.GraphSchemaAPI = GraphSchemaAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/License/types.js
  var require_types13 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/License/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.LicenseState = void 0;
      var LicenseState;
      (function(LicenseState2) {
        LicenseState2["VALID"] = "valid";
        LicenseState2["EXPIRED"] = "expired";
        LicenseState2["MISSING"] = "missing";
      })(LicenseState = exports.LicenseState || (exports.LicenseState = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/License/index.js
  var require_License = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/License/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.LicenseAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types13(), exports);
      var INVALID_LICENSE = response_1.LkErrorKey.INVALID_LICENSE;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var LicenseAPI = (
        /** @class */
        function(_super) {
          __extends(LicenseAPI2, _super);
          function LicenseAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          LicenseAPI2.prototype.getLicenseInfo = function() {
            return this.request({
              errors: [FORBIDDEN, UNAUTHORIZED],
              url: "/license",
              method: "GET"
            });
          };
          LicenseAPI2.prototype.saveLicenseIfMissing = function(params) {
            return this.request({
              errors: [INVALID_LICENSE, UNAUTHORIZED],
              url: "/license",
              method: "POST",
              params
            });
          };
          LicenseAPI2.prototype.updateLicense = function(params) {
            return this.request({
              errors: [INVALID_LICENSE, FORBIDDEN, UNAUTHORIZED],
              url: "/license",
              method: "PUT",
              params
            });
          };
          return LicenseAPI2;
        }(request_1.Request)
      );
      exports.LicenseAPI = LicenseAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Linkurious/types.js
  var require_types14 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Linkurious/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Linkurious/index.js
  var require_Linkurious = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Linkurious/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.LinkuriousAPI = void 0;
      var response_1 = require_response();
      var request_1 = require_request();
      __exportStar(require_types14(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var LinkuriousAPI = (
        /** @class */
        function(_super) {
          __extends(LinkuriousAPI2, _super);
          function LinkuriousAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          LinkuriousAPI2.prototype.getStatus = function() {
            return this.request({
              url: "/status",
              method: "GET"
            });
          };
          LinkuriousAPI2.prototype.getVersion = function() {
            return this.request({
              url: "/version",
              method: "GET"
            });
          };
          LinkuriousAPI2.prototype.sendAnalytics = function(params) {
            return this.request({
              url: "/tm",
              method: "POST",
              params
            });
          };
          LinkuriousAPI2.prototype.getReport = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN],
              url: "/admin/report",
              method: "GET",
              params
            });
          };
          LinkuriousAPI2.prototype.restartLinkurious = function() {
            return this.request({ errors: [UNAUTHORIZED, FORBIDDEN], url: "/admin/restart", method: "POST" });
          };
          LinkuriousAPI2.prototype.getCustomFiles = function(params) {
            return this.request({
              errors: [UNAUTHORIZED],
              url: "/customFiles",
              method: "GET",
              params
            });
          };
          return LinkuriousAPI2;
        }(request_1.Request)
      );
      exports.LinkuriousAPI = LinkuriousAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Plugin/types.js
  var require_types15 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Plugin/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.PluginState = exports.PluginRequestHeader = void 0;
      var PluginRequestHeader;
      (function(PluginRequestHeader2) {
        PluginRequestHeader2["USER_ID"] = "linkurious-user-id";
        PluginRequestHeader2["USER_EMAIL"] = "linkurious-user-email";
        PluginRequestHeader2["PLUGIN_SECRET"] = "linkurious-plugin-secret";
      })(PluginRequestHeader = exports.PluginRequestHeader || (exports.PluginRequestHeader = {}));
      var PluginState;
      (function(PluginState2) {
        PluginState2["RUNNING"] = "running";
        PluginState2["STOPPED"] = "stopped";
        PluginState2["ERROR_RUNTIME"] = "error-runtime";
        PluginState2["ERROR_MANIFEST"] = "error-manifest";
      })(PluginState = exports.PluginState || (exports.PluginState = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Plugin/index.js
  var require_Plugin = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Plugin/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.PluginAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types15(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var PluginAPI = (
        /** @class */
        function(_super) {
          __extends(PluginAPI2, _super);
          function PluginAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          PluginAPI2.prototype.getPlugins = function() {
            return this.request({ errors: [UNAUTHORIZED, FORBIDDEN], url: "/admin/plugins", method: "GET" });
          };
          PluginAPI2.prototype.restartAll = function() {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN],
              url: "/admin/plugins/restart-all",
              method: "POST"
            });
          };
          return PluginAPI2;
        }(request_1.Request)
      );
      exports.PluginAPI = PluginAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Search/types.js
  var require_types16 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Search/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SearchSyntaxErrorKey = exports.IndexationStatus = void 0;
      var IndexationStatus;
      (function(IndexationStatus2) {
        IndexationStatus2["ONGOING"] = "ongoing";
        IndexationStatus2["DONE"] = "done";
        IndexationStatus2["NEEDED"] = "needed";
      })(IndexationStatus = exports.IndexationStatus || (exports.IndexationStatus = {}));
      var SearchSyntaxErrorKey;
      (function(SearchSyntaxErrorKey2) {
        SearchSyntaxErrorKey2["INVALID_FUZZINESS"] = "invalid-fuzziness";
        SearchSyntaxErrorKey2["SEVERAL_FUZZINESS"] = "several-fuzziness";
        SearchSyntaxErrorKey2["INVALID_SCOPE"] = "invalid-scope";
        SearchSyntaxErrorKey2["CONFLICTING_SCOPES"] = "conflicting-scopes";
        SearchSyntaxErrorKey2["EDGES_NOT_SEARCHABLE"] = "edges-not-searchable";
        SearchSyntaxErrorKey2["INCOMPATIBLE_TYPE_STATEMENTS"] = "incompatible-type-statements";
        SearchSyntaxErrorKey2["UNSUPPORTED_OPERATOR"] = "unsupported-operator";
        SearchSyntaxErrorKey2["NODE_TYPE_NOT_SEARCHABLE"] = "node-type-not-searchable";
        SearchSyntaxErrorKey2["EDGE_TYPE_NOT_SEARCHABLE"] = "edge-type-not-searchable";
        SearchSyntaxErrorKey2["PROPERTIES_NOT_SEARCHABLE"] = "properties-not-searchable";
        SearchSyntaxErrorKey2["COMPARATOR_TYPE_MISMATCH"] = "comparator-type-mismatch";
        SearchSyntaxErrorKey2["COMPARATOR_WITH_STRING"] = "comparator-with-string";
        SearchSyntaxErrorKey2["EMPTY_SEARCH"] = "empty-search";
        SearchSyntaxErrorKey2["SYNTAX_ERROR"] = "syntax-error";
      })(SearchSyntaxErrorKey = exports.SearchSyntaxErrorKey || (exports.SearchSyntaxErrorKey = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Search/index.js
  var require_Search = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Search/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SearchAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types16(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var GUEST_DISABLED = response_1.LkErrorKey.GUEST_DISABLED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var ILLEGAL_SOURCE_STATE = response_1.LkErrorKey.ILLEGAL_SOURCE_STATE;
      var SOURCE_ACTION_NEEDED = response_1.LkErrorKey.SOURCE_ACTION_NEEDED;
      var MALFORMED_SEARCH_SYNTAX = response_1.LkErrorKey.MALFORMED_SEARCH_SYNTAX;
      var MISSING_SEARCH_ENTITIES = response_1.LkErrorKey.MISSING_SEARCH_ENTITIES;
      var SEARCH_DISABLED = response_1.LkErrorKey.SEARCH_DISABLED;
      var SearchAPI = (
        /** @class */
        function(_super) {
          __extends(SearchAPI2, _super);
          function SearchAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          SearchAPI2.prototype.startIndexation = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                ILLEGAL_SOURCE_STATE,
                SOURCE_ACTION_NEEDED
              ],
              url: "/:sourceKey/search/index",
              method: "POST",
              params
            });
          };
          SearchAPI2.prototype.updateIndex = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                FORBIDDEN,
                ILLEGAL_SOURCE_STATE,
                SOURCE_ACTION_NEEDED
              ],
              url: "/:sourceKey/search/index",
              method: "PATCH",
              params
            });
          };
          SearchAPI2.prototype.deleteIndex = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, ILLEGAL_SOURCE_STATE],
              url: "/:sourceKey/search/index",
              method: "DELETE",
              params
            });
          };
          SearchAPI2.prototype.getIndexationStatus = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED],
              url: "/:sourceKey/search/status",
              method: "GET",
              params
            });
          };
          SearchAPI2.prototype.search = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                GUEST_DISABLED,
                MALFORMED_SEARCH_SYNTAX,
                MISSING_SEARCH_ENTITIES,
                SEARCH_DISABLED
              ],
              url: "/:sourceKey/search/:type",
              method: "POST",
              params
            });
          };
          SearchAPI2.prototype.searchFull = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                GUEST_DISABLED,
                MALFORMED_SEARCH_SYNTAX,
                SEARCH_DISABLED
              ],
              url: "/:sourceKey/search/:type/full",
              method: "POST",
              params
            });
          };
          return SearchAPI2;
        }(request_1.Request)
      );
      exports.SearchAPI = SearchAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/User/types.js
  var require_types17 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/User/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SearchUsersSortBy = exports.SearchUsersSortDirection = void 0;
      var SearchUsersSortDirection;
      (function(SearchUsersSortDirection2) {
        SearchUsersSortDirection2["ASC"] = "asc";
        SearchUsersSortDirection2["DESC"] = "desc";
      })(SearchUsersSortDirection = exports.SearchUsersSortDirection || (exports.SearchUsersSortDirection = {}));
      var SearchUsersSortBy;
      (function(SearchUsersSortBy2) {
        SearchUsersSortBy2["ID"] = "id";
        SearchUsersSortBy2["USERNAME"] = "username";
        SearchUsersSortBy2["EMAIL"] = "email";
      })(SearchUsersSortBy = exports.SearchUsersSortBy || (exports.SearchUsersSortBy = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/User/index.js
  var require_User = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/User/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __assign = exports && exports.__assign || function() {
        __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
              if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.UserAPI = void 0;
      var response_1 = require_response();
      var request_1 = require_request();
      __exportStar(require_types17(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NOT_IMPLEMENTED = response_1.LkErrorKey.NOT_IMPLEMENTED;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var ALREADY_EXISTS = response_1.LkErrorKey.ALREADY_EXISTS;
      var INVALID_PARAMETER = response_1.LkErrorKey.INVALID_PARAMETER;
      var EMAIL_FORMAT = response_1.LkErrorKey.EMAIL_FORMAT;
      var UserAPI = (
        /** @class */
        function(_super) {
          __extends(UserAPI2, _super);
          function UserAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          UserAPI2.prototype.getUser = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, NOT_FOUND],
              url: "/admin/users/:id",
              method: "GET",
              params
            });
          };
          UserAPI2.prototype.searchUsersFull = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE],
              url: "/admin/users",
              method: "GET",
              params
            });
          };
          UserAPI2.prototype.searchUsersSimple = function(params) {
            var _a;
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE],
              url: "/:sourceKey/users",
              method: "GET",
              params: __assign(__assign({}, params), { excludedUserIds: (_a = params.excludedUserIds) === null || _a === void 0 ? void 0 : _a.join(",") })
            });
          };
          UserAPI2.prototype.createUser = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, ALREADY_EXISTS, EMAIL_FORMAT],
              url: "/admin/users",
              method: "POST",
              params
            });
          };
          UserAPI2.prototype.updateUser = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                FORBIDDEN,
                NOT_IMPLEMENTED,
                NOT_FOUND,
                INVALID_PARAMETER,
                EMAIL_FORMAT
              ],
              url: "/admin/users/:id",
              method: "PATCH",
              params
            });
          };
          UserAPI2.prototype.deleteUser = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, NOT_FOUND],
              url: "/admin/users/:id",
              method: "DELETE",
              params
            });
          };
          UserAPI2.prototype.getGroup = function(params) {
            return this.request({
              errors: [DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/admin/:sourceKey/groups/:id",
              method: "GET",
              params
            });
          };
          UserAPI2.prototype.getGroups = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN],
              url: "/admin/:sourceKey/groups",
              method: "GET",
              params
            });
          };
          UserAPI2.prototype.getGroupNames = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE],
              url: "/:sourceKey/groups",
              method: "GET",
              params
            });
          };
          UserAPI2.prototype.createGroup = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, ALREADY_EXISTS],
              url: "/admin/:sourceKey/groups",
              method: "POST",
              params
            });
          };
          UserAPI2.prototype.updateGroup = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/admin/:sourceKey/groups/:id",
              method: "PATCH",
              params
            });
          };
          UserAPI2.prototype.deleteGroup = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, FORBIDDEN, NOT_FOUND],
              url: "/admin/:sourceKey/groups/:id",
              method: "DELETE",
              params
            });
          };
          UserAPI2.prototype.mergeUsers = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN],
              url: "/admin/users/mergeUsers",
              method: "POST",
              params
            });
          };
          UserAPI2.prototype.getAssetTransferEligibleUsers = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, NOT_FOUND],
              url: "/admin/users/:id/sharedAssets/eligibleUsers",
              method: "GET",
              params
            });
          };
          UserAPI2.prototype.countSharedUserAssets = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, NOT_FOUND],
              url: "/admin/users/:id/sharedAssets",
              method: "GET",
              params
            });
          };
          UserAPI2.prototype.getGroupUsers = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/groups/:groupId/users",
              method: "GET",
              params
            });
          };
          return UserAPI2;
        }(request_1.Request)
      );
      exports.UserAPI = UserAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Visualization/types.js
  var require_types18 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Visualization/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.PopulateType = exports.ZoomLevel = exports.LayoutAlgorithm = exports.HierarchicalLayoutMode = exports.ForceLayoutMode = exports.VisualizationMode = exports.ShareVisualizationRight = exports.VisualizationRight = void 0;
      var VisualizationRight;
      (function(VisualizationRight2) {
        VisualizationRight2["READ"] = "read";
        VisualizationRight2["WRITE"] = "write";
        VisualizationRight2["WRITE_FILTERED"] = "write-filtered";
        VisualizationRight2["OWNER"] = "owner";
        VisualizationRight2["OWNER_FILTERED"] = "owner-filtered";
      })(VisualizationRight = exports.VisualizationRight || (exports.VisualizationRight = {}));
      var ShareVisualizationRight;
      (function(ShareVisualizationRight2) {
        ShareVisualizationRight2["READ"] = "read";
        ShareVisualizationRight2["WRITE"] = "write";
        ShareVisualizationRight2["OWNER"] = "owner";
      })(ShareVisualizationRight = exports.ShareVisualizationRight || (exports.ShareVisualizationRight = {}));
      var VisualizationMode;
      (function(VisualizationMode2) {
        VisualizationMode2["NODE_LINK"] = "nodelink";
        VisualizationMode2["GEO"] = "geo";
      })(VisualizationMode = exports.VisualizationMode || (exports.VisualizationMode = {}));
      var ForceLayoutMode;
      (function(ForceLayoutMode2) {
        ForceLayoutMode2["BEST"] = "best";
        ForceLayoutMode2["FAST"] = "fast";
      })(ForceLayoutMode = exports.ForceLayoutMode || (exports.ForceLayoutMode = {}));
      var HierarchicalLayoutMode;
      (function(HierarchicalLayoutMode2) {
        HierarchicalLayoutMode2["LR"] = "LR";
        HierarchicalLayoutMode2["RL"] = "RL";
        HierarchicalLayoutMode2["TB"] = "TB";
        HierarchicalLayoutMode2["BT"] = "BT";
      })(HierarchicalLayoutMode = exports.HierarchicalLayoutMode || (exports.HierarchicalLayoutMode = {}));
      var LayoutAlgorithm;
      (function(LayoutAlgorithm2) {
        LayoutAlgorithm2["FORCE"] = "force";
        LayoutAlgorithm2["HIERARCHICAL"] = "hierarchical";
        LayoutAlgorithm2["RADIAL"] = "radial";
      })(LayoutAlgorithm = exports.LayoutAlgorithm || (exports.LayoutAlgorithm = {}));
      var ZoomLevel;
      (function(ZoomLevel2) {
        ZoomLevel2["YEARS"] = "years";
        ZoomLevel2["MONTHS"] = "months";
        ZoomLevel2["DAYS"] = "days";
        ZoomLevel2["HOURS"] = "hours";
        ZoomLevel2["MINUTES"] = "minutes";
        ZoomLevel2["SECONDS"] = "seconds";
      })(ZoomLevel = exports.ZoomLevel || (exports.ZoomLevel = {}));
      var PopulateType;
      (function(PopulateType2) {
        PopulateType2["VISUALIZATION_ID"] = "visualizationId";
        PopulateType2["EXPAND_NODE_ID"] = "expandNodeId";
        PopulateType2["NODE_ID"] = "nodeId";
        PopulateType2["EDGE_ID"] = "edgeId";
        PopulateType2["SEARCH_NODE"] = "searchNodes";
        PopulateType2["SEARCH_EDGE"] = "searchEdges";
        PopulateType2["PATTERN"] = "pattern";
        PopulateType2["CASE_ID"] = "caseId";
      })(PopulateType = exports.PopulateType || (exports.PopulateType = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/Visualization/index.js
  var require_Visualization = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/Visualization/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.VisualizationAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types18(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var GUEST_DISABLED = response_1.LkErrorKey.GUEST_DISABLED;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var FOLDER_DELETION_FAILED = response_1.LkErrorKey.FOLDER_DELETION_FAILED;
      var ALREADY_EXISTS = response_1.LkErrorKey.ALREADY_EXISTS;
      var VISUALIZATION_LOCKED = response_1.LkErrorKey.VISUALIZATION_LOCKED;
      var INVALID_PARENT_FOLDER = response_1.LkErrorKey.INVALID_PARENT_FOLDER;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var VisualizationAPI = (
        /** @class */
        function(_super) {
          __extends(VisualizationAPI2, _super);
          function VisualizationAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          VisualizationAPI2.prototype.getVisualizationCount = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED],
              url: "/:sourceKey/visualizations/count",
              method: "GET",
              params
            });
          };
          VisualizationAPI2.prototype.getVisualization = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/visualizations/:id",
              method: "GET",
              params
            });
          };
          VisualizationAPI2.prototype.releaseEditLock = function(params) {
            if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
              return this.sendBeacon({
                errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
                url: "/:sourceKey/visualizations/:id/release-edit-lock",
                method: "POST",
                params
              });
            } else {
              return this.request({
                errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
                url: "/:sourceKey/visualizations/:id/release-edit-lock",
                method: "POST",
                params
              });
            }
          };
          VisualizationAPI2.prototype.createVisualization = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND, INVALID_PARENT_FOLDER],
              url: "/:sourceKey/visualizations",
              method: "POST",
              params
            });
          };
          VisualizationAPI2.prototype.duplicateVisualization = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/visualizations/:id/duplicate",
              method: "POST",
              params
            });
          };
          VisualizationAPI2.prototype.deleteVisualization = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND, VISUALIZATION_LOCKED],
              url: "/:sourceKey/visualizations/:id",
              method: "DELETE",
              params
            });
          };
          VisualizationAPI2.prototype.updateVisualization = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                NOT_FOUND,
                VISUALIZATION_LOCKED,
                INVALID_PARENT_FOLDER
              ],
              url: "/:sourceKey/visualizations/:id",
              method: "PATCH",
              params
            });
          };
          VisualizationAPI2.prototype.getSharedVisualizations = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE],
              url: "/:sourceKey/visualizations/shared",
              method: "GET",
              params
            });
          };
          VisualizationAPI2.prototype.createVisualizationFolder = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                ALREADY_EXISTS,
                NOT_FOUND,
                INVALID_PARENT_FOLDER
              ],
              url: "/:sourceKey/visualizations/folder",
              method: "POST",
              params
            });
          };
          VisualizationAPI2.prototype.updateVisualizationFolder = function(params) {
            return this.request({
              errors: [
                UNAUTHORIZED,
                DATA_SOURCE_UNAVAILABLE,
                NOT_FOUND,
                ALREADY_EXISTS,
                INVALID_PARENT_FOLDER
              ],
              url: "/:sourceKey/visualizations/folder/:id",
              method: "PATCH",
              params
            });
          };
          VisualizationAPI2.prototype.deleteVisualizationFolder = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND, FOLDER_DELETION_FAILED],
              url: "/:sourceKey/visualizations/folder/:id",
              method: "DELETE",
              params
            });
          };
          VisualizationAPI2.prototype.getVisualizationTree = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/visualizations/tree",
              method: "GET",
              params
            });
          };
          VisualizationAPI2.prototype.getSandbox = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, GUEST_DISABLED, NOT_FOUND],
              url: "/:sourceKey/sandbox",
              method: "GET",
              params
            });
          };
          VisualizationAPI2.prototype.updateSandbox = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE],
              url: "/:sourceKey/sandbox",
              method: "PATCH",
              params
            });
          };
          VisualizationAPI2.prototype.getVisualizationShares = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/visualizations/:id/shares",
              method: "GET",
              params
            });
          };
          VisualizationAPI2.prototype.shareVisualization = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/visualizations/:id/share/:userId",
              method: "PUT",
              params
            });
          };
          VisualizationAPI2.prototype.shareWithMultipleUsers = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/visualizations/:id/share",
              method: "PATCH",
              params
            });
          };
          VisualizationAPI2.prototype.unshareVisualization = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/visualizations/:id/share/:userId",
              method: "DELETE",
              params
            });
          };
          VisualizationAPI2.prototype.getWidget = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/widget/:widgetKey",
              method: "GET",
              params
            });
          };
          VisualizationAPI2.prototype.createWidget = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE],
              url: "/widget",
              method: "POST",
              params
            });
          };
          VisualizationAPI2.prototype.updateWidget = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/widget",
              method: "PUT",
              params
            });
          };
          VisualizationAPI2.prototype.deleteWidget = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/widget/:widgetKey",
              method: "DELETE",
              params
            });
          };
          VisualizationAPI2.prototype.createVisualizationComment = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/visualizations/:visualizationId/comments",
              method: "POST",
              params
            });
          };
          VisualizationAPI2.prototype.getVisualizationComments = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/visualizations/:visualizationId/comments",
              method: "GET",
              params
            });
          };
          VisualizationAPI2.prototype.deleteVisualizationComment = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND, FORBIDDEN],
              url: "/:sourceKey/visualizations/comments/:commentId",
              method: "DELETE",
              params
            });
          };
          return VisualizationAPI2;
        }(request_1.Request)
      );
      exports.VisualizationAPI = VisualizationAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/webhook/types.js
  var require_types19 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/webhook/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.WEBHOOK_EVENT_TYPES = void 0;
      exports.WEBHOOK_EVENT_TYPES = ["newCase", "newMatch", "caseStatusChange"];
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/webhook/index.js
  var require_webhook = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/webhook/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.WebhookAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      __exportStar(require_types19(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var WebhookAPI = (
        /** @class */
        function(_super) {
          __extends(WebhookAPI2, _super);
          function WebhookAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          WebhookAPI2.prototype.createWebhook = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE],
              url: "/admin/webhooks",
              method: "POST",
              params
            });
          };
          WebhookAPI2.prototype.deleteWebhook = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, NOT_FOUND],
              url: "/admin/webhooks/:webhookId",
              method: "DELETE",
              params
            });
          };
          WebhookAPI2.prototype.getWebhooks = function() {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN],
              url: "/admin/webhooks",
              method: "GET"
            });
          };
          WebhookAPI2.prototype.pingWebhook = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, NOT_FOUND],
              url: "/admin/webhooks/:webhookId/ping",
              method: "POST",
              params
            });
          };
          WebhookAPI2.prototype.getWebhookDeliveries = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, NOT_FOUND],
              url: "/admin/webhooks/:webhookId/deliveries",
              method: "GET",
              params
            });
          };
          return WebhookAPI2;
        }(request_1.Request)
      );
      exports.WebhookAPI = WebhookAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/mailer/index.js
  var require_mailer = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/mailer/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.MailerAPI = void 0;
      var request_1 = require_request();
      var response_1 = require_response();
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var SEND_MAIL_FAILED = response_1.LkErrorKey.SEND_MAIL_FAILED;
      var MailerAPI = (
        /** @class */
        function(_super) {
          __extends(MailerAPI2, _super);
          function MailerAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          MailerAPI2.prototype.checkEmailConfiguration = function() {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, SEND_MAIL_FAILED],
              url: "/admin/notifications/email/checkEmailConfiguration",
              method: "POST"
            });
          };
          return MailerAPI2;
        }(request_1.Request)
      );
      exports.MailerAPI = MailerAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/spaces/types.js
  var require_types20 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/spaces/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SpaceSortBy = void 0;
      var SpaceSortBy;
      (function(SpaceSortBy2) {
        SpaceSortBy2["ID"] = "id";
        SpaceSortBy2["TITLE"] = "title";
      })(SpaceSortBy = exports.SpaceSortBy || (exports.SpaceSortBy = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/spaces/index.js
  var require_spaces = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/spaces/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SpacesAPI = void 0;
      var response_1 = require_response();
      var request_1 = require_request();
      __exportStar(require_types20(), exports);
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var SPACE_DELETION_FAILED = response_1.LkErrorKey.SPACE_DELETION_FAILED;
      var SpacesAPI = (
        /** @class */
        function(_super) {
          __extends(SpacesAPI2, _super);
          function SpacesAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          SpacesAPI2.prototype.createSpace = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/admin/:sourceKey/spaces",
              method: "POST",
              params
            });
          };
          SpacesAPI2.prototype.updateSpace = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/admin/:sourceKey/spaces/:id",
              method: "PATCH",
              params
            });
          };
          SpacesAPI2.prototype.deleteSpace = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE, NOT_FOUND, SPACE_DELETION_FAILED],
              url: "/admin/:sourceKey/spaces/:id",
              method: "DELETE",
              params
            });
          };
          SpacesAPI2.prototype.getAllSpaces = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE],
              url: "/admin/:sourceKey/spaces",
              method: "GET",
              params
            });
          };
          SpacesAPI2.prototype.getSpacesSharedWithMe = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE],
              url: "/:sourceKey/spaces",
              method: "GET",
              params
            });
          };
          SpacesAPI2.prototype.getMySpacesWithTree = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE],
              url: "/:sourceKey/spaces/tree",
              method: "GET",
              params
            });
          };
          return SpacesAPI2;
        }(request_1.Request)
      );
      exports.SpacesAPI = SpacesAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/nodeGrouping/types.js
  var require_types21 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/nodeGrouping/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.NodeGroupingType = void 0;
      var NodeGroupingType;
      (function(NodeGroupingType2) {
        NodeGroupingType2["PROPERTY_KEY"] = "propertyKey";
      })(NodeGroupingType = exports.NodeGroupingType || (exports.NodeGroupingType = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/nodeGrouping/index.js
  var require_nodeGrouping = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/nodeGrouping/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.NodeGroupingAPI = void 0;
      __exportStar(require_types21(), exports);
      var response_1 = require_response();
      var request_1 = require_request();
      var UNAUTHORIZED = response_1.LkErrorKey.UNAUTHORIZED;
      var DATA_SOURCE_UNAVAILABLE = response_1.LkErrorKey.DATA_SOURCE_UNAVAILABLE;
      var ALREADY_EXISTS = response_1.LkErrorKey.ALREADY_EXISTS;
      var NOT_FOUND = response_1.LkErrorKey.NOT_FOUND;
      var FORBIDDEN = response_1.LkErrorKey.FORBIDDEN;
      var NodeGroupingAPI = (
        /** @class */
        function(_super) {
          __extends(NodeGroupingAPI2, _super);
          function NodeGroupingAPI2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          NodeGroupingAPI2.prototype.createNodeGroupingRule = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND, ALREADY_EXISTS],
              url: "/:sourceKey/nodeGroupings",
              method: "POST",
              params
            });
          };
          NodeGroupingAPI2.prototype.getNodeGroupingRules = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/nodeGroupings",
              method: "GET",
              params
            });
          };
          NodeGroupingAPI2.prototype.deleteNodeGroupingRule = function(params) {
            return this.request({
              errors: [UNAUTHORIZED, FORBIDDEN, DATA_SOURCE_UNAVAILABLE, NOT_FOUND],
              url: "/:sourceKey/nodeGroupings/:id",
              method: "DELETE",
              params
            });
          };
          return NodeGroupingAPI2;
        }(request_1.Request)
      );
      exports.NodeGroupingAPI = NodeGroupingAPI;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/index.js
  var require_src = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/index.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2)
              if (Object.prototype.hasOwnProperty.call(b2, p))
                d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
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
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      var __generator = exports && exports.__generator || function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1)
            throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f)
            throw new TypeError("Generator is already executing.");
          while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                return t;
              if (y = 0, t)
                op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return { value: op[1], done: false };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2])
                    _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5)
            throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.RestClient = void 0;
      var request = require_client();
      var errorListener_1 = require_errorListener();
      var AccessRight_1 = require_AccessRight();
      var Alert_1 = require_Alert();
      var Application_1 = require_Application();
      var Auth_1 = require_Auth();
      var Config_1 = require_Config();
      var CustomAction_1 = require_CustomAction();
      var DataSource_1 = require_DataSource();
      var favorite_1 = require_favorite();
      var GraphEdge_1 = require_GraphEdge();
      var GraphNode_1 = require_GraphNode();
      var GraphQuery_1 = require_GraphQuery();
      var GraphSchema_1 = require_GraphSchema();
      var License_1 = require_License();
      var Linkurious_1 = require_Linkurious();
      var Plugin_1 = require_Plugin();
      var Search_1 = require_Search();
      var User_1 = require_User();
      var Visualization_1 = require_Visualization();
      var webhook_1 = require_webhook();
      var utils_1 = require_utils3();
      var mailer_1 = require_mailer();
      var spaces_1 = require_spaces();
      var nodeGrouping_1 = require_nodeGrouping();
      var RestClient = (
        /** @class */
        function(_super) {
          __extends(RestClient2, _super);
          function RestClient2(options) {
            var _this = _super.call(this) || this;
            _this.clientState = {};
            _this.moduleProps = {
              baseUrl: (options === null || options === void 0 ? void 0 : options.baseUrl) ? (0, utils_1.endsWith)(options.baseUrl, "/") ? options.baseUrl + "api" : options.baseUrl + "/api" : "/api",
              agent: options && options.agent || request.agent(),
              clientState: _this.clientState,
              dispatchError: function(key, payload) {
                return _this.dispatchError(key, payload);
              }
            };
            _this.accessRight = new AccessRight_1.AccessRightAPI(_this.moduleProps);
            _this.alert = new Alert_1.AlertAPI(_this.moduleProps);
            _this.application = new Application_1.ApplicationAPI(_this.moduleProps);
            _this.auth = new Auth_1.AuthAPI(_this.moduleProps);
            _this.config = new Config_1.ConfigAPI(_this.moduleProps);
            _this.customAction = new CustomAction_1.CustomActionAPI(_this.moduleProps);
            _this.dataSource = new DataSource_1.DataSourceAPI(_this.moduleProps);
            _this.favorite = new favorite_1.FavoriteAPI(_this.moduleProps);
            _this.graphEdge = new GraphEdge_1.GraphEdgeAPI(_this.moduleProps);
            _this.graphNode = new GraphNode_1.GraphNodeAPI(_this.moduleProps);
            _this.graphQuery = new GraphQuery_1.GraphQueryAPI(_this.moduleProps);
            _this.graphSchema = new GraphSchema_1.GraphSchemaAPI(_this.moduleProps);
            _this.license = new License_1.LicenseAPI(_this.moduleProps);
            _this.linkurious = new Linkurious_1.LinkuriousAPI(_this.moduleProps);
            _this.plugin = new Plugin_1.PluginAPI(_this.moduleProps);
            _this.search = new Search_1.SearchAPI(_this.moduleProps);
            _this.mailer = new mailer_1.MailerAPI(_this.moduleProps);
            _this.user = new User_1.UserAPI(_this.moduleProps);
            _this.visualization = new Visualization_1.VisualizationAPI(_this.moduleProps);
            _this.webhook = new webhook_1.WebhookAPI(_this.moduleProps);
            _this.spaces = new spaces_1.SpacesAPI(_this.moduleProps);
            _this.nodeGrouping = new nodeGrouping_1.NodeGroupingAPI(_this.moduleProps);
            return _this;
          }
          RestClient2.prototype.init = function(data) {
            return __awaiter(this, void 0, void 0, function() {
              return __generator(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return [4, this.auth.login(data)];
                  case 1:
                    _a.sent();
                    return [4, this.dataSource.getDataSources({
                      withCaptions: true,
                      withStyles: true
                    })];
                  case 2:
                    _a.sent();
                    return [
                      2
                      /*return*/
                    ];
                }
              });
            });
          };
          RestClient2.prototype.setGuestMode = function(guestMode) {
            this.clientState.guestMode = guestMode;
          };
          RestClient2.prototype.setCurrentSource = function(dataSource) {
            this.clientState.currentSource = dataSource;
            try {
              if (dataSource.key && this.clientState.user) {
                localStorage.setItem("lk-lastSeenSourceKey-".concat(this.clientState.user.id), dataSource.key);
              }
            } catch (_) {
            }
          };
          RestClient2.getCurrentSource = function(dataSources, by, storage) {
            if (dataSources.length === 0) {
              throw new Error("RestClient::getCurrentSource - dataSources cannot be empty.");
            }
            if (by) {
              var source = void 0;
              if ("userId" in by) {
                try {
                  var sourceKey_1 = (storage || localStorage).getItem("lk-lastSeenSourceKey-".concat(by.userId));
                  source = (0, utils_1.find)(dataSources, function(s) {
                    return s.connected && s.key === sourceKey_1;
                  });
                } catch (_) {
                  source = void 0;
                }
              } else if ("sourceKey" in by) {
                source = (0, utils_1.find)(dataSources, function(s) {
                  return s.key === by.sourceKey;
                });
              } else {
                source = (0, utils_1.find)(dataSources, function(s) {
                  return s.configIndex === by.configIndex;
                });
              }
              if (source) {
                return source;
              }
            }
            for (var _i = 0, dataSources_1 = dataSources; _i < dataSources_1.length; _i++) {
              var firstConnected = dataSources_1[_i];
              if (firstConnected.connected) {
                return firstConnected;
              }
            }
            return dataSources[0];
          };
          return RestClient2;
        }(errorListener_1.ErrorListener)
      );
      exports.RestClient = RestClient;
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/displayTypes.js
  var require_displayTypes = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/displayTypes.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.AutoRangeScale = exports.OgmaEdgeShape = exports.OgmaNodeShape = exports.SelectorType = void 0;
      var SelectorType;
      (function(SelectorType2) {
        SelectorType2["ANY"] = "any";
        SelectorType2["NO_VALUE"] = "novalue";
        SelectorType2["NAN"] = "nan";
        SelectorType2["RANGE"] = "range";
        SelectorType2["IS"] = "is";
      })(SelectorType = exports.SelectorType || (exports.SelectorType = {}));
      var OgmaNodeShape;
      (function(OgmaNodeShape2) {
        OgmaNodeShape2["CIRCLE"] = "circle";
        OgmaNodeShape2["CROSS"] = "cross";
        OgmaNodeShape2["DIAMOND"] = "diamond";
        OgmaNodeShape2["PENTAGON"] = "pentagon";
        OgmaNodeShape2["SQUARE"] = "square";
        OgmaNodeShape2["STAR"] = "star";
        OgmaNodeShape2["EQUILATERAL"] = "equilateral";
      })(OgmaNodeShape = exports.OgmaNodeShape || (exports.OgmaNodeShape = {}));
      var OgmaEdgeShape;
      (function(OgmaEdgeShape2) {
        OgmaEdgeShape2["LINE"] = "line";
        OgmaEdgeShape2["ARROW"] = "arrow";
        OgmaEdgeShape2["TAPERED"] = "tapered";
        OgmaEdgeShape2["DASHED"] = "dashed";
        OgmaEdgeShape2["DOTTED"] = "dotted";
      })(OgmaEdgeShape = exports.OgmaEdgeShape || (exports.OgmaEdgeShape = {}));
      var AutoRangeScale;
      (function(AutoRangeScale2) {
        AutoRangeScale2["LINEAR"] = "linear";
        AutoRangeScale2["LOGARITHMIC"] = "logarithmic";
      })(AutoRangeScale = exports.AutoRangeScale || (exports.AutoRangeScale = {}));
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/api/graphItemTypes.js
  var require_graphItemTypes = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/api/graphItemTypes.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/src/http/types.js
  var require_types22 = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/src/http/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // ../../node_modules/@linkurious/rest-client/dist/index.js
  var require_dist = __commonJS({
    "../../node_modules/@linkurious/rest-client/dist/index.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar(require_src(), exports);
      __exportStar(require_AccessRight(), exports);
      __exportStar(require_Alert(), exports);
      __exportStar(require_Application(), exports);
      __exportStar(require_Auth(), exports);
      __exportStar(require_Config(), exports);
      __exportStar(require_CustomAction(), exports);
      __exportStar(require_DataSource(), exports);
      __exportStar(require_favorite(), exports);
      __exportStar(require_Search(), exports);
      __exportStar(require_GraphEdge(), exports);
      __exportStar(require_GraphNode(), exports);
      __exportStar(require_GraphQuery(), exports);
      __exportStar(require_GraphSchema(), exports);
      __exportStar(require_License(), exports);
      __exportStar(require_Linkurious(), exports);
      __exportStar(require_Plugin(), exports);
      __exportStar(require_User(), exports);
      __exportStar(require_Visualization(), exports);
      __exportStar(require_webhook(), exports);
      __exportStar(require_commonTypes(), exports);
      __exportStar(require_displayTypes(), exports);
      __exportStar(require_spaces(), exports);
      __exportStar(require_graphItemTypes(), exports);
      __exportStar(require_nodeGrouping(), exports);
      __exportStar(require_request(), exports);
      __exportStar(require_response(), exports);
      __exportStar(require_types22(), exports);
      __exportStar(require_src(), exports);
      __exportStar(require_errorListener(), exports);
    }
  });

  // ../backend/shared.ts
  function parseLinkuriousAPI(apiPromise, transform, errorHandler = (e) => {
    throw e;
  }) {
    return __async(this, null, function* () {
      let result;
      const apiResponse = yield apiPromise;
      if (apiResponse.isSuccess()) {
        result = transform ? transform(apiResponse.body) : apiResponse.body;
      } else {
        result = errorHandler(apiResponse);
      }
      return result;
    });
  }
  var init_shared = __esm({
    "../backend/shared.ts"() {
      "use strict";
    }
  });

  // src/helper.ts
  function expose(obj) {
    if (obj) {
      const dynamicWindow = window;
      for (const [key, value] of Object.entries(obj)) {
        dynamicWindow[key] = value;
      }
    }
    return window;
  }
  function startWaiting(hideApp, init) {
    nestedWaitings++;
    const spinner = document.getElementById("spinner");
    if (hideApp) {
      spinner.classList.add("hider");
    }
    spinner.classList.add("show");
    return new WaitingMessage(spinner, nestedWaitings, init);
  }
  function stopWaiting(updater) {
    nestedWaitings--;
    updater.destroy();
    if (nestedWaitings === 0) {
      const spinner = document.getElementById("spinner");
      spinner.classList.remove("hider");
      spinner.classList.remove("show");
    }
  }
  function runLongTask(_0, _1) {
    return __async(this, arguments, function* (init, cb, options = {}) {
      var _a, _b;
      const updater = startWaiting((_a = options.hideApp) != null ? _a : false, init);
      try {
        try {
          return yield Promise.resolve(typeof cb === "function" ? cb(updater) : cb);
        } catch (e) {
          if ((_b = options.defaultErrorHandler) != null ? _b : true) {
            yield showPopin("error", e instanceof Error ? e.toString() : JSON.stringify(e));
          }
          throw e;
        }
      } finally {
        stopWaiting(updater);
      }
    });
  }
  function showPopin(style, message, hideApp = false) {
    return new Promise((resolve, reject) => {
      if (popinResolvers) {
        popinResolvers.resolve(false);
      }
      popinResolvers = { resolve, reject };
      const popin = document.getElementById("popin");
      const close = popin.querySelector(".close");
      const titleElement = popin.querySelector(".popinTitle");
      const messageElement = popin.querySelector(".popinMessage");
      titleElement.textContent = style === "info" ? "Information" : "Error";
      messageElement.replaceChildren();
      for (const line of message.split("\n")) {
        const p = document.createElement("p");
        p.textContent = line;
        messageElement.appendChild(p);
      }
      if (hideApp) {
        close.classList.add("none");
        popin.classList.add("hider");
      } else {
        close.classList.remove("none");
        popin.classList.remove("hider");
      }
      popin.classList.add("show");
    });
  }
  function closePopin() {
    var _a;
    (_a = this.closest(".popin")) == null ? void 0 : _a.classList.remove("show");
    if (popinResolvers) {
      popinResolvers.resolve(true);
      popinResolvers = void 0;
    }
  }
  var WaitingMessage, nestedWaitings, popinResolvers;
  var init_helper = __esm({
    "src/helper.ts"() {
      "use strict";
      WaitingMessage = class {
        constructor(container, nestLevel, init) {
          this.nestLevel = nestLevel;
          this.destroyed = false;
          this.data = init;
          const messageContainer = container.querySelector(".messageDisplay");
          this.message = document.createElement("p");
          this.message.classList.add("none");
          messageContainer.appendChild(this.message);
        }
        update(message) {
          if (this.destroyed) {
            throw new Error("Task already completed");
          }
          if (message === "" || message === null || message === void 0) {
            this.message.classList.add("none");
          } else {
            this.message.textContent = message;
            this.message.classList.remove("none");
          }
        }
        destroy() {
          this.message.remove();
          this.destroyed = true;
        }
      };
      nestedWaitings = 0;
      popinResolvers = void 0;
      window.addEventListener("load", () => {
        document.querySelectorAll(".popin .close").forEach((p) => p.addEventListener("click", closePopin));
      });
    }
  });

  // src/index.ts
  var require_src2 = __commonJS({
    "src/index.ts"(exports) {
      var import_rest_client = __toESM(require_dist());
      init_shared();
      init_helper();
      function closePopup() {
        return __async(this, null, function* () {
          var _a;
          (_a = this.closest(".popin")) == null ? void 0 : _a.classList.remove("show");
        });
      }
      function addKey() {
        void runLongTask(
          null,
          () => __async(this, null, function* () {
            const addKeyForm = document.getElementById("addKeyForm");
            const mode = addKeyForm.getAttribute("mode") || "create";
            if (addKeyForm.reportValidity()) {
              const name = document.getElementById("keyName");
              const rightsContainer = document.getElementById("accessRightsContainer");
              const tagContainer = document.getElementById("tagContainer");
              const tags = Array.from(tagContainer.querySelectorAll(".tag"));
              let groups = [];
              for (const tag of tags) {
                const groupId = tag.getAttribute("group-id");
                if (groupId) {
                  groups.push(parseInt(groupId));
                }
              }
              const rights = getSelectedAccessRights();
              const errorBox = document.getElementById("errorBox");
              const errorTitle = document.getElementById("errorTitle");
              const errorMessage = document.getElementById("errorMessage");
              try {
                if (mode === "create") {
                  const body = {
                    name: name.value,
                    rights,
                    groups
                  };
                  yield parseLinkuriousAPI(
                    window.restClient.application.createApplication(body),
                    () => __async(this, null, function* () {
                      errorBox.classList.remove("show");
                      errorTitle.textContent = "";
                      errorMessage.textContent = "";
                      const table = document.querySelector("#keysTable tbody");
                      table.innerHTML = "";
                      yield refreshKeysTable();
                      closePopup.call(name.parentElement);
                      void showPopin("info", "API Key created successfully");
                    }),
                    (e) => __async(this, null, function* () {
                      errorBox.classList.add("show");
                      errorTitle.textContent = "Error";
                      errorMessage.textContent = e.body.message;
                    })
                  );
                } else if (mode === "update") {
                  const body = {
                    id: parseInt(addKeyForm.getAttribute("key-id") || "0"),
                    name: name.value,
                    rights,
                    groups
                  };
                  yield parseLinkuriousAPI(
                    window.restClient.application.updateApplication(body),
                    () => __async(this, null, function* () {
                      errorBox.classList.remove("show");
                      errorTitle.textContent = "";
                      errorMessage.textContent = "";
                      const table = document.querySelector("#keysTable tbody");
                      table.innerHTML = "";
                      yield refreshKeysTable();
                      closePopup.call(name.parentElement);
                      void showPopin("info", "API Key updated successfully");
                    }),
                    (e) => __async(this, null, function* () {
                      errorBox.classList.add("show");
                      errorTitle.textContent = "Error";
                      errorMessage.textContent = e.body.message;
                    })
                  );
                }
              } catch (e) {
                errorBox.classList.add("show");
                errorTitle.textContent = "Error";
                errorMessage.textContent = e.message;
              }
            }
          }),
          { defaultErrorHandler: true }
        );
      }
      function addGroup() {
        const addGroupsForm = document.getElementById("addGroupsForm");
        if (addGroupsForm.reportValidity()) {
          const container = document.getElementById("tagContainer");
          const groupSelect = document.getElementById("groupSelect");
          const datasource = document.getElementById("datasourceSelect");
          const tag = document.createElement("div");
          tag.classList.add("tag");
          tag.setAttribute("group-id", groupSelect.getAttribute("group-id") || "");
          const tagText = document.createElement("div");
          tagText.classList.add("tagText");
          const tagClose = document.createElement("a");
          tagClose.classList.add("tagClose");
          tag.appendChild(tagText);
          tag.appendChild(tagClose);
          tagClose.onclick = () => {
            tag.remove();
          };
          tagText.textContent = `${groupSelect.value} (${datasource.value})`;
          groupSelect.innerHTML = '<option value="" disabled selected>Select a Group</option>';
          groupSelect.selectedIndex = 0;
          datasource.selectedIndex = 0;
          container.appendChild(tag);
        }
      }
      function showFullpagePopup(mode = "create", blockApp = false) {
        return __async(this, null, function* () {
          const popup = document.getElementById("createView");
          const close = popup.querySelector(".close");
          const addButton = document.getElementById("addWebhook");
          if (mode === "create") {
            addButton.innerText = "CREATE";
          } else if (mode === "update") {
            addButton.innerText = "UPDATE";
          }
          const toggleBtns = popup.querySelectorAll("#accessRightsContainer .collapse-toggle");
          for (const btn of Array.from(toggleBtns)) {
            if (btn.getAttribute("aria-expanded") === "true") {
              btn.click();
            }
          }
          if (blockApp) {
            close.classList.add(".none");
            popup.classList.add("hider");
          } else {
            close.classList.remove(".none");
            popup.classList.remove("hider");
          }
          if (mode === "create") {
            yield resetKeyForm();
          }
          popup.classList.add("show");
        });
      }
      function resetKeyForm() {
        return __async(this, null, function* () {
          const form = document.getElementById("addKeyForm");
          form.setAttribute("mode", "create");
          form.removeAttribute("key-id");
          const name = document.getElementById("keyName");
          const rightsContainer = document.getElementById("accessRightsContainer");
          const tagContainer = document.getElementById("tagContainer");
          const container = document.getElementById("tagContainer");
          container.innerHTML = "";
          name.value = "";
          rightsContainer.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
            cb.checked = false;
            cb.indeterminate = false;
          });
          const datasourceSelect = document.getElementById("datasourceSelect");
          const groupSelect = document.getElementById("groupSelect");
          datasourceSelect.selectedIndex = 0;
          groupSelect.innerHTML = '<option value="" disabled selected>Select a Group</option>';
          groupSelect.removeAttribute("group-id");
        });
      }
      function loadGroupList() {
        return __async(this, null, function* () {
          const groupsMap = yield fetch(`api/groups`);
          const groupsData = yield groupsMap.json();
          const datasourceSelect = document.getElementById("datasourceSelect");
          const groupSelect = document.getElementById("groupSelect");
          for (const datasource of groupsData.datasources) {
            const option = document.createElement("option");
            datasourceSelect.appendChild(option);
            if (datasource.connected === false) {
              option.disabled = true;
              option.textContent = datasource.name + " (not connected)";
            } else {
              option.value = datasource.sourcekey;
              option.textContent = datasource.name + " (" + datasource.sourcekey + ")";
            }
          }
          datasourceSelect.addEventListener("change", function() {
            var _a;
            groupSelect.innerHTML = '<option value="" disabled selected>Select a Group</option>';
            const selectedSourceKey = this.value;
            const groups = ((_a = groupsData.datasources.find((ds) => ds.sourcekey === selectedSourceKey)) == null ? void 0 : _a.groups) || [];
            for (const group2 of groups) {
              const option = document.createElement("option");
              groupSelect.appendChild(option);
              option.setAttribute("group-id", group2.id);
              option.value = group2.name;
              option.textContent = group2.name + " (" + group2.id + ")";
            }
          });
          groupSelect.addEventListener("change", function() {
            const selectedOption = this.options[this.selectedIndex];
            this.setAttribute("group-id", selectedOption.getAttribute("group-id") || "");
          });
        });
      }
      function fillKeyForm(keyId) {
        return __async(this, null, function* () {
          const currentKeyResponse = yield fetch(`api/keys/${keyId}`);
          const currentKey = yield currentKeyResponse.json();
          const addKeyForm = document.getElementById("addKeyForm");
          addKeyForm.setAttribute("key-id", keyId.toString());
          addKeyForm.setAttribute("mode", "update");
          const name = document.getElementById("keyName");
          name.value = currentKey.name || "";
          const currentRights = currentKey.rights || [];
          const rightsContainer = document.getElementById("accessRightsContainer");
          rightsContainer.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
            cb.checked = false;
            cb.indeterminate = false;
          });
          for (const right in currentRights) {
            if (currentRights[right].counter === 1 && currentRights[right].actions.length === 0) {
              const parentCheckbox = document.getElementById(right);
              parentCheckbox.click();
            } else {
              for (const action of currentRights[right].actions) {
                const actionCheckbox = document.getElementById(`${right}.${action}`);
                actionCheckbox.click();
              }
            }
          }
          const tagContainer = document.getElementById("tagContainer");
          tagContainer.innerHTML = "";
          const groups = currentKey.groups || [];
          for (const group2 of groups) {
            const tag = document.createElement("div");
            tag.classList.add("tag");
            tag.setAttribute("group-id", group2.id.toString());
            const tagText = document.createElement("div");
            tagText.classList.add("tagText");
            const tagClose = document.createElement("a");
            tagClose.classList.add("tagClose");
            tag.appendChild(tagText);
            tag.appendChild(tagClose);
            tagClose.onclick = () => {
              tag.remove();
            };
            tagText.textContent = `${group2.name} (${group2.sourceKey || "*"})`;
            tagContainer.appendChild(tag);
          }
          showFullpagePopup("update");
        });
      }
      function refreshKeysTable() {
        return __async(this, null, function* () {
          yield runLongTask(null, (updater) => __async(this, null, function* () {
            updater.update("Reload API Keys...");
            const response = yield fetch(`api/keys`);
            const keysList = yield response.json();
            const table = document.querySelector("#keysTable tbody");
            const tbody = document.createElement("tbody");
            for (const key of keysList) {
              const tr = document.createElement("tr");
              tr.setAttribute("key-id", key.id);
              const name = document.createElement("td");
              name.textContent = key.name;
              tr.append(name);
              const state = document.createElement("td");
              if (key.enabled) {
                state.textContent = "Enabled";
              } else {
                state.textContent = "Disabled";
              }
              tr.append(state);
              const groups = document.createElement("td");
              groups.style.whiteSpace = "nowrap";
              let groupsRedacted = "";
              if (key.groups !== void 0) {
                for (const group2 of key.groups) {
                  groupsRedacted += `${group2.name} [${group2.sourceKey || "*"}]<br><hr>`;
                }
                groups.innerHTML = groupsRedacted.slice(0, -4);
                tr.append(groups);
              }
              const rights = document.createElement("td");
              let keyRights = "";
              if (key.rights !== void 0) {
                for (const right in key.rights) {
                  let currentBadge = createBadge(right, key.rights[right].counter, key.rights[right].actions.join(", "));
                  rights.append(currentBadge);
                }
                tr.append(rights);
              }
              let apiKey = document.createElement("td");
              apiKey.style.whiteSpace = "nowrap";
              apiKey.textContent = key.apiKey;
              apiKey = maskKey(apiKey);
              tr.append(apiKey);
              const actions = document.createElement("td");
              const updateButton = document.createElement("button");
              updateButton.classList.add("button", "hasNext");
              updateButton.textContent = "Update";
              updateButton.addEventListener(
                "click",
                () => fillKeyForm(key.id)
              );
              actions.append(updateButton);
              const enableButton = document.createElement("button");
              enableButton.classList.add("button");
              if (key.enabled) {
                enableButton.textContent = "Disable";
                enableButton.classList.add("red");
              } else {
                enableButton.textContent = "Enable";
                enableButton.classList.add("green");
              }
              enableButton.addEventListener(
                "click",
                () => fillKeyForm(key.id)
              );
              actions.append(enableButton);
              tr.append(actions);
              tbody.appendChild(tr);
            }
            table.replaceWith(tbody);
          }));
        });
      }
      function init() {
        return __async(this, null, function* () {
          expose({ restClient: new import_rest_client.RestClient({ baseUrl: "../.." }) });
          yield runLongTask(null, () => __async(this, null, function* () {
            var _a, _b;
            document.getElementById("addButton").onclick = () => showFullpagePopup();
            document.querySelectorAll(".popin .cancelButton").forEach((p) => p.addEventListener("click", closePopup));
            (_a = document.getElementById("addGroup")) == null ? void 0 : _a.addEventListener("click", addGroup);
            (_b = document.getElementById("addWebhook")) == null ? void 0 : _b.addEventListener("click", addKey);
            yield refreshKeysTable();
            yield loadGroupList();
            yield generateAccessRightsForm();
          }));
        });
      }
      function maskKey(cell) {
        const key = cell.textContent || "";
        cell.textContent = "";
        const container = document.createElement("span");
        const masked = key.slice(0, 5) + "..." + key.slice(-5);
        container.style.cursor = "pointer";
        container.style.position = "relative";
        const tooltip = document.createElement("span");
        tooltip.className = "tooltip";
        tooltip.textContent = "Copied!";
        tooltip.style.display = "none";
        container.onclick = () => __async(this, null, function* () {
          yield navigator.clipboard.writeText(key);
          container.title = "Copied";
          tooltip.style.display = "";
          tooltip.style.opacity = "0.8";
          setTimeout(() => {
            container.title = "Copy";
            tooltip.style.display = "none";
            tooltip.style.opacity = "0";
          }, 1e3);
        });
        container.textContent = masked;
        container.title = "Copy";
        container.appendChild(tooltip);
        cell.appendChild(container);
        return cell;
      }
      function createBadge(name, number, extraContent) {
        const badge = document.createElement("div");
        badge.className = "badge";
        const nameSpan = document.createElement("span");
        nameSpan.textContent = name;
        badge.appendChild(nameSpan);
        const numberDiv = document.createElement("div");
        numberDiv.className = "number";
        numberDiv.textContent = number.toString();
        badge.appendChild(numberDiv);
        if (extraContent != null && extraContent.length > 0) {
          const extraDiv = document.createElement("div");
          extraDiv.className = "extra-content";
          extraDiv.textContent = extraContent;
          badge.appendChild(extraDiv);
        }
        return badge;
      }
      function groupActions(actionList) {
        return actionList.reduce((acc, currentAction) => {
          const parts = currentAction.split(".");
          let prefix;
          let action;
          if (parts.length === 1) {
            prefix = currentAction;
            action = null;
          } else {
            prefix = parts[0];
            action = parts.slice(1).join(".");
          }
          if (!acc[prefix]) {
            acc[prefix] = { counter: 0, actions: [] };
          }
          acc[prefix].counter += 1;
          if (action) {
            acc[prefix].actions.push(action);
          }
          return acc;
        }, {});
      }
      function generateAccessRightsForm() {
        const container = document.getElementById("accessRightsContainer");
        container.innerHTML = "";
        const data = groupActions(Object.values(import_rest_client.ApiRight).sort());
        const columnsWrapper = document.createElement("div");
        columnsWrapper.className = "rights-wrapper";
        const prefixes = Object.keys(data);
        const mid = Math.ceil(prefixes.length / 2);
        const columns = [prefixes.slice(0, mid), prefixes.slice(mid)];
        for (const colPrefixes of columns) {
          const ul = document.createElement("ul");
          ul.className = "tree-multiselect";
          for (const prefix of colPrefixes) {
            const li = document.createElement("li");
            li.className = "tree-group";
            const toggleBtn = document.createElement("button");
            toggleBtn.type = "button";
            toggleBtn.className = "collapse-toggle";
            if (data[prefix].actions.length > 0) {
              toggleBtn.setAttribute("aria-expanded", "false");
              toggleBtn.textContent = "\u25BA";
            } else {
              toggleBtn.textContent = "";
              toggleBtn.disabled = true;
              toggleBtn.style.visibility = "hidden";
            }
            const groupLabel = document.createElement("label");
            groupLabel.className = "group-label";
            const groupCheckbox = document.createElement("input");
            groupCheckbox.type = "checkbox";
            groupCheckbox.className = "group-checkbox";
            groupCheckbox.value = prefix;
            groupCheckbox.id = prefix;
            groupLabel.appendChild(groupCheckbox);
            groupLabel.appendChild(document.createTextNode(prefix));
            li.appendChild(toggleBtn);
            li.appendChild(groupLabel);
            let subUl;
            if (data[prefix].actions.length > 0) {
              subUl = document.createElement("ul");
              subUl.className = "tree-sublist";
              subUl.style.display = "none";
              for (const action of data[prefix].actions) {
                const subLi = document.createElement("li");
                subLi.className = "tree-action";
                const actionLabel = document.createElement("label");
                actionLabel.className = "action-label";
                const actionCheckbox = document.createElement("input");
                actionCheckbox.type = "checkbox";
                actionCheckbox.className = "action-checkbox";
                actionCheckbox.value = `${prefix}.${action}`;
                actionCheckbox.id = `${prefix}.${action}`;
                actionLabel.appendChild(actionCheckbox);
                actionLabel.appendChild(document.createTextNode(action));
                subLi.appendChild(actionLabel);
                subUl.appendChild(subLi);
              }
              li.appendChild(subUl);
              toggleBtn.onclick = () => {
                if (subUl.style.display === "none") {
                  subUl.style.display = "";
                  toggleBtn.setAttribute("aria-expanded", "true");
                  toggleBtn.textContent = "\u25BC";
                } else {
                  subUl.style.display = "none";
                  toggleBtn.setAttribute("aria-expanded", "false");
                  toggleBtn.textContent = "\u25BA";
                }
              };
            }
            ul.appendChild(li);
          }
          columnsWrapper.appendChild(ul);
        }
        container.appendChild(columnsWrapper);
        container.querySelectorAll(".group-checkbox").forEach((groupCheckbox) => {
          groupCheckbox.addEventListener("change", function() {
            var _a;
            const sublist = (_a = this.closest("li")) == null ? void 0 : _a.querySelectorAll(".action-checkbox");
            if (sublist) {
              sublist.forEach((cb) => {
                cb.checked = this.checked;
              });
            }
            this.indeterminate = false;
          });
        });
        function getCheckedAccessRightsCheckboxes() {
          const container2 = document.getElementById("accessRightsContainer");
          return Array.from(container2.querySelectorAll('input[type="checkbox"]:checked'));
        }
        container.querySelectorAll(".action-checkbox").forEach((actionCheckbox) => {
          actionCheckbox.addEventListener("change", function() {
            const groupLi = this.closest(".tree-group");
            const groupCheckbox = groupLi == null ? void 0 : groupLi.querySelector(".group-checkbox");
            const childCheckboxes = groupLi == null ? void 0 : groupLi.querySelectorAll(".action-checkbox");
            if (groupCheckbox && childCheckboxes) {
              const checkedCount = Array.from(childCheckboxes).filter((cb) => cb.checked).length;
              if (checkedCount === childCheckboxes.length) {
                groupCheckbox.checked = true;
                groupCheckbox.indeterminate = false;
              } else if (checkedCount === 0) {
                groupCheckbox.checked = false;
                groupCheckbox.indeterminate = false;
              } else {
                groupCheckbox.checked = false;
                groupCheckbox.indeterminate = true;
              }
            }
          });
        });
      }
      function getSelectedAccessRights() {
        const container = document.getElementById("accessRightsContainer");
        const selected = [];
        container.querySelectorAll(".tree-group").forEach((groupLi) => {
          var _a;
          const groupCheckbox = groupLi.querySelector(".group-checkbox");
          const actionCheckboxes = groupLi.querySelectorAll(".action-checkbox");
          if (actionCheckboxes.length === 0) {
            if (groupCheckbox.checked) {
              const label = groupLi.querySelector("label:last-child");
              if (label) {
                selected.push(((_a = label.textContent) == null ? void 0 : _a.trim()) || "");
              }
            }
          } else {
            actionCheckboxes.forEach((cb) => {
              if (cb.checked) {
                selected.push(cb.value);
              }
            });
          }
        });
        return selected;
      }
      window.addEventListener("load", () => {
        void runLongTask(
          null,
          (updater) => __async(exports, null, function* () {
            updater.update("App initialization...");
            try {
              const response = yield fetch(`api/authorize`);
              if (response.status === 204) {
                yield Promise.resolve(init());
              } else {
                void showPopin(
                  "error",
                  "You don't have access to this plugin. Please contact your administrator.",
                  true
                );
              }
            } catch (e) {
              void showPopin("error", e instanceof Error ? e.message : JSON.stringify(e), true);
            }
          }),
          { hideApp: true }
        );
      });
    }
  });
  require_src2();
})();
//# sourceMappingURL=index.js.map
