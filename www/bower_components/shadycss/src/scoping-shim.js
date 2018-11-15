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

var _styleSettings = require('./style-settings.js');

var _styleTransformer = require('./style-transformer.js');

var _styleTransformer2 = _interopRequireDefault(_styleTransformer);

var _styleUtil = require('./style-util.js');

var StyleUtil = _interopRequireWildcard(_styleUtil);

var _styleProperties = require('./style-properties.js');

var _styleProperties2 = _interopRequireDefault(_styleProperties);

var _stylePlaceholder = require('./style-placeholder.js');

var _styleInfo = require('./style-info.js');

var _styleInfo2 = _interopRequireDefault(_styleInfo);

var _styleCache = require('./style-cache.js');

var _styleCache2 = _interopRequireDefault(_styleCache);

var _documentWatcher = require('./document-watcher.js');

var _templateMap = require('./template-map.js');

var _templateMap2 = _interopRequireDefault(_templateMap);

var _applyShimUtils = require('./apply-shim-utils.js');

var ApplyShimUtils = _interopRequireWildcard(_applyShimUtils);

var _commonUtils = require('./common-utils.js');

var _customStyleInterface = require('./custom-style-interface.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// eslint-disable-line no-unused-vars

/**
 * @const {StyleCache}
 */
var styleCache = new _styleCache2.default();

var ScopingShim = function () {
  function ScopingShim() {
    _classCallCheck(this, ScopingShim);

    this._scopeCounter = {};
    this._documentOwner = /** @type {!HTMLElement} */document.documentElement;
    var ast = new _cssParse.StyleNode();
    ast['rules'] = [];
    this._documentOwnerStyleInfo = _styleInfo2.default.set(this._documentOwner, new _styleInfo2.default(ast));
    this._elementsHaveApplied = false;
    this._applyShim = null;
    /** @type {?CustomStyleInterfaceInterface} */
    this._customStyleInterface = null;
  }

  _createClass(ScopingShim, [{
    key: 'flush',
    value: function flush() {
      (0, _documentWatcher.flush)();
    }
  }, {
    key: '_generateScopeSelector',
    value: function _generateScopeSelector(name) {
      var id = this._scopeCounter[name] = (this._scopeCounter[name] || 0) + 1;
      return name + '-' + id;
    }
  }, {
    key: 'getStyleAst',
    value: function getStyleAst(style) {
      return StyleUtil.rulesForStyle(style);
    }
  }, {
    key: 'styleAstToString',
    value: function styleAstToString(ast) {
      return StyleUtil.toCssText(ast);
    }
  }, {
    key: '_gatherStyles',
    value: function _gatherStyles(template) {
      return StyleUtil.gatherStyleText(template.content);
    }
    /**
     * Prepare the styling and template for the given element type
     *
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} typeExtension
     */

  }, {
    key: 'prepareTemplate',
    value: function prepareTemplate(template, elementName, typeExtension) {
      this.prepareTemplateDom(template, elementName);
      this.prepareTemplateStyles(template, elementName, typeExtension);
    }
    /**
     * Prepare styling for the given element type
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} typeExtension
     */

  }, {
    key: 'prepareTemplateStyles',
    value: function prepareTemplateStyles(template, elementName, typeExtension) {
      if (template._prepared) {
        return;
      }
      // style placeholders are only used when ShadyDOM is active
      if (!_styleSettings.nativeShadow) {
        (0, _stylePlaceholder.ensureStylePlaceholder)(elementName);
      }
      template._prepared = true;
      template.name = elementName;
      template.extends = typeExtension;
      _templateMap2.default[elementName] = template;
      var cssBuild = StyleUtil.getCssBuild(template);
      var cssText = this._gatherStyles(template);
      var info = {
        is: elementName,
        extends: typeExtension
      };
      // check if the styling has mixin definitions or uses
      this._ensure();
      var hasMixins = !StyleUtil.elementHasBuiltCss(template) && (0, _commonUtils.detectMixin)(cssText);
      var ast = (0, _cssParse.parse)(cssText);
      // only run the applyshim transforms if there is a mixin involved
      if (hasMixins && _styleSettings.nativeCssVariables && this._applyShim) {
        this._applyShim['transformRules'](ast, elementName);
      }
      template['_styleAst'] = ast;

      var ownPropertyNames = [];
      if (!_styleSettings.nativeCssVariables) {
        ownPropertyNames = _styleProperties2.default.decorateStyles(template['_styleAst']);
      }
      if (!ownPropertyNames.length || _styleSettings.nativeCssVariables) {
        var root = _styleSettings.nativeShadow ? template.content : null;
        var placeholder = (0, _stylePlaceholder.getStylePlaceholder)(elementName);
        var style = this._generateStaticStyle(info, template['_styleAst'], root, placeholder, cssBuild);
        template._style = style;
      }
      template._ownPropertyNames = ownPropertyNames;
    }
    /**
     * Prepare template for the given element type
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     */

  }, {
    key: 'prepareTemplateDom',
    value: function prepareTemplateDom(template, elementName) {
      var cssBuild = StyleUtil.getCssBuild(template);
      if (!_styleSettings.nativeShadow && cssBuild !== 'shady' && !template._domPrepared) {
        template._domPrepared = true;
        _styleTransformer2.default.domAddScope(template.content, elementName);
      }
    }
    /**
     * @param {!{is: string, extends: (string|undefined)}} info
     * @param {!StyleNode} rules
     * @param {DocumentFragment} shadowroot
     * @param {Node} placeholder
     * @param {string} cssBuild
     */

  }, {
    key: '_generateStaticStyle',
    value: function _generateStaticStyle(info, rules, shadowroot, placeholder, cssBuild) {
      var cssText = _styleTransformer2.default.elementStyles(info, rules, null, cssBuild);
      if (cssText.length) {
        return StyleUtil.applyCss(cssText, info.is, shadowroot, placeholder);
      }
    }
  }, {
    key: '_prepareHost',
    value: function _prepareHost(host) {
      var _StyleUtil$getIsExten = StyleUtil.getIsExtends(host),
          is = _StyleUtil$getIsExten.is,
          typeExtension = _StyleUtil$getIsExten.typeExtension;

      var placeholder = (0, _stylePlaceholder.getStylePlaceholder)(is);
      var template = _templateMap2.default[is];
      var ast = void 0;
      var ownStylePropertyNames = void 0;
      var cssBuild = void 0;
      if (template) {
        ast = template['_styleAst'];
        ownStylePropertyNames = template._ownPropertyNames;
        cssBuild = StyleUtil.getCssBuild(template);
      }
      var styleInfo = new _styleInfo2.default(ast, placeholder, ownStylePropertyNames, is, typeExtension, cssBuild);
      // only set the style info after this element has registered its template
      if (template) {
        _styleInfo2.default.set(host, styleInfo);
      }
      return styleInfo;
    }
  }, {
    key: '_ensureApplyShim',
    value: function _ensureApplyShim() {
      if (this._applyShim) {
        return;
      } else if (window.ShadyCSS && window.ShadyCSS.ApplyShim) {
        this._applyShim = window.ShadyCSS.ApplyShim;
        this._applyShim['invalidCallback'] = ApplyShimUtils.invalidate;
      }
    }
  }, {
    key: '_ensureCustomStyleInterface',
    value: function _ensureCustomStyleInterface() {
      var _this = this;

      if (this._customStyleInterface) {
        return;
      } else if (window.ShadyCSS && window.ShadyCSS.CustomStyleInterface) {
        this._customStyleInterface = /** @type {!CustomStyleInterfaceInterface} */window.ShadyCSS.CustomStyleInterface;
        /** @type {function(!HTMLStyleElement)} */
        this._customStyleInterface['transformCallback'] = function (style) {
          _this.transformCustomStyleForDocument(style);
        };
        this._customStyleInterface['validateCallback'] = function () {
          requestAnimationFrame(function () {
            if (_this._customStyleInterface['enqueued'] || _this._elementsHaveApplied) {
              _this.flushCustomStyles();
            }
          });
        };
      }
    }
  }, {
    key: '_ensure',
    value: function _ensure() {
      this._ensureApplyShim();
      this._ensureCustomStyleInterface();
    }
    /**
     * Flush and apply custom styles to document
     */

  }, {
    key: 'flushCustomStyles',
    value: function flushCustomStyles() {
      this._ensure();
      if (!this._customStyleInterface) {
        return;
      }
      var customStyles = this._customStyleInterface['processStyles']();
      // early return if custom-styles don't need validation
      if (!this._customStyleInterface['enqueued']) {
        return;
      }
      if (!_styleSettings.nativeCssVariables) {
        this._updateProperties(this._documentOwner, this._documentOwnerStyleInfo);
        this._applyCustomStyles(customStyles);
      } else {
        this._revalidateCustomStyleApplyShim(customStyles);
      }
      this._customStyleInterface['enqueued'] = false;
      // if custom elements have upgraded and there are no native css variables, we must recalculate the whole tree
      if (this._elementsHaveApplied && !_styleSettings.nativeCssVariables) {
        this.styleDocument();
      }
    }
    /**
     * Apply styles for the given element
     *
     * @param {!HTMLElement} host
     * @param {Object=} overrideProps
     */

  }, {
    key: 'styleElement',
    value: function styleElement(host, overrideProps) {
      var styleInfo = _styleInfo2.default.get(host);
      if (!styleInfo) {
        styleInfo = this._prepareHost(host);
      }
      // Only trip the `elementsHaveApplied` flag if a node other that the root document has `applyStyle` called
      if (!this._isRootOwner(host)) {
        this._elementsHaveApplied = true;
      }
      if (overrideProps) {
        styleInfo.overrideStyleProperties = styleInfo.overrideStyleProperties || {};
        Object.assign(styleInfo.overrideStyleProperties, overrideProps);
      }
      if (!_styleSettings.nativeCssVariables) {
        this.styleElementShimVariables(host, styleInfo);
      } else {
        this.styleElementNativeVariables(host, styleInfo);
      }
    }
    /**
     * @param {!HTMLElement} host
     * @param {!StyleInfo} styleInfo
     */

  }, {
    key: 'styleElementShimVariables',
    value: function styleElementShimVariables(host, styleInfo) {
      this.flush();
      this._updateProperties(host, styleInfo);
      if (styleInfo.ownStylePropertyNames && styleInfo.ownStylePropertyNames.length) {
        this._applyStyleProperties(host, styleInfo);
      }
    }
    /**
     * @param {!HTMLElement} host
     * @param {!StyleInfo} styleInfo
     */

  }, {
    key: 'styleElementNativeVariables',
    value: function styleElementNativeVariables(host, styleInfo) {
      var _StyleUtil$getIsExten2 = StyleUtil.getIsExtends(host),
          is = _StyleUtil$getIsExten2.is;

      if (styleInfo.overrideStyleProperties) {
        (0, _commonUtils.updateNativeProperties)(host, styleInfo.overrideStyleProperties);
      }
      var template = _templateMap2.default[is];
      // bail early if there is no shadowroot for this element
      if (!template && !this._isRootOwner(host)) {
        return;
      }
      // bail early if the template was built with polymer-css-build
      if (template && StyleUtil.elementHasBuiltCss(template)) {
        return;
      }
      if (template && template._style && !ApplyShimUtils.templateIsValid(template)) {
        // update template
        if (!ApplyShimUtils.templateIsValidating(template)) {
          this._ensure();
          this._applyShim && this._applyShim['transformRules'](template['_styleAst'], is);
          template._style.textContent = _styleTransformer2.default.elementStyles(host, styleInfo.styleRules);
          ApplyShimUtils.startValidatingTemplate(template);
        }
        // update instance if native shadowdom
        if (_styleSettings.nativeShadow) {
          var root = host.shadowRoot;
          if (root) {
            var style = root.querySelector('style');
            if (style) {
              style.textContent = _styleTransformer2.default.elementStyles(host, styleInfo.styleRules);
            }
          }
        }
        styleInfo.styleRules = template['_styleAst'];
      }
    }
  }, {
    key: '_styleOwnerForNode',
    value: function _styleOwnerForNode(node) {
      var root = node.getRootNode();
      var host = root.host;
      if (host) {
        if (_styleInfo2.default.get(host)) {
          return host;
        } else {
          return this._styleOwnerForNode(host);
        }
      }
      return this._documentOwner;
    }
  }, {
    key: '_isRootOwner',
    value: function _isRootOwner(node) {
      return node === this._documentOwner;
    }
  }, {
    key: '_applyStyleProperties',
    value: function _applyStyleProperties(host, styleInfo) {
      var is = StyleUtil.getIsExtends(host).is;
      var cacheEntry = styleCache.fetch(is, styleInfo.styleProperties, styleInfo.ownStylePropertyNames);
      var cachedScopeSelector = cacheEntry && cacheEntry.scopeSelector;
      var cachedStyle = cacheEntry ? cacheEntry.styleElement : null;
      var oldScopeSelector = styleInfo.scopeSelector;
      // only generate new scope if cached style is not found
      styleInfo.scopeSelector = cachedScopeSelector || this._generateScopeSelector(is);
      var style = _styleProperties2.default.applyElementStyle(host, styleInfo.styleProperties, styleInfo.scopeSelector, cachedStyle);
      if (!_styleSettings.nativeShadow) {
        _styleProperties2.default.applyElementScopeSelector(host, styleInfo.scopeSelector, oldScopeSelector);
      }
      if (!cacheEntry) {
        styleCache.store(is, styleInfo.styleProperties, style, styleInfo.scopeSelector);
      }
      return style;
    }
  }, {
    key: '_updateProperties',
    value: function _updateProperties(host, styleInfo) {
      var owner = this._styleOwnerForNode(host);
      var ownerStyleInfo = _styleInfo2.default.get(owner);
      var ownerProperties = ownerStyleInfo.styleProperties;
      var props = Object.create(ownerProperties || null);
      var hostAndRootProps = _styleProperties2.default.hostAndRootPropertiesForScope(host, styleInfo.styleRules, styleInfo.cssBuild);
      var propertyData = _styleProperties2.default.propertyDataFromStyles(ownerStyleInfo.styleRules, host);
      var propertiesMatchingHost = propertyData.properties;
      Object.assign(props, hostAndRootProps.hostProps, propertiesMatchingHost, hostAndRootProps.rootProps);
      this._mixinOverrideStyles(props, styleInfo.overrideStyleProperties);
      _styleProperties2.default.reify(props);
      styleInfo.styleProperties = props;
    }
  }, {
    key: '_mixinOverrideStyles',
    value: function _mixinOverrideStyles(props, overrides) {
      for (var p in overrides) {
        var v = overrides[p];
        // skip override props if they are not truthy or 0
        // in order to fall back to inherited values
        if (v || v === 0) {
          props[p] = v;
        }
      }
    }
    /**
     * Update styles of the whole document
     *
     * @param {Object=} properties
     */

  }, {
    key: 'styleDocument',
    value: function styleDocument(properties) {
      this.styleSubtree(this._documentOwner, properties);
    }
    /**
     * Update styles of a subtree
     *
     * @param {!HTMLElement} host
     * @param {Object=} properties
     */

  }, {
    key: 'styleSubtree',
    value: function styleSubtree(host, properties) {
      var root = host.shadowRoot;
      if (root || this._isRootOwner(host)) {
        this.styleElement(host, properties);
      }
      // process the shadowdom children of `host`
      var shadowChildren = root && (root.children || root.childNodes);
      if (shadowChildren) {
        for (var i = 0; i < shadowChildren.length; i++) {
          var c = /** @type {!HTMLElement} */shadowChildren[i];
          this.styleSubtree(c);
        }
      } else {
        // process the lightdom children of `host`
        var children = host.children || host.childNodes;
        if (children) {
          for (var _i = 0; _i < children.length; _i++) {
            var _c = /** @type {!HTMLElement} */children[_i];
            this.styleSubtree(_c);
          }
        }
      }
    }
    /* Custom Style operations */

  }, {
    key: '_revalidateCustomStyleApplyShim',
    value: function _revalidateCustomStyleApplyShim(customStyles) {
      for (var i = 0; i < customStyles.length; i++) {
        var c = customStyles[i];
        var s = this._customStyleInterface['getStyleForCustomStyle'](c);
        if (s) {
          this._revalidateApplyShim(s);
        }
      }
    }
  }, {
    key: '_applyCustomStyles',
    value: function _applyCustomStyles(customStyles) {
      for (var i = 0; i < customStyles.length; i++) {
        var c = customStyles[i];
        var s = this._customStyleInterface['getStyleForCustomStyle'](c);
        if (s) {
          _styleProperties2.default.applyCustomStyle(s, this._documentOwnerStyleInfo.styleProperties);
        }
      }
    }
  }, {
    key: 'transformCustomStyleForDocument',
    value: function transformCustomStyleForDocument(style) {
      var _this2 = this;

      var ast = StyleUtil.rulesForStyle(style);
      var cssBuild = StyleUtil.getCssBuild(style);
      if (cssBuild !== this._documentOwnerStyleInfo.cssBuild) {
        this._documentOwnerStyleInfo.cssBuild = cssBuild;
      }
      StyleUtil.forEachRule(ast, function (rule) {
        if (_styleSettings.nativeShadow) {
          _styleTransformer2.default.normalizeRootSelector(rule);
        } else {
          _styleTransformer2.default.documentRule(rule);
        }
        if (_styleSettings.nativeCssVariables && cssBuild === '') {
          _this2._ensure();
          _this2._applyShim && _this2._applyShim['transformRule'](rule);
        }
      });
      if (_styleSettings.nativeCssVariables) {
        style.textContent = StyleUtil.toCssText(ast);
      } else {
        this._documentOwnerStyleInfo.styleRules['rules'].push(ast);
      }
    }
  }, {
    key: '_revalidateApplyShim',
    value: function _revalidateApplyShim(style) {
      if (_styleSettings.nativeCssVariables && this._applyShim) {
        var ast = StyleUtil.rulesForStyle(style);
        this._ensure();
        this._applyShim['transformRules'](ast);
        style.textContent = StyleUtil.toCssText(ast);
      }
    }
  }, {
    key: 'getComputedStyleValue',
    value: function getComputedStyleValue(element, property) {
      var value = void 0;
      if (!_styleSettings.nativeCssVariables) {
        // element is either a style host, or an ancestor of a style host
        var styleInfo = _styleInfo2.default.get(element) || _styleInfo2.default.get(this._styleOwnerForNode(element));
        value = styleInfo.styleProperties[property];
      }
      // fall back to the property value from the computed styling
      value = value || window.getComputedStyle(element).getPropertyValue(property);
      // trim whitespace that can come after the `:` in css
      // example: padding: 2px -> " 2px"
      return value ? value.trim() : '';
    }
    // given an element and a classString, replaces
    // the element's class with the provided classString and adds
    // any necessary ShadyCSS static and property based scoping selectors

  }, {
    key: 'setElementClass',
    value: function setElementClass(element, classString) {
      var root = element.getRootNode();
      var classes = classString ? classString.split(/\s/) : [];
      var scopeName = root.host && root.host.localName;
      // If no scope, try to discover scope name from existing class.
      // This can occur if, for example, a template stamped element that
      // has been scoped is manipulated when not in a root.
      if (!scopeName) {
        var classAttr = element.getAttribute('class');
        if (classAttr) {
          var k$ = classAttr.split(/\s/);
          for (var i = 0; i < k$.length; i++) {
            if (k$[i] === _styleTransformer2.default.SCOPE_NAME) {
              scopeName = k$[i + 1];
              break;
            }
          }
        }
      }
      if (scopeName) {
        classes.push(_styleTransformer2.default.SCOPE_NAME, scopeName);
      }
      if (!_styleSettings.nativeCssVariables) {
        var styleInfo = _styleInfo2.default.get(element);
        if (styleInfo && styleInfo.scopeSelector) {
          classes.push(_styleProperties2.default.XSCOPE_NAME, styleInfo.scopeSelector);
        }
      }
      StyleUtil.setElementClassRaw(element, classes.join(' '));
    }
  }, {
    key: '_styleInfoForNode',
    value: function _styleInfoForNode(node) {
      return _styleInfo2.default.get(node);
    }
    /**
     * @param {!Element} node
     * @param {string} scope
     */

  }, {
    key: 'scopeNode',
    value: function scopeNode(node, scope) {
      _styleTransformer2.default.element(node, scope);
    }
    /**
     * @param {!Element} node
     * @param {string} scope
     */

  }, {
    key: 'unscopeNode',
    value: function unscopeNode(node, scope) {
      _styleTransformer2.default.element(node, scope, true);
    }
    /**
     * @param {!Node} node
     * @return {string}
     */

  }, {
    key: 'scopeForNode',
    value: function scopeForNode(node) {
      return (0, _documentWatcher.getOwnerScope)(node);
    }
    /**
     * @param {!Element} node
     * @return {string}
     */

  }, {
    key: 'currentScopeForNode',
    value: function currentScopeForNode(node) {
      return (0, _documentWatcher.getCurrentScope)(node);
    }
  }]);

  return ScopingShim;
}();

/* exports */


exports.default = ScopingShim;
ScopingShim.prototype['flush'] = ScopingShim.prototype.flush;
ScopingShim.prototype['prepareTemplate'] = ScopingShim.prototype.prepareTemplate;
ScopingShim.prototype['styleElement'] = ScopingShim.prototype.styleElement;
ScopingShim.prototype['styleDocument'] = ScopingShim.prototype.styleDocument;
ScopingShim.prototype['styleSubtree'] = ScopingShim.prototype.styleSubtree;
ScopingShim.prototype['getComputedStyleValue'] = ScopingShim.prototype.getComputedStyleValue;
ScopingShim.prototype['setElementClass'] = ScopingShim.prototype.setElementClass;
ScopingShim.prototype['_styleInfoForNode'] = ScopingShim.prototype._styleInfoForNode;
ScopingShim.prototype['transformCustomStyleForDocument'] = ScopingShim.prototype.transformCustomStyleForDocument;
ScopingShim.prototype['getStyleAst'] = ScopingShim.prototype.getStyleAst;
ScopingShim.prototype['styleAstToString'] = ScopingShim.prototype.styleAstToString;
ScopingShim.prototype['flushCustomStyles'] = ScopingShim.prototype.flushCustomStyles;
ScopingShim.prototype['scopeNode'] = ScopingShim.prototype.scopeNode;
ScopingShim.prototype['unscopeNode'] = ScopingShim.prototype.unscopeNode;
ScopingShim.prototype['scopeForNode'] = ScopingShim.prototype.scopeForNode;
ScopingShim.prototype['currentScopeForNode'] = ScopingShim.prototype.currentScopeForNode;
Object.defineProperties(ScopingShim.prototype, {
  'nativeShadow': {
    get: function get() {
      return _styleSettings.nativeShadow;
    }
  },
  'nativeCss': {
    get: function get() {
      return _styleSettings.nativeCssVariables;
    }
  }
});