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

var _styleSettings = require('./style-settings.js');

var _styleTransformer = require('./style-transformer.js');

var _styleTransformer2 = _interopRequireDefault(_styleTransformer);

var _styleUtil = require('./style-util.js');

var StyleUtil = _interopRequireWildcard(_styleUtil);

var _commonRegex = require('./common-regex.js');

var RX = _interopRequireWildcard(_commonRegex);

var _styleInfo = require('./style-info.js');

var _styleInfo2 = _interopRequireDefault(_styleInfo);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: dedupe with shady
/**
 * @param {string} selector
 * @return {boolean}
 * @this {Element}
 */
var matchesSelector = function matchesSelector(selector) {
  var method = this.matches || this.matchesSelector || this.mozMatchesSelector || this.msMatchesSelector || this.oMatchesSelector || this.webkitMatchesSelector;
  return method && method.call(this, selector);
};

var IS_IE = navigator.userAgent.match('Trident');

var XSCOPE_NAME = 'x-scope';

var StyleProperties = function () {
  function StyleProperties() {
    _classCallCheck(this, StyleProperties);
  }

  _createClass(StyleProperties, [{
    key: 'decorateStyles',

    /**
     * decorates styles with rule info and returns an array of used style property names
     *
     * @param {StyleNode} rules
     * @return {Array<string>}
     */
    value: function decorateStyles(rules) {
      var self = this,
          props = {},
          keyframes = [],
          ruleIndex = 0;
      StyleUtil.forEachRule(rules, function (rule) {
        self.decorateRule(rule);
        // mark in-order position of ast rule in styles block, used for cache key
        rule.index = ruleIndex++;
        self.collectPropertiesInCssText(rule.propertyInfo.cssText, props);
      }, function onKeyframesRule(rule) {
        keyframes.push(rule);
      });
      // Cache all found keyframes rules for later reference:
      rules._keyframes = keyframes;
      // return this list of property names *consumes* in these styles.
      var names = [];
      for (var i in props) {
        names.push(i);
      }
      return names;
    }

    // decorate a single rule with property info

  }, {
    key: 'decorateRule',
    value: function decorateRule(rule) {
      if (rule.propertyInfo) {
        return rule.propertyInfo;
      }
      var info = {},
          properties = {};
      var hasProperties = this.collectProperties(rule, properties);
      if (hasProperties) {
        info.properties = properties;
        // TODO(sorvell): workaround parser seeing mixins as additional rules
        rule['rules'] = null;
      }
      info.cssText = this.collectCssText(rule);
      rule.propertyInfo = info;
      return info;
    }

    // collects the custom properties from a rule's cssText

  }, {
    key: 'collectProperties',
    value: function collectProperties(rule, properties) {
      var info = rule.propertyInfo;
      if (info) {
        if (info.properties) {
          Object.assign(properties, info.properties);
          return true;
        }
      } else {
        var m = void 0,
            rx = RX.VAR_ASSIGN;
        var cssText = rule['parsedCssText'];
        var value = void 0;
        var any = void 0;
        while (m = rx.exec(cssText)) {
          // note: group 2 is var, 3 is mixin
          value = (m[2] || m[3]).trim();
          // value of 'inherit' or 'unset' is equivalent to not setting the property here
          if (value !== 'inherit' || value !== 'unset') {
            properties[m[1].trim()] = value;
          }
          any = true;
        }
        return any;
      }
    }

    // returns cssText of properties that consume variables/mixins

  }, {
    key: 'collectCssText',
    value: function collectCssText(rule) {
      return this.collectConsumingCssText(rule['parsedCssText']);
    }

    // NOTE: we support consumption inside mixin assignment
    // but not production, so strip out {...}

  }, {
    key: 'collectConsumingCssText',
    value: function collectConsumingCssText(cssText) {
      return cssText.replace(RX.BRACKETED, '').replace(RX.VAR_ASSIGN, '');
    }
  }, {
    key: 'collectPropertiesInCssText',
    value: function collectPropertiesInCssText(cssText, props) {
      var m = void 0;
      while (m = RX.VAR_CONSUMED.exec(cssText)) {
        var name = m[1];
        // This regex catches all variable names, and following non-whitespace char
        // If next char is not ':', then variable is a consumer
        if (m[2] !== ':') {
          props[name] = true;
        }
      }
    }

    // turns custom properties into realized values.

  }, {
    key: 'reify',
    value: function reify(props) {
      // big perf optimization here: reify only *own* properties
      // since this object has __proto__ of the element's scope properties
      var names = Object.getOwnPropertyNames(props);
      for (var i = 0, n; i < names.length; i++) {
        n = names[i];
        props[n] = this.valueForProperty(props[n], props);
      }
    }

    // given a property value, returns the reified value
    // a property value may be:
    // (1) a literal value like: red or 5px;
    // (2) a variable value like: var(--a), var(--a, red), or var(--a, --b) or
    // var(--a, var(--b));
    // (3) a literal mixin value like { properties }. Each of these properties
    // can have values that are: (a) literal, (b) variables, (c) @apply mixins.

  }, {
    key: 'valueForProperty',
    value: function valueForProperty(property, props) {
      // case (1) default
      // case (3) defines a mixin and we have to reify the internals
      if (property) {
        if (property.indexOf(';') >= 0) {
          property = this.valueForProperties(property, props);
        } else {
          // case (2) variable
          var self = this;
          var fn = function fn(prefix, value, fallback, suffix) {
            if (!value) {
              return prefix + suffix;
            }
            var propertyValue = self.valueForProperty(props[value], props);
            // if value is "initial", then the variable should be treated as unset
            if (!propertyValue || propertyValue === 'initial') {
              // fallback may be --a or var(--a) or literal
              propertyValue = self.valueForProperty(props[fallback] || fallback, props) || fallback;
            } else if (propertyValue === 'apply-shim-inherit') {
              // CSS build will replace `inherit` with `apply-shim-inherit`
              // for use with native css variables.
              // Since we have full control, we can use `inherit` directly.
              propertyValue = 'inherit';
            }
            return prefix + (propertyValue || '') + suffix;
          };
          property = StyleUtil.processVariableAndFallback(property, fn);
        }
      }
      return property && property.trim() || '';
    }

    // note: we do not yet support mixin within mixin

  }, {
    key: 'valueForProperties',
    value: function valueForProperties(property, props) {
      var parts = property.split(';');
      for (var i = 0, p, m; i < parts.length; i++) {
        if (p = parts[i]) {
          RX.MIXIN_MATCH.lastIndex = 0;
          m = RX.MIXIN_MATCH.exec(p);
          if (m) {
            p = this.valueForProperty(props[m[1]], props);
          } else {
            var colon = p.indexOf(':');
            if (colon !== -1) {
              var pp = p.substring(colon);
              pp = pp.trim();
              pp = this.valueForProperty(pp, props) || pp;
              p = p.substring(0, colon) + pp;
            }
          }
          parts[i] = p && p.lastIndexOf(';') === p.length - 1 ?
          // strip trailing ;
          p.slice(0, -1) : p || '';
        }
      }
      return parts.join(';');
    }
  }, {
    key: 'applyProperties',
    value: function applyProperties(rule, props) {
      var output = '';
      // dynamically added sheets may not be decorated so ensure they are.
      if (!rule.propertyInfo) {
        this.decorateRule(rule);
      }
      if (rule.propertyInfo.cssText) {
        output = this.valueForProperties(rule.propertyInfo.cssText, props);
      }
      rule['cssText'] = output;
    }

    // Apply keyframe transformations to the cssText of a given rule. The
    // keyframeTransforms object is a map of keyframe names to transformer
    // functions which take in cssText and spit out transformed cssText.

  }, {
    key: 'applyKeyframeTransforms',
    value: function applyKeyframeTransforms(rule, keyframeTransforms) {
      var input = rule['cssText'];
      var output = rule['cssText'];
      if (rule.hasAnimations == null) {
        // Cache whether or not the rule has any animations to begin with:
        rule.hasAnimations = RX.ANIMATION_MATCH.test(input);
      }
      // If there are no animations referenced, we can skip transforms:
      if (rule.hasAnimations) {
        var transform = void 0;
        // If we haven't transformed this rule before, we iterate over all
        // transforms:
        if (rule.keyframeNamesToTransform == null) {
          rule.keyframeNamesToTransform = [];
          for (var keyframe in keyframeTransforms) {
            transform = keyframeTransforms[keyframe];
            output = transform(input);
            // If the transform actually changed the CSS text, we cache the
            // transform name for future use:
            if (input !== output) {
              input = output;
              rule.keyframeNamesToTransform.push(keyframe);
            }
          }
        } else {
          // If we already have a list of keyframe names that apply to this
          // rule, we apply only those keyframe name transforms:
          for (var i = 0; i < rule.keyframeNamesToTransform.length; ++i) {
            transform = keyframeTransforms[rule.keyframeNamesToTransform[i]];
            input = transform(input);
          }
          output = input;
        }
      }
      rule['cssText'] = output;
    }

    // Test if the rules in these styles matches the given `element` and if so,
    // collect any custom properties into `props`.
    /**
     * @param {StyleNode} rules
     * @param {Element} element
     */

  }, {
    key: 'propertyDataFromStyles',
    value: function propertyDataFromStyles(rules, element) {
      var _this = this;

      var props = {};
      // generates a unique key for these matches
      var o = [];
      // note: active rules excludes non-matching @media rules
      StyleUtil.forEachRule(rules, function (rule) {
        // TODO(sorvell): we could trim the set of rules at declaration
        // time to only include ones that have properties
        if (!rule.propertyInfo) {
          _this.decorateRule(rule);
        }
        // match element against transformedSelector: selector may contain
        // unwanted uniquification and parsedSelector does not directly match
        // for :host selectors.
        var selectorToMatch = rule.transformedSelector || rule['parsedSelector'];
        if (element && rule.propertyInfo.properties && selectorToMatch) {
          if (matchesSelector.call(element, selectorToMatch)) {
            _this.collectProperties(rule, props);
            // produce numeric key for these matches for lookup
            addToBitMask(rule.index, o);
          }
        }
      }, null, true);
      return { properties: props, key: o };
    }

    /**
     * @param {Element} scope
     * @param {StyleNode} rule
     * @param {string} cssBuild
     * @param {function(Object)} callback
     */

  }, {
    key: 'whenHostOrRootRule',
    value: function whenHostOrRootRule(scope, rule, cssBuild, callback) {
      if (!rule.propertyInfo) {
        this.decorateRule(rule);
      }
      if (!rule.propertyInfo.properties) {
        return;
      }

      var _StyleUtil$getIsExten = StyleUtil.getIsExtends(scope),
          is = _StyleUtil$getIsExten.is,
          typeExtension = _StyleUtil$getIsExten.typeExtension;

      var hostScope = is ? _styleTransformer2.default._calcHostScope(is, typeExtension) : 'html';
      var parsedSelector = rule['parsedSelector'];
      var isRoot = parsedSelector === ':host > *' || parsedSelector === 'html';
      var isHost = parsedSelector.indexOf(':host') === 0 && !isRoot;
      // build info is either in scope (when scope is an element) or in the style
      // when scope is the default scope; note: this allows default scope to have
      // mixed mode built and unbuilt styles.
      if (cssBuild === 'shady') {
        // :root -> x-foo > *.x-foo for elements and html for custom-style
        isRoot = parsedSelector === hostScope + ' > *.' + hostScope || parsedSelector.indexOf('html') !== -1;
        // :host -> x-foo for elements, but sub-rules have .x-foo in them
        isHost = !isRoot && parsedSelector.indexOf(hostScope) === 0;
      }
      if (!isRoot && !isHost) {
        return;
      }
      var selectorToMatch = hostScope;
      if (isHost) {
        // need to transform :host because `:host` does not work with `matches`
        if (!rule.transformedSelector) {
          // transform :host into a matchable selector
          rule.transformedSelector = _styleTransformer2.default._transformRuleCss(rule, _styleTransformer2.default._transformComplexSelector, _styleTransformer2.default._calcElementScope(is), hostScope);
        }
        selectorToMatch = rule.transformedSelector || hostScope;
      }
      callback({
        selector: selectorToMatch,
        isHost: isHost,
        isRoot: isRoot
      });
    }
    /**
     * @param {Element} scope
     * @param {StyleNode} rules
     * @param {string} cssBuild
     * @return {Object}
     */

  }, {
    key: 'hostAndRootPropertiesForScope',
    value: function hostAndRootPropertiesForScope(scope, rules, cssBuild) {
      var _this2 = this;

      var hostProps = {},
          rootProps = {};
      // note: active rules excludes non-matching @media rules
      StyleUtil.forEachRule(rules, function (rule) {
        // if scope is StyleDefaults, use _element for matchesSelector
        _this2.whenHostOrRootRule(scope, rule, cssBuild, function (info) {
          var element = scope._element || scope;
          if (matchesSelector.call(element, info.selector)) {
            if (info.isHost) {
              _this2.collectProperties(rule, hostProps);
            } else {
              _this2.collectProperties(rule, rootProps);
            }
          }
        });
      }, null, true);
      return { rootProps: rootProps, hostProps: hostProps };
    }

    /**
     * @param {Element} element
     * @param {Object} properties
     * @param {string} scopeSelector
     */

  }, {
    key: 'transformStyles',
    value: function transformStyles(element, properties, scopeSelector) {
      var self = this;

      var _StyleUtil$getIsExten2 = StyleUtil.getIsExtends(element),
          is = _StyleUtil$getIsExten2.is,
          typeExtension = _StyleUtil$getIsExten2.typeExtension;

      var hostSelector = _styleTransformer2.default._calcHostScope(is, typeExtension);
      var rxHostSelector = element.extends ? '\\' + hostSelector.slice(0, -1) + '\\]' : hostSelector;
      var hostRx = new RegExp(RX.HOST_PREFIX + rxHostSelector + RX.HOST_SUFFIX);

      var _StyleInfo$get = _styleInfo2.default.get(element),
          rules = _StyleInfo$get.styleRules,
          cssBuild = _StyleInfo$get.cssBuild;

      var keyframeTransforms = this._elementKeyframeTransforms(element, rules, scopeSelector);
      return _styleTransformer2.default.elementStyles(element, rules, function (rule) {
        self.applyProperties(rule, properties);
        if (!_styleSettings.nativeShadow && !StyleUtil.isKeyframesSelector(rule) && rule['cssText']) {
          // NOTE: keyframe transforms only scope munge animation names, so it
          // is not necessary to apply them in ShadowDOM.
          self.applyKeyframeTransforms(rule, keyframeTransforms);
          self._scopeSelector(rule, hostRx, hostSelector, scopeSelector);
        }
      }, cssBuild);
    }

    /**
     * @param {Element} element
     * @param {StyleNode} rules
     * @param {string} scopeSelector
     * @return {Object}
     */

  }, {
    key: '_elementKeyframeTransforms',
    value: function _elementKeyframeTransforms(element, rules, scopeSelector) {
      var keyframesRules = rules._keyframes;
      var keyframeTransforms = {};
      if (!_styleSettings.nativeShadow && keyframesRules) {
        // For non-ShadowDOM, we transform all known keyframes rules in
        // advance for the current scope. This allows us to catch keyframes
        // rules that appear anywhere in the stylesheet:
        for (var i = 0, keyframesRule = keyframesRules[i]; i < keyframesRules.length; keyframesRule = keyframesRules[++i]) {
          this._scopeKeyframes(keyframesRule, scopeSelector);
          keyframeTransforms[keyframesRule['keyframesName']] = this._keyframesRuleTransformer(keyframesRule);
        }
      }
      return keyframeTransforms;
    }

    // Generate a factory for transforming a chunk of CSS text to handle a
    // particular scoped keyframes rule.
    /**
     * @param {StyleNode} keyframesRule
     * @return {function(string):string}
     */

  }, {
    key: '_keyframesRuleTransformer',
    value: function _keyframesRuleTransformer(keyframesRule) {
      return function (cssText) {
        return cssText.replace(keyframesRule.keyframesNameRx, keyframesRule.transformedKeyframesName);
      };
    }

    /**
     * Transforms `@keyframes` names to be unique for the current host.
     * Example: @keyframes foo-anim -> @keyframes foo-anim-x-foo-0
     *
     * @param {StyleNode} rule
     * @param {string} scopeId
     */

  }, {
    key: '_scopeKeyframes',
    value: function _scopeKeyframes(rule, scopeId) {
      // Animation names are of the form [\w-], so ensure that the name regex does not partially apply
      // to similarly named keyframe names by checking for a word boundary at the beginning and
      // a non-word boundary or `-` at the end.
      rule.keyframesNameRx = new RegExp('\\b' + rule['keyframesName'] + '(?!\\B|-)', 'g');
      rule.transformedKeyframesName = rule['keyframesName'] + '-' + scopeId;
      rule.transformedSelector = rule.transformedSelector || rule['selector'];
      rule['selector'] = rule.transformedSelector.replace(rule['keyframesName'], rule.transformedKeyframesName);
    }

    // Strategy: x scope shim a selector e.g. to scope `.x-foo-42` (via classes):
    // non-host selector: .a.x-foo -> .x-foo-42 .a.x-foo
    // host selector: x-foo.wide -> .x-foo-42.wide
    // note: we use only the scope class (.x-foo-42) and not the hostSelector
    // (x-foo) to scope :host rules; this helps make property host rules
    // have low specificity. They are overrideable by class selectors but,
    // unfortunately, not by type selectors (e.g. overriding via
    // `.special` is ok, but not by `x-foo`).
    /**
     * @param {StyleNode} rule
     * @param {RegExp} hostRx
     * @param {string} hostSelector
     * @param {string} scopeId
     */

  }, {
    key: '_scopeSelector',
    value: function _scopeSelector(rule, hostRx, hostSelector, scopeId) {
      rule.transformedSelector = rule.transformedSelector || rule['selector'];
      var selector = rule.transformedSelector;
      var scope = '.' + scopeId;
      var parts = StyleUtil.splitSelectorList(selector);
      for (var i = 0, l = parts.length, p; i < l && (p = parts[i]); i++) {
        parts[i] = p.match(hostRx) ? p.replace(hostSelector, scope) : scope + ' ' + p;
      }
      rule['selector'] = parts.join(',');
    }

    /**
     * @param {Element} element
     * @param {string} selector
     * @param {string} old
     */

  }, {
    key: 'applyElementScopeSelector',
    value: function applyElementScopeSelector(element, selector, old) {
      var c = element.getAttribute('class') || '';
      var v = c;
      if (old) {
        v = c.replace(new RegExp('\\s*' + XSCOPE_NAME + '\\s*' + old + '\\s*', 'g'), ' ');
      }
      v += (v ? ' ' : '') + XSCOPE_NAME + ' ' + selector;
      if (c !== v) {
        StyleUtil.setElementClassRaw(element, v);
      }
    }

    /**
     * @param {HTMLElement} element
     * @param {Object} properties
     * @param {string} selector
     * @param {HTMLStyleElement} style
     * @return {HTMLStyleElement}
     */

  }, {
    key: 'applyElementStyle',
    value: function applyElementStyle(element, properties, selector, style) {
      // calculate cssText to apply
      var cssText = style ? style.textContent || '' : this.transformStyles(element, properties, selector);
      // if shady and we have a cached style that is not style, decrement
      var styleInfo = _styleInfo2.default.get(element);
      var s = styleInfo.customStyle;
      if (s && !_styleSettings.nativeShadow && s !== style) {
        s['_useCount']--;
        if (s['_useCount'] <= 0 && s.parentNode) {
          s.parentNode.removeChild(s);
        }
      }
      // apply styling always under native or if we generated style
      // or the cached style is not in document(!)
      if (_styleSettings.nativeShadow) {
        // update existing style only under native
        if (styleInfo.customStyle) {
          styleInfo.customStyle.textContent = cssText;
          style = styleInfo.customStyle;
          // otherwise, if we have css to apply, do so
        } else if (cssText) {
          // apply css after the scope style of the element to help with
          // style precedence rules.
          style = StyleUtil.applyCss(cssText, selector, element.shadowRoot, styleInfo.placeholder);
        }
      } else {
        // shady and no cache hit
        if (!style) {
          // apply css after the scope style of the element to help with
          // style precedence rules.
          if (cssText) {
            style = StyleUtil.applyCss(cssText, selector, null, styleInfo.placeholder);
          }
          // shady and cache hit but not in document
        } else if (!style.parentNode) {
          if (IS_IE && cssText.indexOf('@media') > -1) {
            // @media rules may be stale in IE 10 and 11
            // refresh the text content of the style to revalidate them.
            style.textContent = cssText;
          }
          StyleUtil.applyStyle(style, null, styleInfo.placeholder);
        }
      }
      // ensure this style is our custom style and increment its use count.
      if (style) {
        style['_useCount'] = style['_useCount'] || 0;
        // increment use count if we changed styles
        if (styleInfo.customStyle != style) {
          style['_useCount']++;
        }
        styleInfo.customStyle = style;
      }
      return style;
    }

    /**
     * @param {Element} style
     * @param {Object} properties
     */

  }, {
    key: 'applyCustomStyle',
    value: function applyCustomStyle(style, properties) {
      var rules = StyleUtil.rulesForStyle( /** @type {HTMLStyleElement} */style);
      var self = this;
      style.textContent = StyleUtil.toCssText(rules, function ( /** StyleNode */rule) {
        var css = rule['cssText'] = rule['parsedCssText'];
        if (rule.propertyInfo && rule.propertyInfo.cssText) {
          // remove property assignments
          // so next function isn't confused
          // NOTE: we have 3 categories of css:
          // (1) normal properties,
          // (2) custom property assignments (--foo: red;),
          // (3) custom property usage: border: var(--foo); @apply(--foo);
          // In elements, 1 and 3 are separated for efficiency; here they
          // are not and this makes this case unique.
          css = (0, _cssParse.removeCustomPropAssignment)( /** @type {string} */css);
          // replace with reified properties, scenario is same as mixin
          rule['cssText'] = self.valueForProperties(css, properties);
        }
      });
    }
  }, {
    key: 'XSCOPE_NAME',
    get: function get() {
      return XSCOPE_NAME;
    }
  }]);

  return StyleProperties;
}();

/**
 * @param {number} n
 * @param {Array<number>} bits
 */


function addToBitMask(n, bits) {
  var o = parseInt(n / 32, 10);
  var v = 1 << n % 32;
  bits[o] = (bits[o] || 0) | v;
}

exports.default = new StyleProperties();