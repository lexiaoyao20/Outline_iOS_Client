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

var _cssParse = require('./css-parse.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// eslint-disable-line no-unused-vars

/** @const {string} */
var infoKey = '__styleInfo';

var StyleInfo = function () {
  _createClass(StyleInfo, null, [{
    key: 'get',

    /**
     * @param {Element} node
     * @return {StyleInfo}
     */
    value: function get(node) {
      if (node) {
        return node[infoKey];
      } else {
        return null;
      }
    }
    /**
     * @param {!Element} node
     * @param {StyleInfo} styleInfo
     * @return {StyleInfo}
     */

  }, {
    key: 'set',
    value: function set(node, styleInfo) {
      node[infoKey] = styleInfo;
      return styleInfo;
    }
    /**
     * @param {StyleNode} ast
     * @param {Node=} placeholder
     * @param {Array<string>=} ownStylePropertyNames
     * @param {string=} elementName
     * @param {string=} typeExtension
     * @param {string=} cssBuild
     */

  }]);

  function StyleInfo(ast, placeholder, ownStylePropertyNames, elementName, typeExtension, cssBuild) {
    _classCallCheck(this, StyleInfo);

    /** @type {StyleNode} */
    this.styleRules = ast || null;
    /** @type {Node} */
    this.placeholder = placeholder || null;
    /** @type {!Array<string>} */
    this.ownStylePropertyNames = ownStylePropertyNames || [];
    /** @type {Array<Object>} */
    this.overrideStyleProperties = null;
    /** @type {string} */
    this.elementName = elementName || '';
    /** @type {string} */
    this.cssBuild = cssBuild || '';
    /** @type {string} */
    this.typeExtension = typeExtension || '';
    /** @type {Object<string, string>} */
    this.styleProperties = null;
    /** @type {?string} */
    this.scopeSelector = null;
    /** @type {HTMLStyleElement} */
    this.customStyle = null;
  }

  _createClass(StyleInfo, [{
    key: '_getStyleRules',
    value: function _getStyleRules() {
      return this.styleRules;
    }
  }]);

  return StyleInfo;
}();

exports.default = StyleInfo;


StyleInfo.prototype['_getStyleRules'] = StyleInfo.prototype._getStyleRules;