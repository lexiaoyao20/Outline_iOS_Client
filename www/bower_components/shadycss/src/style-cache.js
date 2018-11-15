/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StyleCache = function () {
  function StyleCache() {
    var typeMax = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    _classCallCheck(this, StyleCache);

    // map element name -> [{properties, styleElement, scopeSelector}]
    this.cache = {};
    this.typeMax = typeMax;
  }

  _createClass(StyleCache, [{
    key: '_validate',
    value: function _validate(cacheEntry, properties, ownPropertyNames) {
      for (var idx = 0; idx < ownPropertyNames.length; idx++) {
        var pn = ownPropertyNames[idx];
        if (cacheEntry.properties[pn] !== properties[pn]) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: 'store',
    value: function store(tagname, properties, styleElement, scopeSelector) {
      var list = this.cache[tagname] || [];
      list.push({ properties: properties, styleElement: styleElement, scopeSelector: scopeSelector });
      if (list.length > this.typeMax) {
        list.shift();
      }
      this.cache[tagname] = list;
    }
  }, {
    key: 'fetch',
    value: function fetch(tagname, properties, ownPropertyNames) {
      var list = this.cache[tagname];
      if (!list) {
        return;
      }
      // reverse list for most-recent lookups
      for (var idx = list.length - 1; idx >= 0; idx--) {
        var entry = list[idx];
        if (this._validate(entry, properties, ownPropertyNames)) {
          return entry;
        }
      }
    }
  }]);

  return StyleCache;
}();

exports.default = StyleCache;