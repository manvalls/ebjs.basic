(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('vz.test').run(function(){
  require('ebjs.basic.test');
});


},{"ebjs.basic.test":8,"vz.test":35}],2:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":4}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("NPEqJt"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":3,"NPEqJt":7,"inherits":5}],5:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],6:[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

},{}],7:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],8:[function(require,module,exports){
var Test = require('vz.test');

require('ebjs.basic');

new Test('Number',function(){
  require('./main/Number.js');
});

new Test('Boolean',function(){
  require('./main/Boolean.js');
});

new Test('String',function(){
  require('./main/String.js');
});

new Test('Object',function(){
  require('./main/Object.js');
});

new Test('Array',function(){
  require('./main/Array.js');
});

new Test('null',function(){
  require('./main/null.js');
});

new Test('undefined',function(){
  require('./main/undefined.js');
});


},{"./main/Array.js":9,"./main/Boolean.js":10,"./main/Number.js":11,"./main/Object.js":12,"./main/String.js":13,"./main/null.js":14,"./main/undefined.js":15,"ebjs.basic":16,"vz.test":35}],9:[function(require,module,exports){
var test = require('ebjs.common-test');

test([[1,2,3]],true);

},{"ebjs.common-test":24}],10:[function(require,module,exports){
var test = require('ebjs.common-test');

test([true,false]);

},{"ebjs.common-test":24}],11:[function(require,module,exports){
var test = require('ebjs.common-test');

test([50]);

},{"ebjs.common-test":24}],12:[function(require,module,exports){
var test = require('ebjs.common-test');

test([{foo: 'bar'}],true);

},{"ebjs.common-test":24}],13:[function(require,module,exports){
var test = require('ebjs.common-test');

test(['asd']);


},{"ebjs.common-test":24}],14:[function(require,module,exports){
var test = require('ebjs.common-test');

test([null]);

},{"ebjs.common-test":24}],15:[function(require,module,exports){
var test = require('ebjs.common-test');

test([undefined]);


},{"ebjs.common-test":24}],16:[function(require,module,exports){
require('./main/Number.js');
require('./main/Boolean.js');
require('./main/String.js');
require('./main/Object.js');
require('./main/Array.js');
require('./main/null.js');
require('./main/undefined.js');

},{"./main/Array.js":17,"./main/Boolean.js":18,"./main/Number.js":19,"./main/Object.js":20,"./main/String.js":21,"./main/null.js":22,"./main/undefined.js":23}],17:[function(require,module,exports){
var ebjs = require('ebjs');

ebjs.define(Array,5,function packer(args,vars){
  var ret,elem;
  
  switch(this.step){
    case 'start':
      vars.arr = args[0].slice();
      ret = this.pack(Number,vars.arr.length,this.goTo('pack',vars,packer));
      if(ret === ebjs.deferred) return;
      
    case 'pack':
      
      while(elem = vars.arr.shift()){
        ret = this.pack(elem,this.goTo('pack',vars,packer));
        if(ret === ebjs.deferred) return;
      }
      
      this.end();
  }
  
},function unpacker(args,vars){
  var ret;
  
  switch(this.step){
    case 'start':
      this.start(vars.arr = []);
      ret = this.unpack(Number,this.goTo('pre-unpack',unpacker,vars));
      if(ret === ebjs.deferred) return;
      vars.n = ret;
    
    case 'pre-unpack':
      vars.n = vars.n || args[0] || 0;
    
    case 'unpack':
      
      if(vars.add) vars.arr.push(args[0]);
      
      while(vars.n-- > 0){
        vars.add = false;
        
        ret = this.unpack(this.goTo('unpack',unpacker,vars));
        if(ret === undefined){
          vars.add = true;
          return;
        }
        
        vars.arr.push(ret);
      }
      
      this.end(vars.arr);
  }
  
});



},{"ebjs":25}],18:[function(require,module,exports){
var ebjs = require('ebjs');

ebjs.define(Boolean,2,[Number],function(bool){
  return [bool?1:0];
},function(number){
  return !!number;
});



},{"ebjs":25}],19:[function(require,module,exports){
var ebjs = require('ebjs'),
    numberBuffer = new DataView(new ArrayBuffer(8));

// Number <-> Buffer

{
  
  // Float64
  
  function bytesToFloat64(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getFloat64(0,true);
  }
  
  function float64ToBuffer(num){
    numberBuffer.setFloat64(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,8);
    return buffer;
  }
  
  function toFloat64(num){
    numberBuffer.setFloat64(0,num,true);
    return numberBuffer.getFloat64(0,true);
  }
  
  // Float32
  
  function bytesToFloat32(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getFloat32(0,true);
  }
  
  function float32ToBuffer(num){
    numberBuffer.setFloat32(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,4);
    return buffer;
  }
  
  function toFloat32(num){
    numberBuffer.setFloat32(0,num,true);
    return numberBuffer.getFloat32(0,true);
  }
  
  // Int32
  
  function bytesToInt32(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getInt32(0,true);
  }
  
  function int32ToBuffer(num){
    numberBuffer.setInt32(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,4);
    return buffer;
  }
  
  function toInt32(num){
    numberBuffer.setInt32(0,num,true);
    return numberBuffer.getInt32(0,true);
  }
  
  // Unsigned Int32
  
  function bytesToUint32(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getUint32(0,true);
  }
  
  function Uint32ToBuffer(num){
    numberBuffer.setUint32(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,4);
    return buffer;
  }
  
  function toUint32(num){
    numberBuffer.setUint32(0,num,true);
    return numberBuffer.getUint32(0,true);
  }
  
  // Int16
  
  function bytesToInt16(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getInt16(0,true);
  }
  
  function int16ToBuffer(num){
    numberBuffer.setInt16(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,2);
    return buffer;
  }
  
  function toInt16(num){
    numberBuffer.setInt16(0,num,true);
    return numberBuffer.getInt16(0,true);
  }
  
  // Unsigned Int16
  
  function bytesToUint16(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getUint16(0,true);
  }
  
  function Uint16ToBuffer(num){
    numberBuffer.setUint16(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,2);
    return buffer;
  }
  
  function toUint16(num){
    numberBuffer.setUint16(0,num,true);
    return numberBuffer.getUint16(0,true);
  }
  
  // Int8
  
  function bytesToInt8(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getInt8(0,true);
  }
  
  function int8ToBuffer(num){
    numberBuffer.setInt8(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,1);
    return buffer;
  }
  
  function toInt8(num){
    numberBuffer.setInt8(0,num,true);
    return numberBuffer.getInt8(0,true);
  }
  
  // Unsigned Int8
  
  function bytesToUint8(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getUint8(0,true);
  }
  
  function Uint8ToBuffer(num){
    numberBuffer.setUint8(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,1);
    return buffer;
  }
  
  function toUint8(num){
    numberBuffer.setUint8(0,num,true);
    return numberBuffer.getUint8(0,true);
  }
  
}

ebjs.define(Number,1,function packer(args,vars){
  var ret,num;
  
  switch(this.step){
    case 'start':
      num = vars.num = args[0];
      
      if(num == Infinity){
        ret = this.write(Uint8ToBuffer(8),this.goTo('end',packer,vars));
        if(ret != ebjs.deferred) this.end();
        return;
      }
      
      if(isNaN(num)){
        ret = this.write(Uint8ToBuffer(9),this.goTo('end',packer,vars));
        if(ret != ebjs.deferred) this.end();
        return;
      }
      
      if(num == toInt32(num)){
        if(num == toUint32(num)){
          if(num == toUint8(num)){
            if(num <= 245){
              ret = this.write(Uint8ToBuffer(num + 10),this.goTo('end',packer,vars));
              if(ret != ebjs.deferred) this.end();
              return;
            }else{
              vars.type = 'uint8';
              ret = this.write(Uint8ToBuffer(0),this.goTo('pack',packer,vars));
            }
          }else if(num == toUint16(num)){
            vars.type = 'uint16';
            ret = this.write(Uint8ToBuffer(1),this.goTo('pack',packer,vars));
          }else{
            vars.type = 'uint32';
            ret = this.write(Uint8ToBuffer(2),this.goTo('pack',packer,vars));
          }
        }else{
          if(num == toInt8(num)){
            vars.type = 'int8';
            ret = this.write(Uint8ToBuffer(3),this.goTo('pack',packer,vars));
          }else if(num == toInt16(num)){
            vars.type = 'int16';
            ret = this.write(Uint8ToBuffer(4),this.goTo('pack',packer,vars));
          }else{
            vars.type = 'int32';
            ret = this.write(Uint8ToBuffer(5),this.goTo('pack',packer,vars));
          }
        }
      }else{
        if(num == toFloat32(num)){
          vars.type = 'float32';
          ret = this.write(Uint8ToBuffer(6),this.goTo('pack',packer,vars));
        }else{
          vars.type = 'float64';
          ret = this.write(Uint8ToBuffer(7),this.goTo('pack',packer,vars));
        }
      }
      
      if(ret == ebjs.deferred) return;
      
    case 'pack':
      
      num = vars.num;
      
      switch(vars.type){
        case 'uint8':
          ret = this.write(Uint8ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'uint16':
          ret = this.write(Uint16ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'uint32':
          ret = this.write(Uint32ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'int8':
          ret = this.write(int8ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'int16':
          ret = this.write(int16ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'int32':
          ret = this.write(int32ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'float32':
          ret = this.write(float32ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'float64':
          ret = this.write(float64ToBuffer(num),this.goTo('end',packer,vars));
          break;
      }
      
      if(ret == ebjs.deferred) return;
      
    case 'end':
      this.end();
  }
  
},function unpacker(args,vars){
  var ret,tag,bytes;
  
  switch(this.step){
    
    case 'start':
      ret = this.read(1,this.goTo('unpack',unpacker,vars));
      if(ret == ebjs.deferred) return;
      vars.tag = ret;
      
    case 'unpack':
      tag = (vars.tag || args[0])[0];
      
      switch(tag){
        case 0:
          vars.type = 'uint8';
          ret = this.read(1,this.goTo('end',unpacker,vars));
          break;
        case 1:
          vars.type = 'uint16';
          ret = this.read(2,this.goTo('end',unpacker,vars));
          break;
        case 2:
          vars.type = 'uint32';
          ret = this.read(4,this.goTo('end',unpacker,vars));
          break;
        
        case 3:
          vars.type = 'int8';
          ret = this.read(1,this.goTo('end',unpacker,vars));
          break;
        case 4:
          vars.type = 'int16';
          ret = this.read(2,this.goTo('end',unpacker,vars));
          break;
        case 5:
          vars.type = 'int32';
          ret = this.read(4,this.goTo('end',unpacker,vars));
          break;
        
        case 6:
          vars.type = 'float32';
          ret = this.read(4,this.goTo('end',unpacker,vars));
          break;
        case 7:
          vars.type = 'float64';
          ret = this.read(8,this.goTo('end',unpacker,vars));
          break;
          
        case 8: return this.end(Infinity);
        case 9: return this.end(NaN);
        
        default: return this.end(tag - 10);
      }
      
      if(ret == ebjs.deferred) return;
      
      vars.bytes = ret;
      
    case 'end':
      bytes = vars.bytes || args[0];
      
      switch(vars.type){
        case 'uint8': return this.end(bytesToUint8(bytes));
        case 'uint16': return this.end(bytesToUint16(bytes));
        case 'uint32': return this.end(bytesToUint32(bytes));
        case 'int8': return this.end(bytesToInt8(bytes));
        case 'int16': return this.end(bytesToInt16(bytes));
        case 'int32': return this.end(bytesToInt32(bytes));
        case 'float32': return this.end(bytesToFloat32(bytes));
        case 'float64': return this.end(bytesToFloat64(bytes));
      }
      
  }
  
});


},{"ebjs":25}],20:[function(require,module,exports){
var ebjs = require('ebjs');

ebjs.define(Object,4,function packer(args,vars){
  var key,ret;
  
  switch(this.step){
    case 'start':
      vars.obj = args[0];
      vars.keys = Object.keys(vars.obj);
      ret = this.pack(Number,vars.keys.length,this.goTo('pack',packer,vars));
      if(ret === ebjs.deferred) return;
      
    case 'pack':
      
      if(vars.value != null){
        ret = this.pack(vars.value,this.goTo('pack',packer,vars));
        if(ret === ebjs.deferred) return;
      }
      
      while(key = vars.keys.shift()){
        
        ret = this.pack(String,key,this.goTo('pack',packer,vars));
        vars.value = vars.obj[key];
        if(ret === ebjs.deferred) return;
        
        ret = this.pack(vars.value,this.goTo('pack',packer,vars));
        vars.value = null;
        if(ret === ebjs.deferred) return;
        
      }
      
      this.end();
  }
  
},function unpacker(args,vars){
    var ret;
    
    switch(this.step){
      case 'start':
        this.start(vars.obj = {});
        vars.key = null;
        ret = this.unpack(Number,this.goTo('pre-unpack',unpacker,vars));
        if(ret === ebjs.deferred) return;
        vars.n = ret;
        
      case 'pre-unpack':
        vars.n = vars.n || args[0] || 0;
      
      case 'unpack':
        
        switch(vars.key){
          case null: break;
          case ebjs.deferred:
            vars.key = args[0];
            break;
          default:
            vars.obj[vars.key] = args[0];
            vars.key = null;
            break;
        }
        
        while(vars.n-- > 0){
          if(vars.key == null){
            vars.key = this.unpack(String,this.goTo('unpack',unpacker,vars));
            if(vars.key === ebjs.deferred) return;
          }
          
          ret = this.unpack(this.goTo('unpack',unpacker,vars));
          if(ret === ebjs.deferred) return vars.n++;
          vars.obj[vars.key] = ret;
          vars.key = null;
        }
        
        this.end(vars.obj);
    }
    
});


},{"ebjs":25}],21:[function(require,module,exports){
(function (global){
var ebjs = require('ebjs'),
    
    stringToPart,
    bytesToString,
    
    Buffer = global.Buffer;

if(Buffer){
  
  stringToPart = function(str){
    return new Buffer(str,'utf8');
  };
  
  bytesToString = function(buff){
    return buff.toString('utf8');
  };
  
}else{
  
  if(TextEncoder) stringToPart = function(str){
    return (new TextEncoder('utf-8')).encode(str);
  };
  else stringToPart = function(str){
    return new Blob([str]);
  };
  
  if(TextDecoder) bytesToString = function(bytes){
    return (new TextDecoder('utf-8')).decode(bytes);
  };
  else bytesToString = function(bytes){
    var ret = '',
        i,
        code,
        next;
    
    for(i = 0;i < bytes.length;i++){
      
      if(bytes[i] < 128){
        ret += String.fromCharCode(bytes[i]);
        continue;
      }
      
      if(bytes[i] < 224){
        code = (bytes[i] & 0x3f) << 6;
        next = i + 1;
      }else if(bytes[i] < 240){
        code = (bytes[i] & 0x1f) << 12;
        next = i + 2;
      }else if(bytes[i] < 248){
        code = (bytes[i] & 0x0f) << 18;
        next = i + 3;
      }else if(bytes[i] < 252){
        code = (bytes[i] & 0x07) << 24;
        next = i + 4;
      }else{
        code = (bytes[i] & 0x03) << 30;
        next = i + 5;
      }
      
      do{
        i++;
        code |= (bytes[i] & 0x7f) << ((next - i) * 6);
      }while(i != next);
      
      ret += String.fromCharCode(code);
    }
    
    return ret;
  };
  
}

ebjs.define(String,3,function packer(args,vars){
  
  switch(this.step){
    case 'start':
      vars.part = stringToPart(args[0] + '');
      if(this.pack(Number,vars.part.length || vars.part.size || 0,this.goTo('pack',packer,vars)) === ebjs.deferred) return;
      
    case 'pack':
      if(this.write(vars.part,this.goTo('end',packer,vars)) === ebjs.deferred) return;
    
    case 'end':
      this.end();
  }
  
},function unpacker(args,vars){
  var ret;
  
  switch(this.step){
    
    case 'start':
      ret = this.unpack(Number,this.goTo('unpack',unpacker,vars));
      if(ret === ebjs.deferred) return;
      vars.size = ret;
      
    case 'unpack':
      vars.size = vars.size || args[0];
      
      ret = this.read(vars.size,this.goTo('end',unpacker,vars));
      if(ret === ebjs.deferred) return;
      vars.bytes = ret;
      
    case 'end':
      vars.bytes = vars.bytes || args[0];
      
      this.end(bytesToString(vars.bytes));
    
  }
  
});


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"ebjs":25}],22:[function(require,module,exports){
var ebjs = require('ebjs');

ebjs.define(null,6);

},{"ebjs":25}],23:[function(require,module,exports){
var ebjs = require('ebjs');

ebjs.define(undefined,7);

},{"ebjs":25}],24:[function(require,module,exports){
(function (global){
var Test = require('vz.test'),
    ebjs = require('ebjs'),
    assert = require('assert');

module.exports = function(array,deep){
  var txt,cons;
  
  if(global.Buffer){
    txt = 'Buffer';
    cons = global.Buffer;
  }else{
    txt = 'Blob';
    cons = Blob;
  }
  
  new Test(txt,function(test){
    
    for(i = 0;i < array.length;i++) (function(i){
      
      ebjs.pack(array[i],test.wrap(function(data){
        assert(data instanceof cons);
        ebjs.unpack(data,test.wrap(function(result){
          if(deep) assert.deepEqual(result,array[i]);
          else assert.strictEqual(result,array[i]);
        }),{sync: true});
      }),{sync: true});
      
    })(i);
    
  });
  
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"assert":2,"ebjs":25,"vz.test":35}],25:[function(require,module,exports){
exports.pack = require('./main/pack.js');
exports.unpack = require('./main/unpack.js');
exports.define = require('./main/define.js');

exports.deferred = require('vz.resolve').deferred;

},{"./main/define.js":27,"./main/pack.js":28,"./main/unpack.js":29,"vz.resolve":33}],26:[function(require,module,exports){
(function (global){

var Property = require('vz.property'),
    Buffer = global.Buffer;

exports.label = new Property();
exports.uLabel = new Property();

exports.classes = [];
exports.types = [];
exports.packers = [];
exports.unpackers = [];

if(Buffer) exports.toBuffer = function(data,base64){
  var i;
  
  switch(data.constructor){
    case String:
      
      if(base64){
        i = data.indexOf('base64,');
        if(i != -1) data = data.substring(i + 7);
        return new Buffer(data,'base64');
      }
      
      return new Buffer(data,'utf8');
    case Uint8Array:
    case Uint8ClampedArray:
      return new Buffer(data);
    case Uint16Array:
    case Uint32Array:
    case Int16Array:
    case Int32Array:
    case Int8Array:
    case Float32Array:
    case Float64Array:
    case DataView:
      data = data.buffer.slice(data.byteOffset,data.length);
    case ArrayBuffer:
      return new Buffer(new Uint8Array(data));
    case Buffer:
      return data;
  }
  
};
else exports.toArray = function(data){
  var view;
  
  switch(data.constructor){
    case String:
      i = data.indexOf('base64,');
      if(i != -1) data = data.substring(i + 7);
      
      data = atob(data);
      view = new Uint8Array(data.length);
      
      for(i = 0;i < data.length;i++){
        view[i] = data.charCodeAt(i);
      }
      
      return view;
    case Uint8Array:
    case Uint8ClampedArray:
      return data;
    case Uint16Array:
    case Uint32Array:
    case Int16Array:
    case Int32Array:
    case Int8Array:
    case Float32Array:
    case Float64Array:
    case DataView:
      data = data.buffer.slice(data.byteOffset,data.length);
    case ArrayBuffer:
      return new Uint8Array(data);
  }
  
};



exports.resolvers = new Property();

exports.resFunction = function(callback,action,args,that){
  this.callback = callback;
  this.that = that;
  exports.resolvers.of(that).get().push(this);
  action.apply(that,args);
};

exports.resCallback = function(data){
  this.callback.call(this.that,data);
};


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"vz.property":32}],27:[function(require,module,exports){

var com = require('./common.js');

module.exports = function(constructor,label,types,packer,unpacker){
	if(typeof label != 'number'){
		unpacker = packer;
		packer = types;
		types = label;
		label = undefined;
	}
	
	if(types && !unpacker){
		unpacker = packer;
		packer = types;
		types = undefined;
	}
	
  if(packer?com.label.of(constructor).get():com.uLabel.of(constructor).get())
  throw 'Already defined';
  
	if(label != null){
		if(com.classes[label]) throw 'Label in use';
		
		com.classes[label] = constructor;
		com.types[label] = types;
		com.packers[label] = packer;
		com.unpackers[label] = unpacker;
		
		return packer?com.label.of(constructor).set(label):com.uLabel.of(constructor).set(label);
	}
	
	com.classes.push(constructor);
	com.types.push(types);
	com.packers.push(packer);
	com.unpackers.push(unpacker);
	
	return packer?com.label.of(constructor).set(com.classes.length - 1):com.uLabel.of(constructor).set(com.classes.length - 1);
}

module.exports({},0); // Back Reference

},{"./common.js":26}],28:[function(require,module,exports){
(function (global){

var com = require('./common.js'),
    
    resolve = require('vz.resolve'),
    nextTick = require('vz.next-tick'),
    Property = require('vz.property'),
    Stepper = require('vz.stepper'),
    
    Buffer = global.Buffer,
    Blob = global.Blob,
    
    buffer = new Property(),
    
    giverCB = new Property(),
    giverThat = new Property(),
    
    options = new Property(),
    callback = new Property(),
    
    brTagProp = new Property(),
    nextBrTag = new Property(),
    
    pack,
    onEnd,
    toData,
    giver,
    
    onFRLoad;

function WriteBuffer(){
  com.resolvers.set(this,[]);
  buffer.set(this,[]);
  nextBrTag.set(this,0);
  brTagProp.set(this,new Property());
}

WriteBuffer.prototype = new Stepper();
WriteBuffer.prototype.constructor = WriteBuffer;

pack = function(args,v){
  var proto,constructor,type,elem;
  
  switch(this.step){
    
    case 'start':
      
      constructor = args[0];
      v.data = args[1];
      
      if(args.length == 1){
        v.data = constructor;
        
        v.i = com.uLabel.get(v.data);
        if(v.i != null){
          if(this.pack(Number,v.i,this.goTo('end',pack,v)) !== resolve.deferred) this.end();
          return;
        }
        
        v.brTag = brTagProp.get(this).get(v.data);
        
        if(v.brTag != null){
          if(this.pack(Number,0,this.goTo('br-tag',pack,v)) === resolve.deferred) return;
          if(this.pack(Number,v.brTag,this.goTo('end',pack,v)) === resolve.deferred) return;
          return this.end();
        }else brTagProp.get(this).set(v.data,nextBrTag.of(this).value++);
        
        constructor = v.data.constructor;
        
        while((v.i = com.label.get(constructor)) == null){
          proto = Object.getPrototypeOf(constructor.prototype);
          if(!proto) throw new TypeError('Unsupported type "' + v.data.constructor.name + '"');
          constructor = proto.constructor;
        }
        
        if(this.pack(Number,v.i,this.goTo('pack',pack,v)) === resolve.deferred) return;
      }else if((v.i = com.label.get(constructor)) == null) throw new TypeError('Unsupported type "' + constructor.name + '"');
      
    case 'pack':
      
      if(com.types[v.i]){
        v.arr = com.packers[v.i].call(this,v.data);
        v.types = com.types[v.i].slice();
      }else if(com.packers[v.i]) return this.goTo('start',com.packers[v.i])(v.data);
    
    case 'pack-type':
      
      while(type = v.types.shift()){
        elem = v.arr.shift();
        if(this.pack(type,elem,this.goTo('pack-type',pack,v)) === resolve.deferred) return;
      }
      
    case 'end':
      this.end();
      break;
    
    case 'br-tag':
      if(this.pack(Number,v.brTag,this.goTo('end',pack,v)) === resolve.deferred) return;
      return this.end();
    
  }
  
};

Object.defineProperty(WriteBuffer.prototype,'pack',{value: function(constructor,data,callback){
  var args;
  
  if(!callback){
    args = [constructor];
    callback = data;
  }else args = [constructor,data];
  
  return resolve(com.resFunction,[callback,this.goTo('start',pack),args,this],com.resCallback);
}});

if(Blob){
  
  giver = function(data){
    this.give(data);
    giverCB.get(this).call(giverThat.get(this));
  };
  
  Object.defineProperty(WriteBuffer.prototype,'write',{value: function(data,callback){
    var trg = options.get(this).target;
    
    if(trg && trg.give){
      giverCB.set(trg,callback);
      giverThat.set(trg,this);
      toData(data instanceof Blob?data:new Blob([data]),type.get(this),giver,trg);
      return resolve.deferred;
    }else buffer.get(this).push(data);
  }});
  
}else Object.defineProperty(WriteBuffer.prototype,'write',{value: function(data,callback){
  var buff = com.toBuffer(data),
      opt = options.get(this),
      trg = opt.target;
  
  if(buff){
    if(trg){
      if(trg.write) trg.write(toData(buff,opt.type));
      else trg.give(toData(buff,opt.type));
    }else buffer.get(this).push(buff);
  }
}});

Object.defineProperty(WriteBuffer.prototype,'end',{value: function(){
  com.resolvers.get(this).pop().resolve();
}});

if(Blob){
  
  onFRLoad = function onFRLoad(){
    var data = this.result,i;
    
    if(this.base64){
      i = data.indexOf('base64,');
      
      if(i == -1) data = data.substring(5);
      else data = data.substring(i + 7);
    }
    
    this.cb.call(this.that,data);
  };
  
  toData = function(data,type,callback,that,sync){
    var fr;
    
    type = type || '';
    
    switch(type.toLowerCase()){
      case 'base64':
        fr = new FileReader();
        fr.base64 = true;
      case 'dataurl':
        fr = fr || new FileReader();
        
        fr.onload = onFRLoad;
        fr.cb = callback;
        fr.that = that;
        fr.readAsDataURL(data);
        break;
      case 'arraybuffer': {
        fr = new FileReader();
        
        fr.onload = onFRLoad;
        fr.cb = callback;
        fr.that = that;
        fr.readAsArrayBuffer(data);
      } break;
      default:
        if(sync) callback.call(that,data);
        else nextTick(callback,[data],that);
    }
    
  };
  
  onEnd = function(){
    var fr,cb,t,that,res,trg,opt;
    
    opt = options.get(this);
    cb = callback.get(this);
    t = opt.type;
    that = opt.thisArg;
    trg = opt.target;
    
    if(trg) cb.call(that,trg);
    else toData(new Blob(buffer.get(this)),t,cb,that);
  };
  
}else{
  
  toData = function(buff,type){
    type = type || '';
    
    switch(type.toLowerCase()){
      case 'base64': return buff.toString('base64');
      case 'dataurl': return 'data:;base64,' + buff.toString('base64');
      case 'arraybuffer': return (new Uint8Array(buff)).buffer;
      default: return buff;
    }
    
  };
  
  onEnd = function(){
    var fr,cb,t,that,buff,result,opt;
    
    opt = options.get(this);
    cb = callback.get(this);
    t = opt.type;
    that = opt.thisArg;
    
    cb.call(that,toData(Buffer.concat(buffer.get(this)),t));
  };
  
}

module.exports = function(data,cb,opt){
  var b = new WriteBuffer(),res;
  
  opt = opt || {};
  
  options.set(b,opt);
  callback.set(b,cb);
  
  res = b.pack(data,onEnd);
  if(res !== resolve.deferred){
    if(opt.sync) onEnd.call(b);
    else nextTick(onEnd,[],b);
  }
};


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./common.js":26,"vz.next-tick":31,"vz.property":32,"vz.resolve":33,"vz.stepper":34}],29:[function(require,module,exports){
(function (global){
var nextTick = require('vz.next-tick'),
    Property = require('vz.property'),
    resolve = require('vz.resolve'),
    Stepper = require('vz.stepper'),
    
		com = require('./common.js'),
    
    currentReadOp = new Property(),
    currentBytes = new Property(),
    currentBlobReadOp = new Property(), // browser line
    currentBlobSize = new Property(), // browser line
    onBytes, // browser line
    onBytesTarget = new Property(), // browser line
    
    pool = new Property(),
    blobPool = new Property(), // browser line
    bpToPool, // browser line
    onFRLoad, // browser line
    
    thisArg = new Property(),
    
    finalCb = new Property(),
    finalCbThis = new Property(),
    
    readBytes,
    onData,
    onEnd,
    unpack,
    
    brPool = new Property(),
    brFlags = new Property(),
    
    Buffer = global.Buffer, // nodejs line
    Blob = global.Blob, // browser line
    
    ReadBuffer;

if(Buffer){ // nodejs block
  
  ReadBuffer = function(data){
    var buff = com.toBuffer(data,true);
    
    brPool.set(this,[]);
    brFlags.set(this,[]);
    com.resolvers.set(this,[]);
    
    if(buff) pool.set(this,buff);
    else{
      pool.set(this,new Buffer(0));
      thisArg.set(data,this);
      if(data.read && data.on) data.on('data',onData);
      else data.upTo(Infinity).take(onData);
    }
  };
  
}else{ // browser block
  
  ReadBuffer = function(data,allowBlobs){
    var arr = com.toArray(data);
    
    brPool.set(this,[]);
    brFlags.set(this,[]);
    com.resolvers.set(this,[]);
    
    if(arr){
      pool.set(this,arr);
      return;
    }
    
    pool.set(this,new Uint8Array(0));
    
    if(data instanceof Blob){
      blobPool.set(this,data);
      return;
    }
    
    if(allowBlobs) blobPool.set(this,new Blob());
    data.upTo(Infinity).take(onData,this);
  };
  
}

ReadBuffer.prototype = new Stepper();
ReadBuffer.prototype.constructor = ReadBuffer;

if(Buffer){ // nodejs block
  
  onData = function(data){
    var that = thisArg.get(this),
        p = pool.get(that),
        cro = currentReadOp.get(that),
        n = currentBytes.get(that),
        ret;
    
    data = com.toBuffer(data,true);
    pool.set(that,p = Buffer.concat([p,data]));
    
    if(cro && p.length >= n){
      currentReadOp.set(that,undefined);
      currentBytes.set(that,undefined);
      
      ret = p.slice(0,n);
      pool.set(that,p.slice(n));
      cro.resolve(ret);
    }
  };
  
  readBytes = function(that,n){
    var ret,
        p = pool.get(that);
    
    if(currentReadOp.get(that)) throw 'Only one read operation at a time';
    
    this.blob = false;
    
    if(p.length < n){
      currentBytes.set(that,n);
      currentReadOp.set(that,this);
      return;
    }
    
    ret = p.slice(0,n);
    pool.set(that,p.slice(n));
    this.resolve(ret);
  };
  
}else{ // browser block
  
  onData = function(data){
    var arr = com.toArray(data),
        bp = blobPool.get(this),
        p = pool.get(this),
        n = currentBytes.get(that),
        op = currentReadOp.get(that),
        bn,
        bop,
        size,
        ret,
        bret,
        newPool;
    
    if(!bp){
      
      newPool = new Uint8Array(p.length + arr.length);
      newPool.set(p);
      newPool.set(arr,p.length);
      
    }else{
      size = bp.size;
      bp = new Blob([bp,arr || data]);
      
      bn = currentBlobSize.get(that);
      bop = currentBlobReadOp.get(that);
      
      if(size == p.length && arr){
        newPool = new Uint8Array(p.length + arr.length);
        newPool.set(p);
        newPool.set(arr,p.length);
        
        if(n > size && bp.size >= n){
          ret = newPool.subarray(0,n);
          newPool = newPool.subarray(n);
          bp = bp.slice(n);
        }
        
        if(bn > size && bp.size >= bn){
          bret = bp.slice(0,n);
          newPool = newPool.subarray(n);
          bp = bp.slice(n);
        }
        
        pool.set(this,newPool);
        blobPool.set(this,bp);
        
        if(ret) op.resolve(ret);
        if(bret) bop.resolve(bret);
      }else{
        
        if(n > size && bp.size >= n) bpToPool(this,n);
        
        if(bn > size && bp.size >= bn){
          bret = bp.slice(0,n);
          pool.set(this,p.subarray(n));
          bp = bp.slice(n);
        }
        
        blobPool.set(this,bp);
        
        if(bret) bop.resolve(bret);
      }
    }
    
  };
  
  onFRLoad = function(){
    var view = new Uint8Array(this.result),
        that = this.that,
        p = pool.get(that),
        bp = blobPool.get(that),
        n = currentBytes.get(that),
        op = currentReadOp.get(that),
        bytes = new Uint8Array(view.length + p.length);
    
    bytes.set(p);
    bytes.set(view,p.length);
    
    pool.set(that,bytes.subarray(n));
    blobPool.set(that,bp.slice(n));
    
    currentBytes.set(that,undefined);
    currentReadOp.set(that,undefined);
    
    op.resolve(bytes.subarray(0,n));
  };
  
  bpToPool = function(that,n){
    var p = pool.get(that),
        bp = blobPool.get(that),
        fr = new FileReader(),
        blob;
    
    n = Math.min(Math.max(n,module.exports.maxRAM),bp.size - p.length);
    
    blob = bp.slice(p.length,p.length + n);
    
    fr.that = that;
    fr.onload = onFRLoad;
    fr.readAsArrayBuffer(blob);
  };
  
  readBytes = function(that,n){
    var ret,
        p = pool.get(that),
        bp = blobPool.get(that);
    
    if(currentReadOp.get(that) || currentBlobReadOp.get(that))
    throw 'Only one read operation at a time';
    
    this.blob = false;
    
    if(p.length < n){
      if(bp && bp.size >=  n) bpToPool(that,n);
      
      currentBytes.set(that,n);
      currentReadOp.set(that,this);
      return;
    }
    
    ret = p.subarray(0,n);
    
    pool.set(that,p.subarray(n));
    if(bp) blobPool.set(that,bp.slice(n));
    
    this.resolve(ret);
  };
  
  onBytes = function(bytes){
    onBytesTarget.get(this).resolve(new Blob([bytes]));
  };
  
  readBlob = function(that,n){
    var ret,
        p = pool.get(that),
        bp = blobPool.get(that);
    
    if(currentReadOp.get(that) || currentBlobReadOp.get(that))
    throw 'Only one read operation at a time';
    
    if(!bp){
      onBytesTarget.set(that,this);
      ret = that.read(n,onBytes);
      if(ret != resolve.deferred) onBytes.call(that,ret);
      return;
    }
    
    if(bp.size >= n){
      ret = bp.slice(0,n);
      blobPool.set(that,bp.slice(n));
      pool.set(that,p.subarray(n));
      this.resolve(ret);
      return;
    }
    
    currentBlobReadOp.set(that,this);
    currentBlobSize.set(that,n);
  };
  
  Object.defineProperty(ReadBuffer.prototype,'readBlob',{value: function(n,callback){
    return resolve(readBlob,[this,n],callback,this);
  }});
  
}

Object.defineProperty(ReadBuffer.prototype,'read',{value: function(n,callback){
  return resolve(readBytes,[this,n],callback,this);
}});


unpack = function(args,v){
  var constructor,type;
  
  switch(this.step){
    
    case 'start':
      
      constructor = args[0];
      
      if(!args.length){
        v.setFlag = true;
        v.i = this.unpack(Number,this.goTo('unpack',unpack,v));
        if(v.i == resolve.deferred) return;
      }else v.i = com.label.get(constructor);
    
    case 'unpack':
      
      if(v.i == resolve.deferred) v.i = args[0];
      
      if(v.i == 0){
        brFlags.get(this).push(false);
        v.brTag = this.unpack(Number,this.goTo('br-tag',unpack,v));
        if(v.brTag == resolve.deferred) return;
        return this.end(brPool.get(this)[v.brTag]);
      }else if(v.setFlag) brFlags.get(this).push(true);
      else brFlags.get(this).push(false);
      
      if(!com.unpackers[v.i]){
        this.end(com.classes[v.i]);
        return;
      }
      
      if(!com.types[v.i]) return this.goTo('start',com.unpackers[v.i])();
      
      v.arr = [];
      v.types = com.types[v.i].slice();
    
    case 'unpack-type':
      
      if(v.elem == resolve.deferred) v.arr.push(args[0]);
      
      while(type = v.types.shift()){
        v.elem = this.unpack(type,this.goTo('unpack-type',unpack,v));
        if(v.elem == resolve.deferred) return;
        v.arr.push(v.elem);
      }
      
      this.end(com.unpackers[v.i].apply(this,v.arr));
      break;
      
    case 'br-tag':
      this.end(brPool.get(this)[args[0]]);
  }
  
};


Object.defineProperty(ReadBuffer.prototype,'unpack',{value: function(constructor,callback){
  var args,flags;
  
  if(!callback){
    flags = brFlags.get(this);
    if(flags[flags.length - 1] === true) throw 'To use generic chained unpack calls you must call ReadBuffer.start first';
    args = [];
    callback = constructor;
  }else args = [constructor];
  
  return resolve(com.resFunction,[callback,this.goTo('start',unpack),args,this],com.resCallback);
}});

Object.defineProperty(ReadBuffer.prototype,'start',{value: function(data){
  if(brFlags.get(this).pop()) brPool.get(this).push(data);
  brFlags.get(this).push(false);
}});

Object.defineProperty(ReadBuffer.prototype,'end',{value: function(data){
  if(brFlags.get(this).pop()) brPool.get(this).push(data);
  com.resolvers.get(this).pop().resolve(data);
}});

onEnd = function(data){
  var cb = finalCb.get(this),
      that = finalCbThis.get(this);
  
  cb.call(that,data);
};

module.exports = function(buff,callback,options){
  var b = new ReadBuffer(buff),
      elem;
  
  options = options || {};
  
  finalCb.set(b,callback);
  finalCbThis.set(b,options.thisArg || b);
  
  elem = b.unpack(onEnd);
  if(elem != resolve.deferred){
    if(options.sync) onEnd.call(b,elem);
    else nextTick(onEnd,[elem],b);
  }
};

module.exports.maxRAM = 1e3;


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./common.js":26,"vz.next-tick":31,"vz.property":32,"vz.resolve":33,"vz.stepper":34}],30:[function(require,module,exports){

exports.APPLY = function(cb,args,that){cb.apply(that,args);};

exports.NOOP = function(){};

exports.FALSE = function(){ return false; };
exports.TRUE = function(){ return true; };

exports.STOP = function(e){ e.stopPropagation(); }
exports.PREVENT = function(e){ e.preventDefault(); }

exports.ERROR = function(e){ throw e; };

},{}],31:[function(require,module,exports){
(function (global){
var callbacks = [],
		args = [],
		thats = [],
		ids = [],
    waiting = false,
    
		ticker,
		state;

function tickHandler(){
	var cb,
			c = callbacks,
			t = thats,
			a = args;
	
  waiting = false;
  
	callbacks = [];
	thats = [];
	args = [];
	ids = [];
	
	while(cb = c.shift()) cb.apply(t.shift(),a.shift());
}

if(!global.setImmediate){
  ticker = new Image();
  ticker.onerror = tickHandler;
  state = true;
}

module.exports = function(callback,arg,that){
	var id;
	
	callbacks.push(callback || function(){});
	args.push(arg || []);
	thats.push(that || global);
	ids.push(id = {});
	
  if(waiting) return id;
  waiting = true;
  
  if(ticker){
    if(state) ticker.src = 'data:,0';
    else ticker.src = 'data:,1';
    
    state = !state;
  }else setImmediate(tickHandler);
  
	return id;
};

module.exports.clear = function(id){
	var i = ids.indexOf(id);
	
	if(i == -1) return;
	
	callbacks.splice(i,1);
	thats.splice(i,1);
	args.splice(i,1);
	ids.splice(i,1);
};


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],32:[function(require,module,exports){
(function (global){
var Property,
    
    map,
    string,
    number,
    undefProp,
    nullProp,
    trueProp,
    falseProp,
    
    top,
    property,
    
    WeakMap = global.WeakMap,
    counter;

if(!WeakMap){
  counter = 0;
  
  WeakMap = function(){
    Object.defineProperties(this,{
      _id: {value: counter++}
    });
  };
  
  Object.defineProperties(WeakMap.prototype,{
    delete: {value: function(object){
      return delete object['vzProperty' + this._id];
    }},
    get: {value: function(object){
      return object['vzProperty' + this._id];
    }},
    set: {value: function(object,value){
      
      Object.defineProperty(object,'vzProperty' + this._id,{
        configurable: true,
        value: value
      });
      
      return this;
    }}
  });
  
}

map = new WeakMap();
string = new WeakMap();
number = new WeakMap();
undefProp = new WeakMap();
nullProp = new WeakMap();
trueProp = new WeakMap();
falseProp = new WeakMap();

top = new WeakMap();
property = new WeakMap();


function retProp(tob,prop){
  top.set(this,tob);
  property.set(this,prop);
}

function getter(){
  return top.get(this).get(property.get(this));
}

function setter(value){
  return top.get(this).set(property.get(this),value);
}

Object.defineProperties(retProp.prototype,{
  value: {
    get: getter,
    set: setter
  },
  get: {value: getter},
  set: {value: setter},
  valueOf: {value: function(){
    return this.value;
  }},
  toString: {value: function(){
    return [this.value].concat('');
  }}
});


module.exports = Property = function(){
  map.set(this,new WeakMap());
  string.set(this,{});
  number.set(this,{});
};

Object.defineProperties(Property.prototype,{
  of: {
    value: function(index){
      return new retProp(this,index);
    }
  },
  get: {
    value: function(index){
      
      switch(typeof index){
        case 'boolean': return index?trueProp.get(this):falseProp.get(this);
        case 'string':return string.get(this)[index];
        case 'number': return number.get(this)[index];
        case 'undefined': return undefProp.get(this);
        case 'object':
        case 'function':
          if(index !== null) return map.get(this).get(index);
          else return nullProp.get(this);
      }
      
    }
  },
  set: {
    value: function(index,value){
      
      if(value === undefined) switch(typeof index){
        case 'boolean':
          index?trueProp.delete(this):falseProp.delete(this);
          break;
        case 'string':
          delete string.get(this)[index];
          break;
        case 'number':
          delete number.get(this)[index];
          break;
        case 'undefined':
          undefProp.delete(this);
          break;
        case 'object':
        case 'function':
          if(index !== null) map.get(this).delete(index);
          else nullProp.delete(this);
          break;
      }
      else switch(typeof index){
        case 'boolean':
          index?trueProp.set(this,value):falseProp.set(this,value);
          break;
        case 'string':
          string.get(this)[index] = value;
          break;
        case 'number':
          number.get(this)[index] = value;
          break;
        case 'undefined':
          undefProp.set(this,value);
          break;
        case 'object':
        case 'function':
          if(index !== null) map.get(this).set(index,value);
          else nullProp.set(this,value);
          break;
      }
      
      return this;
    }
  }
});


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(require,module,exports){

var Property = require('vz.property'),
    nextTick = require('vz.next-tick'),
    
    callback = new Property(),
    thisArg = new Property(),
    
    canResolveSync = new Property(),
    resolveSyncFlag = new Property(),
    resolveResult = new Property();

function Resolver(cb,that){
  canResolveSync.of(this).set(false);
  callback.of(this).set(cb);
  thisArg.of(this).set(that || this);
}

Object.defineProperty(Resolver.prototype,'resolve',{value: function(data){
  
  if(canResolveSync.of(this).get()){
    resolveSyncFlag.of(this).set(true);
    resolveResult.of(this).set(data);
  }else callback.of(this).get().call(thisArg.of(this).get(),data);
  
}});

function clearFlag(resolver){
  canResolveSync.of(resolver).set(false);
}

module.exports = function(func,args,callback,thisArg){
  var resolver,
      ret = module.exports.deferred;
  
  if(args.apply){
    thisArg = callback;
    callback = args;
    args = null;
  }
  
  args = args || [];
  
  resolver = new Resolver(callback,thisArg);
  
  canResolveSync.of(resolver).set(true);
  resolveSyncFlag.of(resolver).set(false);
  nextTick(clearFlag,[resolver]);
  func.apply(resolver,args);
  clearFlag(resolver);
  
  if(resolveSyncFlag.of(resolver).get()){
    ret = resolveResult.of(resolver).get();
    resolveSyncFlag.of(resolver).set(null);
    resolveResult.of(resolver).set(null);
  }
  
  return ret;
};

module.exports.deferred = {
  toString: function(){ return Math.random() + '-' + Date.now(); }
};


},{"vz.next-tick":31,"vz.property":32}],34:[function(require,module,exports){
var Stepper,
    Property = require('vz.property'),
    c = require('vz.constants'),
    callback = new Property(),
    step = new Property(),
    
    USE_BIND = false;

Stepper = module.exports = function(cb){
  callback.of(this).set(cb);
};

function caller(){
  step.of(this.that).set(this.step);
  (this.cb || callback.of(this.that).get()).call(this.that,arguments,this.vars);
}

Object.defineProperties(Stepper.prototype,{
  goTo: {value: function(step,cb,vars){
    var temp,that = this;
    
    if(!cb.apply){
      temp = vars;
      vars = cb;
      cb = temp;
    }
    
    vars = vars || {};
    
    if(USE_BIND) return caller.bind({that: this,step: step,cb: cb,vars: vars});
    else return function(){
      return caller.apply({that: that,step: step,cb: cb,vars: vars},arguments);
    };
  }},
  step: {
    get: function(){ return step.of(this).value; },
    set: c.NOOP
  }
});


},{"vz.constants":30,"vz.property":32}],35:[function(require,module,exports){
(function (global){
var Test,
    stack = [],
    unresolved = [],
    errors = [],
    Property = require('vz.property'),
    constants = require('vz.constants'),
    assert = require('assert'),
    
    proc = global.process,
    
    resolved = new Property(),
    t0 = new Property(),
    t = new Property(),
    ok = new Property(),
    parent = new Property(),
    children = new Property(),
    status = new Property(),
    wraps = new Property(),
    tests = new Property(),
    text = new Property(),
    
    container,
    subcontainer;

function getNL(insideList){
  switch(Test.syntax){
    case 'md': return '  \n';
    case 'console': return '\n';
    case 'html': return insideList?'\n':'<br>\n';
  }
}

function red(txt){
  switch(Test.syntax){
    case 'md': return txt;
    case 'console': return '\x1B[31m' + txt + '\x1B[39m';
    case 'html': return '<span style="color: red;">' + txt + '</span>';
  }
}

function green(txt){
  switch(Test.syntax){
    case 'md': return txt;
    case 'console': return '\x1B[32m' + txt + '\x1B[39m';
    case 'html': return '<span style="color: green;">' + txt + '</span>';
  }
}

function output(txt,insideList){
  var frag;
  
  switch(Test.output){
    case 'std':
      proc.stdout.write(txt + getNL(insideList));
      break;
    case 'browser':
      
      if(!container){
        container = document.createElement('div');
        container.style.fontFamily = 'monospace';
        document.body.appendChild(container);
        subcontainer = document.createElement('div');
        container.appendChild(subcontainer);
      }
      
      frag = document.createElement('span');
      frag.innerHTML = txt + getNL(insideList);
      subcontainer.appendChild(frag);
  }
}

function print(test,offset){
  var ret = '',
      notOk = test.status != 'pass',
      c = children.get(test),
      time,
      i;
  
  ret += offset;
  if(Test.syntax == 'html') ret += '<ul><li style="font-family: monospace;list-style-type: none;">';
  if(Test.numbers && c.length) ret += '[' + ok.get(test) + '/' + c.length + ']';
  ret += ' ' + text.get(test);
  
  switch(Test.status){
    case 'gfm':
      ret += ' ' + (notOk?':heavy_multiplication_x:':':heavy_check_mark:');
      break;
    case 'tick':
      ret += ' ' + (notOk?red('✗'):green('✓'));
      break;
    case 'text':
      ret += ' ' + (notOk?red(test.status):green(test.status));
      break;
    case 'TEXT':
      ret += ' ' + (notOk?red(test.status.toUpperCase()):green(test.status.toUpperCase()));
      break;
  }
  
  if(Test.times && !notOk){
    time = t.get(test);
    if(proc) time = (time[0] + time[1] * 1e-9)*1000;
    ret += ' (' + time.toFixed(Test.precision) + 'ms)';
  }
  
  if(Test.syntax == 'html') ret += '</li>';
  
  offset = (Test.syntax == 'md'?'    ':'  ') + offset;
  
  switch(Test.mode){
    case 'details':
      for(i = 0;i < c.length;i++) ret += getNL(true) + print(c[i],offset);
      break;
      
    case 'errors':
      if(notOk){
        for(i = 0;i < c.length;i++){
          if(c[i].status != 'pass') ret += getNL(true) + print(c[i],offset);
        }
      }
      break;
      
    default:
      if(notOk){
        for(i = 0;i < c.length;i++) ret += getNL(true) + print(c[i],offset);
      }
  }
  
  if(Test.syntax == 'html') ret += '</ul>';
  
  return ret;
}

function resolve(test){
  var p,
      i;
  
  if(Test.times){
    if(proc) t.set(test,proc.hrtime(t0.get(test)));
    else t.set(test,performance.now() - t0.get(test));
  }
  
  resolved.set(test,true);
  p = parent.get(test),
  i = unresolved.indexOf(test)
  
  if(i != -1) unresolved.splice(i,1);
  
  if(p){
    if(p.status != 'error'){
      if(test.status == 'error') status.set(p,'error');
      else if(test.status == 'fail') status.set(p,'fail');
    }
    
    if(test.status == 'pass') ok.of(p).value++;
    
    if(--tests.of(p).value == 0 && wraps.get(p) == 0) resolve(p);
    return;
  }
  
  if(Test.mode == 'errors' && test.status == 'pass') return;
  
  output(print(test,Test.syntax == 'md'?'- ':''),true);
}

module.exports = Test = function(txt,callback){
  
  if(Test.times){
    if(proc) t0.set(this,proc.hrtime());
    else t0.set(this,performance.now());
  }
  
  resolved.set(this,false);
  unresolved.push(this);
  
  text.set(this,txt);
  children.set(this,[]);
  status.set(this,'pass');
  wraps.set(this,0);
  tests.set(this,0);
  ok.set(this,0);
  
  if(stack.length){
    children.get(stack[stack.length - 1]).push(this);
    parent.set(this,stack[stack.length - 1]);
    tests.of(stack[stack.length - 1]).value++;
  }
  
  if(callback) this.wrap(callback)(this);
};

var units = [
  'B',
  'kiB',
  'MiB',
  'GiB',
  'TiB',
	'PiB',
	'EiB',
	'ZiB',
	'YiB'
  ];

function getRAM(os){
  var step = 0,
      size = os.totalmem(),
      i = 0;
  
  while(size > 1024 && i < units.length){
		size /= 1024;
		i++;
	}
  
  size = size.toFixed(2);
  
	while(size.charAt(size.length - 1) == '0') size = size.substring(0,size.length - 1);
	if(size.charAt(size.length - 1) == '.') size = size.substring(0,size.length - 1);
  
  return size + units[i];
}

Test.printInfo = function(){
  var os;
  
  if(proc){
    os = require('os');
    output(os.type() + ' ' + os.release() + ' ' + os.arch());
    output(os.cpus()[0].model);
    output(getRAM(os) + ' RAM');
    output('');
  }else{
    output(navigator.userAgent.replace(/(\s\w+\/)/g,getNL() + '$1'));
    output('');
  }
  
};

Test.run = function(test){
  var temp,
      cont,
      errors,
      mode,
      end,
      run;
  
  if(!proc){
    cont = document.createElement('div');
    document.body.appendChild(cont);
    
    errors = document.createElement('input');
    errors.type = 'checkbox';
    
    mode = document.createElement('select');
    mode.innerHTML =  '<option value="default">default</option>' + 
                      '<option value="errors">Show only failed tests</option>' + 
                      '<option value="details">Show all tests</option>';
    
    run = document.createElement('input');
    run.type = 'button';
    run.value = 'Run test';
    
    end = document.createElement('a');
    end.textContent = 'End test';
    
    end.onclick = function(){
      end.remove();
      showErrors();
    }
    
    end.href = 'javascript:void(0);';
    
    run.onclick = function(){
      cont.remove();
      
      Test.errors = errors.checked;
      Test.mode = mode.value;
      
      Test.printInfo();
      test();
      
      document.body.appendChild(document.createElement('br'));
      document.body.appendChild(end);
    };
    
    temp = document.createElement('span');
    temp.innerHTML = 'Mode: ';
    cont.appendChild(temp);
    cont.appendChild(mode);
    cont.appendChild(document.createElement('br'));
    
    cont.appendChild(errors);
    temp = document.createElement('span');
    temp.innerHTML = 'Show errors<br>';
    cont.appendChild(temp);
    
    cont.appendChild(document.createElement('br'));
    cont.appendChild(run);
    
    return;
  }
  
  Test.printInfo();
  test();
};

function showErrors(){
  var i,unr = unresolved.slice(0),ret;
  
  for(i = 0;i < unr.length;i++){
    if(tests.get(unr[i]) == 0){
      status.set(unr[i],'error');
      wraps.set(unr[i],0);
      resolve(unr[i]);
    }
  }
  
  if(Test.errors && errors.length){
    
    ret = '\nErrors: ';
    for(i = 0;i < errors.length;i++) if(errors[i].stack) ret += '\n\n' + errors[i].stack;
    ret += '\n';
    
    ret = ret.replace(/\n/g,getNL()).replace(/\s/g,'&nbsp;');
    
    output(ret);
  }
}

if(proc){
  
  Test.output = proc.env.output || 'std';
  Test.times = proc.env.times?(proc.env.times == 'true'?true:false):true;
  Test.numbers = proc.env.numbers?(proc.env.numbers == 'true'?true:false):true;
  Test.errors = proc.env.errors?(proc.env.errors == 'true'?true:false):false;
  Test.precision = proc.env.precision || '2';
  Test.mode = proc.env.mode || 'default';
  Test.status = proc.env.status || 'tick';
  Test.syntax = proc.env.syntax || 'console';
  
  proc.on('exit',showErrors);
  
}else{
  
  Test.output = 'browser';
  Test.times = true;
  Test.numbers = true;
  Test.errors = false;
  Test.precision = '2';
  Test.mode = 'default';
  Test.status = 'tick';
  Test.syntax = 'html';
  
}

Object.defineProperties(Test.prototype,{
  status: {
    get: function(){
      return status.get(this);
    },
    set: constants.NOOP
  },
  wrap: {value: function(f){
    var self = this,
        called = false;
    
    if(resolved.get(this)) throw new Error('Test already resolved, cannot call wrap again');
    wraps.of(this).value++;
    
    return function(){
      var ret;
      
      if(resolved.get(self)) return;
      
      if(called) throw new Error('A wrap can only be called once');
      called = true;
      
      stack.push(self);
      
      try{ ret = f.apply(this,arguments); }
      catch(e){
        if(e instanceof assert.AssertionError) status.set(self,'fail');
        else status.set(self,'error');
        
        errors.push(e);
      }
      
      stack.pop();
      
      if(--wraps.of(self).value == 0 && tests.get(self) == 0) resolve(self);
      
      return ret;
    };
  }}
});


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"assert":2,"os":6,"vz.constants":30,"vz.property":32}]},{},[1])