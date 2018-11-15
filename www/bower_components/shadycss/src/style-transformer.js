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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // eslint-disable-line no-unused-vars


var _cssParse = require('./css-parse.js');

var _styleUtil = require('./style-util.js');

var StyleUtil = _interopRequireWildcard(_styleUtil);

var _styleSettings = require('./style-settings.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Transforms ShadowDOM styling into ShadyDOM styling

* scoping:

  * elements in scope get scoping selector class="x-foo-scope"
  * selectors re-written as follows:

    div button -> div.x-foo-scope button.x-foo-scope

* :host -> scopeName

* :host(...) -> scopeName...

* ::slotted(...) -> scopeName > ...

* ...:dir(ltr|rtl) -> [dir="ltr|rtl"] ..., ...[dir="ltr|rtl"]

* :host(:dir[rtl]) -> scopeName:dir(rtl) -> [dir="rtl"] scopeName, scopeName[dir="rtl"]

*/
var SCOPE_NAME = 'style-scope';

var StyleTransformer = function () {
  function StyleTransformer() {
    _classCallCheck(this, StyleTransformer);
  }

  _createClass(StyleTransformer, [{
    key: 'dom',

    /**
     * Given a node and scope name, add a scoping class to each node
     * in the tree. This facilitates transforming css into scoped rules.
     * @param {!Node} node
     * @param {string} scope
     * @param {boolean=} shouldRemoveScope
     * @deprecated
     */
    value: function dom(node, scope, shouldRemoveScope) {
      var _this = this;

      var fn = function fn(node) {
        _this.element(node, scope || '', shouldRemoveScope);
      };
      this._transformDom(node, fn);
    }

    /**
     * Given a node and scope name, add a scoping class to each node in the tree.
     * @param {!Node} node
     * @param {string} scope
     */

  }, {
    key: 'domAddScope',
    value: function domAddScope(node, scope) {
      var _this2 = this;

      var fn = function fn(node) {
        _this2.element(node, scope || '');
      };
      this._transformDom(node, fn);
    }

    /**
     * @param {!Node} startNode
     * @param {!function(!Node)} transformer
     */

  }, {
    key: '_transformDom',
    value: function _transformDom(startNode, transformer) {
      if (startNode.nodeType === Node.ELEMENT_NODE) {
        transformer(startNode);
      }
      var c$ = startNode.localName === 'template' ?
      // In case the template is in svg context, fall back to the node
      // since it won't be an HTMLTemplateElement with a .content property
      (startNode.content || startNode._content || startNode).childNodes : startNode.children || startNode.childNodes;
      if (c$) {
        for (var i = 0; i < c$.length; i++) {
          this._transformDom(c$[i], transformer);
        }
      }
    }

    /**
     * @param {?} element
     * @param {?} scope
     * @param {?=} shouldRemoveScope
     */

  }, {
    key: 'element',
    value: function element(_element, scope, shouldRemoveScope) {
      // note: if using classes, we add both the general 'style-scope' class
      // as well as the specific scope. This enables easy filtering of all
      // `style-scope` elements
      if (scope) {
        // note: svg on IE does not have classList so fallback to class
        if (_element.classList) {
          if (shouldRemoveScope) {
            _element.classList.remove(SCOPE_NAME);
            _element.classList.remove(scope);
          } else {
            _element.classList.add(SCOPE_NAME);
            _element.classList.add(scope);
          }
        } else if (_element.getAttribute) {
          var c = _element.getAttribute(CLASS);
          if (shouldRemoveScope) {
            if (c) {
              var newValue = c.replace(SCOPE_NAME, '').replace(scope, '');
              StyleUtil.setElementClassRaw(_element, newValue);
            }
          } else {
            var _newValue = (c ? c + ' ' : '') + SCOPE_NAME + ' ' + scope;
            StyleUtil.setElementClassRaw(_element, _newValue);
          }
        }
      }
    }

    /**
     * Given a node, replace the scoping class to each subnode in the tree.
     * @param {!Node} node
     * @param {string} oldScope
     * @param {string} newScope
     */

  }, {
    key: 'domReplaceScope',
    value: function domReplaceScope(node, oldScope, newScope) {
      var _this3 = this;

      var fn = function fn(node) {
        _this3.element(node, oldScope, true);
        _this3.element(node, newScope);
      };
      this._transformDom(node, fn);
    }
    /**
     * Given a node, remove the scoping class to each subnode in the tree.
     * @param {!Node} node
     * @param {string} oldScope
     */

  }, {
    key: 'domRemoveScope',
    value: function domRemoveScope(node, oldScope) {
      var _this4 = this;

      var fn = function fn(node) {
        _this4.element(node, oldScope || '', true);
      };
      this._transformDom(node, fn);
    }

    /**
     * @param {?} element
     * @param {?} styleRules
     * @param {?=} callback
     * @param {string=} cssBuild
     */

  }, {
    key: 'elementStyles',
    value: function elementStyles(element, styleRules, callback) {
      var cssBuild = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

      // no need to shim selectors if settings.useNativeShadow, also
      // a shady css build will already have transformed selectors
      // NOTE: This method may be called as part of static or property shimming.
      // When there is a targeted build it will not be called for static shimming,
      // but when the property shim is used it is called and should opt out of
      // static shimming work when a proper build exists.
      var cssText = '';
      if (_styleSettings.nativeShadow || cssBuild === 'shady') {
        cssText = StyleUtil.toCssText(styleRules, callback);
      } else {
        var _StyleUtil$getIsExten = StyleUtil.getIsExtends(element),
            is = _StyleUtil$getIsExten.is,
            typeExtension = _StyleUtil$getIsExten.typeExtension;

        cssText = this.css(styleRules, is, typeExtension, callback) + '\n\n';
      }
      return cssText.trim();
    }

    // Given a string of cssText and a scoping string (scope), returns
    // a string of scoped css where each selector is transformed to include
    // a class created from the scope. ShadowDOM selectors are also transformed
    // (e.g. :host) to use the scoping selector.

  }, {
    key: 'css',
    value: function css(rules, scope, ext, callback) {
      var hostScope = this._calcHostScope(scope, ext);
      scope = this._calcElementScope(scope);
      var self = this;
      return StyleUtil.toCssText(rules, function ( /** StyleNode */rule) {
        if (!rule.isScoped) {
          self.rule(rule, scope, hostScope);
          rule.isScoped = true;
        }
        if (callback) {
          callback(rule, scope, hostScope);
        }
      });
    }
  }, {
    key: '_calcElementScope',
    value: function _calcElementScope(scope) {
      if (scope) {
        return CSS_CLASS_PREFIX + scope;
      } else {
        return '';
      }
    }
  }, {
    key: '_calcHostScope',
    value: function _calcHostScope(scope, ext) {
      return ext ? '[is=' + scope + ']' : scope;
    }
  }, {
    key: 'rule',
    value: function rule(_rule, scope, hostScope) {
      this._transformRule(_rule, this._transformComplexSelector, scope, hostScope);
    }

    /**
     * transforms a css rule to a scoped rule.
     *
     * @param {StyleNode} rule
     * @param {Function} transformer
     * @param {string=} scope
     * @param {string=} hostScope
     */

  }, {
    key: '_transformRule',
    value: function _transformRule(rule, transformer, scope, hostScope) {
      // NOTE: save transformedSelector for subsequent matching of elements
      // against selectors (e.g. when calculating style properties)
      rule['selector'] = rule.transformedSelector = this._transformRuleCss(rule, transformer, scope, hostScope);
    }

    /**
     * @param {StyleNode} rule
     * @param {Function} transformer
     * @param {string=} scope
     * @param {string=} hostScope
     */

  }, {
    key: '_transformRuleCss',
    value: function _transformRuleCss(rule, transformer, scope, hostScope) {
      var p$ = StyleUtil.splitSelectorList(rule['selector']);
      // we want to skip transformation of rules that appear in keyframes,
      // because they are keyframe selectors, not element selectors.
      if (!StyleUtil.isKeyframesSelector(rule)) {
        for (var i = 0, l = p$.length, p; i < l && (p = p$[i]); i++) {
          p$[i] = transformer.call(this, p, scope, hostScope);
        }
      }
      return p$.filter(function (part) {
        return Boolean(part);
      }).join(COMPLEX_SELECTOR_SEP);
    }

    /**
     * @param {string} selector
     * @return {string}
     */

  }, {
    key: '_twiddleNthPlus',
    value: function _twiddleNthPlus(selector) {
      return selector.replace(NTH, function (m, type, inside) {
        if (inside.indexOf('+') > -1) {
          inside = inside.replace(/\+/g, '___');
        } else if (inside.indexOf('___') > -1) {
          inside = inside.replace(/___/g, '+');
        }
        return ':' + type + '(' + inside + ')';
      });
    }

    /**
     * Preserve `:matches()` selectors by replacing them with MATCHES_REPLACMENT
     * and returning an array of `:matches()` selectors.
     * Use `_replacesMatchesPseudo` to replace the `:matches()` parts
     *
     * @param {string} selector
     * @return {{selector: string, matches: !Array<string>}}
     */

  }, {
    key: '_preserveMatchesPseudo',
    value: function _preserveMatchesPseudo(selector) {
      /** @type {!Array<string>} */
      var matches = [];
      var match = void 0;
      while (match = selector.match(MATCHES)) {
        var start = match.index;
        var end = StyleUtil.findMatchingParen(selector, start);
        if (end === -1) {
          throw new Error(match.input + ' selector missing \')\'');
        }
        var part = selector.slice(start, end + 1);
        selector = selector.replace(part, MATCHES_REPLACEMENT);
        matches.push(part);
      }
      return { selector: selector, matches: matches };
    }

    /**
     * Replace MATCHES_REPLACMENT character with the given set of `:matches()`
     * selectors.
     *
     * @param {string} selector
     * @param {!Array<string>} matches
     * @return {string}
     */

  }, {
    key: '_replaceMatchesPseudo',
    value: function _replaceMatchesPseudo(selector, matches) {
      var parts = selector.split(MATCHES_REPLACEMENT);
      return matches.reduce(function (acc, cur, idx) {
        return acc + cur + parts[idx + 1];
      }, parts[0]);
    }

    /**
     * @param {string} selector
     * @param {string} scope
     * @param {string=} hostScope
     */

  }, {
    key: '_transformComplexSelector',
    value: function _transformComplexSelector(selector, scope, hostScope) {
      var _this5 = this;

      var stop = false;
      selector = selector.trim();
      // Remove spaces inside of selectors like `:nth-of-type` because it confuses SIMPLE_SELECTOR_SEP
      var isNth = NTH.test(selector);
      if (isNth) {
        selector = selector.replace(NTH, function (m, type, inner) {
          return ':' + type + '(' + inner.replace(/\s/g, '') + ')';
        });
        selector = this._twiddleNthPlus(selector);
      }
      // Preserve selectors like `:-webkit-any` so that SIMPLE_SELECTOR_SEP does
      // not get confused by spaces inside the pseudo selector
      var isMatches = MATCHES.test(selector);
      /** @type {!Array<string>} */
      var matches = void 0;
      if (isMatches) {
        var _preserveMatchesPseud = this._preserveMatchesPseudo(selector);

        selector = _preserveMatchesPseud.selector;
        matches = _preserveMatchesPseud.matches;
      }
      selector = selector.replace(SLOTTED_START, HOST + ' $1');
      selector = selector.replace(SIMPLE_SELECTOR_SEP, function (m, c, s) {
        if (!stop) {
          var info = _this5._transformCompoundSelector(s, c, scope, hostScope);
          stop = stop || info.stop;
          c = info.combinator;
          s = info.value;
        }
        return c + s;
      });
      // replace `:matches()` selectors
      if (isMatches) {
        selector = this._replaceMatchesPseudo(selector, matches);
      }
      if (isNth) {
        selector = this._twiddleNthPlus(selector);
      }
      return selector;
    }
  }, {
    key: '_transformCompoundSelector',
    value: function _transformCompoundSelector(selector, combinator, scope, hostScope) {
      // replace :host with host scoping class
      var slottedIndex = selector.indexOf(SLOTTED);
      if (selector.indexOf(HOST) >= 0) {
        selector = this._transformHostSelector(selector, hostScope);
        // replace other selectors with scoping class
      } else if (slottedIndex !== 0) {
        selector = scope ? this._transformSimpleSelector(selector, scope) : selector;
      }
      // mark ::slotted() scope jump to replace with descendant selector + arg
      // also ignore left-side combinator
      var slotted = false;
      if (slottedIndex >= 0) {
        combinator = '';
        slotted = true;
      }
      // process scope jumping selectors up to the scope jump and then stop
      var stop = void 0;
      if (slotted) {
        stop = true;
        if (slotted) {
          // .zonk ::slotted(.foo) -> .zonk.scope > .foo
          selector = selector.replace(SLOTTED_PAREN, function (m, paren) {
            return ' > ' + paren;
          });
        }
      }
      selector = selector.replace(DIR_PAREN, function (m, before, dir) {
        return '[dir="' + dir + '"] ' + before + ', ' + before + '[dir="' + dir + '"]';
      });
      return { value: selector, combinator: combinator, stop: stop };
    }
  }, {
    key: '_transformSimpleSelector',
    value: function _transformSimpleSelector(selector, scope) {
      var p$ = selector.split(PSEUDO_PREFIX);
      p$[0] += scope;
      return p$.join(PSEUDO_PREFIX);
    }

    // :host(...) -> scopeName...

  }, {
    key: '_transformHostSelector',
    value: function _transformHostSelector(selector, hostScope) {
      var m = selector.match(HOST_PAREN);
      var paren = m && m[2].trim() || '';
      if (paren) {
        if (!paren[0].match(SIMPLE_SELECTOR_PREFIX)) {
          // paren starts with a type selector
          var typeSelector = paren.split(SIMPLE_SELECTOR_PREFIX)[0];
          // if the type selector is our hostScope then avoid pre-pending it
          if (typeSelector === hostScope) {
            return paren;
            // otherwise, this selector should not match in this scope so
            // output a bogus selector.
          } else {
            return SELECTOR_NO_MATCH;
          }
        } else {
          // make sure to do a replace here to catch selectors like:
          // `:host(.foo)::before`
          return selector.replace(HOST_PAREN, function (m, host, paren) {
            return hostScope + paren;
          });
        }
        // if no paren, do a straight :host replacement.
        // TODO(sorvell): this should not strictly be necessary but
        // it's needed to maintain support for `:host[foo]` type selectors
        // which have been improperly used under Shady DOM. This should be
        // deprecated.
      } else {
        return selector.replace(HOST, hostScope);
      }
    }

    /**
     * @param {StyleNode} rule
     */

  }, {
    key: 'documentRule',
    value: function documentRule(rule) {
      // reset selector in case this is redone.
      rule['selector'] = rule['parsedSelector'];
      this.normalizeRootSelector(rule);
      this._transformRule(rule, this._transformDocumentSelector);
    }

    /**
     * @param {StyleNode} rule
     */

  }, {
    key: 'normalizeRootSelector',
    value: function normalizeRootSelector(rule) {
      if (rule['selector'] === ROOT) {
        rule['selector'] = 'html';
      }
    }

    /**
     * @param {string} selector
     */

  }, {
    key: '_transformDocumentSelector',
    value: function _transformDocumentSelector(selector) {
      if (selector.match(HOST)) {
        // remove ':host' type selectors in document rules
        return '';
      } else if (selector.match(SLOTTED)) {
        return this._transformComplexSelector(selector, SCOPE_DOC_SELECTOR);
      } else {
        return this._transformSimpleSelector(selector.trim(), SCOPE_DOC_SELECTOR);
      }
    }
  }, {
    key: 'SCOPE_NAME',
    get: function get() {
      return SCOPE_NAME;
    }
  }]);

  return StyleTransformer;
}();

var NTH = /:(nth[-\w]+)\(([^)]+)\)/;
var SCOPE_DOC_SELECTOR = ':not(.' + SCOPE_NAME + ')';
var COMPLEX_SELECTOR_SEP = ',';
var SIMPLE_SELECTOR_SEP = /(^|[\s>+~]+)((?:\[.+?\]|[^\s>+~=[])+)/g;
var SIMPLE_SELECTOR_PREFIX = /[[.:#*]/;
var HOST = ':host';
var ROOT = ':root';
var SLOTTED = '::slotted';
var SLOTTED_START = new RegExp('^(' + SLOTTED + ')');
// NOTE: this supports 1 nested () pair for things like
// :host(:not([selected]), more general support requires
// parsing which seems like overkill
var HOST_PAREN = /(:host)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/;
// similar to HOST_PAREN
var SLOTTED_PAREN = /(?:::slotted)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/;
var DIR_PAREN = /(.*):dir\((?:(ltr|rtl))\)/;
var CSS_CLASS_PREFIX = '.';
var PSEUDO_PREFIX = ':';
var CLASS = 'class';
var SELECTOR_NO_MATCH = 'should_not_match';
var MATCHES = /:(?:matches|any|-(?:webkit|moz)-any)/;
var MATCHES_REPLACEMENT = '\uE000';

exports.default = new StyleTransformer();