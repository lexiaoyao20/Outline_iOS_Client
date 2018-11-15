(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var __extends = undefined && undefined.__extends || function () {
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
(function iife() {
    var platformExportObj = function detectPlatformExportObj() {
        if (typeof module !== 'undefined' && module.exports) {
            return module.exports; // node
        } else if (typeof window !== 'undefined') {
            return window; // browser
        }
        throw new Error('Could not detect platform global object (no window or module.exports)');
    }();
    /* tslint:disable */
    var isBrowser = typeof window !== 'undefined';
    var b64Encode = isBrowser ? btoa : require('base-64').encode;
    var b64Decode = isBrowser ? atob : require('base-64').decode;
    var URL = isBrowser ? window.URL : require('url').URL;
    var punycode = isBrowser ? window.punycode : require('punycode');
    if (!punycode) {
        throw new Error("Could not find punycode. Did you forget to add e.g.\n  <script src=\"bower_components/punycode/punycode.min.js\"></script>?");
    }
    /* tslint:enable */
    // Custom error base class
    var ShadowsocksConfigError = /** @class */function (_super) {
        __extends(ShadowsocksConfigError, _super);
        function ShadowsocksConfigError(message) {
            var _newTarget = this.constructor;
            var _this = _super.call(this, message) || this;
            Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain
            _this.name = _newTarget.name;
            return _this;
        }
        return ShadowsocksConfigError;
    }(Error);
    platformExportObj.ShadowsocksConfigError = ShadowsocksConfigError;
    var InvalidConfigField = /** @class */function (_super) {
        __extends(InvalidConfigField, _super);
        function InvalidConfigField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return InvalidConfigField;
    }(ShadowsocksConfigError);
    platformExportObj.InvalidConfigField = InvalidConfigField;
    var InvalidUri = /** @class */function (_super) {
        __extends(InvalidUri, _super);
        function InvalidUri() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return InvalidUri;
    }(ShadowsocksConfigError);
    platformExportObj.InvalidUri = InvalidUri;
    // Self-validating/normalizing config data types implement this ValidatedConfigField interface.
    // Constructors take some data, validate, normalize, and store if valid, or throw otherwise.
    var ValidatedConfigField = /** @class */function () {
        function ValidatedConfigField() {}
        return ValidatedConfigField;
    }();
    platformExportObj.ValidatedConfigField = ValidatedConfigField;
    function throwErrorForInvalidField(name, value, reason) {
        throw new InvalidConfigField("Invalid " + name + ": " + value + " " + (reason || ''));
    }
    var Host = /** @class */function (_super) {
        __extends(Host, _super);
        function Host(host) {
            var _this = _super.call(this) || this;
            if (!host) {
                throwErrorForInvalidField('host', host);
            }
            if (host instanceof Host) {
                host = host.data;
            }
            host = punycode.toASCII(host);
            _this.isIPv4 = Host.IPV4_PATTERN.test(host);
            _this.isIPv6 = _this.isIPv4 ? false : Host.IPV6_PATTERN.test(host);
            _this.isHostname = _this.isIPv4 || _this.isIPv6 ? false : Host.HOSTNAME_PATTERN.test(host);
            if (!(_this.isIPv4 || _this.isIPv6 || _this.isHostname)) {
                throwErrorForInvalidField('host', host);
            }
            _this.data = host;
            return _this;
        }
        Host.IPV4_PATTERN = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        Host.IPV6_PATTERN = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;
        Host.HOSTNAME_PATTERN = /^[A-z0-9]+[A-z0-9_.-]*$/;
        return Host;
    }(ValidatedConfigField);
    platformExportObj.Host = Host;
    var Port = /** @class */function (_super) {
        __extends(Port, _super);
        function Port(port) {
            var _this = _super.call(this) || this;
            if (port instanceof Port) {
                port = port.data;
            }
            if (typeof port === 'number') {
                // Stringify in case negative or floating point -> the regex test below will catch.
                port = port.toString();
            }
            if (!Port.PATTERN.test(port)) {
                throwErrorForInvalidField('port', port);
            }
            // Could exceed the maximum port number, so convert to Number to check. Could also have leading
            // zeros. Converting to Number drops those, so we get normalization for free. :)
            port = Number(port);
            if (port > 65535) {
                throwErrorForInvalidField('port', port);
            }
            _this.data = port;
            return _this;
        }
        Port.PATTERN = /^[0-9]{1,5}$/;
        return Port;
    }(ValidatedConfigField);
    platformExportObj.Port = Port;
    // A method value must exactly match an element in the set of known ciphers.
    // ref: https://github.com/shadowsocks/shadowsocks-libev/blob/10a2d3e3/completions/bash/ss-redir#L5
    platformExportObj.METHODS = new Set(['rc4-md5', 'aes-128-gcm', 'aes-192-gcm', 'aes-256-gcm', 'aes-128-cfb', 'aes-192-cfb', 'aes-256-cfb', 'aes-128-ctr', 'aes-192-ctr', 'aes-256-ctr', 'camellia-128-cfb', 'camellia-192-cfb', 'camellia-256-cfb', 'bf-cfb', 'chacha20-ietf-poly1305', 'salsa20', 'chacha20', 'chacha20-ietf', 'xchacha20-ietf-poly1305']);
    var Method = /** @class */function (_super) {
        __extends(Method, _super);
        function Method(method) {
            var _this = _super.call(this) || this;
            if (method instanceof Method) {
                method = method.data;
            }
            if (!platformExportObj.METHODS.has(method)) {
                throwErrorForInvalidField('method', method);
            }
            _this.data = method;
            return _this;
        }
        return Method;
    }(ValidatedConfigField);
    platformExportObj.Method = Method;
    var Password = /** @class */function (_super) {
        __extends(Password, _super);
        function Password(password) {
            var _this = _super.call(this) || this;
            _this.data = password instanceof Password ? password.data : password;
            return _this;
        }
        return Password;
    }(ValidatedConfigField);
    platformExportObj.Password = Password;
    var Tag = /** @class */function (_super) {
        __extends(Tag, _super);
        function Tag(tag) {
            if (tag === void 0) {
                tag = '';
            }
            var _this = _super.call(this) || this;
            _this.data = tag instanceof Tag ? tag.data : tag;
            return _this;
        }
        return Tag;
    }(ValidatedConfigField);
    platformExportObj.Tag = Tag;
    // tslint:disable-next-line:no-any
    function makeConfig(input) {
        // Use "!" for the required fields to tell tsc that we handle undefined in the
        // ValidatedConfigFields we call; tsc can't figure that out otherwise.
        var config = {
            host: new Host(input.host),
            port: new Port(input.port),
            method: new Method(input.method),
            password: new Password(input.password),
            tag: new Tag(input.tag),
            extra: {}
        };
        // Put any remaining fields in `input` into `config.extra`.
        for (var _i = 0, _a = Object.keys(input); _i < _a.length; _i++) {
            var key = _a[_i];
            if (!/^(host|port|method|password|tag)$/.test(key)) {
                config.extra[key] = input[key] && input[key].toString();
            }
        }
        return config;
    }
    platformExportObj.makeConfig = makeConfig;
    platformExportObj.SHADOWSOCKS_URI = {
        PROTOCOL: 'ss:',
        getUriFormattedHost: function getUriFormattedHost(host) {
            return host.isIPv6 ? "[" + host.data + "]" : host.data;
        },
        getHash: function getHash(tag) {
            return tag.data ? "#" + encodeURIComponent(tag.data) : '';
        },
        validateProtocol: function validateProtocol(uri) {
            if (!uri.startsWith(platformExportObj.SHADOWSOCKS_URI.PROTOCOL)) {
                throw new InvalidUri("URI must start with \"" + platformExportObj.SHADOWSOCKS_URI.PROTOCOL + "\"");
            }
        },
        parse: function parse(uri) {
            var error;
            for (var _i = 0, _a = [platformExportObj.SIP002_URI, platformExportObj.LEGACY_BASE64_URI]; _i < _a.length; _i++) {
                var uriType = _a[_i];
                try {
                    return uriType.parse(uri);
                } catch (e) {
                    error = e;
                }
            }
            if (!(error instanceof InvalidUri)) {
                var originalErrorName = error.name || '(Unnamed Error)';
                var originalErrorMessage = error.message || '(no error message provided)';
                var originalErrorString = originalErrorName + ": " + originalErrorMessage;
                var newErrorMessage = "Invalid input: " + originalErrorString;
                error = new InvalidUri(newErrorMessage);
            }
            throw error;
        }
    };
    // Ref: https://shadowsocks.org/en/config/quick-guide.html
    platformExportObj.LEGACY_BASE64_URI = {
        parse: function parse(uri) {
            platformExportObj.SHADOWSOCKS_URI.validateProtocol(uri);
            var hashIndex = uri.indexOf('#');
            var hasTag = hashIndex !== -1;
            var b64EndIndex = hasTag ? hashIndex : uri.length;
            var tagStartIndex = hasTag ? hashIndex + 1 : uri.length;
            var tag = new Tag(decodeURIComponent(uri.substring(tagStartIndex)));
            var b64EncodedData = uri.substring('ss://'.length, b64EndIndex);
            var b64DecodedData = b64Decode(b64EncodedData);
            var atSignIndex = b64DecodedData.indexOf('@');
            if (atSignIndex === -1) {
                throw new InvalidUri("Missing \"@\"");
            }
            var methodAndPassword = b64DecodedData.substring(0, atSignIndex);
            var methodEndIndex = methodAndPassword.indexOf(':');
            if (methodEndIndex === -1) {
                throw new InvalidUri("Missing password");
            }
            var methodString = methodAndPassword.substring(0, methodEndIndex);
            var method = new Method(methodString);
            var passwordStartIndex = methodEndIndex + 1;
            var passwordString = methodAndPassword.substring(passwordStartIndex);
            var password = new Password(passwordString);
            var hostStartIndex = atSignIndex + 1;
            var hostAndPort = b64DecodedData.substring(hostStartIndex);
            var hostEndIndex = hostAndPort.lastIndexOf(':');
            if (hostEndIndex === -1) {
                throw new InvalidUri("Missing port");
            }
            var uriFormattedHost = hostAndPort.substring(0, hostEndIndex);
            var host;
            try {
                host = new Host(uriFormattedHost);
            } catch (_) {
                // Could be IPv6 host formatted with surrounding brackets, so try stripping first and last
                // characters. If this throws, give up and let the exception propagate.
                host = new Host(uriFormattedHost.substring(1, uriFormattedHost.length - 1));
            }
            var portStartIndex = hostEndIndex + 1;
            var portString = hostAndPort.substring(portStartIndex);
            var port = new Port(portString);
            var extra = {}; // empty because LegacyBase64Uri can't hold extra
            return { method: method, password: password, host: host, port: port, tag: tag, extra: extra };
        },
        stringify: function stringify(config) {
            var host = config.host,
                port = config.port,
                method = config.method,
                password = config.password,
                tag = config.tag;
            var hash = platformExportObj.SHADOWSOCKS_URI.getHash(tag);
            var b64EncodedData = b64Encode(method.data + ":" + password.data + "@" + host.data + ":" + port.data);
            var dataLength = b64EncodedData.length;
            var paddingLength = 0;
            for (; b64EncodedData[dataLength - 1 - paddingLength] === '='; paddingLength++) {}
            b64EncodedData = paddingLength === 0 ? b64EncodedData : b64EncodedData.substring(0, dataLength - paddingLength);
            return "ss://" + b64EncodedData + hash;
        }
    };
    // Ref: https://shadowsocks.org/en/spec/SIP002-URI-Scheme.html
    platformExportObj.SIP002_URI = {
        parse: function parse(uri) {
            platformExportObj.SHADOWSOCKS_URI.validateProtocol(uri);
            // Can use built-in URL parser for expedience. Just have to replace "ss" with "http" to ensure
            // correct results, otherwise browsers like Safari fail to parse it.
            var inputForUrlParser = "http" + uri.substring(2);
            // The built-in URL parser throws as desired when given URIs with invalid syntax.
            var urlParserResult = new URL(inputForUrlParser);
            var uriFormattedHost = urlParserResult.hostname;
            // URI-formatted IPv6 hostnames have surrounding brackets.
            var last = uriFormattedHost.length - 1;
            var brackets = uriFormattedHost[0] === '[' && uriFormattedHost[last] === ']';
            var hostString = brackets ? uriFormattedHost.substring(1, last) : uriFormattedHost;
            var host = new Host(hostString);
            var parsedPort = urlParserResult.port;
            if (!parsedPort && uri.match(/:80($|\/)/g)) {
                // The default URL parser fails to recognize the default port (80) when the URI being parsed
                // is HTTP. Check if the port is present at the end of the string or before the parameters.
                parsedPort = 80;
            }
            var port = new Port(parsedPort);
            var tag = new Tag(decodeURIComponent(urlParserResult.hash.substring(1)));
            var b64EncodedUserInfo = urlParserResult.username.replace(/%3D/g, '=');
            // base64.decode throws as desired when given invalid base64 input.
            var b64DecodedUserInfo = b64Decode(b64EncodedUserInfo);
            var colonIdx = b64DecodedUserInfo.indexOf(':');
            if (colonIdx === -1) {
                throw new InvalidUri("Missing password");
            }
            var methodString = b64DecodedUserInfo.substring(0, colonIdx);
            var method = new Method(methodString);
            var passwordString = b64DecodedUserInfo.substring(colonIdx + 1);
            var password = new Password(passwordString);
            var queryParams = urlParserResult.search.substring(1).split('&');
            var extra = {};
            for (var _i = 0, queryParams_1 = queryParams; _i < queryParams_1.length; _i++) {
                var pair = queryParams_1[_i];
                var _a = pair.split('=', 2),
                    key = _a[0],
                    value = _a[1];
                if (!key) continue;
                extra[key] = decodeURIComponent(value || '');
            }
            return { method: method, password: password, host: host, port: port, tag: tag, extra: extra };
        },
        stringify: function stringify(config) {
            var host = config.host,
                port = config.port,
                method = config.method,
                password = config.password,
                tag = config.tag,
                extra = config.extra;
            var userInfo = b64Encode(method.data + ":" + password.data);
            var uriHost = platformExportObj.SHADOWSOCKS_URI.getUriFormattedHost(host);
            var hash = platformExportObj.SHADOWSOCKS_URI.getHash(tag);
            var queryString = '';
            for (var key in extra) {
                if (!key) continue;
                queryString += (queryString ? '&' : '?') + (key + "=" + encodeURIComponent(extra[key]));
            }
            return "ss://" + userInfo + "@" + uriHost + ":" + port.data + "/" + queryString + hash;
        }
    };
})();

},{"base-64":2,"punycode":3,"url":14}],2:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! http://mths.be/base64 v0.1.0 by @mathias | MIT license */
;(function (root) {

	// Detect free variables `exports`.
	var freeExports = (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = (typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module && module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code, and use
	// it as `root`.
	var freeGlobal = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var InvalidCharacterError = function InvalidCharacterError(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error();
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	var error = function error(message) {
		// Note: the error messages used throughout this file match those used by
		// the native `atob`/`btoa` implementation in Chromium.
		throw new InvalidCharacterError(message);
	};

	var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	// http://whatwg.org/html/common-microsyntaxes.html#space-character
	var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;

	// `decode` is designed to be fully compatible with `atob` as described in the
	// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
	// The optimized base64-decoding algorithm used is based on @atk’s excellent
	// implementation. https://gist.github.com/atk/1020396
	var decode = function decode(input) {
		input = String(input).replace(REGEX_SPACE_CHARACTERS, '');
		var length = input.length;
		if (length % 4 == 0) {
			input = input.replace(/==?$/, '');
			length = input.length;
		}
		if (length % 4 == 1 ||
		// http://whatwg.org/C#alphanumeric-ascii-characters
		/[^+a-zA-Z0-9/]/.test(input)) {
			error('Invalid character: the string to be decoded is not correctly encoded.');
		}
		var bitCounter = 0;
		var bitStorage;
		var buffer;
		var output = '';
		var position = -1;
		while (++position < length) {
			buffer = TABLE.indexOf(input.charAt(position));
			bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
			// Unless this is the first of a group of 4 characters…
			if (bitCounter++ % 4) {
				// …convert the first 8 bits to a single ASCII character.
				output += String.fromCharCode(0xFF & bitStorage >> (-2 * bitCounter & 6));
			}
		}
		return output;
	};

	// `encode` is designed to be fully compatible with `btoa` as described in the
	// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
	var encode = function encode(input) {
		input = String(input);
		if (/[^\0-\xFF]/.test(input)) {
			// Note: no need to special-case astral symbols here, as surrogates are
			// matched, and the input is supposed to only contain ASCII anyway.
			error('The string to be encoded contains characters outside of the ' + 'Latin1 range.');
		}
		var padding = input.length % 3;
		var output = '';
		var position = -1;
		var a;
		var b;
		var c;
		var d;
		var buffer;
		// Make sure any padding is handled outside of the loop.
		var length = input.length - padding;

		while (++position < length) {
			// Read three bytes, i.e. 24 bits.
			a = input.charCodeAt(position) << 16;
			b = input.charCodeAt(++position) << 8;
			c = input.charCodeAt(++position);
			buffer = a + b + c;
			// Turn the 24 bits into four chunks of 6 bits each, and append the
			// matching character for each of them to the output.
			output += TABLE.charAt(buffer >> 18 & 0x3F) + TABLE.charAt(buffer >> 12 & 0x3F) + TABLE.charAt(buffer >> 6 & 0x3F) + TABLE.charAt(buffer & 0x3F);
		}

		if (padding == 2) {
			a = input.charCodeAt(position) << 8;
			b = input.charCodeAt(++position);
			buffer = a + b;
			output += TABLE.charAt(buffer >> 10) + TABLE.charAt(buffer >> 4 & 0x3F) + TABLE.charAt(buffer << 2 & 0x3F) + '=';
		} else if (padding == 1) {
			buffer = input.charCodeAt(position);
			output += TABLE.charAt(buffer >> 2) + TABLE.charAt(buffer << 4 & 0x3F) + '==';
		}

		return output;
	};

	var base64 = {
		'encode': encode,
		'decode': decode,
		'version': '0.1.0'
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (typeof define == 'function' && _typeof(define.amd) == 'object' && define.amd) {
		define(function () {
			return base64;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) {
			// in Node.js or RingoJS v0.8.0+
			freeModule.exports = base64;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (var key in base64) {
				base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.base64 = base64;
	}
})(undefined);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function (root) {

	/** Detect free variables */
	var freeExports = (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
	var freeModule = (typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module && !module.nodeType && module;
	var freeGlobal = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal) {
		root = freeGlobal;
	}

	/**
  * The `punycode` object.
  * @name punycode
  * @type Object
  */
	var punycode,


	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647,
	    // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	    tMin = 1,
	    tMax = 26,
	    skew = 38,
	    damp = 700,
	    initialBias = 72,
	    initialN = 128,
	    // 0x80
	delimiter = '-',
	    // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	    regexNonASCII = /[^\x20-\x7E]/,
	    // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g,
	    // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},


	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	    floor = Math.floor,
	    stringFromCharCode = String.fromCharCode,


	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
  * A generic error utility function.
  * @private
  * @param {String} type The error type.
  * @returns {Error} Throws a `RangeError` with the applicable error message.
  */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
  * A generic `Array#map` utility function.
  * @private
  * @param {Array} array The array to iterate over.
  * @param {Function} callback The function that gets called for every array
  * item.
  * @returns {Array} A new array of values returned by the callback function.
  */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
  * A simple `Array#map`-like wrapper to work with domain name strings or email
  * addresses.
  * @private
  * @param {String} domain The domain name or email address.
  * @param {Function} callback The function that gets called for every
  * character.
  * @returns {Array} A new string of characters returned by the callback
  * function.
  */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
  * Creates an array containing the numeric code points of each Unicode
  * character in the string. While JavaScript uses UCS-2 internally,
  * this function will convert a pair of surrogate halves (each of which
  * UCS-2 exposes as separate characters) into a single code point,
  * matching UTF-16.
  * @see `punycode.ucs2.encode`
  * @see <https://mathiasbynens.be/notes/javascript-encoding>
  * @memberOf punycode.ucs2
  * @name decode
  * @param {String} string The Unicode input string (UCS-2).
  * @returns {Array} The new array of code points.
  */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) {
					// low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
  * Creates a string based on an array of numeric code points.
  * @see `punycode.ucs2.decode`
  * @memberOf punycode.ucs2
  * @name encode
  * @param {Array} codePoints The array of numeric code points.
  * @returns {String} The new Unicode string (UCS-2).
  */
	function ucs2encode(array) {
		return map(array, function (value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
  * Converts a basic code point into a digit/integer.
  * @see `digitToBasic()`
  * @private
  * @param {Number} codePoint The basic numeric code point value.
  * @returns {Number} The numeric value of a basic code point (for use in
  * representing integers) in the range `0` to `base - 1`, or `base` if
  * the code point does not represent a value.
  */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
  * Converts a digit/integer into a basic code point.
  * @see `basicToDigit()`
  * @private
  * @param {Number} digit The numeric value of a basic code point.
  * @returns {Number} The basic code point whose value (when used for
  * representing integers) is `digit`, which needs to be in the range
  * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
  * used; else, the lowercase form is used. The behavior is undefined
  * if `flag` is non-zero and `digit` has no uppercase form.
  */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
  * Bias adaptation function as per section 3.4 of RFC 3492.
  * https://tools.ietf.org/html/rfc3492#section-3.4
  * @private
  */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (; /* no initialization */delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
  * Converts a Punycode string of ASCII-only symbols to a string of Unicode
  * symbols.
  * @memberOf punycode
  * @param {String} input The Punycode string of ASCII-only symbols.
  * @returns {String} The resulting string of Unicode symbols.
  */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,

		/** Cached calculation results */
		baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) /* no final expression */{

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base;; /* no condition */k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;
			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);
		}

		return ucs2encode(output);
	}

	/**
  * Converts a string of Unicode symbols (e.g. a domain name label) to a
  * Punycode string of ASCII-only symbols.
  * @memberOf punycode
  * @param {String} input The string of Unicode symbols.
  * @returns {String} The resulting Punycode string of ASCII-only symbols.
  */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],

		/** `inputLength` will hold the number of code points in `input`. */
		inputLength,

		/** Cached calculation results */
		handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base;; /* no condition */k += base) {
						t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;
		}
		return output.join('');
	}

	/**
  * Converts a Punycode string representing a domain name or an email address
  * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
  * it doesn't matter if you call it on a string that has already been
  * converted to Unicode.
  * @memberOf punycode
  * @param {String} input The Punycoded domain name or email address to
  * convert to Unicode.
  * @returns {String} The Unicode representation of the given Punycode
  * string.
  */
	function toUnicode(input) {
		return mapDomain(input, function (string) {
			return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
		});
	}

	/**
  * Converts a Unicode string representing a domain name or an email address to
  * Punycode. Only the non-ASCII parts of the domain name will be converted,
  * i.e. it doesn't matter if you call it with a domain that's already in
  * ASCII.
  * @memberOf punycode
  * @param {String} input The domain name or email address to convert, as a
  * Unicode string.
  * @returns {String} The Punycode representation of the given domain name or
  * email address.
  */
	function toASCII(input) {
		return mapDomain(input, function (string) {
			return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
   * A string representing the current Punycode.js version number.
   * @memberOf punycode
   * @type String
   */
		'version': '1.4.1',
		/**
   * An object of methods to convert from JavaScript's internal character
   * representation (UCS-2) to Unicode code points, and back.
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode
   * @type Object
   */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (typeof define == 'function' && _typeof(define.amd) == 'object' && define.amd) {
		define('punycode', function () {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}
})(undefined);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
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

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function (qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr,
        vstr,
        k,
        v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],5:[function(require,module,exports){
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

'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var stringifyPrimitive = function stringifyPrimitive(v) {
  switch (typeof v === 'undefined' ? 'undefined' : _typeof(v)) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function (obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
    return map(objectKeys(obj), function (k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function (v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);
  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map(xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],6:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":4,"./encode":5}],7:[function(require,module,exports){
'use strict';

function RavenConfigError(message) {
  this.name = 'RavenConfigError';
  this.message = message;
}
RavenConfigError.prototype = new Error();
RavenConfigError.prototype.constructor = RavenConfigError;

module.exports = RavenConfigError;

},{}],8:[function(require,module,exports){
'use strict';

var wrapMethod = function wrapMethod(console, level, callback) {
  var originalConsoleLevel = console[level];
  var originalConsole = console;

  if (!(level in console)) {
    return;
  }

  var sentryLevel = level === 'warn' ? 'warning' : level;

  console[level] = function () {
    var args = [].slice.call(arguments);

    var msg = '' + args.join(' ');
    var data = { level: sentryLevel, logger: 'console', extra: { arguments: args } };

    if (level === 'assert') {
      if (args[0] === false) {
        // Default browsers message
        msg = 'Assertion failed: ' + (args.slice(1).join(' ') || 'console.assert');
        data.extra.arguments = args.slice(1);
        callback && callback(msg, data);
      }
    } else {
      callback && callback(msg, data);
    }

    // this fails for some browsers. :(
    if (originalConsoleLevel) {
      // IE9 doesn't allow calling apply on console functions directly
      // See: https://stackoverflow.com/questions/5472938/does-ie9-support-console-log-and-is-it-a-real-function#answer-5473193
      Function.prototype.apply.call(originalConsoleLevel, originalConsole, args);
    }
  };
};

module.exports = {
  wrapMethod: wrapMethod
};

},{}],9:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*global XDomainRequest:false */

var TraceKit = require('../vendor/TraceKit/tracekit');
var stringify = require('../vendor/json-stringify-safe/stringify');
var RavenConfigError = require('./configError');

var utils = require('./utils');
var isError = utils.isError;
var isObject = utils.isObject;
var isErrorEvent = utils.isErrorEvent;
var isUndefined = utils.isUndefined;
var isFunction = utils.isFunction;
var isString = utils.isString;
var isArray = utils.isArray;
var isEmptyObject = utils.isEmptyObject;
var each = utils.each;
var objectMerge = utils.objectMerge;
var truncate = utils.truncate;
var objectFrozen = utils.objectFrozen;
var hasKey = utils.hasKey;
var joinRegExp = utils.joinRegExp;
var urlencode = utils.urlencode;
var uuid4 = utils.uuid4;
var htmlTreeAsString = utils.htmlTreeAsString;
var isSameException = utils.isSameException;
var isSameStacktrace = utils.isSameStacktrace;
var parseUrl = utils.parseUrl;
var fill = utils.fill;

var wrapConsoleMethod = require('./console').wrapMethod;

var dsnKeys = 'source protocol user pass host port path'.split(' '),
    dsnPattern = /^(?:(\w+):)?\/\/(?:(\w+)(:\w+)?@)?([\w\.-]+)(?::(\d+))?(\/.*)/;

function now() {
  return +new Date();
}

// This is to be defensive in environments where window does not exist (see https://github.com/getsentry/raven-js/pull/785)
var _window = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
var _document = _window.document;
var _navigator = _window.navigator;

function keepOriginalCallback(original, callback) {
  return isFunction(callback) ? function (data) {
    return callback(data, original);
  } : callback;
}

// First, check for JSON support
// If there is no JSON, we no-op the core features of Raven
// since JSON is required to encode the payload
function Raven() {
  this._hasJSON = !!((typeof JSON === 'undefined' ? 'undefined' : _typeof(JSON)) === 'object' && JSON.stringify);
  // Raven can run in contexts where there's no document (react-native)
  this._hasDocument = !isUndefined(_document);
  this._hasNavigator = !isUndefined(_navigator);
  this._lastCapturedException = null;
  this._lastData = null;
  this._lastEventId = null;
  this._globalServer = null;
  this._globalKey = null;
  this._globalProject = null;
  this._globalContext = {};
  this._globalOptions = {
    logger: 'javascript',
    ignoreErrors: [],
    ignoreUrls: [],
    whitelistUrls: [],
    includePaths: [],
    collectWindowErrors: true,
    maxMessageLength: 0,

    // By default, truncates URL values to 250 chars
    maxUrlLength: 250,
    stackTraceLimit: 50,
    autoBreadcrumbs: true,
    instrument: true,
    sampleRate: 1
  };
  this._ignoreOnError = 0;
  this._isRavenInstalled = false;
  this._originalErrorStackTraceLimit = Error.stackTraceLimit;
  // capture references to window.console *and* all its methods first
  // before the console plugin has a chance to monkey patch
  this._originalConsole = _window.console || {};
  this._originalConsoleMethods = {};
  this._plugins = [];
  this._startTime = now();
  this._wrappedBuiltIns = [];
  this._breadcrumbs = [];
  this._lastCapturedEvent = null;
  this._keypressTimeout;
  this._location = _window.location;
  this._lastHref = this._location && this._location.href;
  this._resetBackoff();

  // eslint-disable-next-line guard-for-in
  for (var method in this._originalConsole) {
    this._originalConsoleMethods[method] = this._originalConsole[method];
  }
}

/*
 * The core Raven singleton
 *
 * @this {Raven}
 */

Raven.prototype = {
  // Hardcode version string so that raven source can be loaded directly via
  // webpack (using a build step causes webpack #1617). Grunt verifies that
  // this value matches package.json during build.
  //   See: https://github.com/getsentry/raven-js/issues/465
  VERSION: '3.20.1',

  debug: false,

  TraceKit: TraceKit, // alias to TraceKit

  /*
     * Configure Raven with a DSN and extra options
     *
     * @param {string} dsn The public Sentry DSN
     * @param {object} options Set of global options [optional]
     * @return {Raven}
     */
  config: function config(dsn, options) {
    var self = this;

    if (self._globalServer) {
      this._logDebug('error', 'Error: Raven has already been configured');
      return self;
    }
    if (!dsn) return self;

    var globalOptions = self._globalOptions;

    // merge in options
    if (options) {
      each(options, function (key, value) {
        // tags and extra are special and need to be put into context
        if (key === 'tags' || key === 'extra' || key === 'user') {
          self._globalContext[key] = value;
        } else {
          globalOptions[key] = value;
        }
      });
    }

    self.setDSN(dsn);

    // "Script error." is hard coded into browsers for errors that it can't read.
    // this is the result of a script being pulled in from an external domain and CORS.
    globalOptions.ignoreErrors.push(/^Script error\.?$/);
    globalOptions.ignoreErrors.push(/^Javascript error: Script error\.? on line 0$/);

    // join regexp rules into one big rule
    globalOptions.ignoreErrors = joinRegExp(globalOptions.ignoreErrors);
    globalOptions.ignoreUrls = globalOptions.ignoreUrls.length ? joinRegExp(globalOptions.ignoreUrls) : false;
    globalOptions.whitelistUrls = globalOptions.whitelistUrls.length ? joinRegExp(globalOptions.whitelistUrls) : false;
    globalOptions.includePaths = joinRegExp(globalOptions.includePaths);
    globalOptions.maxBreadcrumbs = Math.max(0, Math.min(globalOptions.maxBreadcrumbs || 100, 100)); // default and hard limit is 100

    var autoBreadcrumbDefaults = {
      xhr: true,
      console: true,
      dom: true,
      location: true,
      sentry: true
    };

    var autoBreadcrumbs = globalOptions.autoBreadcrumbs;
    if ({}.toString.call(autoBreadcrumbs) === '[object Object]') {
      autoBreadcrumbs = objectMerge(autoBreadcrumbDefaults, autoBreadcrumbs);
    } else if (autoBreadcrumbs !== false) {
      autoBreadcrumbs = autoBreadcrumbDefaults;
    }
    globalOptions.autoBreadcrumbs = autoBreadcrumbs;

    var instrumentDefaults = {
      tryCatch: true
    };

    var instrument = globalOptions.instrument;
    if ({}.toString.call(instrument) === '[object Object]') {
      instrument = objectMerge(instrumentDefaults, instrument);
    } else if (instrument !== false) {
      instrument = instrumentDefaults;
    }
    globalOptions.instrument = instrument;

    TraceKit.collectWindowErrors = !!globalOptions.collectWindowErrors;

    // return for chaining
    return self;
  },

  /*
     * Installs a global window.onerror error handler
     * to capture and report uncaught exceptions.
     * At this point, install() is required to be called due
     * to the way TraceKit is set up.
     *
     * @return {Raven}
     */
  install: function install() {
    var self = this;
    if (self.isSetup() && !self._isRavenInstalled) {
      TraceKit.report.subscribe(function () {
        self._handleOnErrorStackInfo.apply(self, arguments);
      });

      self._patchFunctionToString();

      if (self._globalOptions.instrument && self._globalOptions.instrument.tryCatch) {
        self._instrumentTryCatch();
      }

      if (self._globalOptions.autoBreadcrumbs) self._instrumentBreadcrumbs();

      // Install all of the plugins
      self._drainPlugins();

      self._isRavenInstalled = true;
    }

    Error.stackTraceLimit = self._globalOptions.stackTraceLimit;
    return this;
  },

  /*
     * Set the DSN (can be called multiple time unlike config)
     *
     * @param {string} dsn The public Sentry DSN
     */
  setDSN: function setDSN(dsn) {
    var self = this,
        uri = self._parseDSN(dsn),
        lastSlash = uri.path.lastIndexOf('/'),
        path = uri.path.substr(1, lastSlash);

    self._dsn = dsn;
    self._globalKey = uri.user;
    self._globalSecret = uri.pass && uri.pass.substr(1);
    self._globalProject = uri.path.substr(lastSlash + 1);

    self._globalServer = self._getGlobalServer(uri);

    self._globalEndpoint = self._globalServer + '/' + path + 'api/' + self._globalProject + '/store/';

    // Reset backoff state since we may be pointing at a
    // new project/server
    this._resetBackoff();
  },

  /*
     * Wrap code within a context so Raven can capture errors
     * reliably across domains that is executed immediately.
     *
     * @param {object} options A specific set of options for this context [optional]
     * @param {function} func The callback to be immediately executed within the context
     * @param {array} args An array of arguments to be called with the callback [optional]
     */
  context: function context(options, func, args) {
    if (isFunction(options)) {
      args = func || [];
      func = options;
      options = undefined;
    }

    return this.wrap(options, func).apply(this, args);
  },

  /*
     * Wrap code within a context and returns back a new function to be executed
     *
     * @param {object} options A specific set of options for this context [optional]
     * @param {function} func The function to be wrapped in a new context
     * @param {function} func A function to call before the try/catch wrapper [optional, private]
     * @return {function} The newly wrapped functions with a context
     */
  wrap: function wrap(options, func, _before) {
    var self = this;
    // 1 argument has been passed, and it's not a function
    // so just return it
    if (isUndefined(func) && !isFunction(options)) {
      return options;
    }

    // options is optional
    if (isFunction(options)) {
      func = options;
      options = undefined;
    }

    // At this point, we've passed along 2 arguments, and the second one
    // is not a function either, so we'll just return the second argument.
    if (!isFunction(func)) {
      return func;
    }

    // We don't wanna wrap it twice!
    try {
      if (func.__raven__) {
        return func;
      }

      // If this has already been wrapped in the past, return that
      if (func.__raven_wrapper__) {
        return func.__raven_wrapper__;
      }
    } catch (e) {
      // Just accessing custom props in some Selenium environments
      // can cause a "Permission denied" exception (see raven-js#495).
      // Bail on wrapping and return the function as-is (defers to window.onerror).
      return func;
    }

    function wrapped() {
      var args = [],
          i = arguments.length,
          deep = !options || options && options.deep !== false;

      if (_before && isFunction(_before)) {
        _before.apply(this, arguments);
      }

      // Recursively wrap all of a function's arguments that are
      // functions themselves.
      while (i--) {
        args[i] = deep ? self.wrap(options, arguments[i]) : arguments[i];
      }try {
        // Attempt to invoke user-land function
        // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
        //       means Raven caught an error invoking your application code. This is
        //       expected behavior and NOT indicative of a bug with Raven.js.
        return func.apply(this, args);
      } catch (e) {
        self._ignoreNextOnError();
        self.captureException(e, options);
        throw e;
      }
    }

    // copy over properties of the old function
    for (var property in func) {
      if (hasKey(func, property)) {
        wrapped[property] = func[property];
      }
    }
    wrapped.prototype = func.prototype;

    func.__raven_wrapper__ = wrapped;
    // Signal that this function has been wrapped/filled already
    // for both debugging and to prevent it to being wrapped/filled twice
    wrapped.__raven__ = true;
    wrapped.__orig__ = func;

    return wrapped;
  },

  /*
     * Uninstalls the global error handler.
     *
     * @return {Raven}
     */
  uninstall: function uninstall() {
    TraceKit.report.uninstall();

    this._unpatchFunctionToString();
    this._restoreBuiltIns();

    Error.stackTraceLimit = this._originalErrorStackTraceLimit;
    this._isRavenInstalled = false;

    return this;
  },

  /*
     * Manually capture an exception and send it over to Sentry
     *
     * @param {error} ex An exception to be logged
     * @param {object} options A specific set of options for this error [optional]
     * @return {Raven}
     */
  captureException: function captureException(ex, options) {
    // Cases for sending ex as a message, rather than an exception
    var isNotError = !isError(ex);
    var isNotErrorEvent = !isErrorEvent(ex);
    var isErrorEventWithoutError = isErrorEvent(ex) && !ex.error;

    if (isNotError && isNotErrorEvent || isErrorEventWithoutError) {
      return this.captureMessage(ex, objectMerge({
        trimHeadFrames: 1,
        stacktrace: true // if we fall back to captureMessage, default to attempting a new trace
      }, options));
    }

    // Get actual Error from ErrorEvent
    if (isErrorEvent(ex)) ex = ex.error;

    // Store the raw exception object for potential debugging and introspection
    this._lastCapturedException = ex;

    // TraceKit.report will re-raise any exception passed to it,
    // which means you have to wrap it in try/catch. Instead, we
    // can wrap it here and only re-raise if TraceKit.report
    // raises an exception different from the one we asked to
    // report on.
    try {
      var stack = TraceKit.computeStackTrace(ex);
      this._handleStackInfo(stack, options);
    } catch (ex1) {
      if (ex !== ex1) {
        throw ex1;
      }
    }

    return this;
  },

  /*
     * Manually send a message to Sentry
     *
     * @param {string} msg A plain message to be captured in Sentry
     * @param {object} options A specific set of options for this message [optional]
     * @return {Raven}
     */
  captureMessage: function captureMessage(msg, options) {
    // config() automagically converts ignoreErrors from a list to a RegExp so we need to test for an
    // early call; we'll error on the side of logging anything called before configuration since it's
    // probably something you should see:
    if (!!this._globalOptions.ignoreErrors.test && this._globalOptions.ignoreErrors.test(msg)) {
      return;
    }

    options = options || {};

    var data = objectMerge({
      message: msg + '' // Make sure it's actually a string
    }, options);

    var ex;
    // Generate a "synthetic" stack trace from this point.
    // NOTE: If you are a Sentry user, and you are seeing this stack frame, it is NOT indicative
    //       of a bug with Raven.js. Sentry generates synthetic traces either by configuration,
    //       or if it catches a thrown object without a "stack" property.
    try {
      throw new Error(msg);
    } catch (ex1) {
      ex = ex1;
    }

    // null exception name so `Error` isn't prefixed to msg
    ex.name = null;
    var stack = TraceKit.computeStackTrace(ex);

    // stack[0] is `throw new Error(msg)` call itself, we are interested in the frame that was just before that, stack[1]
    var initialCall = isArray(stack.stack) && stack.stack[1];
    var fileurl = initialCall && initialCall.url || '';

    if (!!this._globalOptions.ignoreUrls.test && this._globalOptions.ignoreUrls.test(fileurl)) {
      return;
    }

    if (!!this._globalOptions.whitelistUrls.test && !this._globalOptions.whitelistUrls.test(fileurl)) {
      return;
    }

    if (this._globalOptions.stacktrace || options && options.stacktrace) {
      options = objectMerge({
        // fingerprint on msg, not stack trace (legacy behavior, could be
        // revisited)
        fingerprint: msg,
        // since we know this is a synthetic trace, the top N-most frames
        // MUST be from Raven.js, so mark them as in_app later by setting
        // trimHeadFrames
        trimHeadFrames: (options.trimHeadFrames || 0) + 1
      }, options);

      var frames = this._prepareFrames(stack, options);
      data.stacktrace = {
        // Sentry expects frames oldest to newest
        frames: frames.reverse()
      };
    }

    // Fire away!
    this._send(data);

    return this;
  },

  captureBreadcrumb: function captureBreadcrumb(obj) {
    var crumb = objectMerge({
      timestamp: now() / 1000
    }, obj);

    if (isFunction(this._globalOptions.breadcrumbCallback)) {
      var result = this._globalOptions.breadcrumbCallback(crumb);

      if (isObject(result) && !isEmptyObject(result)) {
        crumb = result;
      } else if (result === false) {
        return this;
      }
    }

    this._breadcrumbs.push(crumb);
    if (this._breadcrumbs.length > this._globalOptions.maxBreadcrumbs) {
      this._breadcrumbs.shift();
    }
    return this;
  },

  addPlugin: function addPlugin(plugin /*arg1, arg2, ... argN*/) {
    var pluginArgs = [].slice.call(arguments, 1);

    this._plugins.push([plugin, pluginArgs]);
    if (this._isRavenInstalled) {
      this._drainPlugins();
    }

    return this;
  },

  /*
     * Set/clear a user to be sent along with the payload.
     *
     * @param {object} user An object representing user data [optional]
     * @return {Raven}
     */
  setUserContext: function setUserContext(user) {
    // Intentionally do not merge here since that's an unexpected behavior.
    this._globalContext.user = user;

    return this;
  },

  /*
     * Merge extra attributes to be sent along with the payload.
     *
     * @param {object} extra An object representing extra data [optional]
     * @return {Raven}
     */
  setExtraContext: function setExtraContext(extra) {
    this._mergeContext('extra', extra);

    return this;
  },

  /*
     * Merge tags to be sent along with the payload.
     *
     * @param {object} tags An object representing tags [optional]
     * @return {Raven}
     */
  setTagsContext: function setTagsContext(tags) {
    this._mergeContext('tags', tags);

    return this;
  },

  /*
     * Clear all of the context.
     *
     * @return {Raven}
     */
  clearContext: function clearContext() {
    this._globalContext = {};

    return this;
  },

  /*
     * Get a copy of the current context. This cannot be mutated.
     *
     * @return {object} copy of context
     */
  getContext: function getContext() {
    // lol javascript
    return JSON.parse(stringify(this._globalContext));
  },

  /*
     * Set environment of application
     *
     * @param {string} environment Typically something like 'production'.
     * @return {Raven}
     */
  setEnvironment: function setEnvironment(environment) {
    this._globalOptions.environment = environment;

    return this;
  },

  /*
     * Set release version of application
     *
     * @param {string} release Typically something like a git SHA to identify version
     * @return {Raven}
     */
  setRelease: function setRelease(release) {
    this._globalOptions.release = release;

    return this;
  },

  /*
     * Set the dataCallback option
     *
     * @param {function} callback The callback to run which allows the
     *                            data blob to be mutated before sending
     * @return {Raven}
     */
  setDataCallback: function setDataCallback(callback) {
    var original = this._globalOptions.dataCallback;
    this._globalOptions.dataCallback = keepOriginalCallback(original, callback);
    return this;
  },

  /*
     * Set the breadcrumbCallback option
     *
     * @param {function} callback The callback to run which allows filtering
     *                            or mutating breadcrumbs
     * @return {Raven}
     */
  setBreadcrumbCallback: function setBreadcrumbCallback(callback) {
    var original = this._globalOptions.breadcrumbCallback;
    this._globalOptions.breadcrumbCallback = keepOriginalCallback(original, callback);
    return this;
  },

  /*
     * Set the shouldSendCallback option
     *
     * @param {function} callback The callback to run which allows
     *                            introspecting the blob before sending
     * @return {Raven}
     */
  setShouldSendCallback: function setShouldSendCallback(callback) {
    var original = this._globalOptions.shouldSendCallback;
    this._globalOptions.shouldSendCallback = keepOriginalCallback(original, callback);
    return this;
  },

  /**
     * Override the default HTTP transport mechanism that transmits data
     * to the Sentry server.
     *
     * @param {function} transport Function invoked instead of the default
     *                             `makeRequest` handler.
     *
     * @return {Raven}
     */
  setTransport: function setTransport(transport) {
    this._globalOptions.transport = transport;

    return this;
  },

  /*
     * Get the latest raw exception that was captured by Raven.
     *
     * @return {error}
     */
  lastException: function lastException() {
    return this._lastCapturedException;
  },

  /*
     * Get the last event id
     *
     * @return {string}
     */
  lastEventId: function lastEventId() {
    return this._lastEventId;
  },

  /*
     * Determine if Raven is setup and ready to go.
     *
     * @return {boolean}
     */
  isSetup: function isSetup() {
    if (!this._hasJSON) return false; // needs JSON support
    if (!this._globalServer) {
      if (!this.ravenNotConfiguredError) {
        this.ravenNotConfiguredError = true;
        this._logDebug('error', 'Error: Raven has not been configured.');
      }
      return false;
    }
    return true;
  },

  afterLoad: function afterLoad() {
    // TODO: remove window dependence?

    // Attempt to initialize Raven on load
    var RavenConfig = _window.RavenConfig;
    if (RavenConfig) {
      this.config(RavenConfig.dsn, RavenConfig.config).install();
    }
  },

  showReportDialog: function showReportDialog(options) {
    if (!_document // doesn't work without a document (React native)
    ) return;

    options = options || {};

    var lastEventId = options.eventId || this.lastEventId();
    if (!lastEventId) {
      throw new RavenConfigError('Missing eventId');
    }

    var dsn = options.dsn || this._dsn;
    if (!dsn) {
      throw new RavenConfigError('Missing DSN');
    }

    var encode = encodeURIComponent;
    var qs = '';
    qs += '?eventId=' + encode(lastEventId);
    qs += '&dsn=' + encode(dsn);

    var user = options.user || this._globalContext.user;
    if (user) {
      if (user.name) qs += '&name=' + encode(user.name);
      if (user.email) qs += '&email=' + encode(user.email);
    }

    var globalServer = this._getGlobalServer(this._parseDSN(dsn));

    var script = _document.createElement('script');
    script.async = true;
    script.src = globalServer + '/api/embed/error-page/' + qs;
    (_document.head || _document.body).appendChild(script);
  },

  /**** Private functions ****/
  _ignoreNextOnError: function _ignoreNextOnError() {
    var self = this;
    this._ignoreOnError += 1;
    setTimeout(function () {
      // onerror should trigger before setTimeout
      self._ignoreOnError -= 1;
    });
  },

  _triggerEvent: function _triggerEvent(eventType, options) {
    // NOTE: `event` is a native browser thing, so let's avoid conflicting wiht it
    var evt, key;

    if (!this._hasDocument) return;

    options = options || {};

    eventType = 'raven' + eventType.substr(0, 1).toUpperCase() + eventType.substr(1);

    if (_document.createEvent) {
      evt = _document.createEvent('HTMLEvents');
      evt.initEvent(eventType, true, true);
    } else {
      evt = _document.createEventObject();
      evt.eventType = eventType;
    }

    for (key in options) {
      if (hasKey(options, key)) {
        evt[key] = options[key];
      }
    }if (_document.createEvent) {
      // IE9 if standards
      _document.dispatchEvent(evt);
    } else {
      // IE8 regardless of Quirks or Standards
      // IE9 if quirks
      try {
        _document.fireEvent('on' + evt.eventType.toLowerCase(), evt);
      } catch (e) {
        // Do nothing
      }
    }
  },

  /**
     * Wraps addEventListener to capture UI breadcrumbs
     * @param evtName the event name (e.g. "click")
     * @returns {Function}
     * @private
     */
  _breadcrumbEventHandler: function _breadcrumbEventHandler(evtName) {
    var self = this;
    return function (evt) {
      // reset keypress timeout; e.g. triggering a 'click' after
      // a 'keypress' will reset the keypress debounce so that a new
      // set of keypresses can be recorded
      self._keypressTimeout = null;

      // It's possible this handler might trigger multiple times for the same
      // event (e.g. event propagation through node ancestors). Ignore if we've
      // already captured the event.
      if (self._lastCapturedEvent === evt) return;

      self._lastCapturedEvent = evt;

      // try/catch both:
      // - accessing evt.target (see getsentry/raven-js#838, #768)
      // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
      //   can throw an exception in some circumstances.
      var target;
      try {
        target = htmlTreeAsString(evt.target);
      } catch (e) {
        target = '<unknown>';
      }

      self.captureBreadcrumb({
        category: 'ui.' + evtName, // e.g. ui.click, ui.input
        message: target
      });
    };
  },

  /**
     * Wraps addEventListener to capture keypress UI events
     * @returns {Function}
     * @private
     */
  _keypressEventHandler: function _keypressEventHandler() {
    var self = this,
        debounceDuration = 1000; // milliseconds

    // TODO: if somehow user switches keypress target before
    //       debounce timeout is triggered, we will only capture
    //       a single breadcrumb from the FIRST target (acceptable?)
    return function (evt) {
      var target;
      try {
        target = evt.target;
      } catch (e) {
        // just accessing event properties can throw an exception in some rare circumstances
        // see: https://github.com/getsentry/raven-js/issues/838
        return;
      }
      var tagName = target && target.tagName;

      // only consider keypress events on actual input elements
      // this will disregard keypresses targeting body (e.g. tabbing
      // through elements, hotkeys, etc)
      if (!tagName || tagName !== 'INPUT' && tagName !== 'TEXTAREA' && !target.isContentEditable) return;

      // record first keypress in a series, but ignore subsequent
      // keypresses until debounce clears
      var timeout = self._keypressTimeout;
      if (!timeout) {
        self._breadcrumbEventHandler('input')(evt);
      }
      clearTimeout(timeout);
      self._keypressTimeout = setTimeout(function () {
        self._keypressTimeout = null;
      }, debounceDuration);
    };
  },

  /**
     * Captures a breadcrumb of type "navigation", normalizing input URLs
     * @param to the originating URL
     * @param from the target URL
     * @private
     */
  _captureUrlChange: function _captureUrlChange(from, to) {
    var parsedLoc = parseUrl(this._location.href);
    var parsedTo = parseUrl(to);
    var parsedFrom = parseUrl(from);

    // because onpopstate only tells you the "new" (to) value of location.href, and
    // not the previous (from) value, we need to track the value of the current URL
    // state ourselves
    this._lastHref = to;

    // Use only the path component of the URL if the URL matches the current
    // document (almost all the time when using pushState)
    if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) to = parsedTo.relative;
    if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) from = parsedFrom.relative;

    this.captureBreadcrumb({
      category: 'navigation',
      data: {
        to: to,
        from: from
      }
    });
  },

  _patchFunctionToString: function _patchFunctionToString() {
    var self = this;
    self._originalFunctionToString = Function.prototype.toString;
    // eslint-disable-next-line no-extend-native
    Function.prototype.toString = function () {
      if (typeof this === 'function' && this.__raven__) {
        return self._originalFunctionToString.apply(this.__orig__, arguments);
      }
      return self._originalFunctionToString.apply(this, arguments);
    };
  },

  _unpatchFunctionToString: function _unpatchFunctionToString() {
    if (this._originalFunctionToString) {
      // eslint-disable-next-line no-extend-native
      Function.prototype.toString = this._originalFunctionToString;
    }
  },

  /**
     * Wrap timer functions and event targets to catch errors and provide
     * better metadata.
     */
  _instrumentTryCatch: function _instrumentTryCatch() {
    var self = this;

    var wrappedBuiltIns = self._wrappedBuiltIns;

    function wrapTimeFn(orig) {
      return function (fn, t) {
        // preserve arity
        // Make a copy of the arguments to prevent deoptimization
        // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i) {
          args[i] = arguments[i];
        }
        var originalCallback = args[0];
        if (isFunction(originalCallback)) {
          args[0] = self.wrap(originalCallback);
        }

        // IE < 9 doesn't support .call/.apply on setInterval/setTimeout, but it
        // also supports only two arguments and doesn't care what this is, so we
        // can just call the original function directly.
        if (orig.apply) {
          return orig.apply(this, args);
        } else {
          return orig(args[0], args[1]);
        }
      };
    }

    var autoBreadcrumbs = this._globalOptions.autoBreadcrumbs;

    function wrapEventTarget(global) {
      var proto = _window[global] && _window[global].prototype;
      if (proto && proto.hasOwnProperty && proto.hasOwnProperty('addEventListener')) {
        fill(proto, 'addEventListener', function (orig) {
          return function (evtName, fn, capture, secure) {
            // preserve arity
            try {
              if (fn && fn.handleEvent) {
                fn.handleEvent = self.wrap(fn.handleEvent);
              }
            } catch (err) {}
            // can sometimes get 'Permission denied to access property "handle Event'


            // More breadcrumb DOM capture ... done here and not in `_instrumentBreadcrumbs`
            // so that we don't have more than one wrapper function
            var before, clickHandler, keypressHandler;

            if (autoBreadcrumbs && autoBreadcrumbs.dom && (global === 'EventTarget' || global === 'Node')) {
              // NOTE: generating multiple handlers per addEventListener invocation, should
              //       revisit and verify we can just use one (almost certainly)
              clickHandler = self._breadcrumbEventHandler('click');
              keypressHandler = self._keypressEventHandler();
              before = function before(evt) {
                // need to intercept every DOM event in `before` argument, in case that
                // same wrapped method is re-used for different events (e.g. mousemove THEN click)
                // see #724
                if (!evt) return;

                var eventType;
                try {
                  eventType = evt.type;
                } catch (e) {
                  // just accessing event properties can throw an exception in some rare circumstances
                  // see: https://github.com/getsentry/raven-js/issues/838
                  return;
                }
                if (eventType === 'click') return clickHandler(evt);else if (eventType === 'keypress') return keypressHandler(evt);
              };
            }
            return orig.call(this, evtName, self.wrap(fn, undefined, before), capture, secure);
          };
        }, wrappedBuiltIns);
        fill(proto, 'removeEventListener', function (orig) {
          return function (evt, fn, capture, secure) {
            try {
              fn = fn && (fn.__raven_wrapper__ ? fn.__raven_wrapper__ : fn);
            } catch (e) {
              // ignore, accessing __raven_wrapper__ will throw in some Selenium environments
            }
            return orig.call(this, evt, fn, capture, secure);
          };
        }, wrappedBuiltIns);
      }
    }

    fill(_window, 'setTimeout', wrapTimeFn, wrappedBuiltIns);
    fill(_window, 'setInterval', wrapTimeFn, wrappedBuiltIns);
    if (_window.requestAnimationFrame) {
      fill(_window, 'requestAnimationFrame', function (orig) {
        return function (cb) {
          return orig(self.wrap(cb));
        };
      }, wrappedBuiltIns);
    }

    // event targets borrowed from bugsnag-js:
    // https://github.com/bugsnag/bugsnag-js/blob/master/src/bugsnag.js#L666
    var eventTargets = ['EventTarget', 'Window', 'Node', 'ApplicationCache', 'AudioTrackList', 'ChannelMergerNode', 'CryptoOperation', 'EventSource', 'FileReader', 'HTMLUnknownElement', 'IDBDatabase', 'IDBRequest', 'IDBTransaction', 'KeyOperation', 'MediaController', 'MessagePort', 'ModalWindow', 'Notification', 'SVGElementInstance', 'Screen', 'TextTrack', 'TextTrackCue', 'TextTrackList', 'WebSocket', 'WebSocketWorker', 'Worker', 'XMLHttpRequest', 'XMLHttpRequestEventTarget', 'XMLHttpRequestUpload'];
    for (var i = 0; i < eventTargets.length; i++) {
      wrapEventTarget(eventTargets[i]);
    }
  },

  /**
     * Instrument browser built-ins w/ breadcrumb capturing
     *  - XMLHttpRequests
     *  - DOM interactions (click/typing)
     *  - window.location changes
     *  - console
     *
     * Can be disabled or individually configured via the `autoBreadcrumbs` config option
     */
  _instrumentBreadcrumbs: function _instrumentBreadcrumbs() {
    var self = this;
    var autoBreadcrumbs = this._globalOptions.autoBreadcrumbs;

    var wrappedBuiltIns = self._wrappedBuiltIns;

    function wrapProp(prop, xhr) {
      if (prop in xhr && isFunction(xhr[prop])) {
        fill(xhr, prop, function (orig) {
          return self.wrap(orig);
        }); // intentionally don't track filled methods on XHR instances
      }
    }

    if (autoBreadcrumbs.xhr && 'XMLHttpRequest' in _window) {
      var xhrproto = XMLHttpRequest.prototype;
      fill(xhrproto, 'open', function (origOpen) {
        return function (method, url) {
          // preserve arity

          // if Sentry key appears in URL, don't capture
          if (isString(url) && url.indexOf(self._globalKey) === -1) {
            this.__raven_xhr = {
              method: method,
              url: url,
              status_code: null
            };
          }

          return origOpen.apply(this, arguments);
        };
      }, wrappedBuiltIns);

      fill(xhrproto, 'send', function (origSend) {
        return function (data) {
          // preserve arity
          var xhr = this;

          function onreadystatechangeHandler() {
            if (xhr.__raven_xhr && xhr.readyState === 4) {
              try {
                // touching statusCode in some platforms throws
                // an exception
                xhr.__raven_xhr.status_code = xhr.status;
              } catch (e) {
                /* do nothing */
              }

              self.captureBreadcrumb({
                type: 'http',
                category: 'xhr',
                data: xhr.__raven_xhr
              });
            }
          }

          var props = ['onload', 'onerror', 'onprogress'];
          for (var j = 0; j < props.length; j++) {
            wrapProp(props[j], xhr);
          }

          if ('onreadystatechange' in xhr && isFunction(xhr.onreadystatechange)) {
            fill(xhr, 'onreadystatechange', function (orig) {
              return self.wrap(orig, undefined, onreadystatechangeHandler);
            } /* intentionally don't track this instrumentation */
            );
          } else {
            // if onreadystatechange wasn't actually set by the page on this xhr, we
            // are free to set our own and capture the breadcrumb
            xhr.onreadystatechange = onreadystatechangeHandler;
          }

          return origSend.apply(this, arguments);
        };
      }, wrappedBuiltIns);
    }

    if (autoBreadcrumbs.xhr && 'fetch' in _window) {
      fill(_window, 'fetch', function (origFetch) {
        return function (fn, t) {
          // preserve arity
          // Make a copy of the arguments to prevent deoptimization
          // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
          var args = new Array(arguments.length);
          for (var i = 0; i < args.length; ++i) {
            args[i] = arguments[i];
          }

          var fetchInput = args[0];
          var method = 'GET';
          var url;

          if (typeof fetchInput === 'string') {
            url = fetchInput;
          } else if ('Request' in _window && fetchInput instanceof _window.Request) {
            url = fetchInput.url;
            if (fetchInput.method) {
              method = fetchInput.method;
            }
          } else {
            url = '' + fetchInput;
          }

          if (args[1] && args[1].method) {
            method = args[1].method;
          }

          var fetchData = {
            method: method,
            url: url,
            status_code: null
          };

          self.captureBreadcrumb({
            type: 'http',
            category: 'fetch',
            data: fetchData
          });

          return origFetch.apply(this, args).then(function (response) {
            fetchData.status_code = response.status;

            return response;
          });
        };
      }, wrappedBuiltIns);
    }

    // Capture breadcrumbs from any click that is unhandled / bubbled up all the way
    // to the document. Do this before we instrument addEventListener.
    if (autoBreadcrumbs.dom && this._hasDocument) {
      if (_document.addEventListener) {
        _document.addEventListener('click', self._breadcrumbEventHandler('click'), false);
        _document.addEventListener('keypress', self._keypressEventHandler(), false);
      } else {
        // IE8 Compatibility
        _document.attachEvent('onclick', self._breadcrumbEventHandler('click'));
        _document.attachEvent('onkeypress', self._keypressEventHandler());
      }
    }

    // record navigation (URL) changes
    // NOTE: in Chrome App environment, touching history.pushState, *even inside
    //       a try/catch block*, will cause Chrome to output an error to console.error
    // borrowed from: https://github.com/angular/angular.js/pull/13945/files
    var chrome = _window.chrome;
    var isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
    var hasPushAndReplaceState = !isChromePackagedApp && _window.history && history.pushState && history.replaceState;
    if (autoBreadcrumbs.location && hasPushAndReplaceState) {
      // TODO: remove onpopstate handler on uninstall()
      var oldOnPopState = _window.onpopstate;
      _window.onpopstate = function () {
        var currentHref = self._location.href;
        self._captureUrlChange(self._lastHref, currentHref);

        if (oldOnPopState) {
          return oldOnPopState.apply(this, arguments);
        }
      };

      var historyReplacementFunction = function historyReplacementFunction(origHistFunction) {
        // note history.pushState.length is 0; intentionally not declaring
        // params to preserve 0 arity
        return function () /* state, title, url */{
          var url = arguments.length > 2 ? arguments[2] : undefined;

          // url argument is optional
          if (url) {
            // coerce to string (this is what pushState does)
            self._captureUrlChange(self._lastHref, url + '');
          }

          return origHistFunction.apply(this, arguments);
        };
      };

      fill(history, 'pushState', historyReplacementFunction, wrappedBuiltIns);
      fill(history, 'replaceState', historyReplacementFunction, wrappedBuiltIns);
    }

    if (autoBreadcrumbs.console && 'console' in _window && console.log) {
      // console
      var consoleMethodCallback = function consoleMethodCallback(msg, data) {
        self.captureBreadcrumb({
          message: msg,
          level: data.level,
          category: 'console'
        });
      };

      each(['debug', 'info', 'warn', 'error', 'log'], function (_, level) {
        wrapConsoleMethod(console, level, consoleMethodCallback);
      });
    }
  },

  _restoreBuiltIns: function _restoreBuiltIns() {
    // restore any wrapped builtins
    var builtin;
    while (this._wrappedBuiltIns.length) {
      builtin = this._wrappedBuiltIns.shift();

      var obj = builtin[0],
          name = builtin[1],
          orig = builtin[2];

      obj[name] = orig;
    }
  },

  _drainPlugins: function _drainPlugins() {
    var self = this;

    // FIX ME TODO
    each(this._plugins, function (_, plugin) {
      var installer = plugin[0];
      var args = plugin[1];
      installer.apply(self, [self].concat(args));
    });
  },

  _parseDSN: function _parseDSN(str) {
    var m = dsnPattern.exec(str),
        dsn = {},
        i = 7;

    try {
      while (i--) {
        dsn[dsnKeys[i]] = m[i] || '';
      }
    } catch (e) {
      throw new RavenConfigError('Invalid DSN: ' + str);
    }

    if (dsn.pass && !this._globalOptions.allowSecretKey) {
      throw new RavenConfigError('Do not specify your secret key in the DSN. See: http://bit.ly/raven-secret-key');
    }

    return dsn;
  },

  _getGlobalServer: function _getGlobalServer(uri) {
    // assemble the endpoint from the uri pieces
    var globalServer = '//' + uri.host + (uri.port ? ':' + uri.port : '');

    if (uri.protocol) {
      globalServer = uri.protocol + ':' + globalServer;
    }
    return globalServer;
  },

  _handleOnErrorStackInfo: function _handleOnErrorStackInfo() {
    // if we are intentionally ignoring errors via onerror, bail out
    if (!this._ignoreOnError) {
      this._handleStackInfo.apply(this, arguments);
    }
  },

  _handleStackInfo: function _handleStackInfo(stackInfo, options) {
    var frames = this._prepareFrames(stackInfo, options);

    this._triggerEvent('handle', {
      stackInfo: stackInfo,
      options: options
    });

    this._processException(stackInfo.name, stackInfo.message, stackInfo.url, stackInfo.lineno, frames, options);
  },

  _prepareFrames: function _prepareFrames(stackInfo, options) {
    var self = this;
    var frames = [];
    if (stackInfo.stack && stackInfo.stack.length) {
      each(stackInfo.stack, function (i, stack) {
        var frame = self._normalizeFrame(stack, stackInfo.url);
        if (frame) {
          frames.push(frame);
        }
      });

      // e.g. frames captured via captureMessage throw
      if (options && options.trimHeadFrames) {
        for (var j = 0; j < options.trimHeadFrames && j < frames.length; j++) {
          frames[j].in_app = false;
        }
      }
    }
    frames = frames.slice(0, this._globalOptions.stackTraceLimit);
    return frames;
  },

  _normalizeFrame: function _normalizeFrame(frame, stackInfoUrl) {
    // normalize the frames data
    var normalized = {
      filename: frame.url,
      lineno: frame.line,
      colno: frame.column,
      function: frame.func || '?'
    };

    // Case when we don't have any information about the error
    // E.g. throwing a string or raw object, instead of an `Error` in Firefox
    // Generating synthetic error doesn't add any value here
    //
    // We should probably somehow let a user know that they should fix their code
    if (!frame.url) {
      normalized.filename = stackInfoUrl; // fallback to whole stacks url from onerror handler
    }

    normalized.in_app = !( // determine if an exception came from outside of our app
    // first we check the global includePaths list.
    !!this._globalOptions.includePaths.test && !this._globalOptions.includePaths.test(normalized.filename) ||
    // Now we check for fun, if the function name is Raven or TraceKit
    /(Raven|TraceKit)\./.test(normalized['function']) ||
    // finally, we do a last ditch effort and check for raven.min.js
    /raven\.(min\.)?js$/.test(normalized.filename));

    return normalized;
  },

  _processException: function _processException(type, message, fileurl, lineno, frames, options) {
    var prefixedMessage = (type ? type + ': ' : '') + (message || '');
    if (!!this._globalOptions.ignoreErrors.test && (this._globalOptions.ignoreErrors.test(message) || this._globalOptions.ignoreErrors.test(prefixedMessage))) {
      return;
    }

    var stacktrace;

    if (frames && frames.length) {
      fileurl = frames[0].filename || fileurl;
      // Sentry expects frames oldest to newest
      // and JS sends them as newest to oldest
      frames.reverse();
      stacktrace = { frames: frames };
    } else if (fileurl) {
      stacktrace = {
        frames: [{
          filename: fileurl,
          lineno: lineno,
          in_app: true
        }]
      };
    }

    if (!!this._globalOptions.ignoreUrls.test && this._globalOptions.ignoreUrls.test(fileurl)) {
      return;
    }

    if (!!this._globalOptions.whitelistUrls.test && !this._globalOptions.whitelistUrls.test(fileurl)) {
      return;
    }

    var data = objectMerge({
      // sentry.interfaces.Exception
      exception: {
        values: [{
          type: type,
          value: message,
          stacktrace: stacktrace
        }]
      },
      culprit: fileurl
    }, options);

    // Fire away!
    this._send(data);
  },

  _trimPacket: function _trimPacket(data) {
    // For now, we only want to truncate the two different messages
    // but this could/should be expanded to just trim everything
    var max = this._globalOptions.maxMessageLength;
    if (data.message) {
      data.message = truncate(data.message, max);
    }
    if (data.exception) {
      var exception = data.exception.values[0];
      exception.value = truncate(exception.value, max);
    }

    var request = data.request;
    if (request) {
      if (request.url) {
        request.url = truncate(request.url, this._globalOptions.maxUrlLength);
      }
      if (request.Referer) {
        request.Referer = truncate(request.Referer, this._globalOptions.maxUrlLength);
      }
    }

    if (data.breadcrumbs && data.breadcrumbs.values) this._trimBreadcrumbs(data.breadcrumbs);

    return data;
  },

  /**
     * Truncate breadcrumb values (right now just URLs)
     */
  _trimBreadcrumbs: function _trimBreadcrumbs(breadcrumbs) {
    // known breadcrumb properties with urls
    // TODO: also consider arbitrary prop values that start with (https?)?://
    var urlProps = ['to', 'from', 'url'],
        urlProp,
        crumb,
        data;

    for (var i = 0; i < breadcrumbs.values.length; ++i) {
      crumb = breadcrumbs.values[i];
      if (!crumb.hasOwnProperty('data') || !isObject(crumb.data) || objectFrozen(crumb.data)) continue;

      data = objectMerge({}, crumb.data);
      for (var j = 0; j < urlProps.length; ++j) {
        urlProp = urlProps[j];
        if (data.hasOwnProperty(urlProp) && data[urlProp]) {
          data[urlProp] = truncate(data[urlProp], this._globalOptions.maxUrlLength);
        }
      }
      breadcrumbs.values[i].data = data;
    }
  },

  _getHttpData: function _getHttpData() {
    if (!this._hasNavigator && !this._hasDocument) return;
    var httpData = {};

    if (this._hasNavigator && _navigator.userAgent) {
      httpData.headers = {
        'User-Agent': navigator.userAgent
      };
    }

    if (this._hasDocument) {
      if (_document.location && _document.location.href) {
        httpData.url = _document.location.href;
      }
      if (_document.referrer) {
        if (!httpData.headers) httpData.headers = {};
        httpData.headers.Referer = _document.referrer;
      }
    }

    return httpData;
  },

  _resetBackoff: function _resetBackoff() {
    this._backoffDuration = 0;
    this._backoffStart = null;
  },

  _shouldBackoff: function _shouldBackoff() {
    return this._backoffDuration && now() - this._backoffStart < this._backoffDuration;
  },

  /**
     * Returns true if the in-process data payload matches the signature
     * of the previously-sent data
     *
     * NOTE: This has to be done at this level because TraceKit can generate
     *       data from window.onerror WITHOUT an exception object (IE8, IE9,
     *       other old browsers). This can take the form of an "exception"
     *       data object with a single frame (derived from the onerror args).
     */
  _isRepeatData: function _isRepeatData(current) {
    var last = this._lastData;

    if (!last || current.message !== last.message || // defined for captureMessage
    current.culprit !== last.culprit // defined for captureException/onerror
    ) return false;

    // Stacktrace interface (i.e. from captureMessage)
    if (current.stacktrace || last.stacktrace) {
      return isSameStacktrace(current.stacktrace, last.stacktrace);
    } else if (current.exception || last.exception) {
      // Exception interface (i.e. from captureException/onerror)
      return isSameException(current.exception, last.exception);
    }

    return true;
  },

  _setBackoffState: function _setBackoffState(request) {
    // If we are already in a backoff state, don't change anything
    if (this._shouldBackoff()) {
      return;
    }

    var status = request.status;

    // 400 - project_id doesn't exist or some other fatal
    // 401 - invalid/revoked dsn
    // 429 - too many requests
    if (!(status === 400 || status === 401 || status === 429)) return;

    var retry;
    try {
      // If Retry-After is not in Access-Control-Expose-Headers, most
      // browsers will throw an exception trying to access it
      retry = request.getResponseHeader('Retry-After');
      retry = parseInt(retry, 10) * 1000; // Retry-After is returned in seconds
    } catch (e) {
      /* eslint no-empty:0 */
    }

    this._backoffDuration = retry ? // If Sentry server returned a Retry-After value, use it
    retry : // Otherwise, double the last backoff duration (starts at 1 sec)
    this._backoffDuration * 2 || 1000;

    this._backoffStart = now();
  },

  _send: function _send(data) {
    var globalOptions = this._globalOptions;

    var baseData = {
      project: this._globalProject,
      logger: globalOptions.logger,
      platform: 'javascript'
    },
        httpData = this._getHttpData();

    if (httpData) {
      baseData.request = httpData;
    }

    // HACK: delete `trimHeadFrames` to prevent from appearing in outbound payload
    if (data.trimHeadFrames) delete data.trimHeadFrames;

    data = objectMerge(baseData, data);

    // Merge in the tags and extra separately since objectMerge doesn't handle a deep merge
    data.tags = objectMerge(objectMerge({}, this._globalContext.tags), data.tags);
    data.extra = objectMerge(objectMerge({}, this._globalContext.extra), data.extra);

    // Send along our own collected metadata with extra
    data.extra['session:duration'] = now() - this._startTime;

    if (this._breadcrumbs && this._breadcrumbs.length > 0) {
      // intentionally make shallow copy so that additions
      // to breadcrumbs aren't accidentally sent in this request
      data.breadcrumbs = {
        values: [].slice.call(this._breadcrumbs, 0)
      };
    }

    // If there are no tags/extra, strip the key from the payload alltogther.
    if (isEmptyObject(data.tags)) delete data.tags;

    if (this._globalContext.user) {
      // sentry.interfaces.User
      data.user = this._globalContext.user;
    }

    // Include the environment if it's defined in globalOptions
    if (globalOptions.environment) data.environment = globalOptions.environment;

    // Include the release if it's defined in globalOptions
    if (globalOptions.release) data.release = globalOptions.release;

    // Include server_name if it's defined in globalOptions
    if (globalOptions.serverName) data.server_name = globalOptions.serverName;

    if (isFunction(globalOptions.dataCallback)) {
      data = globalOptions.dataCallback(data) || data;
    }

    // Why??????????
    if (!data || isEmptyObject(data)) {
      return;
    }

    // Check if the request should be filtered or not
    if (isFunction(globalOptions.shouldSendCallback) && !globalOptions.shouldSendCallback(data)) {
      return;
    }

    // Backoff state: Sentry server previously responded w/ an error (e.g. 429 - too many requests),
    // so drop requests until "cool-off" period has elapsed.
    if (this._shouldBackoff()) {
      this._logDebug('warn', 'Raven dropped error due to backoff: ', data);
      return;
    }

    if (typeof globalOptions.sampleRate === 'number') {
      if (Math.random() < globalOptions.sampleRate) {
        this._sendProcessedPayload(data);
      }
    } else {
      this._sendProcessedPayload(data);
    }
  },

  _getUuid: function _getUuid() {
    return uuid4();
  },

  _sendProcessedPayload: function _sendProcessedPayload(data, callback) {
    var self = this;
    var globalOptions = this._globalOptions;

    if (!this.isSetup()) return;

    // Try and clean up the packet before sending by truncating long values
    data = this._trimPacket(data);

    // ideally duplicate error testing should occur *before* dataCallback/shouldSendCallback,
    // but this would require copying an un-truncated copy of the data packet, which can be
    // arbitrarily deep (extra_data) -- could be worthwhile? will revisit
    if (!this._globalOptions.allowDuplicates && this._isRepeatData(data)) {
      this._logDebug('warn', 'Raven dropped repeat event: ', data);
      return;
    }

    // Send along an event_id if not explicitly passed.
    // This event_id can be used to reference the error within Sentry itself.
    // Set lastEventId after we know the error should actually be sent
    this._lastEventId = data.event_id || (data.event_id = this._getUuid());

    // Store outbound payload after trim
    this._lastData = data;

    this._logDebug('debug', 'Raven about to send:', data);

    var auth = {
      sentry_version: '7',
      sentry_client: 'raven-js/' + this.VERSION,
      sentry_key: this._globalKey
    };

    if (this._globalSecret) {
      auth.sentry_secret = this._globalSecret;
    }

    var exception = data.exception && data.exception.values[0];

    // only capture 'sentry' breadcrumb is autoBreadcrumbs is truthy
    if (this._globalOptions.autoBreadcrumbs && this._globalOptions.autoBreadcrumbs.sentry) {
      this.captureBreadcrumb({
        category: 'sentry',
        message: exception ? (exception.type ? exception.type + ': ' : '') + exception.value : data.message,
        event_id: data.event_id,
        level: data.level || 'error' // presume error unless specified
      });
    }

    var url = this._globalEndpoint;
    (globalOptions.transport || this._makeRequest).call(this, {
      url: url,
      auth: auth,
      data: data,
      options: globalOptions,
      onSuccess: function success() {
        self._resetBackoff();

        self._triggerEvent('success', {
          data: data,
          src: url
        });
        callback && callback();
      },
      onError: function failure(error) {
        self._logDebug('error', 'Raven transport failed to send: ', error);

        if (error.request) {
          self._setBackoffState(error.request);
        }

        self._triggerEvent('failure', {
          data: data,
          src: url
        });
        error = error || new Error('Raven send failed (no additional details provided)');
        callback && callback(error);
      }
    });
  },

  _makeRequest: function _makeRequest(opts) {
    var request = _window.XMLHttpRequest && new _window.XMLHttpRequest();
    if (!request) return;

    // if browser doesn't support CORS (e.g. IE7), we are out of luck
    var hasCORS = 'withCredentials' in request || typeof XDomainRequest !== 'undefined';

    if (!hasCORS) return;

    var url = opts.url;

    if ('withCredentials' in request) {
      request.onreadystatechange = function () {
        if (request.readyState !== 4) {
          return;
        } else if (request.status === 200) {
          opts.onSuccess && opts.onSuccess();
        } else if (opts.onError) {
          var err = new Error('Sentry error code: ' + request.status);
          err.request = request;
          opts.onError(err);
        }
      };
    } else {
      request = new XDomainRequest();
      // xdomainrequest cannot go http -> https (or vice versa),
      // so always use protocol relative
      url = url.replace(/^https?:/, '');

      // onreadystatechange not supported by XDomainRequest
      if (opts.onSuccess) {
        request.onload = opts.onSuccess;
      }
      if (opts.onError) {
        request.onerror = function () {
          var err = new Error('Sentry error code: XDomainRequest');
          err.request = request;
          opts.onError(err);
        };
      }
    }

    // NOTE: auth is intentionally sent as part of query string (NOT as custom
    //       HTTP header) so as to avoid preflight CORS requests
    request.open('POST', url + '?' + urlencode(opts.auth));
    request.send(stringify(opts.data));
  },

  _logDebug: function _logDebug(level) {
    if (this._originalConsoleMethods[level] && this.debug) {
      // In IE<10 console methods do not have their own 'apply' method
      Function.prototype.apply.call(this._originalConsoleMethods[level], this._originalConsole, [].slice.call(arguments, 1));
    }
  },

  _mergeContext: function _mergeContext(key, context) {
    if (isUndefined(context)) {
      delete this._globalContext[key];
    } else {
      this._globalContext[key] = objectMerge(this._globalContext[key] || {}, context);
    }
  }
};

// Deprecations
Raven.prototype.setUser = Raven.prototype.setUserContext;
Raven.prototype.setReleaseContext = Raven.prototype.setRelease;

module.exports = Raven;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../vendor/TraceKit/tracekit":12,"../vendor/json-stringify-safe/stringify":13,"./configError":7,"./console":8,"./utils":11}],10:[function(require,module,exports){
(function (global){
'use strict';

/**
 * Enforces a single instance of the Raven client, and the
 * main entry point for Raven. If you are a consumer of the
 * Raven library, you SHOULD load this file (vs raven.js).
 **/

var RavenConstructor = require('./raven');

// This is to be defensive in environments where window does not exist (see https://github.com/getsentry/raven-js/pull/785)
var _window = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
var _Raven = _window.Raven;

var Raven = new RavenConstructor();

/*
 * Allow multiple versions of Raven to be installed.
 * Strip Raven from the global context and returns the instance.
 *
 * @return {Raven}
 */
Raven.noConflict = function () {
  _window.Raven = _Raven;
  return Raven;
};

Raven.afterLoad();

module.exports = Raven;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./raven":9}],11:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _window = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function isObject(what) {
  return (typeof what === 'undefined' ? 'undefined' : _typeof(what)) === 'object' && what !== null;
}

// Yanked from https://git.io/vS8DV re-used under CC0
// with some tiny modifications
function isError(value) {
  switch ({}.toString.call(value)) {
    case '[object Error]':
      return true;
    case '[object Exception]':
      return true;
    case '[object DOMException]':
      return true;
    default:
      return value instanceof Error;
  }
}

function isErrorEvent(value) {
  return supportsErrorEvent() && {}.toString.call(value) === '[object ErrorEvent]';
}

function isUndefined(what) {
  return what === void 0;
}

function isFunction(what) {
  return typeof what === 'function';
}

function isString(what) {
  return Object.prototype.toString.call(what) === '[object String]';
}

function isArray(what) {
  return Object.prototype.toString.call(what) === '[object Array]';
}

function isEmptyObject(what) {
  for (var _ in what) {
    if (what.hasOwnProperty(_)) {
      return false;
    }
  }
  return true;
}

function supportsErrorEvent() {
  try {
    new ErrorEvent(''); // eslint-disable-line no-new
    return true;
  } catch (e) {
    return false;
  }
}

function wrappedCallback(callback) {
  function dataCallback(data, original) {
    var normalizedData = callback(data) || data;
    if (original) {
      return original(normalizedData) || normalizedData;
    }
    return normalizedData;
  }

  return dataCallback;
}

function each(obj, callback) {
  var i, j;

  if (isUndefined(obj.length)) {
    for (i in obj) {
      if (hasKey(obj, i)) {
        callback.call(null, i, obj[i]);
      }
    }
  } else {
    j = obj.length;
    if (j) {
      for (i = 0; i < j; i++) {
        callback.call(null, i, obj[i]);
      }
    }
  }
}

function objectMerge(obj1, obj2) {
  if (!obj2) {
    return obj1;
  }
  each(obj2, function (key, value) {
    obj1[key] = value;
  });
  return obj1;
}

/**
 * This function is only used for react-native.
 * react-native freezes object that have already been sent over the
 * js bridge. We need this function in order to check if the object is frozen.
 * So it's ok that objectFrozen returns false if Object.isFrozen is not
 * supported because it's not relevant for other "platforms". See related issue:
 * https://github.com/getsentry/react-native-sentry/issues/57
 */
function objectFrozen(obj) {
  if (!Object.isFrozen) {
    return false;
  }
  return Object.isFrozen(obj);
}

function truncate(str, max) {
  return !max || str.length <= max ? str : str.substr(0, max) + '\u2026';
}

/**
 * hasKey, a better form of hasOwnProperty
 * Example: hasKey(MainHostObject, property) === true/false
 *
 * @param {Object} host object to check property
 * @param {string} key to check
 */
function hasKey(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function joinRegExp(patterns) {
  // Combine an array of regular expressions and strings into one large regexp
  // Be mad.
  var sources = [],
      i = 0,
      len = patterns.length,
      pattern;

  for (; i < len; i++) {
    pattern = patterns[i];
    if (isString(pattern)) {
      // If it's a string, we need to escape it
      // Taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
      sources.push(pattern.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'));
    } else if (pattern && pattern.source) {
      // If it's a regexp already, we want to extract the source
      sources.push(pattern.source);
    }
    // Intentionally skip other cases
  }
  return new RegExp(sources.join('|'), 'i');
}

function urlencode(o) {
  var pairs = [];
  each(o, function (key, value) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
  });
  return pairs.join('&');
}

// borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
// intentionally using regex and not <a/> href parsing trick because React Native and other
// environments where DOM might not be available
function parseUrl(url) {
  var match = url.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
  if (!match) return {};

  // coerce to undefined values to empty string so we don't get 'undefined'
  var query = match[6] || '';
  var fragment = match[8] || '';
  return {
    protocol: match[2],
    host: match[4],
    path: match[5],
    relative: match[5] + query + fragment // everything minus origin
  };
}
function uuid4() {
  var crypto = _window.crypto || _window.msCrypto;

  if (!isUndefined(crypto) && crypto.getRandomValues) {
    // Use window.crypto API if available
    // eslint-disable-next-line no-undef
    var arr = new Uint16Array(8);
    crypto.getRandomValues(arr);

    // set 4 in byte 7
    arr[3] = arr[3] & 0xfff | 0x4000;
    // set 2 most significant bits of byte 9 to '10'
    arr[4] = arr[4] & 0x3fff | 0x8000;

    var pad = function pad(num) {
      var v = num.toString(16);
      while (v.length < 4) {
        v = '0' + v;
      }
      return v;
    };

    return pad(arr[0]) + pad(arr[1]) + pad(arr[2]) + pad(arr[3]) + pad(arr[4]) + pad(arr[5]) + pad(arr[6]) + pad(arr[7]);
  } else {
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }
}

/**
 * Given a child DOM element, returns a query-selector statement describing that
 * and its ancestors
 * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
 * @param elem
 * @returns {string}
 */
function htmlTreeAsString(elem) {
  /* eslint no-extra-parens:0*/
  var MAX_TRAVERSE_HEIGHT = 5,
      MAX_OUTPUT_LEN = 80,
      out = [],
      height = 0,
      len = 0,
      separator = ' > ',
      sepLength = separator.length,
      nextStr;

  while (elem && height++ < MAX_TRAVERSE_HEIGHT) {
    nextStr = htmlElementAsString(elem);
    // bail out if
    // - nextStr is the 'html' element
    // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
    //   (ignore this limit if we are on the first iteration)
    if (nextStr === 'html' || height > 1 && len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN) {
      break;
    }

    out.push(nextStr);

    len += nextStr.length;
    elem = elem.parentNode;
  }

  return out.reverse().join(separator);
}

/**
 * Returns a simple, query-selector representation of a DOM element
 * e.g. [HTMLElement] => input#foo.btn[name=baz]
 * @param HTMLElement
 * @returns {string}
 */
function htmlElementAsString(elem) {
  var out = [],
      className,
      classes,
      key,
      attr,
      i;

  if (!elem || !elem.tagName) {
    return '';
  }

  out.push(elem.tagName.toLowerCase());
  if (elem.id) {
    out.push('#' + elem.id);
  }

  className = elem.className;
  if (className && isString(className)) {
    classes = className.split(/\s+/);
    for (i = 0; i < classes.length; i++) {
      out.push('.' + classes[i]);
    }
  }
  var attrWhitelist = ['type', 'name', 'title', 'alt'];
  for (i = 0; i < attrWhitelist.length; i++) {
    key = attrWhitelist[i];
    attr = elem.getAttribute(key);
    if (attr) {
      out.push('[' + key + '="' + attr + '"]');
    }
  }
  return out.join('');
}

/**
 * Returns true if either a OR b is truthy, but not both
 */
function isOnlyOneTruthy(a, b) {
  return !!(!!a ^ !!b);
}

/**
 * Returns true if the two input exception interfaces have the same content
 */
function isSameException(ex1, ex2) {
  if (isOnlyOneTruthy(ex1, ex2)) return false;

  ex1 = ex1.values[0];
  ex2 = ex2.values[0];

  if (ex1.type !== ex2.type || ex1.value !== ex2.value) return false;

  return isSameStacktrace(ex1.stacktrace, ex2.stacktrace);
}

/**
 * Returns true if the two input stack trace interfaces have the same content
 */
function isSameStacktrace(stack1, stack2) {
  if (isOnlyOneTruthy(stack1, stack2)) return false;

  var frames1 = stack1.frames;
  var frames2 = stack2.frames;

  // Exit early if frame count differs
  if (frames1.length !== frames2.length) return false;

  // Iterate through every frame; bail out if anything differs
  var a, b;
  for (var i = 0; i < frames1.length; i++) {
    a = frames1[i];
    b = frames2[i];
    if (a.filename !== b.filename || a.lineno !== b.lineno || a.colno !== b.colno || a['function'] !== b['function']) return false;
  }
  return true;
}

/**
 * Polyfill a method
 * @param obj object e.g. `document`
 * @param name method name present on object e.g. `addEventListener`
 * @param replacement replacement function
 * @param track {optional} record instrumentation to an array
 */
function fill(obj, name, replacement, track) {
  var orig = obj[name];
  obj[name] = replacement(orig);
  obj[name].__raven__ = true;
  obj[name].__orig__ = orig;
  if (track) {
    track.push([obj, name, orig]);
  }
}

module.exports = {
  isObject: isObject,
  isError: isError,
  isErrorEvent: isErrorEvent,
  isUndefined: isUndefined,
  isFunction: isFunction,
  isString: isString,
  isArray: isArray,
  isEmptyObject: isEmptyObject,
  supportsErrorEvent: supportsErrorEvent,
  wrappedCallback: wrappedCallback,
  each: each,
  objectMerge: objectMerge,
  truncate: truncate,
  objectFrozen: objectFrozen,
  hasKey: hasKey,
  joinRegExp: joinRegExp,
  urlencode: urlencode,
  uuid4: uuid4,
  htmlTreeAsString: htmlTreeAsString,
  htmlElementAsString: htmlElementAsString,
  isSameException: isSameException,
  isSameStacktrace: isSameStacktrace,
  parseUrl: parseUrl,
  fill: fill
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],12:[function(require,module,exports){
(function (global){
'use strict';

var utils = require('../../src/utils');

/*
 TraceKit - Cross brower stack traces

 This was originally forked from github.com/occ/TraceKit, but has since been
 largely re-written and is now maintained as part of raven-js.  Tests for
 this are in test/vendor.

 MIT license
*/

var TraceKit = {
  collectWindowErrors: true,
  debug: false
};

// This is to be defensive in environments where window does not exist (see https://github.com/getsentry/raven-js/pull/785)
var _window = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

// global reference to slice
var _slice = [].slice;
var UNKNOWN_FUNCTION = '?';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Error_types
var ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;

function getLocationHref() {
  if (typeof document === 'undefined' || document.location == null) return '';

  return document.location.href;
}

/**
 * TraceKit.report: cross-browser processing of unhandled exceptions
 *
 * Syntax:
 *   TraceKit.report.subscribe(function(stackInfo) { ... })
 *   TraceKit.report.unsubscribe(function(stackInfo) { ... })
 *   TraceKit.report(exception)
 *   try { ...code... } catch(ex) { TraceKit.report(ex); }
 *
 * Supports:
 *   - Firefox: full stack trace with line numbers, plus column number
 *              on top frame; column number is not guaranteed
 *   - Opera:   full stack trace with line and column numbers
 *   - Chrome:  full stack trace with line and column numbers
 *   - Safari:  line and column number for the top frame only; some frames
 *              may be missing, and column number is not guaranteed
 *   - IE:      line and column number for the top frame only; some frames
 *              may be missing, and column number is not guaranteed
 *
 * In theory, TraceKit should work on all of the following versions:
 *   - IE5.5+ (only 8.0 tested)
 *   - Firefox 0.9+ (only 3.5+ tested)
 *   - Opera 7+ (only 10.50 tested; versions 9 and earlier may require
 *     Exceptions Have Stacktrace to be enabled in opera:config)
 *   - Safari 3+ (only 4+ tested)
 *   - Chrome 1+ (only 5+ tested)
 *   - Konqueror 3.5+ (untested)
 *
 * Requires TraceKit.computeStackTrace.
 *
 * Tries to catch all unhandled exceptions and report them to the
 * subscribed handlers. Please note that TraceKit.report will rethrow the
 * exception. This is REQUIRED in order to get a useful stack trace in IE.
 * If the exception does not reach the top of the browser, you will only
 * get a stack trace from the point where TraceKit.report was called.
 *
 * Handlers receive a stackInfo object as described in the
 * TraceKit.computeStackTrace docs.
 */
TraceKit.report = function reportModuleWrapper() {
  var handlers = [],
      lastArgs = null,
      lastException = null,
      lastExceptionStack = null;

  /**
     * Add a crash handler.
     * @param {Function} handler
     */
  function subscribe(handler) {
    installGlobalHandler();
    handlers.push(handler);
  }

  /**
     * Remove a crash handler.
     * @param {Function} handler
     */
  function unsubscribe(handler) {
    for (var i = handlers.length - 1; i >= 0; --i) {
      if (handlers[i] === handler) {
        handlers.splice(i, 1);
      }
    }
  }

  /**
     * Remove all crash handlers.
     */
  function unsubscribeAll() {
    uninstallGlobalHandler();
    handlers = [];
  }

  /**
     * Dispatch stack information to all handlers.
     * @param {Object.<string, *>} stack
     */
  function notifyHandlers(stack, isWindowError) {
    var exception = null;
    if (isWindowError && !TraceKit.collectWindowErrors) {
      return;
    }
    for (var i in handlers) {
      if (handlers.hasOwnProperty(i)) {
        try {
          handlers[i].apply(null, [stack].concat(_slice.call(arguments, 2)));
        } catch (inner) {
          exception = inner;
        }
      }
    }

    if (exception) {
      throw exception;
    }
  }

  var _oldOnerrorHandler, _onErrorHandlerInstalled;

  /**
     * Ensures all global unhandled exceptions are recorded.
     * Supported by Gecko and IE.
     * @param {string} message Error message.
     * @param {string} url URL of script that generated the exception.
     * @param {(number|string)} lineNo The line number at which the error
     * occurred.
     * @param {?(number|string)} colNo The column number at which the error
     * occurred.
     * @param {?Error} ex The actual Error object.
     */
  function traceKitWindowOnError(message, url, lineNo, colNo, ex) {
    var stack = null;

    if (lastExceptionStack) {
      TraceKit.computeStackTrace.augmentStackTraceWithInitialElement(lastExceptionStack, url, lineNo, message);
      processLastException();
    } else if (ex && utils.isError(ex)) {
      // non-string `ex` arg; attempt to extract stack trace

      // New chrome and blink send along a real error object
      // Let's just report that like a normal error.
      // See: https://mikewest.org/2013/08/debugging-runtime-errors-with-window-onerror
      stack = TraceKit.computeStackTrace(ex);
      notifyHandlers(stack, true);
    } else {
      var location = {
        url: url,
        line: lineNo,
        column: colNo
      };

      var name = undefined;
      var msg = message; // must be new var or will modify original `arguments`
      var groups;
      if ({}.toString.call(message) === '[object String]') {
        var groups = message.match(ERROR_TYPES_RE);
        if (groups) {
          name = groups[1];
          msg = groups[2];
        }
      }

      location.func = UNKNOWN_FUNCTION;

      stack = {
        name: name,
        message: msg,
        url: getLocationHref(),
        stack: [location]
      };
      notifyHandlers(stack, true);
    }

    if (_oldOnerrorHandler) {
      return _oldOnerrorHandler.apply(this, arguments);
    }

    return false;
  }

  function installGlobalHandler() {
    if (_onErrorHandlerInstalled) {
      return;
    }
    _oldOnerrorHandler = _window.onerror;
    _window.onerror = traceKitWindowOnError;
    _onErrorHandlerInstalled = true;
  }

  function uninstallGlobalHandler() {
    if (!_onErrorHandlerInstalled) {
      return;
    }
    _window.onerror = _oldOnerrorHandler;
    _onErrorHandlerInstalled = false;
    _oldOnerrorHandler = undefined;
  }

  function processLastException() {
    var _lastExceptionStack = lastExceptionStack,
        _lastArgs = lastArgs;
    lastArgs = null;
    lastExceptionStack = null;
    lastException = null;
    notifyHandlers.apply(null, [_lastExceptionStack, false].concat(_lastArgs));
  }

  /**
     * Reports an unhandled Error to TraceKit.
     * @param {Error} ex
     * @param {?boolean} rethrow If false, do not re-throw the exception.
     * Only used for window.onerror to not cause an infinite loop of
     * rethrowing.
     */
  function report(ex, rethrow) {
    var args = _slice.call(arguments, 1);
    if (lastExceptionStack) {
      if (lastException === ex) {
        return; // already caught by an inner catch block, ignore
      } else {
        processLastException();
      }
    }

    var stack = TraceKit.computeStackTrace(ex);
    lastExceptionStack = stack;
    lastException = ex;
    lastArgs = args;

    // If the stack trace is incomplete, wait for 2 seconds for
    // slow slow IE to see if onerror occurs or not before reporting
    // this exception; otherwise, we will end up with an incomplete
    // stack trace
    setTimeout(function () {
      if (lastException === ex) {
        processLastException();
      }
    }, stack.incomplete ? 2000 : 0);

    if (rethrow !== false) {
      throw ex; // re-throw to propagate to the top level (and cause window.onerror)
    }
  }

  report.subscribe = subscribe;
  report.unsubscribe = unsubscribe;
  report.uninstall = unsubscribeAll;
  return report;
}();

/**
 * TraceKit.computeStackTrace: cross-browser stack traces in JavaScript
 *
 * Syntax:
 *   s = TraceKit.computeStackTrace(exception) // consider using TraceKit.report instead (see below)
 * Returns:
 *   s.name              - exception name
 *   s.message           - exception message
 *   s.stack[i].url      - JavaScript or HTML file URL
 *   s.stack[i].func     - function name, or empty for anonymous functions (if guessing did not work)
 *   s.stack[i].args     - arguments passed to the function, if known
 *   s.stack[i].line     - line number, if known
 *   s.stack[i].column   - column number, if known
 *
 * Supports:
 *   - Firefox:  full stack trace with line numbers and unreliable column
 *               number on top frame
 *   - Opera 10: full stack trace with line and column numbers
 *   - Opera 9-: full stack trace with line numbers
 *   - Chrome:   full stack trace with line and column numbers
 *   - Safari:   line and column number for the topmost stacktrace element
 *               only
 *   - IE:       no line numbers whatsoever
 *
 * Tries to guess names of anonymous functions by looking for assignments
 * in the source code. In IE and Safari, we have to guess source file names
 * by searching for function bodies inside all page scripts. This will not
 * work for scripts that are loaded cross-domain.
 * Here be dragons: some function names may be guessed incorrectly, and
 * duplicate functions may be mismatched.
 *
 * TraceKit.computeStackTrace should only be used for tracing purposes.
 * Logging of unhandled exceptions should be done with TraceKit.report,
 * which builds on top of TraceKit.computeStackTrace and provides better
 * IE support by utilizing the window.onerror event to retrieve information
 * about the top of the stack.
 *
 * Note: In IE and Safari, no stack trace is recorded on the Error object,
 * so computeStackTrace instead walks its *own* chain of callers.
 * This means that:
 *  * in Safari, some methods may be missing from the stack trace;
 *  * in IE, the topmost function in the stack trace will always be the
 *    caller of computeStackTrace.
 *
 * This is okay for tracing (because you are likely to be calling
 * computeStackTrace from the function you want to be the topmost element
 * of the stack trace anyway), but not okay for logging unhandled
 * exceptions (because your catch block will likely be far away from the
 * inner function that actually caused the exception).
 *
 */
TraceKit.computeStackTrace = function computeStackTraceWrapper() {
  // Contents of Exception in various browsers.
  //
  // SAFARI:
  // ex.message = Can't find variable: qq
  // ex.line = 59
  // ex.sourceId = 580238192
  // ex.sourceURL = http://...
  // ex.expressionBeginOffset = 96
  // ex.expressionCaretOffset = 98
  // ex.expressionEndOffset = 98
  // ex.name = ReferenceError
  //
  // FIREFOX:
  // ex.message = qq is not defined
  // ex.fileName = http://...
  // ex.lineNumber = 59
  // ex.columnNumber = 69
  // ex.stack = ...stack trace... (see the example below)
  // ex.name = ReferenceError
  //
  // CHROME:
  // ex.message = qq is not defined
  // ex.name = ReferenceError
  // ex.type = not_defined
  // ex.arguments = ['aa']
  // ex.stack = ...stack trace...
  //
  // INTERNET EXPLORER:
  // ex.message = ...
  // ex.name = ReferenceError
  //
  // OPERA:
  // ex.message = ...message... (see the example below)
  // ex.name = ReferenceError
  // ex.opera#sourceloc = 11  (pretty much useless, duplicates the info in ex.message)
  // ex.stacktrace = n/a; see 'opera:config#UserPrefs|Exceptions Have Stacktrace'

  /**
     * Computes stack trace information from the stack property.
     * Chrome and Gecko use this property.
     * @param {Error} ex
     * @return {?Object.<string, *>} Stack trace information.
     */
  function computeStackTraceFromStackProp(ex) {
    if (typeof ex.stack === 'undefined' || !ex.stack) return;

    var chrome = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[a-z]:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
        gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i,
        winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i,

    // Used to additionally parse URL/line/column from eval frames
    geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
        chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/,
        lines = ex.stack.split('\n'),
        stack = [],
        submatch,
        parts,
        element,
        reference = /^(.*) is undefined$/.exec(ex.message);

    for (var i = 0, j = lines.length; i < j; ++i) {
      if (parts = chrome.exec(lines[i])) {
        var isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
        var isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
        if (isEval && (submatch = chromeEval.exec(parts[2]))) {
          // throw out eval line/column and use top-most line/column number
          parts[2] = submatch[1]; // url
          parts[3] = submatch[2]; // line
          parts[4] = submatch[3]; // column
        }
        element = {
          url: !isNative ? parts[2] : null,
          func: parts[1] || UNKNOWN_FUNCTION,
          args: isNative ? [parts[2]] : [],
          line: parts[3] ? +parts[3] : null,
          column: parts[4] ? +parts[4] : null
        };
      } else if (parts = winjs.exec(lines[i])) {
        element = {
          url: parts[2],
          func: parts[1] || UNKNOWN_FUNCTION,
          args: [],
          line: +parts[3],
          column: parts[4] ? +parts[4] : null
        };
      } else if (parts = gecko.exec(lines[i])) {
        var isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
        if (isEval && (submatch = geckoEval.exec(parts[3]))) {
          // throw out eval line/column and use top-most line number
          parts[3] = submatch[1];
          parts[4] = submatch[2];
          parts[5] = null; // no column when eval
        } else if (i === 0 && !parts[5] && typeof ex.columnNumber !== 'undefined') {
          // FireFox uses this awesome columnNumber property for its top frame
          // Also note, Firefox's column number is 0-based and everything else expects 1-based,
          // so adding 1
          // NOTE: this hack doesn't work if top-most frame is eval
          stack[0].column = ex.columnNumber + 1;
        }
        element = {
          url: parts[3],
          func: parts[1] || UNKNOWN_FUNCTION,
          args: parts[2] ? parts[2].split(',') : [],
          line: parts[4] ? +parts[4] : null,
          column: parts[5] ? +parts[5] : null
        };
      } else {
        continue;
      }

      if (!element.func && element.line) {
        element.func = UNKNOWN_FUNCTION;
      }

      stack.push(element);
    }

    if (!stack.length) {
      return null;
    }

    return {
      name: ex.name,
      message: ex.message,
      url: getLocationHref(),
      stack: stack
    };
  }

  /**
     * Adds information about the first frame to incomplete stack traces.
     * Safari and IE require this to get complete data on the first frame.
     * @param {Object.<string, *>} stackInfo Stack trace information from
     * one of the compute* methods.
     * @param {string} url The URL of the script that caused an error.
     * @param {(number|string)} lineNo The line number of the script that
     * caused an error.
     * @param {string=} message The error generated by the browser, which
     * hopefully contains the name of the object that caused the error.
     * @return {boolean} Whether or not the stack information was
     * augmented.
     */
  function augmentStackTraceWithInitialElement(stackInfo, url, lineNo, message) {
    var initial = {
      url: url,
      line: lineNo
    };

    if (initial.url && initial.line) {
      stackInfo.incomplete = false;

      if (!initial.func) {
        initial.func = UNKNOWN_FUNCTION;
      }

      if (stackInfo.stack.length > 0) {
        if (stackInfo.stack[0].url === initial.url) {
          if (stackInfo.stack[0].line === initial.line) {
            return false; // already in stack trace
          } else if (!stackInfo.stack[0].line && stackInfo.stack[0].func === initial.func) {
            stackInfo.stack[0].line = initial.line;
            return false;
          }
        }
      }

      stackInfo.stack.unshift(initial);
      stackInfo.partial = true;
      return true;
    } else {
      stackInfo.incomplete = true;
    }

    return false;
  }

  /**
     * Computes stack trace information by walking the arguments.caller
     * chain at the time the exception occurred. This will cause earlier
     * frames to be missed but is the only way to get any stack trace in
     * Safari and IE. The top frame is restored by
     * {@link augmentStackTraceWithInitialElement}.
     * @param {Error} ex
     * @return {?Object.<string, *>} Stack trace information.
     */
  function computeStackTraceByWalkingCallerChain(ex, depth) {
    var functionName = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i,
        stack = [],
        funcs = {},
        recursion = false,
        parts,
        item,
        source;

    for (var curr = computeStackTraceByWalkingCallerChain.caller; curr && !recursion; curr = curr.caller) {
      if (curr === computeStackTrace || curr === TraceKit.report) {
        // console.log('skipping internal function');
        continue;
      }

      item = {
        url: null,
        func: UNKNOWN_FUNCTION,
        line: null,
        column: null
      };

      if (curr.name) {
        item.func = curr.name;
      } else if (parts = functionName.exec(curr.toString())) {
        item.func = parts[1];
      }

      if (typeof item.func === 'undefined') {
        try {
          item.func = parts.input.substring(0, parts.input.indexOf('{'));
        } catch (e) {}
      }

      if (funcs['' + curr]) {
        recursion = true;
      } else {
        funcs['' + curr] = true;
      }

      stack.push(item);
    }

    if (depth) {
      // console.log('depth is ' + depth);
      // console.log('stack is ' + stack.length);
      stack.splice(0, depth);
    }

    var result = {
      name: ex.name,
      message: ex.message,
      url: getLocationHref(),
      stack: stack
    };
    augmentStackTraceWithInitialElement(result, ex.sourceURL || ex.fileName, ex.line || ex.lineNumber, ex.message || ex.description);
    return result;
  }

  /**
     * Computes a stack trace for an exception.
     * @param {Error} ex
     * @param {(string|number)=} depth
     */
  function computeStackTrace(ex, depth) {
    var stack = null;
    depth = depth == null ? 0 : +depth;

    try {
      stack = computeStackTraceFromStackProp(ex);
      if (stack) {
        return stack;
      }
    } catch (e) {
      if (TraceKit.debug) {
        throw e;
      }
    }

    try {
      stack = computeStackTraceByWalkingCallerChain(ex, depth + 1);
      if (stack) {
        return stack;
      }
    } catch (e) {
      if (TraceKit.debug) {
        throw e;
      }
    }
    return {
      name: ex.name,
      message: ex.message,
      url: getLocationHref()
    };
  }

  computeStackTrace.augmentStackTraceWithInitialElement = augmentStackTraceWithInitialElement;
  computeStackTrace.computeStackTraceFromStackProp = computeStackTraceFromStackProp;

  return computeStackTrace;
}();

module.exports = TraceKit;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../src/utils":11}],13:[function(require,module,exports){
'use strict';

/*
 json-stringify-safe
 Like JSON.stringify, but doesn't throw on circular references.

 Originally forked from https://github.com/isaacs/json-stringify-safe
 version 5.0.1 on 3/8/2017 and modified to handle Errors serialization
 and IE8 compatibility. Tests for this are in test/vendor.

 ISC license: https://github.com/isaacs/json-stringify-safe/blob/master/LICENSE
*/

exports = module.exports = stringify;
exports.getSerialize = serializer;

function indexOf(haystack, needle) {
  for (var i = 0; i < haystack.length; ++i) {
    if (haystack[i] === needle) return i;
  }
  return -1;
}

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces);
}

// https://github.com/ftlabs/js-abbreviate/blob/fa709e5f139e7770a71827b1893f22418097fbda/index.js#L95-L106
function stringifyError(value) {
  var err = {
    // These properties are implemented as magical getters and don't show up in for in
    stack: value.stack,
    message: value.message,
    name: value.name
  };

  for (var i in value) {
    if (Object.prototype.hasOwnProperty.call(value, i)) {
      err[i] = value[i];
    }
  }

  return err;
}

function serializer(replacer, cycleReplacer) {
  var stack = [];
  var keys = [];

  if (cycleReplacer == null) {
    cycleReplacer = function cycleReplacer(key, value) {
      if (stack[0] === value) {
        return '[Circular ~]';
      }
      return '[Circular ~.' + keys.slice(0, indexOf(stack, value)).join('.') + ']';
    };
  }

  return function (key, value) {
    if (stack.length > 0) {
      var thisPos = indexOf(stack, this);
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);

      if (~indexOf(stack, value)) {
        value = cycleReplacer.call(this, key, value);
      }
    } else {
      stack.push(value);
    }

    return replacer == null ? value instanceof Error ? stringifyError(value) : value : replacer.call(this, key, value);
  };
}

},{}],14:[function(require,module,exports){
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

'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,


// Special case for a simple path URL
simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,


// RFC 2396: characters reserved for delimiting URLs.
// We actually just auto-escape these.
delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],


// RFC 2396: characters not allowed for various reasons.
unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),


// Allowed by RFCs, but cause of XSS attacks.  Always escape these.
autoEscape = ['\''].concat(unwise),

// Characters that are never ever allowed in a hostname.
// Note that any invalid chars are also handled, but these
// are the ones that are *expected* to be seen, so we fast-path
// them.
nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,

// protocols that can allow "unsafe" and "unwise" chars.
unsafeProtocol = {
  'javascript': true,
  'javascript:': true
},

// protocols that never have a hostname.
hostlessProtocol = {
  'javascript': true,
  'javascript:': true
},

// protocols that always contain a // bit.
slashedProtocol = {
  'http': true,
  'https': true,
  'ftp': true,
  'gopher': true,
  'file': true,
  'http:': true,
  'https:': true,
  'ftp:': true,
  'gopher:': true,
  'file:': true
},
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url();
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function (url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + (typeof url === 'undefined' ? 'undefined' : _typeof(url)));
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter = queryIndex !== -1 && queryIndex < url.indexOf('#') ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1) hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1) continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }

  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function () {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query && util.isObject(this.query) && Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || query && '?' + query || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function (match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function (relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function (relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol') result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift())) {}
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = result.pathname && result.pathname.charAt(0) === '/',
      isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === '/',
      mustEndAbs = isRelAbs || isSourceAbs || result.host && relative.pathname,
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = relative.host || relative.host === '' ? relative.host : result.host;
    result.hostname = relative.hostname || relative.hostname === '' ? relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (result.host || relative.host || srcPath.length > 1) && (last === '.' || last === '..') || last === '';

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && srcPath.join('/').substr(-1) !== '/') {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' || srcPath[0] && srcPath[0].charAt(0) === '/';

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || result.host && srcPath.length;

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function () {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":15,"punycode":3,"querystring":6}],15:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = {
  isString: function isString(arg) {
    return typeof arg === 'string';
  },
  isObject: function isObject(arg) {
    return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && arg !== null;
  },
  isNull: function isNull(arg) {
    return arg === null;
  },
  isNullOrUndefined: function isNullOrUndefined(arg) {
    return arg == null;
  }
};

},{}],16:[function(require,module,exports){
'use strict';

var v1 = require('./v1');
var v4 = require('./v4');

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;

},{"./v1":19,"./v4":20}],17:[function(require,module,exports){
'use strict';

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
}

module.exports = bytesToUuid;

},{}],18:[function(require,module,exports){
(function (global){
"use strict";

// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection
var rng;

var crypto = global.crypto || global.msCrypto; // for IE 11
if (crypto && crypto.getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef
  rng = function whatwgRNG() {
    crypto.getRandomValues(rnds8);
    return rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);
  rng = function rng() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

module.exports = rng;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],19:[function(require,module,exports){
'use strict';

var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

// random #'s we need to init node and clockseq
var _seedBytes = rng();

// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
var _nodeId = [_seedBytes[0] | 0x01, _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]];

// Per 4.2.2, randomize (14 bit) clockseq
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

// Previous uuid creation time
var _lastMSecs = 0,
    _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};

  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;

},{"./lib/bytesToUuid":17,"./lib/rng":18}],20:[function(require,module,exports){
'use strict';

var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof options == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":17,"./lib/rng":18}],21:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var __read = undefined && undefined.__read || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
        r,
        ar = [],
        e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
            ar.push(r.value);
        }
    } catch (error) {
        e = { error: error };
    } finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
            if (e) throw e.error;
        }
    }
    return ar;
};
var __spread = undefined && undefined.__spread || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) {
        ar = ar.concat(__read(arguments[i]));
    }return ar;
};
var __values = undefined && undefined.__values || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator],
        i = 0;
    if (m) return m.call(o);
    return {
        next: function next() {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var shadowsocks_config_1 = require("ShadowsocksConfig/shadowsocks_config");
var errors = require("../model/errors");
var events = require("../model/events");
var settings_1 = require("./settings");
// If s is a URL whose fragment contains a Shadowsocks URL then return that Shadowsocks URL,
// otherwise return s.
function unwrapInvite(s) {
    try {
        var url = new URL(s);
        if (url.hash) {
            var decodedFragment = decodeURIComponent(url.hash);
            // Search in the fragment for ss:// for two reasons:
            //  - URL.hash includes the leading # (what).
            //  - When a user opens invite.html#ENCODEDSSURL in their browser, the website (currently)
            //    redirects to invite.html#/en/invite/ENCODEDSSURL. Since copying that redirected URL
            //    seems like a reasonable thing to do, let's support those URLs too.
            var possibleShadowsocksUrl = decodedFragment.substring(decodedFragment.indexOf('ss://'));
            if (new URL(possibleShadowsocksUrl).protocol === 'ss:') {
                return possibleShadowsocksUrl;
            }
        }
    } catch (e) {
        // Something wasn't a URL, or it couldn't be decoded - no problem, people put all kinds of
        // crazy things in the clipboard.
    }
    return s;
}
exports.unwrapInvite = unwrapInvite;
var App = /** @class */function () {
    function App(eventQueue, serverRepo, rootEl, debugMode, urlInterceptor, clipboard, errorReporter, settings, environmentVars, updater, quitApplication, document) {
        if (document === void 0) {
            document = window.document;
        }
        this.eventQueue = eventQueue;
        this.serverRepo = serverRepo;
        this.rootEl = rootEl;
        this.debugMode = debugMode;
        this.clipboard = clipboard;
        this.errorReporter = errorReporter;
        this.settings = settings;
        this.environmentVars = environmentVars;
        this.updater = updater;
        this.quitApplication = quitApplication;
        this.ignoredAccessKeys = {};
        this.serverListEl = rootEl.$.serversView.$.serverList;
        this.feedbackViewEl = rootEl.$.feedbackView;
        this.syncServersToUI();
        this.syncConnectivityStateToServerCards();
        rootEl.$.aboutView.version = environmentVars.APP_VERSION;
        this.localize = this.rootEl.localize.bind(this.rootEl);
        if (urlInterceptor) {
            this.registerUrlInterceptionListener(urlInterceptor);
        } else {
            console.warn('no urlInterceptor, ss:// urls will not be intercepted');
        }
        this.clipboard.setListener(this.handleClipboardText.bind(this));
        this.updater.setListener(this.updateDownloaded.bind(this));
        // Register Cordova mobile foreground event to sync server connectivity.
        document.addEventListener('resume', this.syncConnectivityStateToServerCards.bind(this));
        // Register handlers for events fired by Polymer components.
        this.rootEl.addEventListener('PromptAddServerRequested', this.requestPromptAddServer.bind(this));
        this.rootEl.addEventListener('AddServerConfirmationRequested', this.requestAddServerConfirmation.bind(this));
        this.rootEl.addEventListener('AddServerRequested', this.requestAddServer.bind(this));
        this.rootEl.addEventListener('IgnoreServerRequested', this.requestIgnoreServer.bind(this));
        this.rootEl.addEventListener('ConnectPressed', this.connectServer.bind(this));
        this.rootEl.addEventListener('DisconnectPressed', this.disconnectServer.bind(this));
        this.rootEl.addEventListener('ForgetPressed', this.forgetServer.bind(this));
        this.rootEl.addEventListener('RenameRequested', this.renameServer.bind(this));
        this.rootEl.addEventListener('QuitPressed', this.quitApplication.bind(this));
        this.rootEl.addEventListener('AutoConnectDialogDismissed', this.autoConnectDialogDismissed.bind(this));
        this.rootEl.addEventListener('ShowServerRename', this.rootEl.showServerRename.bind(this.rootEl));
        this.feedbackViewEl.$.submitButton.addEventListener('tap', this.submitFeedback.bind(this));
        this.rootEl.addEventListener('PrivacyTermsAcked', this.ackPrivacyTerms.bind(this));
        // Register handlers for events published to our event queue.
        this.eventQueue.subscribe(events.ServerAdded, this.showServerAdded.bind(this));
        this.eventQueue.subscribe(events.ServerForgotten, this.showServerForgotten.bind(this));
        this.eventQueue.subscribe(events.ServerRenamed, this.showServerRenamed.bind(this));
        this.eventQueue.subscribe(events.ServerForgetUndone, this.showServerForgetUndone.bind(this));
        this.eventQueue.subscribe(events.ServerConnected, this.showServerConnected.bind(this));
        this.eventQueue.subscribe(events.ServerDisconnected, this.showServerDisconnected.bind(this));
        this.eventQueue.subscribe(events.ServerReconnecting, this.showServerReconnecting.bind(this));
        this.eventQueue.startPublishing();
        if (!this.arePrivacyTermsAcked()) {
            this.displayPrivacyView();
        }
        this.displayZeroStateUi();
        this.pullClipboardText();
    }
    App.prototype.showLocalizedError = function (e, toastDuration) {
        var _this = this;
        if (toastDuration === void 0) {
            toastDuration = 10000;
        }
        var messageKey;
        var messageParams;
        var buttonKey;
        var buttonHandler;
        var buttonLink;
        if (e instanceof errors.VpnPermissionNotGranted) {
            messageKey = 'outline-plugin-error-vpn-permission-not-granted';
        } else if (e instanceof errors.InvalidServerCredentials) {
            messageKey = 'outline-plugin-error-invalid-server-credentials';
        } else if (e instanceof errors.RemoteUdpForwardingDisabled) {
            messageKey = 'outline-plugin-error-udp-forwarding-not-enabled';
        } else if (e instanceof errors.ServerUnreachable) {
            messageKey = 'outline-plugin-error-server-unreachable';
        } else if (e instanceof errors.FeedbackSubmissionError) {
            messageKey = 'error-feedback-submission';
        } else if (e instanceof errors.ServerUrlInvalid) {
            messageKey = 'error-invalid-access-key';
        } else if (e instanceof errors.ServerIncompatible) {
            messageKey = 'error-server-incompatible';
        } else if (e instanceof errors.OperationTimedOut) {
            messageKey = 'error-timeout';
        } else if (e instanceof errors.ShadowsocksStartFailure && this.isWindows()) {
            // Fall through to `error-unexpected` for other platforms.
            messageKey = 'outline-plugin-error-antivirus';
            buttonKey = 'fix-this';
            buttonLink = 'https://s3.amazonaws.com/outline-vpn/index.html#/en/support/antivirusBlock';
        } else if (e instanceof errors.ConfigureSystemProxyFailure) {
            messageKey = 'outline-plugin-error-routing-tables';
            buttonKey = 'feedback-page-title';
            buttonHandler = function buttonHandler() {
                // TODO: Drop-down has no selected item, why not?
                _this.rootEl.changePage('feedback');
            };
        } else if (e instanceof errors.NoAdminPermissions) {
            messageKey = 'outline-plugin-error-admin-permissions';
        } else if (e instanceof errors.UnsupportedRoutingTable) {
            messageKey = 'outline-plugin-error-unsupported-routing-table';
        } else if (e instanceof errors.ServerAlreadyAdded) {
            messageKey = 'error-server-already-added';
            messageParams = ['serverName', e.server.name];
        } else {
            messageKey = 'error-unexpected';
        }
        var message = messageParams ? this.localize.apply(this, __spread([messageKey], messageParams)) : this.localize(messageKey);
        // Defer by 500ms so that this toast is shown after any toasts that get shown when any
        // currently-in-flight domain events land (e.g. fake servers added).
        if (this.rootEl && this.rootEl.async) {
            this.rootEl.async(function () {
                _this.rootEl.showToast(message, toastDuration, buttonKey ? _this.localize(buttonKey) : undefined, buttonHandler, buttonLink);
            }, 500);
        }
    };
    App.prototype.pullClipboardText = function () {
        var _this = this;
        this.clipboard.getContents().then(function (text) {
            _this.handleClipboardText(text);
        }, function (e) {
            console.warn('cannot read clipboard, system may lack clipboard support');
        });
    };
    App.prototype.showServerConnected = function (event) {
        console.debug("server " + event.server.id + " connected");
        var card = this.serverListEl.getServerCard(event.server.id);
        card.state = 'CONNECTED';
    };
    App.prototype.showServerDisconnected = function (event) {
        console.debug("server " + event.server.id + " disconnected");
        try {
            this.serverListEl.getServerCard(event.server.id).state = 'DISCONNECTED';
        } catch (e) {
            console.warn('server card not found after disconnection event, assuming forgotten');
        }
    };
    App.prototype.showServerReconnecting = function (event) {
        console.debug("server " + event.server.id + " reconnecting");
        var card = this.serverListEl.getServerCard(event.server.id);
        card.state = 'RECONNECTING';
    };
    App.prototype.displayZeroStateUi = function () {
        if (this.rootEl.$.serversView.shouldShowZeroState) {
            this.rootEl.$.addServerView.openAddServerSheet();
        }
    };
    App.prototype.arePrivacyTermsAcked = function () {
        try {
            return this.settings.get(settings_1.SettingsKey.PRIVACY_ACK) === 'true';
        } catch (e) {
            console.error("could not read privacy acknowledgement setting, assuming not akcnowledged");
        }
        return false;
    };
    App.prototype.displayPrivacyView = function () {
        this.rootEl.$.serversView.hidden = true;
        this.rootEl.$.privacyView.hidden = false;
    };
    App.prototype.ackPrivacyTerms = function () {
        this.rootEl.$.serversView.hidden = false;
        this.rootEl.$.privacyView.hidden = true;
        this.settings.set(settings_1.SettingsKey.PRIVACY_ACK, 'true');
    };
    App.prototype.handleClipboardText = function (text) {
        // Shorten, sanitise.
        // Note that we always check the text, even if the contents are same as last time, because we
        // keep an in-memory cache of user-ignored access keys.
        text = text.substring(0, 1000).trim();
        try {
            this.confirmAddServer(text, true);
        } catch (err) {
            // Don't alert the user; high false positive rate.
        }
    };
    App.prototype.updateDownloaded = function () {
        this.rootEl.showToast(this.localize('update-downloaded'), 60000);
    };
    App.prototype.requestPromptAddServer = function () {
        this.rootEl.promptAddServer();
    };
    // Caches an ignored server access key so we don't prompt the user to add it again.
    App.prototype.requestIgnoreServer = function (event) {
        var accessKey = event.detail.accessKey;
        this.ignoredAccessKeys[accessKey] = true;
    };
    App.prototype.requestAddServer = function (event) {
        try {
            this.serverRepo.add(event.detail.serverConfig);
        } catch (err) {
            this.changeToDefaultPage();
            this.showLocalizedError(err);
        }
    };
    App.prototype.requestAddServerConfirmation = function (event) {
        var accessKey = event.detail.accessKey;
        console.debug('Got add server confirmation request from UI');
        try {
            this.confirmAddServer(accessKey);
        } catch (err) {
            console.error('Failed to confirm add sever.', err);
            var addServerView = this.rootEl.$.addServerView;
            addServerView.$.accessKeyInput.invalid = true;
        }
    };
    App.prototype.confirmAddServer = function (accessKey, fromClipboard) {
        if (fromClipboard === void 0) {
            fromClipboard = false;
        }
        var addServerView = this.rootEl.$.addServerView;
        accessKey = unwrapInvite(accessKey);
        if (fromClipboard && accessKey in this.ignoredAccessKeys) {
            return console.debug('Ignoring access key');
        } else if (fromClipboard && addServerView.isAddingServer()) {
            return console.debug('Already adding a server');
        }
        // Expect SHADOWSOCKS_URI.parse to throw on invalid access key; propagate any exception.
        var shadowsocksConfig = null;
        try {
            shadowsocksConfig = shadowsocks_config_1.SHADOWSOCKS_URI.parse(accessKey);
        } catch (error) {
            var message = !!error.message ? error.message : 'Failed to parse access key';
            throw new errors.ServerUrlInvalid(message);
        }
        if (shadowsocksConfig.host.isIPv6) {
            throw new errors.ServerIncompatible('Only IPv4 addresses are currently supported');
        }
        var name = shadowsocksConfig.extra.outline ? this.localize('server-default-name-outline') : shadowsocksConfig.tag.data ? shadowsocksConfig.tag.data : this.localize('server-default-name');
        var serverConfig = {
            host: shadowsocksConfig.host.data,
            port: shadowsocksConfig.port.data,
            method: shadowsocksConfig.method.data,
            password: shadowsocksConfig.password.data,
            name: name
        };
        if (!this.serverRepo.containsServer(serverConfig)) {
            // Only prompt the user to add new servers.
            try {
                addServerView.openAddServerConfirmationSheet(accessKey, serverConfig);
            } catch (err) {
                console.error('Failed to open add sever confirmation sheet:', err.message);
                if (!fromClipboard) this.showLocalizedError();
            }
        } else if (!fromClipboard) {
            // Display error message if this is not a clipboard add.
            addServerView.close();
            this.showLocalizedError(new errors.ServerAlreadyAdded(this.serverRepo.createServer('', serverConfig, this.eventQueue)));
        }
    };
    App.prototype.forgetServer = function (event) {
        var _this = this;
        var serverId = event.detail.serverId;
        var server = this.serverRepo.getById(serverId);
        if (!server) {
            console.error("No server with id " + serverId);
            return this.showLocalizedError();
        }
        var onceNotRunning = server.checkRunning().then(function (isRunning) {
            return isRunning ? _this.disconnectServer(event) : Promise.resolve();
        });
        onceNotRunning.then(function () {
            _this.serverRepo.forget(serverId);
        });
    };
    App.prototype.renameServer = function (event) {
        var serverId = event.detail.serverId;
        var newName = event.detail.newName;
        this.serverRepo.rename(serverId, newName);
    };
    App.prototype.connectServer = function (event) {
        var _this = this;
        var serverId = event.detail.serverId;
        if (!serverId) {
            throw new Error("connectServer event had no server ID");
        }
        var server = this.getServerByServerId(serverId);
        var card = this.getCardByServerId(serverId);
        console.log("connecting to server " + serverId);
        card.state = 'CONNECTING';
        server.connect().then(function () {
            card.state = 'CONNECTED';
            console.log("connected to server " + serverId);
            _this.rootEl.showToast(_this.localize('server-connected', 'serverName', server.name));
            _this.maybeShowAutoConnectDialog();
        }, function (e) {
            card.state = 'DISCONNECTED';
            _this.showLocalizedError(e);
            console.error("could not connect to server " + serverId + ": " + e.name);
            if (!(e instanceof errors.RegularNativeError)) {
                _this.errorReporter.report("connection failure: " + e.name, 'connection-failure');
            }
        });
    };
    App.prototype.maybeShowAutoConnectDialog = function () {
        var dismissed = false;
        try {
            dismissed = this.settings.get(settings_1.SettingsKey.AUTO_CONNECT_DIALOG_DISMISSED) === 'true';
        } catch (e) {
            console.error("Failed to read auto-connect dialog status, assuming not dismissed: " + e);
        }
        if (!dismissed) {
            this.rootEl.$.serversView.$.autoConnectDialog.show();
        }
    };
    App.prototype.autoConnectDialogDismissed = function () {
        this.settings.set(settings_1.SettingsKey.AUTO_CONNECT_DIALOG_DISMISSED, 'true');
    };
    App.prototype.disconnectServer = function (event) {
        var _this = this;
        var serverId = event.detail.serverId;
        if (!serverId) {
            throw new Error("disconnectServer event had no server ID");
        }
        var server = this.getServerByServerId(serverId);
        var card = this.getCardByServerId(serverId);
        console.log("disconnecting from server " + serverId);
        card.state = 'DISCONNECTING';
        server.disconnect().then(function () {
            card.state = 'DISCONNECTED';
            console.log("disconnected from server " + serverId);
            _this.rootEl.showToast(_this.localize('server-disconnected', 'serverName', server.name));
        }, function (e) {
            card.state = 'CONNECTED';
            _this.showLocalizedError(e);
            console.warn("could not disconnect from server " + serverId + ": " + e.name);
        });
    };
    App.prototype.submitFeedback = function (event) {
        var _this = this;
        var formData = this.feedbackViewEl.getValidatedFormData();
        if (!formData) {
            return;
        }
        var feedback = formData.feedback,
            category = formData.category,
            email = formData.email;
        this.rootEl.$.feedbackView.submitting = true;
        this.errorReporter.report(feedback, category, email).then(function () {
            _this.rootEl.$.feedbackView.submitting = false;
            _this.rootEl.$.feedbackView.resetForm();
            _this.changeToDefaultPage();
            _this.rootEl.showToast(_this.rootEl.localize('feedback-thanks'));
        }, function (err) {
            _this.rootEl.$.feedbackView.submitting = false;
            _this.showLocalizedError(new errors.FeedbackSubmissionError());
        });
    };
    // EventQueue event handlers:
    App.prototype.showServerAdded = function (event) {
        var server = event.server;
        console.debug('Server added');
        this.syncServersToUI();
        this.syncServerConnectivityState(server);
        this.changeToDefaultPage();
        this.rootEl.showToast(this.localize('server-added', 'serverName', server.name));
    };
    App.prototype.showServerForgotten = function (event) {
        var _this = this;
        var server = event.server;
        console.debug('Server forgotten');
        this.syncServersToUI();
        this.rootEl.showToast(this.localize('server-forgotten', 'serverName', server.name), 10000, this.localize('undo-button-label'), function () {
            _this.serverRepo.undoForget(server.id);
        });
    };
    App.prototype.showServerForgetUndone = function (event) {
        this.syncServersToUI();
        var server = event.server;
        this.rootEl.showToast(this.localize('server-forgotten-undo', 'serverName', server.name));
    };
    App.prototype.showServerRenamed = function (event) {
        var server = event.server;
        console.debug('Server renamed');
        this.serverListEl.getServerCard(server.id).serverName = server.name;
        this.rootEl.showToast(this.localize('server-rename-complete'));
    };
    // Helpers:
    App.prototype.syncServersToUI = function () {
        this.rootEl.servers = this.serverRepo.getAll();
    };
    App.prototype.syncConnectivityStateToServerCards = function () {
        try {
            for (var _a = __values(this.serverRepo.getAll()), _b = _a.next(); !_b.done; _b = _a.next()) {
                var server = _b.value;
                this.syncServerConnectivityState(server);
            }
        } catch (e_1_1) {
            e_1 = { error: e_1_1 };
        } finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            } finally {
                if (e_1) throw e_1.error;
            }
        }
        var e_1, _c;
    };
    App.prototype.syncServerConnectivityState = function (server) {
        var _this = this;
        server.checkRunning().then(function (isRunning) {
            var card = _this.serverListEl.getServerCard(server.id);
            if (!isRunning) {
                card.state = 'DISCONNECTED';
                return;
            }
            server.checkReachable().then(function (isReachable) {
                if (isReachable) {
                    card.state = 'CONNECTED';
                } else {
                    console.log("Server " + server.id + " reconnecting");
                    card.state = 'RECONNECTING';
                }
            });
        }).catch(function (e) {
            console.error('Failed to sync server connectivity state', e);
        });
    };
    App.prototype.registerUrlInterceptionListener = function (urlInterceptor) {
        var _this = this;
        urlInterceptor.registerListener(function (url) {
            if (!url || !unwrapInvite(url).startsWith('ss://')) {
                // This check is necessary to ignore empty and malformed install-referrer URLs in Android
                // while allowing ss:// and invite URLs.
                // TODO: Stop receiving install referrer intents so we can remove this.
                return console.debug("Ignoring intercepted non-shadowsocks url");
            }
            try {
                _this.confirmAddServer(url);
            } catch (err) {
                _this.showLocalizedErrorInDefaultPage(err);
            }
        });
    };
    App.prototype.changeToDefaultPage = function () {
        this.rootEl.changePage(this.rootEl.DEFAULT_PAGE);
    };
    // Returns the server having serverId, throws if the server cannot be found.
    App.prototype.getServerByServerId = function (serverId) {
        var server = this.serverRepo.getById(serverId);
        if (!server) {
            throw new Error("could not find server with ID " + serverId);
        }
        return server;
    };
    // Returns the card associated with serverId, throws if no such card exists.
    // See server-list.html.
    App.prototype.getCardByServerId = function (serverId) {
        return this.serverListEl.getServerCard(serverId);
    };
    App.prototype.showLocalizedErrorInDefaultPage = function (err) {
        this.changeToDefaultPage();
        this.showLocalizedError(err);
    };
    App.prototype.isWindows = function () {
        return !('cordova' in window);
    };
    return App;
}();
exports.App = App;

},{"../model/errors":33,"../model/events":34,"./settings":30,"ShadowsocksConfig/shadowsocks_config":1}],22:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

Object.defineProperty(exports, "__esModule", { value: true });
// Generic clipboard. Implementations should only have to implement getContents().
var AbstractClipboard = /** @class */function () {
    function AbstractClipboard() {}
    AbstractClipboard.prototype.getContents = function () {
        return Promise.reject(new Error('unimplemented skeleton method'));
    };
    AbstractClipboard.prototype.setListener = function (listener) {
        this.listener = listener;
    };
    AbstractClipboard.prototype.emitEvent = function () {
        if (this.listener) {
            this.getContents().then(this.listener);
        }
    };
    return AbstractClipboard;
}();
exports.AbstractClipboard = AbstractClipboard;

},{}],23:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var __extends = undefined && undefined.__extends || function () {
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
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path='../../types/ambient/outlinePlugin.d.ts'/>
/// <reference path='../../types/ambient/webintents.d.ts'/>
var Raven = require("raven-js");
var clipboard_1 = require("./clipboard");
var error_reporter_1 = require("./error_reporter");
var fake_connection_1 = require("./fake_connection");
var main_1 = require("./main");
var outline_server_1 = require("./outline_server");
var updater_1 = require("./updater");
var interceptors = require("./url_interceptor");
// Pushes a clipboard event whenever the app is brought to the foreground.
var CordovaClipboard = /** @class */function (_super) {
    __extends(CordovaClipboard, _super);
    function CordovaClipboard() {
        var _this = _super.call(this) || this;
        document.addEventListener('resume', _this.emitEvent.bind(_this));
        return _this;
    }
    CordovaClipboard.prototype.getContents = function () {
        return new Promise(function (resolve, reject) {
            cordova.plugins.clipboard.paste(resolve, reject);
        });
    };
    return CordovaClipboard;
}(clipboard_1.AbstractClipboard);
// Adds reports from the (native) Cordova plugin.
var CordovaErrorReporter = /** @class */function (_super) {
    __extends(CordovaErrorReporter, _super);
    function CordovaErrorReporter(appVersion, appBuildNumber, dsn, nativeDsn) {
        var _this = _super.call(this, appVersion, dsn, { 'build.number': appBuildNumber }) || this;
        cordova.plugins.outline.log.initialize(nativeDsn).catch(console.error);
        return _this;
    }
    CordovaErrorReporter.prototype.report = function (userFeedback, feedbackCategory, userEmail) {
        return _super.prototype.report.call(this, userFeedback, feedbackCategory, userEmail).then(function () {
            return cordova.plugins.outline.log.send(Raven.lastEventId());
        });
    };
    return CordovaErrorReporter;
}(error_reporter_1.SentryErrorReporter);
exports.CordovaErrorReporter = CordovaErrorReporter;
// This class should only be instantiated after Cordova fires the deviceready event.
var CordovaPlatform = /** @class */function () {
    function CordovaPlatform() {}
    CordovaPlatform.isBrowser = function () {
        return device.platform === 'browser';
    };
    CordovaPlatform.prototype.hasDeviceSupport = function () {
        return !CordovaPlatform.isBrowser();
    };
    CordovaPlatform.prototype.getPersistentServerFactory = function () {
        var _this = this;
        return function (serverId, config, eventQueue) {
            return new outline_server_1.OutlineServer(serverId, config, _this.hasDeviceSupport() ? new cordova.plugins.outline.Connection(config, serverId) : new fake_connection_1.FakeOutlineConnection(config, serverId), eventQueue);
        };
    };
    CordovaPlatform.prototype.getUrlInterceptor = function () {
        if (device.platform === 'iOS' || device.platform === 'Mac OS X') {
            return new interceptors.AppleUrlInterceptor(appleLaunchUrl);
        } else if (device.platform === 'Android') {
            return new interceptors.AndroidUrlInterceptor();
        }
        console.warn('no intent interceptor available');
        return new interceptors.UrlInterceptor();
    };
    CordovaPlatform.prototype.getClipboard = function () {
        return new CordovaClipboard();
    };
    CordovaPlatform.prototype.getErrorReporter = function (env) {
        return this.hasDeviceSupport() ? new CordovaErrorReporter(env.APP_VERSION, env.APP_BUILD_NUMBER, env.SENTRY_DSN, env.SENTRY_NATIVE_DSN) : new error_reporter_1.SentryErrorReporter(env.APP_VERSION, env.SENTRY_DSN, {});
    };
    CordovaPlatform.prototype.getUpdater = function () {
        return new updater_1.AbstractUpdater();
    };
    CordovaPlatform.prototype.quitApplication = function () {
        // Only used in macOS because menu bar apps provide no alternative way of quitting.
        cordova.plugins.outline.quitApplication();
    };
    return CordovaPlatform;
}();
// https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
var onceDeviceReady = new Promise(function (resolve) {
    document.addEventListener('deviceready', resolve);
});
// cordova-[ios|osx] call a global function with this signature when a URL is
// intercepted. We handle URL interceptions with an intent interceptor; however,
// when the app is launched via URL our start up sequence misses the call due to
// a race. Define the function temporarily here, and set a global variable.
var appleLaunchUrl;
window.handleOpenURL = function (url) {
    appleLaunchUrl = url;
};
onceDeviceReady.then(function () {
    main_1.main(new CordovaPlatform());
});

},{"./clipboard":22,"./error_reporter":25,"./fake_connection":26,"./main":27,"./outline_server":28,"./updater":31,"./url_interceptor":32,"raven-js":10}],24:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

Object.defineProperty(exports, "__esModule", { value: true });
// Keep these in sync with the EnvironmentVariables interface above.
var ENV_KEYS = {
    APP_VERSION: 'APP_VERSION',
    APP_BUILD_NUMBER: 'APP_BUILD_NUMBER',
    SENTRY_DSN: 'SENTRY_DSN',
    SENTRY_NATIVE_DSN: 'SENTRY_NATIVE_DSN'
};
function validateEnvVars(json) {
    for (var key in ENV_KEYS) {
        if (!json.hasOwnProperty(key)) {
            throw new Error("Missing environment variable: " + key);
        }
    }
}
// According to http://caniuse.com/#feat=fetch fetch didn't hit iOS Safari
// until v10.3 released 3/26/17, so use XMLHttpRequest instead.
exports.onceEnvVars = new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        try {
            var json = JSON.parse(xhr.responseText);
            validateEnvVars(json);
            console.debug('Resolving with envVars:', json);
            resolve(json);
        } catch (err) {
            reject(err);
        }
    };
    xhr.open('GET', 'environment.json', true);
    xhr.send();
});

},{}],25:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

Object.defineProperty(exports, "__esModule", { value: true });
var Raven = require("raven-js");
var SentryErrorReporter = /** @class */function () {
    function SentryErrorReporter(appVersion, dsn, tags) {
        Raven.config(dsn, { release: appVersion, 'tags': tags }).install();
        this.setUpUnhandledRejectionListener();
    }
    SentryErrorReporter.prototype.report = function (userFeedback, feedbackCategory, userEmail) {
        Raven.setUserContext({ email: userEmail || '' });
        Raven.captureMessage(userFeedback, { tags: { category: feedbackCategory } });
        Raven.setUserContext(); // Reset the user context, don't cache the email
        return Promise.resolve();
    };
    SentryErrorReporter.prototype.setUpUnhandledRejectionListener = function () {
        // Chrome is the only browser that supports the unhandledrejection event.
        // This is fine for Android, but will not work in iOS.
        var unhandledRejection = 'unhandledrejection';
        window.addEventListener(unhandledRejection, function (event) {
            var reason = event.reason;
            var msg = reason.stack ? reason.stack : reason;
            Raven.captureBreadcrumb({ message: msg, category: unhandledRejection });
        });
    };
    return SentryErrorReporter;
}();
exports.SentryErrorReporter = SentryErrorReporter;

},{"raven-js":10}],26:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path='../../types/ambient/outlinePlugin.d.ts'/>
var errors = require("../model/errors");
// Note that because this implementation does not emit disconnection events, "switching" between
// servers in the server list will not work as expected.
var FakeOutlineConnection = /** @class */function () {
    function FakeOutlineConnection(config, id) {
        this.config = config;
        this.id = id;
        this.running = false;
    }
    FakeOutlineConnection.prototype.playBroken = function () {
        return this.config.name && this.config.name.toLowerCase().includes('broken');
    };
    FakeOutlineConnection.prototype.playUnreachable = function () {
        return !(this.config.name && this.config.name.toLowerCase().includes('unreachable'));
    };
    FakeOutlineConnection.prototype.start = function () {
        if (this.running) {
            return Promise.resolve();
        }
        if (!this.playUnreachable()) {
            return Promise.reject(new errors.OutlinePluginError(5 /* SERVER_UNREACHABLE */));
        } else if (this.playBroken()) {
            return Promise.reject(new errors.OutlinePluginError(8 /* SHADOWSOCKS_START_FAILURE */));
        } else {
            this.running = true;
            return Promise.resolve();
        }
    };
    FakeOutlineConnection.prototype.stop = function () {
        if (!this.running) {
            return Promise.resolve();
        }
        this.running = false;
        return Promise.resolve();
    };
    FakeOutlineConnection.prototype.isRunning = function () {
        return Promise.resolve(this.running);
    };
    FakeOutlineConnection.prototype.isReachable = function () {
        return Promise.resolve(!this.playUnreachable());
    };
    FakeOutlineConnection.prototype.onStatusChange = function (listener) {
        // NOOP
    };
    return FakeOutlineConnection;
}();
exports.FakeOutlineConnection = FakeOutlineConnection;

},{"../model/errors":33}],27:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var __read = undefined && undefined.__read || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
        r,
        ar = [],
        e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
            ar.push(r.value);
        }
    } catch (error) {
        e = { error: error };
    } finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
            if (e) throw e.error;
        }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("url");
var events_1 = require("../model/events");
var app_1 = require("./app");
var environment_1 = require("./environment");
var persistent_server_1 = require("./persistent_server");
var settings_1 = require("./settings");
// Used to determine whether to use Polymer functionality on app initialization failure.
var webComponentsAreReady = false;
document.addEventListener('WebComponentsReady', function () {
    console.debug('received WebComponentsReady event');
    webComponentsAreReady = true;
});
// Used to delay loading the app until (translation) resources have been loaded. This can happen a
// little later than WebComponentsReady.
var oncePolymerIsReady = new Promise(function (resolve) {
    document.addEventListener('app-localize-resources-loaded', function () {
        console.debug('received app-localize-resources-loaded event');
        resolve();
    });
});
// Helpers
// Do not call until WebComponentsReady has fired!
function getRootEl() {
    return document.querySelector('app-root');
}
function createServerRepo(eventQueue, storage, deviceSupport, connectionType) {
    var repo = new persistent_server_1.PersistentServerRepository(connectionType, eventQueue, storage);
    if (!deviceSupport) {
        console.debug('Detected development environment, using fake servers.');
        if (repo.getAll().length === 0) {
            repo.add({ name: 'Fake Working Server', host: '127.0.0.1' });
            repo.add({ name: 'Fake Broken Server', host: '192.0.2.1' });
            repo.add({ name: 'Fake Unreachable Server', host: '10.0.0.24' });
        }
    }
    return repo;
}
function main(platform) {
    return Promise.all([environment_1.onceEnvVars, oncePolymerIsReady]).then(function (_a) {
        var _b = __read(_a, 1),
            environmentVars = _b[0];
        console.debug('running main() function');
        var queryParams = url.parse(document.URL, true).query;
        var debugMode = queryParams.debug === 'true';
        var eventQueue = new events_1.EventQueue();
        var serverRepo = createServerRepo(eventQueue, window.localStorage, platform.hasDeviceSupport(), platform.getPersistentServerFactory());
        var settings = new settings_1.Settings();
        var app = new app_1.App(eventQueue, serverRepo, getRootEl(), debugMode, platform.getUrlInterceptor(), platform.getClipboard(), platform.getErrorReporter(environmentVars), settings, environmentVars, platform.getUpdater(), platform.quitApplication);
    }, function (e) {
        onUnexpectedError(e);
        throw e;
    });
}
exports.main = main;
function onUnexpectedError(error) {
    var rootEl = getRootEl();
    if (webComponentsAreReady && rootEl && rootEl.localize) {
        var localize = rootEl.localize.bind(rootEl);
        rootEl.showToast(localize('error-unexpected'), 120000);
    } else {
        // Something went terribly wrong (i.e. Polymer failed to initialize). Provide some messaging to
        // the user, even if we are not able to display it in a toast or localize it.
        // TODO: provide an help email once we have a domain.
        alert("An unexpected error occurred.");
    }
    console.error(error);
}
// Returns Polymer's localization function. Must be called after WebComponentsReady has fired.
function getLocalizationFunction() {
    var rootEl = getRootEl();
    if (!rootEl) {
        return null;
    }
    return rootEl.localize;
}
exports.getLocalizationFunction = getLocalizationFunction;

},{"../model/events":34,"./app":21,"./environment":24,"./persistent_server":29,"./settings":30,"url":14}],28:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path='../../types/ambient/outlinePlugin.d.ts'/>
var errors = require("../model/errors");
var events = require("../model/events");
var OutlineServer = /** @class */function () {
    function OutlineServer(id, config, connection, eventQueue) {
        var _this = this;
        this.id = id;
        this.config = config;
        this.connection = connection;
        this.eventQueue = eventQueue;
        this.connection.onStatusChange(function (status) {
            var statusEvent;
            switch (status) {
                case 0 /* CONNECTED */:
                    statusEvent = new events.ServerConnected(_this);
                    break;
                case 1 /* DISCONNECTED */:
                    statusEvent = new events.ServerDisconnected(_this);
                    break;
                case 2 /* RECONNECTING */:
                    statusEvent = new events.ServerReconnecting(_this);
                    break;
                default:
                    console.warn("Received unknown connection status " + status);
                    return;
            }
            eventQueue.enqueue(statusEvent);
        });
    }
    Object.defineProperty(OutlineServer.prototype, "name", {
        get: function get() {
            return this.config.name || this.config.host || '';
        },
        set: function set(newName) {
            this.config.name = newName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OutlineServer.prototype, "host", {
        get: function get() {
            return this.config.host;
        },
        enumerable: true,
        configurable: true
    });
    OutlineServer.prototype.connect = function () {
        return this.connection.start().catch(function (e) {
            // Since "instanceof OutlinePluginError" may not work for errors originating from Sentry,
            // inspect this field directly.
            if (e.errorCode) {
                throw errors.fromErrorCode(e.errorCode);
            } else {
                throw new Error("native code did not set errorCode");
            }
        });
    };
    OutlineServer.prototype.disconnect = function () {
        return this.connection.stop().catch(function (e) {
            // TODO: None of the plugins currently return an ErrorCode on disconnection.
            throw new errors.RegularNativeError();
        });
    };
    OutlineServer.prototype.checkRunning = function () {
        return this.connection.isRunning();
    };
    OutlineServer.prototype.checkReachable = function () {
        return this.connection.isReachable();
    };
    return OutlineServer;
}();
exports.OutlineServer = OutlineServer;

},{"../model/errors":33,"../model/events":34}],29:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var __values = undefined && undefined.__values || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator],
        i = 0;
    if (m) return m.call(o);
    return {
        next: function next() {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var errors_1 = require("../model/errors");
var events = require("../model/events");
// Maintains a persisted set of servers and liaises with the core.
var PersistentServerRepository = /** @class */function () {
    function PersistentServerRepository(createServer, eventQueue, storage) {
        this.createServer = createServer;
        this.eventQueue = eventQueue;
        this.storage = storage;
        this.loadServers();
    }
    PersistentServerRepository.prototype.getAll = function () {
        return Array.from(this.serverById.values());
    };
    PersistentServerRepository.prototype.getById = function (serverId) {
        return this.serverById.get(serverId);
    };
    PersistentServerRepository.prototype.add = function (serverConfig) {
        var alreadyAddedServer = this.serverFromConfig(serverConfig);
        if (alreadyAddedServer) {
            throw new errors_1.ServerAlreadyAdded(alreadyAddedServer);
        }
        var server = this.createServer(uuid_1.v4(), serverConfig, this.eventQueue);
        this.serverById.set(server.id, server);
        this.storeServers();
        this.eventQueue.enqueue(new events.ServerAdded(server));
    };
    PersistentServerRepository.prototype.rename = function (serverId, newName) {
        var server = this.serverById.get(serverId);
        if (!server) {
            console.warn("Cannot rename nonexistent server " + serverId);
            return;
        }
        server.name = newName;
        this.storeServers();
        this.eventQueue.enqueue(new events.ServerRenamed(server));
    };
    PersistentServerRepository.prototype.forget = function (serverId) {
        var server = this.serverById.get(serverId);
        if (!server) {
            console.warn("Cannot remove nonexistent server " + serverId);
            return;
        }
        this.serverById.delete(serverId);
        this.lastForgottenServer = server;
        this.storeServers();
        this.eventQueue.enqueue(new events.ServerForgotten(server));
    };
    PersistentServerRepository.prototype.undoForget = function (serverId) {
        if (!this.lastForgottenServer) {
            console.warn('No forgotten server to unforget');
            return;
        } else if (this.lastForgottenServer.id !== serverId) {
            console.warn('id of forgotten server', this.lastForgottenServer, 'does not match', serverId);
            return;
        }
        this.serverById.set(this.lastForgottenServer.id, this.lastForgottenServer);
        this.storeServers();
        this.eventQueue.enqueue(new events.ServerForgetUndone(this.lastForgottenServer));
        this.lastForgottenServer = null;
    };
    PersistentServerRepository.prototype.containsServer = function (config) {
        return !!this.serverFromConfig(config);
    };
    PersistentServerRepository.prototype.serverFromConfig = function (config) {
        try {
            for (var _a = __values(this.getAll()), _b = _a.next(); !_b.done; _b = _a.next()) {
                var server = _b.value;
                if (configsMatch(server.config, config)) {
                    return server;
                }
            }
        } catch (e_1_1) {
            e_1 = { error: e_1_1 };
        } finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            } finally {
                if (e_1) throw e_1.error;
            }
        }
        var e_1, _c;
    };
    PersistentServerRepository.prototype.storeServers = function () {
        var configById = {};
        try {
            for (var _a = __values(this.serverById.values()), _b = _a.next(); !_b.done; _b = _a.next()) {
                var server = _b.value;
                configById[server.id] = server.config;
            }
        } catch (e_2_1) {
            e_2 = { error: e_2_1 };
        } finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            } finally {
                if (e_2) throw e_2.error;
            }
        }
        var json = JSON.stringify(configById);
        this.storage.setItem(PersistentServerRepository.SERVERS_STORAGE_KEY, json);
        var e_2, _c;
    };
    // Loads servers from storage,
    // raising an error if there is any problem loading.
    PersistentServerRepository.prototype.loadServers = function () {
        this.serverById = new Map();
        var serversJson = this.storage.getItem(PersistentServerRepository.SERVERS_STORAGE_KEY);
        if (!serversJson) {
            console.debug("no servers found in storage");
            return;
        }
        var configById = {};
        try {
            configById = JSON.parse(serversJson);
        } catch (e) {
            throw new Error("could not parse saved servers: " + e.message);
        }
        for (var serverId in configById) {
            if (configById.hasOwnProperty(serverId)) {
                var config = configById[serverId];
                try {
                    var server = this.createServer(serverId, config, this.eventQueue);
                    this.serverById.set(serverId, server);
                } catch (e) {
                    // Don't propagate so other stored servers can be created.
                    console.error(e);
                }
            }
        }
    };
    // Name by which servers are saved to storage.
    PersistentServerRepository.SERVERS_STORAGE_KEY = 'servers';
    return PersistentServerRepository;
}();
exports.PersistentServerRepository = PersistentServerRepository;
function configsMatch(left, right) {
    return left.host === right.host && left.port === right.port && left.method === right.method && left.password === right.password;
}

},{"../model/errors":33,"../model/events":34,"uuid":16}],30:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var __values = undefined && undefined.__values || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator],
        i = 0;
    if (m) return m.call(o);
    return {
        next: function next() {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = undefined && undefined.__read || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
        r,
        ar = [],
        e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
            ar.push(r.value);
        }
    } catch (error) {
        e = { error: error };
    } finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
            if (e) throw e.error;
        }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Setting keys supported by the `Settings` class.
var SettingsKey;
(function (SettingsKey) {
    SettingsKey["VPN_WARNING_DISMISSED"] = "vpn-warning-dismissed";
    SettingsKey["AUTO_CONNECT_DIALOG_DISMISSED"] = "auto-connect-dialog-dismissed";
    SettingsKey["PRIVACY_ACK"] = "privacy-ack";
})(SettingsKey = exports.SettingsKey || (exports.SettingsKey = {}));
// Persistent storage for user settings that supports a limited set of keys.
var Settings = /** @class */function () {
    function Settings(storage, validKeys) {
        if (storage === void 0) {
            storage = window.localStorage;
        }
        if (validKeys === void 0) {
            validKeys = Object.values(SettingsKey);
        }
        this.storage = storage;
        this.validKeys = validKeys;
        this.settings = new Map();
        this.loadSettings();
    }
    Settings.prototype.get = function (key) {
        return this.settings.get(key);
    };
    Settings.prototype.set = function (key, value) {
        if (!this.isValidSetting(key)) {
            throw new Error("Cannot set invalid key " + key);
        }
        this.settings.set(key, value);
        this.storeSettings();
    };
    Settings.prototype.remove = function (key) {
        this.settings.delete(key);
        this.storeSettings();
    };
    Settings.prototype.isValidSetting = function (key) {
        return this.validKeys.includes(key);
    };
    Settings.prototype.loadSettings = function () {
        var settingsJson = this.storage.getItem(Settings.STORAGE_KEY);
        if (!settingsJson) {
            console.debug("No settings found in storage");
            return;
        }
        var storageSettings = JSON.parse(settingsJson);
        for (var key in storageSettings) {
            if (storageSettings.hasOwnProperty(key)) {
                this.settings.set(key, storageSettings[key]);
            }
        }
    };
    Settings.prototype.storeSettings = function () {
        var storageSettings = {};
        try {
            for (var _a = __values(this.settings), _b = _a.next(); !_b.done; _b = _a.next()) {
                var _c = __read(_b.value, 2),
                    key = _c[0],
                    value = _c[1];
                storageSettings[key] = value;
            }
        } catch (e_1_1) {
            e_1 = { error: e_1_1 };
        } finally {
            try {
                if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
            } finally {
                if (e_1) throw e_1.error;
            }
        }
        var storageSettingsJson = JSON.stringify(storageSettings);
        this.storage.setItem(Settings.STORAGE_KEY, storageSettingsJson);
        var e_1, _d;
    };
    Settings.STORAGE_KEY = 'settings';
    return Settings;
}();
exports.Settings = Settings;

},{}],31:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

Object.defineProperty(exports, "__esModule", { value: true });
var AbstractUpdater = /** @class */function () {
    function AbstractUpdater() {}
    AbstractUpdater.prototype.setListener = function (listener) {
        this.listener = listener;
    };
    AbstractUpdater.prototype.emitEvent = function () {
        if (this.listener) {
            this.listener();
        }
    };
    return AbstractUpdater;
}();
exports.AbstractUpdater = AbstractUpdater;

},{}],32:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var __extends = undefined && undefined.__extends || function () {
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
var __values = undefined && undefined.__values || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator],
        i = 0;
    if (m) return m.call(o);
    return {
        next: function next() {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path='../../types/ambient/webintents.d.ts'/>
var UrlInterceptor = /** @class */function () {
    function UrlInterceptor() {
        this.listeners = [];
    }
    UrlInterceptor.prototype.registerListener = function (listener) {
        this.listeners.push(listener);
        if (this.launchUrl) {
            listener(this.launchUrl);
            this.launchUrl = undefined;
        }
    };
    UrlInterceptor.prototype.executeListeners = function (url) {
        if (!url) {
            return;
        }
        if (!this.listeners.length) {
            console.log('no listeners have been added, delaying intent firing');
            this.launchUrl = url;
            return;
        }
        try {
            for (var _a = __values(this.listeners), _b = _a.next(); !_b.done; _b = _a.next()) {
                var listener = _b.value;
                listener(url);
            }
        } catch (e_1_1) {
            e_1 = { error: e_1_1 };
        } finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            } finally {
                if (e_1) throw e_1.error;
            }
        }
        var e_1, _c;
    };
    return UrlInterceptor;
}();
exports.UrlInterceptor = UrlInterceptor;
var AndroidUrlInterceptor = /** @class */function (_super) {
    __extends(AndroidUrlInterceptor, _super);
    function AndroidUrlInterceptor() {
        var _this = _super.call(this) || this;
        window.webintent.getUri(function (launchUrl) {
            window.webintent.onNewIntent(_this.executeListeners.bind(_this));
            _this.executeListeners(launchUrl);
        });
        return _this;
    }
    return AndroidUrlInterceptor;
}(UrlInterceptor);
exports.AndroidUrlInterceptor = AndroidUrlInterceptor;
var AppleUrlInterceptor = /** @class */function (_super) {
    __extends(AppleUrlInterceptor, _super);
    function AppleUrlInterceptor(launchUrl) {
        var _this = _super.call(this) || this;
        // cordova-[ios|osx] call a global function with this signature when a URL is intercepted.
        // We define it in |cordova_main|, redefine it to use this interceptor.
        window.handleOpenURL = function (url) {
            _this.executeListeners(url);
        };
        if (launchUrl) {
            _this.executeListeners(launchUrl);
        }
        return _this;
    }
    return AppleUrlInterceptor;
}(UrlInterceptor);
exports.AppleUrlInterceptor = AppleUrlInterceptor;

},{}],33:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var __extends = undefined && undefined.__extends || function () {
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
Object.defineProperty(exports, "__esModule", { value: true });
var OutlineError = /** @class */function (_super) {
    __extends(OutlineError, _super);
    function OutlineError(message) {
        var _newTarget = this.constructor;
        var _this =
        // ref:
        // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
        _super.call(this, message) || this;
        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain
        _this.name = _newTarget.name;
        return _this;
    }
    return OutlineError;
}(Error);
exports.OutlineError = OutlineError;
var ServerAlreadyAdded = /** @class */function (_super) {
    __extends(ServerAlreadyAdded, _super);
    function ServerAlreadyAdded(server) {
        var _this = _super.call(this) || this;
        _this.server = server;
        return _this;
    }
    return ServerAlreadyAdded;
}(OutlineError);
exports.ServerAlreadyAdded = ServerAlreadyAdded;
var ServerIncompatible = /** @class */function (_super) {
    __extends(ServerIncompatible, _super);
    function ServerIncompatible(message) {
        return _super.call(this, message) || this;
    }
    return ServerIncompatible;
}(OutlineError);
exports.ServerIncompatible = ServerIncompatible;
var ServerUrlInvalid = /** @class */function (_super) {
    __extends(ServerUrlInvalid, _super);
    function ServerUrlInvalid(message) {
        return _super.call(this, message) || this;
    }
    return ServerUrlInvalid;
}(OutlineError);
exports.ServerUrlInvalid = ServerUrlInvalid;
var OperationTimedOut = /** @class */function (_super) {
    __extends(OperationTimedOut, _super);
    function OperationTimedOut(timeoutMs, operationName) {
        var _this = _super.call(this) || this;
        _this.timeoutMs = timeoutMs;
        _this.operationName = operationName;
        return _this;
    }
    return OperationTimedOut;
}(OutlineError);
exports.OperationTimedOut = OperationTimedOut;
var FeedbackSubmissionError = /** @class */function (_super) {
    __extends(FeedbackSubmissionError, _super);
    function FeedbackSubmissionError() {
        return _super.call(this) || this;
    }
    return FeedbackSubmissionError;
}(OutlineError);
exports.FeedbackSubmissionError = FeedbackSubmissionError;
// Error thrown by "native" code.
//
// Must be kept in sync with its Cordova doppelganger:
//   cordova-plugin-outline/outlinePlugin.js
//
// TODO: Rename this class, "plugin" is a poor name since the Electron apps do not have plugins.
var OutlinePluginError = /** @class */function (_super) {
    __extends(OutlinePluginError, _super);
    function OutlinePluginError(errorCode) {
        var _this = _super.call(this) || this;
        _this.errorCode = errorCode;
        return _this;
    }
    return OutlinePluginError;
}(OutlineError);
exports.OutlinePluginError = OutlinePluginError;
// Marker class for errors originating in native code.
// Bifurcates into two subclasses:
//  - "expected" errors originating in native code, e.g. incorrect password
//  - "unexpected" errors originating in native code, e.g. unhandled routing table
var NativeError = /** @class */function (_super) {
    __extends(NativeError, _super);
    function NativeError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NativeError;
}(OutlineError);
exports.NativeError = NativeError;
var RegularNativeError = /** @class */function (_super) {
    __extends(RegularNativeError, _super);
    function RegularNativeError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RegularNativeError;
}(NativeError);
exports.RegularNativeError = RegularNativeError;
var RedFlagNativeError = /** @class */function (_super) {
    __extends(RedFlagNativeError, _super);
    function RedFlagNativeError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RedFlagNativeError;
}(NativeError);
exports.RedFlagNativeError = RedFlagNativeError;
//////
// "Expected" errors.
//////
var UnexpectedPluginError = /** @class */function (_super) {
    __extends(UnexpectedPluginError, _super);
    function UnexpectedPluginError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return UnexpectedPluginError;
}(RegularNativeError);
exports.UnexpectedPluginError = UnexpectedPluginError;
var VpnPermissionNotGranted = /** @class */function (_super) {
    __extends(VpnPermissionNotGranted, _super);
    function VpnPermissionNotGranted() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VpnPermissionNotGranted;
}(RegularNativeError);
exports.VpnPermissionNotGranted = VpnPermissionNotGranted;
var InvalidServerCredentials = /** @class */function (_super) {
    __extends(InvalidServerCredentials, _super);
    function InvalidServerCredentials() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InvalidServerCredentials;
}(RegularNativeError);
exports.InvalidServerCredentials = InvalidServerCredentials;
var RemoteUdpForwardingDisabled = /** @class */function (_super) {
    __extends(RemoteUdpForwardingDisabled, _super);
    function RemoteUdpForwardingDisabled() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RemoteUdpForwardingDisabled;
}(RegularNativeError);
exports.RemoteUdpForwardingDisabled = RemoteUdpForwardingDisabled;
var ServerUnreachable = /** @class */function (_super) {
    __extends(ServerUnreachable, _super);
    function ServerUnreachable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ServerUnreachable;
}(RegularNativeError);
exports.ServerUnreachable = ServerUnreachable;
var IllegalServerConfiguration = /** @class */function (_super) {
    __extends(IllegalServerConfiguration, _super);
    function IllegalServerConfiguration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return IllegalServerConfiguration;
}(RegularNativeError);
exports.IllegalServerConfiguration = IllegalServerConfiguration;
var NoAdminPermissions = /** @class */function (_super) {
    __extends(NoAdminPermissions, _super);
    function NoAdminPermissions() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NoAdminPermissions;
}(RegularNativeError);
exports.NoAdminPermissions = NoAdminPermissions;
var SystemConfigurationException = /** @class */function (_super) {
    __extends(SystemConfigurationException, _super);
    function SystemConfigurationException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SystemConfigurationException;
}(RegularNativeError);
exports.SystemConfigurationException = SystemConfigurationException;
//////
// Now, "unexpected" errors.
// Use these sparingly beacause each occurrence triggers a Sentry report.
//////
// Windows.
var ShadowsocksStartFailure = /** @class */function (_super) {
    __extends(ShadowsocksStartFailure, _super);
    function ShadowsocksStartFailure() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ShadowsocksStartFailure;
}(RedFlagNativeError);
exports.ShadowsocksStartFailure = ShadowsocksStartFailure;
var ConfigureSystemProxyFailure = /** @class */function (_super) {
    __extends(ConfigureSystemProxyFailure, _super);
    function ConfigureSystemProxyFailure() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConfigureSystemProxyFailure;
}(RedFlagNativeError);
exports.ConfigureSystemProxyFailure = ConfigureSystemProxyFailure;
var UnsupportedRoutingTable = /** @class */function (_super) {
    __extends(UnsupportedRoutingTable, _super);
    function UnsupportedRoutingTable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return UnsupportedRoutingTable;
}(RedFlagNativeError);
exports.UnsupportedRoutingTable = UnsupportedRoutingTable;
// Used on Android and Apple to indicate that the plugin failed to establish the VPN tunnel.
var VpnStartFailure = /** @class */function (_super) {
    __extends(VpnStartFailure, _super);
    function VpnStartFailure() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VpnStartFailure;
}(RedFlagNativeError);
exports.VpnStartFailure = VpnStartFailure;
// Converts an ErrorCode - originating in "native" code - to an instance of the relevant
// OutlineError subclass.
// Throws if the error code is not one defined in ErrorCode or is ErrorCode.NO_ERROR.
function fromErrorCode(errorCode) {
    switch (errorCode) {
        case 1 /* UNEXPECTED */:
            return new UnexpectedPluginError();
        case 2 /* VPN_PERMISSION_NOT_GRANTED */:
            return new VpnPermissionNotGranted();
        case 3 /* INVALID_SERVER_CREDENTIALS */:
            return new InvalidServerCredentials();
        case 4 /* UDP_RELAY_NOT_ENABLED */:
            return new RemoteUdpForwardingDisabled();
        case 5 /* SERVER_UNREACHABLE */:
            return new ServerUnreachable();
        case 6 /* VPN_START_FAILURE */:
            return new VpnStartFailure();
        case 7 /* ILLEGAL_SERVER_CONFIGURATION */:
            return new IllegalServerConfiguration();
        case 8 /* SHADOWSOCKS_START_FAILURE */:
            return new ShadowsocksStartFailure();
        case 9 /* CONFIGURE_SYSTEM_PROXY_FAILURE */:
            return new ConfigureSystemProxyFailure();
        case 10 /* NO_ADMIN_PERMISSIONS */:
            return new NoAdminPermissions();
        case 11 /* UNSUPPORTED_ROUTING_TABLE */:
            return new UnsupportedRoutingTable();
        case 12 /* SYSTEM_MISCONFIGURED */:
            return new SystemConfigurationException();
        default:
            throw new Error("unknown ErrorCode " + errorCode);
    }
}
exports.fromErrorCode = fromErrorCode;
// Converts a NativeError to an ErrorCode.
// Throws if the error is not a subclass of NativeError.
function toErrorCode(e) {
    if (e instanceof UnexpectedPluginError) {
        return 1 /* UNEXPECTED */;
    } else if (e instanceof VpnPermissionNotGranted) {
        return 2 /* VPN_PERMISSION_NOT_GRANTED */;
    } else if (e instanceof InvalidServerCredentials) {
        return 3 /* INVALID_SERVER_CREDENTIALS */;
    } else if (e instanceof RemoteUdpForwardingDisabled) {
        return 4 /* UDP_RELAY_NOT_ENABLED */;
    } else if (e instanceof ServerUnreachable) {
        return 5 /* SERVER_UNREACHABLE */;
    } else if (e instanceof VpnStartFailure) {
        return 6 /* VPN_START_FAILURE */;
    } else if (e instanceof IllegalServerConfiguration) {
        return 7 /* ILLEGAL_SERVER_CONFIGURATION */;
    } else if (e instanceof ShadowsocksStartFailure) {
        return 8 /* SHADOWSOCKS_START_FAILURE */;
    } else if (e instanceof ConfigureSystemProxyFailure) {
        return 9 /* CONFIGURE_SYSTEM_PROXY_FAILURE */;
    } else if (e instanceof UnsupportedRoutingTable) {
        return 11 /* UNSUPPORTED_ROUTING_TABLE */;
    } else if (e instanceof NoAdminPermissions) {
        return 10 /* NO_ADMIN_PERMISSIONS */;
    } else if (e instanceof SystemConfigurationException) {
        return 12 /* SYSTEM_MISCONFIGURED */;
    }
    throw new Error("unknown NativeError " + e.name);
}
exports.toErrorCode = toErrorCode;

},{}],34:[function(require,module,exports){
"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var __values = undefined && undefined.__values || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator],
        i = 0;
    if (m) return m.call(o);
    return {
        next: function next() {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ServerAdded = /** @class */function () {
    function ServerAdded(server) {
        this.server = server;
    }
    return ServerAdded;
}();
exports.ServerAdded = ServerAdded;
var ServerAlreadyAdded = /** @class */function () {
    function ServerAlreadyAdded(server) {
        this.server = server;
    }
    return ServerAlreadyAdded;
}();
exports.ServerAlreadyAdded = ServerAlreadyAdded;
var ServerForgotten = /** @class */function () {
    function ServerForgotten(server) {
        this.server = server;
    }
    return ServerForgotten;
}();
exports.ServerForgotten = ServerForgotten;
var ServerForgetUndone = /** @class */function () {
    function ServerForgetUndone(server) {
        this.server = server;
    }
    return ServerForgetUndone;
}();
exports.ServerForgetUndone = ServerForgetUndone;
var ServerRenamed = /** @class */function () {
    function ServerRenamed(server) {
        this.server = server;
    }
    return ServerRenamed;
}();
exports.ServerRenamed = ServerRenamed;
var ServerUrlInvalid = /** @class */function () {
    function ServerUrlInvalid(serverUrl) {
        this.serverUrl = serverUrl;
    }
    return ServerUrlInvalid;
}();
exports.ServerUrlInvalid = ServerUrlInvalid;
var ServerConnected = /** @class */function () {
    function ServerConnected(server) {
        this.server = server;
    }
    return ServerConnected;
}();
exports.ServerConnected = ServerConnected;
var ServerDisconnected = /** @class */function () {
    function ServerDisconnected(server) {
        this.server = server;
    }
    return ServerDisconnected;
}();
exports.ServerDisconnected = ServerDisconnected;
var ServerReconnecting = /** @class */function () {
    function ServerReconnecting(server) {
        this.server = server;
    }
    return ServerReconnecting;
}();
exports.ServerReconnecting = ServerReconnecting;
// Simple publisher-subscriber queue.
var EventQueue = /** @class */function () {
    function EventQueue() {
        this.queuedEvents = [];
        this.listenersByEventType = new Map();
        this.isStarted = false;
        this.isPublishing = false;
    }
    EventQueue.prototype.startPublishing = function () {
        this.isStarted = true;
        this.publishQueuedEvents();
    };
    // Registers a listener for events of the type of the given constructor.
    EventQueue.prototype.subscribe = function (eventType, listener) {
        var listeners = this.listenersByEventType.get(eventType);
        if (!listeners) {
            listeners = [];
            this.listenersByEventType.set(eventType, listeners);
        }
        listeners.push(listener);
    };
    // Enqueues the given event for publishing and publishes all queued events if
    // publishing is not already happening.
    //
    // The enqueue method is reentrant: it may be called by an event listener
    // during the publishing of the events. In that case the method adds the event
    // to the end of the queue and returns immediately.
    //
    // This guarantees that events are published and handled in the order that
    // they are queued.
    //
    // There's no guarantee that the subscribers for the event have been called by
    // the time this function returns.
    EventQueue.prototype.enqueue = function (event) {
        this.queuedEvents.push(event);
        if (this.isStarted) {
            this.publishQueuedEvents();
        }
    };
    // Triggers the subscribers for all the enqueued events.
    EventQueue.prototype.publishQueuedEvents = function () {
        if (this.isPublishing) return;
        this.isPublishing = true;
        while (this.queuedEvents.length > 0) {
            var event_1 = this.queuedEvents.shift();
            var listeners = this.listenersByEventType.get(event_1.constructor);
            if (!listeners) {
                console.warn('Dropping event with no listeners:', event_1);
                continue;
            }
            try {
                for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
                    var listener = listeners_1_1.value;
                    listener(event_1);
                }
            } catch (e_1_1) {
                e_1 = { error: e_1_1 };
            } finally {
                try {
                    if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
                } finally {
                    if (e_1) throw e_1.error;
                }
            }
        }
        this.isPublishing = false;
        var e_1, _a;
    };
    return EventQueue;
}();
exports.EventQueue = EventQueue;

},{}]},{},[23])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvU2hhZG93c29ja3NDb25maWcvc2hhZG93c29ja3NfY29uZmlnLnRzIiwibm9kZV9tb2R1bGVzL2Jhc2UtNjQvYmFzZTY0LmpzIiwibm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwibm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9kZWNvZGUuanMiLCJub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmF2ZW4tanMvc3JjL2NvbmZpZ0Vycm9yLmpzIiwibm9kZV9tb2R1bGVzL3JhdmVuLWpzL3NyYy9jb25zb2xlLmpzIiwibm9kZV9tb2R1bGVzL3JhdmVuLWpzL3NyYy9yYXZlbi5qcyIsIm5vZGVfbW9kdWxlcy9yYXZlbi1qcy9zcmMvc2luZ2xldG9uLmpzIiwibm9kZV9tb2R1bGVzL3JhdmVuLWpzL3NyYy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9yYXZlbi1qcy92ZW5kb3IvVHJhY2VLaXQvdHJhY2VraXQuanMiLCJub2RlX21vZHVsZXMvcmF2ZW4tanMvdmVuZG9yL2pzb24tc3RyaW5naWZ5LXNhZmUvc3RyaW5naWZ5LmpzIiwibm9kZV9tb2R1bGVzL3VybC91cmwuanMiLCJub2RlX21vZHVsZXMvdXJsL3V0aWwuanMiLCJub2RlX21vZHVsZXMvdXVpZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy91dWlkL2xpYi9ieXRlc1RvVXVpZC5qcyIsIm5vZGVfbW9kdWxlcy91dWlkL2xpYi9ybmctYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dWlkL3YxLmpzIiwibm9kZV9tb2R1bGVzL3V1aWQvdjQuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvY2xpcGJvYXJkLmpzIiwid3d3L2FwcC9jb3Jkb3ZhX21haW4uanMiLCJ3d3cvYXBwL2Vudmlyb25tZW50LmpzIiwid3d3L2FwcC9lcnJvcl9yZXBvcnRlci5qcyIsInd3dy9hcHAvZmFrZV9jb25uZWN0aW9uLmpzIiwid3d3L2FwcC9tYWluLmpzIiwid3d3L2FwcC9vdXRsaW5lX3NlcnZlci5qcyIsInd3dy9hcHAvcGVyc2lzdGVudF9zZXJ2ZXIuanMiLCJ3d3cvYXBwL3NldHRpbmdzLmpzIiwid3d3L2FwcC91cGRhdGVyLmpzIiwid3d3L2FwcC91cmxfaW50ZXJjZXB0b3IuanMiLCJ3d3cvbW9kZWwvZXJyb3JzLmpzIiwid3d3L21vZGVsL2V2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxBQUFxQztBQUNyQyxBQUFFO0FBQ0YsQUFBa0U7QUFDbEUsQUFBbUU7QUFDbkUsQUFBMEM7QUFDMUMsQUFBRTtBQUNGLEFBQWtEO0FBQ2xELEFBQUU7QUFDRixBQUFzRTtBQUN0RSxBQUFvRTtBQUNwRSxBQUEyRTtBQUMzRSxBQUFzRTtBQUN0RSxBQUFpQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O2lCQUVqQztRQUFvQix1REFDcEI7QUFBTSxZQUFTLE9BQUcsQUFBTyxXQUFNLEFBQUssZUFBVyxBQUFDO21CQUNqQyxBQUFHLE9BQVMsQUFBQyxBQUFDLEFBQUMsUUFBOUIsQUFBTSxDQUE0QixBQUFDLEFBQUMsQUFBQyxBQUFPLEFBQUMsQUFBUyxBQUFDLEFBQUMsQUFBTSxBQUFDLEFBQy9ELEFBQU07ZUFBUyxJQUFHLE9BQVMsQUFBQyxBQUFDLEFBQUMsQUFBSSxXQUFDLEFBQUMsQUFBQyxBQUFPLEFBQUM7QUFDcEMsQUFBRyxtQkFBUyxBQUFDLEFBQUMsT0FEK0IsQUFBQyxBQUFDLEFBQU0sQUFBQyxBQUMvRCxBQUFNLENBQWtCLEFBQU0sQUFBQyxBQUFHLEFBQUMsQUFBQyxBQUFDLEFBQU8sQUFBQyxBQUFLLEFBQUMsQUFBQyxBQUFHLEFBQUMsQUFDeEQsQUFBTTtBQUFRLEFBQUcsQUFBUyxBQUFDLEFBQUMsQUFBRSxBQUFjLEFBQUMsQUFBUSxBQUFDLEFB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dEMsQ0FBaEI7QUFDQSxnQkFBSSxDQUFDLFNBQUwsRUFBZ0I7QUFDWix3QkFBUSxJQUFSLENBQWEsbUNBQWIsRUFBa0QsT0FBbEQ7QUFDQTtBQUNIO0FBQ0QsZ0JBQUk7QUFDQSxxQkFBSyxJQUFJLGNBQWMsU0FBUyxTQUFULENBQWxCLEVBQXVDLGdCQUFnQixZQUFZLElBQVosRUFBNUQsRUFBZ0YsQ0FBQyxjQUFjLElBQS9GLEVBQXFHLGdCQUFnQixZQUFZLElBQVosRUFBckgsRUFBeUk7QUFDckksd0JBQUksV0FBVyxjQUFjLEtBQTdCO0FBQ0EsNkJBQVMsT0FBVDtBQUNIO0FBQ0osYUFMRCxDQU1BLE9BQU8sS0FBUCxFQUFjO0FBQUUsc0JBQU0sRUFBRSxPQUFPLEtBQVQsRUFBTjtBQUF5QixhQU56QyxTQU9RO0FBQ0osb0JBQUk7QUFDQSx3QkFBSSxpQkFBaUIsQ0FBQyxjQUFjLElBQWhDLEtBQXlDLEtBQUssWUFBWSxNQUExRCxDQUFKLEVBQXVFLEdBQUcsSUFBSCxDQUFRLFdBQVI7QUFDMUUsaUJBRkQsU0FHUTtBQUFFLHdCQUFJLEdBQUosRUFBUyxNQUFNLElBQUksS0FBVjtBQUFrQjtBQUN4QztBQUNKO0FBQ0QsYUFBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0EsWUFBSSxHQUFKLEVBQVMsRUFBVDtBQUNILEtBM0JEO0FBNEJBLFdBQU8sVUFBUDtBQUNILENBcEUrQixFQUFoQztBQXFFQSxRQUFRLFVBQVIsR0FBcUIsVUFBckIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gQ29weXJpZ2h0IDIwMTggVGhlIE91dGxpbmUgQXV0aG9yc1xuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vXG4vLyAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy9cbi8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8qIHRzbGludDpkaXNhYmxlICovXG5jb25zdCBpc0Jyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbmNvbnN0IGI2NEVuY29kZSA9IGlzQnJvd3NlciA/IGJ0b2EgOiByZXF1aXJlKCdiYXNlLTY0JykuZW5jb2RlO1xuY29uc3QgYjY0RGVjb2RlID0gaXNCcm93c2VyID8gYXRvYiA6IHJlcXVpcmUoJ2Jhc2UtNjQnKS5kZWNvZGU7XG5jb25zdCBVUkwgPSBpc0Jyb3dzZXIgPyB3aW5kb3cuVVJMIDogcmVxdWlyZSgndXJsJykuVVJMO1xuY29uc3QgcHVueWNvZGUgPSBpc0Jyb3dzZXIgPyAod2luZG93IGFzIGFueSkucHVueWNvZGUgOiByZXF1aXJlKCdwdW55Y29kZScpO1xuaWYgKCFwdW55Y29kZSkge1xuICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIHB1bnljb2RlLiBEaWQgeW91IGZvcmdldCB0byBhZGQgZS5nLlxuICA8c2NyaXB0IHNyYz1cImJvd2VyX2NvbXBvbmVudHMvcHVueWNvZGUvcHVueWNvZGUubWluLmpzXCI+PC9zY3JpcHQ+P2ApO1xufVxuLyogdHNsaW50OmVuYWJsZSAqL1xuXG4vLyBDdXN0b20gZXJyb3IgYmFzZSBjbGFzc1xuZXhwb3J0IGNsYXNzIFNoYWRvd3NvY2tzQ29uZmlnRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpOyAgLy8gJ0Vycm9yJyBicmVha3MgcHJvdG90eXBlIGNoYWluIGhlcmUgaWYgdGhpcyBpcyB0cmFuc3BpbGVkIHRvIGVzNVxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBuZXcudGFyZ2V0LnByb3RvdHlwZSk7ICAvLyByZXN0b3JlIHByb3RvdHlwZSBjaGFpblxuICAgIHRoaXMubmFtZSA9IG5ldy50YXJnZXQubmFtZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW52YWxpZENvbmZpZ0ZpZWxkIGV4dGVuZHMgU2hhZG93c29ja3NDb25maWdFcnJvciB7fVxuXG5leHBvcnQgY2xhc3MgSW52YWxpZFVyaSBleHRlbmRzIFNoYWRvd3NvY2tzQ29uZmlnRXJyb3Ige31cblxuLy8gU2VsZi12YWxpZGF0aW5nL25vcm1hbGl6aW5nIGNvbmZpZyBkYXRhIHR5cGVzIGltcGxlbWVudCB0aGlzIFZhbGlkYXRlZENvbmZpZ0ZpZWxkIGludGVyZmFjZS5cbi8vIENvbnN0cnVjdG9ycyB0YWtlIHNvbWUgZGF0YSwgdmFsaWRhdGUsIG5vcm1hbGl6ZSwgYW5kIHN0b3JlIGlmIHZhbGlkLCBvciB0aHJvdyBvdGhlcndpc2UuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmFsaWRhdGVkQ29uZmlnRmllbGQge31cblxuZnVuY3Rpb24gdGhyb3dFcnJvckZvckludmFsaWRGaWVsZChuYW1lOiBzdHJpbmcsIHZhbHVlOiB7fSwgcmVhc29uPzogc3RyaW5nKSB7XG4gIHRocm93IG5ldyBJbnZhbGlkQ29uZmlnRmllbGQoYEludmFsaWQgJHtuYW1lfTogJHt2YWx1ZX0gJHtyZWFzb24gfHwgJyd9YCk7XG59XG5cbmV4cG9ydCBjbGFzcyBIb3N0IGV4dGVuZHMgVmFsaWRhdGVkQ29uZmlnRmllbGQge1xuICBwdWJsaWMgc3RhdGljIElQVjRfUEFUVEVSTiA9IC9eKD86WzAtOV17MSwzfVxcLil7M31bMC05XXsxLDN9JC87XG4gIHB1YmxpYyBzdGF0aWMgSVBWNl9QQVRURVJOID0gL14oPzpbQS1GMC05XXsxLDR9Oil7N31bQS1GMC05XXsxLDR9JC9pO1xuICBwdWJsaWMgc3RhdGljIEhPU1ROQU1FX1BBVFRFUk4gPSAvXltBLXowLTldK1tBLXowLTlfLi1dKiQvO1xuICBwdWJsaWMgcmVhZG9ubHkgZGF0YTogc3RyaW5nO1xuICBwdWJsaWMgcmVhZG9ubHkgaXNJUHY0OiBib29sZWFuO1xuICBwdWJsaWMgcmVhZG9ubHkgaXNJUHY2OiBib29sZWFuO1xuICBwdWJsaWMgcmVhZG9ubHkgaXNIb3N0bmFtZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihob3N0OiBIb3N0IHwgc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoIWhvc3QpIHtcbiAgICAgIHRocm93RXJyb3JGb3JJbnZhbGlkRmllbGQoJ2hvc3QnLCBob3N0KTtcbiAgICB9XG4gICAgaWYgKGhvc3QgaW5zdGFuY2VvZiBIb3N0KSB7XG4gICAgICBob3N0ID0gaG9zdC5kYXRhO1xuICAgIH1cbiAgICBob3N0ID0gcHVueWNvZGUudG9BU0NJSShob3N0KSBhcyBzdHJpbmc7XG4gICAgdGhpcy5pc0lQdjQgPSBIb3N0LklQVjRfUEFUVEVSTi50ZXN0KGhvc3QpO1xuICAgIHRoaXMuaXNJUHY2ID0gdGhpcy5pc0lQdjQgPyBmYWxzZSA6IEhvc3QuSVBWNl9QQVRURVJOLnRlc3QoaG9zdCk7XG4gICAgdGhpcy5pc0hvc3RuYW1lID0gdGhpcy5pc0lQdjQgfHwgdGhpcy5pc0lQdjYgPyBmYWxzZSA6IEhvc3QuSE9TVE5BTUVfUEFUVEVSTi50ZXN0KGhvc3QpO1xuICAgIGlmICghKHRoaXMuaXNJUHY0IHx8IHRoaXMuaXNJUHY2IHx8IHRoaXMuaXNIb3N0bmFtZSkpIHtcbiAgICAgIHRocm93RXJyb3JGb3JJbnZhbGlkRmllbGQoJ2hvc3QnLCBob3N0KTtcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gaG9zdDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUG9ydCBleHRlbmRzIFZhbGlkYXRlZENvbmZpZ0ZpZWxkIHtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQQVRURVJOID0gL15bMC05XXsxLDV9JC87XG4gIHB1YmxpYyByZWFkb25seSBkYXRhOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IocG9ydDogUG9ydCB8IHN0cmluZyB8IG51bWJlcikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKHBvcnQgaW5zdGFuY2VvZiBQb3J0KSB7XG4gICAgICBwb3J0ID0gcG9ydC5kYXRhO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHBvcnQgPT09ICdudW1iZXInKSB7XG4gICAgICAvLyBTdHJpbmdpZnkgaW4gY2FzZSBuZWdhdGl2ZSBvciBmbG9hdGluZyBwb2ludCAtPiB0aGUgcmVnZXggdGVzdCBiZWxvdyB3aWxsIGNhdGNoLlxuICAgICAgcG9ydCA9IHBvcnQudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKCFQb3J0LlBBVFRFUk4udGVzdChwb3J0KSkge1xuICAgICAgdGhyb3dFcnJvckZvckludmFsaWRGaWVsZCgncG9ydCcsIHBvcnQpO1xuICAgIH1cbiAgICAvLyBDb3VsZCBleGNlZWQgdGhlIG1heGltdW0gcG9ydCBudW1iZXIsIHNvIGNvbnZlcnQgdG8gTnVtYmVyIHRvIGNoZWNrLiBDb3VsZCBhbHNvIGhhdmUgbGVhZGluZ1xuICAgIC8vIHplcm9zLiBDb252ZXJ0aW5nIHRvIE51bWJlciBkcm9wcyB0aG9zZSwgc28gd2UgZ2V0IG5vcm1hbGl6YXRpb24gZm9yIGZyZWUuIDopXG4gICAgcG9ydCA9IE51bWJlcihwb3J0KTtcbiAgICBpZiAocG9ydCA+IDY1NTM1KSB7XG4gICAgICB0aHJvd0Vycm9yRm9ySW52YWxpZEZpZWxkKCdwb3J0JywgcG9ydCk7XG4gICAgfVxuICAgIHRoaXMuZGF0YSA9IHBvcnQ7XG4gIH1cbn1cblxuLy8gQSBtZXRob2QgdmFsdWUgbXVzdCBleGFjdGx5IG1hdGNoIGFuIGVsZW1lbnQgaW4gdGhlIHNldCBvZiBrbm93biBjaXBoZXJzLlxuLy8gcmVmOiBodHRwczovL2dpdGh1Yi5jb20vc2hhZG93c29ja3Mvc2hhZG93c29ja3MtbGliZXYvYmxvYi8xMGEyZDNlMy9jb21wbGV0aW9ucy9iYXNoL3NzLXJlZGlyI0w1XG5leHBvcnQgY29uc3QgTUVUSE9EUyA9IG5ldyBTZXQoW1xuICAncmM0LW1kNScsXG4gICdhZXMtMTI4LWdjbScsXG4gICdhZXMtMTkyLWdjbScsXG4gICdhZXMtMjU2LWdjbScsXG4gICdhZXMtMTI4LWNmYicsXG4gICdhZXMtMTkyLWNmYicsXG4gICdhZXMtMjU2LWNmYicsXG4gICdhZXMtMTI4LWN0cicsXG4gICdhZXMtMTkyLWN0cicsXG4gICdhZXMtMjU2LWN0cicsXG4gICdjYW1lbGxpYS0xMjgtY2ZiJyxcbiAgJ2NhbWVsbGlhLTE5Mi1jZmInLFxuICAnY2FtZWxsaWEtMjU2LWNmYicsXG4gICdiZi1jZmInLFxuICAnY2hhY2hhMjAtaWV0Zi1wb2x5MTMwNScsXG4gICdzYWxzYTIwJyxcbiAgJ2NoYWNoYTIwJyxcbiAgJ2NoYWNoYTIwLWlldGYnLFxuICAneGNoYWNoYTIwLWlldGYtcG9seTEzMDUnLFxuXSk7XG5cbmV4cG9ydCBjbGFzcyBNZXRob2QgZXh0ZW5kcyBWYWxpZGF0ZWRDb25maWdGaWVsZCB7XG4gIHB1YmxpYyByZWFkb25seSBkYXRhOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKG1ldGhvZDogTWV0aG9kIHwgc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAobWV0aG9kIGluc3RhbmNlb2YgTWV0aG9kKSB7XG4gICAgICBtZXRob2QgPSBtZXRob2QuZGF0YTtcbiAgICB9XG4gICAgaWYgKCFNRVRIT0RTLmhhcyhtZXRob2QpKSB7XG4gICAgICB0aHJvd0Vycm9yRm9ySW52YWxpZEZpZWxkKCdtZXRob2QnLCBtZXRob2QpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBtZXRob2Q7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhc3N3b3JkIGV4dGVuZHMgVmFsaWRhdGVkQ29uZmlnRmllbGQge1xuICBwdWJsaWMgcmVhZG9ubHkgZGF0YTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHBhc3N3b3JkOiBQYXNzd29yZCB8IHN0cmluZykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5kYXRhID0gcGFzc3dvcmQgaW5zdGFuY2VvZiBQYXNzd29yZCA/IHBhc3N3b3JkLmRhdGEgOiBwYXNzd29yZDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVGFnIGV4dGVuZHMgVmFsaWRhdGVkQ29uZmlnRmllbGQge1xuICBwdWJsaWMgcmVhZG9ubHkgZGF0YTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHRhZzogVGFnIHwgc3RyaW5nID0gJycpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZGF0YSA9IHRhZyBpbnN0YW5jZW9mIFRhZyA/IHRhZy5kYXRhIDogdGFnO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIHtcbiAgaG9zdDogSG9zdDtcbiAgcG9ydDogUG9ydDtcbiAgbWV0aG9kOiBNZXRob2Q7XG4gIHBhc3N3b3JkOiBQYXNzd29yZDtcbiAgdGFnOiBUYWc7XG4gIC8vIEFueSBhZGRpdGlvbmFsIGNvbmZpZ3VyYXRpb24gKGUuZy4gYHRpbWVvdXRgLCBTSVAwMDMgYHBsdWdpbmAsIGV0Yy4pIG1heSBiZSBzdG9yZWQgaGVyZS5cbiAgZXh0cmE6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xufVxuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG5leHBvcnQgZnVuY3Rpb24gbWFrZUNvbmZpZyhpbnB1dDoge1trZXk6IHN0cmluZ106IGFueX0pOiBDb25maWcge1xuICAvLyBVc2UgXCIhXCIgZm9yIHRoZSByZXF1aXJlZCBmaWVsZHMgdG8gdGVsbCB0c2MgdGhhdCB3ZSBoYW5kbGUgdW5kZWZpbmVkIGluIHRoZVxuICAvLyBWYWxpZGF0ZWRDb25maWdGaWVsZHMgd2UgY2FsbDsgdHNjIGNhbid0IGZpZ3VyZSB0aGF0IG91dCBvdGhlcndpc2UuXG4gIGNvbnN0IGNvbmZpZyA9IHtcbiAgICBob3N0OiBuZXcgSG9zdChpbnB1dC5ob3N0ISksXG4gICAgcG9ydDogbmV3IFBvcnQoaW5wdXQucG9ydCEpLFxuICAgIG1ldGhvZDogbmV3IE1ldGhvZChpbnB1dC5tZXRob2QhKSxcbiAgICBwYXNzd29yZDogbmV3IFBhc3N3b3JkKGlucHV0LnBhc3N3b3JkISksXG4gICAgdGFnOiBuZXcgVGFnKGlucHV0LnRhZyksICAvLyBpbnB1dC50YWcgbWlnaHQgYmUgdW5kZWZpbmVkIGJ1dCBUYWcoKSBoYW5kbGVzIHRoYXQgZmluZS5cbiAgICBleHRyYToge30gYXMge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gIH07XG4gIC8vIFB1dCBhbnkgcmVtYWluaW5nIGZpZWxkcyBpbiBgaW5wdXRgIGludG8gYGNvbmZpZy5leHRyYWAuXG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGlucHV0KSkge1xuICAgIGlmICghL14oaG9zdHxwb3J0fG1ldGhvZHxwYXNzd29yZHx0YWcpJC8udGVzdChrZXkpKSB7XG4gICAgICBjb25maWcuZXh0cmFba2V5XSA9IGlucHV0W2tleV0gJiYgaW5wdXRba2V5XS50b1N0cmluZygpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY29uZmlnO1xufVxuXG5leHBvcnQgY29uc3QgU0hBRE9XU09DS1NfVVJJID0ge1xuICBQUk9UT0NPTDogJ3NzOicsXG5cbiAgZ2V0VXJpRm9ybWF0dGVkSG9zdDogKGhvc3Q6IEhvc3QpID0+IHtcbiAgICByZXR1cm4gaG9zdC5pc0lQdjYgPyBgWyR7aG9zdC5kYXRhfV1gIDogaG9zdC5kYXRhO1xuICB9LFxuXG4gIGdldEhhc2g6ICh0YWc6IFRhZykgPT4ge1xuICAgIHJldHVybiB0YWcuZGF0YSA/IGAjJHtlbmNvZGVVUklDb21wb25lbnQodGFnLmRhdGEpfWAgOiAnJztcbiAgfSxcblxuICB2YWxpZGF0ZVByb3RvY29sOiAodXJpOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoIXVyaS5zdGFydHNXaXRoKFNIQURPV1NPQ0tTX1VSSS5QUk9UT0NPTCkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkVXJpKGBVUkkgbXVzdCBzdGFydCB3aXRoIFwiJHtTSEFET1dTT0NLU19VUkkuUFJPVE9DT0x9XCJgKTtcbiAgICB9XG4gIH0sXG5cbiAgcGFyc2U6ICh1cmk6IHN0cmluZyk6IENvbmZpZyA9PiB7XG4gICAgbGV0IGVycm9yOiBFcnJvciB8IHVuZGVmaW5lZDtcbiAgICBmb3IgKGNvbnN0IHVyaVR5cGUgb2YgW1NJUDAwMl9VUkksIExFR0FDWV9CQVNFNjRfVVJJXSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHVyaVR5cGUucGFyc2UodXJpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZXJyb3IgPSBlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIEludmFsaWRVcmkpKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbEVycm9yTmFtZSA9IGVycm9yIS5uYW1lISB8fCAnKFVubmFtZWQgRXJyb3IpJztcbiAgICAgIGNvbnN0IG9yaWdpbmFsRXJyb3JNZXNzYWdlID0gZXJyb3IhLm1lc3NhZ2UhIHx8ICcobm8gZXJyb3IgbWVzc2FnZSBwcm92aWRlZCknO1xuICAgICAgY29uc3Qgb3JpZ2luYWxFcnJvclN0cmluZyA9IGAke29yaWdpbmFsRXJyb3JOYW1lfTogJHtvcmlnaW5hbEVycm9yTWVzc2FnZX1gO1xuICAgICAgY29uc3QgbmV3RXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5wdXQ6ICR7b3JpZ2luYWxFcnJvclN0cmluZ31gO1xuICAgICAgZXJyb3IgPSBuZXcgSW52YWxpZFVyaShuZXdFcnJvck1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfSxcbn07XG5cbi8vIFJlZjogaHR0cHM6Ly9zaGFkb3dzb2Nrcy5vcmcvZW4vY29uZmlnL3F1aWNrLWd1aWRlLmh0bWxcbmV4cG9ydCBjb25zdCBMRUdBQ1lfQkFTRTY0X1VSSSA9IHtcbiAgcGFyc2U6ICh1cmk6IHN0cmluZyk6IENvbmZpZyA9PiB7XG4gICAgU0hBRE9XU09DS1NfVVJJLnZhbGlkYXRlUHJvdG9jb2wodXJpKTtcbiAgICBjb25zdCBoYXNoSW5kZXggPSB1cmkuaW5kZXhPZignIycpO1xuICAgIGNvbnN0IGhhc1RhZyA9IGhhc2hJbmRleCAhPT0gLTE7XG4gICAgY29uc3QgYjY0RW5kSW5kZXggPSBoYXNUYWcgPyBoYXNoSW5kZXggOiB1cmkubGVuZ3RoO1xuICAgIGNvbnN0IHRhZ1N0YXJ0SW5kZXggPSBoYXNUYWcgPyBoYXNoSW5kZXggKyAxIDogdXJpLmxlbmd0aDtcbiAgICBjb25zdCB0YWcgPSBuZXcgVGFnKGRlY29kZVVSSUNvbXBvbmVudCh1cmkuc3Vic3RyaW5nKHRhZ1N0YXJ0SW5kZXgpKSk7XG4gICAgY29uc3QgYjY0RW5jb2RlZERhdGEgPSB1cmkuc3Vic3RyaW5nKCdzczovLycubGVuZ3RoLCBiNjRFbmRJbmRleCk7XG4gICAgY29uc3QgYjY0RGVjb2RlZERhdGEgPSBiNjREZWNvZGUoYjY0RW5jb2RlZERhdGEpO1xuICAgIGNvbnN0IGF0U2lnbkluZGV4ID0gYjY0RGVjb2RlZERhdGEuaW5kZXhPZignQCcpO1xuICAgIGlmIChhdFNpZ25JbmRleCA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkVXJpKGBNaXNzaW5nIFwiQFwiYCk7XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZEFuZFBhc3N3b3JkID0gYjY0RGVjb2RlZERhdGEuc3Vic3RyaW5nKDAsIGF0U2lnbkluZGV4KTtcbiAgICBjb25zdCBtZXRob2RFbmRJbmRleCA9IG1ldGhvZEFuZFBhc3N3b3JkLmluZGV4T2YoJzonKTtcbiAgICBpZiAobWV0aG9kRW5kSW5kZXggPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFVyaShgTWlzc2luZyBwYXNzd29yZGApO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2RTdHJpbmcgPSBtZXRob2RBbmRQYXNzd29yZC5zdWJzdHJpbmcoMCwgbWV0aG9kRW5kSW5kZXgpO1xuICAgIGNvbnN0IG1ldGhvZCA9IG5ldyBNZXRob2QobWV0aG9kU3RyaW5nKTtcbiAgICBjb25zdCBwYXNzd29yZFN0YXJ0SW5kZXggPSBtZXRob2RFbmRJbmRleCArIDE7XG4gICAgY29uc3QgcGFzc3dvcmRTdHJpbmcgPSBtZXRob2RBbmRQYXNzd29yZC5zdWJzdHJpbmcocGFzc3dvcmRTdGFydEluZGV4KTtcbiAgICBjb25zdCBwYXNzd29yZCA9IG5ldyBQYXNzd29yZChwYXNzd29yZFN0cmluZyk7XG4gICAgY29uc3QgaG9zdFN0YXJ0SW5kZXggPSBhdFNpZ25JbmRleCArIDE7XG4gICAgY29uc3QgaG9zdEFuZFBvcnQgPSBiNjREZWNvZGVkRGF0YS5zdWJzdHJpbmcoaG9zdFN0YXJ0SW5kZXgpO1xuICAgIGNvbnN0IGhvc3RFbmRJbmRleCA9IGhvc3RBbmRQb3J0Lmxhc3RJbmRleE9mKCc6Jyk7XG4gICAgaWYgKGhvc3RFbmRJbmRleCA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkVXJpKGBNaXNzaW5nIHBvcnRgKTtcbiAgICB9XG4gICAgY29uc3QgdXJpRm9ybWF0dGVkSG9zdCA9IGhvc3RBbmRQb3J0LnN1YnN0cmluZygwLCBob3N0RW5kSW5kZXgpO1xuICAgIGxldCBob3N0OiBIb3N0O1xuICAgIHRyeSB7XG4gICAgICBob3N0ID0gbmV3IEhvc3QodXJpRm9ybWF0dGVkSG9zdCk7XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgLy8gQ291bGQgYmUgSVB2NiBob3N0IGZvcm1hdHRlZCB3aXRoIHN1cnJvdW5kaW5nIGJyYWNrZXRzLCBzbyB0cnkgc3RyaXBwaW5nIGZpcnN0IGFuZCBsYXN0XG4gICAgICAvLyBjaGFyYWN0ZXJzLiBJZiB0aGlzIHRocm93cywgZ2l2ZSB1cCBhbmQgbGV0IHRoZSBleGNlcHRpb24gcHJvcGFnYXRlLlxuICAgICAgaG9zdCA9IG5ldyBIb3N0KHVyaUZvcm1hdHRlZEhvc3Quc3Vic3RyaW5nKDEsIHVyaUZvcm1hdHRlZEhvc3QubGVuZ3RoIC0gMSkpO1xuICAgIH1cbiAgICBjb25zdCBwb3J0U3RhcnRJbmRleCA9IGhvc3RFbmRJbmRleCArIDE7XG4gICAgY29uc3QgcG9ydFN0cmluZyA9IGhvc3RBbmRQb3J0LnN1YnN0cmluZyhwb3J0U3RhcnRJbmRleCk7XG4gICAgY29uc3QgcG9ydCA9IG5ldyBQb3J0KHBvcnRTdHJpbmcpO1xuICAgIGNvbnN0IGV4dHJhID0ge30gYXMge1trZXk6IHN0cmluZ106IHN0cmluZ307ICAvLyBlbXB0eSBiZWNhdXNlIExlZ2FjeUJhc2U2NFVyaSBjYW4ndCBob2xkIGV4dHJhXG4gICAgcmV0dXJuIHttZXRob2QsIHBhc3N3b3JkLCBob3N0LCBwb3J0LCB0YWcsIGV4dHJhfTtcbiAgfSxcblxuICBzdHJpbmdpZnk6IChjb25maWc6IENvbmZpZykgPT4ge1xuICAgIGNvbnN0IHtob3N0LCBwb3J0LCBtZXRob2QsIHBhc3N3b3JkLCB0YWd9ID0gY29uZmlnO1xuICAgIGNvbnN0IGhhc2ggPSBTSEFET1dTT0NLU19VUkkuZ2V0SGFzaCh0YWcpO1xuICAgIGxldCBiNjRFbmNvZGVkRGF0YSA9IGI2NEVuY29kZShgJHttZXRob2QuZGF0YX06JHtwYXNzd29yZC5kYXRhfUAke2hvc3QuZGF0YX06JHtwb3J0LmRhdGF9YCk7XG4gICAgY29uc3QgZGF0YUxlbmd0aCA9IGI2NEVuY29kZWREYXRhLmxlbmd0aDtcbiAgICBsZXQgcGFkZGluZ0xlbmd0aCA9IDA7XG4gICAgZm9yICg7IGI2NEVuY29kZWREYXRhW2RhdGFMZW5ndGggLSAxIC0gcGFkZGluZ0xlbmd0aF0gPT09ICc9JzsgcGFkZGluZ0xlbmd0aCsrKTtcbiAgICBiNjRFbmNvZGVkRGF0YSA9IHBhZGRpbmdMZW5ndGggPT09IDAgPyBiNjRFbmNvZGVkRGF0YSA6XG4gICAgICAgIGI2NEVuY29kZWREYXRhLnN1YnN0cmluZygwLCBkYXRhTGVuZ3RoIC0gcGFkZGluZ0xlbmd0aCk7XG4gICAgcmV0dXJuIGBzczovLyR7YjY0RW5jb2RlZERhdGF9JHtoYXNofWA7XG4gIH0sXG59O1xuXG4vLyBSZWY6IGh0dHBzOi8vc2hhZG93c29ja3Mub3JnL2VuL3NwZWMvU0lQMDAyLVVSSS1TY2hlbWUuaHRtbFxuZXhwb3J0IGNvbnN0IFNJUDAwMl9VUkkgPSB7XG4gIHBhcnNlOiAodXJpOiBzdHJpbmcpOiBDb25maWcgPT4ge1xuICAgIFNIQURPV1NPQ0tTX1VSSS52YWxpZGF0ZVByb3RvY29sKHVyaSk7XG4gICAgLy8gQ2FuIHVzZSBidWlsdC1pbiBVUkwgcGFyc2VyIGZvciBleHBlZGllbmNlLiBKdXN0IGhhdmUgdG8gcmVwbGFjZSBcInNzXCIgd2l0aCBcImh0dHBcIiB0byBlbnN1cmVcbiAgICAvLyBjb3JyZWN0IHJlc3VsdHMsIG90aGVyd2lzZSBicm93c2VycyBsaWtlIFNhZmFyaSBmYWlsIHRvIHBhcnNlIGl0LlxuICAgIGNvbnN0IGlucHV0Rm9yVXJsUGFyc2VyID0gYGh0dHAke3VyaS5zdWJzdHJpbmcoMil9YDtcbiAgICAvLyBUaGUgYnVpbHQtaW4gVVJMIHBhcnNlciB0aHJvd3MgYXMgZGVzaXJlZCB3aGVuIGdpdmVuIFVSSXMgd2l0aCBpbnZhbGlkIHN5bnRheC5cbiAgICBjb25zdCB1cmxQYXJzZXJSZXN1bHQgPSBuZXcgVVJMKGlucHV0Rm9yVXJsUGFyc2VyKTtcbiAgICBjb25zdCB1cmlGb3JtYXR0ZWRIb3N0ID0gdXJsUGFyc2VyUmVzdWx0Lmhvc3RuYW1lO1xuICAgIC8vIFVSSS1mb3JtYXR0ZWQgSVB2NiBob3N0bmFtZXMgaGF2ZSBzdXJyb3VuZGluZyBicmFja2V0cy5cbiAgICBjb25zdCBsYXN0ID0gdXJpRm9ybWF0dGVkSG9zdC5sZW5ndGggLSAxO1xuICAgIGNvbnN0IGJyYWNrZXRzID0gdXJpRm9ybWF0dGVkSG9zdFswXSA9PT0gJ1snICYmIHVyaUZvcm1hdHRlZEhvc3RbbGFzdF0gPT09ICddJztcbiAgICBjb25zdCBob3N0U3RyaW5nID0gYnJhY2tldHMgPyB1cmlGb3JtYXR0ZWRIb3N0LnN1YnN0cmluZygxLCBsYXN0KSA6IHVyaUZvcm1hdHRlZEhvc3Q7XG4gICAgY29uc3QgaG9zdCA9IG5ldyBIb3N0KGhvc3RTdHJpbmcpO1xuICAgIGxldCBwYXJzZWRQb3J0ID0gdXJsUGFyc2VyUmVzdWx0LnBvcnQ7XG4gICAgaWYgKCFwYXJzZWRQb3J0ICYmIHVyaS5tYXRjaCgvOjgwKCR8XFwvKS9nKSkge1xuICAgICAgLy8gVGhlIGRlZmF1bHQgVVJMIHBhcnNlciBmYWlscyB0byByZWNvZ25pemUgdGhlIGRlZmF1bHQgcG9ydCAoODApIHdoZW4gdGhlIFVSSSBiZWluZyBwYXJzZWRcbiAgICAgIC8vIGlzIEhUVFAuIENoZWNrIGlmIHRoZSBwb3J0IGlzIHByZXNlbnQgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nIG9yIGJlZm9yZSB0aGUgcGFyYW1ldGVycy5cbiAgICAgIHBhcnNlZFBvcnQgPSA4MDtcbiAgICB9XG4gICAgY29uc3QgcG9ydCA9IG5ldyBQb3J0KHBhcnNlZFBvcnQpO1xuICAgIGNvbnN0IHRhZyA9IG5ldyBUYWcoZGVjb2RlVVJJQ29tcG9uZW50KHVybFBhcnNlclJlc3VsdC5oYXNoLnN1YnN0cmluZygxKSkpO1xuICAgIGNvbnN0IGI2NEVuY29kZWRVc2VySW5mbyA9IHVybFBhcnNlclJlc3VsdC51c2VybmFtZS5yZXBsYWNlKC8lM0QvZywgJz0nKTtcbiAgICAvLyBiYXNlNjQuZGVjb2RlIHRocm93cyBhcyBkZXNpcmVkIHdoZW4gZ2l2ZW4gaW52YWxpZCBiYXNlNjQgaW5wdXQuXG4gICAgY29uc3QgYjY0RGVjb2RlZFVzZXJJbmZvID0gYjY0RGVjb2RlKGI2NEVuY29kZWRVc2VySW5mbyk7XG4gICAgY29uc3QgY29sb25JZHggPSBiNjREZWNvZGVkVXNlckluZm8uaW5kZXhPZignOicpO1xuICAgIGlmIChjb2xvbklkeCA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkVXJpKGBNaXNzaW5nIHBhc3N3b3JkYCk7XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZFN0cmluZyA9IGI2NERlY29kZWRVc2VySW5mby5zdWJzdHJpbmcoMCwgY29sb25JZHgpO1xuICAgIGNvbnN0IG1ldGhvZCA9IG5ldyBNZXRob2QobWV0aG9kU3RyaW5nKTtcbiAgICBjb25zdCBwYXNzd29yZFN0cmluZyA9IGI2NERlY29kZWRVc2VySW5mby5zdWJzdHJpbmcoY29sb25JZHggKyAxKTtcbiAgICBjb25zdCBwYXNzd29yZCA9IG5ldyBQYXNzd29yZChwYXNzd29yZFN0cmluZyk7XG4gICAgY29uc3QgcXVlcnlQYXJhbXMgPSB1cmxQYXJzZXJSZXN1bHQuc2VhcmNoLnN1YnN0cmluZygxKS5zcGxpdCgnJicpO1xuICAgIGNvbnN0IGV4dHJhID0ge30gYXMge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gICAgZm9yIChjb25zdCBwYWlyIG9mIHF1ZXJ5UGFyYW1zKSB7XG4gICAgICBjb25zdCBba2V5LCB2YWx1ZV0gPSBwYWlyLnNwbGl0KCc9JywgMik7XG4gICAgICBpZiAoIWtleSkgY29udGludWU7XG4gICAgICBleHRyYVtrZXldID0gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlIHx8ICcnKTtcbiAgICB9XG4gICAgcmV0dXJuIHttZXRob2QsIHBhc3N3b3JkLCBob3N0LCBwb3J0LCB0YWcsIGV4dHJhfTtcbiAgfSxcblxuICBzdHJpbmdpZnk6IChjb25maWc6IENvbmZpZykgPT4ge1xuICAgIGNvbnN0IHtob3N0LCBwb3J0LCBtZXRob2QsIHBhc3N3b3JkLCB0YWcsIGV4dHJhfSA9IGNvbmZpZztcbiAgICBjb25zdCB1c2VySW5mbyA9IGI2NEVuY29kZShgJHttZXRob2QuZGF0YX06JHtwYXNzd29yZC5kYXRhfWApO1xuICAgIGNvbnN0IHVyaUhvc3QgPSBTSEFET1dTT0NLU19VUkkuZ2V0VXJpRm9ybWF0dGVkSG9zdChob3N0KTtcbiAgICBjb25zdCBoYXNoID0gU0hBRE9XU09DS1NfVVJJLmdldEhhc2godGFnKTtcbiAgICBsZXQgcXVlcnlTdHJpbmcgPSAnJztcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBleHRyYSkge1xuICAgICAgaWYgKCFrZXkpIGNvbnRpbnVlO1xuICAgICAgcXVlcnlTdHJpbmcgKz0gKHF1ZXJ5U3RyaW5nID8gJyYnIDogJz8nKSArIGAke2tleX09JHtlbmNvZGVVUklDb21wb25lbnQoZXh0cmFba2V5XSl9YDtcbiAgICB9XG4gICAgcmV0dXJuIGBzczovLyR7dXNlckluZm99QCR7dXJpSG9zdH06JHtwb3J0LmRhdGF9LyR7cXVlcnlTdHJpbmd9JHtoYXNofWA7XG4gIH0sXG59O1xuIiwiLyohIGh0dHA6Ly9tdGhzLmJlL2Jhc2U2NCB2MC4xLjAgYnkgQG1hdGhpYXMgfCBNSVQgbGljZW5zZSAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGVzIGBleHBvcnRzYC5cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cztcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC5cblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzICYmIG1vZHVsZTtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCwgZnJvbSBOb2RlLmpzIG9yIEJyb3dzZXJpZmllZCBjb2RlLCBhbmQgdXNlXG5cdC8vIGl0IGFzIGByb290YC5cblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsKSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgSW52YWxpZENoYXJhY3RlckVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG5cdH07XG5cdEludmFsaWRDaGFyYWN0ZXJFcnJvci5wcm90b3R5cGUgPSBuZXcgRXJyb3I7XG5cdEludmFsaWRDaGFyYWN0ZXJFcnJvci5wcm90b3R5cGUubmFtZSA9ICdJbnZhbGlkQ2hhcmFjdGVyRXJyb3InO1xuXG5cdHZhciBlcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHQvLyBOb3RlOiB0aGUgZXJyb3IgbWVzc2FnZXMgdXNlZCB0aHJvdWdob3V0IHRoaXMgZmlsZSBtYXRjaCB0aG9zZSB1c2VkIGJ5XG5cdFx0Ly8gdGhlIG5hdGl2ZSBgYXRvYmAvYGJ0b2FgIGltcGxlbWVudGF0aW9uIGluIENocm9taXVtLlxuXHRcdHRocm93IG5ldyBJbnZhbGlkQ2hhcmFjdGVyRXJyb3IobWVzc2FnZSk7XG5cdH07XG5cblx0dmFyIFRBQkxFID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXHQvLyBodHRwOi8vd2hhdHdnLm9yZy9odG1sL2NvbW1vbi1taWNyb3N5bnRheGVzLmh0bWwjc3BhY2UtY2hhcmFjdGVyXG5cdHZhciBSRUdFWF9TUEFDRV9DSEFSQUNURVJTID0gL1tcXHRcXG5cXGZcXHIgXS9nO1xuXG5cdC8vIGBkZWNvZGVgIGlzIGRlc2lnbmVkIHRvIGJlIGZ1bGx5IGNvbXBhdGlibGUgd2l0aCBgYXRvYmAgYXMgZGVzY3JpYmVkIGluIHRoZVxuXHQvLyBIVE1MIFN0YW5kYXJkLiBodHRwOi8vd2hhdHdnLm9yZy9odG1sL3dlYmFwcGFwaXMuaHRtbCNkb20td2luZG93YmFzZTY0LWF0b2Jcblx0Ly8gVGhlIG9wdGltaXplZCBiYXNlNjQtZGVjb2RpbmcgYWxnb3JpdGhtIHVzZWQgaXMgYmFzZWQgb24gQGF0a+KAmXMgZXhjZWxsZW50XG5cdC8vIGltcGxlbWVudGF0aW9uLiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9hdGsvMTAyMDM5NlxuXHR2YXIgZGVjb2RlID0gZnVuY3Rpb24oaW5wdXQpIHtcblx0XHRpbnB1dCA9IFN0cmluZyhpbnB1dClcblx0XHRcdC5yZXBsYWNlKFJFR0VYX1NQQUNFX0NIQVJBQ1RFUlMsICcnKTtcblx0XHR2YXIgbGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXHRcdGlmIChsZW5ndGggJSA0ID09IDApIHtcblx0XHRcdGlucHV0ID0gaW5wdXQucmVwbGFjZSgvPT0/JC8sICcnKTtcblx0XHRcdGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblx0XHR9XG5cdFx0aWYgKFxuXHRcdFx0bGVuZ3RoICUgNCA9PSAxIHx8XG5cdFx0XHQvLyBodHRwOi8vd2hhdHdnLm9yZy9DI2FscGhhbnVtZXJpYy1hc2NpaS1jaGFyYWN0ZXJzXG5cdFx0XHQvW14rYS16QS1aMC05L10vLnRlc3QoaW5wdXQpXG5cdFx0KSB7XG5cdFx0XHRlcnJvcihcblx0XHRcdFx0J0ludmFsaWQgY2hhcmFjdGVyOiB0aGUgc3RyaW5nIHRvIGJlIGRlY29kZWQgaXMgbm90IGNvcnJlY3RseSBlbmNvZGVkLidcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHZhciBiaXRDb3VudGVyID0gMDtcblx0XHR2YXIgYml0U3RvcmFnZTtcblx0XHR2YXIgYnVmZmVyO1xuXHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHR2YXIgcG9zaXRpb24gPSAtMTtcblx0XHR3aGlsZSAoKytwb3NpdGlvbiA8IGxlbmd0aCkge1xuXHRcdFx0YnVmZmVyID0gVEFCTEUuaW5kZXhPZihpbnB1dC5jaGFyQXQocG9zaXRpb24pKTtcblx0XHRcdGJpdFN0b3JhZ2UgPSBiaXRDb3VudGVyICUgNCA/IGJpdFN0b3JhZ2UgKiA2NCArIGJ1ZmZlciA6IGJ1ZmZlcjtcblx0XHRcdC8vIFVubGVzcyB0aGlzIGlzIHRoZSBmaXJzdCBvZiBhIGdyb3VwIG9mIDQgY2hhcmFjdGVyc+KAplxuXHRcdFx0aWYgKGJpdENvdW50ZXIrKyAlIDQpIHtcblx0XHRcdFx0Ly8g4oCmY29udmVydCB0aGUgZmlyc3QgOCBiaXRzIHRvIGEgc2luZ2xlIEFTQ0lJIGNoYXJhY3Rlci5cblx0XHRcdFx0b3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoXG5cdFx0XHRcdFx0MHhGRiAmIGJpdFN0b3JhZ2UgPj4gKC0yICogYml0Q291bnRlciAmIDYpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH07XG5cblx0Ly8gYGVuY29kZWAgaXMgZGVzaWduZWQgdG8gYmUgZnVsbHkgY29tcGF0aWJsZSB3aXRoIGBidG9hYCBhcyBkZXNjcmliZWQgaW4gdGhlXG5cdC8vIEhUTUwgU3RhbmRhcmQ6IGh0dHA6Ly93aGF0d2cub3JnL2h0bWwvd2ViYXBwYXBpcy5odG1sI2RvbS13aW5kb3diYXNlNjQtYnRvYVxuXHR2YXIgZW5jb2RlID0gZnVuY3Rpb24oaW5wdXQpIHtcblx0XHRpbnB1dCA9IFN0cmluZyhpbnB1dCk7XG5cdFx0aWYgKC9bXlxcMC1cXHhGRl0vLnRlc3QoaW5wdXQpKSB7XG5cdFx0XHQvLyBOb3RlOiBubyBuZWVkIHRvIHNwZWNpYWwtY2FzZSBhc3RyYWwgc3ltYm9scyBoZXJlLCBhcyBzdXJyb2dhdGVzIGFyZVxuXHRcdFx0Ly8gbWF0Y2hlZCwgYW5kIHRoZSBpbnB1dCBpcyBzdXBwb3NlZCB0byBvbmx5IGNvbnRhaW4gQVNDSUkgYW55d2F5LlxuXHRcdFx0ZXJyb3IoXG5cdFx0XHRcdCdUaGUgc3RyaW5nIHRvIGJlIGVuY29kZWQgY29udGFpbnMgY2hhcmFjdGVycyBvdXRzaWRlIG9mIHRoZSAnICtcblx0XHRcdFx0J0xhdGluMSByYW5nZS4nXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR2YXIgcGFkZGluZyA9IGlucHV0Lmxlbmd0aCAlIDM7XG5cdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdHZhciBwb3NpdGlvbiA9IC0xO1xuXHRcdHZhciBhO1xuXHRcdHZhciBiO1xuXHRcdHZhciBjO1xuXHRcdHZhciBkO1xuXHRcdHZhciBidWZmZXI7XG5cdFx0Ly8gTWFrZSBzdXJlIGFueSBwYWRkaW5nIGlzIGhhbmRsZWQgb3V0c2lkZSBvZiB0aGUgbG9vcC5cblx0XHR2YXIgbGVuZ3RoID0gaW5wdXQubGVuZ3RoIC0gcGFkZGluZztcblxuXHRcdHdoaWxlICgrK3Bvc2l0aW9uIDwgbGVuZ3RoKSB7XG5cdFx0XHQvLyBSZWFkIHRocmVlIGJ5dGVzLCBpLmUuIDI0IGJpdHMuXG5cdFx0XHRhID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbikgPDwgMTY7XG5cdFx0XHRiID0gaW5wdXQuY2hhckNvZGVBdCgrK3Bvc2l0aW9uKSA8PCA4O1xuXHRcdFx0YyA9IGlucHV0LmNoYXJDb2RlQXQoKytwb3NpdGlvbik7XG5cdFx0XHRidWZmZXIgPSBhICsgYiArIGM7XG5cdFx0XHQvLyBUdXJuIHRoZSAyNCBiaXRzIGludG8gZm91ciBjaHVua3Mgb2YgNiBiaXRzIGVhY2gsIGFuZCBhcHBlbmQgdGhlXG5cdFx0XHQvLyBtYXRjaGluZyBjaGFyYWN0ZXIgZm9yIGVhY2ggb2YgdGhlbSB0byB0aGUgb3V0cHV0LlxuXHRcdFx0b3V0cHV0ICs9IChcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiAxOCAmIDB4M0YpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiAxMiAmIDB4M0YpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiA2ICYgMHgzRikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyICYgMHgzRilcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKHBhZGRpbmcgPT0gMikge1xuXHRcdFx0YSA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pIDw8IDg7XG5cdFx0XHRiID0gaW5wdXQuY2hhckNvZGVBdCgrK3Bvc2l0aW9uKTtcblx0XHRcdGJ1ZmZlciA9IGEgKyBiO1xuXHRcdFx0b3V0cHV0ICs9IChcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiAxMCkgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoKGJ1ZmZlciA+PiA0KSAmIDB4M0YpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KChidWZmZXIgPDwgMikgJiAweDNGKSArXG5cdFx0XHRcdCc9J1xuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKHBhZGRpbmcgPT0gMSkge1xuXHRcdFx0YnVmZmVyID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbik7XG5cdFx0XHRvdXRwdXQgKz0gKFxuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDIpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KChidWZmZXIgPDwgNCkgJiAweDNGKSArXG5cdFx0XHRcdCc9PSdcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fTtcblxuXHR2YXIgYmFzZTY0ID0ge1xuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQndmVyc2lvbic6ICcwLjEuMCdcblx0fTtcblxuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBiYXNlNjQ7XG5cdFx0fSk7XG5cdH1cdGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmICFmcmVlRXhwb3J0cy5ub2RlVHlwZSkge1xuXHRcdGlmIChmcmVlTW9kdWxlKSB7IC8vIGluIE5vZGUuanMgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBiYXNlNjQ7XG5cdFx0fSBlbHNlIHsgLy8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAodmFyIGtleSBpbiBiYXNlNjQpIHtcblx0XHRcdFx0YmFzZTY0Lmhhc093blByb3BlcnR5KGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBiYXNlNjRba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgeyAvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5iYXNlNjQgPSBiYXNlNjQ7XG5cdH1cblxufSh0aGlzKSk7XG4iLCIvKiEgaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjQuMSBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0LyoqIERldGVjdCBmcmVlIHZhcmlhYmxlcyAqL1xuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmXG5cdFx0IWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdCFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoXG5cdFx0ZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwuc2VsZiA9PT0gZnJlZUdsb2JhbFxuXHQpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYHB1bnljb2RlYCBvYmplY3QuXG5cdCAqIEBuYW1lIHB1bnljb2RlXG5cdCAqIEB0eXBlIE9iamVjdFxuXHQgKi9cblx0dmFyIHB1bnljb2RlLFxuXG5cdC8qKiBIaWdoZXN0IHBvc2l0aXZlIHNpZ25lZCAzMi1iaXQgZmxvYXQgdmFsdWUgKi9cblx0bWF4SW50ID0gMjE0NzQ4MzY0NywgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHR0TWluID0gMSxcblx0dE1heCA9IDI2LFxuXHRza2V3ID0gMzgsXG5cdGRhbXAgPSA3MDAsXG5cdGluaXRpYWxCaWFzID0gNzIsXG5cdGluaXRpYWxOID0gMTI4LCAvLyAweDgwXG5cdGRlbGltaXRlciA9ICctJywgLy8gJ1xceDJEJ1xuXG5cdC8qKiBSZWd1bGFyIGV4cHJlc3Npb25zICovXG5cdHJlZ2V4UHVueWNvZGUgPSAvXnhuLS0vLFxuXHRyZWdleE5vbkFTQ0lJID0gL1teXFx4MjAtXFx4N0VdLywgLy8gdW5wcmludGFibGUgQVNDSUkgY2hhcnMgKyBub24tQVNDSUkgY2hhcnNcblx0cmVnZXhTZXBhcmF0b3JzID0gL1tcXHgyRVxcdTMwMDJcXHVGRjBFXFx1RkY2MV0vZywgLy8gUkZDIDM0OTAgc2VwYXJhdG9yc1xuXG5cdC8qKiBFcnJvciBtZXNzYWdlcyAqL1xuXHRlcnJvcnMgPSB7XG5cdFx0J292ZXJmbG93JzogJ092ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzJyxcblx0XHQnbm90LWJhc2ljJzogJ0lsbGVnYWwgaW5wdXQgPj0gMHg4MCAobm90IGEgYmFzaWMgY29kZSBwb2ludCknLFxuXHRcdCdpbnZhbGlkLWlucHV0JzogJ0ludmFsaWQgaW5wdXQnXG5cdH0sXG5cblx0LyoqIENvbnZlbmllbmNlIHNob3J0Y3V0cyAqL1xuXHRiYXNlTWludXNUTWluID0gYmFzZSAtIHRNaW4sXG5cdGZsb29yID0gTWF0aC5mbG9vcixcblx0c3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcblxuXHQvKiogVGVtcG9yYXJ5IHZhcmlhYmxlICovXG5cdGtleTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGVycm9yIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBlcnJvciB0eXBlLlxuXHQgKiBAcmV0dXJucyB7RXJyb3J9IFRocm93cyBhIGBSYW5nZUVycm9yYCB3aXRoIHRoZSBhcHBsaWNhYmxlIGVycm9yIG1lc3NhZ2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBlcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoZXJyb3JzW3R5cGVdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5IGFycmF5XG5cdCAqIGl0ZW0uXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcChhcnJheSwgZm4pIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdHJlc3VsdFtsZW5ndGhdID0gZm4oYXJyYXlbbGVuZ3RoXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzIG9yIGVtYWlsXG5cdCAqIGFkZHJlc3Nlcy5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG5cdCAqIGNoYXJhY3Rlci5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBzdHJpbmcgb2YgY2hhcmFjdGVycyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2tcblx0ICogZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXBEb21haW4oc3RyaW5nLCBmbikge1xuXHRcdHZhciBwYXJ0cyA9IHN0cmluZy5zcGxpdCgnQCcpO1xuXHRcdHZhciByZXN1bHQgPSAnJztcblx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gSW4gZW1haWwgYWRkcmVzc2VzLCBvbmx5IHRoZSBkb21haW4gbmFtZSBzaG91bGQgYmUgcHVueWNvZGVkLiBMZWF2ZVxuXHRcdFx0Ly8gdGhlIGxvY2FsIHBhcnQgKGkuZS4gZXZlcnl0aGluZyB1cCB0byBgQGApIGludGFjdC5cblx0XHRcdHJlc3VsdCA9IHBhcnRzWzBdICsgJ0AnO1xuXHRcdFx0c3RyaW5nID0gcGFydHNbMV07XG5cdFx0fVxuXHRcdC8vIEF2b2lkIGBzcGxpdChyZWdleClgIGZvciBJRTggY29tcGF0aWJpbGl0eS4gU2VlICMxNy5cblx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleFNlcGFyYXRvcnMsICdcXHgyRScpO1xuXHRcdHZhciBsYWJlbHMgPSBzdHJpbmcuc3BsaXQoJy4nKTtcblx0XHR2YXIgZW5jb2RlZCA9IG1hcChsYWJlbHMsIGZuKS5qb2luKCcuJyk7XG5cdFx0cmV0dXJuIHJlc3VsdCArIGVuY29kZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBudW1lcmljIGNvZGUgcG9pbnRzIG9mIGVhY2ggVW5pY29kZVxuXHQgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG5cdCAqIHRoaXMgZnVuY3Rpb24gd2lsbCBjb252ZXJ0IGEgcGFpciBvZiBzdXJyb2dhdGUgaGFsdmVzIChlYWNoIG9mIHdoaWNoXG5cdCAqIFVDUy0yIGV4cG9zZXMgYXMgc2VwYXJhdGUgY2hhcmFjdGVycykgaW50byBhIHNpbmdsZSBjb2RlIHBvaW50LFxuXHQgKiBtYXRjaGluZyBVVEYtMTYuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZW5jb2RlYFxuXHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZGVjb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG5ldyBhcnJheSBvZiBjb2RlIHBvaW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc3RyaW5nIGJhc2VkIG9uIGFuIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBlbmNvZGVcblx0ICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGJhc2ljIGNvZGUgcG9pbnQgaW50byBhIGRpZ2l0L2ludGVnZXIuXG5cdCAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gY29kZVBvaW50IFRoZSBiYXNpYyBudW1lcmljIGNvZGUgcG9pbnQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG5cdCAqIHRoZSBjb2RlIHBvaW50IGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHNlZSBgYmFzaWNUb0RpZ2l0KClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBiYXNpYyBjb2RlIHBvaW50IHdob3NlIHZhbHVlICh3aGVuIHVzZWQgZm9yXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG5cdCAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuXHQgKiB1c2VkOyBlbHNlLCB0aGUgbG93ZXJjYXNlIGZvcm0gaXMgdXNlZC4gVGhlIGJlaGF2aW9yIGlzIHVuZGVmaW5lZFxuXHQgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJpYXMgYWRhcHRhdGlvbiBmdW5jdGlvbiBhcyBwZXIgc2VjdGlvbiAzLjQgb2YgUkZDIDM0OTIuXG5cdCAqIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNDkyI3NlY3Rpb24tMy40XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBhZGFwdChkZWx0YSwgbnVtUG9pbnRzLCBmaXJzdFRpbWUpIHtcblx0XHR2YXIgayA9IDA7XG5cdFx0ZGVsdGEgPSBmaXJzdFRpbWUgPyBmbG9vcihkZWx0YSAvIGRhbXApIDogZGVsdGEgPj4gMTtcblx0XHRkZWx0YSArPSBmbG9vcihkZWx0YSAvIG51bVBvaW50cyk7XG5cdFx0Zm9yICgvKiBubyBpbml0aWFsaXphdGlvbiAqLzsgZGVsdGEgPiBiYXNlTWludXNUTWluICogdE1heCA+PiAxOyBrICs9IGJhc2UpIHtcblx0XHRcdGRlbHRhID0gZmxvb3IoZGVsdGEgLyBiYXNlTWludXNUTWluKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZsb29yKGsgKyAoYmFzZU1pbnVzVE1pbiArIDEpICogZGVsdGEgLyAoZGVsdGEgKyBza2V3KSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzIHRvIGEgc3RyaW5nIG9mIFVuaWNvZGVcblx0ICogc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdFx0Ly8gRG9uJ3QgdXNlIFVDUy0yXG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aCxcblx0XHQgICAgb3V0LFxuXHRcdCAgICBpID0gMCxcblx0XHQgICAgbiA9IGluaXRpYWxOLFxuXHRcdCAgICBiaWFzID0gaW5pdGlhbEJpYXMsXG5cdFx0ICAgIGJhc2ljLFxuXHRcdCAgICBqLFxuXHRcdCAgICBpbmRleCxcblx0XHQgICAgb2xkaSxcblx0XHQgICAgdyxcblx0XHQgICAgayxcblx0XHQgICAgZGlnaXQsXG5cdFx0ICAgIHQsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBiYXNlTWludXNUO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50czogbGV0IGBiYXNpY2AgYmUgdGhlIG51bWJlciBvZiBpbnB1dCBjb2RlXG5cdFx0Ly8gcG9pbnRzIGJlZm9yZSB0aGUgbGFzdCBkZWxpbWl0ZXIsIG9yIGAwYCBpZiB0aGVyZSBpcyBub25lLCB0aGVuIGNvcHlcblx0XHQvLyB0aGUgZmlyc3QgYmFzaWMgY29kZSBwb2ludHMgdG8gdGhlIG91dHB1dC5cblxuXHRcdGJhc2ljID0gaW5wdXQubGFzdEluZGV4T2YoZGVsaW1pdGVyKTtcblx0XHRpZiAoYmFzaWMgPCAwKSB7XG5cdFx0XHRiYXNpYyA9IDA7XG5cdFx0fVxuXG5cdFx0Zm9yIChqID0gMDsgaiA8IGJhc2ljOyArK2opIHtcblx0XHRcdC8vIGlmIGl0J3Mgbm90IGEgYmFzaWMgY29kZSBwb2ludFxuXHRcdFx0aWYgKGlucHV0LmNoYXJDb2RlQXQoaikgPj0gMHg4MCkge1xuXHRcdFx0XHRlcnJvcignbm90LWJhc2ljJyk7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQucHVzaChpbnB1dC5jaGFyQ29kZUF0KGopKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGRlY29kaW5nIGxvb3A6IHN0YXJ0IGp1c3QgYWZ0ZXIgdGhlIGxhc3QgZGVsaW1pdGVyIGlmIGFueSBiYXNpYyBjb2RlXG5cdFx0Ly8gcG9pbnRzIHdlcmUgY29waWVkOyBzdGFydCBhdCB0aGUgYmVnaW5uaW5nIG90aGVyd2lzZS5cblxuXHRcdGZvciAoaW5kZXggPSBiYXNpYyA+IDAgPyBiYXNpYyArIDEgOiAwOyBpbmRleCA8IGlucHV0TGVuZ3RoOyAvKiBubyBmaW5hbCBleHByZXNzaW9uICovKSB7XG5cblx0XHRcdC8vIGBpbmRleGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IGNoYXJhY3RlciB0byBiZSBjb25zdW1lZC5cblx0XHRcdC8vIERlY29kZSBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyIGludG8gYGRlbHRhYCxcblx0XHRcdC8vIHdoaWNoIGdldHMgYWRkZWQgdG8gYGlgLiBUaGUgb3ZlcmZsb3cgY2hlY2tpbmcgaXMgZWFzaWVyXG5cdFx0XHQvLyBpZiB3ZSBpbmNyZWFzZSBgaWAgYXMgd2UgZ28sIHRoZW4gc3VidHJhY3Qgb2ZmIGl0cyBzdGFydGluZ1xuXHRcdFx0Ly8gdmFsdWUgYXQgdGhlIGVuZCB0byBvYnRhaW4gYGRlbHRhYC5cblx0XHRcdGZvciAob2xkaSA9IGksIHcgPSAxLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblxuXHRcdFx0XHRpZiAoaW5kZXggPj0gaW5wdXRMZW5ndGgpIHtcblx0XHRcdFx0XHRlcnJvcignaW52YWxpZC1pbnB1dCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGlnaXQgPSBiYXNpY1RvRGlnaXQoaW5wdXQuY2hhckNvZGVBdChpbmRleCsrKSk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0ID49IGJhc2UgfHwgZGlnaXQgPiBmbG9vcigobWF4SW50IC0gaSkgLyB3KSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aSArPSBkaWdpdCAqIHc7XG5cdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA8IHQpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0aWYgKHcgPiBmbG9vcihtYXhJbnQgLyBiYXNlTWludXNUKSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dyAqPSBiYXNlTWludXNUO1xuXG5cdFx0XHR9XG5cblx0XHRcdG91dCA9IG91dHB1dC5sZW5ndGggKyAxO1xuXHRcdFx0YmlhcyA9IGFkYXB0KGkgLSBvbGRpLCBvdXQsIG9sZGkgPT0gMCk7XG5cblx0XHRcdC8vIGBpYCB3YXMgc3VwcG9zZWQgdG8gd3JhcCBhcm91bmQgZnJvbSBgb3V0YCB0byBgMGAsXG5cdFx0XHQvLyBpbmNyZW1lbnRpbmcgYG5gIGVhY2ggdGltZSwgc28gd2UnbGwgZml4IHRoYXQgbm93OlxuXHRcdFx0aWYgKGZsb29yKGkgLyBvdXQpID4gbWF4SW50IC0gbikge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0biArPSBmbG9vcihpIC8gb3V0KTtcblx0XHRcdGkgJT0gb3V0O1xuXG5cdFx0XHQvLyBJbnNlcnQgYG5gIGF0IHBvc2l0aW9uIGBpYCBvZiB0aGUgb3V0cHV0XG5cdFx0XHRvdXRwdXQuc3BsaWNlKGkrKywgMCwgbik7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdWNzMmVuY29kZShvdXRwdXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scyAoZS5nLiBhIGRvbWFpbiBuYW1lIGxhYmVsKSB0byBhXG5cdCAqIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGVuY29kZShpbnB1dCkge1xuXHRcdHZhciBuLFxuXHRcdCAgICBkZWx0YSxcblx0XHQgICAgaGFuZGxlZENQQ291bnQsXG5cdFx0ICAgIGJhc2ljTGVuZ3RoLFxuXHRcdCAgICBiaWFzLFxuXHRcdCAgICBqLFxuXHRcdCAgICBtLFxuXHRcdCAgICBxLFxuXHRcdCAgICBrLFxuXHRcdCAgICB0LFxuXHRcdCAgICBjdXJyZW50VmFsdWUsXG5cdFx0ICAgIG91dHB1dCA9IFtdLFxuXHRcdCAgICAvKiogYGlucHV0TGVuZ3RoYCB3aWxsIGhvbGQgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyBpbiBgaW5wdXRgLiAqL1xuXHRcdCAgICBpbnB1dExlbmd0aCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50UGx1c09uZSxcblx0XHQgICAgYmFzZU1pbnVzVCxcblx0XHQgICAgcU1pbnVzVDtcblxuXHRcdC8vIENvbnZlcnQgdGhlIGlucHV0IGluIFVDUy0yIHRvIFVuaWNvZGVcblx0XHRpbnB1dCA9IHVjczJkZWNvZGUoaW5wdXQpO1xuXG5cdFx0Ly8gQ2FjaGUgdGhlIGxlbmd0aFxuXHRcdGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSB0aGUgc3RhdGVcblx0XHRuID0gaW5pdGlhbE47XG5cdFx0ZGVsdGEgPSAwO1xuXHRcdGJpYXMgPSBpbml0aWFsQmlhcztcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHNcblx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgMHg4MCkge1xuXHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoY3VycmVudFZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aGFuZGxlZENQQ291bnQgPSBiYXNpY0xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG5cblx0XHQvLyBgaGFuZGxlZENQQ291bnRgIGlzIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgdGhhdCBoYXZlIGJlZW4gaGFuZGxlZDtcblx0XHQvLyBgYmFzaWNMZW5ndGhgIGlzIHRoZSBudW1iZXIgb2YgYmFzaWMgY29kZSBwb2ludHMuXG5cblx0XHQvLyBGaW5pc2ggdGhlIGJhc2ljIHN0cmluZyAtIGlmIGl0IGlzIG5vdCBlbXB0eSAtIHdpdGggYSBkZWxpbWl0ZXJcblx0XHRpZiAoYmFzaWNMZW5ndGgpIHtcblx0XHRcdG91dHB1dC5wdXNoKGRlbGltaXRlcik7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBlbmNvZGluZyBsb29wOlxuXHRcdHdoaWxlIChoYW5kbGVkQ1BDb3VudCA8IGlucHV0TGVuZ3RoKSB7XG5cblx0XHRcdC8vIEFsbCBub24tYmFzaWMgY29kZSBwb2ludHMgPCBuIGhhdmUgYmVlbiBoYW5kbGVkIGFscmVhZHkuIEZpbmQgdGhlIG5leHRcblx0XHRcdC8vIGxhcmdlciBvbmU6XG5cdFx0XHRmb3IgKG0gPSBtYXhJbnQsIGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA+PSBuICYmIGN1cnJlbnRWYWx1ZSA8IG0pIHtcblx0XHRcdFx0XHRtID0gY3VycmVudFZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluY3JlYXNlIGBkZWx0YWAgZW5vdWdoIHRvIGFkdmFuY2UgdGhlIGRlY29kZXIncyA8bixpPiBzdGF0ZSB0byA8bSwwPixcblx0XHRcdC8vIGJ1dCBndWFyZCBhZ2FpbnN0IG92ZXJmbG93XG5cdFx0XHRoYW5kbGVkQ1BDb3VudFBsdXNPbmUgPSBoYW5kbGVkQ1BDb3VudCArIDE7XG5cdFx0XHRpZiAobSAtIG4gPiBmbG9vcigobWF4SW50IC0gZGVsdGEpIC8gaGFuZGxlZENQQ291bnRQbHVzT25lKSkge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0ZGVsdGEgKz0gKG0gLSBuKSAqIGhhbmRsZWRDUENvdW50UGx1c09uZTtcblx0XHRcdG4gPSBtO1xuXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgbiAmJiArK2RlbHRhID4gbWF4SW50KSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID09IG4pIHtcblx0XHRcdFx0XHQvLyBSZXByZXNlbnQgZGVsdGEgYXMgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlclxuXHRcdFx0XHRcdGZvciAocSA9IGRlbHRhLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblx0XHRcdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXHRcdFx0XHRcdFx0aWYgKHEgPCB0KSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cU1pbnVzVCA9IHEgLSB0O1xuXHRcdFx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRcdFx0b3V0cHV0LnB1c2goXG5cdFx0XHRcdFx0XHRcdHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWModCArIHFNaW51c1QgJSBiYXNlTWludXNULCAwKSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRxID0gZmxvb3IocU1pbnVzVCAvIGJhc2VNaW51c1QpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWMocSwgMCkpKTtcblx0XHRcdFx0XHRiaWFzID0gYWRhcHQoZGVsdGEsIGhhbmRsZWRDUENvdW50UGx1c09uZSwgaGFuZGxlZENQQ291bnQgPT0gYmFzaWNMZW5ndGgpO1xuXHRcdFx0XHRcdGRlbHRhID0gMDtcblx0XHRcdFx0XHQrK2hhbmRsZWRDUENvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdCsrZGVsdGE7XG5cdFx0XHQrK247XG5cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dC5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzXG5cdCAqIHRvIFVuaWNvZGUuIE9ubHkgdGhlIFB1bnljb2RlZCBwYXJ0cyBvZiB0aGUgaW5wdXQgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS5cblx0ICogaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuXG5cdCAqIGNvbnZlcnRlZCB0byBVbmljb2RlLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZWQgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBjb252ZXJ0IHRvIFVuaWNvZGUuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuXHQgKiBzdHJpbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b1VuaWNvZGUoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleFB1bnljb2RlLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/IGRlY29kZShzdHJpbmcuc2xpY2UoNCkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIFB1bnljb2RlLiBPbmx5IHRoZSBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLFxuXHQgKiBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCdzIGFscmVhZHkgaW5cblx0ICogQVNDSUkuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG8gY29udmVydCwgYXMgYVxuXHQgKiBVbmljb2RlIHN0cmluZy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFB1bnljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkb21haW4gbmFtZSBvclxuXHQgKiBlbWFpbCBhZGRyZXNzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9BU0NJSShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4Tm9uQVNDSUkudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gJ3huLS0nICsgZW5jb2RlKHN0cmluZylcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKiogRGVmaW5lIHRoZSBwdWJsaWMgQVBJICovXG5cdHB1bnljb2RlID0ge1xuXHRcdC8qKlxuXHRcdCAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBQdW55Y29kZS5qcyB2ZXJzaW9uIG51bWJlci5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKi9cblx0XHQndmVyc2lvbic6ICcxLjQuMScsXG5cdFx0LyoqXG5cdFx0ICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcblx0XHQgKiByZXByZXNlbnRhdGlvbiAoVUNTLTIpIHRvIFVuaWNvZGUgY29kZSBwb2ludHMsIGFuZCBiYWNrLlxuXHRcdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIE9iamVjdFxuXHRcdCAqL1xuXHRcdCd1Y3MyJzoge1xuXHRcdFx0J2RlY29kZSc6IHVjczJkZWNvZGUsXG5cdFx0XHQnZW5jb2RlJzogdWNzMmVuY29kZVxuXHRcdH0sXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCd0b0FTQ0lJJzogdG9BU0NJSSxcblx0XHQndG9Vbmljb2RlJzogdG9Vbmljb2RlXG5cdH07XG5cblx0LyoqIEV4cG9zZSBgcHVueWNvZGVgICovXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKCdwdW55Y29kZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHB1bnljb2RlO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUpIHtcblx0XHRpZiAobW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMpIHtcblx0XHRcdC8vIGluIE5vZGUuanMsIGlvLmpzLCBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHB1bnljb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yIChrZXkgaW4gcHVueWNvZGUpIHtcblx0XHRcdFx0cHVueWNvZGUuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IHB1bnljb2RlW2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5wdW55Y29kZSA9IHB1bnljb2RlO1xuXHR9XG5cbn0odGhpcykpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gSWYgb2JqLmhhc093blByb3BlcnR5IGhhcyBiZWVuIG92ZXJyaWRkZW4sIHRoZW4gY2FsbGluZ1xuLy8gb2JqLmhhc093blByb3BlcnR5KHByb3ApIHdpbGwgYnJlYWsuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvMTcwN1xuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxcywgc2VwLCBlcSwgb3B0aW9ucykge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGlmICh0eXBlb2YgcXMgIT09ICdzdHJpbmcnIHx8IHFzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gL1xcKy9nO1xuICBxcyA9IHFzLnNwbGl0KHNlcCk7XG5cbiAgdmFyIG1heEtleXMgPSAxMDAwO1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tYXhLZXlzID09PSAnbnVtYmVyJykge1xuICAgIG1heEtleXMgPSBvcHRpb25zLm1heEtleXM7XG4gIH1cblxuICB2YXIgbGVuID0gcXMubGVuZ3RoO1xuICAvLyBtYXhLZXlzIDw9IDAgbWVhbnMgdGhhdCB3ZSBzaG91bGQgbm90IGxpbWl0IGtleXMgY291bnRcbiAgaWYgKG1heEtleXMgPiAwICYmIGxlbiA+IG1heEtleXMpIHtcbiAgICBsZW4gPSBtYXhLZXlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciB4ID0gcXNbaV0ucmVwbGFjZShyZWdleHAsICclMjAnKSxcbiAgICAgICAgaWR4ID0geC5pbmRleE9mKGVxKSxcbiAgICAgICAga3N0ciwgdnN0ciwgaywgdjtcblxuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAga3N0ciA9IHguc3Vic3RyKDAsIGlkeCk7XG4gICAgICB2c3RyID0geC5zdWJzdHIoaWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtzdHIgPSB4O1xuICAgICAgdnN0ciA9ICcnO1xuICAgIH1cblxuICAgIGsgPSBkZWNvZGVVUklDb21wb25lbnQoa3N0cik7XG4gICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudCh2c3RyKTtcblxuICAgIGlmICghaGFzT3duUHJvcGVydHkob2JqLCBrKSkge1xuICAgICAgb2JqW2tdID0gdjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgb2JqW2tdLnB1c2godik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ialtrXSA9IFtvYmpba10sIHZdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlQcmltaXRpdmUgPSBmdW5jdGlvbih2KSB7XG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHY7XG5cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2ID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNGaW5pdGUodikgPyB2IDogJyc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgc2VwLCBlcSwgbmFtZSkge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtYXAob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihrKSB7XG4gICAgICB2YXIga3MgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKGspKSArIGVxO1xuICAgICAgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgICByZXR1cm4gbWFwKG9ialtrXSwgZnVuY3Rpb24odikge1xuICAgICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUodikpO1xuICAgICAgICB9KS5qb2luKHNlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9ialtrXSkpO1xuICAgICAgfVxuICAgIH0pLmpvaW4oc2VwKTtcblxuICB9XG5cbiAgaWYgKCFuYW1lKSByZXR1cm4gJyc7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG5hbWUpKSArIGVxICtcbiAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqKSk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmRlY29kZSA9IGV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuZXhwb3J0cy5lbmNvZGUgPSBleHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG4iLCJmdW5jdGlvbiBSYXZlbkNvbmZpZ0Vycm9yKG1lc3NhZ2UpIHtcbiAgdGhpcy5uYW1lID0gJ1JhdmVuQ29uZmlnRXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuUmF2ZW5Db25maWdFcnJvci5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblJhdmVuQ29uZmlnRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmF2ZW5Db25maWdFcnJvcjtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXZlbkNvbmZpZ0Vycm9yO1xuIiwidmFyIHdyYXBNZXRob2QgPSBmdW5jdGlvbihjb25zb2xlLCBsZXZlbCwgY2FsbGJhY2spIHtcbiAgdmFyIG9yaWdpbmFsQ29uc29sZUxldmVsID0gY29uc29sZVtsZXZlbF07XG4gIHZhciBvcmlnaW5hbENvbnNvbGUgPSBjb25zb2xlO1xuXG4gIGlmICghKGxldmVsIGluIGNvbnNvbGUpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHNlbnRyeUxldmVsID0gbGV2ZWwgPT09ICd3YXJuJyA/ICd3YXJuaW5nJyA6IGxldmVsO1xuXG4gIGNvbnNvbGVbbGV2ZWxdID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgICB2YXIgbXNnID0gJycgKyBhcmdzLmpvaW4oJyAnKTtcbiAgICB2YXIgZGF0YSA9IHtsZXZlbDogc2VudHJ5TGV2ZWwsIGxvZ2dlcjogJ2NvbnNvbGUnLCBleHRyYToge2FyZ3VtZW50czogYXJnc319O1xuXG4gICAgaWYgKGxldmVsID09PSAnYXNzZXJ0Jykge1xuICAgICAgaWYgKGFyZ3NbMF0gPT09IGZhbHNlKSB7XG4gICAgICAgIC8vIERlZmF1bHQgYnJvd3NlcnMgbWVzc2FnZVxuICAgICAgICBtc2cgPSAnQXNzZXJ0aW9uIGZhaWxlZDogJyArIChhcmdzLnNsaWNlKDEpLmpvaW4oJyAnKSB8fCAnY29uc29sZS5hc3NlcnQnKTtcbiAgICAgICAgZGF0YS5leHRyYS5hcmd1bWVudHMgPSBhcmdzLnNsaWNlKDEpO1xuICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhtc2csIGRhdGEpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhtc2csIGRhdGEpO1xuICAgIH1cblxuICAgIC8vIHRoaXMgZmFpbHMgZm9yIHNvbWUgYnJvd3NlcnMuIDooXG4gICAgaWYgKG9yaWdpbmFsQ29uc29sZUxldmVsKSB7XG4gICAgICAvLyBJRTkgZG9lc24ndCBhbGxvdyBjYWxsaW5nIGFwcGx5IG9uIGNvbnNvbGUgZnVuY3Rpb25zIGRpcmVjdGx5XG4gICAgICAvLyBTZWU6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU0NzI5MzgvZG9lcy1pZTktc3VwcG9ydC1jb25zb2xlLWxvZy1hbmQtaXMtaXQtYS1yZWFsLWZ1bmN0aW9uI2Fuc3dlci01NDczMTkzXG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChvcmlnaW5hbENvbnNvbGVMZXZlbCwgb3JpZ2luYWxDb25zb2xlLCBhcmdzKTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgd3JhcE1ldGhvZDogd3JhcE1ldGhvZFxufTtcbiIsIi8qZ2xvYmFsIFhEb21haW5SZXF1ZXN0OmZhbHNlICovXG5cbnZhciBUcmFjZUtpdCA9IHJlcXVpcmUoJy4uL3ZlbmRvci9UcmFjZUtpdC90cmFjZWtpdCcpO1xudmFyIHN0cmluZ2lmeSA9IHJlcXVpcmUoJy4uL3ZlbmRvci9qc29uLXN0cmluZ2lmeS1zYWZlL3N0cmluZ2lmeScpO1xudmFyIFJhdmVuQ29uZmlnRXJyb3IgPSByZXF1aXJlKCcuL2NvbmZpZ0Vycm9yJyk7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBpc0Vycm9yID0gdXRpbHMuaXNFcnJvcjtcbnZhciBpc09iamVjdCA9IHV0aWxzLmlzT2JqZWN0O1xudmFyIGlzRXJyb3JFdmVudCA9IHV0aWxzLmlzRXJyb3JFdmVudDtcbnZhciBpc1VuZGVmaW5lZCA9IHV0aWxzLmlzVW5kZWZpbmVkO1xudmFyIGlzRnVuY3Rpb24gPSB1dGlscy5pc0Z1bmN0aW9uO1xudmFyIGlzU3RyaW5nID0gdXRpbHMuaXNTdHJpbmc7XG52YXIgaXNBcnJheSA9IHV0aWxzLmlzQXJyYXk7XG52YXIgaXNFbXB0eU9iamVjdCA9IHV0aWxzLmlzRW1wdHlPYmplY3Q7XG52YXIgZWFjaCA9IHV0aWxzLmVhY2g7XG52YXIgb2JqZWN0TWVyZ2UgPSB1dGlscy5vYmplY3RNZXJnZTtcbnZhciB0cnVuY2F0ZSA9IHV0aWxzLnRydW5jYXRlO1xudmFyIG9iamVjdEZyb3plbiA9IHV0aWxzLm9iamVjdEZyb3plbjtcbnZhciBoYXNLZXkgPSB1dGlscy5oYXNLZXk7XG52YXIgam9pblJlZ0V4cCA9IHV0aWxzLmpvaW5SZWdFeHA7XG52YXIgdXJsZW5jb2RlID0gdXRpbHMudXJsZW5jb2RlO1xudmFyIHV1aWQ0ID0gdXRpbHMudXVpZDQ7XG52YXIgaHRtbFRyZWVBc1N0cmluZyA9IHV0aWxzLmh0bWxUcmVlQXNTdHJpbmc7XG52YXIgaXNTYW1lRXhjZXB0aW9uID0gdXRpbHMuaXNTYW1lRXhjZXB0aW9uO1xudmFyIGlzU2FtZVN0YWNrdHJhY2UgPSB1dGlscy5pc1NhbWVTdGFja3RyYWNlO1xudmFyIHBhcnNlVXJsID0gdXRpbHMucGFyc2VVcmw7XG52YXIgZmlsbCA9IHV0aWxzLmZpbGw7XG5cbnZhciB3cmFwQ29uc29sZU1ldGhvZCA9IHJlcXVpcmUoJy4vY29uc29sZScpLndyYXBNZXRob2Q7XG5cbnZhciBkc25LZXlzID0gJ3NvdXJjZSBwcm90b2NvbCB1c2VyIHBhc3MgaG9zdCBwb3J0IHBhdGgnLnNwbGl0KCcgJyksXG4gIGRzblBhdHRlcm4gPSAvXig/OihcXHcrKTopP1xcL1xcLyg/OihcXHcrKSg6XFx3Kyk/QCk/KFtcXHdcXC4tXSspKD86OihcXGQrKSk/KFxcLy4qKS87XG5cbmZ1bmN0aW9uIG5vdygpIHtcbiAgcmV0dXJuICtuZXcgRGF0ZSgpO1xufVxuXG4vLyBUaGlzIGlzIHRvIGJlIGRlZmVuc2l2ZSBpbiBlbnZpcm9ubWVudHMgd2hlcmUgd2luZG93IGRvZXMgbm90IGV4aXN0IChzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dldHNlbnRyeS9yYXZlbi1qcy9wdWxsLzc4NSlcbnZhciBfd2luZG93ID1cbiAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IHdpbmRvd1xuICAgIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDoge307XG52YXIgX2RvY3VtZW50ID0gX3dpbmRvdy5kb2N1bWVudDtcbnZhciBfbmF2aWdhdG9yID0gX3dpbmRvdy5uYXZpZ2F0b3I7XG5cbmZ1bmN0aW9uIGtlZXBPcmlnaW5hbENhbGxiYWNrKG9yaWdpbmFsLCBjYWxsYmFjaykge1xuICByZXR1cm4gaXNGdW5jdGlvbihjYWxsYmFjaylcbiAgICA/IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGRhdGEsIG9yaWdpbmFsKTtcbiAgICAgIH1cbiAgICA6IGNhbGxiYWNrO1xufVxuXG4vLyBGaXJzdCwgY2hlY2sgZm9yIEpTT04gc3VwcG9ydFxuLy8gSWYgdGhlcmUgaXMgbm8gSlNPTiwgd2Ugbm8tb3AgdGhlIGNvcmUgZmVhdHVyZXMgb2YgUmF2ZW5cbi8vIHNpbmNlIEpTT04gaXMgcmVxdWlyZWQgdG8gZW5jb2RlIHRoZSBwYXlsb2FkXG5mdW5jdGlvbiBSYXZlbigpIHtcbiAgdGhpcy5faGFzSlNPTiA9ICEhKHR5cGVvZiBKU09OID09PSAnb2JqZWN0JyAmJiBKU09OLnN0cmluZ2lmeSk7XG4gIC8vIFJhdmVuIGNhbiBydW4gaW4gY29udGV4dHMgd2hlcmUgdGhlcmUncyBubyBkb2N1bWVudCAocmVhY3QtbmF0aXZlKVxuICB0aGlzLl9oYXNEb2N1bWVudCA9ICFpc1VuZGVmaW5lZChfZG9jdW1lbnQpO1xuICB0aGlzLl9oYXNOYXZpZ2F0b3IgPSAhaXNVbmRlZmluZWQoX25hdmlnYXRvcik7XG4gIHRoaXMuX2xhc3RDYXB0dXJlZEV4Y2VwdGlvbiA9IG51bGw7XG4gIHRoaXMuX2xhc3REYXRhID0gbnVsbDtcbiAgdGhpcy5fbGFzdEV2ZW50SWQgPSBudWxsO1xuICB0aGlzLl9nbG9iYWxTZXJ2ZXIgPSBudWxsO1xuICB0aGlzLl9nbG9iYWxLZXkgPSBudWxsO1xuICB0aGlzLl9nbG9iYWxQcm9qZWN0ID0gbnVsbDtcbiAgdGhpcy5fZ2xvYmFsQ29udGV4dCA9IHt9O1xuICB0aGlzLl9nbG9iYWxPcHRpb25zID0ge1xuICAgIGxvZ2dlcjogJ2phdmFzY3JpcHQnLFxuICAgIGlnbm9yZUVycm9yczogW10sXG4gICAgaWdub3JlVXJsczogW10sXG4gICAgd2hpdGVsaXN0VXJsczogW10sXG4gICAgaW5jbHVkZVBhdGhzOiBbXSxcbiAgICBjb2xsZWN0V2luZG93RXJyb3JzOiB0cnVlLFxuICAgIG1heE1lc3NhZ2VMZW5ndGg6IDAsXG5cbiAgICAvLyBCeSBkZWZhdWx0LCB0cnVuY2F0ZXMgVVJMIHZhbHVlcyB0byAyNTAgY2hhcnNcbiAgICBtYXhVcmxMZW5ndGg6IDI1MCxcbiAgICBzdGFja1RyYWNlTGltaXQ6IDUwLFxuICAgIGF1dG9CcmVhZGNydW1iczogdHJ1ZSxcbiAgICBpbnN0cnVtZW50OiB0cnVlLFxuICAgIHNhbXBsZVJhdGU6IDFcbiAgfTtcbiAgdGhpcy5faWdub3JlT25FcnJvciA9IDA7XG4gIHRoaXMuX2lzUmF2ZW5JbnN0YWxsZWQgPSBmYWxzZTtcbiAgdGhpcy5fb3JpZ2luYWxFcnJvclN0YWNrVHJhY2VMaW1pdCA9IEVycm9yLnN0YWNrVHJhY2VMaW1pdDtcbiAgLy8gY2FwdHVyZSByZWZlcmVuY2VzIHRvIHdpbmRvdy5jb25zb2xlICphbmQqIGFsbCBpdHMgbWV0aG9kcyBmaXJzdFxuICAvLyBiZWZvcmUgdGhlIGNvbnNvbGUgcGx1Z2luIGhhcyBhIGNoYW5jZSB0byBtb25rZXkgcGF0Y2hcbiAgdGhpcy5fb3JpZ2luYWxDb25zb2xlID0gX3dpbmRvdy5jb25zb2xlIHx8IHt9O1xuICB0aGlzLl9vcmlnaW5hbENvbnNvbGVNZXRob2RzID0ge307XG4gIHRoaXMuX3BsdWdpbnMgPSBbXTtcbiAgdGhpcy5fc3RhcnRUaW1lID0gbm93KCk7XG4gIHRoaXMuX3dyYXBwZWRCdWlsdElucyA9IFtdO1xuICB0aGlzLl9icmVhZGNydW1icyA9IFtdO1xuICB0aGlzLl9sYXN0Q2FwdHVyZWRFdmVudCA9IG51bGw7XG4gIHRoaXMuX2tleXByZXNzVGltZW91dDtcbiAgdGhpcy5fbG9jYXRpb24gPSBfd2luZG93LmxvY2F0aW9uO1xuICB0aGlzLl9sYXN0SHJlZiA9IHRoaXMuX2xvY2F0aW9uICYmIHRoaXMuX2xvY2F0aW9uLmhyZWY7XG4gIHRoaXMuX3Jlc2V0QmFja29mZigpO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBndWFyZC1mb3ItaW5cbiAgZm9yICh2YXIgbWV0aG9kIGluIHRoaXMuX29yaWdpbmFsQ29uc29sZSkge1xuICAgIHRoaXMuX29yaWdpbmFsQ29uc29sZU1ldGhvZHNbbWV0aG9kXSA9IHRoaXMuX29yaWdpbmFsQ29uc29sZVttZXRob2RdO1xuICB9XG59XG5cbi8qXG4gKiBUaGUgY29yZSBSYXZlbiBzaW5nbGV0b25cbiAqXG4gKiBAdGhpcyB7UmF2ZW59XG4gKi9cblxuUmF2ZW4ucHJvdG90eXBlID0ge1xuICAvLyBIYXJkY29kZSB2ZXJzaW9uIHN0cmluZyBzbyB0aGF0IHJhdmVuIHNvdXJjZSBjYW4gYmUgbG9hZGVkIGRpcmVjdGx5IHZpYVxuICAvLyB3ZWJwYWNrICh1c2luZyBhIGJ1aWxkIHN0ZXAgY2F1c2VzIHdlYnBhY2sgIzE2MTcpLiBHcnVudCB2ZXJpZmllcyB0aGF0XG4gIC8vIHRoaXMgdmFsdWUgbWF0Y2hlcyBwYWNrYWdlLmpzb24gZHVyaW5nIGJ1aWxkLlxuICAvLyAgIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2dldHNlbnRyeS9yYXZlbi1qcy9pc3N1ZXMvNDY1XG4gIFZFUlNJT046ICczLjIwLjEnLFxuXG4gIGRlYnVnOiBmYWxzZSxcblxuICBUcmFjZUtpdDogVHJhY2VLaXQsIC8vIGFsaWFzIHRvIFRyYWNlS2l0XG5cbiAgLypcbiAgICAgKiBDb25maWd1cmUgUmF2ZW4gd2l0aCBhIERTTiBhbmQgZXh0cmEgb3B0aW9uc1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRzbiBUaGUgcHVibGljIFNlbnRyeSBEU05cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBTZXQgb2YgZ2xvYmFsIG9wdGlvbnMgW29wdGlvbmFsXVxuICAgICAqIEByZXR1cm4ge1JhdmVufVxuICAgICAqL1xuICBjb25maWc6IGZ1bmN0aW9uKGRzbiwgb3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmIChzZWxmLl9nbG9iYWxTZXJ2ZXIpIHtcbiAgICAgIHRoaXMuX2xvZ0RlYnVnKCdlcnJvcicsICdFcnJvcjogUmF2ZW4gaGFzIGFscmVhZHkgYmVlbiBjb25maWd1cmVkJyk7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG4gICAgaWYgKCFkc24pIHJldHVybiBzZWxmO1xuXG4gICAgdmFyIGdsb2JhbE9wdGlvbnMgPSBzZWxmLl9nbG9iYWxPcHRpb25zO1xuXG4gICAgLy8gbWVyZ2UgaW4gb3B0aW9uc1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBlYWNoKG9wdGlvbnMsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgLy8gdGFncyBhbmQgZXh0cmEgYXJlIHNwZWNpYWwgYW5kIG5lZWQgdG8gYmUgcHV0IGludG8gY29udGV4dFxuICAgICAgICBpZiAoa2V5ID09PSAndGFncycgfHwga2V5ID09PSAnZXh0cmEnIHx8IGtleSA9PT0gJ3VzZXInKSB7XG4gICAgICAgICAgc2VsZi5fZ2xvYmFsQ29udGV4dFtrZXldID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZ2xvYmFsT3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbGYuc2V0RFNOKGRzbik7XG5cbiAgICAvLyBcIlNjcmlwdCBlcnJvci5cIiBpcyBoYXJkIGNvZGVkIGludG8gYnJvd3NlcnMgZm9yIGVycm9ycyB0aGF0IGl0IGNhbid0IHJlYWQuXG4gICAgLy8gdGhpcyBpcyB0aGUgcmVzdWx0IG9mIGEgc2NyaXB0IGJlaW5nIHB1bGxlZCBpbiBmcm9tIGFuIGV4dGVybmFsIGRvbWFpbiBhbmQgQ09SUy5cbiAgICBnbG9iYWxPcHRpb25zLmlnbm9yZUVycm9ycy5wdXNoKC9eU2NyaXB0IGVycm9yXFwuPyQvKTtcbiAgICBnbG9iYWxPcHRpb25zLmlnbm9yZUVycm9ycy5wdXNoKC9eSmF2YXNjcmlwdCBlcnJvcjogU2NyaXB0IGVycm9yXFwuPyBvbiBsaW5lIDAkLyk7XG5cbiAgICAvLyBqb2luIHJlZ2V4cCBydWxlcyBpbnRvIG9uZSBiaWcgcnVsZVxuICAgIGdsb2JhbE9wdGlvbnMuaWdub3JlRXJyb3JzID0gam9pblJlZ0V4cChnbG9iYWxPcHRpb25zLmlnbm9yZUVycm9ycyk7XG4gICAgZ2xvYmFsT3B0aW9ucy5pZ25vcmVVcmxzID0gZ2xvYmFsT3B0aW9ucy5pZ25vcmVVcmxzLmxlbmd0aFxuICAgICAgPyBqb2luUmVnRXhwKGdsb2JhbE9wdGlvbnMuaWdub3JlVXJscylcbiAgICAgIDogZmFsc2U7XG4gICAgZ2xvYmFsT3B0aW9ucy53aGl0ZWxpc3RVcmxzID0gZ2xvYmFsT3B0aW9ucy53aGl0ZWxpc3RVcmxzLmxlbmd0aFxuICAgICAgPyBqb2luUmVnRXhwKGdsb2JhbE9wdGlvbnMud2hpdGVsaXN0VXJscylcbiAgICAgIDogZmFsc2U7XG4gICAgZ2xvYmFsT3B0aW9ucy5pbmNsdWRlUGF0aHMgPSBqb2luUmVnRXhwKGdsb2JhbE9wdGlvbnMuaW5jbHVkZVBhdGhzKTtcbiAgICBnbG9iYWxPcHRpb25zLm1heEJyZWFkY3J1bWJzID0gTWF0aC5tYXgoXG4gICAgICAwLFxuICAgICAgTWF0aC5taW4oZ2xvYmFsT3B0aW9ucy5tYXhCcmVhZGNydW1icyB8fCAxMDAsIDEwMClcbiAgICApOyAvLyBkZWZhdWx0IGFuZCBoYXJkIGxpbWl0IGlzIDEwMFxuXG4gICAgdmFyIGF1dG9CcmVhZGNydW1iRGVmYXVsdHMgPSB7XG4gICAgICB4aHI6IHRydWUsXG4gICAgICBjb25zb2xlOiB0cnVlLFxuICAgICAgZG9tOiB0cnVlLFxuICAgICAgbG9jYXRpb246IHRydWUsXG4gICAgICBzZW50cnk6IHRydWVcbiAgICB9O1xuXG4gICAgdmFyIGF1dG9CcmVhZGNydW1icyA9IGdsb2JhbE9wdGlvbnMuYXV0b0JyZWFkY3J1bWJzO1xuICAgIGlmICh7fS50b1N0cmluZy5jYWxsKGF1dG9CcmVhZGNydW1icykgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICBhdXRvQnJlYWRjcnVtYnMgPSBvYmplY3RNZXJnZShhdXRvQnJlYWRjcnVtYkRlZmF1bHRzLCBhdXRvQnJlYWRjcnVtYnMpO1xuICAgIH0gZWxzZSBpZiAoYXV0b0JyZWFkY3J1bWJzICE9PSBmYWxzZSkge1xuICAgICAgYXV0b0JyZWFkY3J1bWJzID0gYXV0b0JyZWFkY3J1bWJEZWZhdWx0cztcbiAgICB9XG4gICAgZ2xvYmFsT3B0aW9ucy5hdXRvQnJlYWRjcnVtYnMgPSBhdXRvQnJlYWRjcnVtYnM7XG5cbiAgICB2YXIgaW5zdHJ1bWVudERlZmF1bHRzID0ge1xuICAgICAgdHJ5Q2F0Y2g6IHRydWVcbiAgICB9O1xuXG4gICAgdmFyIGluc3RydW1lbnQgPSBnbG9iYWxPcHRpb25zLmluc3RydW1lbnQ7XG4gICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwoaW5zdHJ1bWVudCkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICBpbnN0cnVtZW50ID0gb2JqZWN0TWVyZ2UoaW5zdHJ1bWVudERlZmF1bHRzLCBpbnN0cnVtZW50KTtcbiAgICB9IGVsc2UgaWYgKGluc3RydW1lbnQgIT09IGZhbHNlKSB7XG4gICAgICBpbnN0cnVtZW50ID0gaW5zdHJ1bWVudERlZmF1bHRzO1xuICAgIH1cbiAgICBnbG9iYWxPcHRpb25zLmluc3RydW1lbnQgPSBpbnN0cnVtZW50O1xuXG4gICAgVHJhY2VLaXQuY29sbGVjdFdpbmRvd0Vycm9ycyA9ICEhZ2xvYmFsT3B0aW9ucy5jb2xsZWN0V2luZG93RXJyb3JzO1xuXG4gICAgLy8gcmV0dXJuIGZvciBjaGFpbmluZ1xuICAgIHJldHVybiBzZWxmO1xuICB9LFxuXG4gIC8qXG4gICAgICogSW5zdGFsbHMgYSBnbG9iYWwgd2luZG93Lm9uZXJyb3IgZXJyb3IgaGFuZGxlclxuICAgICAqIHRvIGNhcHR1cmUgYW5kIHJlcG9ydCB1bmNhdWdodCBleGNlcHRpb25zLlxuICAgICAqIEF0IHRoaXMgcG9pbnQsIGluc3RhbGwoKSBpcyByZXF1aXJlZCB0byBiZSBjYWxsZWQgZHVlXG4gICAgICogdG8gdGhlIHdheSBUcmFjZUtpdCBpcyBzZXQgdXAuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtSYXZlbn1cbiAgICAgKi9cbiAgaW5zdGFsbDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLmlzU2V0dXAoKSAmJiAhc2VsZi5faXNSYXZlbkluc3RhbGxlZCkge1xuICAgICAgVHJhY2VLaXQucmVwb3J0LnN1YnNjcmliZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5faGFuZGxlT25FcnJvclN0YWNrSW5mby5hcHBseShzZWxmLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX3BhdGNoRnVuY3Rpb25Ub1N0cmluZygpO1xuXG4gICAgICBpZiAoc2VsZi5fZ2xvYmFsT3B0aW9ucy5pbnN0cnVtZW50ICYmIHNlbGYuX2dsb2JhbE9wdGlvbnMuaW5zdHJ1bWVudC50cnlDYXRjaCkge1xuICAgICAgICBzZWxmLl9pbnN0cnVtZW50VHJ5Q2F0Y2goKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYuX2dsb2JhbE9wdGlvbnMuYXV0b0JyZWFkY3J1bWJzKSBzZWxmLl9pbnN0cnVtZW50QnJlYWRjcnVtYnMoKTtcblxuICAgICAgLy8gSW5zdGFsbCBhbGwgb2YgdGhlIHBsdWdpbnNcbiAgICAgIHNlbGYuX2RyYWluUGx1Z2lucygpO1xuXG4gICAgICBzZWxmLl9pc1JhdmVuSW5zdGFsbGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBFcnJvci5zdGFja1RyYWNlTGltaXQgPSBzZWxmLl9nbG9iYWxPcHRpb25zLnN0YWNrVHJhY2VMaW1pdDtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKlxuICAgICAqIFNldCB0aGUgRFNOIChjYW4gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWUgdW5saWtlIGNvbmZpZylcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkc24gVGhlIHB1YmxpYyBTZW50cnkgRFNOXG4gICAgICovXG4gIHNldERTTjogZnVuY3Rpb24oZHNuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdXJpID0gc2VsZi5fcGFyc2VEU04oZHNuKSxcbiAgICAgIGxhc3RTbGFzaCA9IHVyaS5wYXRoLmxhc3RJbmRleE9mKCcvJyksXG4gICAgICBwYXRoID0gdXJpLnBhdGguc3Vic3RyKDEsIGxhc3RTbGFzaCk7XG5cbiAgICBzZWxmLl9kc24gPSBkc247XG4gICAgc2VsZi5fZ2xvYmFsS2V5ID0gdXJpLnVzZXI7XG4gICAgc2VsZi5fZ2xvYmFsU2VjcmV0ID0gdXJpLnBhc3MgJiYgdXJpLnBhc3Muc3Vic3RyKDEpO1xuICAgIHNlbGYuX2dsb2JhbFByb2plY3QgPSB1cmkucGF0aC5zdWJzdHIobGFzdFNsYXNoICsgMSk7XG5cbiAgICBzZWxmLl9nbG9iYWxTZXJ2ZXIgPSBzZWxmLl9nZXRHbG9iYWxTZXJ2ZXIodXJpKTtcblxuICAgIHNlbGYuX2dsb2JhbEVuZHBvaW50ID1cbiAgICAgIHNlbGYuX2dsb2JhbFNlcnZlciArICcvJyArIHBhdGggKyAnYXBpLycgKyBzZWxmLl9nbG9iYWxQcm9qZWN0ICsgJy9zdG9yZS8nO1xuXG4gICAgLy8gUmVzZXQgYmFja29mZiBzdGF0ZSBzaW5jZSB3ZSBtYXkgYmUgcG9pbnRpbmcgYXQgYVxuICAgIC8vIG5ldyBwcm9qZWN0L3NlcnZlclxuICAgIHRoaXMuX3Jlc2V0QmFja29mZigpO1xuICB9LFxuXG4gIC8qXG4gICAgICogV3JhcCBjb2RlIHdpdGhpbiBhIGNvbnRleHQgc28gUmF2ZW4gY2FuIGNhcHR1cmUgZXJyb3JzXG4gICAgICogcmVsaWFibHkgYWNyb3NzIGRvbWFpbnMgdGhhdCBpcyBleGVjdXRlZCBpbW1lZGlhdGVseS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIEEgc3BlY2lmaWMgc2V0IG9mIG9wdGlvbnMgZm9yIHRoaXMgY29udGV4dCBbb3B0aW9uYWxdXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyBUaGUgY2FsbGJhY2sgdG8gYmUgaW1tZWRpYXRlbHkgZXhlY3V0ZWQgd2l0aGluIHRoZSBjb250ZXh0XG4gICAgICogQHBhcmFtIHthcnJheX0gYXJncyBBbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gYmUgY2FsbGVkIHdpdGggdGhlIGNhbGxiYWNrIFtvcHRpb25hbF1cbiAgICAgKi9cbiAgY29udGV4dDogZnVuY3Rpb24ob3B0aW9ucywgZnVuYywgYXJncykge1xuICAgIGlmIChpc0Z1bmN0aW9uKG9wdGlvbnMpKSB7XG4gICAgICBhcmdzID0gZnVuYyB8fCBbXTtcbiAgICAgIGZ1bmMgPSBvcHRpb25zO1xuICAgICAgb3B0aW9ucyA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy53cmFwKG9wdGlvbnMsIGZ1bmMpLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9LFxuXG4gIC8qXG4gICAgICogV3JhcCBjb2RlIHdpdGhpbiBhIGNvbnRleHQgYW5kIHJldHVybnMgYmFjayBhIG5ldyBmdW5jdGlvbiB0byBiZSBleGVjdXRlZFxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgQSBzcGVjaWZpYyBzZXQgb2Ygb3B0aW9ucyBmb3IgdGhpcyBjb250ZXh0IFtvcHRpb25hbF1cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBiZSB3cmFwcGVkIGluIGEgbmV3IGNvbnRleHRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIEEgZnVuY3Rpb24gdG8gY2FsbCBiZWZvcmUgdGhlIHRyeS9jYXRjaCB3cmFwcGVyIFtvcHRpb25hbCwgcHJpdmF0ZV1cbiAgICAgKiBAcmV0dXJuIHtmdW5jdGlvbn0gVGhlIG5ld2x5IHdyYXBwZWQgZnVuY3Rpb25zIHdpdGggYSBjb250ZXh0XG4gICAgICovXG4gIHdyYXA6IGZ1bmN0aW9uKG9wdGlvbnMsIGZ1bmMsIF9iZWZvcmUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy8gMSBhcmd1bWVudCBoYXMgYmVlbiBwYXNzZWQsIGFuZCBpdCdzIG5vdCBhIGZ1bmN0aW9uXG4gICAgLy8gc28ganVzdCByZXR1cm4gaXRcbiAgICBpZiAoaXNVbmRlZmluZWQoZnVuYykgJiYgIWlzRnVuY3Rpb24ob3B0aW9ucykpIHtcbiAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH1cblxuICAgIC8vIG9wdGlvbnMgaXMgb3B0aW9uYWxcbiAgICBpZiAoaXNGdW5jdGlvbihvcHRpb25zKSkge1xuICAgICAgZnVuYyA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIEF0IHRoaXMgcG9pbnQsIHdlJ3ZlIHBhc3NlZCBhbG9uZyAyIGFyZ3VtZW50cywgYW5kIHRoZSBzZWNvbmQgb25lXG4gICAgLy8gaXMgbm90IGEgZnVuY3Rpb24gZWl0aGVyLCBzbyB3ZSdsbCBqdXN0IHJldHVybiB0aGUgc2Vjb25kIGFyZ3VtZW50LlxuICAgIGlmICghaXNGdW5jdGlvbihmdW5jKSkge1xuICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgfVxuXG4gICAgLy8gV2UgZG9uJ3Qgd2FubmEgd3JhcCBpdCB0d2ljZSFcbiAgICB0cnkge1xuICAgICAgaWYgKGZ1bmMuX19yYXZlbl9fKSB7XG4gICAgICAgIHJldHVybiBmdW5jO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGlzIGhhcyBhbHJlYWR5IGJlZW4gd3JhcHBlZCBpbiB0aGUgcGFzdCwgcmV0dXJuIHRoYXRcbiAgICAgIGlmIChmdW5jLl9fcmF2ZW5fd3JhcHBlcl9fKSB7XG4gICAgICAgIHJldHVybiBmdW5jLl9fcmF2ZW5fd3JhcHBlcl9fO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIEp1c3QgYWNjZXNzaW5nIGN1c3RvbSBwcm9wcyBpbiBzb21lIFNlbGVuaXVtIGVudmlyb25tZW50c1xuICAgICAgLy8gY2FuIGNhdXNlIGEgXCJQZXJtaXNzaW9uIGRlbmllZFwiIGV4Y2VwdGlvbiAoc2VlIHJhdmVuLWpzIzQ5NSkuXG4gICAgICAvLyBCYWlsIG9uIHdyYXBwaW5nIGFuZCByZXR1cm4gdGhlIGZ1bmN0aW9uIGFzLWlzIChkZWZlcnMgdG8gd2luZG93Lm9uZXJyb3IpLlxuICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gd3JhcHBlZCgpIHtcbiAgICAgIHZhciBhcmdzID0gW10sXG4gICAgICAgIGkgPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgICBkZWVwID0gIW9wdGlvbnMgfHwgKG9wdGlvbnMgJiYgb3B0aW9ucy5kZWVwICE9PSBmYWxzZSk7XG5cbiAgICAgIGlmIChfYmVmb3JlICYmIGlzRnVuY3Rpb24oX2JlZm9yZSkpIHtcbiAgICAgICAgX2JlZm9yZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWN1cnNpdmVseSB3cmFwIGFsbCBvZiBhIGZ1bmN0aW9uJ3MgYXJndW1lbnRzIHRoYXQgYXJlXG4gICAgICAvLyBmdW5jdGlvbnMgdGhlbXNlbHZlcy5cbiAgICAgIHdoaWxlIChpLS0pIGFyZ3NbaV0gPSBkZWVwID8gc2VsZi53cmFwKG9wdGlvbnMsIGFyZ3VtZW50c1tpXSkgOiBhcmd1bWVudHNbaV07XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEF0dGVtcHQgdG8gaW52b2tlIHVzZXItbGFuZCBmdW5jdGlvblxuICAgICAgICAvLyBOT1RFOiBJZiB5b3UgYXJlIGEgU2VudHJ5IHVzZXIsIGFuZCB5b3UgYXJlIHNlZWluZyB0aGlzIHN0YWNrIGZyYW1lLCBpdFxuICAgICAgICAvLyAgICAgICBtZWFucyBSYXZlbiBjYXVnaHQgYW4gZXJyb3IgaW52b2tpbmcgeW91ciBhcHBsaWNhdGlvbiBjb2RlLiBUaGlzIGlzXG4gICAgICAgIC8vICAgICAgIGV4cGVjdGVkIGJlaGF2aW9yIGFuZCBOT1QgaW5kaWNhdGl2ZSBvZiBhIGJ1ZyB3aXRoIFJhdmVuLmpzLlxuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2VsZi5faWdub3JlTmV4dE9uRXJyb3IoKTtcbiAgICAgICAgc2VsZi5jYXB0dXJlRXhjZXB0aW9uKGUsIG9wdGlvbnMpO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvcHkgb3ZlciBwcm9wZXJ0aWVzIG9mIHRoZSBvbGQgZnVuY3Rpb25cbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBmdW5jKSB7XG4gICAgICBpZiAoaGFzS2V5KGZ1bmMsIHByb3BlcnR5KSkge1xuICAgICAgICB3cmFwcGVkW3Byb3BlcnR5XSA9IGZ1bmNbcHJvcGVydHldO1xuICAgICAgfVxuICAgIH1cbiAgICB3cmFwcGVkLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuXG4gICAgZnVuYy5fX3JhdmVuX3dyYXBwZXJfXyA9IHdyYXBwZWQ7XG4gICAgLy8gU2lnbmFsIHRoYXQgdGhpcyBmdW5jdGlvbiBoYXMgYmVlbiB3cmFwcGVkL2ZpbGxlZCBhbHJlYWR5XG4gICAgLy8gZm9yIGJvdGggZGVidWdnaW5nIGFuZCB0byBwcmV2ZW50IGl0IHRvIGJlaW5nIHdyYXBwZWQvZmlsbGVkIHR3aWNlXG4gICAgd3JhcHBlZC5fX3JhdmVuX18gPSB0cnVlO1xuICAgIHdyYXBwZWQuX19vcmlnX18gPSBmdW5jO1xuXG4gICAgcmV0dXJuIHdyYXBwZWQ7XG4gIH0sXG5cbiAgLypcbiAgICAgKiBVbmluc3RhbGxzIHRoZSBnbG9iYWwgZXJyb3IgaGFuZGxlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1JhdmVufVxuICAgICAqL1xuICB1bmluc3RhbGw6IGZ1bmN0aW9uKCkge1xuICAgIFRyYWNlS2l0LnJlcG9ydC51bmluc3RhbGwoKTtcblxuICAgIHRoaXMuX3VucGF0Y2hGdW5jdGlvblRvU3RyaW5nKCk7XG4gICAgdGhpcy5fcmVzdG9yZUJ1aWx0SW5zKCk7XG5cbiAgICBFcnJvci5zdGFja1RyYWNlTGltaXQgPSB0aGlzLl9vcmlnaW5hbEVycm9yU3RhY2tUcmFjZUxpbWl0O1xuICAgIHRoaXMuX2lzUmF2ZW5JbnN0YWxsZWQgPSBmYWxzZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIC8qXG4gICAgICogTWFudWFsbHkgY2FwdHVyZSBhbiBleGNlcHRpb24gYW5kIHNlbmQgaXQgb3ZlciB0byBTZW50cnlcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7ZXJyb3J9IGV4IEFuIGV4Y2VwdGlvbiB0byBiZSBsb2dnZWRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBBIHNwZWNpZmljIHNldCBvZiBvcHRpb25zIGZvciB0aGlzIGVycm9yIFtvcHRpb25hbF1cbiAgICAgKiBAcmV0dXJuIHtSYXZlbn1cbiAgICAgKi9cbiAgY2FwdHVyZUV4Y2VwdGlvbjogZnVuY3Rpb24oZXgsIG9wdGlvbnMpIHtcbiAgICAvLyBDYXNlcyBmb3Igc2VuZGluZyBleCBhcyBhIG1lc3NhZ2UsIHJhdGhlciB0aGFuIGFuIGV4Y2VwdGlvblxuICAgIHZhciBpc05vdEVycm9yID0gIWlzRXJyb3IoZXgpO1xuICAgIHZhciBpc05vdEVycm9yRXZlbnQgPSAhaXNFcnJvckV2ZW50KGV4KTtcbiAgICB2YXIgaXNFcnJvckV2ZW50V2l0aG91dEVycm9yID0gaXNFcnJvckV2ZW50KGV4KSAmJiAhZXguZXJyb3I7XG5cbiAgICBpZiAoKGlzTm90RXJyb3IgJiYgaXNOb3RFcnJvckV2ZW50KSB8fCBpc0Vycm9yRXZlbnRXaXRob3V0RXJyb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhcHR1cmVNZXNzYWdlKFxuICAgICAgICBleCxcbiAgICAgICAgb2JqZWN0TWVyZ2UoXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHJpbUhlYWRGcmFtZXM6IDEsXG4gICAgICAgICAgICBzdGFja3RyYWNlOiB0cnVlIC8vIGlmIHdlIGZhbGwgYmFjayB0byBjYXB0dXJlTWVzc2FnZSwgZGVmYXVsdCB0byBhdHRlbXB0aW5nIGEgbmV3IHRyYWNlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvcHRpb25zXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gR2V0IGFjdHVhbCBFcnJvciBmcm9tIEVycm9yRXZlbnRcbiAgICBpZiAoaXNFcnJvckV2ZW50KGV4KSkgZXggPSBleC5lcnJvcjtcblxuICAgIC8vIFN0b3JlIHRoZSByYXcgZXhjZXB0aW9uIG9iamVjdCBmb3IgcG90ZW50aWFsIGRlYnVnZ2luZyBhbmQgaW50cm9zcGVjdGlvblxuICAgIHRoaXMuX2xhc3RDYXB0dXJlZEV4Y2VwdGlvbiA9IGV4O1xuXG4gICAgLy8gVHJhY2VLaXQucmVwb3J0IHdpbGwgcmUtcmFpc2UgYW55IGV4Y2VwdGlvbiBwYXNzZWQgdG8gaXQsXG4gICAgLy8gd2hpY2ggbWVhbnMgeW91IGhhdmUgdG8gd3JhcCBpdCBpbiB0cnkvY2F0Y2guIEluc3RlYWQsIHdlXG4gICAgLy8gY2FuIHdyYXAgaXQgaGVyZSBhbmQgb25seSByZS1yYWlzZSBpZiBUcmFjZUtpdC5yZXBvcnRcbiAgICAvLyByYWlzZXMgYW4gZXhjZXB0aW9uIGRpZmZlcmVudCBmcm9tIHRoZSBvbmUgd2UgYXNrZWQgdG9cbiAgICAvLyByZXBvcnQgb24uXG4gICAgdHJ5IHtcbiAgICAgIHZhciBzdGFjayA9IFRyYWNlS2l0LmNvbXB1dGVTdGFja1RyYWNlKGV4KTtcbiAgICAgIHRoaXMuX2hhbmRsZVN0YWNrSW5mbyhzdGFjaywgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZXgxKSB7XG4gICAgICBpZiAoZXggIT09IGV4MSkge1xuICAgICAgICB0aHJvdyBleDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLypcbiAgICAgKiBNYW51YWxseSBzZW5kIGEgbWVzc2FnZSB0byBTZW50cnlcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtc2cgQSBwbGFpbiBtZXNzYWdlIHRvIGJlIGNhcHR1cmVkIGluIFNlbnRyeVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIEEgc3BlY2lmaWMgc2V0IG9mIG9wdGlvbnMgZm9yIHRoaXMgbWVzc2FnZSBbb3B0aW9uYWxdXG4gICAgICogQHJldHVybiB7UmF2ZW59XG4gICAgICovXG4gIGNhcHR1cmVNZXNzYWdlOiBmdW5jdGlvbihtc2csIG9wdGlvbnMpIHtcbiAgICAvLyBjb25maWcoKSBhdXRvbWFnaWNhbGx5IGNvbnZlcnRzIGlnbm9yZUVycm9ycyBmcm9tIGEgbGlzdCB0byBhIFJlZ0V4cCBzbyB3ZSBuZWVkIHRvIHRlc3QgZm9yIGFuXG4gICAgLy8gZWFybHkgY2FsbDsgd2UnbGwgZXJyb3Igb24gdGhlIHNpZGUgb2YgbG9nZ2luZyBhbnl0aGluZyBjYWxsZWQgYmVmb3JlIGNvbmZpZ3VyYXRpb24gc2luY2UgaXQnc1xuICAgIC8vIHByb2JhYmx5IHNvbWV0aGluZyB5b3Ugc2hvdWxkIHNlZTpcbiAgICBpZiAoXG4gICAgICAhIXRoaXMuX2dsb2JhbE9wdGlvbnMuaWdub3JlRXJyb3JzLnRlc3QgJiZcbiAgICAgIHRoaXMuX2dsb2JhbE9wdGlvbnMuaWdub3JlRXJyb3JzLnRlc3QobXNnKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGRhdGEgPSBvYmplY3RNZXJnZShcbiAgICAgIHtcbiAgICAgICAgbWVzc2FnZTogbXNnICsgJycgLy8gTWFrZSBzdXJlIGl0J3MgYWN0dWFsbHkgYSBzdHJpbmdcbiAgICAgIH0sXG4gICAgICBvcHRpb25zXG4gICAgKTtcblxuICAgIHZhciBleDtcbiAgICAvLyBHZW5lcmF0ZSBhIFwic3ludGhldGljXCIgc3RhY2sgdHJhY2UgZnJvbSB0aGlzIHBvaW50LlxuICAgIC8vIE5PVEU6IElmIHlvdSBhcmUgYSBTZW50cnkgdXNlciwgYW5kIHlvdSBhcmUgc2VlaW5nIHRoaXMgc3RhY2sgZnJhbWUsIGl0IGlzIE5PVCBpbmRpY2F0aXZlXG4gICAgLy8gICAgICAgb2YgYSBidWcgd2l0aCBSYXZlbi5qcy4gU2VudHJ5IGdlbmVyYXRlcyBzeW50aGV0aWMgdHJhY2VzIGVpdGhlciBieSBjb25maWd1cmF0aW9uLFxuICAgIC8vICAgICAgIG9yIGlmIGl0IGNhdGNoZXMgYSB0aHJvd24gb2JqZWN0IHdpdGhvdXQgYSBcInN0YWNrXCIgcHJvcGVydHkuXG4gICAgdHJ5IHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH0gY2F0Y2ggKGV4MSkge1xuICAgICAgZXggPSBleDE7XG4gICAgfVxuXG4gICAgLy8gbnVsbCBleGNlcHRpb24gbmFtZSBzbyBgRXJyb3JgIGlzbid0IHByZWZpeGVkIHRvIG1zZ1xuICAgIGV4Lm5hbWUgPSBudWxsO1xuICAgIHZhciBzdGFjayA9IFRyYWNlS2l0LmNvbXB1dGVTdGFja1RyYWNlKGV4KTtcblxuICAgIC8vIHN0YWNrWzBdIGlzIGB0aHJvdyBuZXcgRXJyb3IobXNnKWAgY2FsbCBpdHNlbGYsIHdlIGFyZSBpbnRlcmVzdGVkIGluIHRoZSBmcmFtZSB0aGF0IHdhcyBqdXN0IGJlZm9yZSB0aGF0LCBzdGFja1sxXVxuICAgIHZhciBpbml0aWFsQ2FsbCA9IGlzQXJyYXkoc3RhY2suc3RhY2spICYmIHN0YWNrLnN0YWNrWzFdO1xuICAgIHZhciBmaWxldXJsID0gKGluaXRpYWxDYWxsICYmIGluaXRpYWxDYWxsLnVybCkgfHwgJyc7XG5cbiAgICBpZiAoXG4gICAgICAhIXRoaXMuX2dsb2JhbE9wdGlvbnMuaWdub3JlVXJscy50ZXN0ICYmXG4gICAgICB0aGlzLl9nbG9iYWxPcHRpb25zLmlnbm9yZVVybHMudGVzdChmaWxldXJsKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICEhdGhpcy5fZ2xvYmFsT3B0aW9ucy53aGl0ZWxpc3RVcmxzLnRlc3QgJiZcbiAgICAgICF0aGlzLl9nbG9iYWxPcHRpb25zLndoaXRlbGlzdFVybHMudGVzdChmaWxldXJsKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9nbG9iYWxPcHRpb25zLnN0YWNrdHJhY2UgfHwgKG9wdGlvbnMgJiYgb3B0aW9ucy5zdGFja3RyYWNlKSkge1xuICAgICAgb3B0aW9ucyA9IG9iamVjdE1lcmdlKFxuICAgICAgICB7XG4gICAgICAgICAgLy8gZmluZ2VycHJpbnQgb24gbXNnLCBub3Qgc3RhY2sgdHJhY2UgKGxlZ2FjeSBiZWhhdmlvciwgY291bGQgYmVcbiAgICAgICAgICAvLyByZXZpc2l0ZWQpXG4gICAgICAgICAgZmluZ2VycHJpbnQ6IG1zZyxcbiAgICAgICAgICAvLyBzaW5jZSB3ZSBrbm93IHRoaXMgaXMgYSBzeW50aGV0aWMgdHJhY2UsIHRoZSB0b3AgTi1tb3N0IGZyYW1lc1xuICAgICAgICAgIC8vIE1VU1QgYmUgZnJvbSBSYXZlbi5qcywgc28gbWFyayB0aGVtIGFzIGluX2FwcCBsYXRlciBieSBzZXR0aW5nXG4gICAgICAgICAgLy8gdHJpbUhlYWRGcmFtZXNcbiAgICAgICAgICB0cmltSGVhZEZyYW1lczogKG9wdGlvbnMudHJpbUhlYWRGcmFtZXMgfHwgMCkgKyAxXG4gICAgICAgIH0sXG4gICAgICAgIG9wdGlvbnNcbiAgICAgICk7XG5cbiAgICAgIHZhciBmcmFtZXMgPSB0aGlzLl9wcmVwYXJlRnJhbWVzKHN0YWNrLCBvcHRpb25zKTtcbiAgICAgIGRhdGEuc3RhY2t0cmFjZSA9IHtcbiAgICAgICAgLy8gU2VudHJ5IGV4cGVjdHMgZnJhbWVzIG9sZGVzdCB0byBuZXdlc3RcbiAgICAgICAgZnJhbWVzOiBmcmFtZXMucmV2ZXJzZSgpXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEZpcmUgYXdheSFcbiAgICB0aGlzLl9zZW5kKGRhdGEpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgY2FwdHVyZUJyZWFkY3J1bWI6IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBjcnVtYiA9IG9iamVjdE1lcmdlKFxuICAgICAge1xuICAgICAgICB0aW1lc3RhbXA6IG5vdygpIC8gMTAwMFxuICAgICAgfSxcbiAgICAgIG9ialxuICAgICk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLl9nbG9iYWxPcHRpb25zLmJyZWFkY3J1bWJDYWxsYmFjaykpIHtcbiAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9nbG9iYWxPcHRpb25zLmJyZWFkY3J1bWJDYWxsYmFjayhjcnVtYik7XG5cbiAgICAgIGlmIChpc09iamVjdChyZXN1bHQpICYmICFpc0VtcHR5T2JqZWN0KHJlc3VsdCkpIHtcbiAgICAgICAgY3J1bWIgPSByZXN1bHQ7XG4gICAgICB9IGVsc2UgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fYnJlYWRjcnVtYnMucHVzaChjcnVtYik7XG4gICAgaWYgKHRoaXMuX2JyZWFkY3J1bWJzLmxlbmd0aCA+IHRoaXMuX2dsb2JhbE9wdGlvbnMubWF4QnJlYWRjcnVtYnMpIHtcbiAgICAgIHRoaXMuX2JyZWFkY3J1bWJzLnNoaWZ0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIGFkZFBsdWdpbjogZnVuY3Rpb24ocGx1Z2luIC8qYXJnMSwgYXJnMiwgLi4uIGFyZ04qLykge1xuICAgIHZhciBwbHVnaW5BcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgdGhpcy5fcGx1Z2lucy5wdXNoKFtwbHVnaW4sIHBsdWdpbkFyZ3NdKTtcbiAgICBpZiAodGhpcy5faXNSYXZlbkluc3RhbGxlZCkge1xuICAgICAgdGhpcy5fZHJhaW5QbHVnaW5zKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLypcbiAgICAgKiBTZXQvY2xlYXIgYSB1c2VyIHRvIGJlIHNlbnQgYWxvbmcgd2l0aCB0aGUgcGF5bG9hZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB1c2VyIEFuIG9iamVjdCByZXByZXNlbnRpbmcgdXNlciBkYXRhIFtvcHRpb25hbF1cbiAgICAgKiBAcmV0dXJuIHtSYXZlbn1cbiAgICAgKi9cbiAgc2V0VXNlckNvbnRleHQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAvLyBJbnRlbnRpb25hbGx5IGRvIG5vdCBtZXJnZSBoZXJlIHNpbmNlIHRoYXQncyBhbiB1bmV4cGVjdGVkIGJlaGF2aW9yLlxuICAgIHRoaXMuX2dsb2JhbENvbnRleHQudXNlciA9IHVzZXI7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKlxuICAgICAqIE1lcmdlIGV4dHJhIGF0dHJpYnV0ZXMgdG8gYmUgc2VudCBhbG9uZyB3aXRoIHRoZSBwYXlsb2FkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV4dHJhIEFuIG9iamVjdCByZXByZXNlbnRpbmcgZXh0cmEgZGF0YSBbb3B0aW9uYWxdXG4gICAgICogQHJldHVybiB7UmF2ZW59XG4gICAgICovXG4gIHNldEV4dHJhQ29udGV4dDogZnVuY3Rpb24oZXh0cmEpIHtcbiAgICB0aGlzLl9tZXJnZUNvbnRleHQoJ2V4dHJhJywgZXh0cmEpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLypcbiAgICAgKiBNZXJnZSB0YWdzIHRvIGJlIHNlbnQgYWxvbmcgd2l0aCB0aGUgcGF5bG9hZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YWdzIEFuIG9iamVjdCByZXByZXNlbnRpbmcgdGFncyBbb3B0aW9uYWxdXG4gICAgICogQHJldHVybiB7UmF2ZW59XG4gICAgICovXG4gIHNldFRhZ3NDb250ZXh0OiBmdW5jdGlvbih0YWdzKSB7XG4gICAgdGhpcy5fbWVyZ2VDb250ZXh0KCd0YWdzJywgdGFncyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKlxuICAgICAqIENsZWFyIGFsbCBvZiB0aGUgY29udGV4dC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1JhdmVufVxuICAgICAqL1xuICBjbGVhckNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2dsb2JhbENvbnRleHQgPSB7fTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIC8qXG4gICAgICogR2V0IGEgY29weSBvZiB0aGUgY3VycmVudCBjb250ZXh0LiBUaGlzIGNhbm5vdCBiZSBtdXRhdGVkLlxuICAgICAqXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBjb3B5IG9mIGNvbnRleHRcbiAgICAgKi9cbiAgZ2V0Q29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgLy8gbG9sIGphdmFzY3JpcHRcbiAgICByZXR1cm4gSlNPTi5wYXJzZShzdHJpbmdpZnkodGhpcy5fZ2xvYmFsQ29udGV4dCkpO1xuICB9LFxuXG4gIC8qXG4gICAgICogU2V0IGVudmlyb25tZW50IG9mIGFwcGxpY2F0aW9uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZW52aXJvbm1lbnQgVHlwaWNhbGx5IHNvbWV0aGluZyBsaWtlICdwcm9kdWN0aW9uJy5cbiAgICAgKiBAcmV0dXJuIHtSYXZlbn1cbiAgICAgKi9cbiAgc2V0RW52aXJvbm1lbnQ6IGZ1bmN0aW9uKGVudmlyb25tZW50KSB7XG4gICAgdGhpcy5fZ2xvYmFsT3B0aW9ucy5lbnZpcm9ubWVudCA9IGVudmlyb25tZW50O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLypcbiAgICAgKiBTZXQgcmVsZWFzZSB2ZXJzaW9uIG9mIGFwcGxpY2F0aW9uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsZWFzZSBUeXBpY2FsbHkgc29tZXRoaW5nIGxpa2UgYSBnaXQgU0hBIHRvIGlkZW50aWZ5IHZlcnNpb25cbiAgICAgKiBAcmV0dXJuIHtSYXZlbn1cbiAgICAgKi9cbiAgc2V0UmVsZWFzZTogZnVuY3Rpb24ocmVsZWFzZSkge1xuICAgIHRoaXMuX2dsb2JhbE9wdGlvbnMucmVsZWFzZSA9IHJlbGVhc2U7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKlxuICAgICAqIFNldCB0aGUgZGF0YUNhbGxiYWNrIG9wdGlvblxuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJ1biB3aGljaCBhbGxvd3MgdGhlXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSBibG9iIHRvIGJlIG11dGF0ZWQgYmVmb3JlIHNlbmRpbmdcbiAgICAgKiBAcmV0dXJuIHtSYXZlbn1cbiAgICAgKi9cbiAgc2V0RGF0YUNhbGxiYWNrOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBvcmlnaW5hbCA9IHRoaXMuX2dsb2JhbE9wdGlvbnMuZGF0YUNhbGxiYWNrO1xuICAgIHRoaXMuX2dsb2JhbE9wdGlvbnMuZGF0YUNhbGxiYWNrID0ga2VlcE9yaWdpbmFsQ2FsbGJhY2sob3JpZ2luYWwsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKlxuICAgICAqIFNldCB0aGUgYnJlYWRjcnVtYkNhbGxiYWNrIG9wdGlvblxuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJ1biB3aGljaCBhbGxvd3MgZmlsdGVyaW5nXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgbXV0YXRpbmcgYnJlYWRjcnVtYnNcbiAgICAgKiBAcmV0dXJuIHtSYXZlbn1cbiAgICAgKi9cbiAgc2V0QnJlYWRjcnVtYkNhbGxiYWNrOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBvcmlnaW5hbCA9IHRoaXMuX2dsb2JhbE9wdGlvbnMuYnJlYWRjcnVtYkNhbGxiYWNrO1xuICAgIHRoaXMuX2dsb2JhbE9wdGlvbnMuYnJlYWRjcnVtYkNhbGxiYWNrID0ga2VlcE9yaWdpbmFsQ2FsbGJhY2sob3JpZ2luYWwsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKlxuICAgICAqIFNldCB0aGUgc2hvdWxkU2VuZENhbGxiYWNrIG9wdGlvblxuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJ1biB3aGljaCBhbGxvd3NcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRyb3NwZWN0aW5nIHRoZSBibG9iIGJlZm9yZSBzZW5kaW5nXG4gICAgICogQHJldHVybiB7UmF2ZW59XG4gICAgICovXG4gIHNldFNob3VsZFNlbmRDYWxsYmFjazogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgb3JpZ2luYWwgPSB0aGlzLl9nbG9iYWxPcHRpb25zLnNob3VsZFNlbmRDYWxsYmFjaztcbiAgICB0aGlzLl9nbG9iYWxPcHRpb25zLnNob3VsZFNlbmRDYWxsYmFjayA9IGtlZXBPcmlnaW5hbENhbGxiYWNrKG9yaWdpbmFsLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLyoqXG4gICAgICogT3ZlcnJpZGUgdGhlIGRlZmF1bHQgSFRUUCB0cmFuc3BvcnQgbWVjaGFuaXNtIHRoYXQgdHJhbnNtaXRzIGRhdGFcbiAgICAgKiB0byB0aGUgU2VudHJ5IHNlcnZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHRyYW5zcG9ydCBGdW5jdGlvbiBpbnZva2VkIGluc3RlYWQgb2YgdGhlIGRlZmF1bHRcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYG1ha2VSZXF1ZXN0YCBoYW5kbGVyLlxuICAgICAqXG4gICAgICogQHJldHVybiB7UmF2ZW59XG4gICAgICovXG4gIHNldFRyYW5zcG9ydDogZnVuY3Rpb24odHJhbnNwb3J0KSB7XG4gICAgdGhpcy5fZ2xvYmFsT3B0aW9ucy50cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKlxuICAgICAqIEdldCB0aGUgbGF0ZXN0IHJhdyBleGNlcHRpb24gdGhhdCB3YXMgY2FwdHVyZWQgYnkgUmF2ZW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtlcnJvcn1cbiAgICAgKi9cbiAgbGFzdEV4Y2VwdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RDYXB0dXJlZEV4Y2VwdGlvbjtcbiAgfSxcblxuICAvKlxuICAgICAqIEdldCB0aGUgbGFzdCBldmVudCBpZFxuICAgICAqXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqL1xuICBsYXN0RXZlbnRJZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RFdmVudElkO1xuICB9LFxuXG4gIC8qXG4gICAgICogRGV0ZXJtaW5lIGlmIFJhdmVuIGlzIHNldHVwIGFuZCByZWFkeSB0byBnby5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAgICovXG4gIGlzU2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5faGFzSlNPTikgcmV0dXJuIGZhbHNlOyAvLyBuZWVkcyBKU09OIHN1cHBvcnRcbiAgICBpZiAoIXRoaXMuX2dsb2JhbFNlcnZlcikge1xuICAgICAgaWYgKCF0aGlzLnJhdmVuTm90Q29uZmlndXJlZEVycm9yKSB7XG4gICAgICAgIHRoaXMucmF2ZW5Ob3RDb25maWd1cmVkRXJyb3IgPSB0cnVlO1xuICAgICAgICB0aGlzLl9sb2dEZWJ1ZygnZXJyb3InLCAnRXJyb3I6IFJhdmVuIGhhcyBub3QgYmVlbiBjb25maWd1cmVkLicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICBhZnRlckxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vIFRPRE86IHJlbW92ZSB3aW5kb3cgZGVwZW5kZW5jZT9cblxuICAgIC8vIEF0dGVtcHQgdG8gaW5pdGlhbGl6ZSBSYXZlbiBvbiBsb2FkXG4gICAgdmFyIFJhdmVuQ29uZmlnID0gX3dpbmRvdy5SYXZlbkNvbmZpZztcbiAgICBpZiAoUmF2ZW5Db25maWcpIHtcbiAgICAgIHRoaXMuY29uZmlnKFJhdmVuQ29uZmlnLmRzbiwgUmF2ZW5Db25maWcuY29uZmlnKS5pbnN0YWxsKCk7XG4gICAgfVxuICB9LFxuXG4gIHNob3dSZXBvcnREaWFsb2c6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBpZiAoXG4gICAgICAhX2RvY3VtZW50IC8vIGRvZXNuJ3Qgd29yayB3aXRob3V0IGEgZG9jdW1lbnQgKFJlYWN0IG5hdGl2ZSlcbiAgICApXG4gICAgICByZXR1cm47XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBsYXN0RXZlbnRJZCA9IG9wdGlvbnMuZXZlbnRJZCB8fCB0aGlzLmxhc3RFdmVudElkKCk7XG4gICAgaWYgKCFsYXN0RXZlbnRJZCkge1xuICAgICAgdGhyb3cgbmV3IFJhdmVuQ29uZmlnRXJyb3IoJ01pc3NpbmcgZXZlbnRJZCcpO1xuICAgIH1cblxuICAgIHZhciBkc24gPSBvcHRpb25zLmRzbiB8fCB0aGlzLl9kc247XG4gICAgaWYgKCFkc24pIHtcbiAgICAgIHRocm93IG5ldyBSYXZlbkNvbmZpZ0Vycm9yKCdNaXNzaW5nIERTTicpO1xuICAgIH1cblxuICAgIHZhciBlbmNvZGUgPSBlbmNvZGVVUklDb21wb25lbnQ7XG4gICAgdmFyIHFzID0gJyc7XG4gICAgcXMgKz0gJz9ldmVudElkPScgKyBlbmNvZGUobGFzdEV2ZW50SWQpO1xuICAgIHFzICs9ICcmZHNuPScgKyBlbmNvZGUoZHNuKTtcblxuICAgIHZhciB1c2VyID0gb3B0aW9ucy51c2VyIHx8IHRoaXMuX2dsb2JhbENvbnRleHQudXNlcjtcbiAgICBpZiAodXNlcikge1xuICAgICAgaWYgKHVzZXIubmFtZSkgcXMgKz0gJyZuYW1lPScgKyBlbmNvZGUodXNlci5uYW1lKTtcbiAgICAgIGlmICh1c2VyLmVtYWlsKSBxcyArPSAnJmVtYWlsPScgKyBlbmNvZGUodXNlci5lbWFpbCk7XG4gICAgfVxuXG4gICAgdmFyIGdsb2JhbFNlcnZlciA9IHRoaXMuX2dldEdsb2JhbFNlcnZlcih0aGlzLl9wYXJzZURTTihkc24pKTtcblxuICAgIHZhciBzY3JpcHQgPSBfZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICBzY3JpcHQuc3JjID0gZ2xvYmFsU2VydmVyICsgJy9hcGkvZW1iZWQvZXJyb3ItcGFnZS8nICsgcXM7XG4gICAgKF9kb2N1bWVudC5oZWFkIHx8IF9kb2N1bWVudC5ib2R5KS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICB9LFxuXG4gIC8qKioqIFByaXZhdGUgZnVuY3Rpb25zICoqKiovXG4gIF9pZ25vcmVOZXh0T25FcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2lnbm9yZU9uRXJyb3IgKz0gMTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgLy8gb25lcnJvciBzaG91bGQgdHJpZ2dlciBiZWZvcmUgc2V0VGltZW91dFxuICAgICAgc2VsZi5faWdub3JlT25FcnJvciAtPSAxO1xuICAgIH0pO1xuICB9LFxuXG4gIF90cmlnZ2VyRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50VHlwZSwgb3B0aW9ucykge1xuICAgIC8vIE5PVEU6IGBldmVudGAgaXMgYSBuYXRpdmUgYnJvd3NlciB0aGluZywgc28gbGV0J3MgYXZvaWQgY29uZmxpY3Rpbmcgd2lodCBpdFxuICAgIHZhciBldnQsIGtleTtcblxuICAgIGlmICghdGhpcy5faGFzRG9jdW1lbnQpIHJldHVybjtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgZXZlbnRUeXBlID0gJ3JhdmVuJyArIGV2ZW50VHlwZS5zdWJzdHIoMCwgMSkudG9VcHBlckNhc2UoKSArIGV2ZW50VHlwZS5zdWJzdHIoMSk7XG5cbiAgICBpZiAoX2RvY3VtZW50LmNyZWF0ZUV2ZW50KSB7XG4gICAgICBldnQgPSBfZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKTtcbiAgICAgIGV2dC5pbml0RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZ0ID0gX2RvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgICBldnQuZXZlbnRUeXBlID0gZXZlbnRUeXBlO1xuICAgIH1cblxuICAgIGZvciAoa2V5IGluIG9wdGlvbnMpXG4gICAgICBpZiAoaGFzS2V5KG9wdGlvbnMsIGtleSkpIHtcbiAgICAgICAgZXZ0W2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICB9XG5cbiAgICBpZiAoX2RvY3VtZW50LmNyZWF0ZUV2ZW50KSB7XG4gICAgICAvLyBJRTkgaWYgc3RhbmRhcmRzXG4gICAgICBfZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJRTggcmVnYXJkbGVzcyBvZiBRdWlya3Mgb3IgU3RhbmRhcmRzXG4gICAgICAvLyBJRTkgaWYgcXVpcmtzXG4gICAgICB0cnkge1xuICAgICAgICBfZG9jdW1lbnQuZmlyZUV2ZW50KCdvbicgKyBldnQuZXZlbnRUeXBlLnRvTG93ZXJDYXNlKCksIGV2dCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAgICogV3JhcHMgYWRkRXZlbnRMaXN0ZW5lciB0byBjYXB0dXJlIFVJIGJyZWFkY3J1bWJzXG4gICAgICogQHBhcmFtIGV2dE5hbWUgdGhlIGV2ZW50IG5hbWUgKGUuZy4gXCJjbGlja1wiKVxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICBfYnJlYWRjcnVtYkV2ZW50SGFuZGxlcjogZnVuY3Rpb24oZXZ0TmFtZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAvLyByZXNldCBrZXlwcmVzcyB0aW1lb3V0OyBlLmcuIHRyaWdnZXJpbmcgYSAnY2xpY2snIGFmdGVyXG4gICAgICAvLyBhICdrZXlwcmVzcycgd2lsbCByZXNldCB0aGUga2V5cHJlc3MgZGVib3VuY2Ugc28gdGhhdCBhIG5ld1xuICAgICAgLy8gc2V0IG9mIGtleXByZXNzZXMgY2FuIGJlIHJlY29yZGVkXG4gICAgICBzZWxmLl9rZXlwcmVzc1RpbWVvdXQgPSBudWxsO1xuXG4gICAgICAvLyBJdCdzIHBvc3NpYmxlIHRoaXMgaGFuZGxlciBtaWdodCB0cmlnZ2VyIG11bHRpcGxlIHRpbWVzIGZvciB0aGUgc2FtZVxuICAgICAgLy8gZXZlbnQgKGUuZy4gZXZlbnQgcHJvcGFnYXRpb24gdGhyb3VnaCBub2RlIGFuY2VzdG9ycykuIElnbm9yZSBpZiB3ZSd2ZVxuICAgICAgLy8gYWxyZWFkeSBjYXB0dXJlZCB0aGUgZXZlbnQuXG4gICAgICBpZiAoc2VsZi5fbGFzdENhcHR1cmVkRXZlbnQgPT09IGV2dCkgcmV0dXJuO1xuXG4gICAgICBzZWxmLl9sYXN0Q2FwdHVyZWRFdmVudCA9IGV2dDtcblxuICAgICAgLy8gdHJ5L2NhdGNoIGJvdGg6XG4gICAgICAvLyAtIGFjY2Vzc2luZyBldnQudGFyZ2V0IChzZWUgZ2V0c2VudHJ5L3JhdmVuLWpzIzgzOCwgIzc2OClcbiAgICAgIC8vIC0gYGh0bWxUcmVlQXNTdHJpbmdgIGJlY2F1c2UgaXQncyBjb21wbGV4LCBhbmQganVzdCBhY2Nlc3NpbmcgdGhlIERPTSBpbmNvcnJlY3RseVxuICAgICAgLy8gICBjYW4gdGhyb3cgYW4gZXhjZXB0aW9uIGluIHNvbWUgY2lyY3Vtc3RhbmNlcy5cbiAgICAgIHZhciB0YXJnZXQ7XG4gICAgICB0cnkge1xuICAgICAgICB0YXJnZXQgPSBodG1sVHJlZUFzU3RyaW5nKGV2dC50YXJnZXQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0YXJnZXQgPSAnPHVua25vd24+JztcbiAgICAgIH1cblxuICAgICAgc2VsZi5jYXB0dXJlQnJlYWRjcnVtYih7XG4gICAgICAgIGNhdGVnb3J5OiAndWkuJyArIGV2dE5hbWUsIC8vIGUuZy4gdWkuY2xpY2ssIHVpLmlucHV0XG4gICAgICAgIG1lc3NhZ2U6IHRhcmdldFxuICAgICAgfSk7XG4gICAgfTtcbiAgfSxcblxuICAvKipcbiAgICAgKiBXcmFwcyBhZGRFdmVudExpc3RlbmVyIHRvIGNhcHR1cmUga2V5cHJlc3MgVUkgZXZlbnRzXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gIF9rZXlwcmVzc0V2ZW50SGFuZGxlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgZGVib3VuY2VEdXJhdGlvbiA9IDEwMDA7IC8vIG1pbGxpc2Vjb25kc1xuXG4gICAgLy8gVE9ETzogaWYgc29tZWhvdyB1c2VyIHN3aXRjaGVzIGtleXByZXNzIHRhcmdldCBiZWZvcmVcbiAgICAvLyAgICAgICBkZWJvdW5jZSB0aW1lb3V0IGlzIHRyaWdnZXJlZCwgd2Ugd2lsbCBvbmx5IGNhcHR1cmVcbiAgICAvLyAgICAgICBhIHNpbmdsZSBicmVhZGNydW1iIGZyb20gdGhlIEZJUlNUIHRhcmdldCAoYWNjZXB0YWJsZT8pXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgdmFyIHRhcmdldDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRhcmdldCA9IGV2dC50YXJnZXQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGp1c3QgYWNjZXNzaW5nIGV2ZW50IHByb3BlcnRpZXMgY2FuIHRocm93IGFuIGV4Y2VwdGlvbiBpbiBzb21lIHJhcmUgY2lyY3Vtc3RhbmNlc1xuICAgICAgICAvLyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9nZXRzZW50cnkvcmF2ZW4tanMvaXNzdWVzLzgzOFxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgdGFnTmFtZSA9IHRhcmdldCAmJiB0YXJnZXQudGFnTmFtZTtcblxuICAgICAgLy8gb25seSBjb25zaWRlciBrZXlwcmVzcyBldmVudHMgb24gYWN0dWFsIGlucHV0IGVsZW1lbnRzXG4gICAgICAvLyB0aGlzIHdpbGwgZGlzcmVnYXJkIGtleXByZXNzZXMgdGFyZ2V0aW5nIGJvZHkgKGUuZy4gdGFiYmluZ1xuICAgICAgLy8gdGhyb3VnaCBlbGVtZW50cywgaG90a2V5cywgZXRjKVxuICAgICAgaWYgKFxuICAgICAgICAhdGFnTmFtZSB8fFxuICAgICAgICAodGFnTmFtZSAhPT0gJ0lOUFVUJyAmJiB0YWdOYW1lICE9PSAnVEVYVEFSRUEnICYmICF0YXJnZXQuaXNDb250ZW50RWRpdGFibGUpXG4gICAgICApXG4gICAgICAgIHJldHVybjtcblxuICAgICAgLy8gcmVjb3JkIGZpcnN0IGtleXByZXNzIGluIGEgc2VyaWVzLCBidXQgaWdub3JlIHN1YnNlcXVlbnRcbiAgICAgIC8vIGtleXByZXNzZXMgdW50aWwgZGVib3VuY2UgY2xlYXJzXG4gICAgICB2YXIgdGltZW91dCA9IHNlbGYuX2tleXByZXNzVGltZW91dDtcbiAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICBzZWxmLl9icmVhZGNydW1iRXZlbnRIYW5kbGVyKCdpbnB1dCcpKGV2dCk7XG4gICAgICB9XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICBzZWxmLl9rZXlwcmVzc1RpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLl9rZXlwcmVzc1RpbWVvdXQgPSBudWxsO1xuICAgICAgfSwgZGVib3VuY2VEdXJhdGlvbik7XG4gICAgfTtcbiAgfSxcblxuICAvKipcbiAgICAgKiBDYXB0dXJlcyBhIGJyZWFkY3J1bWIgb2YgdHlwZSBcIm5hdmlnYXRpb25cIiwgbm9ybWFsaXppbmcgaW5wdXQgVVJMc1xuICAgICAqIEBwYXJhbSB0byB0aGUgb3JpZ2luYXRpbmcgVVJMXG4gICAgICogQHBhcmFtIGZyb20gdGhlIHRhcmdldCBVUkxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICBfY2FwdHVyZVVybENoYW5nZTogZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgICB2YXIgcGFyc2VkTG9jID0gcGFyc2VVcmwodGhpcy5fbG9jYXRpb24uaHJlZik7XG4gICAgdmFyIHBhcnNlZFRvID0gcGFyc2VVcmwodG8pO1xuICAgIHZhciBwYXJzZWRGcm9tID0gcGFyc2VVcmwoZnJvbSk7XG5cbiAgICAvLyBiZWNhdXNlIG9ucG9wc3RhdGUgb25seSB0ZWxscyB5b3UgdGhlIFwibmV3XCIgKHRvKSB2YWx1ZSBvZiBsb2NhdGlvbi5ocmVmLCBhbmRcbiAgICAvLyBub3QgdGhlIHByZXZpb3VzIChmcm9tKSB2YWx1ZSwgd2UgbmVlZCB0byB0cmFjayB0aGUgdmFsdWUgb2YgdGhlIGN1cnJlbnQgVVJMXG4gICAgLy8gc3RhdGUgb3Vyc2VsdmVzXG4gICAgdGhpcy5fbGFzdEhyZWYgPSB0bztcblxuICAgIC8vIFVzZSBvbmx5IHRoZSBwYXRoIGNvbXBvbmVudCBvZiB0aGUgVVJMIGlmIHRoZSBVUkwgbWF0Y2hlcyB0aGUgY3VycmVudFxuICAgIC8vIGRvY3VtZW50IChhbG1vc3QgYWxsIHRoZSB0aW1lIHdoZW4gdXNpbmcgcHVzaFN0YXRlKVxuICAgIGlmIChwYXJzZWRMb2MucHJvdG9jb2wgPT09IHBhcnNlZFRvLnByb3RvY29sICYmIHBhcnNlZExvYy5ob3N0ID09PSBwYXJzZWRUby5ob3N0KVxuICAgICAgdG8gPSBwYXJzZWRUby5yZWxhdGl2ZTtcbiAgICBpZiAocGFyc2VkTG9jLnByb3RvY29sID09PSBwYXJzZWRGcm9tLnByb3RvY29sICYmIHBhcnNlZExvYy5ob3N0ID09PSBwYXJzZWRGcm9tLmhvc3QpXG4gICAgICBmcm9tID0gcGFyc2VkRnJvbS5yZWxhdGl2ZTtcblxuICAgIHRoaXMuY2FwdHVyZUJyZWFkY3J1bWIoe1xuICAgICAgY2F0ZWdvcnk6ICduYXZpZ2F0aW9uJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdG86IHRvLFxuICAgICAgICBmcm9tOiBmcm9tXG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgX3BhdGNoRnVuY3Rpb25Ub1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuX29yaWdpbmFsRnVuY3Rpb25Ub1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZXh0ZW5kLW5hdGl2ZVxuICAgIEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzID09PSAnZnVuY3Rpb24nICYmIHRoaXMuX19yYXZlbl9fKSB7XG4gICAgICAgIHJldHVybiBzZWxmLl9vcmlnaW5hbEZ1bmN0aW9uVG9TdHJpbmcuYXBwbHkodGhpcy5fX29yaWdfXywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZWxmLl9vcmlnaW5hbEZ1bmN0aW9uVG9TdHJpbmcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9LFxuXG4gIF91bnBhdGNoRnVuY3Rpb25Ub1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX29yaWdpbmFsRnVuY3Rpb25Ub1N0cmluZykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWV4dGVuZC1uYXRpdmVcbiAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IHRoaXMuX29yaWdpbmFsRnVuY3Rpb25Ub1N0cmluZztcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAgICogV3JhcCB0aW1lciBmdW5jdGlvbnMgYW5kIGV2ZW50IHRhcmdldHMgdG8gY2F0Y2ggZXJyb3JzIGFuZCBwcm92aWRlXG4gICAgICogYmV0dGVyIG1ldGFkYXRhLlxuICAgICAqL1xuICBfaW5zdHJ1bWVudFRyeUNhdGNoOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgd3JhcHBlZEJ1aWx0SW5zID0gc2VsZi5fd3JhcHBlZEJ1aWx0SW5zO1xuXG4gICAgZnVuY3Rpb24gd3JhcFRpbWVGbihvcmlnKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZm4sIHQpIHtcbiAgICAgICAgLy8gcHJlc2VydmUgYXJpdHlcbiAgICAgICAgLy8gTWFrZSBhIGNvcHkgb2YgdGhlIGFyZ3VtZW50cyB0byBwcmV2ZW50IGRlb3B0aW1pemF0aW9uXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9wZXRrYWFudG9ub3YvYmx1ZWJpcmQvd2lraS9PcHRpbWl6YXRpb24ta2lsbGVycyMzMi1sZWFraW5nLWFyZ3VtZW50c1xuICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgb3JpZ2luYWxDYWxsYmFjayA9IGFyZ3NbMF07XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKG9yaWdpbmFsQ2FsbGJhY2spKSB7XG4gICAgICAgICAgYXJnc1swXSA9IHNlbGYud3JhcChvcmlnaW5hbENhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElFIDwgOSBkb2Vzbid0IHN1cHBvcnQgLmNhbGwvLmFwcGx5IG9uIHNldEludGVydmFsL3NldFRpbWVvdXQsIGJ1dCBpdFxuICAgICAgICAvLyBhbHNvIHN1cHBvcnRzIG9ubHkgdHdvIGFyZ3VtZW50cyBhbmQgZG9lc24ndCBjYXJlIHdoYXQgdGhpcyBpcywgc28gd2VcbiAgICAgICAgLy8gY2FuIGp1c3QgY2FsbCB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gZGlyZWN0bHkuXG4gICAgICAgIGlmIChvcmlnLmFwcGx5KSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWcuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWcoYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGF1dG9CcmVhZGNydW1icyA9IHRoaXMuX2dsb2JhbE9wdGlvbnMuYXV0b0JyZWFkY3J1bWJzO1xuXG4gICAgZnVuY3Rpb24gd3JhcEV2ZW50VGFyZ2V0KGdsb2JhbCkge1xuICAgICAgdmFyIHByb3RvID0gX3dpbmRvd1tnbG9iYWxdICYmIF93aW5kb3dbZ2xvYmFsXS5wcm90b3R5cGU7XG4gICAgICBpZiAocHJvdG8gJiYgcHJvdG8uaGFzT3duUHJvcGVydHkgJiYgcHJvdG8uaGFzT3duUHJvcGVydHkoJ2FkZEV2ZW50TGlzdGVuZXInKSkge1xuICAgICAgICBmaWxsKFxuICAgICAgICAgIHByb3RvLFxuICAgICAgICAgICdhZGRFdmVudExpc3RlbmVyJyxcbiAgICAgICAgICBmdW5jdGlvbihvcmlnKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXZ0TmFtZSwgZm4sIGNhcHR1cmUsIHNlY3VyZSkge1xuICAgICAgICAgICAgICAvLyBwcmVzZXJ2ZSBhcml0eVxuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmIChmbiAmJiBmbi5oYW5kbGVFdmVudCkge1xuICAgICAgICAgICAgICAgICAgZm4uaGFuZGxlRXZlbnQgPSBzZWxmLndyYXAoZm4uaGFuZGxlRXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FuIHNvbWV0aW1lcyBnZXQgJ1Blcm1pc3Npb24gZGVuaWVkIHRvIGFjY2VzcyBwcm9wZXJ0eSBcImhhbmRsZSBFdmVudCdcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIE1vcmUgYnJlYWRjcnVtYiBET00gY2FwdHVyZSAuLi4gZG9uZSBoZXJlIGFuZCBub3QgaW4gYF9pbnN0cnVtZW50QnJlYWRjcnVtYnNgXG4gICAgICAgICAgICAgIC8vIHNvIHRoYXQgd2UgZG9uJ3QgaGF2ZSBtb3JlIHRoYW4gb25lIHdyYXBwZXIgZnVuY3Rpb25cbiAgICAgICAgICAgICAgdmFyIGJlZm9yZSwgY2xpY2tIYW5kbGVyLCBrZXlwcmVzc0hhbmRsZXI7XG5cbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGF1dG9CcmVhZGNydW1icyAmJlxuICAgICAgICAgICAgICAgIGF1dG9CcmVhZGNydW1icy5kb20gJiZcbiAgICAgICAgICAgICAgICAoZ2xvYmFsID09PSAnRXZlbnRUYXJnZXQnIHx8IGdsb2JhbCA9PT0gJ05vZGUnKVxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAvLyBOT1RFOiBnZW5lcmF0aW5nIG11bHRpcGxlIGhhbmRsZXJzIHBlciBhZGRFdmVudExpc3RlbmVyIGludm9jYXRpb24sIHNob3VsZFxuICAgICAgICAgICAgICAgIC8vICAgICAgIHJldmlzaXQgYW5kIHZlcmlmeSB3ZSBjYW4ganVzdCB1c2Ugb25lIChhbG1vc3QgY2VydGFpbmx5KVxuICAgICAgICAgICAgICAgIGNsaWNrSGFuZGxlciA9IHNlbGYuX2JyZWFkY3J1bWJFdmVudEhhbmRsZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICAgICAga2V5cHJlc3NIYW5kbGVyID0gc2VsZi5fa2V5cHJlc3NFdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICBiZWZvcmUgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gaW50ZXJjZXB0IGV2ZXJ5IERPTSBldmVudCBpbiBgYmVmb3JlYCBhcmd1bWVudCwgaW4gY2FzZSB0aGF0XG4gICAgICAgICAgICAgICAgICAvLyBzYW1lIHdyYXBwZWQgbWV0aG9kIGlzIHJlLXVzZWQgZm9yIGRpZmZlcmVudCBldmVudHMgKGUuZy4gbW91c2Vtb3ZlIFRIRU4gY2xpY2spXG4gICAgICAgICAgICAgICAgICAvLyBzZWUgIzcyNFxuICAgICAgICAgICAgICAgICAgaWYgKCFldnQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgdmFyIGV2ZW50VHlwZTtcbiAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZSA9IGV2dC50eXBlO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBqdXN0IGFjY2Vzc2luZyBldmVudCBwcm9wZXJ0aWVzIGNhbiB0aHJvdyBhbiBleGNlcHRpb24gaW4gc29tZSByYXJlIGNpcmN1bXN0YW5jZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gc2VlOiBodHRwczovL2dpdGh1Yi5jb20vZ2V0c2VudHJ5L3JhdmVuLWpzL2lzc3Vlcy84MzhcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PT0gJ2NsaWNrJykgcmV0dXJuIGNsaWNrSGFuZGxlcihldnQpO1xuICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRUeXBlID09PSAna2V5cHJlc3MnKSByZXR1cm4ga2V5cHJlc3NIYW5kbGVyKGV2dCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gb3JpZy5jYWxsKFxuICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgZXZ0TmFtZSxcbiAgICAgICAgICAgICAgICBzZWxmLndyYXAoZm4sIHVuZGVmaW5lZCwgYmVmb3JlKSxcbiAgICAgICAgICAgICAgICBjYXB0dXJlLFxuICAgICAgICAgICAgICAgIHNlY3VyZVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHdyYXBwZWRCdWlsdEluc1xuICAgICAgICApO1xuICAgICAgICBmaWxsKFxuICAgICAgICAgIHByb3RvLFxuICAgICAgICAgICdyZW1vdmVFdmVudExpc3RlbmVyJyxcbiAgICAgICAgICBmdW5jdGlvbihvcmlnKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXZ0LCBmbiwgY2FwdHVyZSwgc2VjdXJlKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm4gPSBmbiAmJiAoZm4uX19yYXZlbl93cmFwcGVyX18gPyBmbi5fX3JhdmVuX3dyYXBwZXJfXyA6IGZuKTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIGlnbm9yZSwgYWNjZXNzaW5nIF9fcmF2ZW5fd3JhcHBlcl9fIHdpbGwgdGhyb3cgaW4gc29tZSBTZWxlbml1bSBlbnZpcm9ubWVudHNcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gb3JpZy5jYWxsKHRoaXMsIGV2dCwgZm4sIGNhcHR1cmUsIHNlY3VyZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgd3JhcHBlZEJ1aWx0SW5zXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmlsbChfd2luZG93LCAnc2V0VGltZW91dCcsIHdyYXBUaW1lRm4sIHdyYXBwZWRCdWlsdElucyk7XG4gICAgZmlsbChfd2luZG93LCAnc2V0SW50ZXJ2YWwnLCB3cmFwVGltZUZuLCB3cmFwcGVkQnVpbHRJbnMpO1xuICAgIGlmIChfd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgZmlsbChcbiAgICAgICAgX3dpbmRvdyxcbiAgICAgICAgJ3JlcXVlc3RBbmltYXRpb25GcmFtZScsXG4gICAgICAgIGZ1bmN0aW9uKG9yaWcpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oY2IpIHtcbiAgICAgICAgICAgIHJldHVybiBvcmlnKHNlbGYud3JhcChjYikpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHdyYXBwZWRCdWlsdEluc1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBldmVudCB0YXJnZXRzIGJvcnJvd2VkIGZyb20gYnVnc25hZy1qczpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYnVnc25hZy9idWdzbmFnLWpzL2Jsb2IvbWFzdGVyL3NyYy9idWdzbmFnLmpzI0w2NjZcbiAgICB2YXIgZXZlbnRUYXJnZXRzID0gW1xuICAgICAgJ0V2ZW50VGFyZ2V0JyxcbiAgICAgICdXaW5kb3cnLFxuICAgICAgJ05vZGUnLFxuICAgICAgJ0FwcGxpY2F0aW9uQ2FjaGUnLFxuICAgICAgJ0F1ZGlvVHJhY2tMaXN0JyxcbiAgICAgICdDaGFubmVsTWVyZ2VyTm9kZScsXG4gICAgICAnQ3J5cHRvT3BlcmF0aW9uJyxcbiAgICAgICdFdmVudFNvdXJjZScsXG4gICAgICAnRmlsZVJlYWRlcicsXG4gICAgICAnSFRNTFVua25vd25FbGVtZW50JyxcbiAgICAgICdJREJEYXRhYmFzZScsXG4gICAgICAnSURCUmVxdWVzdCcsXG4gICAgICAnSURCVHJhbnNhY3Rpb24nLFxuICAgICAgJ0tleU9wZXJhdGlvbicsXG4gICAgICAnTWVkaWFDb250cm9sbGVyJyxcbiAgICAgICdNZXNzYWdlUG9ydCcsXG4gICAgICAnTW9kYWxXaW5kb3cnLFxuICAgICAgJ05vdGlmaWNhdGlvbicsXG4gICAgICAnU1ZHRWxlbWVudEluc3RhbmNlJyxcbiAgICAgICdTY3JlZW4nLFxuICAgICAgJ1RleHRUcmFjaycsXG4gICAgICAnVGV4dFRyYWNrQ3VlJyxcbiAgICAgICdUZXh0VHJhY2tMaXN0JyxcbiAgICAgICdXZWJTb2NrZXQnLFxuICAgICAgJ1dlYlNvY2tldFdvcmtlcicsXG4gICAgICAnV29ya2VyJyxcbiAgICAgICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAnWE1MSHR0cFJlcXVlc3RFdmVudFRhcmdldCcsXG4gICAgICAnWE1MSHR0cFJlcXVlc3RVcGxvYWQnXG4gICAgXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50VGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgd3JhcEV2ZW50VGFyZ2V0KGV2ZW50VGFyZ2V0c1tpXSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgICAqIEluc3RydW1lbnQgYnJvd3NlciBidWlsdC1pbnMgdy8gYnJlYWRjcnVtYiBjYXB0dXJpbmdcbiAgICAgKiAgLSBYTUxIdHRwUmVxdWVzdHNcbiAgICAgKiAgLSBET00gaW50ZXJhY3Rpb25zIChjbGljay90eXBpbmcpXG4gICAgICogIC0gd2luZG93LmxvY2F0aW9uIGNoYW5nZXNcbiAgICAgKiAgLSBjb25zb2xlXG4gICAgICpcbiAgICAgKiBDYW4gYmUgZGlzYWJsZWQgb3IgaW5kaXZpZHVhbGx5IGNvbmZpZ3VyZWQgdmlhIHRoZSBgYXV0b0JyZWFkY3J1bWJzYCBjb25maWcgb3B0aW9uXG4gICAgICovXG4gIF9pbnN0cnVtZW50QnJlYWRjcnVtYnM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYXV0b0JyZWFkY3J1bWJzID0gdGhpcy5fZ2xvYmFsT3B0aW9ucy5hdXRvQnJlYWRjcnVtYnM7XG5cbiAgICB2YXIgd3JhcHBlZEJ1aWx0SW5zID0gc2VsZi5fd3JhcHBlZEJ1aWx0SW5zO1xuXG4gICAgZnVuY3Rpb24gd3JhcFByb3AocHJvcCwgeGhyKSB7XG4gICAgICBpZiAocHJvcCBpbiB4aHIgJiYgaXNGdW5jdGlvbih4aHJbcHJvcF0pKSB7XG4gICAgICAgIGZpbGwoeGhyLCBwcm9wLCBmdW5jdGlvbihvcmlnKSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYud3JhcChvcmlnKTtcbiAgICAgICAgfSk7IC8vIGludGVudGlvbmFsbHkgZG9uJ3QgdHJhY2sgZmlsbGVkIG1ldGhvZHMgb24gWEhSIGluc3RhbmNlc1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhdXRvQnJlYWRjcnVtYnMueGhyICYmICdYTUxIdHRwUmVxdWVzdCcgaW4gX3dpbmRvdykge1xuICAgICAgdmFyIHhocnByb3RvID0gWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlO1xuICAgICAgZmlsbChcbiAgICAgICAgeGhycHJvdG8sXG4gICAgICAgICdvcGVuJyxcbiAgICAgICAgZnVuY3Rpb24ob3JpZ09wZW4pIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24obWV0aG9kLCB1cmwpIHtcbiAgICAgICAgICAgIC8vIHByZXNlcnZlIGFyaXR5XG5cbiAgICAgICAgICAgIC8vIGlmIFNlbnRyeSBrZXkgYXBwZWFycyBpbiBVUkwsIGRvbid0IGNhcHR1cmVcbiAgICAgICAgICAgIGlmIChpc1N0cmluZyh1cmwpICYmIHVybC5pbmRleE9mKHNlbGYuX2dsb2JhbEtleSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgIHRoaXMuX19yYXZlbl94aHIgPSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgICAgc3RhdHVzX2NvZGU6IG51bGxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG9yaWdPcGVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JhcHBlZEJ1aWx0SW5zXG4gICAgICApO1xuXG4gICAgICBmaWxsKFxuICAgICAgICB4aHJwcm90byxcbiAgICAgICAgJ3NlbmQnLFxuICAgICAgICBmdW5jdGlvbihvcmlnU2VuZCkge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvLyBwcmVzZXJ2ZSBhcml0eVxuICAgICAgICAgICAgdmFyIHhociA9IHRoaXM7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9ucmVhZHlzdGF0ZWNoYW5nZUhhbmRsZXIoKSB7XG4gICAgICAgICAgICAgIGlmICh4aHIuX19yYXZlbl94aHIgJiYgeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgLy8gdG91Y2hpbmcgc3RhdHVzQ29kZSBpbiBzb21lIHBsYXRmb3JtcyB0aHJvd3NcbiAgICAgICAgICAgICAgICAgIC8vIGFuIGV4Y2VwdGlvblxuICAgICAgICAgICAgICAgICAgeGhyLl9fcmF2ZW5feGhyLnN0YXR1c19jb2RlID0geGhyLnN0YXR1cztcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAvKiBkbyBub3RoaW5nICovXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5jYXB0dXJlQnJlYWRjcnVtYih7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnaHR0cCcsXG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ3hocicsXG4gICAgICAgICAgICAgICAgICBkYXRhOiB4aHIuX19yYXZlbl94aHJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBbJ29ubG9hZCcsICdvbmVycm9yJywgJ29ucHJvZ3Jlc3MnXTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcHJvcHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgd3JhcFByb3AocHJvcHNbal0sIHhocik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgnb25yZWFkeXN0YXRlY2hhbmdlJyBpbiB4aHIgJiYgaXNGdW5jdGlvbih4aHIub25yZWFkeXN0YXRlY2hhbmdlKSkge1xuICAgICAgICAgICAgICBmaWxsKFxuICAgICAgICAgICAgICAgIHhocixcbiAgICAgICAgICAgICAgICAnb25yZWFkeXN0YXRlY2hhbmdlJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihvcmlnKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi53cmFwKG9yaWcsIHVuZGVmaW5lZCwgb25yZWFkeXN0YXRlY2hhbmdlSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfSAvKiBpbnRlbnRpb25hbGx5IGRvbid0IHRyYWNrIHRoaXMgaW5zdHJ1bWVudGF0aW9uICovXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBpZiBvbnJlYWR5c3RhdGVjaGFuZ2Ugd2Fzbid0IGFjdHVhbGx5IHNldCBieSB0aGUgcGFnZSBvbiB0aGlzIHhociwgd2VcbiAgICAgICAgICAgICAgLy8gYXJlIGZyZWUgdG8gc2V0IG91ciBvd24gYW5kIGNhcHR1cmUgdGhlIGJyZWFkY3J1bWJcbiAgICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG9ucmVhZHlzdGF0ZWNoYW5nZUhhbmRsZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvcmlnU2VuZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHdyYXBwZWRCdWlsdEluc1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoYXV0b0JyZWFkY3J1bWJzLnhociAmJiAnZmV0Y2gnIGluIF93aW5kb3cpIHtcbiAgICAgIGZpbGwoXG4gICAgICAgIF93aW5kb3csXG4gICAgICAgICdmZXRjaCcsXG4gICAgICAgIGZ1bmN0aW9uKG9yaWdGZXRjaCkge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihmbiwgdCkge1xuICAgICAgICAgICAgLy8gcHJlc2VydmUgYXJpdHlcbiAgICAgICAgICAgIC8vIE1ha2UgYSBjb3B5IG9mIHRoZSBhcmd1bWVudHMgdG8gcHJldmVudCBkZW9wdGltaXphdGlvblxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BldGthYW50b25vdi9ibHVlYmlyZC93aWtpL09wdGltaXphdGlvbi1raWxsZXJzIzMyLWxlYWtpbmctYXJndW1lbnRzXG4gICAgICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZmV0Y2hJbnB1dCA9IGFyZ3NbMF07XG4gICAgICAgICAgICB2YXIgbWV0aG9kID0gJ0dFVCc7XG4gICAgICAgICAgICB2YXIgdXJsO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGZldGNoSW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIHVybCA9IGZldGNoSW5wdXQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCdSZXF1ZXN0JyBpbiBfd2luZG93ICYmIGZldGNoSW5wdXQgaW5zdGFuY2VvZiBfd2luZG93LlJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgdXJsID0gZmV0Y2hJbnB1dC51cmw7XG4gICAgICAgICAgICAgIGlmIChmZXRjaElucHV0Lm1ldGhvZCkge1xuICAgICAgICAgICAgICAgIG1ldGhvZCA9IGZldGNoSW5wdXQubWV0aG9kO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB1cmwgPSAnJyArIGZldGNoSW5wdXQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhcmdzWzFdICYmIGFyZ3NbMV0ubWV0aG9kKSB7XG4gICAgICAgICAgICAgIG1ldGhvZCA9IGFyZ3NbMV0ubWV0aG9kO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZmV0Y2hEYXRhID0ge1xuICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgIHN0YXR1c19jb2RlOiBudWxsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzZWxmLmNhcHR1cmVCcmVhZGNydW1iKHtcbiAgICAgICAgICAgICAgdHlwZTogJ2h0dHAnLFxuICAgICAgICAgICAgICBjYXRlZ29yeTogJ2ZldGNoJyxcbiAgICAgICAgICAgICAgZGF0YTogZmV0Y2hEYXRhXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9yaWdGZXRjaC5hcHBseSh0aGlzLCBhcmdzKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgIGZldGNoRGF0YS5zdGF0dXNfY29kZSA9IHJlc3BvbnNlLnN0YXR1cztcblxuICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB3cmFwcGVkQnVpbHRJbnNcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2FwdHVyZSBicmVhZGNydW1icyBmcm9tIGFueSBjbGljayB0aGF0IGlzIHVuaGFuZGxlZCAvIGJ1YmJsZWQgdXAgYWxsIHRoZSB3YXlcbiAgICAvLyB0byB0aGUgZG9jdW1lbnQuIERvIHRoaXMgYmVmb3JlIHdlIGluc3RydW1lbnQgYWRkRXZlbnRMaXN0ZW5lci5cbiAgICBpZiAoYXV0b0JyZWFkY3J1bWJzLmRvbSAmJiB0aGlzLl9oYXNEb2N1bWVudCkge1xuICAgICAgaWYgKF9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIF9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2JyZWFkY3J1bWJFdmVudEhhbmRsZXIoJ2NsaWNrJyksIGZhbHNlKTtcbiAgICAgICAgX2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgc2VsZi5fa2V5cHJlc3NFdmVudEhhbmRsZXIoKSwgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSUU4IENvbXBhdGliaWxpdHlcbiAgICAgICAgX2RvY3VtZW50LmF0dGFjaEV2ZW50KCdvbmNsaWNrJywgc2VsZi5fYnJlYWRjcnVtYkV2ZW50SGFuZGxlcignY2xpY2snKSk7XG4gICAgICAgIF9kb2N1bWVudC5hdHRhY2hFdmVudCgnb25rZXlwcmVzcycsIHNlbGYuX2tleXByZXNzRXZlbnRIYW5kbGVyKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlY29yZCBuYXZpZ2F0aW9uIChVUkwpIGNoYW5nZXNcbiAgICAvLyBOT1RFOiBpbiBDaHJvbWUgQXBwIGVudmlyb25tZW50LCB0b3VjaGluZyBoaXN0b3J5LnB1c2hTdGF0ZSwgKmV2ZW4gaW5zaWRlXG4gICAgLy8gICAgICAgYSB0cnkvY2F0Y2ggYmxvY2sqLCB3aWxsIGNhdXNlIENocm9tZSB0byBvdXRwdXQgYW4gZXJyb3IgdG8gY29uc29sZS5lcnJvclxuICAgIC8vIGJvcnJvd2VkIGZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvcHVsbC8xMzk0NS9maWxlc1xuICAgIHZhciBjaHJvbWUgPSBfd2luZG93LmNocm9tZTtcbiAgICB2YXIgaXNDaHJvbWVQYWNrYWdlZEFwcCA9IGNocm9tZSAmJiBjaHJvbWUuYXBwICYmIGNocm9tZS5hcHAucnVudGltZTtcbiAgICB2YXIgaGFzUHVzaEFuZFJlcGxhY2VTdGF0ZSA9XG4gICAgICAhaXNDaHJvbWVQYWNrYWdlZEFwcCAmJlxuICAgICAgX3dpbmRvdy5oaXN0b3J5ICYmXG4gICAgICBoaXN0b3J5LnB1c2hTdGF0ZSAmJlxuICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGU7XG4gICAgaWYgKGF1dG9CcmVhZGNydW1icy5sb2NhdGlvbiAmJiBoYXNQdXNoQW5kUmVwbGFjZVN0YXRlKSB7XG4gICAgICAvLyBUT0RPOiByZW1vdmUgb25wb3BzdGF0ZSBoYW5kbGVyIG9uIHVuaW5zdGFsbCgpXG4gICAgICB2YXIgb2xkT25Qb3BTdGF0ZSA9IF93aW5kb3cub25wb3BzdGF0ZTtcbiAgICAgIF93aW5kb3cub25wb3BzdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3VycmVudEhyZWYgPSBzZWxmLl9sb2NhdGlvbi5ocmVmO1xuICAgICAgICBzZWxmLl9jYXB0dXJlVXJsQ2hhbmdlKHNlbGYuX2xhc3RIcmVmLCBjdXJyZW50SHJlZik7XG5cbiAgICAgICAgaWYgKG9sZE9uUG9wU3RhdGUpIHtcbiAgICAgICAgICByZXR1cm4gb2xkT25Qb3BTdGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB2YXIgaGlzdG9yeVJlcGxhY2VtZW50RnVuY3Rpb24gPSBmdW5jdGlvbihvcmlnSGlzdEZ1bmN0aW9uKSB7XG4gICAgICAgIC8vIG5vdGUgaGlzdG9yeS5wdXNoU3RhdGUubGVuZ3RoIGlzIDA7IGludGVudGlvbmFsbHkgbm90IGRlY2xhcmluZ1xuICAgICAgICAvLyBwYXJhbXMgdG8gcHJlc2VydmUgMCBhcml0eVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oLyogc3RhdGUsIHRpdGxlLCB1cmwgKi8pIHtcbiAgICAgICAgICB2YXIgdXJsID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAvLyB1cmwgYXJndW1lbnQgaXMgb3B0aW9uYWxcbiAgICAgICAgICBpZiAodXJsKSB7XG4gICAgICAgICAgICAvLyBjb2VyY2UgdG8gc3RyaW5nICh0aGlzIGlzIHdoYXQgcHVzaFN0YXRlIGRvZXMpXG4gICAgICAgICAgICBzZWxmLl9jYXB0dXJlVXJsQ2hhbmdlKHNlbGYuX2xhc3RIcmVmLCB1cmwgKyAnJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG9yaWdIaXN0RnVuY3Rpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIGZpbGwoaGlzdG9yeSwgJ3B1c2hTdGF0ZScsIGhpc3RvcnlSZXBsYWNlbWVudEZ1bmN0aW9uLCB3cmFwcGVkQnVpbHRJbnMpO1xuICAgICAgZmlsbChoaXN0b3J5LCAncmVwbGFjZVN0YXRlJywgaGlzdG9yeVJlcGxhY2VtZW50RnVuY3Rpb24sIHdyYXBwZWRCdWlsdElucyk7XG4gICAgfVxuXG4gICAgaWYgKGF1dG9CcmVhZGNydW1icy5jb25zb2xlICYmICdjb25zb2xlJyBpbiBfd2luZG93ICYmIGNvbnNvbGUubG9nKSB7XG4gICAgICAvLyBjb25zb2xlXG4gICAgICB2YXIgY29uc29sZU1ldGhvZENhbGxiYWNrID0gZnVuY3Rpb24obXNnLCBkYXRhKSB7XG4gICAgICAgIHNlbGYuY2FwdHVyZUJyZWFkY3J1bWIoe1xuICAgICAgICAgIG1lc3NhZ2U6IG1zZyxcbiAgICAgICAgICBsZXZlbDogZGF0YS5sZXZlbCxcbiAgICAgICAgICBjYXRlZ29yeTogJ2NvbnNvbGUnXG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgZWFjaChbJ2RlYnVnJywgJ2luZm8nLCAnd2FybicsICdlcnJvcicsICdsb2cnXSwgZnVuY3Rpb24oXywgbGV2ZWwpIHtcbiAgICAgICAgd3JhcENvbnNvbGVNZXRob2QoY29uc29sZSwgbGV2ZWwsIGNvbnNvbGVNZXRob2RDYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX3Jlc3RvcmVCdWlsdEluczogZnVuY3Rpb24oKSB7XG4gICAgLy8gcmVzdG9yZSBhbnkgd3JhcHBlZCBidWlsdGluc1xuICAgIHZhciBidWlsdGluO1xuICAgIHdoaWxlICh0aGlzLl93cmFwcGVkQnVpbHRJbnMubGVuZ3RoKSB7XG4gICAgICBidWlsdGluID0gdGhpcy5fd3JhcHBlZEJ1aWx0SW5zLnNoaWZ0KCk7XG5cbiAgICAgIHZhciBvYmogPSBidWlsdGluWzBdLFxuICAgICAgICBuYW1lID0gYnVpbHRpblsxXSxcbiAgICAgICAgb3JpZyA9IGJ1aWx0aW5bMl07XG5cbiAgICAgIG9ialtuYW1lXSA9IG9yaWc7XG4gICAgfVxuICB9LFxuXG4gIF9kcmFpblBsdWdpbnM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIEZJWCBNRSBUT0RPXG4gICAgZWFjaCh0aGlzLl9wbHVnaW5zLCBmdW5jdGlvbihfLCBwbHVnaW4pIHtcbiAgICAgIHZhciBpbnN0YWxsZXIgPSBwbHVnaW5bMF07XG4gICAgICB2YXIgYXJncyA9IHBsdWdpblsxXTtcbiAgICAgIGluc3RhbGxlci5hcHBseShzZWxmLCBbc2VsZl0uY29uY2F0KGFyZ3MpKTtcbiAgICB9KTtcbiAgfSxcblxuICBfcGFyc2VEU046IGZ1bmN0aW9uKHN0cikge1xuICAgIHZhciBtID0gZHNuUGF0dGVybi5leGVjKHN0ciksXG4gICAgICBkc24gPSB7fSxcbiAgICAgIGkgPSA3O1xuXG4gICAgdHJ5IHtcbiAgICAgIHdoaWxlIChpLS0pIGRzbltkc25LZXlzW2ldXSA9IG1baV0gfHwgJyc7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IFJhdmVuQ29uZmlnRXJyb3IoJ0ludmFsaWQgRFNOOiAnICsgc3RyKTtcbiAgICB9XG5cbiAgICBpZiAoZHNuLnBhc3MgJiYgIXRoaXMuX2dsb2JhbE9wdGlvbnMuYWxsb3dTZWNyZXRLZXkpIHtcbiAgICAgIHRocm93IG5ldyBSYXZlbkNvbmZpZ0Vycm9yKFxuICAgICAgICAnRG8gbm90IHNwZWNpZnkgeW91ciBzZWNyZXQga2V5IGluIHRoZSBEU04uIFNlZTogaHR0cDovL2JpdC5seS9yYXZlbi1zZWNyZXQta2V5J1xuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZHNuO1xuICB9LFxuXG4gIF9nZXRHbG9iYWxTZXJ2ZXI6IGZ1bmN0aW9uKHVyaSkge1xuICAgIC8vIGFzc2VtYmxlIHRoZSBlbmRwb2ludCBmcm9tIHRoZSB1cmkgcGllY2VzXG4gICAgdmFyIGdsb2JhbFNlcnZlciA9ICcvLycgKyB1cmkuaG9zdCArICh1cmkucG9ydCA/ICc6JyArIHVyaS5wb3J0IDogJycpO1xuXG4gICAgaWYgKHVyaS5wcm90b2NvbCkge1xuICAgICAgZ2xvYmFsU2VydmVyID0gdXJpLnByb3RvY29sICsgJzonICsgZ2xvYmFsU2VydmVyO1xuICAgIH1cbiAgICByZXR1cm4gZ2xvYmFsU2VydmVyO1xuICB9LFxuXG4gIF9oYW5kbGVPbkVycm9yU3RhY2tJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAvLyBpZiB3ZSBhcmUgaW50ZW50aW9uYWxseSBpZ25vcmluZyBlcnJvcnMgdmlhIG9uZXJyb3IsIGJhaWwgb3V0XG4gICAgaWYgKCF0aGlzLl9pZ25vcmVPbkVycm9yKSB7XG4gICAgICB0aGlzLl9oYW5kbGVTdGFja0luZm8uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH0sXG5cbiAgX2hhbmRsZVN0YWNrSW5mbzogZnVuY3Rpb24oc3RhY2tJbmZvLCBvcHRpb25zKSB7XG4gICAgdmFyIGZyYW1lcyA9IHRoaXMuX3ByZXBhcmVGcmFtZXMoc3RhY2tJbmZvLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX3RyaWdnZXJFdmVudCgnaGFuZGxlJywge1xuICAgICAgc3RhY2tJbmZvOiBzdGFja0luZm8sXG4gICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfSk7XG5cbiAgICB0aGlzLl9wcm9jZXNzRXhjZXB0aW9uKFxuICAgICAgc3RhY2tJbmZvLm5hbWUsXG4gICAgICBzdGFja0luZm8ubWVzc2FnZSxcbiAgICAgIHN0YWNrSW5mby51cmwsXG4gICAgICBzdGFja0luZm8ubGluZW5vLFxuICAgICAgZnJhbWVzLFxuICAgICAgb3B0aW9uc1xuICAgICk7XG4gIH0sXG5cbiAgX3ByZXBhcmVGcmFtZXM6IGZ1bmN0aW9uKHN0YWNrSW5mbywgb3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZnJhbWVzID0gW107XG4gICAgaWYgKHN0YWNrSW5mby5zdGFjayAmJiBzdGFja0luZm8uc3RhY2subGVuZ3RoKSB7XG4gICAgICBlYWNoKHN0YWNrSW5mby5zdGFjaywgZnVuY3Rpb24oaSwgc3RhY2spIHtcbiAgICAgICAgdmFyIGZyYW1lID0gc2VsZi5fbm9ybWFsaXplRnJhbWUoc3RhY2ssIHN0YWNrSW5mby51cmwpO1xuICAgICAgICBpZiAoZnJhbWUpIHtcbiAgICAgICAgICBmcmFtZXMucHVzaChmcmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBlLmcuIGZyYW1lcyBjYXB0dXJlZCB2aWEgY2FwdHVyZU1lc3NhZ2UgdGhyb3dcbiAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMudHJpbUhlYWRGcmFtZXMpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBvcHRpb25zLnRyaW1IZWFkRnJhbWVzICYmIGogPCBmcmFtZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBmcmFtZXNbal0uaW5fYXBwID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZnJhbWVzID0gZnJhbWVzLnNsaWNlKDAsIHRoaXMuX2dsb2JhbE9wdGlvbnMuc3RhY2tUcmFjZUxpbWl0KTtcbiAgICByZXR1cm4gZnJhbWVzO1xuICB9LFxuXG4gIF9ub3JtYWxpemVGcmFtZTogZnVuY3Rpb24oZnJhbWUsIHN0YWNrSW5mb1VybCkge1xuICAgIC8vIG5vcm1hbGl6ZSB0aGUgZnJhbWVzIGRhdGFcbiAgICB2YXIgbm9ybWFsaXplZCA9IHtcbiAgICAgIGZpbGVuYW1lOiBmcmFtZS51cmwsXG4gICAgICBsaW5lbm86IGZyYW1lLmxpbmUsXG4gICAgICBjb2xubzogZnJhbWUuY29sdW1uLFxuICAgICAgZnVuY3Rpb246IGZyYW1lLmZ1bmMgfHwgJz8nXG4gICAgfTtcblxuICAgIC8vIENhc2Ugd2hlbiB3ZSBkb24ndCBoYXZlIGFueSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZXJyb3JcbiAgICAvLyBFLmcuIHRocm93aW5nIGEgc3RyaW5nIG9yIHJhdyBvYmplY3QsIGluc3RlYWQgb2YgYW4gYEVycm9yYCBpbiBGaXJlZm94XG4gICAgLy8gR2VuZXJhdGluZyBzeW50aGV0aWMgZXJyb3IgZG9lc24ndCBhZGQgYW55IHZhbHVlIGhlcmVcbiAgICAvL1xuICAgIC8vIFdlIHNob3VsZCBwcm9iYWJseSBzb21laG93IGxldCBhIHVzZXIga25vdyB0aGF0IHRoZXkgc2hvdWxkIGZpeCB0aGVpciBjb2RlXG4gICAgaWYgKCFmcmFtZS51cmwpIHtcbiAgICAgIG5vcm1hbGl6ZWQuZmlsZW5hbWUgPSBzdGFja0luZm9Vcmw7IC8vIGZhbGxiYWNrIHRvIHdob2xlIHN0YWNrcyB1cmwgZnJvbSBvbmVycm9yIGhhbmRsZXJcbiAgICB9XG5cbiAgICBub3JtYWxpemVkLmluX2FwcCA9ICEvLyBkZXRlcm1pbmUgaWYgYW4gZXhjZXB0aW9uIGNhbWUgZnJvbSBvdXRzaWRlIG9mIG91ciBhcHBcbiAgICAvLyBmaXJzdCB3ZSBjaGVjayB0aGUgZ2xvYmFsIGluY2x1ZGVQYXRocyBsaXN0LlxuICAgIChcbiAgICAgICghIXRoaXMuX2dsb2JhbE9wdGlvbnMuaW5jbHVkZVBhdGhzLnRlc3QgJiZcbiAgICAgICAgIXRoaXMuX2dsb2JhbE9wdGlvbnMuaW5jbHVkZVBhdGhzLnRlc3Qobm9ybWFsaXplZC5maWxlbmFtZSkpIHx8XG4gICAgICAvLyBOb3cgd2UgY2hlY2sgZm9yIGZ1biwgaWYgdGhlIGZ1bmN0aW9uIG5hbWUgaXMgUmF2ZW4gb3IgVHJhY2VLaXRcbiAgICAgIC8oUmF2ZW58VHJhY2VLaXQpXFwuLy50ZXN0KG5vcm1hbGl6ZWRbJ2Z1bmN0aW9uJ10pIHx8XG4gICAgICAvLyBmaW5hbGx5LCB3ZSBkbyBhIGxhc3QgZGl0Y2ggZWZmb3J0IGFuZCBjaGVjayBmb3IgcmF2ZW4ubWluLmpzXG4gICAgICAvcmF2ZW5cXC4obWluXFwuKT9qcyQvLnRlc3Qobm9ybWFsaXplZC5maWxlbmFtZSlcbiAgICApO1xuXG4gICAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG4gIH0sXG5cbiAgX3Byb2Nlc3NFeGNlcHRpb246IGZ1bmN0aW9uKHR5cGUsIG1lc3NhZ2UsIGZpbGV1cmwsIGxpbmVubywgZnJhbWVzLCBvcHRpb25zKSB7XG4gICAgdmFyIHByZWZpeGVkTWVzc2FnZSA9ICh0eXBlID8gdHlwZSArICc6ICcgOiAnJykgKyAobWVzc2FnZSB8fCAnJyk7XG4gICAgaWYgKFxuICAgICAgISF0aGlzLl9nbG9iYWxPcHRpb25zLmlnbm9yZUVycm9ycy50ZXN0ICYmXG4gICAgICAodGhpcy5fZ2xvYmFsT3B0aW9ucy5pZ25vcmVFcnJvcnMudGVzdChtZXNzYWdlKSB8fFxuICAgICAgICB0aGlzLl9nbG9iYWxPcHRpb25zLmlnbm9yZUVycm9ycy50ZXN0KHByZWZpeGVkTWVzc2FnZSkpXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHN0YWNrdHJhY2U7XG5cbiAgICBpZiAoZnJhbWVzICYmIGZyYW1lcy5sZW5ndGgpIHtcbiAgICAgIGZpbGV1cmwgPSBmcmFtZXNbMF0uZmlsZW5hbWUgfHwgZmlsZXVybDtcbiAgICAgIC8vIFNlbnRyeSBleHBlY3RzIGZyYW1lcyBvbGRlc3QgdG8gbmV3ZXN0XG4gICAgICAvLyBhbmQgSlMgc2VuZHMgdGhlbSBhcyBuZXdlc3QgdG8gb2xkZXN0XG4gICAgICBmcmFtZXMucmV2ZXJzZSgpO1xuICAgICAgc3RhY2t0cmFjZSA9IHtmcmFtZXM6IGZyYW1lc307XG4gICAgfSBlbHNlIGlmIChmaWxldXJsKSB7XG4gICAgICBzdGFja3RyYWNlID0ge1xuICAgICAgICBmcmFtZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBmaWxlbmFtZTogZmlsZXVybCxcbiAgICAgICAgICAgIGxpbmVubzogbGluZW5vLFxuICAgICAgICAgICAgaW5fYXBwOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICEhdGhpcy5fZ2xvYmFsT3B0aW9ucy5pZ25vcmVVcmxzLnRlc3QgJiZcbiAgICAgIHRoaXMuX2dsb2JhbE9wdGlvbnMuaWdub3JlVXJscy50ZXN0KGZpbGV1cmwpXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgISF0aGlzLl9nbG9iYWxPcHRpb25zLndoaXRlbGlzdFVybHMudGVzdCAmJlxuICAgICAgIXRoaXMuX2dsb2JhbE9wdGlvbnMud2hpdGVsaXN0VXJscy50ZXN0KGZpbGV1cmwpXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGRhdGEgPSBvYmplY3RNZXJnZShcbiAgICAgIHtcbiAgICAgICAgLy8gc2VudHJ5LmludGVyZmFjZXMuRXhjZXB0aW9uXG4gICAgICAgIGV4Y2VwdGlvbjoge1xuICAgICAgICAgIHZhbHVlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICB2YWx1ZTogbWVzc2FnZSxcbiAgICAgICAgICAgICAgc3RhY2t0cmFjZTogc3RhY2t0cmFjZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgY3VscHJpdDogZmlsZXVybFxuICAgICAgfSxcbiAgICAgIG9wdGlvbnNcbiAgICApO1xuXG4gICAgLy8gRmlyZSBhd2F5IVxuICAgIHRoaXMuX3NlbmQoZGF0YSk7XG4gIH0sXG5cbiAgX3RyaW1QYWNrZXQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyBGb3Igbm93LCB3ZSBvbmx5IHdhbnQgdG8gdHJ1bmNhdGUgdGhlIHR3byBkaWZmZXJlbnQgbWVzc2FnZXNcbiAgICAvLyBidXQgdGhpcyBjb3VsZC9zaG91bGQgYmUgZXhwYW5kZWQgdG8ganVzdCB0cmltIGV2ZXJ5dGhpbmdcbiAgICB2YXIgbWF4ID0gdGhpcy5fZ2xvYmFsT3B0aW9ucy5tYXhNZXNzYWdlTGVuZ3RoO1xuICAgIGlmIChkYXRhLm1lc3NhZ2UpIHtcbiAgICAgIGRhdGEubWVzc2FnZSA9IHRydW5jYXRlKGRhdGEubWVzc2FnZSwgbWF4KTtcbiAgICB9XG4gICAgaWYgKGRhdGEuZXhjZXB0aW9uKSB7XG4gICAgICB2YXIgZXhjZXB0aW9uID0gZGF0YS5leGNlcHRpb24udmFsdWVzWzBdO1xuICAgICAgZXhjZXB0aW9uLnZhbHVlID0gdHJ1bmNhdGUoZXhjZXB0aW9uLnZhbHVlLCBtYXgpO1xuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gZGF0YS5yZXF1ZXN0O1xuICAgIGlmIChyZXF1ZXN0KSB7XG4gICAgICBpZiAocmVxdWVzdC51cmwpIHtcbiAgICAgICAgcmVxdWVzdC51cmwgPSB0cnVuY2F0ZShyZXF1ZXN0LnVybCwgdGhpcy5fZ2xvYmFsT3B0aW9ucy5tYXhVcmxMZW5ndGgpO1xuICAgICAgfVxuICAgICAgaWYgKHJlcXVlc3QuUmVmZXJlcikge1xuICAgICAgICByZXF1ZXN0LlJlZmVyZXIgPSB0cnVuY2F0ZShyZXF1ZXN0LlJlZmVyZXIsIHRoaXMuX2dsb2JhbE9wdGlvbnMubWF4VXJsTGVuZ3RoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZGF0YS5icmVhZGNydW1icyAmJiBkYXRhLmJyZWFkY3J1bWJzLnZhbHVlcylcbiAgICAgIHRoaXMuX3RyaW1CcmVhZGNydW1icyhkYXRhLmJyZWFkY3J1bWJzKTtcblxuICAgIHJldHVybiBkYXRhO1xuICB9LFxuXG4gIC8qKlxuICAgICAqIFRydW5jYXRlIGJyZWFkY3J1bWIgdmFsdWVzIChyaWdodCBub3cganVzdCBVUkxzKVxuICAgICAqL1xuICBfdHJpbUJyZWFkY3J1bWJzOiBmdW5jdGlvbihicmVhZGNydW1icykge1xuICAgIC8vIGtub3duIGJyZWFkY3J1bWIgcHJvcGVydGllcyB3aXRoIHVybHNcbiAgICAvLyBUT0RPOiBhbHNvIGNvbnNpZGVyIGFyYml0cmFyeSBwcm9wIHZhbHVlcyB0aGF0IHN0YXJ0IHdpdGggKGh0dHBzPyk/Oi8vXG4gICAgdmFyIHVybFByb3BzID0gWyd0bycsICdmcm9tJywgJ3VybCddLFxuICAgICAgdXJsUHJvcCxcbiAgICAgIGNydW1iLFxuICAgICAgZGF0YTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnJlYWRjcnVtYnMudmFsdWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICBjcnVtYiA9IGJyZWFkY3J1bWJzLnZhbHVlc1tpXTtcbiAgICAgIGlmIChcbiAgICAgICAgIWNydW1iLmhhc093blByb3BlcnR5KCdkYXRhJykgfHxcbiAgICAgICAgIWlzT2JqZWN0KGNydW1iLmRhdGEpIHx8XG4gICAgICAgIG9iamVjdEZyb3plbihjcnVtYi5kYXRhKVxuICAgICAgKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgZGF0YSA9IG9iamVjdE1lcmdlKHt9LCBjcnVtYi5kYXRhKTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdXJsUHJvcHMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgdXJsUHJvcCA9IHVybFByb3BzW2pdO1xuICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eSh1cmxQcm9wKSAmJiBkYXRhW3VybFByb3BdKSB7XG4gICAgICAgICAgZGF0YVt1cmxQcm9wXSA9IHRydW5jYXRlKGRhdGFbdXJsUHJvcF0sIHRoaXMuX2dsb2JhbE9wdGlvbnMubWF4VXJsTGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWRjcnVtYnMudmFsdWVzW2ldLmRhdGEgPSBkYXRhO1xuICAgIH1cbiAgfSxcblxuICBfZ2V0SHR0cERhdGE6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5faGFzTmF2aWdhdG9yICYmICF0aGlzLl9oYXNEb2N1bWVudCkgcmV0dXJuO1xuICAgIHZhciBodHRwRGF0YSA9IHt9O1xuXG4gICAgaWYgKHRoaXMuX2hhc05hdmlnYXRvciAmJiBfbmF2aWdhdG9yLnVzZXJBZ2VudCkge1xuICAgICAgaHR0cERhdGEuaGVhZGVycyA9IHtcbiAgICAgICAgJ1VzZXItQWdlbnQnOiBuYXZpZ2F0b3IudXNlckFnZW50XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9oYXNEb2N1bWVudCkge1xuICAgICAgaWYgKF9kb2N1bWVudC5sb2NhdGlvbiAmJiBfZG9jdW1lbnQubG9jYXRpb24uaHJlZikge1xuICAgICAgICBodHRwRGF0YS51cmwgPSBfZG9jdW1lbnQubG9jYXRpb24uaHJlZjtcbiAgICAgIH1cbiAgICAgIGlmIChfZG9jdW1lbnQucmVmZXJyZXIpIHtcbiAgICAgICAgaWYgKCFodHRwRGF0YS5oZWFkZXJzKSBodHRwRGF0YS5oZWFkZXJzID0ge307XG4gICAgICAgIGh0dHBEYXRhLmhlYWRlcnMuUmVmZXJlciA9IF9kb2N1bWVudC5yZWZlcnJlcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaHR0cERhdGE7XG4gIH0sXG5cbiAgX3Jlc2V0QmFja29mZjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fYmFja29mZkR1cmF0aW9uID0gMDtcbiAgICB0aGlzLl9iYWNrb2ZmU3RhcnQgPSBudWxsO1xuICB9LFxuXG4gIF9zaG91bGRCYWNrb2ZmOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fYmFja29mZkR1cmF0aW9uICYmIG5vdygpIC0gdGhpcy5fYmFja29mZlN0YXJ0IDwgdGhpcy5fYmFja29mZkR1cmF0aW9uO1xuICB9LFxuXG4gIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgaW4tcHJvY2VzcyBkYXRhIHBheWxvYWQgbWF0Y2hlcyB0aGUgc2lnbmF0dXJlXG4gICAgICogb2YgdGhlIHByZXZpb3VzbHktc2VudCBkYXRhXG4gICAgICpcbiAgICAgKiBOT1RFOiBUaGlzIGhhcyB0byBiZSBkb25lIGF0IHRoaXMgbGV2ZWwgYmVjYXVzZSBUcmFjZUtpdCBjYW4gZ2VuZXJhdGVcbiAgICAgKiAgICAgICBkYXRhIGZyb20gd2luZG93Lm9uZXJyb3IgV0lUSE9VVCBhbiBleGNlcHRpb24gb2JqZWN0IChJRTgsIElFOSxcbiAgICAgKiAgICAgICBvdGhlciBvbGQgYnJvd3NlcnMpLiBUaGlzIGNhbiB0YWtlIHRoZSBmb3JtIG9mIGFuIFwiZXhjZXB0aW9uXCJcbiAgICAgKiAgICAgICBkYXRhIG9iamVjdCB3aXRoIGEgc2luZ2xlIGZyYW1lIChkZXJpdmVkIGZyb20gdGhlIG9uZXJyb3IgYXJncykuXG4gICAgICovXG4gIF9pc1JlcGVhdERhdGE6IGZ1bmN0aW9uKGN1cnJlbnQpIHtcbiAgICB2YXIgbGFzdCA9IHRoaXMuX2xhc3REYXRhO1xuXG4gICAgaWYgKFxuICAgICAgIWxhc3QgfHxcbiAgICAgIGN1cnJlbnQubWVzc2FnZSAhPT0gbGFzdC5tZXNzYWdlIHx8IC8vIGRlZmluZWQgZm9yIGNhcHR1cmVNZXNzYWdlXG4gICAgICBjdXJyZW50LmN1bHByaXQgIT09IGxhc3QuY3VscHJpdCAvLyBkZWZpbmVkIGZvciBjYXB0dXJlRXhjZXB0aW9uL29uZXJyb3JcbiAgICApXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBTdGFja3RyYWNlIGludGVyZmFjZSAoaS5lLiBmcm9tIGNhcHR1cmVNZXNzYWdlKVxuICAgIGlmIChjdXJyZW50LnN0YWNrdHJhY2UgfHwgbGFzdC5zdGFja3RyYWNlKSB7XG4gICAgICByZXR1cm4gaXNTYW1lU3RhY2t0cmFjZShjdXJyZW50LnN0YWNrdHJhY2UsIGxhc3Quc3RhY2t0cmFjZSk7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50LmV4Y2VwdGlvbiB8fCBsYXN0LmV4Y2VwdGlvbikge1xuICAgICAgLy8gRXhjZXB0aW9uIGludGVyZmFjZSAoaS5lLiBmcm9tIGNhcHR1cmVFeGNlcHRpb24vb25lcnJvcilcbiAgICAgIHJldHVybiBpc1NhbWVFeGNlcHRpb24oY3VycmVudC5leGNlcHRpb24sIGxhc3QuZXhjZXB0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICBfc2V0QmFja29mZlN0YXRlOiBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgLy8gSWYgd2UgYXJlIGFscmVhZHkgaW4gYSBiYWNrb2ZmIHN0YXRlLCBkb24ndCBjaGFuZ2UgYW55dGhpbmdcbiAgICBpZiAodGhpcy5fc2hvdWxkQmFja29mZigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHN0YXR1cyA9IHJlcXVlc3Quc3RhdHVzO1xuXG4gICAgLy8gNDAwIC0gcHJvamVjdF9pZCBkb2Vzbid0IGV4aXN0IG9yIHNvbWUgb3RoZXIgZmF0YWxcbiAgICAvLyA0MDEgLSBpbnZhbGlkL3Jldm9rZWQgZHNuXG4gICAgLy8gNDI5IC0gdG9vIG1hbnkgcmVxdWVzdHNcbiAgICBpZiAoIShzdGF0dXMgPT09IDQwMCB8fCBzdGF0dXMgPT09IDQwMSB8fCBzdGF0dXMgPT09IDQyOSkpIHJldHVybjtcblxuICAgIHZhciByZXRyeTtcbiAgICB0cnkge1xuICAgICAgLy8gSWYgUmV0cnktQWZ0ZXIgaXMgbm90IGluIEFjY2Vzcy1Db250cm9sLUV4cG9zZS1IZWFkZXJzLCBtb3N0XG4gICAgICAvLyBicm93c2VycyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiB0cnlpbmcgdG8gYWNjZXNzIGl0XG4gICAgICByZXRyeSA9IHJlcXVlc3QuZ2V0UmVzcG9uc2VIZWFkZXIoJ1JldHJ5LUFmdGVyJyk7XG4gICAgICByZXRyeSA9IHBhcnNlSW50KHJldHJ5LCAxMCkgKiAxMDAwOyAvLyBSZXRyeS1BZnRlciBpcyByZXR1cm5lZCBpbiBzZWNvbmRzXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLyogZXNsaW50IG5vLWVtcHR5OjAgKi9cbiAgICB9XG5cbiAgICB0aGlzLl9iYWNrb2ZmRHVyYXRpb24gPSByZXRyeVxuICAgICAgPyAvLyBJZiBTZW50cnkgc2VydmVyIHJldHVybmVkIGEgUmV0cnktQWZ0ZXIgdmFsdWUsIHVzZSBpdFxuICAgICAgICByZXRyeVxuICAgICAgOiAvLyBPdGhlcndpc2UsIGRvdWJsZSB0aGUgbGFzdCBiYWNrb2ZmIGR1cmF0aW9uIChzdGFydHMgYXQgMSBzZWMpXG4gICAgICAgIHRoaXMuX2JhY2tvZmZEdXJhdGlvbiAqIDIgfHwgMTAwMDtcblxuICAgIHRoaXMuX2JhY2tvZmZTdGFydCA9IG5vdygpO1xuICB9LFxuXG4gIF9zZW5kOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIGdsb2JhbE9wdGlvbnMgPSB0aGlzLl9nbG9iYWxPcHRpb25zO1xuXG4gICAgdmFyIGJhc2VEYXRhID0ge1xuICAgICAgICBwcm9qZWN0OiB0aGlzLl9nbG9iYWxQcm9qZWN0LFxuICAgICAgICBsb2dnZXI6IGdsb2JhbE9wdGlvbnMubG9nZ2VyLFxuICAgICAgICBwbGF0Zm9ybTogJ2phdmFzY3JpcHQnXG4gICAgICB9LFxuICAgICAgaHR0cERhdGEgPSB0aGlzLl9nZXRIdHRwRGF0YSgpO1xuXG4gICAgaWYgKGh0dHBEYXRhKSB7XG4gICAgICBiYXNlRGF0YS5yZXF1ZXN0ID0gaHR0cERhdGE7XG4gICAgfVxuXG4gICAgLy8gSEFDSzogZGVsZXRlIGB0cmltSGVhZEZyYW1lc2AgdG8gcHJldmVudCBmcm9tIGFwcGVhcmluZyBpbiBvdXRib3VuZCBwYXlsb2FkXG4gICAgaWYgKGRhdGEudHJpbUhlYWRGcmFtZXMpIGRlbGV0ZSBkYXRhLnRyaW1IZWFkRnJhbWVzO1xuXG4gICAgZGF0YSA9IG9iamVjdE1lcmdlKGJhc2VEYXRhLCBkYXRhKTtcblxuICAgIC8vIE1lcmdlIGluIHRoZSB0YWdzIGFuZCBleHRyYSBzZXBhcmF0ZWx5IHNpbmNlIG9iamVjdE1lcmdlIGRvZXNuJ3QgaGFuZGxlIGEgZGVlcCBtZXJnZVxuICAgIGRhdGEudGFncyA9IG9iamVjdE1lcmdlKG9iamVjdE1lcmdlKHt9LCB0aGlzLl9nbG9iYWxDb250ZXh0LnRhZ3MpLCBkYXRhLnRhZ3MpO1xuICAgIGRhdGEuZXh0cmEgPSBvYmplY3RNZXJnZShvYmplY3RNZXJnZSh7fSwgdGhpcy5fZ2xvYmFsQ29udGV4dC5leHRyYSksIGRhdGEuZXh0cmEpO1xuXG4gICAgLy8gU2VuZCBhbG9uZyBvdXIgb3duIGNvbGxlY3RlZCBtZXRhZGF0YSB3aXRoIGV4dHJhXG4gICAgZGF0YS5leHRyYVsnc2Vzc2lvbjpkdXJhdGlvbiddID0gbm93KCkgLSB0aGlzLl9zdGFydFRpbWU7XG5cbiAgICBpZiAodGhpcy5fYnJlYWRjcnVtYnMgJiYgdGhpcy5fYnJlYWRjcnVtYnMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gaW50ZW50aW9uYWxseSBtYWtlIHNoYWxsb3cgY29weSBzbyB0aGF0IGFkZGl0aW9uc1xuICAgICAgLy8gdG8gYnJlYWRjcnVtYnMgYXJlbid0IGFjY2lkZW50YWxseSBzZW50IGluIHRoaXMgcmVxdWVzdFxuICAgICAgZGF0YS5icmVhZGNydW1icyA9IHtcbiAgICAgICAgdmFsdWVzOiBbXS5zbGljZS5jYWxsKHRoaXMuX2JyZWFkY3J1bWJzLCAwKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gdGFncy9leHRyYSwgc3RyaXAgdGhlIGtleSBmcm9tIHRoZSBwYXlsb2FkIGFsbHRvZ3RoZXIuXG4gICAgaWYgKGlzRW1wdHlPYmplY3QoZGF0YS50YWdzKSkgZGVsZXRlIGRhdGEudGFncztcblxuICAgIGlmICh0aGlzLl9nbG9iYWxDb250ZXh0LnVzZXIpIHtcbiAgICAgIC8vIHNlbnRyeS5pbnRlcmZhY2VzLlVzZXJcbiAgICAgIGRhdGEudXNlciA9IHRoaXMuX2dsb2JhbENvbnRleHQudXNlcjtcbiAgICB9XG5cbiAgICAvLyBJbmNsdWRlIHRoZSBlbnZpcm9ubWVudCBpZiBpdCdzIGRlZmluZWQgaW4gZ2xvYmFsT3B0aW9uc1xuICAgIGlmIChnbG9iYWxPcHRpb25zLmVudmlyb25tZW50KSBkYXRhLmVudmlyb25tZW50ID0gZ2xvYmFsT3B0aW9ucy5lbnZpcm9ubWVudDtcblxuICAgIC8vIEluY2x1ZGUgdGhlIHJlbGVhc2UgaWYgaXQncyBkZWZpbmVkIGluIGdsb2JhbE9wdGlvbnNcbiAgICBpZiAoZ2xvYmFsT3B0aW9ucy5yZWxlYXNlKSBkYXRhLnJlbGVhc2UgPSBnbG9iYWxPcHRpb25zLnJlbGVhc2U7XG5cbiAgICAvLyBJbmNsdWRlIHNlcnZlcl9uYW1lIGlmIGl0J3MgZGVmaW5lZCBpbiBnbG9iYWxPcHRpb25zXG4gICAgaWYgKGdsb2JhbE9wdGlvbnMuc2VydmVyTmFtZSkgZGF0YS5zZXJ2ZXJfbmFtZSA9IGdsb2JhbE9wdGlvbnMuc2VydmVyTmFtZTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGdsb2JhbE9wdGlvbnMuZGF0YUNhbGxiYWNrKSkge1xuICAgICAgZGF0YSA9IGdsb2JhbE9wdGlvbnMuZGF0YUNhbGxiYWNrKGRhdGEpIHx8IGRhdGE7XG4gICAgfVxuXG4gICAgLy8gV2h5Pz8/Pz8/Pz8/P1xuICAgIGlmICghZGF0YSB8fCBpc0VtcHR5T2JqZWN0KGRhdGEpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHJlcXVlc3Qgc2hvdWxkIGJlIGZpbHRlcmVkIG9yIG5vdFxuICAgIGlmIChcbiAgICAgIGlzRnVuY3Rpb24oZ2xvYmFsT3B0aW9ucy5zaG91bGRTZW5kQ2FsbGJhY2spICYmXG4gICAgICAhZ2xvYmFsT3B0aW9ucy5zaG91bGRTZW5kQ2FsbGJhY2soZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBCYWNrb2ZmIHN0YXRlOiBTZW50cnkgc2VydmVyIHByZXZpb3VzbHkgcmVzcG9uZGVkIHcvIGFuIGVycm9yIChlLmcuIDQyOSAtIHRvbyBtYW55IHJlcXVlc3RzKSxcbiAgICAvLyBzbyBkcm9wIHJlcXVlc3RzIHVudGlsIFwiY29vbC1vZmZcIiBwZXJpb2QgaGFzIGVsYXBzZWQuXG4gICAgaWYgKHRoaXMuX3Nob3VsZEJhY2tvZmYoKSkge1xuICAgICAgdGhpcy5fbG9nRGVidWcoJ3dhcm4nLCAnUmF2ZW4gZHJvcHBlZCBlcnJvciBkdWUgdG8gYmFja29mZjogJywgZGF0YSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBnbG9iYWxPcHRpb25zLnNhbXBsZVJhdGUgPT09ICdudW1iZXInKSB7XG4gICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IGdsb2JhbE9wdGlvbnMuc2FtcGxlUmF0ZSkge1xuICAgICAgICB0aGlzLl9zZW5kUHJvY2Vzc2VkUGF5bG9hZChkYXRhKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2VuZFByb2Nlc3NlZFBheWxvYWQoZGF0YSk7XG4gICAgfVxuICB9LFxuXG4gIF9nZXRVdWlkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdXVpZDQoKTtcbiAgfSxcblxuICBfc2VuZFByb2Nlc3NlZFBheWxvYWQ6IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBnbG9iYWxPcHRpb25zID0gdGhpcy5fZ2xvYmFsT3B0aW9ucztcblxuICAgIGlmICghdGhpcy5pc1NldHVwKCkpIHJldHVybjtcblxuICAgIC8vIFRyeSBhbmQgY2xlYW4gdXAgdGhlIHBhY2tldCBiZWZvcmUgc2VuZGluZyBieSB0cnVuY2F0aW5nIGxvbmcgdmFsdWVzXG4gICAgZGF0YSA9IHRoaXMuX3RyaW1QYWNrZXQoZGF0YSk7XG5cbiAgICAvLyBpZGVhbGx5IGR1cGxpY2F0ZSBlcnJvciB0ZXN0aW5nIHNob3VsZCBvY2N1ciAqYmVmb3JlKiBkYXRhQ2FsbGJhY2svc2hvdWxkU2VuZENhbGxiYWNrLFxuICAgIC8vIGJ1dCB0aGlzIHdvdWxkIHJlcXVpcmUgY29weWluZyBhbiB1bi10cnVuY2F0ZWQgY29weSBvZiB0aGUgZGF0YSBwYWNrZXQsIHdoaWNoIGNhbiBiZVxuICAgIC8vIGFyYml0cmFyaWx5IGRlZXAgKGV4dHJhX2RhdGEpIC0tIGNvdWxkIGJlIHdvcnRod2hpbGU/IHdpbGwgcmV2aXNpdFxuICAgIGlmICghdGhpcy5fZ2xvYmFsT3B0aW9ucy5hbGxvd0R1cGxpY2F0ZXMgJiYgdGhpcy5faXNSZXBlYXREYXRhKGRhdGEpKSB7XG4gICAgICB0aGlzLl9sb2dEZWJ1Zygnd2FybicsICdSYXZlbiBkcm9wcGVkIHJlcGVhdCBldmVudDogJywgZGF0YSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU2VuZCBhbG9uZyBhbiBldmVudF9pZCBpZiBub3QgZXhwbGljaXRseSBwYXNzZWQuXG4gICAgLy8gVGhpcyBldmVudF9pZCBjYW4gYmUgdXNlZCB0byByZWZlcmVuY2UgdGhlIGVycm9yIHdpdGhpbiBTZW50cnkgaXRzZWxmLlxuICAgIC8vIFNldCBsYXN0RXZlbnRJZCBhZnRlciB3ZSBrbm93IHRoZSBlcnJvciBzaG91bGQgYWN0dWFsbHkgYmUgc2VudFxuICAgIHRoaXMuX2xhc3RFdmVudElkID0gZGF0YS5ldmVudF9pZCB8fCAoZGF0YS5ldmVudF9pZCA9IHRoaXMuX2dldFV1aWQoKSk7XG5cbiAgICAvLyBTdG9yZSBvdXRib3VuZCBwYXlsb2FkIGFmdGVyIHRyaW1cbiAgICB0aGlzLl9sYXN0RGF0YSA9IGRhdGE7XG5cbiAgICB0aGlzLl9sb2dEZWJ1ZygnZGVidWcnLCAnUmF2ZW4gYWJvdXQgdG8gc2VuZDonLCBkYXRhKTtcblxuICAgIHZhciBhdXRoID0ge1xuICAgICAgc2VudHJ5X3ZlcnNpb246ICc3JyxcbiAgICAgIHNlbnRyeV9jbGllbnQ6ICdyYXZlbi1qcy8nICsgdGhpcy5WRVJTSU9OLFxuICAgICAgc2VudHJ5X2tleTogdGhpcy5fZ2xvYmFsS2V5XG4gICAgfTtcblxuICAgIGlmICh0aGlzLl9nbG9iYWxTZWNyZXQpIHtcbiAgICAgIGF1dGguc2VudHJ5X3NlY3JldCA9IHRoaXMuX2dsb2JhbFNlY3JldDtcbiAgICB9XG5cbiAgICB2YXIgZXhjZXB0aW9uID0gZGF0YS5leGNlcHRpb24gJiYgZGF0YS5leGNlcHRpb24udmFsdWVzWzBdO1xuXG4gICAgLy8gb25seSBjYXB0dXJlICdzZW50cnknIGJyZWFkY3J1bWIgaXMgYXV0b0JyZWFkY3J1bWJzIGlzIHRydXRoeVxuICAgIGlmIChcbiAgICAgIHRoaXMuX2dsb2JhbE9wdGlvbnMuYXV0b0JyZWFkY3J1bWJzICYmXG4gICAgICB0aGlzLl9nbG9iYWxPcHRpb25zLmF1dG9CcmVhZGNydW1icy5zZW50cnlcbiAgICApIHtcbiAgICAgIHRoaXMuY2FwdHVyZUJyZWFkY3J1bWIoe1xuICAgICAgICBjYXRlZ29yeTogJ3NlbnRyeScsXG4gICAgICAgIG1lc3NhZ2U6IGV4Y2VwdGlvblxuICAgICAgICAgID8gKGV4Y2VwdGlvbi50eXBlID8gZXhjZXB0aW9uLnR5cGUgKyAnOiAnIDogJycpICsgZXhjZXB0aW9uLnZhbHVlXG4gICAgICAgICAgOiBkYXRhLm1lc3NhZ2UsXG4gICAgICAgIGV2ZW50X2lkOiBkYXRhLmV2ZW50X2lkLFxuICAgICAgICBsZXZlbDogZGF0YS5sZXZlbCB8fCAnZXJyb3InIC8vIHByZXN1bWUgZXJyb3IgdW5sZXNzIHNwZWNpZmllZFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIHVybCA9IHRoaXMuX2dsb2JhbEVuZHBvaW50O1xuICAgIChnbG9iYWxPcHRpb25zLnRyYW5zcG9ydCB8fCB0aGlzLl9tYWtlUmVxdWVzdCkuY2FsbCh0aGlzLCB7XG4gICAgICB1cmw6IHVybCxcbiAgICAgIGF1dGg6IGF1dGgsXG4gICAgICBkYXRhOiBkYXRhLFxuICAgICAgb3B0aW9uczogZ2xvYmFsT3B0aW9ucyxcbiAgICAgIG9uU3VjY2VzczogZnVuY3Rpb24gc3VjY2VzcygpIHtcbiAgICAgICAgc2VsZi5fcmVzZXRCYWNrb2ZmKCk7XG5cbiAgICAgICAgc2VsZi5fdHJpZ2dlckV2ZW50KCdzdWNjZXNzJywge1xuICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgc3JjOiB1cmxcbiAgICAgICAgfSk7XG4gICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XG4gICAgICB9LFxuICAgICAgb25FcnJvcjogZnVuY3Rpb24gZmFpbHVyZShlcnJvcikge1xuICAgICAgICBzZWxmLl9sb2dEZWJ1ZygnZXJyb3InLCAnUmF2ZW4gdHJhbnNwb3J0IGZhaWxlZCB0byBzZW5kOiAnLCBlcnJvcik7XG5cbiAgICAgICAgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICBzZWxmLl9zZXRCYWNrb2ZmU3RhdGUoZXJyb3IucmVxdWVzdCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLl90cmlnZ2VyRXZlbnQoJ2ZhaWx1cmUnLCB7XG4gICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICBzcmM6IHVybFxuICAgICAgICB9KTtcbiAgICAgICAgZXJyb3IgPSBlcnJvciB8fCBuZXcgRXJyb3IoJ1JhdmVuIHNlbmQgZmFpbGVkIChubyBhZGRpdGlvbmFsIGRldGFpbHMgcHJvdmlkZWQpJyk7XG4gICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBfbWFrZVJlcXVlc3Q6IGZ1bmN0aW9uKG9wdHMpIHtcbiAgICB2YXIgcmVxdWVzdCA9IF93aW5kb3cuWE1MSHR0cFJlcXVlc3QgJiYgbmV3IF93aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcbiAgICBpZiAoIXJlcXVlc3QpIHJldHVybjtcblxuICAgIC8vIGlmIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IENPUlMgKGUuZy4gSUU3KSwgd2UgYXJlIG91dCBvZiBsdWNrXG4gICAgdmFyIGhhc0NPUlMgPSAnd2l0aENyZWRlbnRpYWxzJyBpbiByZXF1ZXN0IHx8IHR5cGVvZiBYRG9tYWluUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgICBpZiAoIWhhc0NPUlMpIHJldHVybjtcblxuICAgIHZhciB1cmwgPSBvcHRzLnVybDtcblxuICAgIGlmICgnd2l0aENyZWRlbnRpYWxzJyBpbiByZXF1ZXN0KSB7XG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICBvcHRzLm9uU3VjY2VzcyAmJiBvcHRzLm9uU3VjY2VzcygpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdHMub25FcnJvcikge1xuICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1NlbnRyeSBlcnJvciBjb2RlOiAnICsgcmVxdWVzdC5zdGF0dXMpO1xuICAgICAgICAgIGVyci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgICAgICAgICBvcHRzLm9uRXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVxdWVzdCA9IG5ldyBYRG9tYWluUmVxdWVzdCgpO1xuICAgICAgLy8geGRvbWFpbnJlcXVlc3QgY2Fubm90IGdvIGh0dHAgLT4gaHR0cHMgKG9yIHZpY2UgdmVyc2EpLFxuICAgICAgLy8gc28gYWx3YXlzIHVzZSBwcm90b2NvbCByZWxhdGl2ZVxuICAgICAgdXJsID0gdXJsLnJlcGxhY2UoL15odHRwcz86LywgJycpO1xuXG4gICAgICAvLyBvbnJlYWR5c3RhdGVjaGFuZ2Ugbm90IHN1cHBvcnRlZCBieSBYRG9tYWluUmVxdWVzdFxuICAgICAgaWYgKG9wdHMub25TdWNjZXNzKSB7XG4gICAgICAgIHJlcXVlc3Qub25sb2FkID0gb3B0cy5vblN1Y2Nlc3M7XG4gICAgICB9XG4gICAgICBpZiAob3B0cy5vbkVycm9yKSB7XG4gICAgICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1NlbnRyeSBlcnJvciBjb2RlOiBYRG9tYWluUmVxdWVzdCcpO1xuICAgICAgICAgIGVyci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgICAgICAgICBvcHRzLm9uRXJyb3IoZXJyKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOT1RFOiBhdXRoIGlzIGludGVudGlvbmFsbHkgc2VudCBhcyBwYXJ0IG9mIHF1ZXJ5IHN0cmluZyAoTk9UIGFzIGN1c3RvbVxuICAgIC8vICAgICAgIEhUVFAgaGVhZGVyKSBzbyBhcyB0byBhdm9pZCBwcmVmbGlnaHQgQ09SUyByZXF1ZXN0c1xuICAgIHJlcXVlc3Qub3BlbignUE9TVCcsIHVybCArICc/JyArIHVybGVuY29kZShvcHRzLmF1dGgpKTtcbiAgICByZXF1ZXN0LnNlbmQoc3RyaW5naWZ5KG9wdHMuZGF0YSkpO1xuICB9LFxuXG4gIF9sb2dEZWJ1ZzogZnVuY3Rpb24obGV2ZWwpIHtcbiAgICBpZiAodGhpcy5fb3JpZ2luYWxDb25zb2xlTWV0aG9kc1tsZXZlbF0gJiYgdGhpcy5kZWJ1Zykge1xuICAgICAgLy8gSW4gSUU8MTAgY29uc29sZSBtZXRob2RzIGRvIG5vdCBoYXZlIHRoZWlyIG93biAnYXBwbHknIG1ldGhvZFxuICAgICAgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoXG4gICAgICAgIHRoaXMuX29yaWdpbmFsQ29uc29sZU1ldGhvZHNbbGV2ZWxdLFxuICAgICAgICB0aGlzLl9vcmlnaW5hbENvbnNvbGUsXG4gICAgICAgIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICAgKTtcbiAgICB9XG4gIH0sXG5cbiAgX21lcmdlQ29udGV4dDogZnVuY3Rpb24oa2V5LCBjb250ZXh0KSB7XG4gICAgaWYgKGlzVW5kZWZpbmVkKGNvbnRleHQpKSB7XG4gICAgICBkZWxldGUgdGhpcy5fZ2xvYmFsQ29udGV4dFtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9nbG9iYWxDb250ZXh0W2tleV0gPSBvYmplY3RNZXJnZSh0aGlzLl9nbG9iYWxDb250ZXh0W2tleV0gfHwge30sIGNvbnRleHQpO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRGVwcmVjYXRpb25zXG5SYXZlbi5wcm90b3R5cGUuc2V0VXNlciA9IFJhdmVuLnByb3RvdHlwZS5zZXRVc2VyQ29udGV4dDtcblJhdmVuLnByb3RvdHlwZS5zZXRSZWxlYXNlQ29udGV4dCA9IFJhdmVuLnByb3RvdHlwZS5zZXRSZWxlYXNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhdmVuO1xuIiwiLyoqXG4gKiBFbmZvcmNlcyBhIHNpbmdsZSBpbnN0YW5jZSBvZiB0aGUgUmF2ZW4gY2xpZW50LCBhbmQgdGhlXG4gKiBtYWluIGVudHJ5IHBvaW50IGZvciBSYXZlbi4gSWYgeW91IGFyZSBhIGNvbnN1bWVyIG9mIHRoZVxuICogUmF2ZW4gbGlicmFyeSwgeW91IFNIT1VMRCBsb2FkIHRoaXMgZmlsZSAodnMgcmF2ZW4uanMpLlxuICoqL1xuXG52YXIgUmF2ZW5Db25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4vcmF2ZW4nKTtcblxuLy8gVGhpcyBpcyB0byBiZSBkZWZlbnNpdmUgaW4gZW52aXJvbm1lbnRzIHdoZXJlIHdpbmRvdyBkb2VzIG5vdCBleGlzdCAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9nZXRzZW50cnkvcmF2ZW4tanMvcHVsbC83ODUpXG52YXIgX3dpbmRvdyA9XG4gIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgPyB3aW5kb3dcbiAgICA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHt9O1xudmFyIF9SYXZlbiA9IF93aW5kb3cuUmF2ZW47XG5cbnZhciBSYXZlbiA9IG5ldyBSYXZlbkNvbnN0cnVjdG9yKCk7XG5cbi8qXG4gKiBBbGxvdyBtdWx0aXBsZSB2ZXJzaW9ucyBvZiBSYXZlbiB0byBiZSBpbnN0YWxsZWQuXG4gKiBTdHJpcCBSYXZlbiBmcm9tIHRoZSBnbG9iYWwgY29udGV4dCBhbmQgcmV0dXJucyB0aGUgaW5zdGFuY2UuXG4gKlxuICogQHJldHVybiB7UmF2ZW59XG4gKi9cblJhdmVuLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgX3dpbmRvdy5SYXZlbiA9IF9SYXZlbjtcbiAgcmV0dXJuIFJhdmVuO1xufTtcblxuUmF2ZW4uYWZ0ZXJMb2FkKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmF2ZW47XG4iLCJ2YXIgX3dpbmRvdyA9XG4gIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgPyB3aW5kb3dcbiAgICA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHt9O1xuXG5mdW5jdGlvbiBpc09iamVjdCh3aGF0KSB7XG4gIHJldHVybiB0eXBlb2Ygd2hhdCA9PT0gJ29iamVjdCcgJiYgd2hhdCAhPT0gbnVsbDtcbn1cblxuLy8gWWFua2VkIGZyb20gaHR0cHM6Ly9naXQuaW8vdlM4RFYgcmUtdXNlZCB1bmRlciBDQzBcbi8vIHdpdGggc29tZSB0aW55IG1vZGlmaWNhdGlvbnNcbmZ1bmN0aW9uIGlzRXJyb3IodmFsdWUpIHtcbiAgc3dpdGNoICh7fS50b1N0cmluZy5jYWxsKHZhbHVlKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgRXJyb3JdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGNhc2UgJ1tvYmplY3QgRXhjZXB0aW9uXSc6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBjYXNlICdbb2JqZWN0IERPTUV4Y2VwdGlvbl0nOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIEVycm9yO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzRXJyb3JFdmVudCh2YWx1ZSkge1xuICByZXR1cm4gc3VwcG9ydHNFcnJvckV2ZW50KCkgJiYge30udG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEVycm9yRXZlbnRdJztcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQod2hhdCkge1xuICByZXR1cm4gd2hhdCA9PT0gdm9pZCAwO1xufVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHdoYXQpIHtcbiAgcmV0dXJuIHR5cGVvZiB3aGF0ID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc1N0cmluZyh3aGF0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwod2hhdCkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xufVxuXG5mdW5jdGlvbiBpc0FycmF5KHdoYXQpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh3aGF0KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuZnVuY3Rpb24gaXNFbXB0eU9iamVjdCh3aGF0KSB7XG4gIGZvciAodmFyIF8gaW4gd2hhdCkge1xuICAgIGlmICh3aGF0Lmhhc093blByb3BlcnR5KF8pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBzdXBwb3J0c0Vycm9yRXZlbnQoKSB7XG4gIHRyeSB7XG4gICAgbmV3IEVycm9yRXZlbnQoJycpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBwZWRDYWxsYmFjayhjYWxsYmFjaykge1xuICBmdW5jdGlvbiBkYXRhQ2FsbGJhY2soZGF0YSwgb3JpZ2luYWwpIHtcbiAgICB2YXIgbm9ybWFsaXplZERhdGEgPSBjYWxsYmFjayhkYXRhKSB8fCBkYXRhO1xuICAgIGlmIChvcmlnaW5hbCkge1xuICAgICAgcmV0dXJuIG9yaWdpbmFsKG5vcm1hbGl6ZWREYXRhKSB8fCBub3JtYWxpemVkRGF0YTtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWREYXRhO1xuICB9XG5cbiAgcmV0dXJuIGRhdGFDYWxsYmFjaztcbn1cblxuZnVuY3Rpb24gZWFjaChvYmosIGNhbGxiYWNrKSB7XG4gIHZhciBpLCBqO1xuXG4gIGlmIChpc1VuZGVmaW5lZChvYmoubGVuZ3RoKSkge1xuICAgIGZvciAoaSBpbiBvYmopIHtcbiAgICAgIGlmIChoYXNLZXkob2JqLCBpKSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKG51bGwsIGksIG9ialtpXSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGogPSBvYmoubGVuZ3RoO1xuICAgIGlmIChqKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgajsgaSsrKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwobnVsbCwgaSwgb2JqW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gb2JqZWN0TWVyZ2Uob2JqMSwgb2JqMikge1xuICBpZiAoIW9iajIpIHtcbiAgICByZXR1cm4gb2JqMTtcbiAgfVxuICBlYWNoKG9iajIsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICBvYmoxW2tleV0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiBvYmoxO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgb25seSB1c2VkIGZvciByZWFjdC1uYXRpdmUuXG4gKiByZWFjdC1uYXRpdmUgZnJlZXplcyBvYmplY3QgdGhhdCBoYXZlIGFscmVhZHkgYmVlbiBzZW50IG92ZXIgdGhlXG4gKiBqcyBicmlkZ2UuIFdlIG5lZWQgdGhpcyBmdW5jdGlvbiBpbiBvcmRlciB0byBjaGVjayBpZiB0aGUgb2JqZWN0IGlzIGZyb3plbi5cbiAqIFNvIGl0J3Mgb2sgdGhhdCBvYmplY3RGcm96ZW4gcmV0dXJucyBmYWxzZSBpZiBPYmplY3QuaXNGcm96ZW4gaXMgbm90XG4gKiBzdXBwb3J0ZWQgYmVjYXVzZSBpdCdzIG5vdCByZWxldmFudCBmb3Igb3RoZXIgXCJwbGF0Zm9ybXNcIi4gU2VlIHJlbGF0ZWQgaXNzdWU6XG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ2V0c2VudHJ5L3JlYWN0LW5hdGl2ZS1zZW50cnkvaXNzdWVzLzU3XG4gKi9cbmZ1bmN0aW9uIG9iamVjdEZyb3plbihvYmopIHtcbiAgaWYgKCFPYmplY3QuaXNGcm96ZW4pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5pc0Zyb3plbihvYmopO1xufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZShzdHIsIG1heCkge1xuICByZXR1cm4gIW1heCB8fCBzdHIubGVuZ3RoIDw9IG1heCA/IHN0ciA6IHN0ci5zdWJzdHIoMCwgbWF4KSArICdcXHUyMDI2Jztcbn1cblxuLyoqXG4gKiBoYXNLZXksIGEgYmV0dGVyIGZvcm0gb2YgaGFzT3duUHJvcGVydHlcbiAqIEV4YW1wbGU6IGhhc0tleShNYWluSG9zdE9iamVjdCwgcHJvcGVydHkpID09PSB0cnVlL2ZhbHNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhvc3Qgb2JqZWN0IHRvIGNoZWNrIHByb3BlcnR5XG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IHRvIGNoZWNrXG4gKi9cbmZ1bmN0aW9uIGhhc0tleShvYmplY3QsIGtleSkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KTtcbn1cblxuZnVuY3Rpb24gam9pblJlZ0V4cChwYXR0ZXJucykge1xuICAvLyBDb21iaW5lIGFuIGFycmF5IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgYW5kIHN0cmluZ3MgaW50byBvbmUgbGFyZ2UgcmVnZXhwXG4gIC8vIEJlIG1hZC5cbiAgdmFyIHNvdXJjZXMgPSBbXSxcbiAgICBpID0gMCxcbiAgICBsZW4gPSBwYXR0ZXJucy5sZW5ndGgsXG4gICAgcGF0dGVybjtcblxuICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgcGF0dGVybiA9IHBhdHRlcm5zW2ldO1xuICAgIGlmIChpc1N0cmluZyhwYXR0ZXJuKSkge1xuICAgICAgLy8gSWYgaXQncyBhIHN0cmluZywgd2UgbmVlZCB0byBlc2NhcGUgaXRcbiAgICAgIC8vIFRha2VuIGZyb206IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvR3VpZGUvUmVndWxhcl9FeHByZXNzaW9uc1xuICAgICAgc291cmNlcy5wdXNoKHBhdHRlcm4ucmVwbGFjZSgvKFsuKis/Xj0hOiR7fSgpfFxcW1xcXVxcL1xcXFxdKS9nLCAnXFxcXCQxJykpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybiAmJiBwYXR0ZXJuLnNvdXJjZSkge1xuICAgICAgLy8gSWYgaXQncyBhIHJlZ2V4cCBhbHJlYWR5LCB3ZSB3YW50IHRvIGV4dHJhY3QgdGhlIHNvdXJjZVxuICAgICAgc291cmNlcy5wdXNoKHBhdHRlcm4uc291cmNlKTtcbiAgICB9XG4gICAgLy8gSW50ZW50aW9uYWxseSBza2lwIG90aGVyIGNhc2VzXG4gIH1cbiAgcmV0dXJuIG5ldyBSZWdFeHAoc291cmNlcy5qb2luKCd8JyksICdpJyk7XG59XG5cbmZ1bmN0aW9uIHVybGVuY29kZShvKSB7XG4gIHZhciBwYWlycyA9IFtdO1xuICBlYWNoKG8sIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gIH0pO1xuICByZXR1cm4gcGFpcnMuam9pbignJicpO1xufVxuXG4vLyBib3Jyb3dlZCBmcm9tIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2I2FwcGVuZGl4LUJcbi8vIGludGVudGlvbmFsbHkgdXNpbmcgcmVnZXggYW5kIG5vdCA8YS8+IGhyZWYgcGFyc2luZyB0cmljayBiZWNhdXNlIFJlYWN0IE5hdGl2ZSBhbmQgb3RoZXJcbi8vIGVudmlyb25tZW50cyB3aGVyZSBET00gbWlnaHQgbm90IGJlIGF2YWlsYWJsZVxuZnVuY3Rpb24gcGFyc2VVcmwodXJsKSB7XG4gIHZhciBtYXRjaCA9IHVybC5tYXRjaCgvXigoW146XFwvPyNdKyk6KT8oXFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSopKFxcPyhbXiNdKikpPygjKC4qKSk/JC8pO1xuICBpZiAoIW1hdGNoKSByZXR1cm4ge307XG5cbiAgLy8gY29lcmNlIHRvIHVuZGVmaW5lZCB2YWx1ZXMgdG8gZW1wdHkgc3RyaW5nIHNvIHdlIGRvbid0IGdldCAndW5kZWZpbmVkJ1xuICB2YXIgcXVlcnkgPSBtYXRjaFs2XSB8fCAnJztcbiAgdmFyIGZyYWdtZW50ID0gbWF0Y2hbOF0gfHwgJyc7XG4gIHJldHVybiB7XG4gICAgcHJvdG9jb2w6IG1hdGNoWzJdLFxuICAgIGhvc3Q6IG1hdGNoWzRdLFxuICAgIHBhdGg6IG1hdGNoWzVdLFxuICAgIHJlbGF0aXZlOiBtYXRjaFs1XSArIHF1ZXJ5ICsgZnJhZ21lbnQgLy8gZXZlcnl0aGluZyBtaW51cyBvcmlnaW5cbiAgfTtcbn1cbmZ1bmN0aW9uIHV1aWQ0KCkge1xuICB2YXIgY3J5cHRvID0gX3dpbmRvdy5jcnlwdG8gfHwgX3dpbmRvdy5tc0NyeXB0bztcblxuICBpZiAoIWlzVW5kZWZpbmVkKGNyeXB0bykgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIFVzZSB3aW5kb3cuY3J5cHRvIEFQSSBpZiBhdmFpbGFibGVcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQxNkFycmF5KDgpO1xuICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYXJyKTtcblxuICAgIC8vIHNldCA0IGluIGJ5dGUgN1xuICAgIGFyclszXSA9IChhcnJbM10gJiAweGZmZikgfCAweDQwMDA7XG4gICAgLy8gc2V0IDIgbW9zdCBzaWduaWZpY2FudCBiaXRzIG9mIGJ5dGUgOSB0byAnMTAnXG4gICAgYXJyWzRdID0gKGFycls0XSAmIDB4M2ZmZikgfCAweDgwMDA7XG5cbiAgICB2YXIgcGFkID0gZnVuY3Rpb24obnVtKSB7XG4gICAgICB2YXIgdiA9IG51bS50b1N0cmluZygxNik7XG4gICAgICB3aGlsZSAodi5sZW5ndGggPCA0KSB7XG4gICAgICAgIHYgPSAnMCcgKyB2O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHY7XG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICBwYWQoYXJyWzBdKSArXG4gICAgICBwYWQoYXJyWzFdKSArXG4gICAgICBwYWQoYXJyWzJdKSArXG4gICAgICBwYWQoYXJyWzNdKSArXG4gICAgICBwYWQoYXJyWzRdKSArXG4gICAgICBwYWQoYXJyWzVdKSArXG4gICAgICBwYWQoYXJyWzZdKSArXG4gICAgICBwYWQoYXJyWzddKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDUwMzQvaG93LXRvLWNyZWF0ZS1hLWd1aWQtdXVpZC1pbi1qYXZhc2NyaXB0LzIxMTc1MjMjMjExNzUyM1xuICAgIHJldHVybiAneHh4eHh4eHh4eHh4NHh4eHl4eHh4eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSAoTWF0aC5yYW5kb20oKSAqIDE2KSB8IDAsXG4gICAgICAgIHYgPSBjID09PSAneCcgPyByIDogKHIgJiAweDMpIHwgMHg4O1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogR2l2ZW4gYSBjaGlsZCBET00gZWxlbWVudCwgcmV0dXJucyBhIHF1ZXJ5LXNlbGVjdG9yIHN0YXRlbWVudCBkZXNjcmliaW5nIHRoYXRcbiAqIGFuZCBpdHMgYW5jZXN0b3JzXG4gKiBlLmcuIFtIVE1MRWxlbWVudF0gPT4gYm9keSA+IGRpdiA+IGlucHV0I2Zvby5idG5bbmFtZT1iYXpdXG4gKiBAcGFyYW0gZWxlbVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gaHRtbFRyZWVBc1N0cmluZyhlbGVtKSB7XG4gIC8qIGVzbGludCBuby1leHRyYS1wYXJlbnM6MCovXG4gIHZhciBNQVhfVFJBVkVSU0VfSEVJR0hUID0gNSxcbiAgICBNQVhfT1VUUFVUX0xFTiA9IDgwLFxuICAgIG91dCA9IFtdLFxuICAgIGhlaWdodCA9IDAsXG4gICAgbGVuID0gMCxcbiAgICBzZXBhcmF0b3IgPSAnID4gJyxcbiAgICBzZXBMZW5ndGggPSBzZXBhcmF0b3IubGVuZ3RoLFxuICAgIG5leHRTdHI7XG5cbiAgd2hpbGUgKGVsZW0gJiYgaGVpZ2h0KysgPCBNQVhfVFJBVkVSU0VfSEVJR0hUKSB7XG4gICAgbmV4dFN0ciA9IGh0bWxFbGVtZW50QXNTdHJpbmcoZWxlbSk7XG4gICAgLy8gYmFpbCBvdXQgaWZcbiAgICAvLyAtIG5leHRTdHIgaXMgdGhlICdodG1sJyBlbGVtZW50XG4gICAgLy8gLSB0aGUgbGVuZ3RoIG9mIHRoZSBzdHJpbmcgdGhhdCB3b3VsZCBiZSBjcmVhdGVkIGV4Y2VlZHMgTUFYX09VVFBVVF9MRU5cbiAgICAvLyAgIChpZ25vcmUgdGhpcyBsaW1pdCBpZiB3ZSBhcmUgb24gdGhlIGZpcnN0IGl0ZXJhdGlvbilcbiAgICBpZiAoXG4gICAgICBuZXh0U3RyID09PSAnaHRtbCcgfHxcbiAgICAgIChoZWlnaHQgPiAxICYmIGxlbiArIG91dC5sZW5ndGggKiBzZXBMZW5ndGggKyBuZXh0U3RyLmxlbmd0aCA+PSBNQVhfT1VUUFVUX0xFTilcbiAgICApIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIG91dC5wdXNoKG5leHRTdHIpO1xuXG4gICAgbGVuICs9IG5leHRTdHIubGVuZ3RoO1xuICAgIGVsZW0gPSBlbGVtLnBhcmVudE5vZGU7XG4gIH1cblxuICByZXR1cm4gb3V0LnJldmVyc2UoKS5qb2luKHNlcGFyYXRvcik7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHNpbXBsZSwgcXVlcnktc2VsZWN0b3IgcmVwcmVzZW50YXRpb24gb2YgYSBET00gZWxlbWVudFxuICogZS5nLiBbSFRNTEVsZW1lbnRdID0+IGlucHV0I2Zvby5idG5bbmFtZT1iYXpdXG4gKiBAcGFyYW0gSFRNTEVsZW1lbnRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGh0bWxFbGVtZW50QXNTdHJpbmcoZWxlbSkge1xuICB2YXIgb3V0ID0gW10sXG4gICAgY2xhc3NOYW1lLFxuICAgIGNsYXNzZXMsXG4gICAga2V5LFxuICAgIGF0dHIsXG4gICAgaTtcblxuICBpZiAoIWVsZW0gfHwgIWVsZW0udGFnTmFtZSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIG91dC5wdXNoKGVsZW0udGFnTmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgaWYgKGVsZW0uaWQpIHtcbiAgICBvdXQucHVzaCgnIycgKyBlbGVtLmlkKTtcbiAgfVxuXG4gIGNsYXNzTmFtZSA9IGVsZW0uY2xhc3NOYW1lO1xuICBpZiAoY2xhc3NOYW1lICYmIGlzU3RyaW5nKGNsYXNzTmFtZSkpIHtcbiAgICBjbGFzc2VzID0gY2xhc3NOYW1lLnNwbGl0KC9cXHMrLyk7XG4gICAgZm9yIChpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG91dC5wdXNoKCcuJyArIGNsYXNzZXNbaV0pO1xuICAgIH1cbiAgfVxuICB2YXIgYXR0cldoaXRlbGlzdCA9IFsndHlwZScsICduYW1lJywgJ3RpdGxlJywgJ2FsdCddO1xuICBmb3IgKGkgPSAwOyBpIDwgYXR0cldoaXRlbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGtleSA9IGF0dHJXaGl0ZWxpc3RbaV07XG4gICAgYXR0ciA9IGVsZW0uZ2V0QXR0cmlidXRlKGtleSk7XG4gICAgaWYgKGF0dHIpIHtcbiAgICAgIG91dC5wdXNoKCdbJyArIGtleSArICc9XCInICsgYXR0ciArICdcIl0nKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dC5qb2luKCcnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgZWl0aGVyIGEgT1IgYiBpcyB0cnV0aHksIGJ1dCBub3QgYm90aFxuICovXG5mdW5jdGlvbiBpc09ubHlPbmVUcnV0aHkoYSwgYikge1xuICByZXR1cm4gISEoISFhIF4gISFiKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHR3byBpbnB1dCBleGNlcHRpb24gaW50ZXJmYWNlcyBoYXZlIHRoZSBzYW1lIGNvbnRlbnRcbiAqL1xuZnVuY3Rpb24gaXNTYW1lRXhjZXB0aW9uKGV4MSwgZXgyKSB7XG4gIGlmIChpc09ubHlPbmVUcnV0aHkoZXgxLCBleDIpKSByZXR1cm4gZmFsc2U7XG5cbiAgZXgxID0gZXgxLnZhbHVlc1swXTtcbiAgZXgyID0gZXgyLnZhbHVlc1swXTtcblxuICBpZiAoZXgxLnR5cGUgIT09IGV4Mi50eXBlIHx8IGV4MS52YWx1ZSAhPT0gZXgyLnZhbHVlKSByZXR1cm4gZmFsc2U7XG5cbiAgcmV0dXJuIGlzU2FtZVN0YWNrdHJhY2UoZXgxLnN0YWNrdHJhY2UsIGV4Mi5zdGFja3RyYWNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHR3byBpbnB1dCBzdGFjayB0cmFjZSBpbnRlcmZhY2VzIGhhdmUgdGhlIHNhbWUgY29udGVudFxuICovXG5mdW5jdGlvbiBpc1NhbWVTdGFja3RyYWNlKHN0YWNrMSwgc3RhY2syKSB7XG4gIGlmIChpc09ubHlPbmVUcnV0aHkoc3RhY2sxLCBzdGFjazIpKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGZyYW1lczEgPSBzdGFjazEuZnJhbWVzO1xuICB2YXIgZnJhbWVzMiA9IHN0YWNrMi5mcmFtZXM7XG5cbiAgLy8gRXhpdCBlYXJseSBpZiBmcmFtZSBjb3VudCBkaWZmZXJzXG4gIGlmIChmcmFtZXMxLmxlbmd0aCAhPT0gZnJhbWVzMi5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAvLyBJdGVyYXRlIHRocm91Z2ggZXZlcnkgZnJhbWU7IGJhaWwgb3V0IGlmIGFueXRoaW5nIGRpZmZlcnNcbiAgdmFyIGEsIGI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZnJhbWVzMS5sZW5ndGg7IGkrKykge1xuICAgIGEgPSBmcmFtZXMxW2ldO1xuICAgIGIgPSBmcmFtZXMyW2ldO1xuICAgIGlmIChcbiAgICAgIGEuZmlsZW5hbWUgIT09IGIuZmlsZW5hbWUgfHxcbiAgICAgIGEubGluZW5vICE9PSBiLmxpbmVubyB8fFxuICAgICAgYS5jb2xubyAhPT0gYi5jb2xubyB8fFxuICAgICAgYVsnZnVuY3Rpb24nXSAhPT0gYlsnZnVuY3Rpb24nXVxuICAgIClcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBQb2x5ZmlsbCBhIG1ldGhvZFxuICogQHBhcmFtIG9iaiBvYmplY3QgZS5nLiBgZG9jdW1lbnRgXG4gKiBAcGFyYW0gbmFtZSBtZXRob2QgbmFtZSBwcmVzZW50IG9uIG9iamVjdCBlLmcuIGBhZGRFdmVudExpc3RlbmVyYFxuICogQHBhcmFtIHJlcGxhY2VtZW50IHJlcGxhY2VtZW50IGZ1bmN0aW9uXG4gKiBAcGFyYW0gdHJhY2sge29wdGlvbmFsfSByZWNvcmQgaW5zdHJ1bWVudGF0aW9uIHRvIGFuIGFycmF5XG4gKi9cbmZ1bmN0aW9uIGZpbGwob2JqLCBuYW1lLCByZXBsYWNlbWVudCwgdHJhY2spIHtcbiAgdmFyIG9yaWcgPSBvYmpbbmFtZV07XG4gIG9ialtuYW1lXSA9IHJlcGxhY2VtZW50KG9yaWcpO1xuICBvYmpbbmFtZV0uX19yYXZlbl9fID0gdHJ1ZTtcbiAgb2JqW25hbWVdLl9fb3JpZ19fID0gb3JpZztcbiAgaWYgKHRyYWNrKSB7XG4gICAgdHJhY2sucHVzaChbb2JqLCBuYW1lLCBvcmlnXSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNFcnJvcjogaXNFcnJvcixcbiAgaXNFcnJvckV2ZW50OiBpc0Vycm9yRXZlbnQsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0VtcHR5T2JqZWN0OiBpc0VtcHR5T2JqZWN0LFxuICBzdXBwb3J0c0Vycm9yRXZlbnQ6IHN1cHBvcnRzRXJyb3JFdmVudCxcbiAgd3JhcHBlZENhbGxiYWNrOiB3cmFwcGVkQ2FsbGJhY2ssXG4gIGVhY2g6IGVhY2gsXG4gIG9iamVjdE1lcmdlOiBvYmplY3RNZXJnZSxcbiAgdHJ1bmNhdGU6IHRydW5jYXRlLFxuICBvYmplY3RGcm96ZW46IG9iamVjdEZyb3plbixcbiAgaGFzS2V5OiBoYXNLZXksXG4gIGpvaW5SZWdFeHA6IGpvaW5SZWdFeHAsXG4gIHVybGVuY29kZTogdXJsZW5jb2RlLFxuICB1dWlkNDogdXVpZDQsXG4gIGh0bWxUcmVlQXNTdHJpbmc6IGh0bWxUcmVlQXNTdHJpbmcsXG4gIGh0bWxFbGVtZW50QXNTdHJpbmc6IGh0bWxFbGVtZW50QXNTdHJpbmcsXG4gIGlzU2FtZUV4Y2VwdGlvbjogaXNTYW1lRXhjZXB0aW9uLFxuICBpc1NhbWVTdGFja3RyYWNlOiBpc1NhbWVTdGFja3RyYWNlLFxuICBwYXJzZVVybDogcGFyc2VVcmwsXG4gIGZpbGw6IGZpbGxcbn07XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi8uLi9zcmMvdXRpbHMnKTtcblxuLypcbiBUcmFjZUtpdCAtIENyb3NzIGJyb3dlciBzdGFjayB0cmFjZXNcblxuIFRoaXMgd2FzIG9yaWdpbmFsbHkgZm9ya2VkIGZyb20gZ2l0aHViLmNvbS9vY2MvVHJhY2VLaXQsIGJ1dCBoYXMgc2luY2UgYmVlblxuIGxhcmdlbHkgcmUtd3JpdHRlbiBhbmQgaXMgbm93IG1haW50YWluZWQgYXMgcGFydCBvZiByYXZlbi1qcy4gIFRlc3RzIGZvclxuIHRoaXMgYXJlIGluIHRlc3QvdmVuZG9yLlxuXG4gTUlUIGxpY2Vuc2VcbiovXG5cbnZhciBUcmFjZUtpdCA9IHtcbiAgY29sbGVjdFdpbmRvd0Vycm9yczogdHJ1ZSxcbiAgZGVidWc6IGZhbHNlXG59O1xuXG4vLyBUaGlzIGlzIHRvIGJlIGRlZmVuc2l2ZSBpbiBlbnZpcm9ubWVudHMgd2hlcmUgd2luZG93IGRvZXMgbm90IGV4aXN0IChzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dldHNlbnRyeS9yYXZlbi1qcy9wdWxsLzc4NSlcbnZhciBfd2luZG93ID1cbiAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IHdpbmRvd1xuICAgIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDoge307XG5cbi8vIGdsb2JhbCByZWZlcmVuY2UgdG8gc2xpY2VcbnZhciBfc2xpY2UgPSBbXS5zbGljZTtcbnZhciBVTktOT1dOX0ZVTkNUSU9OID0gJz8nO1xuXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9FcnJvciNFcnJvcl90eXBlc1xudmFyIEVSUk9SX1RZUEVTX1JFID0gL14oPzpbVXVdbmNhdWdodCAoPzpleGNlcHRpb246ICk/KT8oPzooKD86RXZhbHxJbnRlcm5hbHxSYW5nZXxSZWZlcmVuY2V8U3ludGF4fFR5cGV8VVJJfClFcnJvcik6ICk/KC4qKSQvO1xuXG5mdW5jdGlvbiBnZXRMb2NhdGlvbkhyZWYoKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnIHx8IGRvY3VtZW50LmxvY2F0aW9uID09IG51bGwpIHJldHVybiAnJztcblxuICByZXR1cm4gZG9jdW1lbnQubG9jYXRpb24uaHJlZjtcbn1cblxuLyoqXG4gKiBUcmFjZUtpdC5yZXBvcnQ6IGNyb3NzLWJyb3dzZXIgcHJvY2Vzc2luZyBvZiB1bmhhbmRsZWQgZXhjZXB0aW9uc1xuICpcbiAqIFN5bnRheDpcbiAqICAgVHJhY2VLaXQucmVwb3J0LnN1YnNjcmliZShmdW5jdGlvbihzdGFja0luZm8pIHsgLi4uIH0pXG4gKiAgIFRyYWNlS2l0LnJlcG9ydC51bnN1YnNjcmliZShmdW5jdGlvbihzdGFja0luZm8pIHsgLi4uIH0pXG4gKiAgIFRyYWNlS2l0LnJlcG9ydChleGNlcHRpb24pXG4gKiAgIHRyeSB7IC4uLmNvZGUuLi4gfSBjYXRjaChleCkgeyBUcmFjZUtpdC5yZXBvcnQoZXgpOyB9XG4gKlxuICogU3VwcG9ydHM6XG4gKiAgIC0gRmlyZWZveDogZnVsbCBzdGFjayB0cmFjZSB3aXRoIGxpbmUgbnVtYmVycywgcGx1cyBjb2x1bW4gbnVtYmVyXG4gKiAgICAgICAgICAgICAgb24gdG9wIGZyYW1lOyBjb2x1bW4gbnVtYmVyIGlzIG5vdCBndWFyYW50ZWVkXG4gKiAgIC0gT3BlcmE6ICAgZnVsbCBzdGFjayB0cmFjZSB3aXRoIGxpbmUgYW5kIGNvbHVtbiBudW1iZXJzXG4gKiAgIC0gQ2hyb21lOiAgZnVsbCBzdGFjayB0cmFjZSB3aXRoIGxpbmUgYW5kIGNvbHVtbiBudW1iZXJzXG4gKiAgIC0gU2FmYXJpOiAgbGluZSBhbmQgY29sdW1uIG51bWJlciBmb3IgdGhlIHRvcCBmcmFtZSBvbmx5OyBzb21lIGZyYW1lc1xuICogICAgICAgICAgICAgIG1heSBiZSBtaXNzaW5nLCBhbmQgY29sdW1uIG51bWJlciBpcyBub3QgZ3VhcmFudGVlZFxuICogICAtIElFOiAgICAgIGxpbmUgYW5kIGNvbHVtbiBudW1iZXIgZm9yIHRoZSB0b3AgZnJhbWUgb25seTsgc29tZSBmcmFtZXNcbiAqICAgICAgICAgICAgICBtYXkgYmUgbWlzc2luZywgYW5kIGNvbHVtbiBudW1iZXIgaXMgbm90IGd1YXJhbnRlZWRcbiAqXG4gKiBJbiB0aGVvcnksIFRyYWNlS2l0IHNob3VsZCB3b3JrIG9uIGFsbCBvZiB0aGUgZm9sbG93aW5nIHZlcnNpb25zOlxuICogICAtIElFNS41KyAob25seSA4LjAgdGVzdGVkKVxuICogICAtIEZpcmVmb3ggMC45KyAob25seSAzLjUrIHRlc3RlZClcbiAqICAgLSBPcGVyYSA3KyAob25seSAxMC41MCB0ZXN0ZWQ7IHZlcnNpb25zIDkgYW5kIGVhcmxpZXIgbWF5IHJlcXVpcmVcbiAqICAgICBFeGNlcHRpb25zIEhhdmUgU3RhY2t0cmFjZSB0byBiZSBlbmFibGVkIGluIG9wZXJhOmNvbmZpZylcbiAqICAgLSBTYWZhcmkgMysgKG9ubHkgNCsgdGVzdGVkKVxuICogICAtIENocm9tZSAxKyAob25seSA1KyB0ZXN0ZWQpXG4gKiAgIC0gS29ucXVlcm9yIDMuNSsgKHVudGVzdGVkKVxuICpcbiAqIFJlcXVpcmVzIFRyYWNlS2l0LmNvbXB1dGVTdGFja1RyYWNlLlxuICpcbiAqIFRyaWVzIHRvIGNhdGNoIGFsbCB1bmhhbmRsZWQgZXhjZXB0aW9ucyBhbmQgcmVwb3J0IHRoZW0gdG8gdGhlXG4gKiBzdWJzY3JpYmVkIGhhbmRsZXJzLiBQbGVhc2Ugbm90ZSB0aGF0IFRyYWNlS2l0LnJlcG9ydCB3aWxsIHJldGhyb3cgdGhlXG4gKiBleGNlcHRpb24uIFRoaXMgaXMgUkVRVUlSRUQgaW4gb3JkZXIgdG8gZ2V0IGEgdXNlZnVsIHN0YWNrIHRyYWNlIGluIElFLlxuICogSWYgdGhlIGV4Y2VwdGlvbiBkb2VzIG5vdCByZWFjaCB0aGUgdG9wIG9mIHRoZSBicm93c2VyLCB5b3Ugd2lsbCBvbmx5XG4gKiBnZXQgYSBzdGFjayB0cmFjZSBmcm9tIHRoZSBwb2ludCB3aGVyZSBUcmFjZUtpdC5yZXBvcnQgd2FzIGNhbGxlZC5cbiAqXG4gKiBIYW5kbGVycyByZWNlaXZlIGEgc3RhY2tJbmZvIG9iamVjdCBhcyBkZXNjcmliZWQgaW4gdGhlXG4gKiBUcmFjZUtpdC5jb21wdXRlU3RhY2tUcmFjZSBkb2NzLlxuICovXG5UcmFjZUtpdC5yZXBvcnQgPSAoZnVuY3Rpb24gcmVwb3J0TW9kdWxlV3JhcHBlcigpIHtcbiAgdmFyIGhhbmRsZXJzID0gW10sXG4gICAgbGFzdEFyZ3MgPSBudWxsLFxuICAgIGxhc3RFeGNlcHRpb24gPSBudWxsLFxuICAgIGxhc3RFeGNlcHRpb25TdGFjayA9IG51bGw7XG5cbiAgLyoqXG4gICAgICogQWRkIGEgY3Jhc2ggaGFuZGxlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gICAgICovXG4gIGZ1bmN0aW9uIHN1YnNjcmliZShoYW5kbGVyKSB7XG4gICAgaW5zdGFsbEdsb2JhbEhhbmRsZXIoKTtcbiAgICBoYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAgICogUmVtb3ZlIGEgY3Jhc2ggaGFuZGxlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gICAgICovXG4gIGZ1bmN0aW9uIHVuc3Vic2NyaWJlKGhhbmRsZXIpIHtcbiAgICBmb3IgKHZhciBpID0gaGFuZGxlcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIGlmIChoYW5kbGVyc1tpXSA9PT0gaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVycy5zcGxpY2UoaSwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAgICogUmVtb3ZlIGFsbCBjcmFzaCBoYW5kbGVycy5cbiAgICAgKi9cbiAgZnVuY3Rpb24gdW5zdWJzY3JpYmVBbGwoKSB7XG4gICAgdW5pbnN0YWxsR2xvYmFsSGFuZGxlcigpO1xuICAgIGhhbmRsZXJzID0gW107XG4gIH1cblxuICAvKipcbiAgICAgKiBEaXNwYXRjaCBzdGFjayBpbmZvcm1hdGlvbiB0byBhbGwgaGFuZGxlcnMuXG4gICAgICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgKj59IHN0YWNrXG4gICAgICovXG4gIGZ1bmN0aW9uIG5vdGlmeUhhbmRsZXJzKHN0YWNrLCBpc1dpbmRvd0Vycm9yKSB7XG4gICAgdmFyIGV4Y2VwdGlvbiA9IG51bGw7XG4gICAgaWYgKGlzV2luZG93RXJyb3IgJiYgIVRyYWNlS2l0LmNvbGxlY3RXaW5kb3dFcnJvcnMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yICh2YXIgaSBpbiBoYW5kbGVycykge1xuICAgICAgaWYgKGhhbmRsZXJzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaGFuZGxlcnNbaV0uYXBwbHkobnVsbCwgW3N0YWNrXS5jb25jYXQoX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSkpO1xuICAgICAgICB9IGNhdGNoIChpbm5lcikge1xuICAgICAgICAgIGV4Y2VwdGlvbiA9IGlubmVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGV4Y2VwdGlvbikge1xuICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgIH1cbiAgfVxuXG4gIHZhciBfb2xkT25lcnJvckhhbmRsZXIsIF9vbkVycm9ySGFuZGxlckluc3RhbGxlZDtcblxuICAvKipcbiAgICAgKiBFbnN1cmVzIGFsbCBnbG9iYWwgdW5oYW5kbGVkIGV4Y2VwdGlvbnMgYXJlIHJlY29yZGVkLlxuICAgICAqIFN1cHBvcnRlZCBieSBHZWNrbyBhbmQgSUUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgRXJyb3IgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIFVSTCBvZiBzY3JpcHQgdGhhdCBnZW5lcmF0ZWQgdGhlIGV4Y2VwdGlvbi5cbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8c3RyaW5nKX0gbGluZU5vIFRoZSBsaW5lIG51bWJlciBhdCB3aGljaCB0aGUgZXJyb3JcbiAgICAgKiBvY2N1cnJlZC5cbiAgICAgKiBAcGFyYW0gez8obnVtYmVyfHN0cmluZyl9IGNvbE5vIFRoZSBjb2x1bW4gbnVtYmVyIGF0IHdoaWNoIHRoZSBlcnJvclxuICAgICAqIG9jY3VycmVkLlxuICAgICAqIEBwYXJhbSB7P0Vycm9yfSBleCBUaGUgYWN0dWFsIEVycm9yIG9iamVjdC5cbiAgICAgKi9cbiAgZnVuY3Rpb24gdHJhY2VLaXRXaW5kb3dPbkVycm9yKG1lc3NhZ2UsIHVybCwgbGluZU5vLCBjb2xObywgZXgpIHtcbiAgICB2YXIgc3RhY2sgPSBudWxsO1xuXG4gICAgaWYgKGxhc3RFeGNlcHRpb25TdGFjaykge1xuICAgICAgVHJhY2VLaXQuY29tcHV0ZVN0YWNrVHJhY2UuYXVnbWVudFN0YWNrVHJhY2VXaXRoSW5pdGlhbEVsZW1lbnQoXG4gICAgICAgIGxhc3RFeGNlcHRpb25TdGFjayxcbiAgICAgICAgdXJsLFxuICAgICAgICBsaW5lTm8sXG4gICAgICAgIG1lc3NhZ2VcbiAgICAgICk7XG4gICAgICBwcm9jZXNzTGFzdEV4Y2VwdGlvbigpO1xuICAgIH0gZWxzZSBpZiAoZXggJiYgdXRpbHMuaXNFcnJvcihleCkpIHtcbiAgICAgIC8vIG5vbi1zdHJpbmcgYGV4YCBhcmc7IGF0dGVtcHQgdG8gZXh0cmFjdCBzdGFjayB0cmFjZVxuXG4gICAgICAvLyBOZXcgY2hyb21lIGFuZCBibGluayBzZW5kIGFsb25nIGEgcmVhbCBlcnJvciBvYmplY3RcbiAgICAgIC8vIExldCdzIGp1c3QgcmVwb3J0IHRoYXQgbGlrZSBhIG5vcm1hbCBlcnJvci5cbiAgICAgIC8vIFNlZTogaHR0cHM6Ly9taWtld2VzdC5vcmcvMjAxMy8wOC9kZWJ1Z2dpbmctcnVudGltZS1lcnJvcnMtd2l0aC13aW5kb3ctb25lcnJvclxuICAgICAgc3RhY2sgPSBUcmFjZUtpdC5jb21wdXRlU3RhY2tUcmFjZShleCk7XG4gICAgICBub3RpZnlIYW5kbGVycyhzdGFjaywgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBsb2NhdGlvbiA9IHtcbiAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgIGxpbmU6IGxpbmVObyxcbiAgICAgICAgY29sdW1uOiBjb2xOb1xuICAgICAgfTtcblxuICAgICAgdmFyIG5hbWUgPSB1bmRlZmluZWQ7XG4gICAgICB2YXIgbXNnID0gbWVzc2FnZTsgLy8gbXVzdCBiZSBuZXcgdmFyIG9yIHdpbGwgbW9kaWZ5IG9yaWdpbmFsIGBhcmd1bWVudHNgXG4gICAgICB2YXIgZ3JvdXBzO1xuICAgICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwobWVzc2FnZSkgPT09ICdbb2JqZWN0IFN0cmluZ10nKSB7XG4gICAgICAgIHZhciBncm91cHMgPSBtZXNzYWdlLm1hdGNoKEVSUk9SX1RZUEVTX1JFKTtcbiAgICAgICAgaWYgKGdyb3Vwcykge1xuICAgICAgICAgIG5hbWUgPSBncm91cHNbMV07XG4gICAgICAgICAgbXNnID0gZ3JvdXBzWzJdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxvY2F0aW9uLmZ1bmMgPSBVTktOT1dOX0ZVTkNUSU9OO1xuXG4gICAgICBzdGFjayA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgbWVzc2FnZTogbXNnLFxuICAgICAgICB1cmw6IGdldExvY2F0aW9uSHJlZigpLFxuICAgICAgICBzdGFjazogW2xvY2F0aW9uXVxuICAgICAgfTtcbiAgICAgIG5vdGlmeUhhbmRsZXJzKHN0YWNrLCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAoX29sZE9uZXJyb3JIYW5kbGVyKSB7XG4gICAgICByZXR1cm4gX29sZE9uZXJyb3JIYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5zdGFsbEdsb2JhbEhhbmRsZXIoKSB7XG4gICAgaWYgKF9vbkVycm9ySGFuZGxlckluc3RhbGxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBfb2xkT25lcnJvckhhbmRsZXIgPSBfd2luZG93Lm9uZXJyb3I7XG4gICAgX3dpbmRvdy5vbmVycm9yID0gdHJhY2VLaXRXaW5kb3dPbkVycm9yO1xuICAgIF9vbkVycm9ySGFuZGxlckluc3RhbGxlZCA9IHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiB1bmluc3RhbGxHbG9iYWxIYW5kbGVyKCkge1xuICAgIGlmICghX29uRXJyb3JIYW5kbGVySW5zdGFsbGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIF93aW5kb3cub25lcnJvciA9IF9vbGRPbmVycm9ySGFuZGxlcjtcbiAgICBfb25FcnJvckhhbmRsZXJJbnN0YWxsZWQgPSBmYWxzZTtcbiAgICBfb2xkT25lcnJvckhhbmRsZXIgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9jZXNzTGFzdEV4Y2VwdGlvbigpIHtcbiAgICB2YXIgX2xhc3RFeGNlcHRpb25TdGFjayA9IGxhc3RFeGNlcHRpb25TdGFjayxcbiAgICAgIF9sYXN0QXJncyA9IGxhc3RBcmdzO1xuICAgIGxhc3RBcmdzID0gbnVsbDtcbiAgICBsYXN0RXhjZXB0aW9uU3RhY2sgPSBudWxsO1xuICAgIGxhc3RFeGNlcHRpb24gPSBudWxsO1xuICAgIG5vdGlmeUhhbmRsZXJzLmFwcGx5KG51bGwsIFtfbGFzdEV4Y2VwdGlvblN0YWNrLCBmYWxzZV0uY29uY2F0KF9sYXN0QXJncykpO1xuICB9XG5cbiAgLyoqXG4gICAgICogUmVwb3J0cyBhbiB1bmhhbmRsZWQgRXJyb3IgdG8gVHJhY2VLaXQuXG4gICAgICogQHBhcmFtIHtFcnJvcn0gZXhcbiAgICAgKiBAcGFyYW0gez9ib29sZWFufSByZXRocm93IElmIGZhbHNlLCBkbyBub3QgcmUtdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgKiBPbmx5IHVzZWQgZm9yIHdpbmRvdy5vbmVycm9yIHRvIG5vdCBjYXVzZSBhbiBpbmZpbml0ZSBsb29wIG9mXG4gICAgICogcmV0aHJvd2luZy5cbiAgICAgKi9cbiAgZnVuY3Rpb24gcmVwb3J0KGV4LCByZXRocm93KSB7XG4gICAgdmFyIGFyZ3MgPSBfc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGlmIChsYXN0RXhjZXB0aW9uU3RhY2spIHtcbiAgICAgIGlmIChsYXN0RXhjZXB0aW9uID09PSBleCkge1xuICAgICAgICByZXR1cm47IC8vIGFscmVhZHkgY2F1Z2h0IGJ5IGFuIGlubmVyIGNhdGNoIGJsb2NrLCBpZ25vcmVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2Nlc3NMYXN0RXhjZXB0aW9uKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHN0YWNrID0gVHJhY2VLaXQuY29tcHV0ZVN0YWNrVHJhY2UoZXgpO1xuICAgIGxhc3RFeGNlcHRpb25TdGFjayA9IHN0YWNrO1xuICAgIGxhc3RFeGNlcHRpb24gPSBleDtcbiAgICBsYXN0QXJncyA9IGFyZ3M7XG5cbiAgICAvLyBJZiB0aGUgc3RhY2sgdHJhY2UgaXMgaW5jb21wbGV0ZSwgd2FpdCBmb3IgMiBzZWNvbmRzIGZvclxuICAgIC8vIHNsb3cgc2xvdyBJRSB0byBzZWUgaWYgb25lcnJvciBvY2N1cnMgb3Igbm90IGJlZm9yZSByZXBvcnRpbmdcbiAgICAvLyB0aGlzIGV4Y2VwdGlvbjsgb3RoZXJ3aXNlLCB3ZSB3aWxsIGVuZCB1cCB3aXRoIGFuIGluY29tcGxldGVcbiAgICAvLyBzdGFjayB0cmFjZVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAobGFzdEV4Y2VwdGlvbiA9PT0gZXgpIHtcbiAgICAgICAgcHJvY2Vzc0xhc3RFeGNlcHRpb24oKTtcbiAgICAgIH1cbiAgICB9LCBzdGFjay5pbmNvbXBsZXRlID8gMjAwMCA6IDApO1xuXG4gICAgaWYgKHJldGhyb3cgIT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBleDsgLy8gcmUtdGhyb3cgdG8gcHJvcGFnYXRlIHRvIHRoZSB0b3AgbGV2ZWwgKGFuZCBjYXVzZSB3aW5kb3cub25lcnJvcilcbiAgICB9XG4gIH1cblxuICByZXBvcnQuc3Vic2NyaWJlID0gc3Vic2NyaWJlO1xuICByZXBvcnQudW5zdWJzY3JpYmUgPSB1bnN1YnNjcmliZTtcbiAgcmVwb3J0LnVuaW5zdGFsbCA9IHVuc3Vic2NyaWJlQWxsO1xuICByZXR1cm4gcmVwb3J0O1xufSkoKTtcblxuLyoqXG4gKiBUcmFjZUtpdC5jb21wdXRlU3RhY2tUcmFjZTogY3Jvc3MtYnJvd3NlciBzdGFjayB0cmFjZXMgaW4gSmF2YVNjcmlwdFxuICpcbiAqIFN5bnRheDpcbiAqICAgcyA9IFRyYWNlS2l0LmNvbXB1dGVTdGFja1RyYWNlKGV4Y2VwdGlvbikgLy8gY29uc2lkZXIgdXNpbmcgVHJhY2VLaXQucmVwb3J0IGluc3RlYWQgKHNlZSBiZWxvdylcbiAqIFJldHVybnM6XG4gKiAgIHMubmFtZSAgICAgICAgICAgICAgLSBleGNlcHRpb24gbmFtZVxuICogICBzLm1lc3NhZ2UgICAgICAgICAgIC0gZXhjZXB0aW9uIG1lc3NhZ2VcbiAqICAgcy5zdGFja1tpXS51cmwgICAgICAtIEphdmFTY3JpcHQgb3IgSFRNTCBmaWxlIFVSTFxuICogICBzLnN0YWNrW2ldLmZ1bmMgICAgIC0gZnVuY3Rpb24gbmFtZSwgb3IgZW1wdHkgZm9yIGFub255bW91cyBmdW5jdGlvbnMgKGlmIGd1ZXNzaW5nIGRpZCBub3Qgd29yaylcbiAqICAgcy5zdGFja1tpXS5hcmdzICAgICAtIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uLCBpZiBrbm93blxuICogICBzLnN0YWNrW2ldLmxpbmUgICAgIC0gbGluZSBudW1iZXIsIGlmIGtub3duXG4gKiAgIHMuc3RhY2tbaV0uY29sdW1uICAgLSBjb2x1bW4gbnVtYmVyLCBpZiBrbm93blxuICpcbiAqIFN1cHBvcnRzOlxuICogICAtIEZpcmVmb3g6ICBmdWxsIHN0YWNrIHRyYWNlIHdpdGggbGluZSBudW1iZXJzIGFuZCB1bnJlbGlhYmxlIGNvbHVtblxuICogICAgICAgICAgICAgICBudW1iZXIgb24gdG9wIGZyYW1lXG4gKiAgIC0gT3BlcmEgMTA6IGZ1bGwgc3RhY2sgdHJhY2Ugd2l0aCBsaW5lIGFuZCBjb2x1bW4gbnVtYmVyc1xuICogICAtIE9wZXJhIDktOiBmdWxsIHN0YWNrIHRyYWNlIHdpdGggbGluZSBudW1iZXJzXG4gKiAgIC0gQ2hyb21lOiAgIGZ1bGwgc3RhY2sgdHJhY2Ugd2l0aCBsaW5lIGFuZCBjb2x1bW4gbnVtYmVyc1xuICogICAtIFNhZmFyaTogICBsaW5lIGFuZCBjb2x1bW4gbnVtYmVyIGZvciB0aGUgdG9wbW9zdCBzdGFja3RyYWNlIGVsZW1lbnRcbiAqICAgICAgICAgICAgICAgb25seVxuICogICAtIElFOiAgICAgICBubyBsaW5lIG51bWJlcnMgd2hhdHNvZXZlclxuICpcbiAqIFRyaWVzIHRvIGd1ZXNzIG5hbWVzIG9mIGFub255bW91cyBmdW5jdGlvbnMgYnkgbG9va2luZyBmb3IgYXNzaWdubWVudHNcbiAqIGluIHRoZSBzb3VyY2UgY29kZS4gSW4gSUUgYW5kIFNhZmFyaSwgd2UgaGF2ZSB0byBndWVzcyBzb3VyY2UgZmlsZSBuYW1lc1xuICogYnkgc2VhcmNoaW5nIGZvciBmdW5jdGlvbiBib2RpZXMgaW5zaWRlIGFsbCBwYWdlIHNjcmlwdHMuIFRoaXMgd2lsbCBub3RcbiAqIHdvcmsgZm9yIHNjcmlwdHMgdGhhdCBhcmUgbG9hZGVkIGNyb3NzLWRvbWFpbi5cbiAqIEhlcmUgYmUgZHJhZ29uczogc29tZSBmdW5jdGlvbiBuYW1lcyBtYXkgYmUgZ3Vlc3NlZCBpbmNvcnJlY3RseSwgYW5kXG4gKiBkdXBsaWNhdGUgZnVuY3Rpb25zIG1heSBiZSBtaXNtYXRjaGVkLlxuICpcbiAqIFRyYWNlS2l0LmNvbXB1dGVTdGFja1RyYWNlIHNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIHRyYWNpbmcgcHVycG9zZXMuXG4gKiBMb2dnaW5nIG9mIHVuaGFuZGxlZCBleGNlcHRpb25zIHNob3VsZCBiZSBkb25lIHdpdGggVHJhY2VLaXQucmVwb3J0LFxuICogd2hpY2ggYnVpbGRzIG9uIHRvcCBvZiBUcmFjZUtpdC5jb21wdXRlU3RhY2tUcmFjZSBhbmQgcHJvdmlkZXMgYmV0dGVyXG4gKiBJRSBzdXBwb3J0IGJ5IHV0aWxpemluZyB0aGUgd2luZG93Lm9uZXJyb3IgZXZlbnQgdG8gcmV0cmlldmUgaW5mb3JtYXRpb25cbiAqIGFib3V0IHRoZSB0b3Agb2YgdGhlIHN0YWNrLlxuICpcbiAqIE5vdGU6IEluIElFIGFuZCBTYWZhcmksIG5vIHN0YWNrIHRyYWNlIGlzIHJlY29yZGVkIG9uIHRoZSBFcnJvciBvYmplY3QsXG4gKiBzbyBjb21wdXRlU3RhY2tUcmFjZSBpbnN0ZWFkIHdhbGtzIGl0cyAqb3duKiBjaGFpbiBvZiBjYWxsZXJzLlxuICogVGhpcyBtZWFucyB0aGF0OlxuICogICogaW4gU2FmYXJpLCBzb21lIG1ldGhvZHMgbWF5IGJlIG1pc3NpbmcgZnJvbSB0aGUgc3RhY2sgdHJhY2U7XG4gKiAgKiBpbiBJRSwgdGhlIHRvcG1vc3QgZnVuY3Rpb24gaW4gdGhlIHN0YWNrIHRyYWNlIHdpbGwgYWx3YXlzIGJlIHRoZVxuICogICAgY2FsbGVyIG9mIGNvbXB1dGVTdGFja1RyYWNlLlxuICpcbiAqIFRoaXMgaXMgb2theSBmb3IgdHJhY2luZyAoYmVjYXVzZSB5b3UgYXJlIGxpa2VseSB0byBiZSBjYWxsaW5nXG4gKiBjb21wdXRlU3RhY2tUcmFjZSBmcm9tIHRoZSBmdW5jdGlvbiB5b3Ugd2FudCB0byBiZSB0aGUgdG9wbW9zdCBlbGVtZW50XG4gKiBvZiB0aGUgc3RhY2sgdHJhY2UgYW55d2F5KSwgYnV0IG5vdCBva2F5IGZvciBsb2dnaW5nIHVuaGFuZGxlZFxuICogZXhjZXB0aW9ucyAoYmVjYXVzZSB5b3VyIGNhdGNoIGJsb2NrIHdpbGwgbGlrZWx5IGJlIGZhciBhd2F5IGZyb20gdGhlXG4gKiBpbm5lciBmdW5jdGlvbiB0aGF0IGFjdHVhbGx5IGNhdXNlZCB0aGUgZXhjZXB0aW9uKS5cbiAqXG4gKi9cblRyYWNlS2l0LmNvbXB1dGVTdGFja1RyYWNlID0gKGZ1bmN0aW9uIGNvbXB1dGVTdGFja1RyYWNlV3JhcHBlcigpIHtcbiAgLy8gQ29udGVudHMgb2YgRXhjZXB0aW9uIGluIHZhcmlvdXMgYnJvd3NlcnMuXG4gIC8vXG4gIC8vIFNBRkFSSTpcbiAgLy8gZXgubWVzc2FnZSA9IENhbid0IGZpbmQgdmFyaWFibGU6IHFxXG4gIC8vIGV4LmxpbmUgPSA1OVxuICAvLyBleC5zb3VyY2VJZCA9IDU4MDIzODE5MlxuICAvLyBleC5zb3VyY2VVUkwgPSBodHRwOi8vLi4uXG4gIC8vIGV4LmV4cHJlc3Npb25CZWdpbk9mZnNldCA9IDk2XG4gIC8vIGV4LmV4cHJlc3Npb25DYXJldE9mZnNldCA9IDk4XG4gIC8vIGV4LmV4cHJlc3Npb25FbmRPZmZzZXQgPSA5OFxuICAvLyBleC5uYW1lID0gUmVmZXJlbmNlRXJyb3JcbiAgLy9cbiAgLy8gRklSRUZPWDpcbiAgLy8gZXgubWVzc2FnZSA9IHFxIGlzIG5vdCBkZWZpbmVkXG4gIC8vIGV4LmZpbGVOYW1lID0gaHR0cDovLy4uLlxuICAvLyBleC5saW5lTnVtYmVyID0gNTlcbiAgLy8gZXguY29sdW1uTnVtYmVyID0gNjlcbiAgLy8gZXguc3RhY2sgPSAuLi5zdGFjayB0cmFjZS4uLiAoc2VlIHRoZSBleGFtcGxlIGJlbG93KVxuICAvLyBleC5uYW1lID0gUmVmZXJlbmNlRXJyb3JcbiAgLy9cbiAgLy8gQ0hST01FOlxuICAvLyBleC5tZXNzYWdlID0gcXEgaXMgbm90IGRlZmluZWRcbiAgLy8gZXgubmFtZSA9IFJlZmVyZW5jZUVycm9yXG4gIC8vIGV4LnR5cGUgPSBub3RfZGVmaW5lZFxuICAvLyBleC5hcmd1bWVudHMgPSBbJ2FhJ11cbiAgLy8gZXguc3RhY2sgPSAuLi5zdGFjayB0cmFjZS4uLlxuICAvL1xuICAvLyBJTlRFUk5FVCBFWFBMT1JFUjpcbiAgLy8gZXgubWVzc2FnZSA9IC4uLlxuICAvLyBleC5uYW1lID0gUmVmZXJlbmNlRXJyb3JcbiAgLy9cbiAgLy8gT1BFUkE6XG4gIC8vIGV4Lm1lc3NhZ2UgPSAuLi5tZXNzYWdlLi4uIChzZWUgdGhlIGV4YW1wbGUgYmVsb3cpXG4gIC8vIGV4Lm5hbWUgPSBSZWZlcmVuY2VFcnJvclxuICAvLyBleC5vcGVyYSNzb3VyY2Vsb2MgPSAxMSAgKHByZXR0eSBtdWNoIHVzZWxlc3MsIGR1cGxpY2F0ZXMgdGhlIGluZm8gaW4gZXgubWVzc2FnZSlcbiAgLy8gZXguc3RhY2t0cmFjZSA9IG4vYTsgc2VlICdvcGVyYTpjb25maWcjVXNlclByZWZzfEV4Y2VwdGlvbnMgSGF2ZSBTdGFja3RyYWNlJ1xuXG4gIC8qKlxuICAgICAqIENvbXB1dGVzIHN0YWNrIHRyYWNlIGluZm9ybWF0aW9uIGZyb20gdGhlIHN0YWNrIHByb3BlcnR5LlxuICAgICAqIENocm9tZSBhbmQgR2Vja28gdXNlIHRoaXMgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHtFcnJvcn0gZXhcbiAgICAgKiBAcmV0dXJuIHs/T2JqZWN0LjxzdHJpbmcsICo+fSBTdGFjayB0cmFjZSBpbmZvcm1hdGlvbi5cbiAgICAgKi9cbiAgZnVuY3Rpb24gY29tcHV0ZVN0YWNrVHJhY2VGcm9tU3RhY2tQcm9wKGV4KSB7XG4gICAgaWYgKHR5cGVvZiBleC5zdGFjayA9PT0gJ3VuZGVmaW5lZCcgfHwgIWV4LnN0YWNrKSByZXR1cm47XG5cbiAgICB2YXIgY2hyb21lID0gL15cXHMqYXQgKC4qPykgP1xcKCgoPzpmaWxlfGh0dHBzP3xibG9ifGNocm9tZS1leHRlbnNpb258bmF0aXZlfGV2YWx8d2VicGFja3w8YW5vbnltb3VzPnxbYS16XTp8XFwvKS4qPykoPzo6KFxcZCspKT8oPzo6KFxcZCspKT9cXCk/XFxzKiQvaSxcbiAgICAgIGdlY2tvID0gL15cXHMqKC4qPykoPzpcXCgoLio/KVxcKSk/KD86XnxAKSgoPzpmaWxlfGh0dHBzP3xibG9ifGNocm9tZXx3ZWJwYWNrfHJlc291cmNlfFxcW25hdGl2ZSkuKj98W15AXSpidW5kbGUpKD86OihcXGQrKSk/KD86OihcXGQrKSk/XFxzKiQvaSxcbiAgICAgIHdpbmpzID0gL15cXHMqYXQgKD86KCg/OlxcW29iamVjdCBvYmplY3RcXF0pPy4rKSApP1xcKD8oKD86ZmlsZXxtcy1hcHB4fGh0dHBzP3x3ZWJwYWNrfGJsb2IpOi4qPyk6KFxcZCspKD86OihcXGQrKSk/XFwpP1xccyokL2ksXG4gICAgICAvLyBVc2VkIHRvIGFkZGl0aW9uYWxseSBwYXJzZSBVUkwvbGluZS9jb2x1bW4gZnJvbSBldmFsIGZyYW1lc1xuICAgICAgZ2Vja29FdmFsID0gLyhcXFMrKSBsaW5lIChcXGQrKSg/OiA+IGV2YWwgbGluZSBcXGQrKSogPiBldmFsL2ksXG4gICAgICBjaHJvbWVFdmFsID0gL1xcKChcXFMqKSg/OjooXFxkKykpKD86OihcXGQrKSlcXCkvLFxuICAgICAgbGluZXMgPSBleC5zdGFjay5zcGxpdCgnXFxuJyksXG4gICAgICBzdGFjayA9IFtdLFxuICAgICAgc3VibWF0Y2gsXG4gICAgICBwYXJ0cyxcbiAgICAgIGVsZW1lbnQsXG4gICAgICByZWZlcmVuY2UgPSAvXiguKikgaXMgdW5kZWZpbmVkJC8uZXhlYyhleC5tZXNzYWdlKTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gbGluZXMubGVuZ3RoOyBpIDwgajsgKytpKSB7XG4gICAgICBpZiAoKHBhcnRzID0gY2hyb21lLmV4ZWMobGluZXNbaV0pKSkge1xuICAgICAgICB2YXIgaXNOYXRpdmUgPSBwYXJ0c1syXSAmJiBwYXJ0c1syXS5pbmRleE9mKCduYXRpdmUnKSA9PT0gMDsgLy8gc3RhcnQgb2YgbGluZVxuICAgICAgICB2YXIgaXNFdmFsID0gcGFydHNbMl0gJiYgcGFydHNbMl0uaW5kZXhPZignZXZhbCcpID09PSAwOyAvLyBzdGFydCBvZiBsaW5lXG4gICAgICAgIGlmIChpc0V2YWwgJiYgKHN1Ym1hdGNoID0gY2hyb21lRXZhbC5leGVjKHBhcnRzWzJdKSkpIHtcbiAgICAgICAgICAvLyB0aHJvdyBvdXQgZXZhbCBsaW5lL2NvbHVtbiBhbmQgdXNlIHRvcC1tb3N0IGxpbmUvY29sdW1uIG51bWJlclxuICAgICAgICAgIHBhcnRzWzJdID0gc3VibWF0Y2hbMV07IC8vIHVybFxuICAgICAgICAgIHBhcnRzWzNdID0gc3VibWF0Y2hbMl07IC8vIGxpbmVcbiAgICAgICAgICBwYXJ0c1s0XSA9IHN1Ym1hdGNoWzNdOyAvLyBjb2x1bW5cbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50ID0ge1xuICAgICAgICAgIHVybDogIWlzTmF0aXZlID8gcGFydHNbMl0gOiBudWxsLFxuICAgICAgICAgIGZ1bmM6IHBhcnRzWzFdIHx8IFVOS05PV05fRlVOQ1RJT04sXG4gICAgICAgICAgYXJnczogaXNOYXRpdmUgPyBbcGFydHNbMl1dIDogW10sXG4gICAgICAgICAgbGluZTogcGFydHNbM10gPyArcGFydHNbM10gOiBudWxsLFxuICAgICAgICAgIGNvbHVtbjogcGFydHNbNF0gPyArcGFydHNbNF0gOiBudWxsXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKChwYXJ0cyA9IHdpbmpzLmV4ZWMobGluZXNbaV0pKSkge1xuICAgICAgICBlbGVtZW50ID0ge1xuICAgICAgICAgIHVybDogcGFydHNbMl0sXG4gICAgICAgICAgZnVuYzogcGFydHNbMV0gfHwgVU5LTk9XTl9GVU5DVElPTixcbiAgICAgICAgICBhcmdzOiBbXSxcbiAgICAgICAgICBsaW5lOiArcGFydHNbM10sXG4gICAgICAgICAgY29sdW1uOiBwYXJ0c1s0XSA/ICtwYXJ0c1s0XSA6IG51bGxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoKHBhcnRzID0gZ2Vja28uZXhlYyhsaW5lc1tpXSkpKSB7XG4gICAgICAgIHZhciBpc0V2YWwgPSBwYXJ0c1szXSAmJiBwYXJ0c1szXS5pbmRleE9mKCcgPiBldmFsJykgPiAtMTtcbiAgICAgICAgaWYgKGlzRXZhbCAmJiAoc3VibWF0Y2ggPSBnZWNrb0V2YWwuZXhlYyhwYXJ0c1szXSkpKSB7XG4gICAgICAgICAgLy8gdGhyb3cgb3V0IGV2YWwgbGluZS9jb2x1bW4gYW5kIHVzZSB0b3AtbW9zdCBsaW5lIG51bWJlclxuICAgICAgICAgIHBhcnRzWzNdID0gc3VibWF0Y2hbMV07XG4gICAgICAgICAgcGFydHNbNF0gPSBzdWJtYXRjaFsyXTtcbiAgICAgICAgICBwYXJ0c1s1XSA9IG51bGw7IC8vIG5vIGNvbHVtbiB3aGVuIGV2YWxcbiAgICAgICAgfSBlbHNlIGlmIChpID09PSAwICYmICFwYXJ0c1s1XSAmJiB0eXBlb2YgZXguY29sdW1uTnVtYmVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vIEZpcmVGb3ggdXNlcyB0aGlzIGF3ZXNvbWUgY29sdW1uTnVtYmVyIHByb3BlcnR5IGZvciBpdHMgdG9wIGZyYW1lXG4gICAgICAgICAgLy8gQWxzbyBub3RlLCBGaXJlZm94J3MgY29sdW1uIG51bWJlciBpcyAwLWJhc2VkIGFuZCBldmVyeXRoaW5nIGVsc2UgZXhwZWN0cyAxLWJhc2VkLFxuICAgICAgICAgIC8vIHNvIGFkZGluZyAxXG4gICAgICAgICAgLy8gTk9URTogdGhpcyBoYWNrIGRvZXNuJ3Qgd29yayBpZiB0b3AtbW9zdCBmcmFtZSBpcyBldmFsXG4gICAgICAgICAgc3RhY2tbMF0uY29sdW1uID0gZXguY29sdW1uTnVtYmVyICsgMTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50ID0ge1xuICAgICAgICAgIHVybDogcGFydHNbM10sXG4gICAgICAgICAgZnVuYzogcGFydHNbMV0gfHwgVU5LTk9XTl9GVU5DVElPTixcbiAgICAgICAgICBhcmdzOiBwYXJ0c1syXSA/IHBhcnRzWzJdLnNwbGl0KCcsJykgOiBbXSxcbiAgICAgICAgICBsaW5lOiBwYXJ0c1s0XSA/ICtwYXJ0c1s0XSA6IG51bGwsXG4gICAgICAgICAgY29sdW1uOiBwYXJ0c1s1XSA/ICtwYXJ0c1s1XSA6IG51bGxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWVsZW1lbnQuZnVuYyAmJiBlbGVtZW50LmxpbmUpIHtcbiAgICAgICAgZWxlbWVudC5mdW5jID0gVU5LTk9XTl9GVU5DVElPTjtcbiAgICAgIH1cblxuICAgICAgc3RhY2sucHVzaChlbGVtZW50KTtcbiAgICB9XG5cbiAgICBpZiAoIXN0YWNrLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IGV4Lm5hbWUsXG4gICAgICBtZXNzYWdlOiBleC5tZXNzYWdlLFxuICAgICAgdXJsOiBnZXRMb2NhdGlvbkhyZWYoKSxcbiAgICAgIHN0YWNrOiBzdGFja1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICAgKiBBZGRzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBmaXJzdCBmcmFtZSB0byBpbmNvbXBsZXRlIHN0YWNrIHRyYWNlcy5cbiAgICAgKiBTYWZhcmkgYW5kIElFIHJlcXVpcmUgdGhpcyB0byBnZXQgY29tcGxldGUgZGF0YSBvbiB0aGUgZmlyc3QgZnJhbWUuXG4gICAgICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgKj59IHN0YWNrSW5mbyBTdGFjayB0cmFjZSBpbmZvcm1hdGlvbiBmcm9tXG4gICAgICogb25lIG9mIHRoZSBjb21wdXRlKiBtZXRob2RzLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCBvZiB0aGUgc2NyaXB0IHRoYXQgY2F1c2VkIGFuIGVycm9yLlxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxzdHJpbmcpfSBsaW5lTm8gVGhlIGxpbmUgbnVtYmVyIG9mIHRoZSBzY3JpcHQgdGhhdFxuICAgICAqIGNhdXNlZCBhbiBlcnJvci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIGVycm9yIGdlbmVyYXRlZCBieSB0aGUgYnJvd3Nlciwgd2hpY2hcbiAgICAgKiBob3BlZnVsbHkgY29udGFpbnMgdGhlIG5hbWUgb2YgdGhlIG9iamVjdCB0aGF0IGNhdXNlZCB0aGUgZXJyb3IuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHN0YWNrIGluZm9ybWF0aW9uIHdhc1xuICAgICAqIGF1Z21lbnRlZC5cbiAgICAgKi9cbiAgZnVuY3Rpb24gYXVnbWVudFN0YWNrVHJhY2VXaXRoSW5pdGlhbEVsZW1lbnQoc3RhY2tJbmZvLCB1cmwsIGxpbmVObywgbWVzc2FnZSkge1xuICAgIHZhciBpbml0aWFsID0ge1xuICAgICAgdXJsOiB1cmwsXG4gICAgICBsaW5lOiBsaW5lTm9cbiAgICB9O1xuXG4gICAgaWYgKGluaXRpYWwudXJsICYmIGluaXRpYWwubGluZSkge1xuICAgICAgc3RhY2tJbmZvLmluY29tcGxldGUgPSBmYWxzZTtcblxuICAgICAgaWYgKCFpbml0aWFsLmZ1bmMpIHtcbiAgICAgICAgaW5pdGlhbC5mdW5jID0gVU5LTk9XTl9GVU5DVElPTjtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YWNrSW5mby5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChzdGFja0luZm8uc3RhY2tbMF0udXJsID09PSBpbml0aWFsLnVybCkge1xuICAgICAgICAgIGlmIChzdGFja0luZm8uc3RhY2tbMF0ubGluZSA9PT0gaW5pdGlhbC5saW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIGFscmVhZHkgaW4gc3RhY2sgdHJhY2VcbiAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgIXN0YWNrSW5mby5zdGFja1swXS5saW5lICYmXG4gICAgICAgICAgICBzdGFja0luZm8uc3RhY2tbMF0uZnVuYyA9PT0gaW5pdGlhbC5mdW5jXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBzdGFja0luZm8uc3RhY2tbMF0ubGluZSA9IGluaXRpYWwubGluZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3RhY2tJbmZvLnN0YWNrLnVuc2hpZnQoaW5pdGlhbCk7XG4gICAgICBzdGFja0luZm8ucGFydGlhbCA9IHRydWU7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhY2tJbmZvLmluY29tcGxldGUgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIENvbXB1dGVzIHN0YWNrIHRyYWNlIGluZm9ybWF0aW9uIGJ5IHdhbGtpbmcgdGhlIGFyZ3VtZW50cy5jYWxsZXJcbiAgICAgKiBjaGFpbiBhdCB0aGUgdGltZSB0aGUgZXhjZXB0aW9uIG9jY3VycmVkLiBUaGlzIHdpbGwgY2F1c2UgZWFybGllclxuICAgICAqIGZyYW1lcyB0byBiZSBtaXNzZWQgYnV0IGlzIHRoZSBvbmx5IHdheSB0byBnZXQgYW55IHN0YWNrIHRyYWNlIGluXG4gICAgICogU2FmYXJpIGFuZCBJRS4gVGhlIHRvcCBmcmFtZSBpcyByZXN0b3JlZCBieVxuICAgICAqIHtAbGluayBhdWdtZW50U3RhY2tUcmFjZVdpdGhJbml0aWFsRWxlbWVudH0uXG4gICAgICogQHBhcmFtIHtFcnJvcn0gZXhcbiAgICAgKiBAcmV0dXJuIHs/T2JqZWN0LjxzdHJpbmcsICo+fSBTdGFjayB0cmFjZSBpbmZvcm1hdGlvbi5cbiAgICAgKi9cbiAgZnVuY3Rpb24gY29tcHV0ZVN0YWNrVHJhY2VCeVdhbGtpbmdDYWxsZXJDaGFpbihleCwgZGVwdGgpIHtcbiAgICB2YXIgZnVuY3Rpb25OYW1lID0gL2Z1bmN0aW9uXFxzKyhbXyRhLXpBLVpcXHhBMC1cXHVGRkZGXVtfJGEtekEtWjAtOVxceEEwLVxcdUZGRkZdKik/XFxzKlxcKC9pLFxuICAgICAgc3RhY2sgPSBbXSxcbiAgICAgIGZ1bmNzID0ge30sXG4gICAgICByZWN1cnNpb24gPSBmYWxzZSxcbiAgICAgIHBhcnRzLFxuICAgICAgaXRlbSxcbiAgICAgIHNvdXJjZTtcblxuICAgIGZvciAoXG4gICAgICB2YXIgY3VyciA9IGNvbXB1dGVTdGFja1RyYWNlQnlXYWxraW5nQ2FsbGVyQ2hhaW4uY2FsbGVyO1xuICAgICAgY3VyciAmJiAhcmVjdXJzaW9uO1xuICAgICAgY3VyciA9IGN1cnIuY2FsbGVyXG4gICAgKSB7XG4gICAgICBpZiAoY3VyciA9PT0gY29tcHV0ZVN0YWNrVHJhY2UgfHwgY3VyciA9PT0gVHJhY2VLaXQucmVwb3J0KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdza2lwcGluZyBpbnRlcm5hbCBmdW5jdGlvbicpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdXJsOiBudWxsLFxuICAgICAgICBmdW5jOiBVTktOT1dOX0ZVTkNUSU9OLFxuICAgICAgICBsaW5lOiBudWxsLFxuICAgICAgICBjb2x1bW46IG51bGxcbiAgICAgIH07XG5cbiAgICAgIGlmIChjdXJyLm5hbWUpIHtcbiAgICAgICAgaXRlbS5mdW5jID0gY3Vyci5uYW1lO1xuICAgICAgfSBlbHNlIGlmICgocGFydHMgPSBmdW5jdGlvbk5hbWUuZXhlYyhjdXJyLnRvU3RyaW5nKCkpKSkge1xuICAgICAgICBpdGVtLmZ1bmMgPSBwYXJ0c1sxXTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVtLmZ1bmMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaXRlbS5mdW5jID0gcGFydHMuaW5wdXQuc3Vic3RyaW5nKDAsIHBhcnRzLmlucHV0LmluZGV4T2YoJ3snKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICB9XG5cbiAgICAgIGlmIChmdW5jc1snJyArIGN1cnJdKSB7XG4gICAgICAgIHJlY3Vyc2lvbiA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmdW5jc1snJyArIGN1cnJdID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgc3RhY2sucHVzaChpdGVtKTtcbiAgICB9XG5cbiAgICBpZiAoZGVwdGgpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdkZXB0aCBpcyAnICsgZGVwdGgpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3N0YWNrIGlzICcgKyBzdGFjay5sZW5ndGgpO1xuICAgICAgc3RhY2suc3BsaWNlKDAsIGRlcHRoKTtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgbmFtZTogZXgubmFtZSxcbiAgICAgIG1lc3NhZ2U6IGV4Lm1lc3NhZ2UsXG4gICAgICB1cmw6IGdldExvY2F0aW9uSHJlZigpLFxuICAgICAgc3RhY2s6IHN0YWNrXG4gICAgfTtcbiAgICBhdWdtZW50U3RhY2tUcmFjZVdpdGhJbml0aWFsRWxlbWVudChcbiAgICAgIHJlc3VsdCxcbiAgICAgIGV4LnNvdXJjZVVSTCB8fCBleC5maWxlTmFtZSxcbiAgICAgIGV4LmxpbmUgfHwgZXgubGluZU51bWJlcixcbiAgICAgIGV4Lm1lc3NhZ2UgfHwgZXguZGVzY3JpcHRpb25cbiAgICApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICAgKiBDb21wdXRlcyBhIHN0YWNrIHRyYWNlIGZvciBhbiBleGNlcHRpb24uXG4gICAgICogQHBhcmFtIHtFcnJvcn0gZXhcbiAgICAgKiBAcGFyYW0geyhzdHJpbmd8bnVtYmVyKT19IGRlcHRoXG4gICAgICovXG4gIGZ1bmN0aW9uIGNvbXB1dGVTdGFja1RyYWNlKGV4LCBkZXB0aCkge1xuICAgIHZhciBzdGFjayA9IG51bGw7XG4gICAgZGVwdGggPSBkZXB0aCA9PSBudWxsID8gMCA6ICtkZXB0aDtcblxuICAgIHRyeSB7XG4gICAgICBzdGFjayA9IGNvbXB1dGVTdGFja1RyYWNlRnJvbVN0YWNrUHJvcChleCk7XG4gICAgICBpZiAoc3RhY2spIHtcbiAgICAgICAgcmV0dXJuIHN0YWNrO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChUcmFjZUtpdC5kZWJ1Zykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBzdGFjayA9IGNvbXB1dGVTdGFja1RyYWNlQnlXYWxraW5nQ2FsbGVyQ2hhaW4oZXgsIGRlcHRoICsgMSk7XG4gICAgICBpZiAoc3RhY2spIHtcbiAgICAgICAgcmV0dXJuIHN0YWNrO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChUcmFjZUtpdC5kZWJ1Zykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogZXgubmFtZSxcbiAgICAgIG1lc3NhZ2U6IGV4Lm1lc3NhZ2UsXG4gICAgICB1cmw6IGdldExvY2F0aW9uSHJlZigpXG4gICAgfTtcbiAgfVxuXG4gIGNvbXB1dGVTdGFja1RyYWNlLmF1Z21lbnRTdGFja1RyYWNlV2l0aEluaXRpYWxFbGVtZW50ID0gYXVnbWVudFN0YWNrVHJhY2VXaXRoSW5pdGlhbEVsZW1lbnQ7XG4gIGNvbXB1dGVTdGFja1RyYWNlLmNvbXB1dGVTdGFja1RyYWNlRnJvbVN0YWNrUHJvcCA9IGNvbXB1dGVTdGFja1RyYWNlRnJvbVN0YWNrUHJvcDtcblxuICByZXR1cm4gY29tcHV0ZVN0YWNrVHJhY2U7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWNlS2l0O1xuIiwiLypcbiBqc29uLXN0cmluZ2lmeS1zYWZlXG4gTGlrZSBKU09OLnN0cmluZ2lmeSwgYnV0IGRvZXNuJ3QgdGhyb3cgb24gY2lyY3VsYXIgcmVmZXJlbmNlcy5cblxuIE9yaWdpbmFsbHkgZm9ya2VkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9qc29uLXN0cmluZ2lmeS1zYWZlXG4gdmVyc2lvbiA1LjAuMSBvbiAzLzgvMjAxNyBhbmQgbW9kaWZpZWQgdG8gaGFuZGxlIEVycm9ycyBzZXJpYWxpemF0aW9uXG4gYW5kIElFOCBjb21wYXRpYmlsaXR5LiBUZXN0cyBmb3IgdGhpcyBhcmUgaW4gdGVzdC92ZW5kb3IuXG5cbiBJU0MgbGljZW5zZTogaHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9qc29uLXN0cmluZ2lmeS1zYWZlL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHN0cmluZ2lmeTtcbmV4cG9ydHMuZ2V0U2VyaWFsaXplID0gc2VyaWFsaXplcjtcblxuZnVuY3Rpb24gaW5kZXhPZihoYXlzdGFjaywgbmVlZGxlKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaGF5c3RhY2subGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoaGF5c3RhY2tbaV0gPT09IG5lZWRsZSkgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkob2JqLCByZXBsYWNlciwgc3BhY2VzLCBjeWNsZVJlcGxhY2VyKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmosIHNlcmlhbGl6ZXIocmVwbGFjZXIsIGN5Y2xlUmVwbGFjZXIpLCBzcGFjZXMpO1xufVxuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZnRsYWJzL2pzLWFiYnJldmlhdGUvYmxvYi9mYTcwOWU1ZjEzOWU3NzcwYTcxODI3YjE4OTNmMjI0MTgwOTdmYmRhL2luZGV4LmpzI0w5NS1MMTA2XG5mdW5jdGlvbiBzdHJpbmdpZnlFcnJvcih2YWx1ZSkge1xuICB2YXIgZXJyID0ge1xuICAgIC8vIFRoZXNlIHByb3BlcnRpZXMgYXJlIGltcGxlbWVudGVkIGFzIG1hZ2ljYWwgZ2V0dGVycyBhbmQgZG9uJ3Qgc2hvdyB1cCBpbiBmb3IgaW5cbiAgICBzdGFjazogdmFsdWUuc3RhY2ssXG4gICAgbWVzc2FnZTogdmFsdWUubWVzc2FnZSxcbiAgICBuYW1lOiB2YWx1ZS5uYW1lXG4gIH07XG5cbiAgZm9yICh2YXIgaSBpbiB2YWx1ZSkge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGkpKSB7XG4gICAgICBlcnJbaV0gPSB2YWx1ZVtpXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZXJyO1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVyKHJlcGxhY2VyLCBjeWNsZVJlcGxhY2VyKSB7XG4gIHZhciBzdGFjayA9IFtdO1xuICB2YXIga2V5cyA9IFtdO1xuXG4gIGlmIChjeWNsZVJlcGxhY2VyID09IG51bGwpIHtcbiAgICBjeWNsZVJlcGxhY2VyID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKHN0YWNrWzBdID09PSB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gJ1tDaXJjdWxhciB+XSc7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ1tDaXJjdWxhciB+LicgKyBrZXlzLnNsaWNlKDAsIGluZGV4T2Yoc3RhY2ssIHZhbHVlKSkuam9pbignLicpICsgJ10nO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIGlmIChzdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgdGhpc1BvcyA9IGluZGV4T2Yoc3RhY2ssIHRoaXMpO1xuICAgICAgfnRoaXNQb3MgPyBzdGFjay5zcGxpY2UodGhpc1BvcyArIDEpIDogc3RhY2sucHVzaCh0aGlzKTtcbiAgICAgIH50aGlzUG9zID8ga2V5cy5zcGxpY2UodGhpc1BvcywgSW5maW5pdHksIGtleSkgOiBrZXlzLnB1c2goa2V5KTtcblxuICAgICAgaWYgKH5pbmRleE9mKHN0YWNrLCB2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBjeWNsZVJlcGxhY2VyLmNhbGwodGhpcywga2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YWNrLnB1c2godmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiByZXBsYWNlciA9PSBudWxsXG4gICAgICA/IHZhbHVlIGluc3RhbmNlb2YgRXJyb3IgPyBzdHJpbmdpZnlFcnJvcih2YWx1ZSkgOiB2YWx1ZVxuICAgICAgOiByZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpO1xuICB9O1xufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHB1bnljb2RlID0gcmVxdWlyZSgncHVueWNvZGUnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmV4cG9ydHMucGFyc2UgPSB1cmxQYXJzZTtcbmV4cG9ydHMucmVzb2x2ZSA9IHVybFJlc29sdmU7XG5leHBvcnRzLnJlc29sdmVPYmplY3QgPSB1cmxSZXNvbHZlT2JqZWN0O1xuZXhwb3J0cy5mb3JtYXQgPSB1cmxGb3JtYXQ7XG5cbmV4cG9ydHMuVXJsID0gVXJsO1xuXG5mdW5jdGlvbiBVcmwoKSB7XG4gIHRoaXMucHJvdG9jb2wgPSBudWxsO1xuICB0aGlzLnNsYXNoZXMgPSBudWxsO1xuICB0aGlzLmF1dGggPSBudWxsO1xuICB0aGlzLmhvc3QgPSBudWxsO1xuICB0aGlzLnBvcnQgPSBudWxsO1xuICB0aGlzLmhvc3RuYW1lID0gbnVsbDtcbiAgdGhpcy5oYXNoID0gbnVsbDtcbiAgdGhpcy5zZWFyY2ggPSBudWxsO1xuICB0aGlzLnF1ZXJ5ID0gbnVsbDtcbiAgdGhpcy5wYXRobmFtZSA9IG51bGw7XG4gIHRoaXMucGF0aCA9IG51bGw7XG4gIHRoaXMuaHJlZiA9IG51bGw7XG59XG5cbi8vIFJlZmVyZW5jZTogUkZDIDM5ODYsIFJGQyAxODA4LCBSRkMgMjM5NlxuXG4vLyBkZWZpbmUgdGhlc2UgaGVyZSBzbyBhdCBsZWFzdCB0aGV5IG9ubHkgaGF2ZSB0byBiZVxuLy8gY29tcGlsZWQgb25jZSBvbiB0aGUgZmlyc3QgbW9kdWxlIGxvYWQuXG52YXIgcHJvdG9jb2xQYXR0ZXJuID0gL14oW2EtejAtOS4rLV0rOikvaSxcbiAgICBwb3J0UGF0dGVybiA9IC86WzAtOV0qJC8sXG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIGEgc2ltcGxlIHBhdGggVVJMXG4gICAgc2ltcGxlUGF0aFBhdHRlcm4gPSAvXihcXC9cXC8/KD8hXFwvKVteXFw/XFxzXSopKFxcP1teXFxzXSopPyQvLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgcmVzZXJ2ZWQgZm9yIGRlbGltaXRpbmcgVVJMcy5cbiAgICAvLyBXZSBhY3R1YWxseSBqdXN0IGF1dG8tZXNjYXBlIHRoZXNlLlxuICAgIGRlbGltcyA9IFsnPCcsICc+JywgJ1wiJywgJ2AnLCAnICcsICdcXHInLCAnXFxuJywgJ1xcdCddLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgbm90IGFsbG93ZWQgZm9yIHZhcmlvdXMgcmVhc29ucy5cbiAgICB1bndpc2UgPSBbJ3snLCAnfScsICd8JywgJ1xcXFwnLCAnXicsICdgJ10uY29uY2F0KGRlbGltcyksXG5cbiAgICAvLyBBbGxvd2VkIGJ5IFJGQ3MsIGJ1dCBjYXVzZSBvZiBYU1MgYXR0YWNrcy4gIEFsd2F5cyBlc2NhcGUgdGhlc2UuXG4gICAgYXV0b0VzY2FwZSA9IFsnXFwnJ10uY29uY2F0KHVud2lzZSksXG4gICAgLy8gQ2hhcmFjdGVycyB0aGF0IGFyZSBuZXZlciBldmVyIGFsbG93ZWQgaW4gYSBob3N0bmFtZS5cbiAgICAvLyBOb3RlIHRoYXQgYW55IGludmFsaWQgY2hhcnMgYXJlIGFsc28gaGFuZGxlZCwgYnV0IHRoZXNlXG4gICAgLy8gYXJlIHRoZSBvbmVzIHRoYXQgYXJlICpleHBlY3RlZCogdG8gYmUgc2Vlbiwgc28gd2UgZmFzdC1wYXRoXG4gICAgLy8gdGhlbS5cbiAgICBub25Ib3N0Q2hhcnMgPSBbJyUnLCAnLycsICc/JywgJzsnLCAnIyddLmNvbmNhdChhdXRvRXNjYXBlKSxcbiAgICBob3N0RW5kaW5nQ2hhcnMgPSBbJy8nLCAnPycsICcjJ10sXG4gICAgaG9zdG5hbWVNYXhMZW4gPSAyNTUsXG4gICAgaG9zdG5hbWVQYXJ0UGF0dGVybiA9IC9eWythLXowLTlBLVpfLV17MCw2M30kLyxcbiAgICBob3N0bmFtZVBhcnRTdGFydCA9IC9eKFsrYS16MC05QS1aXy1dezAsNjN9KSguKikkLyxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBjYW4gYWxsb3cgXCJ1bnNhZmVcIiBhbmQgXCJ1bndpc2VcIiBjaGFycy5cbiAgICB1bnNhZmVQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IG5ldmVyIGhhdmUgYSBob3N0bmFtZS5cbiAgICBob3N0bGVzc1Byb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgYWx3YXlzIGNvbnRhaW4gYSAvLyBiaXQuXG4gICAgc2xhc2hlZFByb3RvY29sID0ge1xuICAgICAgJ2h0dHAnOiB0cnVlLFxuICAgICAgJ2h0dHBzJzogdHJ1ZSxcbiAgICAgICdmdHAnOiB0cnVlLFxuICAgICAgJ2dvcGhlcic6IHRydWUsXG4gICAgICAnZmlsZSc6IHRydWUsXG4gICAgICAnaHR0cDonOiB0cnVlLFxuICAgICAgJ2h0dHBzOic6IHRydWUsXG4gICAgICAnZnRwOic6IHRydWUsXG4gICAgICAnZ29waGVyOic6IHRydWUsXG4gICAgICAnZmlsZTonOiB0cnVlXG4gICAgfSxcbiAgICBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG5cbmZ1bmN0aW9uIHVybFBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKHVybCAmJiB1dGlsLmlzT2JqZWN0KHVybCkgJiYgdXJsIGluc3RhbmNlb2YgVXJsKSByZXR1cm4gdXJsO1xuXG4gIHZhciB1ID0gbmV3IFVybDtcbiAgdS5wYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KTtcbiAgcmV0dXJuIHU7XG59XG5cblVybC5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbih1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICghdXRpbC5pc1N0cmluZyh1cmwpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlBhcmFtZXRlciAndXJsJyBtdXN0IGJlIGEgc3RyaW5nLCBub3QgXCIgKyB0eXBlb2YgdXJsKTtcbiAgfVxuXG4gIC8vIENvcHkgY2hyb21lLCBJRSwgb3BlcmEgYmFja3NsYXNoLWhhbmRsaW5nIGJlaGF2aW9yLlxuICAvLyBCYWNrIHNsYXNoZXMgYmVmb3JlIHRoZSBxdWVyeSBzdHJpbmcgZ2V0IGNvbnZlcnRlZCB0byBmb3J3YXJkIHNsYXNoZXNcbiAgLy8gU2VlOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MjU5MTZcbiAgdmFyIHF1ZXJ5SW5kZXggPSB1cmwuaW5kZXhPZignPycpLFxuICAgICAgc3BsaXR0ZXIgPVxuICAgICAgICAgIChxdWVyeUluZGV4ICE9PSAtMSAmJiBxdWVyeUluZGV4IDwgdXJsLmluZGV4T2YoJyMnKSkgPyAnPycgOiAnIycsXG4gICAgICB1U3BsaXQgPSB1cmwuc3BsaXQoc3BsaXR0ZXIpLFxuICAgICAgc2xhc2hSZWdleCA9IC9cXFxcL2c7XG4gIHVTcGxpdFswXSA9IHVTcGxpdFswXS5yZXBsYWNlKHNsYXNoUmVnZXgsICcvJyk7XG4gIHVybCA9IHVTcGxpdC5qb2luKHNwbGl0dGVyKTtcblxuICB2YXIgcmVzdCA9IHVybDtcblxuICAvLyB0cmltIGJlZm9yZSBwcm9jZWVkaW5nLlxuICAvLyBUaGlzIGlzIHRvIHN1cHBvcnQgcGFyc2Ugc3R1ZmYgbGlrZSBcIiAgaHR0cDovL2Zvby5jb20gIFxcblwiXG4gIHJlc3QgPSByZXN0LnRyaW0oKTtcblxuICBpZiAoIXNsYXNoZXNEZW5vdGVIb3N0ICYmIHVybC5zcGxpdCgnIycpLmxlbmd0aCA9PT0gMSkge1xuICAgIC8vIFRyeSBmYXN0IHBhdGggcmVnZXhwXG4gICAgdmFyIHNpbXBsZVBhdGggPSBzaW1wbGVQYXRoUGF0dGVybi5leGVjKHJlc3QpO1xuICAgIGlmIChzaW1wbGVQYXRoKSB7XG4gICAgICB0aGlzLnBhdGggPSByZXN0O1xuICAgICAgdGhpcy5ocmVmID0gcmVzdDtcbiAgICAgIHRoaXMucGF0aG5hbWUgPSBzaW1wbGVQYXRoWzFdO1xuICAgICAgaWYgKHNpbXBsZVBhdGhbMl0pIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSBzaW1wbGVQYXRoWzJdO1xuICAgICAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnNlYXJjaC5zdWJzdHIoMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSB0aGlzLnNlYXJjaC5zdWJzdHIoMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgICAgICB0aGlzLnF1ZXJ5ID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH1cblxuICB2YXIgcHJvdG8gPSBwcm90b2NvbFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgaWYgKHByb3RvKSB7XG4gICAgcHJvdG8gPSBwcm90b1swXTtcbiAgICB2YXIgbG93ZXJQcm90byA9IHByb3RvLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5wcm90b2NvbCA9IGxvd2VyUHJvdG87XG4gICAgcmVzdCA9IHJlc3Quc3Vic3RyKHByb3RvLmxlbmd0aCk7XG4gIH1cblxuICAvLyBmaWd1cmUgb3V0IGlmIGl0J3MgZ290IGEgaG9zdFxuICAvLyB1c2VyQHNlcnZlciBpcyAqYWx3YXlzKiBpbnRlcnByZXRlZCBhcyBhIGhvc3RuYW1lLCBhbmQgdXJsXG4gIC8vIHJlc29sdXRpb24gd2lsbCB0cmVhdCAvL2Zvby9iYXIgYXMgaG9zdD1mb28scGF0aD1iYXIgYmVjYXVzZSB0aGF0J3NcbiAgLy8gaG93IHRoZSBicm93c2VyIHJlc29sdmVzIHJlbGF0aXZlIFVSTHMuXG4gIGlmIChzbGFzaGVzRGVub3RlSG9zdCB8fCBwcm90byB8fCByZXN0Lm1hdGNoKC9eXFwvXFwvW15AXFwvXStAW15AXFwvXSsvKSkge1xuICAgIHZhciBzbGFzaGVzID0gcmVzdC5zdWJzdHIoMCwgMikgPT09ICcvLyc7XG4gICAgaWYgKHNsYXNoZXMgJiYgIShwcm90byAmJiBob3N0bGVzc1Byb3RvY29sW3Byb3RvXSkpIHtcbiAgICAgIHJlc3QgPSByZXN0LnN1YnN0cigyKTtcbiAgICAgIHRoaXMuc2xhc2hlcyA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFob3N0bGVzc1Byb3RvY29sW3Byb3RvXSAmJlxuICAgICAgKHNsYXNoZXMgfHwgKHByb3RvICYmICFzbGFzaGVkUHJvdG9jb2xbcHJvdG9dKSkpIHtcblxuICAgIC8vIHRoZXJlJ3MgYSBob3N0bmFtZS5cbiAgICAvLyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgLywgPywgOywgb3IgIyBlbmRzIHRoZSBob3N0LlxuICAgIC8vXG4gICAgLy8gSWYgdGhlcmUgaXMgYW4gQCBpbiB0aGUgaG9zdG5hbWUsIHRoZW4gbm9uLWhvc3QgY2hhcnMgKmFyZSogYWxsb3dlZFxuICAgIC8vIHRvIHRoZSBsZWZ0IG9mIHRoZSBsYXN0IEAgc2lnbiwgdW5sZXNzIHNvbWUgaG9zdC1lbmRpbmcgY2hhcmFjdGVyXG4gICAgLy8gY29tZXMgKmJlZm9yZSogdGhlIEAtc2lnbi5cbiAgICAvLyBVUkxzIGFyZSBvYm5veGlvdXMuXG4gICAgLy9cbiAgICAvLyBleDpcbiAgICAvLyBodHRwOi8vYUBiQGMvID0+IHVzZXI6YUBiIGhvc3Q6Y1xuICAgIC8vIGh0dHA6Ly9hQGI/QGMgPT4gdXNlcjphIGhvc3Q6YyBwYXRoOi8/QGNcblxuICAgIC8vIHYwLjEyIFRPRE8oaXNhYWNzKTogVGhpcyBpcyBub3QgcXVpdGUgaG93IENocm9tZSBkb2VzIHRoaW5ncy5cbiAgICAvLyBSZXZpZXcgb3VyIHRlc3QgY2FzZSBhZ2FpbnN0IGJyb3dzZXJzIG1vcmUgY29tcHJlaGVuc2l2ZWx5LlxuXG4gICAgLy8gZmluZCB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgYW55IGhvc3RFbmRpbmdDaGFyc1xuICAgIHZhciBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3N0RW5kaW5nQ2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2YoaG9zdEVuZGluZ0NoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG5cbiAgICAvLyBhdCB0aGlzIHBvaW50LCBlaXRoZXIgd2UgaGF2ZSBhbiBleHBsaWNpdCBwb2ludCB3aGVyZSB0aGVcbiAgICAvLyBhdXRoIHBvcnRpb24gY2Fubm90IGdvIHBhc3QsIG9yIHRoZSBsYXN0IEAgY2hhciBpcyB0aGUgZGVjaWRlci5cbiAgICB2YXIgYXV0aCwgYXRTaWduO1xuICAgIGlmIChob3N0RW5kID09PSAtMSkge1xuICAgICAgLy8gYXRTaWduIGNhbiBiZSBhbnl3aGVyZS5cbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYXRTaWduIG11c3QgYmUgaW4gYXV0aCBwb3J0aW9uLlxuICAgICAgLy8gaHR0cDovL2FAYi9jQGQgPT4gaG9zdDpiIGF1dGg6YSBwYXRoOi9jQGRcbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnLCBob3N0RW5kKTtcbiAgICB9XG5cbiAgICAvLyBOb3cgd2UgaGF2ZSBhIHBvcnRpb24gd2hpY2ggaXMgZGVmaW5pdGVseSB0aGUgYXV0aC5cbiAgICAvLyBQdWxsIHRoYXQgb2ZmLlxuICAgIGlmIChhdFNpZ24gIT09IC0xKSB7XG4gICAgICBhdXRoID0gcmVzdC5zbGljZSgwLCBhdFNpZ24pO1xuICAgICAgcmVzdCA9IHJlc3Quc2xpY2UoYXRTaWduICsgMSk7XG4gICAgICB0aGlzLmF1dGggPSBkZWNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgfVxuXG4gICAgLy8gdGhlIGhvc3QgaXMgdGhlIHJlbWFpbmluZyB0byB0aGUgbGVmdCBvZiB0aGUgZmlyc3Qgbm9uLWhvc3QgY2hhclxuICAgIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vbkhvc3RDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihub25Ib3N0Q2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cbiAgICAvLyBpZiB3ZSBzdGlsbCBoYXZlIG5vdCBoaXQgaXQsIHRoZW4gdGhlIGVudGlyZSB0aGluZyBpcyBhIGhvc3QuXG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKVxuICAgICAgaG9zdEVuZCA9IHJlc3QubGVuZ3RoO1xuXG4gICAgdGhpcy5ob3N0ID0gcmVzdC5zbGljZSgwLCBob3N0RW5kKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZShob3N0RW5kKTtcblxuICAgIC8vIHB1bGwgb3V0IHBvcnQuXG4gICAgdGhpcy5wYXJzZUhvc3QoKTtcblxuICAgIC8vIHdlJ3ZlIGluZGljYXRlZCB0aGF0IHRoZXJlIGlzIGEgaG9zdG5hbWUsXG4gICAgLy8gc28gZXZlbiBpZiBpdCdzIGVtcHR5LCBpdCBoYXMgdG8gYmUgcHJlc2VudC5cbiAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcblxuICAgIC8vIGlmIGhvc3RuYW1lIGJlZ2lucyB3aXRoIFsgYW5kIGVuZHMgd2l0aCBdXG4gICAgLy8gYXNzdW1lIHRoYXQgaXQncyBhbiBJUHY2IGFkZHJlc3MuXG4gICAgdmFyIGlwdjZIb3N0bmFtZSA9IHRoaXMuaG9zdG5hbWVbMF0gPT09ICdbJyAmJlxuICAgICAgICB0aGlzLmhvc3RuYW1lW3RoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMV0gPT09ICddJztcblxuICAgIC8vIHZhbGlkYXRlIGEgbGl0dGxlLlxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB2YXIgaG9zdHBhcnRzID0gdGhpcy5ob3N0bmFtZS5zcGxpdCgvXFwuLyk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGhvc3RwYXJ0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSBob3N0cGFydHNbaV07XG4gICAgICAgIGlmICghcGFydCkgY29udGludWU7XG4gICAgICAgIGlmICghcGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgIHZhciBuZXdwYXJ0ID0gJyc7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGsgPSBwYXJ0Lmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgaWYgKHBhcnQuY2hhckNvZGVBdChqKSA+IDEyNykge1xuICAgICAgICAgICAgICAvLyB3ZSByZXBsYWNlIG5vbi1BU0NJSSBjaGFyIHdpdGggYSB0ZW1wb3JhcnkgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGlzIHRvIG1ha2Ugc3VyZSBzaXplIG9mIGhvc3RuYW1lIGlzIG5vdFxuICAgICAgICAgICAgICAvLyBicm9rZW4gYnkgcmVwbGFjaW5nIG5vbi1BU0NJSSBieSBub3RoaW5nXG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gJ3gnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbmV3cGFydCArPSBwYXJ0W2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB3ZSB0ZXN0IGFnYWluIHdpdGggQVNDSUkgY2hhciBvbmx5XG4gICAgICAgICAgaWYgKCFuZXdwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgICB2YXIgdmFsaWRQYXJ0cyA9IGhvc3RwYXJ0cy5zbGljZSgwLCBpKTtcbiAgICAgICAgICAgIHZhciBub3RIb3N0ID0gaG9zdHBhcnRzLnNsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgIHZhciBiaXQgPSBwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFN0YXJ0KTtcbiAgICAgICAgICAgIGlmIChiaXQpIHtcbiAgICAgICAgICAgICAgdmFsaWRQYXJ0cy5wdXNoKGJpdFsxXSk7XG4gICAgICAgICAgICAgIG5vdEhvc3QudW5zaGlmdChiaXRbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdEhvc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJlc3QgPSAnLycgKyBub3RIb3N0LmpvaW4oJy4nKSArIHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhvc3RuYW1lID0gdmFsaWRQYXJ0cy5qb2luKCcuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5ob3N0bmFtZS5sZW5ndGggPiBob3N0bmFtZU1heExlbikge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBob3N0bmFtZXMgYXJlIGFsd2F5cyBsb3dlciBjYXNlLlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgLy8gSUROQSBTdXBwb3J0OiBSZXR1cm5zIGEgcHVueWNvZGVkIHJlcHJlc2VudGF0aW9uIG9mIFwiZG9tYWluXCIuXG4gICAgICAvLyBJdCBvbmx5IGNvbnZlcnRzIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB0aGF0XG4gICAgICAvLyBoYXZlIG5vbi1BU0NJSSBjaGFyYWN0ZXJzLCBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmXG4gICAgICAvLyB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQgYWxyZWFkeSBpcyBBU0NJSS1vbmx5LlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHB1bnljb2RlLnRvQVNDSUkodGhpcy5ob3N0bmFtZSk7XG4gICAgfVxuXG4gICAgdmFyIHAgPSB0aGlzLnBvcnQgPyAnOicgKyB0aGlzLnBvcnQgOiAnJztcbiAgICB2YXIgaCA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG4gICAgdGhpcy5ob3N0ID0gaCArIHA7XG4gICAgdGhpcy5ocmVmICs9IHRoaXMuaG9zdDtcblxuICAgIC8vIHN0cmlwIFsgYW5kIF0gZnJvbSB0aGUgaG9zdG5hbWVcbiAgICAvLyB0aGUgaG9zdCBmaWVsZCBzdGlsbCByZXRhaW5zIHRoZW0sIHRob3VnaFxuICAgIGlmIChpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnN1YnN0cigxLCB0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgaWYgKHJlc3RbMF0gIT09ICcvJykge1xuICAgICAgICByZXN0ID0gJy8nICsgcmVzdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBub3cgcmVzdCBpcyBzZXQgdG8gdGhlIHBvc3QtaG9zdCBzdHVmZi5cbiAgLy8gY2hvcCBvZmYgYW55IGRlbGltIGNoYXJzLlxuICBpZiAoIXVuc2FmZVByb3RvY29sW2xvd2VyUHJvdG9dKSB7XG5cbiAgICAvLyBGaXJzdCwgbWFrZSAxMDAlIHN1cmUgdGhhdCBhbnkgXCJhdXRvRXNjYXBlXCIgY2hhcnMgZ2V0XG4gICAgLy8gZXNjYXBlZCwgZXZlbiBpZiBlbmNvZGVVUklDb21wb25lbnQgZG9lc24ndCB0aGluayB0aGV5XG4gICAgLy8gbmVlZCB0byBiZS5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGF1dG9Fc2NhcGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgYWUgPSBhdXRvRXNjYXBlW2ldO1xuICAgICAgaWYgKHJlc3QuaW5kZXhPZihhZSkgPT09IC0xKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIHZhciBlc2MgPSBlbmNvZGVVUklDb21wb25lbnQoYWUpO1xuICAgICAgaWYgKGVzYyA9PT0gYWUpIHtcbiAgICAgICAgZXNjID0gZXNjYXBlKGFlKTtcbiAgICAgIH1cbiAgICAgIHJlc3QgPSByZXN0LnNwbGl0KGFlKS5qb2luKGVzYyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBjaG9wIG9mZiBmcm9tIHRoZSB0YWlsIGZpcnN0LlxuICB2YXIgaGFzaCA9IHJlc3QuaW5kZXhPZignIycpO1xuICBpZiAoaGFzaCAhPT0gLTEpIHtcbiAgICAvLyBnb3QgYSBmcmFnbWVudCBzdHJpbmcuXG4gICAgdGhpcy5oYXNoID0gcmVzdC5zdWJzdHIoaGFzaCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgaGFzaCk7XG4gIH1cbiAgdmFyIHFtID0gcmVzdC5pbmRleE9mKCc/Jyk7XG4gIGlmIChxbSAhPT0gLTEpIHtcbiAgICB0aGlzLnNlYXJjaCA9IHJlc3Quc3Vic3RyKHFtKTtcbiAgICB0aGlzLnF1ZXJ5ID0gcmVzdC5zdWJzdHIocW0gKyAxKTtcbiAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMucXVlcnkpO1xuICAgIH1cbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBxbSk7XG4gIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgIC8vIG5vIHF1ZXJ5IHN0cmluZywgYnV0IHBhcnNlUXVlcnlTdHJpbmcgc3RpbGwgcmVxdWVzdGVkXG4gICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICB0aGlzLnF1ZXJ5ID0ge307XG4gIH1cbiAgaWYgKHJlc3QpIHRoaXMucGF0aG5hbWUgPSByZXN0O1xuICBpZiAoc2xhc2hlZFByb3RvY29sW2xvd2VyUHJvdG9dICYmXG4gICAgICB0aGlzLmhvc3RuYW1lICYmICF0aGlzLnBhdGhuYW1lKSB7XG4gICAgdGhpcy5wYXRobmFtZSA9ICcvJztcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgaWYgKHRoaXMucGF0aG5hbWUgfHwgdGhpcy5zZWFyY2gpIHtcbiAgICB2YXIgcCA9IHRoaXMucGF0aG5hbWUgfHwgJyc7XG4gICAgdmFyIHMgPSB0aGlzLnNlYXJjaCB8fCAnJztcbiAgICB0aGlzLnBhdGggPSBwICsgcztcbiAgfVxuXG4gIC8vIGZpbmFsbHksIHJlY29uc3RydWN0IHRoZSBocmVmIGJhc2VkIG9uIHdoYXQgaGFzIGJlZW4gdmFsaWRhdGVkLlxuICB0aGlzLmhyZWYgPSB0aGlzLmZvcm1hdCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGZvcm1hdCBhIHBhcnNlZCBvYmplY3QgaW50byBhIHVybCBzdHJpbmdcbmZ1bmN0aW9uIHVybEZvcm1hdChvYmopIHtcbiAgLy8gZW5zdXJlIGl0J3MgYW4gb2JqZWN0LCBhbmQgbm90IGEgc3RyaW5nIHVybC5cbiAgLy8gSWYgaXQncyBhbiBvYmosIHRoaXMgaXMgYSBuby1vcC5cbiAgLy8gdGhpcyB3YXksIHlvdSBjYW4gY2FsbCB1cmxfZm9ybWF0KCkgb24gc3RyaW5nc1xuICAvLyB0byBjbGVhbiB1cCBwb3RlbnRpYWxseSB3b25reSB1cmxzLlxuICBpZiAodXRpbC5pc1N0cmluZyhvYmopKSBvYmogPSB1cmxQYXJzZShvYmopO1xuICBpZiAoIShvYmogaW5zdGFuY2VvZiBVcmwpKSByZXR1cm4gVXJsLnByb3RvdHlwZS5mb3JtYXQuY2FsbChvYmopO1xuICByZXR1cm4gb2JqLmZvcm1hdCgpO1xufVxuXG5VcmwucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYXV0aCA9IHRoaXMuYXV0aCB8fCAnJztcbiAgaWYgKGF1dGgpIHtcbiAgICBhdXRoID0gZW5jb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIGF1dGggPSBhdXRoLnJlcGxhY2UoLyUzQS9pLCAnOicpO1xuICAgIGF1dGggKz0gJ0AnO1xuICB9XG5cbiAgdmFyIHByb3RvY29sID0gdGhpcy5wcm90b2NvbCB8fCAnJyxcbiAgICAgIHBhdGhuYW1lID0gdGhpcy5wYXRobmFtZSB8fCAnJyxcbiAgICAgIGhhc2ggPSB0aGlzLmhhc2ggfHwgJycsXG4gICAgICBob3N0ID0gZmFsc2UsXG4gICAgICBxdWVyeSA9ICcnO1xuXG4gIGlmICh0aGlzLmhvc3QpIHtcbiAgICBob3N0ID0gYXV0aCArIHRoaXMuaG9zdDtcbiAgfSBlbHNlIGlmICh0aGlzLmhvc3RuYW1lKSB7XG4gICAgaG9zdCA9IGF1dGggKyAodGhpcy5ob3N0bmFtZS5pbmRleE9mKCc6JykgPT09IC0xID9cbiAgICAgICAgdGhpcy5ob3N0bmFtZSA6XG4gICAgICAgICdbJyArIHRoaXMuaG9zdG5hbWUgKyAnXScpO1xuICAgIGlmICh0aGlzLnBvcnQpIHtcbiAgICAgIGhvc3QgKz0gJzonICsgdGhpcy5wb3J0O1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLnF1ZXJ5ICYmXG4gICAgICB1dGlsLmlzT2JqZWN0KHRoaXMucXVlcnkpICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnF1ZXJ5KS5sZW5ndGgpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeSh0aGlzLnF1ZXJ5KTtcbiAgfVxuXG4gIHZhciBzZWFyY2ggPSB0aGlzLnNlYXJjaCB8fCAocXVlcnkgJiYgKCc/JyArIHF1ZXJ5KSkgfHwgJyc7XG5cbiAgaWYgKHByb3RvY29sICYmIHByb3RvY29sLnN1YnN0cigtMSkgIT09ICc6JykgcHJvdG9jb2wgKz0gJzonO1xuXG4gIC8vIG9ubHkgdGhlIHNsYXNoZWRQcm90b2NvbHMgZ2V0IHRoZSAvLy4gIE5vdCBtYWlsdG86LCB4bXBwOiwgZXRjLlxuICAvLyB1bmxlc3MgdGhleSBoYWQgdGhlbSB0byBiZWdpbiB3aXRoLlxuICBpZiAodGhpcy5zbGFzaGVzIHx8XG4gICAgICAoIXByb3RvY29sIHx8IHNsYXNoZWRQcm90b2NvbFtwcm90b2NvbF0pICYmIGhvc3QgIT09IGZhbHNlKSB7XG4gICAgaG9zdCA9ICcvLycgKyAoaG9zdCB8fCAnJyk7XG4gICAgaWYgKHBhdGhuYW1lICYmIHBhdGhuYW1lLmNoYXJBdCgwKSAhPT0gJy8nKSBwYXRobmFtZSA9ICcvJyArIHBhdGhuYW1lO1xuICB9IGVsc2UgaWYgKCFob3N0KSB7XG4gICAgaG9zdCA9ICcnO1xuICB9XG5cbiAgaWYgKGhhc2ggJiYgaGFzaC5jaGFyQXQoMCkgIT09ICcjJykgaGFzaCA9ICcjJyArIGhhc2g7XG4gIGlmIChzZWFyY2ggJiYgc2VhcmNoLmNoYXJBdCgwKSAhPT0gJz8nKSBzZWFyY2ggPSAnPycgKyBzZWFyY2g7XG5cbiAgcGF0aG5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKC9bPyNdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChtYXRjaCk7XG4gIH0pO1xuICBzZWFyY2ggPSBzZWFyY2gucmVwbGFjZSgnIycsICclMjMnKTtcblxuICByZXR1cm4gcHJvdG9jb2wgKyBob3N0ICsgcGF0aG5hbWUgKyBzZWFyY2ggKyBoYXNoO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZShzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlKHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgcmV0dXJuIHRoaXMucmVzb2x2ZU9iamVjdCh1cmxQYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpKS5mb3JtYXQoKTtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmVPYmplY3Qoc291cmNlLCByZWxhdGl2ZSkge1xuICBpZiAoIXNvdXJjZSkgcmV0dXJuIHJlbGF0aXZlO1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZU9iamVjdChyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZU9iamVjdCA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHJlbGF0aXZlKSkge1xuICAgIHZhciByZWwgPSBuZXcgVXJsKCk7XG4gICAgcmVsLnBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgcmVsYXRpdmUgPSByZWw7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gbmV3IFVybCgpO1xuICB2YXIgdGtleXMgPSBPYmplY3Qua2V5cyh0aGlzKTtcbiAgZm9yICh2YXIgdGsgPSAwOyB0ayA8IHRrZXlzLmxlbmd0aDsgdGsrKykge1xuICAgIHZhciB0a2V5ID0gdGtleXNbdGtdO1xuICAgIHJlc3VsdFt0a2V5XSA9IHRoaXNbdGtleV07XG4gIH1cblxuICAvLyBoYXNoIGlzIGFsd2F5cyBvdmVycmlkZGVuLCBubyBtYXR0ZXIgd2hhdC5cbiAgLy8gZXZlbiBocmVmPVwiXCIgd2lsbCByZW1vdmUgaXQuXG4gIHJlc3VsdC5oYXNoID0gcmVsYXRpdmUuaGFzaDtcblxuICAvLyBpZiB0aGUgcmVsYXRpdmUgdXJsIGlzIGVtcHR5LCB0aGVuIHRoZXJlJ3Mgbm90aGluZyBsZWZ0IHRvIGRvIGhlcmUuXG4gIGlmIChyZWxhdGl2ZS5ocmVmID09PSAnJykge1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBocmVmcyBsaWtlIC8vZm9vL2JhciBhbHdheXMgY3V0IHRvIHRoZSBwcm90b2NvbC5cbiAgaWYgKHJlbGF0aXZlLnNsYXNoZXMgJiYgIXJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgLy8gdGFrZSBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgcHJvdG9jb2wgZnJvbSByZWxhdGl2ZVxuICAgIHZhciBya2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICBmb3IgKHZhciByayA9IDA7IHJrIDwgcmtleXMubGVuZ3RoOyByaysrKSB7XG4gICAgICB2YXIgcmtleSA9IHJrZXlzW3JrXTtcbiAgICAgIGlmIChya2V5ICE9PSAncHJvdG9jb2wnKVxuICAgICAgICByZXN1bHRbcmtleV0gPSByZWxhdGl2ZVtya2V5XTtcbiAgICB9XG5cbiAgICAvL3VybFBhcnNlIGFwcGVuZHMgdHJhaWxpbmcgLyB0byB1cmxzIGxpa2UgaHR0cDovL3d3dy5leGFtcGxlLmNvbVxuICAgIGlmIChzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXSAmJlxuICAgICAgICByZXN1bHQuaG9zdG5hbWUgJiYgIXJlc3VsdC5wYXRobmFtZSkge1xuICAgICAgcmVzdWx0LnBhdGggPSByZXN1bHQucGF0aG5hbWUgPSAnLyc7XG4gICAgfVxuXG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmIChyZWxhdGl2ZS5wcm90b2NvbCAmJiByZWxhdGl2ZS5wcm90b2NvbCAhPT0gcmVzdWx0LnByb3RvY29sKSB7XG4gICAgLy8gaWYgaXQncyBhIGtub3duIHVybCBwcm90b2NvbCwgdGhlbiBjaGFuZ2luZ1xuICAgIC8vIHRoZSBwcm90b2NvbCBkb2VzIHdlaXJkIHRoaW5nc1xuICAgIC8vIGZpcnN0LCBpZiBpdCdzIG5vdCBmaWxlOiwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBob3N0LFxuICAgIC8vIGFuZCBpZiB0aGVyZSB3YXMgYSBwYXRoXG4gICAgLy8gdG8gYmVnaW4gd2l0aCwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBwYXRoLlxuICAgIC8vIGlmIGl0IGlzIGZpbGU6LCB0aGVuIHRoZSBob3N0IGlzIGRyb3BwZWQsXG4gICAgLy8gYmVjYXVzZSB0aGF0J3Mga25vd24gdG8gYmUgaG9zdGxlc3MuXG4gICAgLy8gYW55dGhpbmcgZWxzZSBpcyBhc3N1bWVkIHRvIGJlIGFic29sdXRlLlxuICAgIGlmICghc2xhc2hlZFByb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IGtleXMubGVuZ3RoOyB2KyspIHtcbiAgICAgICAgdmFyIGsgPSBrZXlzW3ZdO1xuICAgICAgICByZXN1bHRba10gPSByZWxhdGl2ZVtrXTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXN1bHQucHJvdG9jb2wgPSByZWxhdGl2ZS5wcm90b2NvbDtcbiAgICBpZiAoIXJlbGF0aXZlLmhvc3QgJiYgIWhvc3RsZXNzUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIgcmVsUGF0aCA9IChyZWxhdGl2ZS5wYXRobmFtZSB8fCAnJykuc3BsaXQoJy8nKTtcbiAgICAgIHdoaWxlIChyZWxQYXRoLmxlbmd0aCAmJiAhKHJlbGF0aXZlLmhvc3QgPSByZWxQYXRoLnNoaWZ0KCkpKTtcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdCkgcmVsYXRpdmUuaG9zdCA9ICcnO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0bmFtZSkgcmVsYXRpdmUuaG9zdG5hbWUgPSAnJztcbiAgICAgIGlmIChyZWxQYXRoWzBdICE9PSAnJykgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIGlmIChyZWxQYXRoLmxlbmd0aCA8IDIpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxQYXRoLmpvaW4oJy8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsYXRpdmUucGF0aG5hbWU7XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgcmVzdWx0Lmhvc3QgPSByZWxhdGl2ZS5ob3N0IHx8ICcnO1xuICAgIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0O1xuICAgIHJlc3VsdC5wb3J0ID0gcmVsYXRpdmUucG9ydDtcbiAgICAvLyB0byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQucGF0aG5hbWUgfHwgcmVzdWx0LnNlYXJjaCkge1xuICAgICAgdmFyIHAgPSByZXN1bHQucGF0aG5hbWUgfHwgJyc7XG4gICAgICB2YXIgcyA9IHJlc3VsdC5zZWFyY2ggfHwgJyc7XG4gICAgICByZXN1bHQucGF0aCA9IHAgKyBzO1xuICAgIH1cbiAgICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZhciBpc1NvdXJjZUFicyA9IChyZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSxcbiAgICAgIGlzUmVsQWJzID0gKFxuICAgICAgICAgIHJlbGF0aXZlLmhvc3QgfHxcbiAgICAgICAgICByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJ1xuICAgICAgKSxcbiAgICAgIG11c3RFbmRBYnMgPSAoaXNSZWxBYnMgfHwgaXNTb3VyY2VBYnMgfHxcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5ob3N0ICYmIHJlbGF0aXZlLnBhdGhuYW1lKSksXG4gICAgICByZW1vdmVBbGxEb3RzID0gbXVzdEVuZEFicyxcbiAgICAgIHNyY1BhdGggPSByZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICByZWxQYXRoID0gcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHBzeWNob3RpYyA9IHJlc3VsdC5wcm90b2NvbCAmJiAhc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF07XG5cbiAgLy8gaWYgdGhlIHVybCBpcyBhIG5vbi1zbGFzaGVkIHVybCwgdGhlbiByZWxhdGl2ZVxuICAvLyBsaW5rcyBsaWtlIC4uLy4uIHNob3VsZCBiZSBhYmxlXG4gIC8vIHRvIGNyYXdsIHVwIHRvIHRoZSBob3N0bmFtZSwgYXMgd2VsbC4gIFRoaXMgaXMgc3RyYW5nZS5cbiAgLy8gcmVzdWx0LnByb3RvY29sIGhhcyBhbHJlYWR5IGJlZW4gc2V0IGJ5IG5vdy5cbiAgLy8gTGF0ZXIgb24sIHB1dCB0aGUgZmlyc3QgcGF0aCBwYXJ0IGludG8gdGhlIGhvc3QgZmllbGQuXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAnJztcbiAgICByZXN1bHQucG9ydCA9IG51bGw7XG4gICAgaWYgKHJlc3VsdC5ob3N0KSB7XG4gICAgICBpZiAoc3JjUGF0aFswXSA9PT0gJycpIHNyY1BhdGhbMF0gPSByZXN1bHQuaG9zdDtcbiAgICAgIGVsc2Ugc3JjUGF0aC51bnNoaWZ0KHJlc3VsdC5ob3N0KTtcbiAgICB9XG4gICAgcmVzdWx0Lmhvc3QgPSAnJztcbiAgICBpZiAocmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAgIHJlbGF0aXZlLmhvc3RuYW1lID0gbnVsbDtcbiAgICAgIHJlbGF0aXZlLnBvcnQgPSBudWxsO1xuICAgICAgaWYgKHJlbGF0aXZlLmhvc3QpIHtcbiAgICAgICAgaWYgKHJlbFBhdGhbMF0gPT09ICcnKSByZWxQYXRoWzBdID0gcmVsYXRpdmUuaG9zdDtcbiAgICAgICAgZWxzZSByZWxQYXRoLnVuc2hpZnQocmVsYXRpdmUuaG9zdCk7XG4gICAgICB9XG4gICAgICByZWxhdGl2ZS5ob3N0ID0gbnVsbDtcbiAgICB9XG4gICAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgJiYgKHJlbFBhdGhbMF0gPT09ICcnIHx8IHNyY1BhdGhbMF0gPT09ICcnKTtcbiAgfVxuXG4gIGlmIChpc1JlbEFicykge1xuICAgIC8vIGl0J3MgYWJzb2x1dGUuXG4gICAgcmVzdWx0Lmhvc3QgPSAocmVsYXRpdmUuaG9zdCB8fCByZWxhdGl2ZS5ob3N0ID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdCA6IHJlc3VsdC5ob3N0O1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IChyZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0bmFtZSA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0bmFtZSA6IHJlc3VsdC5ob3N0bmFtZTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHNyY1BhdGggPSByZWxQYXRoO1xuICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgZG90LWhhbmRsaW5nIGJlbG93LlxuICB9IGVsc2UgaWYgKHJlbFBhdGgubGVuZ3RoKSB7XG4gICAgLy8gaXQncyByZWxhdGl2ZVxuICAgIC8vIHRocm93IGF3YXkgdGhlIGV4aXN0aW5nIGZpbGUsIGFuZCB0YWtlIHRoZSBuZXcgcGF0aCBpbnN0ZWFkLlxuICAgIGlmICghc3JjUGF0aCkgc3JjUGF0aCA9IFtdO1xuICAgIHNyY1BhdGgucG9wKCk7XG4gICAgc3JjUGF0aCA9IHNyY1BhdGguY29uY2F0KHJlbFBhdGgpO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNOdWxsT3JVbmRlZmluZWQocmVsYXRpdmUuc2VhcmNoKSkge1xuICAgIC8vIGp1c3QgcHVsbCBvdXQgdGhlIHNlYXJjaC5cbiAgICAvLyBsaWtlIGhyZWY9Jz9mb28nLlxuICAgIC8vIFB1dCB0aGlzIGFmdGVyIHRoZSBvdGhlciB0d28gY2FzZXMgYmVjYXVzZSBpdCBzaW1wbGlmaWVzIHRoZSBib29sZWFuc1xuICAgIGlmIChwc3ljaG90aWMpIHtcbiAgICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gc3JjUGF0aC5zaGlmdCgpO1xuICAgICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgLy8gbm8gcGF0aCBhdCBhbGwuICBlYXN5LlxuICAgIC8vIHdlJ3ZlIGFscmVhZHkgaGFuZGxlZCB0aGUgb3RoZXIgc3R1ZmYgYWJvdmUuXG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gJy8nICsgcmVzdWx0LnNlYXJjaDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaWYgYSB1cmwgRU5EcyBpbiAuIG9yIC4uLCB0aGVuIGl0IG11c3QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIC8vIGhvd2V2ZXIsIGlmIGl0IGVuZHMgaW4gYW55dGhpbmcgZWxzZSBub24tc2xhc2h5LFxuICAvLyB0aGVuIGl0IG11c3QgTk9UIGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICB2YXIgbGFzdCA9IHNyY1BhdGguc2xpY2UoLTEpWzBdO1xuICB2YXIgaGFzVHJhaWxpbmdTbGFzaCA9IChcbiAgICAgIChyZXN1bHQuaG9zdCB8fCByZWxhdGl2ZS5ob3N0IHx8IHNyY1BhdGgubGVuZ3RoID4gMSkgJiZcbiAgICAgIChsYXN0ID09PSAnLicgfHwgbGFzdCA9PT0gJy4uJykgfHwgbGFzdCA9PT0gJycpO1xuXG4gIC8vIHN0cmlwIHNpbmdsZSBkb3RzLCByZXNvbHZlIGRvdWJsZSBkb3RzIHRvIHBhcmVudCBkaXJcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHNyY1BhdGgubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgIGxhc3QgPSBzcmNQYXRoW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmICghbXVzdEVuZEFicyAmJiAhcmVtb3ZlQWxsRG90cykge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgc3JjUGF0aC51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtdXN0RW5kQWJzICYmIHNyY1BhdGhbMF0gIT09ICcnICYmXG4gICAgICAoIXNyY1BhdGhbMF0gfHwgc3JjUGF0aFswXS5jaGFyQXQoMCkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKGhhc1RyYWlsaW5nU2xhc2ggJiYgKHNyY1BhdGguam9pbignLycpLnN1YnN0cigtMSkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnB1c2goJycpO1xuICB9XG5cbiAgdmFyIGlzQWJzb2x1dGUgPSBzcmNQYXRoWzBdID09PSAnJyB8fFxuICAgICAgKHNyY1BhdGhbMF0gJiYgc3JjUGF0aFswXS5jaGFyQXQoMCkgPT09ICcvJyk7XG5cbiAgLy8gcHV0IHRoZSBob3N0IGJhY2tcbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gaXNBYnNvbHV0ZSA/ICcnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyY1BhdGgubGVuZ3RoID8gc3JjUGF0aC5zaGlmdCgpIDogJyc7XG4gICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyB8fCAocmVzdWx0Lmhvc3QgJiYgc3JjUGF0aC5sZW5ndGgpO1xuXG4gIGlmIChtdXN0RW5kQWJzICYmICFpc0Fic29sdXRlKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBzcmNQYXRoLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCByZXF1ZXN0Lmh0dHBcbiAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gIH1cbiAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoIHx8IHJlc3VsdC5hdXRoO1xuICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXJsLnByb3RvdHlwZS5wYXJzZUhvc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhvc3QgPSB0aGlzLmhvc3Q7XG4gIHZhciBwb3J0ID0gcG9ydFBhdHRlcm4uZXhlYyhob3N0KTtcbiAgaWYgKHBvcnQpIHtcbiAgICBwb3J0ID0gcG9ydFswXTtcbiAgICBpZiAocG9ydCAhPT0gJzonKSB7XG4gICAgICB0aGlzLnBvcnQgPSBwb3J0LnN1YnN0cigxKTtcbiAgICB9XG4gICAgaG9zdCA9IGhvc3Quc3Vic3RyKDAsIGhvc3QubGVuZ3RoIC0gcG9ydC5sZW5ndGgpO1xuICB9XG4gIGlmIChob3N0KSB0aGlzLmhvc3RuYW1lID0gaG9zdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc1N0cmluZzogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnc3RyaW5nJztcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xuICB9LFxuICBpc051bGw6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbE9yVW5kZWZpbmVkOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09IG51bGw7XG4gIH1cbn07XG4iLCJ2YXIgdjEgPSByZXF1aXJlKCcuL3YxJyk7XG52YXIgdjQgPSByZXF1aXJlKCcuL3Y0Jyk7XG5cbnZhciB1dWlkID0gdjQ7XG51dWlkLnYxID0gdjE7XG51dWlkLnY0ID0gdjQ7XG5cbm1vZHVsZS5leHBvcnRzID0gdXVpZDtcbiIsIi8qKlxuICogQ29udmVydCBhcnJheSBvZiAxNiBieXRlIHZhbHVlcyB0byBVVUlEIHN0cmluZyBmb3JtYXQgb2YgdGhlIGZvcm06XG4gKiBYWFhYWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFhcbiAqL1xudmFyIGJ5dGVUb0hleCA9IFtdO1xuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBieXRlc1RvVXVpZChidWYsIG9mZnNldCkge1xuICB2YXIgaSA9IG9mZnNldCB8fCAwO1xuICB2YXIgYnRoID0gYnl0ZVRvSGV4O1xuICByZXR1cm4gYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJ5dGVzVG9VdWlkO1xuIiwiLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gIEluIHRoZVxuLy8gYnJvd3NlciB0aGlzIGlzIGEgbGl0dGxlIGNvbXBsaWNhdGVkIGR1ZSB0byB1bmtub3duIHF1YWxpdHkgb2YgTWF0aC5yYW5kb20oKVxuLy8gYW5kIGluY29uc2lzdGVudCBzdXBwb3J0IGZvciB0aGUgYGNyeXB0b2AgQVBJLiAgV2UgZG8gdGhlIGJlc3Qgd2UgY2FuIHZpYVxuLy8gZmVhdHVyZS1kZXRlY3Rpb25cbnZhciBybmc7XG5cbnZhciBjcnlwdG8gPSBnbG9iYWwuY3J5cHRvIHx8IGdsb2JhbC5tc0NyeXB0bzsgLy8gZm9yIElFIDExXG5pZiAoY3J5cHRvICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgLy8gV0hBVFdHIGNyeXB0byBSTkcgLSBodHRwOi8vd2lraS53aGF0d2cub3JnL3dpa2kvQ3J5cHRvXG4gIHZhciBybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuICBybmcgPSBmdW5jdGlvbiB3aGF0d2dSTkcoKSB7XG4gICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhybmRzOCk7XG4gICAgcmV0dXJuIHJuZHM4O1xuICB9O1xufVxuXG5pZiAoIXJuZykge1xuICAvLyBNYXRoLnJhbmRvbSgpLWJhc2VkIChSTkcpXG4gIC8vXG4gIC8vIElmIGFsbCBlbHNlIGZhaWxzLCB1c2UgTWF0aC5yYW5kb20oKS4gIEl0J3MgZmFzdCwgYnV0IGlzIG9mIHVuc3BlY2lmaWVkXG4gIC8vIHF1YWxpdHkuXG4gIHZhciBybmRzID0gbmV3IEFycmF5KDE2KTtcbiAgcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIHI7IGkgPCAxNjsgaSsrKSB7XG4gICAgICBpZiAoKGkgJiAweDAzKSA9PT0gMCkgciA9IE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMDtcbiAgICAgIHJuZHNbaV0gPSByID4+PiAoKGkgJiAweDAzKSA8PCAzKSAmIDB4ZmY7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJuZHM7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcm5nO1xuIiwidmFyIHJuZyA9IHJlcXVpcmUoJy4vbGliL3JuZycpO1xudmFyIGJ5dGVzVG9VdWlkID0gcmVxdWlyZSgnLi9saWIvYnl0ZXNUb1V1aWQnKTtcblxuLy8gKipgdjEoKWAgLSBHZW5lcmF0ZSB0aW1lLWJhc2VkIFVVSUQqKlxuLy9cbi8vIEluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9MaW9zSy9VVUlELmpzXG4vLyBhbmQgaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L3V1aWQuaHRtbFxuXG4vLyByYW5kb20gIydzIHdlIG5lZWQgdG8gaW5pdCBub2RlIGFuZCBjbG9ja3NlcVxudmFyIF9zZWVkQnl0ZXMgPSBybmcoKTtcblxuLy8gUGVyIDQuNSwgY3JlYXRlIGFuZCA0OC1iaXQgbm9kZSBpZCwgKDQ3IHJhbmRvbSBiaXRzICsgbXVsdGljYXN0IGJpdCA9IDEpXG52YXIgX25vZGVJZCA9IFtcbiAgX3NlZWRCeXRlc1swXSB8IDB4MDEsXG4gIF9zZWVkQnl0ZXNbMV0sIF9zZWVkQnl0ZXNbMl0sIF9zZWVkQnl0ZXNbM10sIF9zZWVkQnl0ZXNbNF0sIF9zZWVkQnl0ZXNbNV1cbl07XG5cbi8vIFBlciA0LjIuMiwgcmFuZG9taXplICgxNCBiaXQpIGNsb2Nrc2VxXG52YXIgX2Nsb2Nrc2VxID0gKF9zZWVkQnl0ZXNbNl0gPDwgOCB8IF9zZWVkQnl0ZXNbN10pICYgMHgzZmZmO1xuXG4vLyBQcmV2aW91cyB1dWlkIGNyZWF0aW9uIHRpbWVcbnZhciBfbGFzdE1TZWNzID0gMCwgX2xhc3ROU2VjcyA9IDA7XG5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcbmZ1bmN0aW9uIHYxKG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuICB2YXIgYiA9IGJ1ZiB8fCBbXTtcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB2YXIgY2xvY2tzZXEgPSBvcHRpb25zLmNsb2Nrc2VxICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmNsb2Nrc2VxIDogX2Nsb2Nrc2VxO1xuXG4gIC8vIFVVSUQgdGltZXN0YW1wcyBhcmUgMTAwIG5hbm8tc2Vjb25kIHVuaXRzIHNpbmNlIHRoZSBHcmVnb3JpYW4gZXBvY2gsXG4gIC8vICgxNTgyLTEwLTE1IDAwOjAwKS4gIEpTTnVtYmVycyBhcmVuJ3QgcHJlY2lzZSBlbm91Z2ggZm9yIHRoaXMsIHNvXG4gIC8vIHRpbWUgaXMgaGFuZGxlZCBpbnRlcm5hbGx5IGFzICdtc2VjcycgKGludGVnZXIgbWlsbGlzZWNvbmRzKSBhbmQgJ25zZWNzJ1xuICAvLyAoMTAwLW5hbm9zZWNvbmRzIG9mZnNldCBmcm9tIG1zZWNzKSBzaW5jZSB1bml4IGVwb2NoLCAxOTcwLTAxLTAxIDAwOjAwLlxuICB2YXIgbXNlY3MgPSBvcHRpb25zLm1zZWNzICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLm1zZWNzIDogbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgLy8gUGVyIDQuMi4xLjIsIHVzZSBjb3VudCBvZiB1dWlkJ3MgZ2VuZXJhdGVkIGR1cmluZyB0aGUgY3VycmVudCBjbG9ja1xuICAvLyBjeWNsZSB0byBzaW11bGF0ZSBoaWdoZXIgcmVzb2x1dGlvbiBjbG9ja1xuICB2YXIgbnNlY3MgPSBvcHRpb25zLm5zZWNzICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLm5zZWNzIDogX2xhc3ROU2VjcyArIDE7XG5cbiAgLy8gVGltZSBzaW5jZSBsYXN0IHV1aWQgY3JlYXRpb24gKGluIG1zZWNzKVxuICB2YXIgZHQgPSAobXNlY3MgLSBfbGFzdE1TZWNzKSArIChuc2VjcyAtIF9sYXN0TlNlY3MpLzEwMDAwO1xuXG4gIC8vIFBlciA0LjIuMS4yLCBCdW1wIGNsb2Nrc2VxIG9uIGNsb2NrIHJlZ3Jlc3Npb25cbiAgaWYgKGR0IDwgMCAmJiBvcHRpb25zLmNsb2Nrc2VxID09PSB1bmRlZmluZWQpIHtcbiAgICBjbG9ja3NlcSA9IGNsb2Nrc2VxICsgMSAmIDB4M2ZmZjtcbiAgfVxuXG4gIC8vIFJlc2V0IG5zZWNzIGlmIGNsb2NrIHJlZ3Jlc3NlcyAobmV3IGNsb2Nrc2VxKSBvciB3ZSd2ZSBtb3ZlZCBvbnRvIGEgbmV3XG4gIC8vIHRpbWUgaW50ZXJ2YWxcbiAgaWYgKChkdCA8IDAgfHwgbXNlY3MgPiBfbGFzdE1TZWNzKSAmJiBvcHRpb25zLm5zZWNzID09PSB1bmRlZmluZWQpIHtcbiAgICBuc2VjcyA9IDA7XG4gIH1cblxuICAvLyBQZXIgNC4yLjEuMiBUaHJvdyBlcnJvciBpZiB0b28gbWFueSB1dWlkcyBhcmUgcmVxdWVzdGVkXG4gIGlmIChuc2VjcyA+PSAxMDAwMCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXVpZC52MSgpOiBDYW5cXCd0IGNyZWF0ZSBtb3JlIHRoYW4gMTBNIHV1aWRzL3NlYycpO1xuICB9XG5cbiAgX2xhc3RNU2VjcyA9IG1zZWNzO1xuICBfbGFzdE5TZWNzID0gbnNlY3M7XG4gIF9jbG9ja3NlcSA9IGNsb2Nrc2VxO1xuXG4gIC8vIFBlciA0LjEuNCAtIENvbnZlcnQgZnJvbSB1bml4IGVwb2NoIHRvIEdyZWdvcmlhbiBlcG9jaFxuICBtc2VjcyArPSAxMjIxOTI5MjgwMDAwMDtcblxuICAvLyBgdGltZV9sb3dgXG4gIHZhciB0bCA9ICgobXNlY3MgJiAweGZmZmZmZmYpICogMTAwMDAgKyBuc2VjcykgJSAweDEwMDAwMDAwMDtcbiAgYltpKytdID0gdGwgPj4+IDI0ICYgMHhmZjtcbiAgYltpKytdID0gdGwgPj4+IDE2ICYgMHhmZjtcbiAgYltpKytdID0gdGwgPj4+IDggJiAweGZmO1xuICBiW2krK10gPSB0bCAmIDB4ZmY7XG5cbiAgLy8gYHRpbWVfbWlkYFxuICB2YXIgdG1oID0gKG1zZWNzIC8gMHgxMDAwMDAwMDAgKiAxMDAwMCkgJiAweGZmZmZmZmY7XG4gIGJbaSsrXSA9IHRtaCA+Pj4gOCAmIDB4ZmY7XG4gIGJbaSsrXSA9IHRtaCAmIDB4ZmY7XG5cbiAgLy8gYHRpbWVfaGlnaF9hbmRfdmVyc2lvbmBcbiAgYltpKytdID0gdG1oID4+PiAyNCAmIDB4ZiB8IDB4MTA7IC8vIGluY2x1ZGUgdmVyc2lvblxuICBiW2krK10gPSB0bWggPj4+IDE2ICYgMHhmZjtcblxuICAvLyBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGAgKFBlciA0LjIuMiAtIGluY2x1ZGUgdmFyaWFudClcbiAgYltpKytdID0gY2xvY2tzZXEgPj4+IDggfCAweDgwO1xuXG4gIC8vIGBjbG9ja19zZXFfbG93YFxuICBiW2krK10gPSBjbG9ja3NlcSAmIDB4ZmY7XG5cbiAgLy8gYG5vZGVgXG4gIHZhciBub2RlID0gb3B0aW9ucy5ub2RlIHx8IF9ub2RlSWQ7XG4gIGZvciAodmFyIG4gPSAwOyBuIDwgNjsgKytuKSB7XG4gICAgYltpICsgbl0gPSBub2RlW25dO1xuICB9XG5cbiAgcmV0dXJuIGJ1ZiA/IGJ1ZiA6IGJ5dGVzVG9VdWlkKGIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHYxO1xuIiwidmFyIHJuZyA9IHJlcXVpcmUoJy4vbGliL3JuZycpO1xudmFyIGJ5dGVzVG9VdWlkID0gcmVxdWlyZSgnLi9saWIvYnl0ZXNUb1V1aWQnKTtcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgaWYgKHR5cGVvZihvcHRpb25zKSA9PSAnc3RyaW5nJykge1xuICAgIGJ1ZiA9IG9wdGlvbnMgPT0gJ2JpbmFyeScgPyBuZXcgQXJyYXkoMTYpIDogbnVsbDtcbiAgICBvcHRpb25zID0gbnVsbDtcbiAgfVxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBybmcpKCk7XG5cbiAgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuICBybmRzWzZdID0gKHJuZHNbNl0gJiAweDBmKSB8IDB4NDA7XG4gIHJuZHNbOF0gPSAocm5kc1s4XSAmIDB4M2YpIHwgMHg4MDtcblxuICAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcbiAgaWYgKGJ1Zikge1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCAxNjsgKytpaSkge1xuICAgICAgYnVmW2kgKyBpaV0gPSBybmRzW2lpXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmIHx8IGJ5dGVzVG9VdWlkKHJuZHMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHY0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBDb3B5cmlnaHQgMjAxOCBUaGUgT3V0bGluZSBBdXRob3JzXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbnZhciBfX3JlYWQgPSAodGhpcyAmJiB0aGlzLl9fcmVhZCkgfHwgZnVuY3Rpb24gKG8sIG4pIHtcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XG4gICAgaWYgKCFtKSByZXR1cm4gbztcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcbiAgICB0cnkge1xuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cbiAgICB9XG4gICAgcmV0dXJuIGFyO1xufTtcbnZhciBfX3NwcmVhZCA9ICh0aGlzICYmIHRoaXMuX19zcHJlYWQpIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xuICAgIHJldHVybiBhcjtcbn07XG52YXIgX192YWx1ZXMgPSAodGhpcyAmJiB0aGlzLl9fdmFsdWVzKSB8fCBmdW5jdGlvbiAobykge1xuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXSwgaSA9IDA7XG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHNoYWRvd3NvY2tzX2NvbmZpZ18xID0gcmVxdWlyZShcIlNoYWRvd3NvY2tzQ29uZmlnL3NoYWRvd3NvY2tzX2NvbmZpZ1wiKTtcbnZhciBlcnJvcnMgPSByZXF1aXJlKFwiLi4vbW9kZWwvZXJyb3JzXCIpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoXCIuLi9tb2RlbC9ldmVudHNcIik7XG52YXIgc2V0dGluZ3NfMSA9IHJlcXVpcmUoXCIuL3NldHRpbmdzXCIpO1xuLy8gSWYgcyBpcyBhIFVSTCB3aG9zZSBmcmFnbWVudCBjb250YWlucyBhIFNoYWRvd3NvY2tzIFVSTCB0aGVuIHJldHVybiB0aGF0IFNoYWRvd3NvY2tzIFVSTCxcbi8vIG90aGVyd2lzZSByZXR1cm4gcy5cbmZ1bmN0aW9uIHVud3JhcEludml0ZShzKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIHVybCA9IG5ldyBVUkwocyk7XG4gICAgICAgIGlmICh1cmwuaGFzaCkge1xuICAgICAgICAgICAgdmFyIGRlY29kZWRGcmFnbWVudCA9IGRlY29kZVVSSUNvbXBvbmVudCh1cmwuaGFzaCk7XG4gICAgICAgICAgICAvLyBTZWFyY2ggaW4gdGhlIGZyYWdtZW50IGZvciBzczovLyBmb3IgdHdvIHJlYXNvbnM6XG4gICAgICAgICAgICAvLyAgLSBVUkwuaGFzaCBpbmNsdWRlcyB0aGUgbGVhZGluZyAjICh3aGF0KS5cbiAgICAgICAgICAgIC8vICAtIFdoZW4gYSB1c2VyIG9wZW5zIGludml0ZS5odG1sI0VOQ09ERURTU1VSTCBpbiB0aGVpciBicm93c2VyLCB0aGUgd2Vic2l0ZSAoY3VycmVudGx5KVxuICAgICAgICAgICAgLy8gICAgcmVkaXJlY3RzIHRvIGludml0ZS5odG1sIy9lbi9pbnZpdGUvRU5DT0RFRFNTVVJMLiBTaW5jZSBjb3B5aW5nIHRoYXQgcmVkaXJlY3RlZCBVUkxcbiAgICAgICAgICAgIC8vICAgIHNlZW1zIGxpa2UgYSByZWFzb25hYmxlIHRoaW5nIHRvIGRvLCBsZXQncyBzdXBwb3J0IHRob3NlIFVSTHMgdG9vLlxuICAgICAgICAgICAgdmFyIHBvc3NpYmxlU2hhZG93c29ja3NVcmwgPSBkZWNvZGVkRnJhZ21lbnQuc3Vic3RyaW5nKGRlY29kZWRGcmFnbWVudC5pbmRleE9mKCdzczovLycpKTtcbiAgICAgICAgICAgIGlmIChuZXcgVVJMKHBvc3NpYmxlU2hhZG93c29ja3NVcmwpLnByb3RvY29sID09PSAnc3M6Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiBwb3NzaWJsZVNoYWRvd3NvY2tzVXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIC8vIFNvbWV0aGluZyB3YXNuJ3QgYSBVUkwsIG9yIGl0IGNvdWxkbid0IGJlIGRlY29kZWQgLSBubyBwcm9ibGVtLCBwZW9wbGUgcHV0IGFsbCBraW5kcyBvZlxuICAgICAgICAvLyBjcmF6eSB0aGluZ3MgaW4gdGhlIGNsaXBib2FyZC5cbiAgICB9XG4gICAgcmV0dXJuIHM7XG59XG5leHBvcnRzLnVud3JhcEludml0ZSA9IHVud3JhcEludml0ZTtcbnZhciBBcHAgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXBwKGV2ZW50UXVldWUsIHNlcnZlclJlcG8sIHJvb3RFbCwgZGVidWdNb2RlLCB1cmxJbnRlcmNlcHRvciwgY2xpcGJvYXJkLCBlcnJvclJlcG9ydGVyLCBzZXR0aW5ncywgZW52aXJvbm1lbnRWYXJzLCB1cGRhdGVyLCBxdWl0QXBwbGljYXRpb24sIGRvY3VtZW50KSB7XG4gICAgICAgIGlmIChkb2N1bWVudCA9PT0gdm9pZCAwKSB7IGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50OyB9XG4gICAgICAgIHRoaXMuZXZlbnRRdWV1ZSA9IGV2ZW50UXVldWU7XG4gICAgICAgIHRoaXMuc2VydmVyUmVwbyA9IHNlcnZlclJlcG87XG4gICAgICAgIHRoaXMucm9vdEVsID0gcm9vdEVsO1xuICAgICAgICB0aGlzLmRlYnVnTW9kZSA9IGRlYnVnTW9kZTtcbiAgICAgICAgdGhpcy5jbGlwYm9hcmQgPSBjbGlwYm9hcmQ7XG4gICAgICAgIHRoaXMuZXJyb3JSZXBvcnRlciA9IGVycm9yUmVwb3J0ZXI7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICAgICAgdGhpcy5lbnZpcm9ubWVudFZhcnMgPSBlbnZpcm9ubWVudFZhcnM7XG4gICAgICAgIHRoaXMudXBkYXRlciA9IHVwZGF0ZXI7XG4gICAgICAgIHRoaXMucXVpdEFwcGxpY2F0aW9uID0gcXVpdEFwcGxpY2F0aW9uO1xuICAgICAgICB0aGlzLmlnbm9yZWRBY2Nlc3NLZXlzID0ge307XG4gICAgICAgIHRoaXMuc2VydmVyTGlzdEVsID0gcm9vdEVsLiQuc2VydmVyc1ZpZXcuJC5zZXJ2ZXJMaXN0O1xuICAgICAgICB0aGlzLmZlZWRiYWNrVmlld0VsID0gcm9vdEVsLiQuZmVlZGJhY2tWaWV3O1xuICAgICAgICB0aGlzLnN5bmNTZXJ2ZXJzVG9VSSgpO1xuICAgICAgICB0aGlzLnN5bmNDb25uZWN0aXZpdHlTdGF0ZVRvU2VydmVyQ2FyZHMoKTtcbiAgICAgICAgcm9vdEVsLiQuYWJvdXRWaWV3LnZlcnNpb24gPSBlbnZpcm9ubWVudFZhcnMuQVBQX1ZFUlNJT047XG4gICAgICAgIHRoaXMubG9jYWxpemUgPSB0aGlzLnJvb3RFbC5sb2NhbGl6ZS5iaW5kKHRoaXMucm9vdEVsKTtcbiAgICAgICAgaWYgKHVybEludGVyY2VwdG9yKSB7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyVXJsSW50ZXJjZXB0aW9uTGlzdGVuZXIodXJsSW50ZXJjZXB0b3IpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdubyB1cmxJbnRlcmNlcHRvciwgc3M6Ly8gdXJscyB3aWxsIG5vdCBiZSBpbnRlcmNlcHRlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xpcGJvYXJkLnNldExpc3RlbmVyKHRoaXMuaGFuZGxlQ2xpcGJvYXJkVGV4dC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy51cGRhdGVyLnNldExpc3RlbmVyKHRoaXMudXBkYXRlRG93bmxvYWRlZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy8gUmVnaXN0ZXIgQ29yZG92YSBtb2JpbGUgZm9yZWdyb3VuZCBldmVudCB0byBzeW5jIHNlcnZlciBjb25uZWN0aXZpdHkuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc3VtZScsIHRoaXMuc3luY0Nvbm5lY3Rpdml0eVN0YXRlVG9TZXJ2ZXJDYXJkcy5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy8gUmVnaXN0ZXIgaGFuZGxlcnMgZm9yIGV2ZW50cyBmaXJlZCBieSBQb2x5bWVyIGNvbXBvbmVudHMuXG4gICAgICAgIHRoaXMucm9vdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ1Byb21wdEFkZFNlcnZlclJlcXVlc3RlZCcsIHRoaXMucmVxdWVzdFByb21wdEFkZFNlcnZlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5yb290RWwuYWRkRXZlbnRMaXN0ZW5lcignQWRkU2VydmVyQ29uZmlybWF0aW9uUmVxdWVzdGVkJywgdGhpcy5yZXF1ZXN0QWRkU2VydmVyQ29uZmlybWF0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnJvb3RFbC5hZGRFdmVudExpc3RlbmVyKCdBZGRTZXJ2ZXJSZXF1ZXN0ZWQnLCB0aGlzLnJlcXVlc3RBZGRTZXJ2ZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMucm9vdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ0lnbm9yZVNlcnZlclJlcXVlc3RlZCcsIHRoaXMucmVxdWVzdElnbm9yZVNlcnZlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5yb290RWwuYWRkRXZlbnRMaXN0ZW5lcignQ29ubmVjdFByZXNzZWQnLCB0aGlzLmNvbm5lY3RTZXJ2ZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMucm9vdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ0Rpc2Nvbm5lY3RQcmVzc2VkJywgdGhpcy5kaXNjb25uZWN0U2VydmVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnJvb3RFbC5hZGRFdmVudExpc3RlbmVyKCdGb3JnZXRQcmVzc2VkJywgdGhpcy5mb3JnZXRTZXJ2ZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMucm9vdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ1JlbmFtZVJlcXVlc3RlZCcsIHRoaXMucmVuYW1lU2VydmVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnJvb3RFbC5hZGRFdmVudExpc3RlbmVyKCdRdWl0UHJlc3NlZCcsIHRoaXMucXVpdEFwcGxpY2F0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnJvb3RFbC5hZGRFdmVudExpc3RlbmVyKCdBdXRvQ29ubmVjdERpYWxvZ0Rpc21pc3NlZCcsIHRoaXMuYXV0b0Nvbm5lY3REaWFsb2dEaXNtaXNzZWQuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMucm9vdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ1Nob3dTZXJ2ZXJSZW5hbWUnLCB0aGlzLnJvb3RFbC5zaG93U2VydmVyUmVuYW1lLmJpbmQodGhpcy5yb290RWwpKTtcbiAgICAgICAgdGhpcy5mZWVkYmFja1ZpZXdFbC4kLnN1Ym1pdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCd0YXAnLCB0aGlzLnN1Ym1pdEZlZWRiYWNrLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnJvb3RFbC5hZGRFdmVudExpc3RlbmVyKCdQcml2YWN5VGVybXNBY2tlZCcsIHRoaXMuYWNrUHJpdmFjeVRlcm1zLmJpbmQodGhpcykpO1xuICAgICAgICAvLyBSZWdpc3RlciBoYW5kbGVycyBmb3IgZXZlbnRzIHB1Ymxpc2hlZCB0byBvdXIgZXZlbnQgcXVldWUuXG4gICAgICAgIHRoaXMuZXZlbnRRdWV1ZS5zdWJzY3JpYmUoZXZlbnRzLlNlcnZlckFkZGVkLCB0aGlzLnNob3dTZXJ2ZXJBZGRlZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5ldmVudFF1ZXVlLnN1YnNjcmliZShldmVudHMuU2VydmVyRm9yZ290dGVuLCB0aGlzLnNob3dTZXJ2ZXJGb3Jnb3R0ZW4uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuZXZlbnRRdWV1ZS5zdWJzY3JpYmUoZXZlbnRzLlNlcnZlclJlbmFtZWQsIHRoaXMuc2hvd1NlcnZlclJlbmFtZWQuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuZXZlbnRRdWV1ZS5zdWJzY3JpYmUoZXZlbnRzLlNlcnZlckZvcmdldFVuZG9uZSwgdGhpcy5zaG93U2VydmVyRm9yZ2V0VW5kb25lLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmV2ZW50UXVldWUuc3Vic2NyaWJlKGV2ZW50cy5TZXJ2ZXJDb25uZWN0ZWQsIHRoaXMuc2hvd1NlcnZlckNvbm5lY3RlZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5ldmVudFF1ZXVlLnN1YnNjcmliZShldmVudHMuU2VydmVyRGlzY29ubmVjdGVkLCB0aGlzLnNob3dTZXJ2ZXJEaXNjb25uZWN0ZWQuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuZXZlbnRRdWV1ZS5zdWJzY3JpYmUoZXZlbnRzLlNlcnZlclJlY29ubmVjdGluZywgdGhpcy5zaG93U2VydmVyUmVjb25uZWN0aW5nLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmV2ZW50UXVldWUuc3RhcnRQdWJsaXNoaW5nKCk7XG4gICAgICAgIGlmICghdGhpcy5hcmVQcml2YWN5VGVybXNBY2tlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlQcml2YWN5VmlldygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGlzcGxheVplcm9TdGF0ZVVpKCk7XG4gICAgICAgIHRoaXMucHVsbENsaXBib2FyZFRleHQoKTtcbiAgICB9XG4gICAgQXBwLnByb3RvdHlwZS5zaG93TG9jYWxpemVkRXJyb3IgPSBmdW5jdGlvbiAoZSwgdG9hc3REdXJhdGlvbikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAodG9hc3REdXJhdGlvbiA9PT0gdm9pZCAwKSB7IHRvYXN0RHVyYXRpb24gPSAxMDAwMDsgfVxuICAgICAgICB2YXIgbWVzc2FnZUtleTtcbiAgICAgICAgdmFyIG1lc3NhZ2VQYXJhbXM7XG4gICAgICAgIHZhciBidXR0b25LZXk7XG4gICAgICAgIHZhciBidXR0b25IYW5kbGVyO1xuICAgICAgICB2YXIgYnV0dG9uTGluaztcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBlcnJvcnMuVnBuUGVybWlzc2lvbk5vdEdyYW50ZWQpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VLZXkgPSAnb3V0bGluZS1wbHVnaW4tZXJyb3ItdnBuLXBlcm1pc3Npb24tbm90LWdyYW50ZWQnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBlcnJvcnMuSW52YWxpZFNlcnZlckNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICBtZXNzYWdlS2V5ID0gJ291dGxpbmUtcGx1Z2luLWVycm9yLWludmFsaWQtc2VydmVyLWNyZWRlbnRpYWxzJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlIGluc3RhbmNlb2YgZXJyb3JzLlJlbW90ZVVkcEZvcndhcmRpbmdEaXNhYmxlZCkge1xuICAgICAgICAgICAgbWVzc2FnZUtleSA9ICdvdXRsaW5lLXBsdWdpbi1lcnJvci11ZHAtZm9yd2FyZGluZy1ub3QtZW5hYmxlZCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5TZXJ2ZXJVbnJlYWNoYWJsZSkge1xuICAgICAgICAgICAgbWVzc2FnZUtleSA9ICdvdXRsaW5lLXBsdWdpbi1lcnJvci1zZXJ2ZXItdW5yZWFjaGFibGUnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBlcnJvcnMuRmVlZGJhY2tTdWJtaXNzaW9uRXJyb3IpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VLZXkgPSAnZXJyb3ItZmVlZGJhY2stc3VibWlzc2lvbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5TZXJ2ZXJVcmxJbnZhbGlkKSB7XG4gICAgICAgICAgICBtZXNzYWdlS2V5ID0gJ2Vycm9yLWludmFsaWQtYWNjZXNzLWtleSc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5TZXJ2ZXJJbmNvbXBhdGlibGUpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VLZXkgPSAnZXJyb3Itc2VydmVyLWluY29tcGF0aWJsZSc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5PcGVyYXRpb25UaW1lZE91dCkge1xuICAgICAgICAgICAgbWVzc2FnZUtleSA9ICdlcnJvci10aW1lb3V0JztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlIGluc3RhbmNlb2YgZXJyb3JzLlNoYWRvd3NvY2tzU3RhcnRGYWlsdXJlICYmIHRoaXMuaXNXaW5kb3dzKCkpIHtcbiAgICAgICAgICAgIC8vIEZhbGwgdGhyb3VnaCB0byBgZXJyb3ItdW5leHBlY3RlZGAgZm9yIG90aGVyIHBsYXRmb3Jtcy5cbiAgICAgICAgICAgIG1lc3NhZ2VLZXkgPSAnb3V0bGluZS1wbHVnaW4tZXJyb3ItYW50aXZpcnVzJztcbiAgICAgICAgICAgIGJ1dHRvbktleSA9ICdmaXgtdGhpcyc7XG4gICAgICAgICAgICBidXR0b25MaW5rID0gJ2h0dHBzOi8vczMuYW1hem9uYXdzLmNvbS9vdXRsaW5lLXZwbi9pbmRleC5odG1sIy9lbi9zdXBwb3J0L2FudGl2aXJ1c0Jsb2NrJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlIGluc3RhbmNlb2YgZXJyb3JzLkNvbmZpZ3VyZVN5c3RlbVByb3h5RmFpbHVyZSkge1xuICAgICAgICAgICAgbWVzc2FnZUtleSA9ICdvdXRsaW5lLXBsdWdpbi1lcnJvci1yb3V0aW5nLXRhYmxlcyc7XG4gICAgICAgICAgICBidXR0b25LZXkgPSAnZmVlZGJhY2stcGFnZS10aXRsZSc7XG4gICAgICAgICAgICBidXR0b25IYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IERyb3AtZG93biBoYXMgbm8gc2VsZWN0ZWQgaXRlbSwgd2h5IG5vdD9cbiAgICAgICAgICAgICAgICBfdGhpcy5yb290RWwuY2hhbmdlUGFnZSgnZmVlZGJhY2snKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5Ob0FkbWluUGVybWlzc2lvbnMpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VLZXkgPSAnb3V0bGluZS1wbHVnaW4tZXJyb3ItYWRtaW4tcGVybWlzc2lvbnMnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBlcnJvcnMuVW5zdXBwb3J0ZWRSb3V0aW5nVGFibGUpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VLZXkgPSAnb3V0bGluZS1wbHVnaW4tZXJyb3ItdW5zdXBwb3J0ZWQtcm91dGluZy10YWJsZSc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5TZXJ2ZXJBbHJlYWR5QWRkZWQpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VLZXkgPSAnZXJyb3Itc2VydmVyLWFscmVhZHktYWRkZWQnO1xuICAgICAgICAgICAgbWVzc2FnZVBhcmFtcyA9IFsnc2VydmVyTmFtZScsIGUuc2VydmVyLm5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZUtleSA9ICdlcnJvci11bmV4cGVjdGVkJztcbiAgICAgICAgfVxuICAgICAgICB2YXIgbWVzc2FnZSA9IG1lc3NhZ2VQYXJhbXMgPyB0aGlzLmxvY2FsaXplLmFwcGx5KHRoaXMsIF9fc3ByZWFkKFttZXNzYWdlS2V5XSwgbWVzc2FnZVBhcmFtcykpIDogdGhpcy5sb2NhbGl6ZShtZXNzYWdlS2V5KTtcbiAgICAgICAgLy8gRGVmZXIgYnkgNTAwbXMgc28gdGhhdCB0aGlzIHRvYXN0IGlzIHNob3duIGFmdGVyIGFueSB0b2FzdHMgdGhhdCBnZXQgc2hvd24gd2hlbiBhbnlcbiAgICAgICAgLy8gY3VycmVudGx5LWluLWZsaWdodCBkb21haW4gZXZlbnRzIGxhbmQgKGUuZy4gZmFrZSBzZXJ2ZXJzIGFkZGVkKS5cbiAgICAgICAgaWYgKHRoaXMucm9vdEVsICYmIHRoaXMucm9vdEVsLmFzeW5jKSB7XG4gICAgICAgICAgICB0aGlzLnJvb3RFbC5hc3luYyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMucm9vdEVsLnNob3dUb2FzdChtZXNzYWdlLCB0b2FzdER1cmF0aW9uLCBidXR0b25LZXkgPyBfdGhpcy5sb2NhbGl6ZShidXR0b25LZXkpIDogdW5kZWZpbmVkLCBidXR0b25IYW5kbGVyLCBidXR0b25MaW5rKTtcbiAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEFwcC5wcm90b3R5cGUucHVsbENsaXBib2FyZFRleHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuY2xpcGJvYXJkLmdldENvbnRlbnRzKCkudGhlbihmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAgICAgX3RoaXMuaGFuZGxlQ2xpcGJvYXJkVGV4dCh0ZXh0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignY2Fubm90IHJlYWQgY2xpcGJvYXJkLCBzeXN0ZW0gbWF5IGxhY2sgY2xpcGJvYXJkIHN1cHBvcnQnKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLnNob3dTZXJ2ZXJDb25uZWN0ZWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcInNlcnZlciBcIiArIGV2ZW50LnNlcnZlci5pZCArIFwiIGNvbm5lY3RlZFwiKTtcbiAgICAgICAgdmFyIGNhcmQgPSB0aGlzLnNlcnZlckxpc3RFbC5nZXRTZXJ2ZXJDYXJkKGV2ZW50LnNlcnZlci5pZCk7XG4gICAgICAgIGNhcmQuc3RhdGUgPSAnQ09OTkVDVEVEJztcbiAgICB9O1xuICAgIEFwcC5wcm90b3R5cGUuc2hvd1NlcnZlckRpc2Nvbm5lY3RlZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKFwic2VydmVyIFwiICsgZXZlbnQuc2VydmVyLmlkICsgXCIgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5zZXJ2ZXJMaXN0RWwuZ2V0U2VydmVyQ2FyZChldmVudC5zZXJ2ZXIuaWQpLnN0YXRlID0gJ0RJU0NPTk5FQ1RFRCc7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybignc2VydmVyIGNhcmQgbm90IGZvdW5kIGFmdGVyIGRpc2Nvbm5lY3Rpb24gZXZlbnQsIGFzc3VtaW5nIGZvcmdvdHRlbicpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLnNob3dTZXJ2ZXJSZWNvbm5lY3RpbmcgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcInNlcnZlciBcIiArIGV2ZW50LnNlcnZlci5pZCArIFwiIHJlY29ubmVjdGluZ1wiKTtcbiAgICAgICAgdmFyIGNhcmQgPSB0aGlzLnNlcnZlckxpc3RFbC5nZXRTZXJ2ZXJDYXJkKGV2ZW50LnNlcnZlci5pZCk7XG4gICAgICAgIGNhcmQuc3RhdGUgPSAnUkVDT05ORUNUSU5HJztcbiAgICB9O1xuICAgIEFwcC5wcm90b3R5cGUuZGlzcGxheVplcm9TdGF0ZVVpID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5yb290RWwuJC5zZXJ2ZXJzVmlldy5zaG91bGRTaG93WmVyb1N0YXRlKSB7XG4gICAgICAgICAgICB0aGlzLnJvb3RFbC4kLmFkZFNlcnZlclZpZXcub3BlbkFkZFNlcnZlclNoZWV0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEFwcC5wcm90b3R5cGUuYXJlUHJpdmFjeVRlcm1zQWNrZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5ncy5nZXQoc2V0dGluZ3NfMS5TZXR0aW5nc0tleS5QUklWQUNZX0FDSykgPT09ICd0cnVlJztcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImNvdWxkIG5vdCByZWFkIHByaXZhY3kgYWNrbm93bGVkZ2VtZW50IHNldHRpbmcsIGFzc3VtaW5nIG5vdCBha2Nub3dsZWRnZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgQXBwLnByb3RvdHlwZS5kaXNwbGF5UHJpdmFjeVZpZXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucm9vdEVsLiQuc2VydmVyc1ZpZXcuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5yb290RWwuJC5wcml2YWN5Vmlldy5oaWRkZW4gPSBmYWxzZTtcbiAgICB9O1xuICAgIEFwcC5wcm90b3R5cGUuYWNrUHJpdmFjeVRlcm1zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJvb3RFbC4kLnNlcnZlcnNWaWV3LmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJvb3RFbC4kLnByaXZhY3lWaWV3LmhpZGRlbiA9IHRydWU7XG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0KHNldHRpbmdzXzEuU2V0dGluZ3NLZXkuUFJJVkFDWV9BQ0ssICd0cnVlJyk7XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLmhhbmRsZUNsaXBib2FyZFRleHQgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAvLyBTaG9ydGVuLCBzYW5pdGlzZS5cbiAgICAgICAgLy8gTm90ZSB0aGF0IHdlIGFsd2F5cyBjaGVjayB0aGUgdGV4dCwgZXZlbiBpZiB0aGUgY29udGVudHMgYXJlIHNhbWUgYXMgbGFzdCB0aW1lLCBiZWNhdXNlIHdlXG4gICAgICAgIC8vIGtlZXAgYW4gaW4tbWVtb3J5IGNhY2hlIG9mIHVzZXItaWdub3JlZCBhY2Nlc3Mga2V5cy5cbiAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIDEwMDApLnRyaW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlybUFkZFNlcnZlcih0ZXh0LCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAvLyBEb24ndCBhbGVydCB0aGUgdXNlcjsgaGlnaCBmYWxzZSBwb3NpdGl2ZSByYXRlLlxuICAgICAgICB9XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLnVwZGF0ZURvd25sb2FkZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucm9vdEVsLnNob3dUb2FzdCh0aGlzLmxvY2FsaXplKCd1cGRhdGUtZG93bmxvYWRlZCcpLCA2MDAwMCk7XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLnJlcXVlc3RQcm9tcHRBZGRTZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucm9vdEVsLnByb21wdEFkZFNlcnZlcigpO1xuICAgIH07XG4gICAgLy8gQ2FjaGVzIGFuIGlnbm9yZWQgc2VydmVyIGFjY2VzcyBrZXkgc28gd2UgZG9uJ3QgcHJvbXB0IHRoZSB1c2VyIHRvIGFkZCBpdCBhZ2Fpbi5cbiAgICBBcHAucHJvdG90eXBlLnJlcXVlc3RJZ25vcmVTZXJ2ZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIGFjY2Vzc0tleSA9IGV2ZW50LmRldGFpbC5hY2Nlc3NLZXk7XG4gICAgICAgIHRoaXMuaWdub3JlZEFjY2Vzc0tleXNbYWNjZXNzS2V5XSA9IHRydWU7XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLnJlcXVlc3RBZGRTZXJ2ZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuc2VydmVyUmVwby5hZGQoZXZlbnQuZGV0YWlsLnNlcnZlckNvbmZpZyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VUb0RlZmF1bHRQYWdlKCk7XG4gICAgICAgICAgICB0aGlzLnNob3dMb2NhbGl6ZWRFcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLnJlcXVlc3RBZGRTZXJ2ZXJDb25maXJtYXRpb24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIGFjY2Vzc0tleSA9IGV2ZW50LmRldGFpbC5hY2Nlc3NLZXk7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ0dvdCBhZGQgc2VydmVyIGNvbmZpcm1hdGlvbiByZXF1ZXN0IGZyb20gVUknKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlybUFkZFNlcnZlcihhY2Nlc3NLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjb25maXJtIGFkZCBzZXZlci4nLCBlcnIpO1xuICAgICAgICAgICAgdmFyIGFkZFNlcnZlclZpZXcgPSB0aGlzLnJvb3RFbC4kLmFkZFNlcnZlclZpZXc7XG4gICAgICAgICAgICBhZGRTZXJ2ZXJWaWV3LiQuYWNjZXNzS2V5SW5wdXQuaW52YWxpZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEFwcC5wcm90b3R5cGUuY29uZmlybUFkZFNlcnZlciA9IGZ1bmN0aW9uIChhY2Nlc3NLZXksIGZyb21DbGlwYm9hcmQpIHtcbiAgICAgICAgaWYgKGZyb21DbGlwYm9hcmQgPT09IHZvaWQgMCkgeyBmcm9tQ2xpcGJvYXJkID0gZmFsc2U7IH1cbiAgICAgICAgdmFyIGFkZFNlcnZlclZpZXcgPSB0aGlzLnJvb3RFbC4kLmFkZFNlcnZlclZpZXc7XG4gICAgICAgIGFjY2Vzc0tleSA9IHVud3JhcEludml0ZShhY2Nlc3NLZXkpO1xuICAgICAgICBpZiAoZnJvbUNsaXBib2FyZCAmJiBhY2Nlc3NLZXkgaW4gdGhpcy5pZ25vcmVkQWNjZXNzS2V5cykge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZGVidWcoJ0lnbm9yaW5nIGFjY2VzcyBrZXknKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmcm9tQ2xpcGJvYXJkICYmIGFkZFNlcnZlclZpZXcuaXNBZGRpbmdTZXJ2ZXIoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZGVidWcoJ0FscmVhZHkgYWRkaW5nIGEgc2VydmVyJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRXhwZWN0IFNIQURPV1NPQ0tTX1VSSS5wYXJzZSB0byB0aHJvdyBvbiBpbnZhbGlkIGFjY2VzcyBrZXk7IHByb3BhZ2F0ZSBhbnkgZXhjZXB0aW9uLlxuICAgICAgICB2YXIgc2hhZG93c29ja3NDb25maWcgPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2hhZG93c29ja3NDb25maWcgPSBzaGFkb3dzb2Nrc19jb25maWdfMS5TSEFET1dTT0NLU19VUkkucGFyc2UoYWNjZXNzS2V5KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gISFlcnJvci5tZXNzYWdlID8gZXJyb3IubWVzc2FnZSA6ICdGYWlsZWQgdG8gcGFyc2UgYWNjZXNzIGtleSc7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLlNlcnZlclVybEludmFsaWQobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNoYWRvd3NvY2tzQ29uZmlnLmhvc3QuaXNJUHY2KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLlNlcnZlckluY29tcGF0aWJsZSgnT25seSBJUHY0IGFkZHJlc3NlcyBhcmUgY3VycmVudGx5IHN1cHBvcnRlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuYW1lID0gc2hhZG93c29ja3NDb25maWcuZXh0cmEub3V0bGluZSA/XG4gICAgICAgICAgICB0aGlzLmxvY2FsaXplKCdzZXJ2ZXItZGVmYXVsdC1uYW1lLW91dGxpbmUnKSA6XG4gICAgICAgICAgICBzaGFkb3dzb2Nrc0NvbmZpZy50YWcuZGF0YSA/IHNoYWRvd3NvY2tzQ29uZmlnLnRhZy5kYXRhIDpcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsaXplKCdzZXJ2ZXItZGVmYXVsdC1uYW1lJyk7XG4gICAgICAgIHZhciBzZXJ2ZXJDb25maWcgPSB7XG4gICAgICAgICAgICBob3N0OiBzaGFkb3dzb2Nrc0NvbmZpZy5ob3N0LmRhdGEsXG4gICAgICAgICAgICBwb3J0OiBzaGFkb3dzb2Nrc0NvbmZpZy5wb3J0LmRhdGEsXG4gICAgICAgICAgICBtZXRob2Q6IHNoYWRvd3NvY2tzQ29uZmlnLm1ldGhvZC5kYXRhLFxuICAgICAgICAgICAgcGFzc3dvcmQ6IHNoYWRvd3NvY2tzQ29uZmlnLnBhc3N3b3JkLmRhdGEsXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoIXRoaXMuc2VydmVyUmVwby5jb250YWluc1NlcnZlcihzZXJ2ZXJDb25maWcpKSB7XG4gICAgICAgICAgICAvLyBPbmx5IHByb21wdCB0aGUgdXNlciB0byBhZGQgbmV3IHNlcnZlcnMuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGFkZFNlcnZlclZpZXcub3BlbkFkZFNlcnZlckNvbmZpcm1hdGlvblNoZWV0KGFjY2Vzc0tleSwgc2VydmVyQ29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gb3BlbiBhZGQgc2V2ZXIgY29uZmlybWF0aW9uIHNoZWV0OicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBpZiAoIWZyb21DbGlwYm9hcmQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0xvY2FsaXplZEVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWZyb21DbGlwYm9hcmQpIHtcbiAgICAgICAgICAgIC8vIERpc3BsYXkgZXJyb3IgbWVzc2FnZSBpZiB0aGlzIGlzIG5vdCBhIGNsaXBib2FyZCBhZGQuXG4gICAgICAgICAgICBhZGRTZXJ2ZXJWaWV3LmNsb3NlKCk7XG4gICAgICAgICAgICB0aGlzLnNob3dMb2NhbGl6ZWRFcnJvcihuZXcgZXJyb3JzLlNlcnZlckFscmVhZHlBZGRlZCh0aGlzLnNlcnZlclJlcG8uY3JlYXRlU2VydmVyKCcnLCBzZXJ2ZXJDb25maWcsIHRoaXMuZXZlbnRRdWV1ZSkpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQXBwLnByb3RvdHlwZS5mb3JnZXRTZXJ2ZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIHNlcnZlcklkID0gZXZlbnQuZGV0YWlsLnNlcnZlcklkO1xuICAgICAgICB2YXIgc2VydmVyID0gdGhpcy5zZXJ2ZXJSZXBvLmdldEJ5SWQoc2VydmVySWQpO1xuICAgICAgICBpZiAoIXNlcnZlcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIk5vIHNlcnZlciB3aXRoIGlkIFwiICsgc2VydmVySWQpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hvd0xvY2FsaXplZEVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9uY2VOb3RSdW5uaW5nID0gc2VydmVyLmNoZWNrUnVubmluZygpLnRoZW4oZnVuY3Rpb24gKGlzUnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGlzUnVubmluZyA/IF90aGlzLmRpc2Nvbm5lY3RTZXJ2ZXIoZXZlbnQpIDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBvbmNlTm90UnVubmluZy50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLnNlcnZlclJlcG8uZm9yZ2V0KHNlcnZlcklkKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLnJlbmFtZVNlcnZlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgc2VydmVySWQgPSBldmVudC5kZXRhaWwuc2VydmVySWQ7XG4gICAgICAgIHZhciBuZXdOYW1lID0gZXZlbnQuZGV0YWlsLm5ld05hbWU7XG4gICAgICAgIHRoaXMuc2VydmVyUmVwby5yZW5hbWUoc2VydmVySWQsIG5ld05hbWUpO1xuICAgIH07XG4gICAgQXBwLnByb3RvdHlwZS5jb25uZWN0U2VydmVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBzZXJ2ZXJJZCA9IGV2ZW50LmRldGFpbC5zZXJ2ZXJJZDtcbiAgICAgICAgaWYgKCFzZXJ2ZXJJZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY29ubmVjdFNlcnZlciBldmVudCBoYWQgbm8gc2VydmVyIElEXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZXJ2ZXIgPSB0aGlzLmdldFNlcnZlckJ5U2VydmVySWQoc2VydmVySWQpO1xuICAgICAgICB2YXIgY2FyZCA9IHRoaXMuZ2V0Q2FyZEJ5U2VydmVySWQoc2VydmVySWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcImNvbm5lY3RpbmcgdG8gc2VydmVyIFwiICsgc2VydmVySWQpO1xuICAgICAgICBjYXJkLnN0YXRlID0gJ0NPTk5FQ1RJTkcnO1xuICAgICAgICBzZXJ2ZXIuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FyZC5zdGF0ZSA9ICdDT05ORUNURUQnO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb25uZWN0ZWQgdG8gc2VydmVyIFwiICsgc2VydmVySWQpO1xuICAgICAgICAgICAgX3RoaXMucm9vdEVsLnNob3dUb2FzdChfdGhpcy5sb2NhbGl6ZSgnc2VydmVyLWNvbm5lY3RlZCcsICdzZXJ2ZXJOYW1lJywgc2VydmVyLm5hbWUpKTtcbiAgICAgICAgICAgIF90aGlzLm1heWJlU2hvd0F1dG9Db25uZWN0RGlhbG9nKCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjYXJkLnN0YXRlID0gJ0RJU0NPTk5FQ1RFRCc7XG4gICAgICAgICAgICBfdGhpcy5zaG93TG9jYWxpemVkRXJyb3IoZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiY291bGQgbm90IGNvbm5lY3QgdG8gc2VydmVyIFwiICsgc2VydmVySWQgKyBcIjogXCIgKyBlLm5hbWUpO1xuICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIGVycm9ycy5SZWd1bGFyTmF0aXZlRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuZXJyb3JSZXBvcnRlci5yZXBvcnQoXCJjb25uZWN0aW9uIGZhaWx1cmU6IFwiICsgZS5uYW1lLCAnY29ubmVjdGlvbi1mYWlsdXJlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgQXBwLnByb3RvdHlwZS5tYXliZVNob3dBdXRvQ29ubmVjdERpYWxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRpc21pc3NlZCA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGlzbWlzc2VkID0gdGhpcy5zZXR0aW5ncy5nZXQoc2V0dGluZ3NfMS5TZXR0aW5nc0tleS5BVVRPX0NPTk5FQ1RfRElBTE9HX0RJU01JU1NFRCkgPT09ICd0cnVlJztcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byByZWFkIGF1dG8tY29ubmVjdCBkaWFsb2cgc3RhdHVzLCBhc3N1bWluZyBub3QgZGlzbWlzc2VkOiBcIiArIGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGlzbWlzc2VkKSB7XG4gICAgICAgICAgICB0aGlzLnJvb3RFbC4kLnNlcnZlcnNWaWV3LiQuYXV0b0Nvbm5lY3REaWFsb2cuc2hvdygpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLmF1dG9Db25uZWN0RGlhbG9nRGlzbWlzc2VkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldHRpbmdzLnNldChzZXR0aW5nc18xLlNldHRpbmdzS2V5LkFVVE9fQ09OTkVDVF9ESUFMT0dfRElTTUlTU0VELCAndHJ1ZScpO1xuICAgIH07XG4gICAgQXBwLnByb3RvdHlwZS5kaXNjb25uZWN0U2VydmVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBzZXJ2ZXJJZCA9IGV2ZW50LmRldGFpbC5zZXJ2ZXJJZDtcbiAgICAgICAgaWYgKCFzZXJ2ZXJJZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZGlzY29ubmVjdFNlcnZlciBldmVudCBoYWQgbm8gc2VydmVyIElEXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZXJ2ZXIgPSB0aGlzLmdldFNlcnZlckJ5U2VydmVySWQoc2VydmVySWQpO1xuICAgICAgICB2YXIgY2FyZCA9IHRoaXMuZ2V0Q2FyZEJ5U2VydmVySWQoc2VydmVySWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcImRpc2Nvbm5lY3RpbmcgZnJvbSBzZXJ2ZXIgXCIgKyBzZXJ2ZXJJZCk7XG4gICAgICAgIGNhcmQuc3RhdGUgPSAnRElTQ09OTkVDVElORyc7XG4gICAgICAgIHNlcnZlci5kaXNjb25uZWN0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYXJkLnN0YXRlID0gJ0RJU0NPTk5FQ1RFRCc7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRpc2Nvbm5lY3RlZCBmcm9tIHNlcnZlciBcIiArIHNlcnZlcklkKTtcbiAgICAgICAgICAgIF90aGlzLnJvb3RFbC5zaG93VG9hc3QoX3RoaXMubG9jYWxpemUoJ3NlcnZlci1kaXNjb25uZWN0ZWQnLCAnc2VydmVyTmFtZScsIHNlcnZlci5uYW1lKSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjYXJkLnN0YXRlID0gJ0NPTk5FQ1RFRCc7XG4gICAgICAgICAgICBfdGhpcy5zaG93TG9jYWxpemVkRXJyb3IoZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJjb3VsZCBub3QgZGlzY29ubmVjdCBmcm9tIHNlcnZlciBcIiArIHNlcnZlcklkICsgXCI6IFwiICsgZS5uYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLnN1Ym1pdEZlZWRiYWNrID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBmb3JtRGF0YSA9IHRoaXMuZmVlZGJhY2tWaWV3RWwuZ2V0VmFsaWRhdGVkRm9ybURhdGEoKTtcbiAgICAgICAgaWYgKCFmb3JtRGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmZWVkYmFjayA9IGZvcm1EYXRhLmZlZWRiYWNrLCBjYXRlZ29yeSA9IGZvcm1EYXRhLmNhdGVnb3J5LCBlbWFpbCA9IGZvcm1EYXRhLmVtYWlsO1xuICAgICAgICB0aGlzLnJvb3RFbC4kLmZlZWRiYWNrVmlldy5zdWJtaXR0aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lcnJvclJlcG9ydGVyLnJlcG9ydChmZWVkYmFjaywgY2F0ZWdvcnksIGVtYWlsKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMucm9vdEVsLiQuZmVlZGJhY2tWaWV3LnN1Ym1pdHRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIF90aGlzLnJvb3RFbC4kLmZlZWRiYWNrVmlldy5yZXNldEZvcm0oKTtcbiAgICAgICAgICAgIF90aGlzLmNoYW5nZVRvRGVmYXVsdFBhZ2UoKTtcbiAgICAgICAgICAgIF90aGlzLnJvb3RFbC5zaG93VG9hc3QoX3RoaXMucm9vdEVsLmxvY2FsaXplKCdmZWVkYmFjay10aGFua3MnKSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIF90aGlzLnJvb3RFbC4kLmZlZWRiYWNrVmlldy5zdWJtaXR0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBfdGhpcy5zaG93TG9jYWxpemVkRXJyb3IobmV3IGVycm9ycy5GZWVkYmFja1N1Ym1pc3Npb25FcnJvcigpKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvLyBFdmVudFF1ZXVlIGV2ZW50IGhhbmRsZXJzOlxuICAgIEFwcC5wcm90b3R5cGUuc2hvd1NlcnZlckFkZGVkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBzZXJ2ZXIgPSBldmVudC5zZXJ2ZXI7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ1NlcnZlciBhZGRlZCcpO1xuICAgICAgICB0aGlzLnN5bmNTZXJ2ZXJzVG9VSSgpO1xuICAgICAgICB0aGlzLnN5bmNTZXJ2ZXJDb25uZWN0aXZpdHlTdGF0ZShzZXJ2ZXIpO1xuICAgICAgICB0aGlzLmNoYW5nZVRvRGVmYXVsdFBhZ2UoKTtcbiAgICAgICAgdGhpcy5yb290RWwuc2hvd1RvYXN0KHRoaXMubG9jYWxpemUoJ3NlcnZlci1hZGRlZCcsICdzZXJ2ZXJOYW1lJywgc2VydmVyLm5hbWUpKTtcbiAgICB9O1xuICAgIEFwcC5wcm90b3R5cGUuc2hvd1NlcnZlckZvcmdvdHRlbiA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgc2VydmVyID0gZXZlbnQuc2VydmVyO1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdTZXJ2ZXIgZm9yZ290dGVuJyk7XG4gICAgICAgIHRoaXMuc3luY1NlcnZlcnNUb1VJKCk7XG4gICAgICAgIHRoaXMucm9vdEVsLnNob3dUb2FzdCh0aGlzLmxvY2FsaXplKCdzZXJ2ZXItZm9yZ290dGVuJywgJ3NlcnZlck5hbWUnLCBzZXJ2ZXIubmFtZSksIDEwMDAwLCB0aGlzLmxvY2FsaXplKCd1bmRvLWJ1dHRvbi1sYWJlbCcpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXJ2ZXJSZXBvLnVuZG9Gb3JnZXQoc2VydmVyLmlkKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLnNob3dTZXJ2ZXJGb3JnZXRVbmRvbmUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5zeW5jU2VydmVyc1RvVUkoKTtcbiAgICAgICAgdmFyIHNlcnZlciA9IGV2ZW50LnNlcnZlcjtcbiAgICAgICAgdGhpcy5yb290RWwuc2hvd1RvYXN0KHRoaXMubG9jYWxpemUoJ3NlcnZlci1mb3Jnb3R0ZW4tdW5kbycsICdzZXJ2ZXJOYW1lJywgc2VydmVyLm5hbWUpKTtcbiAgICB9O1xuICAgIEFwcC5wcm90b3R5cGUuc2hvd1NlcnZlclJlbmFtZWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIHNlcnZlciA9IGV2ZW50LnNlcnZlcjtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnU2VydmVyIHJlbmFtZWQnKTtcbiAgICAgICAgdGhpcy5zZXJ2ZXJMaXN0RWwuZ2V0U2VydmVyQ2FyZChzZXJ2ZXIuaWQpLnNlcnZlck5hbWUgPSBzZXJ2ZXIubmFtZTtcbiAgICAgICAgdGhpcy5yb290RWwuc2hvd1RvYXN0KHRoaXMubG9jYWxpemUoJ3NlcnZlci1yZW5hbWUtY29tcGxldGUnKSk7XG4gICAgfTtcbiAgICAvLyBIZWxwZXJzOlxuICAgIEFwcC5wcm90b3R5cGUuc3luY1NlcnZlcnNUb1VJID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJvb3RFbC5zZXJ2ZXJzID0gdGhpcy5zZXJ2ZXJSZXBvLmdldEFsbCgpO1xuICAgIH07XG4gICAgQXBwLnByb3RvdHlwZS5zeW5jQ29ubmVjdGl2aXR5U3RhdGVUb1NlcnZlckNhcmRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZm9yICh2YXIgX2EgPSBfX3ZhbHVlcyh0aGlzLnNlcnZlclJlcG8uZ2V0QWxsKCkpLCBfYiA9IF9hLm5leHQoKTsgIV9iLmRvbmU7IF9iID0gX2EubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlcnZlciA9IF9iLnZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc3luY1NlcnZlckNvbm5lY3Rpdml0eVN0YXRlKHNlcnZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmIChfYiAmJiAhX2IuZG9uZSAmJiAoX2MgPSBfYS5yZXR1cm4pKSBfYy5jYWxsKF9hKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZV8xLCBfYztcbiAgICB9O1xuICAgIEFwcC5wcm90b3R5cGUuc3luY1NlcnZlckNvbm5lY3Rpdml0eVN0YXRlID0gZnVuY3Rpb24gKHNlcnZlcikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBzZXJ2ZXIuY2hlY2tSdW5uaW5nKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChpc1J1bm5pbmcpIHtcbiAgICAgICAgICAgIHZhciBjYXJkID0gX3RoaXMuc2VydmVyTGlzdEVsLmdldFNlcnZlckNhcmQoc2VydmVyLmlkKTtcbiAgICAgICAgICAgIGlmICghaXNSdW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgY2FyZC5zdGF0ZSA9ICdESVNDT05ORUNURUQnO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlcnZlci5jaGVja1JlYWNoYWJsZSgpLnRoZW4oZnVuY3Rpb24gKGlzUmVhY2hhYmxlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzUmVhY2hhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQuc3RhdGUgPSAnQ09OTkVDVEVEJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2VydmVyIFwiICsgc2VydmVyLmlkICsgXCIgcmVjb25uZWN0aW5nXCIpO1xuICAgICAgICAgICAgICAgICAgICBjYXJkLnN0YXRlID0gJ1JFQ09OTkVDVElORyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzeW5jIHNlcnZlciBjb25uZWN0aXZpdHkgc3RhdGUnLCBlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLnJlZ2lzdGVyVXJsSW50ZXJjZXB0aW9uTGlzdGVuZXIgPSBmdW5jdGlvbiAodXJsSW50ZXJjZXB0b3IpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdXJsSW50ZXJjZXB0b3IucmVnaXN0ZXJMaXN0ZW5lcihmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICBpZiAoIXVybCB8fCAhdW53cmFwSW52aXRlKHVybCkuc3RhcnRzV2l0aCgnc3M6Ly8nKSkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgY2hlY2sgaXMgbmVjZXNzYXJ5IHRvIGlnbm9yZSBlbXB0eSBhbmQgbWFsZm9ybWVkIGluc3RhbGwtcmVmZXJyZXIgVVJMcyBpbiBBbmRyb2lkXG4gICAgICAgICAgICAgICAgLy8gd2hpbGUgYWxsb3dpbmcgc3M6Ly8gYW5kIGludml0ZSBVUkxzLlxuICAgICAgICAgICAgICAgIC8vIFRPRE86IFN0b3AgcmVjZWl2aW5nIGluc3RhbGwgcmVmZXJyZXIgaW50ZW50cyBzbyB3ZSBjYW4gcmVtb3ZlIHRoaXMuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZGVidWcoXCJJZ25vcmluZyBpbnRlcmNlcHRlZCBub24tc2hhZG93c29ja3MgdXJsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBfdGhpcy5jb25maXJtQWRkU2VydmVyKHVybCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2hvd0xvY2FsaXplZEVycm9ySW5EZWZhdWx0UGFnZShlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEFwcC5wcm90b3R5cGUuY2hhbmdlVG9EZWZhdWx0UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yb290RWwuY2hhbmdlUGFnZSh0aGlzLnJvb3RFbC5ERUZBVUxUX1BBR0UpO1xuICAgIH07XG4gICAgLy8gUmV0dXJucyB0aGUgc2VydmVyIGhhdmluZyBzZXJ2ZXJJZCwgdGhyb3dzIGlmIHRoZSBzZXJ2ZXIgY2Fubm90IGJlIGZvdW5kLlxuICAgIEFwcC5wcm90b3R5cGUuZ2V0U2VydmVyQnlTZXJ2ZXJJZCA9IGZ1bmN0aW9uIChzZXJ2ZXJJZCkge1xuICAgICAgICB2YXIgc2VydmVyID0gdGhpcy5zZXJ2ZXJSZXBvLmdldEJ5SWQoc2VydmVySWQpO1xuICAgICAgICBpZiAoIXNlcnZlcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY291bGQgbm90IGZpbmQgc2VydmVyIHdpdGggSUQgXCIgKyBzZXJ2ZXJJZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlcnZlcjtcbiAgICB9O1xuICAgIC8vIFJldHVybnMgdGhlIGNhcmQgYXNzb2NpYXRlZCB3aXRoIHNlcnZlcklkLCB0aHJvd3MgaWYgbm8gc3VjaCBjYXJkIGV4aXN0cy5cbiAgICAvLyBTZWUgc2VydmVyLWxpc3QuaHRtbC5cbiAgICBBcHAucHJvdG90eXBlLmdldENhcmRCeVNlcnZlcklkID0gZnVuY3Rpb24gKHNlcnZlcklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZlckxpc3RFbC5nZXRTZXJ2ZXJDYXJkKHNlcnZlcklkKTtcbiAgICB9O1xuICAgIEFwcC5wcm90b3R5cGUuc2hvd0xvY2FsaXplZEVycm9ySW5EZWZhdWx0UGFnZSA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgdGhpcy5jaGFuZ2VUb0RlZmF1bHRQYWdlKCk7XG4gICAgICAgIHRoaXMuc2hvd0xvY2FsaXplZEVycm9yKGVycik7XG4gICAgfTtcbiAgICBBcHAucHJvdG90eXBlLmlzV2luZG93cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICEoJ2NvcmRvdmEnIGluIHdpbmRvdyk7XG4gICAgfTtcbiAgICByZXR1cm4gQXBwO1xufSgpKTtcbmV4cG9ydHMuQXBwID0gQXBwO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBDb3B5cmlnaHQgMjAxOCBUaGUgT3V0bGluZSBBdXRob3JzXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIEdlbmVyaWMgY2xpcGJvYXJkLiBJbXBsZW1lbnRhdGlvbnMgc2hvdWxkIG9ubHkgaGF2ZSB0byBpbXBsZW1lbnQgZ2V0Q29udGVudHMoKS5cbnZhciBBYnN0cmFjdENsaXBib2FyZCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBYnN0cmFjdENsaXBib2FyZCgpIHtcbiAgICB9XG4gICAgQWJzdHJhY3RDbGlwYm9hcmQucHJvdG90eXBlLmdldENvbnRlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCd1bmltcGxlbWVudGVkIHNrZWxldG9uIG1ldGhvZCcpKTtcbiAgICB9O1xuICAgIEFic3RyYWN0Q2xpcGJvYXJkLnByb3RvdHlwZS5zZXRMaXN0ZW5lciA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICB0aGlzLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gICAgfTtcbiAgICBBYnN0cmFjdENsaXBib2FyZC5wcm90b3R5cGUuZW1pdEV2ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5saXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5nZXRDb250ZW50cygpLnRoZW4odGhpcy5saXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBBYnN0cmFjdENsaXBib2FyZDtcbn0oKSk7XG5leHBvcnRzLkFic3RyYWN0Q2xpcGJvYXJkID0gQWJzdHJhY3RDbGlwYm9hcmQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIENvcHlyaWdodCAyMDE4IFRoZSBPdXRsaW5lIEF1dGhvcnNcbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi90eXBlcy9hbWJpZW50L291dGxpbmVQbHVnaW4uZC50cycvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vdHlwZXMvYW1iaWVudC93ZWJpbnRlbnRzLmQudHMnLz5cbnZhciBSYXZlbiA9IHJlcXVpcmUoXCJyYXZlbi1qc1wiKTtcbnZhciBjbGlwYm9hcmRfMSA9IHJlcXVpcmUoXCIuL2NsaXBib2FyZFwiKTtcbnZhciBlcnJvcl9yZXBvcnRlcl8xID0gcmVxdWlyZShcIi4vZXJyb3JfcmVwb3J0ZXJcIik7XG52YXIgZmFrZV9jb25uZWN0aW9uXzEgPSByZXF1aXJlKFwiLi9mYWtlX2Nvbm5lY3Rpb25cIik7XG52YXIgbWFpbl8xID0gcmVxdWlyZShcIi4vbWFpblwiKTtcbnZhciBvdXRsaW5lX3NlcnZlcl8xID0gcmVxdWlyZShcIi4vb3V0bGluZV9zZXJ2ZXJcIik7XG52YXIgdXBkYXRlcl8xID0gcmVxdWlyZShcIi4vdXBkYXRlclwiKTtcbnZhciBpbnRlcmNlcHRvcnMgPSByZXF1aXJlKFwiLi91cmxfaW50ZXJjZXB0b3JcIik7XG4vLyBQdXNoZXMgYSBjbGlwYm9hcmQgZXZlbnQgd2hlbmV2ZXIgdGhlIGFwcCBpcyBicm91Z2h0IHRvIHRoZSBmb3JlZ3JvdW5kLlxudmFyIENvcmRvdmFDbGlwYm9hcmQgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKENvcmRvdmFDbGlwYm9hcmQsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gQ29yZG92YUNsaXBib2FyZCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncmVzdW1lJywgX3RoaXMuZW1pdEV2ZW50LmJpbmQoX3RoaXMpKTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBDb3Jkb3ZhQ2xpcGJvYXJkLnByb3RvdHlwZS5nZXRDb250ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGNvcmRvdmEucGx1Z2lucy5jbGlwYm9hcmQucGFzdGUocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gQ29yZG92YUNsaXBib2FyZDtcbn0oY2xpcGJvYXJkXzEuQWJzdHJhY3RDbGlwYm9hcmQpKTtcbi8vIEFkZHMgcmVwb3J0cyBmcm9tIHRoZSAobmF0aXZlKSBDb3Jkb3ZhIHBsdWdpbi5cbnZhciBDb3Jkb3ZhRXJyb3JSZXBvcnRlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoQ29yZG92YUVycm9yUmVwb3J0ZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gQ29yZG92YUVycm9yUmVwb3J0ZXIoYXBwVmVyc2lvbiwgYXBwQnVpbGROdW1iZXIsIGRzbiwgbmF0aXZlRHNuKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGFwcFZlcnNpb24sIGRzbiwgeyAnYnVpbGQubnVtYmVyJzogYXBwQnVpbGROdW1iZXIgfSkgfHwgdGhpcztcbiAgICAgICAgY29yZG92YS5wbHVnaW5zLm91dGxpbmUubG9nLmluaXRpYWxpemUobmF0aXZlRHNuKS5jYXRjaChjb25zb2xlLmVycm9yKTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBDb3Jkb3ZhRXJyb3JSZXBvcnRlci5wcm90b3R5cGUucmVwb3J0ID0gZnVuY3Rpb24gKHVzZXJGZWVkYmFjaywgZmVlZGJhY2tDYXRlZ29yeSwgdXNlckVtYWlsKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIucHJvdG90eXBlLnJlcG9ydC5jYWxsKHRoaXMsIHVzZXJGZWVkYmFjaywgZmVlZGJhY2tDYXRlZ29yeSwgdXNlckVtYWlsKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBjb3Jkb3ZhLnBsdWdpbnMub3V0bGluZS5sb2cuc2VuZChSYXZlbi5sYXN0RXZlbnRJZCgpKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gQ29yZG92YUVycm9yUmVwb3J0ZXI7XG59KGVycm9yX3JlcG9ydGVyXzEuU2VudHJ5RXJyb3JSZXBvcnRlcikpO1xuZXhwb3J0cy5Db3Jkb3ZhRXJyb3JSZXBvcnRlciA9IENvcmRvdmFFcnJvclJlcG9ydGVyO1xuLy8gVGhpcyBjbGFzcyBzaG91bGQgb25seSBiZSBpbnN0YW50aWF0ZWQgYWZ0ZXIgQ29yZG92YSBmaXJlcyB0aGUgZGV2aWNlcmVhZHkgZXZlbnQuXG52YXIgQ29yZG92YVBsYXRmb3JtID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENvcmRvdmFQbGF0Zm9ybSgpIHtcbiAgICB9XG4gICAgQ29yZG92YVBsYXRmb3JtLmlzQnJvd3NlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRldmljZS5wbGF0Zm9ybSA9PT0gJ2Jyb3dzZXInO1xuICAgIH07XG4gICAgQ29yZG92YVBsYXRmb3JtLnByb3RvdHlwZS5oYXNEZXZpY2VTdXBwb3J0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gIUNvcmRvdmFQbGF0Zm9ybS5pc0Jyb3dzZXIoKTtcbiAgICB9O1xuICAgIENvcmRvdmFQbGF0Zm9ybS5wcm90b3R5cGUuZ2V0UGVyc2lzdGVudFNlcnZlckZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoc2VydmVySWQsIGNvbmZpZywgZXZlbnRRdWV1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBvdXRsaW5lX3NlcnZlcl8xLk91dGxpbmVTZXJ2ZXIoc2VydmVySWQsIGNvbmZpZywgX3RoaXMuaGFzRGV2aWNlU3VwcG9ydCgpID8gbmV3IGNvcmRvdmEucGx1Z2lucy5vdXRsaW5lLkNvbm5lY3Rpb24oY29uZmlnLCBzZXJ2ZXJJZCkgOlxuICAgICAgICAgICAgICAgIG5ldyBmYWtlX2Nvbm5lY3Rpb25fMS5GYWtlT3V0bGluZUNvbm5lY3Rpb24oY29uZmlnLCBzZXJ2ZXJJZCksIGV2ZW50UXVldWUpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgQ29yZG92YVBsYXRmb3JtLnByb3RvdHlwZS5nZXRVcmxJbnRlcmNlcHRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGRldmljZS5wbGF0Zm9ybSA9PT0gJ2lPUycgfHwgZGV2aWNlLnBsYXRmb3JtID09PSAnTWFjIE9TIFgnKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGludGVyY2VwdG9ycy5BcHBsZVVybEludGVyY2VwdG9yKGFwcGxlTGF1bmNoVXJsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkZXZpY2UucGxhdGZvcm0gPT09ICdBbmRyb2lkJykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBpbnRlcmNlcHRvcnMuQW5kcm9pZFVybEludGVyY2VwdG9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKCdubyBpbnRlbnQgaW50ZXJjZXB0b3IgYXZhaWxhYmxlJyk7XG4gICAgICAgIHJldHVybiBuZXcgaW50ZXJjZXB0b3JzLlVybEludGVyY2VwdG9yKCk7XG4gICAgfTtcbiAgICBDb3Jkb3ZhUGxhdGZvcm0ucHJvdG90eXBlLmdldENsaXBib2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb3Jkb3ZhQ2xpcGJvYXJkKCk7XG4gICAgfTtcbiAgICBDb3Jkb3ZhUGxhdGZvcm0ucHJvdG90eXBlLmdldEVycm9yUmVwb3J0ZXIgPSBmdW5jdGlvbiAoZW52KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc0RldmljZVN1cHBvcnQoKSA/XG4gICAgICAgICAgICBuZXcgQ29yZG92YUVycm9yUmVwb3J0ZXIoZW52LkFQUF9WRVJTSU9OLCBlbnYuQVBQX0JVSUxEX05VTUJFUiwgZW52LlNFTlRSWV9EU04sIGVudi5TRU5UUllfTkFUSVZFX0RTTikgOlxuICAgICAgICAgICAgbmV3IGVycm9yX3JlcG9ydGVyXzEuU2VudHJ5RXJyb3JSZXBvcnRlcihlbnYuQVBQX1ZFUlNJT04sIGVudi5TRU5UUllfRFNOLCB7fSk7XG4gICAgfTtcbiAgICBDb3Jkb3ZhUGxhdGZvcm0ucHJvdG90eXBlLmdldFVwZGF0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgdXBkYXRlcl8xLkFic3RyYWN0VXBkYXRlcigpO1xuICAgIH07XG4gICAgQ29yZG92YVBsYXRmb3JtLnByb3RvdHlwZS5xdWl0QXBwbGljYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIE9ubHkgdXNlZCBpbiBtYWNPUyBiZWNhdXNlIG1lbnUgYmFyIGFwcHMgcHJvdmlkZSBubyBhbHRlcm5hdGl2ZSB3YXkgb2YgcXVpdHRpbmcuXG4gICAgICAgIGNvcmRvdmEucGx1Z2lucy5vdXRsaW5lLnF1aXRBcHBsaWNhdGlvbigpO1xuICAgIH07XG4gICAgcmV0dXJuIENvcmRvdmFQbGF0Zm9ybTtcbn0oKSk7XG4vLyBodHRwczovL2NvcmRvdmEuYXBhY2hlLm9yZy9kb2NzL2VuL2xhdGVzdC9jb3Jkb3ZhL2V2ZW50cy9ldmVudHMuaHRtbCNkZXZpY2VyZWFkeVxudmFyIG9uY2VEZXZpY2VSZWFkeSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlcmVhZHknLCByZXNvbHZlKTtcbn0pO1xuLy8gY29yZG92YS1baW9zfG9zeF0gY2FsbCBhIGdsb2JhbCBmdW5jdGlvbiB3aXRoIHRoaXMgc2lnbmF0dXJlIHdoZW4gYSBVUkwgaXNcbi8vIGludGVyY2VwdGVkLiBXZSBoYW5kbGUgVVJMIGludGVyY2VwdGlvbnMgd2l0aCBhbiBpbnRlbnQgaW50ZXJjZXB0b3I7IGhvd2V2ZXIsXG4vLyB3aGVuIHRoZSBhcHAgaXMgbGF1bmNoZWQgdmlhIFVSTCBvdXIgc3RhcnQgdXAgc2VxdWVuY2UgbWlzc2VzIHRoZSBjYWxsIGR1ZSB0b1xuLy8gYSByYWNlLiBEZWZpbmUgdGhlIGZ1bmN0aW9uIHRlbXBvcmFyaWx5IGhlcmUsIGFuZCBzZXQgYSBnbG9iYWwgdmFyaWFibGUuXG52YXIgYXBwbGVMYXVuY2hVcmw7XG53aW5kb3cuaGFuZGxlT3BlblVSTCA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICBhcHBsZUxhdW5jaFVybCA9IHVybDtcbn07XG5vbmNlRGV2aWNlUmVhZHkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgbWFpbl8xLm1haW4obmV3IENvcmRvdmFQbGF0Zm9ybSgpKTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBDb3B5cmlnaHQgMjAxOCBUaGUgT3V0bGluZSBBdXRob3JzXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIEtlZXAgdGhlc2UgaW4gc3luYyB3aXRoIHRoZSBFbnZpcm9ubWVudFZhcmlhYmxlcyBpbnRlcmZhY2UgYWJvdmUuXG52YXIgRU5WX0tFWVMgPSB7XG4gICAgQVBQX1ZFUlNJT046ICdBUFBfVkVSU0lPTicsXG4gICAgQVBQX0JVSUxEX05VTUJFUjogJ0FQUF9CVUlMRF9OVU1CRVInLFxuICAgIFNFTlRSWV9EU046ICdTRU5UUllfRFNOJyxcbiAgICBTRU5UUllfTkFUSVZFX0RTTjogJ1NFTlRSWV9OQVRJVkVfRFNOJ1xufTtcbmZ1bmN0aW9uIHZhbGlkYXRlRW52VmFycyhqc29uKSB7XG4gICAgZm9yICh2YXIga2V5IGluIEVOVl9LRVlTKSB7XG4gICAgICAgIGlmICghanNvbi5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGVudmlyb25tZW50IHZhcmlhYmxlOiBcIiArIGtleSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyBBY2NvcmRpbmcgdG8gaHR0cDovL2Nhbml1c2UuY29tLyNmZWF0PWZldGNoIGZldGNoIGRpZG4ndCBoaXQgaU9TIFNhZmFyaVxuLy8gdW50aWwgdjEwLjMgcmVsZWFzZWQgMy8yNi8xNywgc28gdXNlIFhNTEh0dHBSZXF1ZXN0IGluc3RlYWQuXG5leHBvcnRzLm9uY2VFbnZWYXJzID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIGpzb24gPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgdmFsaWRhdGVFbnZWYXJzKGpzb24pO1xuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnUmVzb2x2aW5nIHdpdGggZW52VmFyczonLCBqc29uKTtcbiAgICAgICAgICAgIHJlc29sdmUoanNvbik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHhoci5vcGVuKCdHRVQnLCAnZW52aXJvbm1lbnQuanNvbicsIHRydWUpO1xuICAgIHhoci5zZW5kKCk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gQ29weXJpZ2h0IDIwMTggVGhlIE91dGxpbmUgQXV0aG9yc1xuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vXG4vLyAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy9cbi8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgUmF2ZW4gPSByZXF1aXJlKFwicmF2ZW4tanNcIik7XG52YXIgU2VudHJ5RXJyb3JSZXBvcnRlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTZW50cnlFcnJvclJlcG9ydGVyKGFwcFZlcnNpb24sIGRzbiwgdGFncykge1xuICAgICAgICBSYXZlbi5jb25maWcoZHNuLCB7IHJlbGVhc2U6IGFwcFZlcnNpb24sICd0YWdzJzogdGFncyB9KS5pbnN0YWxsKCk7XG4gICAgICAgIHRoaXMuc2V0VXBVbmhhbmRsZWRSZWplY3Rpb25MaXN0ZW5lcigpO1xuICAgIH1cbiAgICBTZW50cnlFcnJvclJlcG9ydGVyLnByb3RvdHlwZS5yZXBvcnQgPSBmdW5jdGlvbiAodXNlckZlZWRiYWNrLCBmZWVkYmFja0NhdGVnb3J5LCB1c2VyRW1haWwpIHtcbiAgICAgICAgUmF2ZW4uc2V0VXNlckNvbnRleHQoeyBlbWFpbDogdXNlckVtYWlsIHx8ICcnIH0pO1xuICAgICAgICBSYXZlbi5jYXB0dXJlTWVzc2FnZSh1c2VyRmVlZGJhY2ssIHsgdGFnczogeyBjYXRlZ29yeTogZmVlZGJhY2tDYXRlZ29yeSB9IH0pO1xuICAgICAgICBSYXZlbi5zZXRVc2VyQ29udGV4dCgpOyAvLyBSZXNldCB0aGUgdXNlciBjb250ZXh0LCBkb24ndCBjYWNoZSB0aGUgZW1haWxcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH07XG4gICAgU2VudHJ5RXJyb3JSZXBvcnRlci5wcm90b3R5cGUuc2V0VXBVbmhhbmRsZWRSZWplY3Rpb25MaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gQ2hyb21lIGlzIHRoZSBvbmx5IGJyb3dzZXIgdGhhdCBzdXBwb3J0cyB0aGUgdW5oYW5kbGVkcmVqZWN0aW9uIGV2ZW50LlxuICAgICAgICAvLyBUaGlzIGlzIGZpbmUgZm9yIEFuZHJvaWQsIGJ1dCB3aWxsIG5vdCB3b3JrIGluIGlPUy5cbiAgICAgICAgdmFyIHVuaGFuZGxlZFJlamVjdGlvbiA9ICd1bmhhbmRsZWRyZWplY3Rpb24nO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcih1bmhhbmRsZWRSZWplY3Rpb24sIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdmFyIHJlYXNvbiA9IGV2ZW50LnJlYXNvbjtcbiAgICAgICAgICAgIHZhciBtc2cgPSByZWFzb24uc3RhY2sgPyByZWFzb24uc3RhY2sgOiByZWFzb247XG4gICAgICAgICAgICBSYXZlbi5jYXB0dXJlQnJlYWRjcnVtYih7IG1lc3NhZ2U6IG1zZywgY2F0ZWdvcnk6IHVuaGFuZGxlZFJlamVjdGlvbiB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gU2VudHJ5RXJyb3JSZXBvcnRlcjtcbn0oKSk7XG5leHBvcnRzLlNlbnRyeUVycm9yUmVwb3J0ZXIgPSBTZW50cnlFcnJvclJlcG9ydGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBDb3B5cmlnaHQgMjAxOCBUaGUgT3V0bGluZSBBdXRob3JzXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uLy4uL3R5cGVzL2FtYmllbnQvb3V0bGluZVBsdWdpbi5kLnRzJy8+XG52YXIgZXJyb3JzID0gcmVxdWlyZShcIi4uL21vZGVsL2Vycm9yc1wiKTtcbi8vIE5vdGUgdGhhdCBiZWNhdXNlIHRoaXMgaW1wbGVtZW50YXRpb24gZG9lcyBub3QgZW1pdCBkaXNjb25uZWN0aW9uIGV2ZW50cywgXCJzd2l0Y2hpbmdcIiBiZXR3ZWVuXG4vLyBzZXJ2ZXJzIGluIHRoZSBzZXJ2ZXIgbGlzdCB3aWxsIG5vdCB3b3JrIGFzIGV4cGVjdGVkLlxudmFyIEZha2VPdXRsaW5lQ29ubmVjdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBGYWtlT3V0bGluZUNvbm5lY3Rpb24oY29uZmlnLCBpZCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgRmFrZU91dGxpbmVDb25uZWN0aW9uLnByb3RvdHlwZS5wbGF5QnJva2VuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcubmFtZSAmJiB0aGlzLmNvbmZpZy5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2Jyb2tlbicpO1xuICAgIH07XG4gICAgRmFrZU91dGxpbmVDb25uZWN0aW9uLnByb3RvdHlwZS5wbGF5VW5yZWFjaGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAhKHRoaXMuY29uZmlnLm5hbWUgJiYgdGhpcy5jb25maWcubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCd1bnJlYWNoYWJsZScpKTtcbiAgICB9O1xuICAgIEZha2VPdXRsaW5lQ29ubmVjdGlvbi5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMucGxheVVucmVhY2hhYmxlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgZXJyb3JzLk91dGxpbmVQbHVnaW5FcnJvcig1IC8qIFNFUlZFUl9VTlJFQUNIQUJMRSAqLykpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMucGxheUJyb2tlbigpKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IGVycm9ycy5PdXRsaW5lUGx1Z2luRXJyb3IoOCAvKiBTSEFET1dTT0NLU19TVEFSVF9GQUlMVVJFICovKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBGYWtlT3V0bGluZUNvbm5lY3Rpb24ucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5ydW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9O1xuICAgIEZha2VPdXRsaW5lQ29ubmVjdGlvbi5wcm90b3R5cGUuaXNSdW5uaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMucnVubmluZyk7XG4gICAgfTtcbiAgICBGYWtlT3V0bGluZUNvbm5lY3Rpb24ucHJvdG90eXBlLmlzUmVhY2hhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCF0aGlzLnBsYXlVbnJlYWNoYWJsZSgpKTtcbiAgICB9O1xuICAgIEZha2VPdXRsaW5lQ29ubmVjdGlvbi5wcm90b3R5cGUub25TdGF0dXNDaGFuZ2UgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgLy8gTk9PUFxuICAgIH07XG4gICAgcmV0dXJuIEZha2VPdXRsaW5lQ29ubmVjdGlvbjtcbn0oKSk7XG5leHBvcnRzLkZha2VPdXRsaW5lQ29ubmVjdGlvbiA9IEZha2VPdXRsaW5lQ29ubmVjdGlvbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gQ29weXJpZ2h0IDIwMTggVGhlIE91dGxpbmUgQXV0aG9yc1xuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vXG4vLyAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy9cbi8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG52YXIgX19yZWFkID0gKHRoaXMgJiYgdGhpcy5fX3JlYWQpIHx8IGZ1bmN0aW9uIChvLCBuKSB7XG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xuICAgIGlmICghbSkgcmV0dXJuIG87XG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XG4gICAgdHJ5IHtcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XG4gICAgfVxuICAgIHJldHVybiBhcjtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdXJsID0gcmVxdWlyZShcInVybFwiKTtcbnZhciBldmVudHNfMSA9IHJlcXVpcmUoXCIuLi9tb2RlbC9ldmVudHNcIik7XG52YXIgYXBwXzEgPSByZXF1aXJlKFwiLi9hcHBcIik7XG52YXIgZW52aXJvbm1lbnRfMSA9IHJlcXVpcmUoXCIuL2Vudmlyb25tZW50XCIpO1xudmFyIHBlcnNpc3RlbnRfc2VydmVyXzEgPSByZXF1aXJlKFwiLi9wZXJzaXN0ZW50X3NlcnZlclwiKTtcbnZhciBzZXR0aW5nc18xID0gcmVxdWlyZShcIi4vc2V0dGluZ3NcIik7XG4vLyBVc2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHRvIHVzZSBQb2x5bWVyIGZ1bmN0aW9uYWxpdHkgb24gYXBwIGluaXRpYWxpemF0aW9uIGZhaWx1cmUuXG52YXIgd2ViQ29tcG9uZW50c0FyZVJlYWR5ID0gZmFsc2U7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdXZWJDb21wb25lbnRzUmVhZHknLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5kZWJ1ZygncmVjZWl2ZWQgV2ViQ29tcG9uZW50c1JlYWR5IGV2ZW50Jyk7XG4gICAgd2ViQ29tcG9uZW50c0FyZVJlYWR5ID0gdHJ1ZTtcbn0pO1xuLy8gVXNlZCB0byBkZWxheSBsb2FkaW5nIHRoZSBhcHAgdW50aWwgKHRyYW5zbGF0aW9uKSByZXNvdXJjZXMgaGF2ZSBiZWVuIGxvYWRlZC4gVGhpcyBjYW4gaGFwcGVuIGFcbi8vIGxpdHRsZSBsYXRlciB0aGFuIFdlYkNvbXBvbmVudHNSZWFkeS5cbnZhciBvbmNlUG9seW1lcklzUmVhZHkgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2FwcC1sb2NhbGl6ZS1yZXNvdXJjZXMtbG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdyZWNlaXZlZCBhcHAtbG9jYWxpemUtcmVzb3VyY2VzLWxvYWRlZCBldmVudCcpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG59KTtcbi8vIEhlbHBlcnNcbi8vIERvIG5vdCBjYWxsIHVudGlsIFdlYkNvbXBvbmVudHNSZWFkeSBoYXMgZmlyZWQhXG5mdW5jdGlvbiBnZXRSb290RWwoKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FwcC1yb290Jyk7XG59XG5mdW5jdGlvbiBjcmVhdGVTZXJ2ZXJSZXBvKGV2ZW50UXVldWUsIHN0b3JhZ2UsIGRldmljZVN1cHBvcnQsIGNvbm5lY3Rpb25UeXBlKSB7XG4gICAgdmFyIHJlcG8gPSBuZXcgcGVyc2lzdGVudF9zZXJ2ZXJfMS5QZXJzaXN0ZW50U2VydmVyUmVwb3NpdG9yeShjb25uZWN0aW9uVHlwZSwgZXZlbnRRdWV1ZSwgc3RvcmFnZSk7XG4gICAgaWYgKCFkZXZpY2VTdXBwb3J0KSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ0RldGVjdGVkIGRldmVsb3BtZW50IGVudmlyb25tZW50LCB1c2luZyBmYWtlIHNlcnZlcnMuJyk7XG4gICAgICAgIGlmIChyZXBvLmdldEFsbCgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmVwby5hZGQoeyBuYW1lOiAnRmFrZSBXb3JraW5nIFNlcnZlcicsIGhvc3Q6ICcxMjcuMC4wLjEnIH0pO1xuICAgICAgICAgICAgcmVwby5hZGQoeyBuYW1lOiAnRmFrZSBCcm9rZW4gU2VydmVyJywgaG9zdDogJzE5Mi4wLjIuMScgfSk7XG4gICAgICAgICAgICByZXBvLmFkZCh7IG5hbWU6ICdGYWtlIFVucmVhY2hhYmxlIFNlcnZlcicsIGhvc3Q6ICcxMC4wLjAuMjQnIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXBvO1xufVxuZnVuY3Rpb24gbWFpbihwbGF0Zm9ybSkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbZW52aXJvbm1lbnRfMS5vbmNlRW52VmFycywgb25jZVBvbHltZXJJc1JlYWR5XSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgIHZhciBfYiA9IF9fcmVhZChfYSwgMSksIGVudmlyb25tZW50VmFycyA9IF9iWzBdO1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdydW5uaW5nIG1haW4oKSBmdW5jdGlvbicpO1xuICAgICAgICB2YXIgcXVlcnlQYXJhbXMgPSB1cmwucGFyc2UoZG9jdW1lbnQuVVJMLCB0cnVlKS5xdWVyeTtcbiAgICAgICAgdmFyIGRlYnVnTW9kZSA9IHF1ZXJ5UGFyYW1zLmRlYnVnID09PSAndHJ1ZSc7XG4gICAgICAgIHZhciBldmVudFF1ZXVlID0gbmV3IGV2ZW50c18xLkV2ZW50UXVldWUoKTtcbiAgICAgICAgdmFyIHNlcnZlclJlcG8gPSBjcmVhdGVTZXJ2ZXJSZXBvKGV2ZW50UXVldWUsIHdpbmRvdy5sb2NhbFN0b3JhZ2UsIHBsYXRmb3JtLmhhc0RldmljZVN1cHBvcnQoKSwgcGxhdGZvcm0uZ2V0UGVyc2lzdGVudFNlcnZlckZhY3RvcnkoKSk7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IG5ldyBzZXR0aW5nc18xLlNldHRpbmdzKCk7XG4gICAgICAgIHZhciBhcHAgPSBuZXcgYXBwXzEuQXBwKGV2ZW50UXVldWUsIHNlcnZlclJlcG8sIGdldFJvb3RFbCgpLCBkZWJ1Z01vZGUsIHBsYXRmb3JtLmdldFVybEludGVyY2VwdG9yKCksIHBsYXRmb3JtLmdldENsaXBib2FyZCgpLCBwbGF0Zm9ybS5nZXRFcnJvclJlcG9ydGVyKGVudmlyb25tZW50VmFycyksIHNldHRpbmdzLCBlbnZpcm9ubWVudFZhcnMsIHBsYXRmb3JtLmdldFVwZGF0ZXIoKSwgcGxhdGZvcm0ucXVpdEFwcGxpY2F0aW9uKTtcbiAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBvblVuZXhwZWN0ZWRFcnJvcihlKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9KTtcbn1cbmV4cG9ydHMubWFpbiA9IG1haW47XG5mdW5jdGlvbiBvblVuZXhwZWN0ZWRFcnJvcihlcnJvcikge1xuICAgIHZhciByb290RWwgPSBnZXRSb290RWwoKTtcbiAgICBpZiAod2ViQ29tcG9uZW50c0FyZVJlYWR5ICYmIHJvb3RFbCAmJiByb290RWwubG9jYWxpemUpIHtcbiAgICAgICAgdmFyIGxvY2FsaXplID0gcm9vdEVsLmxvY2FsaXplLmJpbmQocm9vdEVsKTtcbiAgICAgICAgcm9vdEVsLnNob3dUb2FzdChsb2NhbGl6ZSgnZXJyb3ItdW5leHBlY3RlZCcpLCAxMjAwMDApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcgKGkuZS4gUG9seW1lciBmYWlsZWQgdG8gaW5pdGlhbGl6ZSkuIFByb3ZpZGUgc29tZSBtZXNzYWdpbmcgdG9cbiAgICAgICAgLy8gdGhlIHVzZXIsIGV2ZW4gaWYgd2UgYXJlIG5vdCBhYmxlIHRvIGRpc3BsYXkgaXQgaW4gYSB0b2FzdCBvciBsb2NhbGl6ZSBpdC5cbiAgICAgICAgLy8gVE9ETzogcHJvdmlkZSBhbiBoZWxwIGVtYWlsIG9uY2Ugd2UgaGF2ZSBhIGRvbWFpbi5cbiAgICAgICAgYWxlcnQoXCJBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkLlwiKTtcbiAgICB9XG4gICAgY29uc29sZS5lcnJvcihlcnJvcik7XG59XG4vLyBSZXR1cm5zIFBvbHltZXIncyBsb2NhbGl6YXRpb24gZnVuY3Rpb24uIE11c3QgYmUgY2FsbGVkIGFmdGVyIFdlYkNvbXBvbmVudHNSZWFkeSBoYXMgZmlyZWQuXG5mdW5jdGlvbiBnZXRMb2NhbGl6YXRpb25GdW5jdGlvbigpIHtcbiAgICB2YXIgcm9vdEVsID0gZ2V0Um9vdEVsKCk7XG4gICAgaWYgKCFyb290RWwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiByb290RWwubG9jYWxpemU7XG59XG5leHBvcnRzLmdldExvY2FsaXphdGlvbkZ1bmN0aW9uID0gZ2V0TG9jYWxpemF0aW9uRnVuY3Rpb247XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIENvcHlyaWdodCAyMDE4IFRoZSBPdXRsaW5lIEF1dGhvcnNcbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vdHlwZXMvYW1iaWVudC9vdXRsaW5lUGx1Z2luLmQudHMnLz5cbnZhciBlcnJvcnMgPSByZXF1aXJlKFwiLi4vbW9kZWwvZXJyb3JzXCIpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoXCIuLi9tb2RlbC9ldmVudHNcIik7XG52YXIgT3V0bGluZVNlcnZlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBPdXRsaW5lU2VydmVyKGlkLCBjb25maWcsIGNvbm5lY3Rpb24sIGV2ZW50UXVldWUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICAgICAgdGhpcy5ldmVudFF1ZXVlID0gZXZlbnRRdWV1ZTtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uLm9uU3RhdHVzQ2hhbmdlKGZ1bmN0aW9uIChzdGF0dXMpIHtcbiAgICAgICAgICAgIHZhciBzdGF0dXNFdmVudDtcbiAgICAgICAgICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwIC8qIENPTk5FQ1RFRCAqLzpcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzRXZlbnQgPSBuZXcgZXZlbnRzLlNlcnZlckNvbm5lY3RlZChfdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMSAvKiBESVNDT05ORUNURUQgKi86XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0V2ZW50ID0gbmV3IGV2ZW50cy5TZXJ2ZXJEaXNjb25uZWN0ZWQoX3RoaXMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDIgLyogUkVDT05ORUNUSU5HICovOlxuICAgICAgICAgICAgICAgICAgICBzdGF0dXNFdmVudCA9IG5ldyBldmVudHMuU2VydmVyUmVjb25uZWN0aW5nKF90aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiUmVjZWl2ZWQgdW5rbm93biBjb25uZWN0aW9uIHN0YXR1cyBcIiArIHN0YXR1cyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV2ZW50UXVldWUuZW5xdWV1ZShzdGF0dXNFdmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT3V0bGluZVNlcnZlci5wcm90b3R5cGUsIFwibmFtZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLm5hbWUgfHwgdGhpcy5jb25maWcuaG9zdCB8fCAnJztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAobmV3TmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWcubmFtZSA9IG5ld05hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPdXRsaW5lU2VydmVyLnByb3RvdHlwZSwgXCJob3N0XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuaG9zdDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT3V0bGluZVNlcnZlci5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbi5zdGFydCgpLmNhdGNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAvLyBTaW5jZSBcImluc3RhbmNlb2YgT3V0bGluZVBsdWdpbkVycm9yXCIgbWF5IG5vdCB3b3JrIGZvciBlcnJvcnMgb3JpZ2luYXRpbmcgZnJvbSBTZW50cnksXG4gICAgICAgICAgICAvLyBpbnNwZWN0IHRoaXMgZmllbGQgZGlyZWN0bHkuXG4gICAgICAgICAgICBpZiAoZS5lcnJvckNvZGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcnMuZnJvbUVycm9yQ29kZShlLmVycm9yQ29kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJuYXRpdmUgY29kZSBkaWQgbm90IHNldCBlcnJvckNvZGVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgT3V0bGluZVNlcnZlci5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbi5zdG9wKCkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IE5vbmUgb2YgdGhlIHBsdWdpbnMgY3VycmVudGx5IHJldHVybiBhbiBFcnJvckNvZGUgb24gZGlzY29ubmVjdGlvbi5cbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuUmVndWxhck5hdGl2ZUVycm9yKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgT3V0bGluZVNlcnZlci5wcm90b3R5cGUuY2hlY2tSdW5uaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uLmlzUnVubmluZygpO1xuICAgIH07XG4gICAgT3V0bGluZVNlcnZlci5wcm90b3R5cGUuY2hlY2tSZWFjaGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24uaXNSZWFjaGFibGUoKTtcbiAgICB9O1xuICAgIHJldHVybiBPdXRsaW5lU2VydmVyO1xufSgpKTtcbmV4cG9ydHMuT3V0bGluZVNlcnZlciA9IE91dGxpbmVTZXJ2ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIENvcHlyaWdodCAyMDE4IFRoZSBPdXRsaW5lIEF1dGhvcnNcbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxudmFyIF9fdmFsdWVzID0gKHRoaXMgJiYgdGhpcy5fX3ZhbHVlcykgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl0sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XG4gICAgICAgIH1cbiAgICB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciB1dWlkXzEgPSByZXF1aXJlKFwidXVpZFwiKTtcbnZhciBlcnJvcnNfMSA9IHJlcXVpcmUoXCIuLi9tb2RlbC9lcnJvcnNcIik7XG52YXIgZXZlbnRzID0gcmVxdWlyZShcIi4uL21vZGVsL2V2ZW50c1wiKTtcbi8vIE1haW50YWlucyBhIHBlcnNpc3RlZCBzZXQgb2Ygc2VydmVycyBhbmQgbGlhaXNlcyB3aXRoIHRoZSBjb3JlLlxudmFyIFBlcnNpc3RlbnRTZXJ2ZXJSZXBvc2l0b3J5ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBlcnNpc3RlbnRTZXJ2ZXJSZXBvc2l0b3J5KGNyZWF0ZVNlcnZlciwgZXZlbnRRdWV1ZSwgc3RvcmFnZSkge1xuICAgICAgICB0aGlzLmNyZWF0ZVNlcnZlciA9IGNyZWF0ZVNlcnZlcjtcbiAgICAgICAgdGhpcy5ldmVudFF1ZXVlID0gZXZlbnRRdWV1ZTtcbiAgICAgICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZTtcbiAgICAgICAgdGhpcy5sb2FkU2VydmVycygpO1xuICAgIH1cbiAgICBQZXJzaXN0ZW50U2VydmVyUmVwb3NpdG9yeS5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnNlcnZlckJ5SWQudmFsdWVzKCkpO1xuICAgIH07XG4gICAgUGVyc2lzdGVudFNlcnZlclJlcG9zaXRvcnkucHJvdG90eXBlLmdldEJ5SWQgPSBmdW5jdGlvbiAoc2VydmVySWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmVyQnlJZC5nZXQoc2VydmVySWQpO1xuICAgIH07XG4gICAgUGVyc2lzdGVudFNlcnZlclJlcG9zaXRvcnkucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChzZXJ2ZXJDb25maWcpIHtcbiAgICAgICAgdmFyIGFscmVhZHlBZGRlZFNlcnZlciA9IHRoaXMuc2VydmVyRnJvbUNvbmZpZyhzZXJ2ZXJDb25maWcpO1xuICAgICAgICBpZiAoYWxyZWFkeUFkZGVkU2VydmVyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzXzEuU2VydmVyQWxyZWFkeUFkZGVkKGFscmVhZHlBZGRlZFNlcnZlcik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNlcnZlciA9IHRoaXMuY3JlYXRlU2VydmVyKHV1aWRfMS52NCgpLCBzZXJ2ZXJDb25maWcsIHRoaXMuZXZlbnRRdWV1ZSk7XG4gICAgICAgIHRoaXMuc2VydmVyQnlJZC5zZXQoc2VydmVyLmlkLCBzZXJ2ZXIpO1xuICAgICAgICB0aGlzLnN0b3JlU2VydmVycygpO1xuICAgICAgICB0aGlzLmV2ZW50UXVldWUuZW5xdWV1ZShuZXcgZXZlbnRzLlNlcnZlckFkZGVkKHNlcnZlcikpO1xuICAgIH07XG4gICAgUGVyc2lzdGVudFNlcnZlclJlcG9zaXRvcnkucHJvdG90eXBlLnJlbmFtZSA9IGZ1bmN0aW9uIChzZXJ2ZXJJZCwgbmV3TmFtZSkge1xuICAgICAgICB2YXIgc2VydmVyID0gdGhpcy5zZXJ2ZXJCeUlkLmdldChzZXJ2ZXJJZCk7XG4gICAgICAgIGlmICghc2VydmVyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJDYW5ub3QgcmVuYW1lIG5vbmV4aXN0ZW50IHNlcnZlciBcIiArIHNlcnZlcklkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZXJ2ZXIubmFtZSA9IG5ld05hbWU7XG4gICAgICAgIHRoaXMuc3RvcmVTZXJ2ZXJzKCk7XG4gICAgICAgIHRoaXMuZXZlbnRRdWV1ZS5lbnF1ZXVlKG5ldyBldmVudHMuU2VydmVyUmVuYW1lZChzZXJ2ZXIpKTtcbiAgICB9O1xuICAgIFBlcnNpc3RlbnRTZXJ2ZXJSZXBvc2l0b3J5LnByb3RvdHlwZS5mb3JnZXQgPSBmdW5jdGlvbiAoc2VydmVySWQpIHtcbiAgICAgICAgdmFyIHNlcnZlciA9IHRoaXMuc2VydmVyQnlJZC5nZXQoc2VydmVySWQpO1xuICAgICAgICBpZiAoIXNlcnZlcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQ2Fubm90IHJlbW92ZSBub25leGlzdGVudCBzZXJ2ZXIgXCIgKyBzZXJ2ZXJJZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXJ2ZXJCeUlkLmRlbGV0ZShzZXJ2ZXJJZCk7XG4gICAgICAgIHRoaXMubGFzdEZvcmdvdHRlblNlcnZlciA9IHNlcnZlcjtcbiAgICAgICAgdGhpcy5zdG9yZVNlcnZlcnMoKTtcbiAgICAgICAgdGhpcy5ldmVudFF1ZXVlLmVucXVldWUobmV3IGV2ZW50cy5TZXJ2ZXJGb3Jnb3R0ZW4oc2VydmVyKSk7XG4gICAgfTtcbiAgICBQZXJzaXN0ZW50U2VydmVyUmVwb3NpdG9yeS5wcm90b3R5cGUudW5kb0ZvcmdldCA9IGZ1bmN0aW9uIChzZXJ2ZXJJZCkge1xuICAgICAgICBpZiAoIXRoaXMubGFzdEZvcmdvdHRlblNlcnZlcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBmb3Jnb3R0ZW4gc2VydmVyIHRvIHVuZm9yZ2V0Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5sYXN0Rm9yZ290dGVuU2VydmVyLmlkICE9PSBzZXJ2ZXJJZCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdpZCBvZiBmb3Jnb3R0ZW4gc2VydmVyJywgdGhpcy5sYXN0Rm9yZ290dGVuU2VydmVyLCAnZG9lcyBub3QgbWF0Y2gnLCBzZXJ2ZXJJZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXJ2ZXJCeUlkLnNldCh0aGlzLmxhc3RGb3Jnb3R0ZW5TZXJ2ZXIuaWQsIHRoaXMubGFzdEZvcmdvdHRlblNlcnZlcik7XG4gICAgICAgIHRoaXMuc3RvcmVTZXJ2ZXJzKCk7XG4gICAgICAgIHRoaXMuZXZlbnRRdWV1ZS5lbnF1ZXVlKG5ldyBldmVudHMuU2VydmVyRm9yZ2V0VW5kb25lKHRoaXMubGFzdEZvcmdvdHRlblNlcnZlcikpO1xuICAgICAgICB0aGlzLmxhc3RGb3Jnb3R0ZW5TZXJ2ZXIgPSBudWxsO1xuICAgIH07XG4gICAgUGVyc2lzdGVudFNlcnZlclJlcG9zaXRvcnkucHJvdG90eXBlLmNvbnRhaW5zU2VydmVyID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICByZXR1cm4gISF0aGlzLnNlcnZlckZyb21Db25maWcoY29uZmlnKTtcbiAgICB9O1xuICAgIFBlcnNpc3RlbnRTZXJ2ZXJSZXBvc2l0b3J5LnByb3RvdHlwZS5zZXJ2ZXJGcm9tQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZm9yICh2YXIgX2EgPSBfX3ZhbHVlcyh0aGlzLmdldEFsbCgpKSwgX2IgPSBfYS5uZXh0KCk7ICFfYi5kb25lOyBfYiA9IF9hLm5leHQoKSkge1xuICAgICAgICAgICAgICAgIHZhciBzZXJ2ZXIgPSBfYi52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnc01hdGNoKHNlcnZlci5jb25maWcsIGNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlcnZlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmIChfYiAmJiAhX2IuZG9uZSAmJiAoX2MgPSBfYS5yZXR1cm4pKSBfYy5jYWxsKF9hKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZV8xLCBfYztcbiAgICB9O1xuICAgIFBlcnNpc3RlbnRTZXJ2ZXJSZXBvc2l0b3J5LnByb3RvdHlwZS5zdG9yZVNlcnZlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb25maWdCeUlkID0ge307XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfYSA9IF9fdmFsdWVzKHRoaXMuc2VydmVyQnlJZC52YWx1ZXMoKSksIF9iID0gX2EubmV4dCgpOyAhX2IuZG9uZTsgX2IgPSBfYS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VydmVyID0gX2IudmFsdWU7XG4gICAgICAgICAgICAgICAgY29uZmlnQnlJZFtzZXJ2ZXIuaWRdID0gc2VydmVyLmNvbmZpZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKF9iICYmICFfYi5kb25lICYmIChfYyA9IF9hLnJldHVybikpIF9jLmNhbGwoX2EpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjsgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29uZmlnQnlJZCk7XG4gICAgICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKFBlcnNpc3RlbnRTZXJ2ZXJSZXBvc2l0b3J5LlNFUlZFUlNfU1RPUkFHRV9LRVksIGpzb24pO1xuICAgICAgICB2YXIgZV8yLCBfYztcbiAgICB9O1xuICAgIC8vIExvYWRzIHNlcnZlcnMgZnJvbSBzdG9yYWdlLFxuICAgIC8vIHJhaXNpbmcgYW4gZXJyb3IgaWYgdGhlcmUgaXMgYW55IHByb2JsZW0gbG9hZGluZy5cbiAgICBQZXJzaXN0ZW50U2VydmVyUmVwb3NpdG9yeS5wcm90b3R5cGUubG9hZFNlcnZlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2VydmVyQnlJZCA9IG5ldyBNYXAoKTtcbiAgICAgICAgdmFyIHNlcnZlcnNKc29uID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0oUGVyc2lzdGVudFNlcnZlclJlcG9zaXRvcnkuU0VSVkVSU19TVE9SQUdFX0tFWSk7XG4gICAgICAgIGlmICghc2VydmVyc0pzb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoXCJubyBzZXJ2ZXJzIGZvdW5kIGluIHN0b3JhZ2VcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvbmZpZ0J5SWQgPSB7fTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbmZpZ0J5SWQgPSBKU09OLnBhcnNlKHNlcnZlcnNKc29uKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY291bGQgbm90IHBhcnNlIHNhdmVkIHNlcnZlcnM6IFwiICsgZS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBzZXJ2ZXJJZCBpbiBjb25maWdCeUlkKSB7XG4gICAgICAgICAgICBpZiAoY29uZmlnQnlJZC5oYXNPd25Qcm9wZXJ0eShzZXJ2ZXJJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlnID0gY29uZmlnQnlJZFtzZXJ2ZXJJZF07XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlcnZlciA9IHRoaXMuY3JlYXRlU2VydmVyKHNlcnZlcklkLCBjb25maWcsIHRoaXMuZXZlbnRRdWV1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VydmVyQnlJZC5zZXQoc2VydmVySWQsIHNlcnZlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IHByb3BhZ2F0ZSBzbyBvdGhlciBzdG9yZWQgc2VydmVycyBjYW4gYmUgY3JlYXRlZC5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIE5hbWUgYnkgd2hpY2ggc2VydmVycyBhcmUgc2F2ZWQgdG8gc3RvcmFnZS5cbiAgICBQZXJzaXN0ZW50U2VydmVyUmVwb3NpdG9yeS5TRVJWRVJTX1NUT1JBR0VfS0VZID0gJ3NlcnZlcnMnO1xuICAgIHJldHVybiBQZXJzaXN0ZW50U2VydmVyUmVwb3NpdG9yeTtcbn0oKSk7XG5leHBvcnRzLlBlcnNpc3RlbnRTZXJ2ZXJSZXBvc2l0b3J5ID0gUGVyc2lzdGVudFNlcnZlclJlcG9zaXRvcnk7XG5mdW5jdGlvbiBjb25maWdzTWF0Y2gobGVmdCwgcmlnaHQpIHtcbiAgICByZXR1cm4gbGVmdC5ob3N0ID09PSByaWdodC5ob3N0ICYmIGxlZnQucG9ydCA9PT0gcmlnaHQucG9ydCAmJiBsZWZ0Lm1ldGhvZCA9PT0gcmlnaHQubWV0aG9kICYmXG4gICAgICAgIGxlZnQucGFzc3dvcmQgPT09IHJpZ2h0LnBhc3N3b3JkO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBDb3B5cmlnaHQgMjAxOCBUaGUgT3V0bGluZSBBdXRob3JzXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdLCBpID0gMDtcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xuICAgICAgICB9XG4gICAgfTtcbn07XG52YXIgX19yZWFkID0gKHRoaXMgJiYgdGhpcy5fX3JlYWQpIHx8IGZ1bmN0aW9uIChvLCBuKSB7XG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xuICAgIGlmICghbSkgcmV0dXJuIG87XG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XG4gICAgdHJ5IHtcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XG4gICAgfVxuICAgIHJldHVybiBhcjtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyBTZXR0aW5nIGtleXMgc3VwcG9ydGVkIGJ5IHRoZSBgU2V0dGluZ3NgIGNsYXNzLlxudmFyIFNldHRpbmdzS2V5O1xuKGZ1bmN0aW9uIChTZXR0aW5nc0tleSkge1xuICAgIFNldHRpbmdzS2V5W1wiVlBOX1dBUk5JTkdfRElTTUlTU0VEXCJdID0gXCJ2cG4td2FybmluZy1kaXNtaXNzZWRcIjtcbiAgICBTZXR0aW5nc0tleVtcIkFVVE9fQ09OTkVDVF9ESUFMT0dfRElTTUlTU0VEXCJdID0gXCJhdXRvLWNvbm5lY3QtZGlhbG9nLWRpc21pc3NlZFwiO1xuICAgIFNldHRpbmdzS2V5W1wiUFJJVkFDWV9BQ0tcIl0gPSBcInByaXZhY3ktYWNrXCI7XG59KShTZXR0aW5nc0tleSA9IGV4cG9ydHMuU2V0dGluZ3NLZXkgfHwgKGV4cG9ydHMuU2V0dGluZ3NLZXkgPSB7fSkpO1xuLy8gUGVyc2lzdGVudCBzdG9yYWdlIGZvciB1c2VyIHNldHRpbmdzIHRoYXQgc3VwcG9ydHMgYSBsaW1pdGVkIHNldCBvZiBrZXlzLlxudmFyIFNldHRpbmdzID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNldHRpbmdzKHN0b3JhZ2UsIHZhbGlkS2V5cykge1xuICAgICAgICBpZiAoc3RvcmFnZSA9PT0gdm9pZCAwKSB7IHN0b3JhZ2UgPSB3aW5kb3cubG9jYWxTdG9yYWdlOyB9XG4gICAgICAgIGlmICh2YWxpZEtleXMgPT09IHZvaWQgMCkgeyB2YWxpZEtleXMgPSBPYmplY3QudmFsdWVzKFNldHRpbmdzS2V5KTsgfVxuICAgICAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlO1xuICAgICAgICB0aGlzLnZhbGlkS2V5cyA9IHZhbGlkS2V5cztcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5sb2FkU2V0dGluZ3MoKTtcbiAgICB9XG4gICAgU2V0dGluZ3MucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ3MuZ2V0KGtleSk7XG4gICAgfTtcbiAgICBTZXR0aW5ncy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWRTZXR0aW5nKGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzZXQgaW52YWxpZCBrZXkgXCIgKyBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB0aGlzLnN0b3JlU2V0dGluZ3MoKTtcbiAgICB9O1xuICAgIFNldHRpbmdzLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuZGVsZXRlKGtleSk7XG4gICAgICAgIHRoaXMuc3RvcmVTZXR0aW5ncygpO1xuICAgIH07XG4gICAgU2V0dGluZ3MucHJvdG90eXBlLmlzVmFsaWRTZXR0aW5nID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWxpZEtleXMuaW5jbHVkZXMoa2V5KTtcbiAgICB9O1xuICAgIFNldHRpbmdzLnByb3RvdHlwZS5sb2FkU2V0dGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZXR0aW5nc0pzb24gPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbShTZXR0aW5ncy5TVE9SQUdFX0tFWSk7XG4gICAgICAgIGlmICghc2V0dGluZ3NKc29uKSB7XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKFwiTm8gc2V0dGluZ3MgZm91bmQgaW4gc3RvcmFnZVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RvcmFnZVNldHRpbmdzID0gSlNPTi5wYXJzZShzZXR0aW5nc0pzb24pO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc3RvcmFnZVNldHRpbmdzKSB7XG4gICAgICAgICAgICBpZiAoc3RvcmFnZVNldHRpbmdzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLnNldChrZXksIHN0b3JhZ2VTZXR0aW5nc1trZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgU2V0dGluZ3MucHJvdG90eXBlLnN0b3JlU2V0dGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdG9yYWdlU2V0dGluZ3MgPSB7fTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZvciAodmFyIF9hID0gX192YWx1ZXModGhpcy5zZXR0aW5ncyksIF9iID0gX2EubmV4dCgpOyAhX2IuZG9uZTsgX2IgPSBfYS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2MgPSBfX3JlYWQoX2IudmFsdWUsIDIpLCBrZXkgPSBfY1swXSwgdmFsdWUgPSBfY1sxXTtcbiAgICAgICAgICAgICAgICBzdG9yYWdlU2V0dGluZ3Nba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoX2IgJiYgIV9iLmRvbmUgJiYgKF9kID0gX2EucmV0dXJuKSkgX2QuY2FsbChfYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0b3JhZ2VTZXR0aW5nc0pzb24gPSBKU09OLnN0cmluZ2lmeShzdG9yYWdlU2V0dGluZ3MpO1xuICAgICAgICB0aGlzLnN0b3JhZ2Uuc2V0SXRlbShTZXR0aW5ncy5TVE9SQUdFX0tFWSwgc3RvcmFnZVNldHRpbmdzSnNvbik7XG4gICAgICAgIHZhciBlXzEsIF9kO1xuICAgIH07XG4gICAgU2V0dGluZ3MuU1RPUkFHRV9LRVkgPSAnc2V0dGluZ3MnO1xuICAgIHJldHVybiBTZXR0aW5ncztcbn0oKSk7XG5leHBvcnRzLlNldHRpbmdzID0gU2V0dGluZ3M7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIENvcHlyaWdodCAyMDE4IFRoZSBPdXRsaW5lIEF1dGhvcnNcbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIEFic3RyYWN0VXBkYXRlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBYnN0cmFjdFVwZGF0ZXIoKSB7XG4gICAgfVxuICAgIEFic3RyYWN0VXBkYXRlci5wcm90b3R5cGUuc2V0TGlzdGVuZXIgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICAgIH07XG4gICAgQWJzdHJhY3RVcGRhdGVyLnByb3RvdHlwZS5lbWl0RXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBBYnN0cmFjdFVwZGF0ZXI7XG59KCkpO1xuZXhwb3J0cy5BYnN0cmFjdFVwZGF0ZXIgPSBBYnN0cmFjdFVwZGF0ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIENvcHlyaWdodCAyMDE4IFRoZSBPdXRsaW5lIEF1dGhvcnNcbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX192YWx1ZXMgPSAodGhpcyAmJiB0aGlzLl9fdmFsdWVzKSB8fCBmdW5jdGlvbiAobykge1xuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXSwgaSA9IDA7XG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vLi4vdHlwZXMvYW1iaWVudC93ZWJpbnRlbnRzLmQudHMnLz5cbnZhciBVcmxJbnRlcmNlcHRvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBVcmxJbnRlcmNlcHRvcigpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgICB9XG4gICAgVXJsSW50ZXJjZXB0b3IucHJvdG90eXBlLnJlZ2lzdGVyTGlzdGVuZXIgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgICAgIGlmICh0aGlzLmxhdW5jaFVybCkge1xuICAgICAgICAgICAgbGlzdGVuZXIodGhpcy5sYXVuY2hVcmwpO1xuICAgICAgICAgICAgdGhpcy5sYXVuY2hVcmwgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFVybEludGVyY2VwdG9yLnByb3RvdHlwZS5leGVjdXRlTGlzdGVuZXJzID0gZnVuY3Rpb24gKHVybCkge1xuICAgICAgICBpZiAoIXVybCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbm8gbGlzdGVuZXJzIGhhdmUgYmVlbiBhZGRlZCwgZGVsYXlpbmcgaW50ZW50IGZpcmluZycpO1xuICAgICAgICAgICAgdGhpcy5sYXVuY2hVcmwgPSB1cmw7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZvciAodmFyIF9hID0gX192YWx1ZXModGhpcy5saXN0ZW5lcnMpLCBfYiA9IF9hLm5leHQoKTsgIV9iLmRvbmU7IF9iID0gX2EubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gX2IudmFsdWU7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIodXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKF9iICYmICFfYi5kb25lICYmIChfYyA9IF9hLnJldHVybikpIF9jLmNhbGwoX2EpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBlXzEsIF9jO1xuICAgIH07XG4gICAgcmV0dXJuIFVybEludGVyY2VwdG9yO1xufSgpKTtcbmV4cG9ydHMuVXJsSW50ZXJjZXB0b3IgPSBVcmxJbnRlcmNlcHRvcjtcbnZhciBBbmRyb2lkVXJsSW50ZXJjZXB0b3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEFuZHJvaWRVcmxJbnRlcmNlcHRvciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBBbmRyb2lkVXJsSW50ZXJjZXB0b3IoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIHdpbmRvdy53ZWJpbnRlbnQuZ2V0VXJpKGZ1bmN0aW9uIChsYXVuY2hVcmwpIHtcbiAgICAgICAgICAgIHdpbmRvdy53ZWJpbnRlbnQub25OZXdJbnRlbnQoX3RoaXMuZXhlY3V0ZUxpc3RlbmVycy5iaW5kKF90aGlzKSk7XG4gICAgICAgICAgICBfdGhpcy5leGVjdXRlTGlzdGVuZXJzKGxhdW5jaFVybCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIHJldHVybiBBbmRyb2lkVXJsSW50ZXJjZXB0b3I7XG59KFVybEludGVyY2VwdG9yKSk7XG5leHBvcnRzLkFuZHJvaWRVcmxJbnRlcmNlcHRvciA9IEFuZHJvaWRVcmxJbnRlcmNlcHRvcjtcbnZhciBBcHBsZVVybEludGVyY2VwdG9yID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhBcHBsZVVybEludGVyY2VwdG9yLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIEFwcGxlVXJsSW50ZXJjZXB0b3IobGF1bmNoVXJsKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIC8vIGNvcmRvdmEtW2lvc3xvc3hdIGNhbGwgYSBnbG9iYWwgZnVuY3Rpb24gd2l0aCB0aGlzIHNpZ25hdHVyZSB3aGVuIGEgVVJMIGlzIGludGVyY2VwdGVkLlxuICAgICAgICAvLyBXZSBkZWZpbmUgaXQgaW4gfGNvcmRvdmFfbWFpbnwsIHJlZGVmaW5lIGl0IHRvIHVzZSB0aGlzIGludGVyY2VwdG9yLlxuICAgICAgICB3aW5kb3cuaGFuZGxlT3BlblVSTCA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgICAgIF90aGlzLmV4ZWN1dGVMaXN0ZW5lcnModXJsKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGxhdW5jaFVybCkge1xuICAgICAgICAgICAgX3RoaXMuZXhlY3V0ZUxpc3RlbmVycyhsYXVuY2hVcmwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIEFwcGxlVXJsSW50ZXJjZXB0b3I7XG59KFVybEludGVyY2VwdG9yKSk7XG5leHBvcnRzLkFwcGxlVXJsSW50ZXJjZXB0b3IgPSBBcHBsZVVybEludGVyY2VwdG9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBDb3B5cmlnaHQgMjAxOCBUaGUgT3V0bGluZSBBdXRob3JzXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIE91dGxpbmVFcnJvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoT3V0bGluZUVycm9yLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIE91dGxpbmVFcnJvcihtZXNzYWdlKSB7XG4gICAgICAgIHZhciBfbmV3VGFyZ2V0ID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgdmFyIF90aGlzID0gXG4gICAgICAgIC8vIHJlZjpcbiAgICAgICAgLy8gaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svcmVsZWFzZS1ub3Rlcy90eXBlc2NyaXB0LTItMi5odG1sI3N1cHBvcnQtZm9yLW5ld3RhcmdldFxuICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCBtZXNzYWdlKSB8fCB0aGlzO1xuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoX3RoaXMsIF9uZXdUYXJnZXQucHJvdG90eXBlKTsgLy8gcmVzdG9yZSBwcm90b3R5cGUgY2hhaW5cbiAgICAgICAgX3RoaXMubmFtZSA9IF9uZXdUYXJnZXQubmFtZTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICByZXR1cm4gT3V0bGluZUVycm9yO1xufShFcnJvcikpO1xuZXhwb3J0cy5PdXRsaW5lRXJyb3IgPSBPdXRsaW5lRXJyb3I7XG52YXIgU2VydmVyQWxyZWFkeUFkZGVkID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTZXJ2ZXJBbHJlYWR5QWRkZWQsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU2VydmVyQWxyZWFkeUFkZGVkKHNlcnZlcikge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIFNlcnZlckFscmVhZHlBZGRlZDtcbn0oT3V0bGluZUVycm9yKSk7XG5leHBvcnRzLlNlcnZlckFscmVhZHlBZGRlZCA9IFNlcnZlckFscmVhZHlBZGRlZDtcbnZhciBTZXJ2ZXJJbmNvbXBhdGlibGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFNlcnZlckluY29tcGF0aWJsZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTZXJ2ZXJJbmNvbXBhdGlibGUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgbWVzc2FnZSkgfHwgdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIFNlcnZlckluY29tcGF0aWJsZTtcbn0oT3V0bGluZUVycm9yKSk7XG5leHBvcnRzLlNlcnZlckluY29tcGF0aWJsZSA9IFNlcnZlckluY29tcGF0aWJsZTtcbnZhciBTZXJ2ZXJVcmxJbnZhbGlkID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTZXJ2ZXJVcmxJbnZhbGlkLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFNlcnZlclVybEludmFsaWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgbWVzc2FnZSkgfHwgdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIFNlcnZlclVybEludmFsaWQ7XG59KE91dGxpbmVFcnJvcikpO1xuZXhwb3J0cy5TZXJ2ZXJVcmxJbnZhbGlkID0gU2VydmVyVXJsSW52YWxpZDtcbnZhciBPcGVyYXRpb25UaW1lZE91dCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoT3BlcmF0aW9uVGltZWRPdXQsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gT3BlcmF0aW9uVGltZWRPdXQodGltZW91dE1zLCBvcGVyYXRpb25OYW1lKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnRpbWVvdXRNcyA9IHRpbWVvdXRNcztcbiAgICAgICAgX3RoaXMub3BlcmF0aW9uTmFtZSA9IG9wZXJhdGlvbk5hbWU7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIE9wZXJhdGlvblRpbWVkT3V0O1xufShPdXRsaW5lRXJyb3IpKTtcbmV4cG9ydHMuT3BlcmF0aW9uVGltZWRPdXQgPSBPcGVyYXRpb25UaW1lZE91dDtcbnZhciBGZWVkYmFja1N1Ym1pc3Npb25FcnJvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoRmVlZGJhY2tTdWJtaXNzaW9uRXJyb3IsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gRmVlZGJhY2tTdWJtaXNzaW9uRXJyb3IoKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gRmVlZGJhY2tTdWJtaXNzaW9uRXJyb3I7XG59KE91dGxpbmVFcnJvcikpO1xuZXhwb3J0cy5GZWVkYmFja1N1Ym1pc3Npb25FcnJvciA9IEZlZWRiYWNrU3VibWlzc2lvbkVycm9yO1xuLy8gRXJyb3IgdGhyb3duIGJ5IFwibmF0aXZlXCIgY29kZS5cbi8vXG4vLyBNdXN0IGJlIGtlcHQgaW4gc3luYyB3aXRoIGl0cyBDb3Jkb3ZhIGRvcHBlbGdhbmdlcjpcbi8vICAgY29yZG92YS1wbHVnaW4tb3V0bGluZS9vdXRsaW5lUGx1Z2luLmpzXG4vL1xuLy8gVE9ETzogUmVuYW1lIHRoaXMgY2xhc3MsIFwicGx1Z2luXCIgaXMgYSBwb29yIG5hbWUgc2luY2UgdGhlIEVsZWN0cm9uIGFwcHMgZG8gbm90IGhhdmUgcGx1Z2lucy5cbnZhciBPdXRsaW5lUGx1Z2luRXJyb3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKE91dGxpbmVQbHVnaW5FcnJvciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBPdXRsaW5lUGx1Z2luRXJyb3IoZXJyb3JDb2RlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmVycm9yQ29kZSA9IGVycm9yQ29kZTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICByZXR1cm4gT3V0bGluZVBsdWdpbkVycm9yO1xufShPdXRsaW5lRXJyb3IpKTtcbmV4cG9ydHMuT3V0bGluZVBsdWdpbkVycm9yID0gT3V0bGluZVBsdWdpbkVycm9yO1xuLy8gTWFya2VyIGNsYXNzIGZvciBlcnJvcnMgb3JpZ2luYXRpbmcgaW4gbmF0aXZlIGNvZGUuXG4vLyBCaWZ1cmNhdGVzIGludG8gdHdvIHN1YmNsYXNzZXM6XG4vLyAgLSBcImV4cGVjdGVkXCIgZXJyb3JzIG9yaWdpbmF0aW5nIGluIG5hdGl2ZSBjb2RlLCBlLmcuIGluY29ycmVjdCBwYXNzd29yZFxuLy8gIC0gXCJ1bmV4cGVjdGVkXCIgZXJyb3JzIG9yaWdpbmF0aW5nIGluIG5hdGl2ZSBjb2RlLCBlLmcuIHVuaGFuZGxlZCByb3V0aW5nIHRhYmxlXG52YXIgTmF0aXZlRXJyb3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKE5hdGl2ZUVycm9yLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIE5hdGl2ZUVycm9yKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBOYXRpdmVFcnJvcjtcbn0oT3V0bGluZUVycm9yKSk7XG5leHBvcnRzLk5hdGl2ZUVycm9yID0gTmF0aXZlRXJyb3I7XG52YXIgUmVndWxhck5hdGl2ZUVycm9yID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhSZWd1bGFyTmF0aXZlRXJyb3IsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gUmVndWxhck5hdGl2ZUVycm9yKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBSZWd1bGFyTmF0aXZlRXJyb3I7XG59KE5hdGl2ZUVycm9yKSk7XG5leHBvcnRzLlJlZ3VsYXJOYXRpdmVFcnJvciA9IFJlZ3VsYXJOYXRpdmVFcnJvcjtcbnZhciBSZWRGbGFnTmF0aXZlRXJyb3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFJlZEZsYWdOYXRpdmVFcnJvciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBSZWRGbGFnTmF0aXZlRXJyb3IoKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIFJlZEZsYWdOYXRpdmVFcnJvcjtcbn0oTmF0aXZlRXJyb3IpKTtcbmV4cG9ydHMuUmVkRmxhZ05hdGl2ZUVycm9yID0gUmVkRmxhZ05hdGl2ZUVycm9yO1xuLy8vLy8vXG4vLyBcIkV4cGVjdGVkXCIgZXJyb3JzLlxuLy8vLy8vXG52YXIgVW5leHBlY3RlZFBsdWdpbkVycm9yID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhVbmV4cGVjdGVkUGx1Z2luRXJyb3IsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gVW5leHBlY3RlZFBsdWdpbkVycm9yKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBVbmV4cGVjdGVkUGx1Z2luRXJyb3I7XG59KFJlZ3VsYXJOYXRpdmVFcnJvcikpO1xuZXhwb3J0cy5VbmV4cGVjdGVkUGx1Z2luRXJyb3IgPSBVbmV4cGVjdGVkUGx1Z2luRXJyb3I7XG52YXIgVnBuUGVybWlzc2lvbk5vdEdyYW50ZWQgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFZwblBlcm1pc3Npb25Ob3RHcmFudGVkLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFZwblBlcm1pc3Npb25Ob3RHcmFudGVkKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBWcG5QZXJtaXNzaW9uTm90R3JhbnRlZDtcbn0oUmVndWxhck5hdGl2ZUVycm9yKSk7XG5leHBvcnRzLlZwblBlcm1pc3Npb25Ob3RHcmFudGVkID0gVnBuUGVybWlzc2lvbk5vdEdyYW50ZWQ7XG52YXIgSW52YWxpZFNlcnZlckNyZWRlbnRpYWxzID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhJbnZhbGlkU2VydmVyQ3JlZGVudGlhbHMsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gSW52YWxpZFNlcnZlckNyZWRlbnRpYWxzKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBJbnZhbGlkU2VydmVyQ3JlZGVudGlhbHM7XG59KFJlZ3VsYXJOYXRpdmVFcnJvcikpO1xuZXhwb3J0cy5JbnZhbGlkU2VydmVyQ3JlZGVudGlhbHMgPSBJbnZhbGlkU2VydmVyQ3JlZGVudGlhbHM7XG52YXIgUmVtb3RlVWRwRm9yd2FyZGluZ0Rpc2FibGVkID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhSZW1vdGVVZHBGb3J3YXJkaW5nRGlzYWJsZWQsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gUmVtb3RlVWRwRm9yd2FyZGluZ0Rpc2FibGVkKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBSZW1vdGVVZHBGb3J3YXJkaW5nRGlzYWJsZWQ7XG59KFJlZ3VsYXJOYXRpdmVFcnJvcikpO1xuZXhwb3J0cy5SZW1vdGVVZHBGb3J3YXJkaW5nRGlzYWJsZWQgPSBSZW1vdGVVZHBGb3J3YXJkaW5nRGlzYWJsZWQ7XG52YXIgU2VydmVyVW5yZWFjaGFibGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFNlcnZlclVucmVhY2hhYmxlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFNlcnZlclVucmVhY2hhYmxlKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBTZXJ2ZXJVbnJlYWNoYWJsZTtcbn0oUmVndWxhck5hdGl2ZUVycm9yKSk7XG5leHBvcnRzLlNlcnZlclVucmVhY2hhYmxlID0gU2VydmVyVW5yZWFjaGFibGU7XG52YXIgSWxsZWdhbFNlcnZlckNvbmZpZ3VyYXRpb24gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKElsbGVnYWxTZXJ2ZXJDb25maWd1cmF0aW9uLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIElsbGVnYWxTZXJ2ZXJDb25maWd1cmF0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBJbGxlZ2FsU2VydmVyQ29uZmlndXJhdGlvbjtcbn0oUmVndWxhck5hdGl2ZUVycm9yKSk7XG5leHBvcnRzLklsbGVnYWxTZXJ2ZXJDb25maWd1cmF0aW9uID0gSWxsZWdhbFNlcnZlckNvbmZpZ3VyYXRpb247XG52YXIgTm9BZG1pblBlcm1pc3Npb25zID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhOb0FkbWluUGVybWlzc2lvbnMsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gTm9BZG1pblBlcm1pc3Npb25zKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBOb0FkbWluUGVybWlzc2lvbnM7XG59KFJlZ3VsYXJOYXRpdmVFcnJvcikpO1xuZXhwb3J0cy5Ob0FkbWluUGVybWlzc2lvbnMgPSBOb0FkbWluUGVybWlzc2lvbnM7XG52YXIgU3lzdGVtQ29uZmlndXJhdGlvbkV4Y2VwdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU3lzdGVtQ29uZmlndXJhdGlvbkV4Y2VwdGlvbiwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTeXN0ZW1Db25maWd1cmF0aW9uRXhjZXB0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBTeXN0ZW1Db25maWd1cmF0aW9uRXhjZXB0aW9uO1xufShSZWd1bGFyTmF0aXZlRXJyb3IpKTtcbmV4cG9ydHMuU3lzdGVtQ29uZmlndXJhdGlvbkV4Y2VwdGlvbiA9IFN5c3RlbUNvbmZpZ3VyYXRpb25FeGNlcHRpb247XG4vLy8vLy9cbi8vIE5vdywgXCJ1bmV4cGVjdGVkXCIgZXJyb3JzLlxuLy8gVXNlIHRoZXNlIHNwYXJpbmdseSBiZWFjYXVzZSBlYWNoIG9jY3VycmVuY2UgdHJpZ2dlcnMgYSBTZW50cnkgcmVwb3J0LlxuLy8vLy8vXG4vLyBXaW5kb3dzLlxudmFyIFNoYWRvd3NvY2tzU3RhcnRGYWlsdXJlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTaGFkb3dzb2Nrc1N0YXJ0RmFpbHVyZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTaGFkb3dzb2Nrc1N0YXJ0RmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gU2hhZG93c29ja3NTdGFydEZhaWx1cmU7XG59KFJlZEZsYWdOYXRpdmVFcnJvcikpO1xuZXhwb3J0cy5TaGFkb3dzb2Nrc1N0YXJ0RmFpbHVyZSA9IFNoYWRvd3NvY2tzU3RhcnRGYWlsdXJlO1xudmFyIENvbmZpZ3VyZVN5c3RlbVByb3h5RmFpbHVyZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoQ29uZmlndXJlU3lzdGVtUHJveHlGYWlsdXJlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIENvbmZpZ3VyZVN5c3RlbVByb3h5RmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gQ29uZmlndXJlU3lzdGVtUHJveHlGYWlsdXJlO1xufShSZWRGbGFnTmF0aXZlRXJyb3IpKTtcbmV4cG9ydHMuQ29uZmlndXJlU3lzdGVtUHJveHlGYWlsdXJlID0gQ29uZmlndXJlU3lzdGVtUHJveHlGYWlsdXJlO1xudmFyIFVuc3VwcG9ydGVkUm91dGluZ1RhYmxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhVbnN1cHBvcnRlZFJvdXRpbmdUYWJsZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBVbnN1cHBvcnRlZFJvdXRpbmdUYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gVW5zdXBwb3J0ZWRSb3V0aW5nVGFibGU7XG59KFJlZEZsYWdOYXRpdmVFcnJvcikpO1xuZXhwb3J0cy5VbnN1cHBvcnRlZFJvdXRpbmdUYWJsZSA9IFVuc3VwcG9ydGVkUm91dGluZ1RhYmxlO1xuLy8gVXNlZCBvbiBBbmRyb2lkIGFuZCBBcHBsZSB0byBpbmRpY2F0ZSB0aGF0IHRoZSBwbHVnaW4gZmFpbGVkIHRvIGVzdGFibGlzaCB0aGUgVlBOIHR1bm5lbC5cbnZhciBWcG5TdGFydEZhaWx1cmUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFZwblN0YXJ0RmFpbHVyZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBWcG5TdGFydEZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIFZwblN0YXJ0RmFpbHVyZTtcbn0oUmVkRmxhZ05hdGl2ZUVycm9yKSk7XG5leHBvcnRzLlZwblN0YXJ0RmFpbHVyZSA9IFZwblN0YXJ0RmFpbHVyZTtcbi8vIENvbnZlcnRzIGFuIEVycm9yQ29kZSAtIG9yaWdpbmF0aW5nIGluIFwibmF0aXZlXCIgY29kZSAtIHRvIGFuIGluc3RhbmNlIG9mIHRoZSByZWxldmFudFxuLy8gT3V0bGluZUVycm9yIHN1YmNsYXNzLlxuLy8gVGhyb3dzIGlmIHRoZSBlcnJvciBjb2RlIGlzIG5vdCBvbmUgZGVmaW5lZCBpbiBFcnJvckNvZGUgb3IgaXMgRXJyb3JDb2RlLk5PX0VSUk9SLlxuZnVuY3Rpb24gZnJvbUVycm9yQ29kZShlcnJvckNvZGUpIHtcbiAgICBzd2l0Y2ggKGVycm9yQ29kZSkge1xuICAgICAgICBjYXNlIDEgLyogVU5FWFBFQ1RFRCAqLzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVW5leHBlY3RlZFBsdWdpbkVycm9yKCk7XG4gICAgICAgIGNhc2UgMiAvKiBWUE5fUEVSTUlTU0lPTl9OT1RfR1JBTlRFRCAqLzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVnBuUGVybWlzc2lvbk5vdEdyYW50ZWQoKTtcbiAgICAgICAgY2FzZSAzIC8qIElOVkFMSURfU0VSVkVSX0NSRURFTlRJQUxTICovOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnZhbGlkU2VydmVyQ3JlZGVudGlhbHMoKTtcbiAgICAgICAgY2FzZSA0IC8qIFVEUF9SRUxBWV9OT1RfRU5BQkxFRCAqLzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVtb3RlVWRwRm9yd2FyZGluZ0Rpc2FibGVkKCk7XG4gICAgICAgIGNhc2UgNSAvKiBTRVJWRVJfVU5SRUFDSEFCTEUgKi86XG4gICAgICAgICAgICByZXR1cm4gbmV3IFNlcnZlclVucmVhY2hhYmxlKCk7XG4gICAgICAgIGNhc2UgNiAvKiBWUE5fU1RBUlRfRkFJTFVSRSAqLzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVnBuU3RhcnRGYWlsdXJlKCk7XG4gICAgICAgIGNhc2UgNyAvKiBJTExFR0FMX1NFUlZFUl9DT05GSUdVUkFUSU9OICovOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBJbGxlZ2FsU2VydmVyQ29uZmlndXJhdGlvbigpO1xuICAgICAgICBjYXNlIDggLyogU0hBRE9XU09DS1NfU1RBUlRfRkFJTFVSRSAqLzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgU2hhZG93c29ja3NTdGFydEZhaWx1cmUoKTtcbiAgICAgICAgY2FzZSA5IC8qIENPTkZJR1VSRV9TWVNURU1fUFJPWFlfRkFJTFVSRSAqLzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29uZmlndXJlU3lzdGVtUHJveHlGYWlsdXJlKCk7XG4gICAgICAgIGNhc2UgMTAgLyogTk9fQURNSU5fUEVSTUlTU0lPTlMgKi86XG4gICAgICAgICAgICByZXR1cm4gbmV3IE5vQWRtaW5QZXJtaXNzaW9ucygpO1xuICAgICAgICBjYXNlIDExIC8qIFVOU1VQUE9SVEVEX1JPVVRJTkdfVEFCTEUgKi86XG4gICAgICAgICAgICByZXR1cm4gbmV3IFVuc3VwcG9ydGVkUm91dGluZ1RhYmxlKCk7XG4gICAgICAgIGNhc2UgMTIgLyogU1lTVEVNX01JU0NPTkZJR1VSRUQgKi86XG4gICAgICAgICAgICByZXR1cm4gbmV3IFN5c3RlbUNvbmZpZ3VyYXRpb25FeGNlcHRpb24oKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInVua25vd24gRXJyb3JDb2RlIFwiICsgZXJyb3JDb2RlKTtcbiAgICB9XG59XG5leHBvcnRzLmZyb21FcnJvckNvZGUgPSBmcm9tRXJyb3JDb2RlO1xuLy8gQ29udmVydHMgYSBOYXRpdmVFcnJvciB0byBhbiBFcnJvckNvZGUuXG4vLyBUaHJvd3MgaWYgdGhlIGVycm9yIGlzIG5vdCBhIHN1YmNsYXNzIG9mIE5hdGl2ZUVycm9yLlxuZnVuY3Rpb24gdG9FcnJvckNvZGUoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgVW5leHBlY3RlZFBsdWdpbkVycm9yKSB7XG4gICAgICAgIHJldHVybiAxIC8qIFVORVhQRUNURUQgKi87XG4gICAgfVxuICAgIGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBWcG5QZXJtaXNzaW9uTm90R3JhbnRlZCkge1xuICAgICAgICByZXR1cm4gMiAvKiBWUE5fUEVSTUlTU0lPTl9OT1RfR1JBTlRFRCAqLztcbiAgICB9XG4gICAgZWxzZSBpZiAoZSBpbnN0YW5jZW9mIEludmFsaWRTZXJ2ZXJDcmVkZW50aWFscykge1xuICAgICAgICByZXR1cm4gMyAvKiBJTlZBTElEX1NFUlZFUl9DUkVERU5USUFMUyAqLztcbiAgICB9XG4gICAgZWxzZSBpZiAoZSBpbnN0YW5jZW9mIFJlbW90ZVVkcEZvcndhcmRpbmdEaXNhYmxlZCkge1xuICAgICAgICByZXR1cm4gNCAvKiBVRFBfUkVMQVlfTk9UX0VOQUJMRUQgKi87XG4gICAgfVxuICAgIGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBTZXJ2ZXJVbnJlYWNoYWJsZSkge1xuICAgICAgICByZXR1cm4gNSAvKiBTRVJWRVJfVU5SRUFDSEFCTEUgKi87XG4gICAgfVxuICAgIGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBWcG5TdGFydEZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIDYgLyogVlBOX1NUQVJUX0ZBSUxVUkUgKi87XG4gICAgfVxuICAgIGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBJbGxlZ2FsU2VydmVyQ29uZmlndXJhdGlvbikge1xuICAgICAgICByZXR1cm4gNyAvKiBJTExFR0FMX1NFUlZFUl9DT05GSUdVUkFUSU9OICovO1xuICAgIH1cbiAgICBlbHNlIGlmIChlIGluc3RhbmNlb2YgU2hhZG93c29ja3NTdGFydEZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIDggLyogU0hBRE9XU09DS1NfU1RBUlRfRkFJTFVSRSAqLztcbiAgICB9XG4gICAgZWxzZSBpZiAoZSBpbnN0YW5jZW9mIENvbmZpZ3VyZVN5c3RlbVByb3h5RmFpbHVyZSkge1xuICAgICAgICByZXR1cm4gOSAvKiBDT05GSUdVUkVfU1lTVEVNX1BST1hZX0ZBSUxVUkUgKi87XG4gICAgfVxuICAgIGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBVbnN1cHBvcnRlZFJvdXRpbmdUYWJsZSkge1xuICAgICAgICByZXR1cm4gMTEgLyogVU5TVVBQT1JURURfUk9VVElOR19UQUJMRSAqLztcbiAgICB9XG4gICAgZWxzZSBpZiAoZSBpbnN0YW5jZW9mIE5vQWRtaW5QZXJtaXNzaW9ucykge1xuICAgICAgICByZXR1cm4gMTAgLyogTk9fQURNSU5fUEVSTUlTU0lPTlMgKi87XG4gICAgfVxuICAgIGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBTeXN0ZW1Db25maWd1cmF0aW9uRXhjZXB0aW9uKSB7XG4gICAgICAgIHJldHVybiAxMiAvKiBTWVNURU1fTUlTQ09ORklHVVJFRCAqLztcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBOYXRpdmVFcnJvciBcIiArIGUubmFtZSk7XG59XG5leHBvcnRzLnRvRXJyb3JDb2RlID0gdG9FcnJvckNvZGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIENvcHlyaWdodCAyMDE4IFRoZSBPdXRsaW5lIEF1dGhvcnNcbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxudmFyIF9fdmFsdWVzID0gKHRoaXMgJiYgdGhpcy5fX3ZhbHVlcykgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl0sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XG4gICAgICAgIH1cbiAgICB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBTZXJ2ZXJBZGRlZCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTZXJ2ZXJBZGRlZChzZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgfVxuICAgIHJldHVybiBTZXJ2ZXJBZGRlZDtcbn0oKSk7XG5leHBvcnRzLlNlcnZlckFkZGVkID0gU2VydmVyQWRkZWQ7XG52YXIgU2VydmVyQWxyZWFkeUFkZGVkID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNlcnZlckFscmVhZHlBZGRlZChzZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgfVxuICAgIHJldHVybiBTZXJ2ZXJBbHJlYWR5QWRkZWQ7XG59KCkpO1xuZXhwb3J0cy5TZXJ2ZXJBbHJlYWR5QWRkZWQgPSBTZXJ2ZXJBbHJlYWR5QWRkZWQ7XG52YXIgU2VydmVyRm9yZ290dGVuID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNlcnZlckZvcmdvdHRlbihzZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgfVxuICAgIHJldHVybiBTZXJ2ZXJGb3Jnb3R0ZW47XG59KCkpO1xuZXhwb3J0cy5TZXJ2ZXJGb3Jnb3R0ZW4gPSBTZXJ2ZXJGb3Jnb3R0ZW47XG52YXIgU2VydmVyRm9yZ2V0VW5kb25lID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNlcnZlckZvcmdldFVuZG9uZShzZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgfVxuICAgIHJldHVybiBTZXJ2ZXJGb3JnZXRVbmRvbmU7XG59KCkpO1xuZXhwb3J0cy5TZXJ2ZXJGb3JnZXRVbmRvbmUgPSBTZXJ2ZXJGb3JnZXRVbmRvbmU7XG52YXIgU2VydmVyUmVuYW1lZCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTZXJ2ZXJSZW5hbWVkKHNlcnZlcikge1xuICAgICAgICB0aGlzLnNlcnZlciA9IHNlcnZlcjtcbiAgICB9XG4gICAgcmV0dXJuIFNlcnZlclJlbmFtZWQ7XG59KCkpO1xuZXhwb3J0cy5TZXJ2ZXJSZW5hbWVkID0gU2VydmVyUmVuYW1lZDtcbnZhciBTZXJ2ZXJVcmxJbnZhbGlkID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNlcnZlclVybEludmFsaWQoc2VydmVyVXJsKSB7XG4gICAgICAgIHRoaXMuc2VydmVyVXJsID0gc2VydmVyVXJsO1xuICAgIH1cbiAgICByZXR1cm4gU2VydmVyVXJsSW52YWxpZDtcbn0oKSk7XG5leHBvcnRzLlNlcnZlclVybEludmFsaWQgPSBTZXJ2ZXJVcmxJbnZhbGlkO1xudmFyIFNlcnZlckNvbm5lY3RlZCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTZXJ2ZXJDb25uZWN0ZWQoc2VydmVyKSB7XG4gICAgICAgIHRoaXMuc2VydmVyID0gc2VydmVyO1xuICAgIH1cbiAgICByZXR1cm4gU2VydmVyQ29ubmVjdGVkO1xufSgpKTtcbmV4cG9ydHMuU2VydmVyQ29ubmVjdGVkID0gU2VydmVyQ29ubmVjdGVkO1xudmFyIFNlcnZlckRpc2Nvbm5lY3RlZCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTZXJ2ZXJEaXNjb25uZWN0ZWQoc2VydmVyKSB7XG4gICAgICAgIHRoaXMuc2VydmVyID0gc2VydmVyO1xuICAgIH1cbiAgICByZXR1cm4gU2VydmVyRGlzY29ubmVjdGVkO1xufSgpKTtcbmV4cG9ydHMuU2VydmVyRGlzY29ubmVjdGVkID0gU2VydmVyRGlzY29ubmVjdGVkO1xudmFyIFNlcnZlclJlY29ubmVjdGluZyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTZXJ2ZXJSZWNvbm5lY3Rpbmcoc2VydmVyKSB7XG4gICAgICAgIHRoaXMuc2VydmVyID0gc2VydmVyO1xuICAgIH1cbiAgICByZXR1cm4gU2VydmVyUmVjb25uZWN0aW5nO1xufSgpKTtcbmV4cG9ydHMuU2VydmVyUmVjb25uZWN0aW5nID0gU2VydmVyUmVjb25uZWN0aW5nO1xuLy8gU2ltcGxlIHB1Ymxpc2hlci1zdWJzY3JpYmVyIHF1ZXVlLlxudmFyIEV2ZW50UXVldWUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRXZlbnRRdWV1ZSgpIHtcbiAgICAgICAgdGhpcy5xdWV1ZWRFdmVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNCeUV2ZW50VHlwZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5pc1N0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1B1Ymxpc2hpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgRXZlbnRRdWV1ZS5wcm90b3R5cGUuc3RhcnRQdWJsaXNoaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmlzU3RhcnRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVibGlzaFF1ZXVlZEV2ZW50cygpO1xuICAgIH07XG4gICAgLy8gUmVnaXN0ZXJzIGEgbGlzdGVuZXIgZm9yIGV2ZW50cyBvZiB0aGUgdHlwZSBvZiB0aGUgZ2l2ZW4gY29uc3RydWN0b3IuXG4gICAgRXZlbnRRdWV1ZS5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gKGV2ZW50VHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzQnlFdmVudFR5cGUuZ2V0KGV2ZW50VHlwZSk7XG4gICAgICAgIGlmICghbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzQnlFdmVudFR5cGUuc2V0KGV2ZW50VHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgICAgfVxuICAgICAgICBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgfTtcbiAgICAvLyBFbnF1ZXVlcyB0aGUgZ2l2ZW4gZXZlbnQgZm9yIHB1Ymxpc2hpbmcgYW5kIHB1Ymxpc2hlcyBhbGwgcXVldWVkIGV2ZW50cyBpZlxuICAgIC8vIHB1Ymxpc2hpbmcgaXMgbm90IGFscmVhZHkgaGFwcGVuaW5nLlxuICAgIC8vXG4gICAgLy8gVGhlIGVucXVldWUgbWV0aG9kIGlzIHJlZW50cmFudDogaXQgbWF5IGJlIGNhbGxlZCBieSBhbiBldmVudCBsaXN0ZW5lclxuICAgIC8vIGR1cmluZyB0aGUgcHVibGlzaGluZyBvZiB0aGUgZXZlbnRzLiBJbiB0aGF0IGNhc2UgdGhlIG1ldGhvZCBhZGRzIHRoZSBldmVudFxuICAgIC8vIHRvIHRoZSBlbmQgb2YgdGhlIHF1ZXVlIGFuZCByZXR1cm5zIGltbWVkaWF0ZWx5LlxuICAgIC8vXG4gICAgLy8gVGhpcyBndWFyYW50ZWVzIHRoYXQgZXZlbnRzIGFyZSBwdWJsaXNoZWQgYW5kIGhhbmRsZWQgaW4gdGhlIG9yZGVyIHRoYXRcbiAgICAvLyB0aGV5IGFyZSBxdWV1ZWQuXG4gICAgLy9cbiAgICAvLyBUaGVyZSdzIG5vIGd1YXJhbnRlZSB0aGF0IHRoZSBzdWJzY3JpYmVycyBmb3IgdGhlIGV2ZW50IGhhdmUgYmVlbiBjYWxsZWQgYnlcbiAgICAvLyB0aGUgdGltZSB0aGlzIGZ1bmN0aW9uIHJldHVybnMuXG4gICAgRXZlbnRRdWV1ZS5wcm90b3R5cGUuZW5xdWV1ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB0aGlzLnF1ZXVlZEV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgaWYgKHRoaXMuaXNTdGFydGVkKSB7XG4gICAgICAgICAgICB0aGlzLnB1Ymxpc2hRdWV1ZWRFdmVudHMoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gVHJpZ2dlcnMgdGhlIHN1YnNjcmliZXJzIGZvciBhbGwgdGhlIGVucXVldWVkIGV2ZW50cy5cbiAgICBFdmVudFF1ZXVlLnByb3RvdHlwZS5wdWJsaXNoUXVldWVkRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5pc1B1Ymxpc2hpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMuaXNQdWJsaXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgd2hpbGUgKHRoaXMucXVldWVkRXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBldmVudF8xID0gdGhpcy5xdWV1ZWRFdmVudHMuc2hpZnQoKTtcbiAgICAgICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc0J5RXZlbnRUeXBlLmdldChldmVudF8xLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgICAgIGlmICghbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdEcm9wcGluZyBldmVudCB3aXRoIG5vIGxpc3RlbmVyczonLCBldmVudF8xKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbGlzdGVuZXJzXzEgPSBfX3ZhbHVlcyhsaXN0ZW5lcnMpLCBsaXN0ZW5lcnNfMV8xID0gbGlzdGVuZXJzXzEubmV4dCgpOyAhbGlzdGVuZXJzXzFfMS5kb25lOyBsaXN0ZW5lcnNfMV8xID0gbGlzdGVuZXJzXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyKGV2ZW50XzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGlzdGVuZXJzXzFfMSAmJiAhbGlzdGVuZXJzXzFfMS5kb25lICYmIChfYSA9IGxpc3RlbmVyc18xLnJldHVybikpIF9hLmNhbGwobGlzdGVuZXJzXzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc1B1Ymxpc2hpbmcgPSBmYWxzZTtcbiAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgfTtcbiAgICByZXR1cm4gRXZlbnRRdWV1ZTtcbn0oKSk7XG5leHBvcnRzLkV2ZW50UXVldWUgPSBFdmVudFF1ZXVlO1xuIl19
