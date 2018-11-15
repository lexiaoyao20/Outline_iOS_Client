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

var _customStyleInterface = require('../src/custom-style-interface.js');

var _customStyleInterface2 = _interopRequireDefault(_customStyleInterface);

var _commonUtils = require('../src/common-utils.js');

var _styleSettings = require('../src/style-settings.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var customStyleInterface = new _customStyleInterface2.default();

if (!window.ShadyCSS) {
  window.ShadyCSS = {
    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} elementExtends
     */
    prepareTemplate: function prepareTemplate(template, elementName, elementExtends) {},
    // eslint-disable-line no-unused-vars

    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     */
    prepareTemplateDom: function prepareTemplateDom(template, elementName) {},
    // eslint-disable-line no-unused-vars

    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} elementExtends
     */
    prepareTemplateStyles: function prepareTemplateStyles(template, elementName, elementExtends) {},
    // eslint-disable-line no-unused-vars

    /**
     * @param {Element} element
     * @param {Object=} properties
     */
    styleSubtree: function styleSubtree(element, properties) {
      customStyleInterface.processStyles();
      (0, _commonUtils.updateNativeProperties)(element, properties);
    },


    /**
     * @param {Element} element
     */
    styleElement: function styleElement(element) {
      // eslint-disable-line no-unused-vars
      customStyleInterface.processStyles();
    },


    /**
     * @param {Object=} properties
     */
    styleDocument: function styleDocument(properties) {
      customStyleInterface.processStyles();
      (0, _commonUtils.updateNativeProperties)(document.body, properties);
    },


    /**
     * @param {Element} element
     * @param {string} property
     * @return {string}
     */
    getComputedStyleValue: function getComputedStyleValue(element, property) {
      return (0, _commonUtils.getComputedStyleValue)(element, property);
    },
    flushCustomStyles: function flushCustomStyles() {},

    nativeCss: _styleSettings.nativeCssVariables,
    nativeShadow: _styleSettings.nativeShadow
  };
}

window.ShadyCSS.CustomStyleInterface = customStyleInterface;