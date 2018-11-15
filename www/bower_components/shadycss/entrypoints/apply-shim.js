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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // eslint-disable-line no-unused-vars


var _applyShim = require('../src/apply-shim.js');

var _applyShim2 = _interopRequireDefault(_applyShim);

var _templateMap = require('../src/template-map.js');

var _templateMap2 = _interopRequireDefault(_templateMap);

var _styleUtil = require('../src/style-util.js');

var _applyShimUtils = require('../src/apply-shim-utils.js');

var ApplyShimUtils = _interopRequireWildcard(_applyShimUtils);

var _commonUtils = require('../src/common-utils.js');

var _customStyleInterface = require('../src/custom-style-interface.js');

var _styleSettings = require('../src/style-settings.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** @const {ApplyShim} */
var applyShim = new _applyShim2.default();

var ApplyShimInterface = function () {
  function ApplyShimInterface() {
    _classCallCheck(this, ApplyShimInterface);

    /** @type {?CustomStyleInterfaceInterface} */
    this.customStyleInterface = null;
    applyShim['invalidCallback'] = ApplyShimUtils.invalidate;
  }

  _createClass(ApplyShimInterface, [{
    key: 'ensure',
    value: function ensure() {
      var _this = this;

      if (this.customStyleInterface) {
        return;
      }
      this.customStyleInterface = window.ShadyCSS.CustomStyleInterface;
      if (this.customStyleInterface) {
        this.customStyleInterface['transformCallback'] = function (style) {
          applyShim.transformCustomStyle(style);
        };
        this.customStyleInterface['validateCallback'] = function () {
          requestAnimationFrame(function () {
            if (_this.customStyleInterface['enqueued']) {
              _this.flushCustomStyles();
            }
          });
        };
      }
    }
    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     */

  }, {
    key: 'prepareTemplate',
    value: function prepareTemplate(template, elementName) {
      this.ensure();
      if ((0, _styleUtil.elementHasBuiltCss)(template)) {
        return;
      }
      _templateMap2.default[elementName] = template;
      var ast = applyShim.transformTemplate(template, elementName);
      // save original style ast to use for revalidating instances
      template['_styleAst'] = ast;
    }
  }, {
    key: 'flushCustomStyles',
    value: function flushCustomStyles() {
      this.ensure();
      if (!this.customStyleInterface) {
        return;
      }
      var styles = this.customStyleInterface['processStyles']();
      if (!this.customStyleInterface['enqueued']) {
        return;
      }
      for (var i = 0; i < styles.length; i++) {
        var cs = styles[i];
        var style = this.customStyleInterface['getStyleForCustomStyle'](cs);
        if (style) {
          applyShim.transformCustomStyle(style);
        }
      }
      this.customStyleInterface['enqueued'] = false;
    }
    /**
     * @param {HTMLElement} element
     * @param {Object=} properties
     */

  }, {
    key: 'styleSubtree',
    value: function styleSubtree(element, properties) {
      this.ensure();
      if (properties) {
        (0, _commonUtils.updateNativeProperties)(element, properties);
      }
      if (element.shadowRoot) {
        this.styleElement(element);
        var shadowChildren = element.shadowRoot.children || element.shadowRoot.childNodes;
        for (var i = 0; i < shadowChildren.length; i++) {
          this.styleSubtree( /** @type {HTMLElement} */shadowChildren[i]);
        }
      } else {
        var children = element.children || element.childNodes;
        for (var _i = 0; _i < children.length; _i++) {
          this.styleSubtree( /** @type {HTMLElement} */children[_i]);
        }
      }
    }
    /**
     * @param {HTMLElement} element
     */

  }, {
    key: 'styleElement',
    value: function styleElement(element) {
      this.ensure();

      var _getIsExtends = (0, _styleUtil.getIsExtends)(element),
          is = _getIsExtends.is;

      var template = _templateMap2.default[is];
      if (template && (0, _styleUtil.elementHasBuiltCss)(template)) {
        return;
      }
      if (template && !ApplyShimUtils.templateIsValid(template)) {
        // only revalidate template once
        if (!ApplyShimUtils.templateIsValidating(template)) {
          this.prepareTemplate(template, is);
          ApplyShimUtils.startValidatingTemplate(template);
        }
        // update this element instance
        var root = element.shadowRoot;
        if (root) {
          var style = /** @type {HTMLStyleElement} */root.querySelector('style');
          if (style) {
            // reuse the template's style ast, it has all the original css text
            style['__cssRules'] = template['_styleAst'];
            style.textContent = (0, _styleUtil.toCssText)(template['_styleAst']);
          }
        }
      }
    }
    /**
     * @param {Object=} properties
     */

  }, {
    key: 'styleDocument',
    value: function styleDocument(properties) {
      this.ensure();
      this.styleSubtree(document.body, properties);
    }
  }]);

  return ApplyShimInterface;
}();

if (!window.ShadyCSS || !window.ShadyCSS.ScopingShim) {
  var applyShimInterface = new ApplyShimInterface();
  var CustomStyleInterface = window.ShadyCSS && window.ShadyCSS.CustomStyleInterface;

  /** @suppress {duplicate} */
  window.ShadyCSS = {
    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} elementExtends
     */
    prepareTemplate: function prepareTemplate(template, elementName, elementExtends) {
      // eslint-disable-line no-unused-vars
      applyShimInterface.flushCustomStyles();
      applyShimInterface.prepareTemplate(template, elementName);
    },


    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} elementExtends
     */
    prepareTemplateStyles: function prepareTemplateStyles(template, elementName, elementExtends) {
      this.prepareTemplate(template, elementName, elementExtends);
    },


    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     */
    prepareTemplateDom: function prepareTemplateDom(template, elementName) {},
    // eslint-disable-line no-unused-vars

    /**
     * @param {!HTMLElement} element
     * @param {Object=} properties
     */
    styleSubtree: function styleSubtree(element, properties) {
      applyShimInterface.flushCustomStyles();
      applyShimInterface.styleSubtree(element, properties);
    },


    /**
     * @param {!HTMLElement} element
     */
    styleElement: function styleElement(element) {
      applyShimInterface.flushCustomStyles();
      applyShimInterface.styleElement(element);
    },


    /**
     * @param {Object=} properties
     */
    styleDocument: function styleDocument(properties) {
      applyShimInterface.flushCustomStyles();
      applyShimInterface.styleDocument(properties);
    },


    /**
     * @param {Element} element
     * @param {string} property
     * @return {string}
     */
    getComputedStyleValue: function getComputedStyleValue(element, property) {
      return (0, _commonUtils.getComputedStyleValue)(element, property);
    },
    flushCustomStyles: function flushCustomStyles() {
      applyShimInterface.flushCustomStyles();
    },


    nativeCss: _styleSettings.nativeCssVariables,
    nativeShadow: _styleSettings.nativeShadow
  };

  if (CustomStyleInterface) {
    window.ShadyCSS.CustomStyleInterface = CustomStyleInterface;
  }
}

window.ShadyCSS.ApplyShim = applyShim;