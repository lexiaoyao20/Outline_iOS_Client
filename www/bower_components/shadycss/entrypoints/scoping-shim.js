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

var _scopingShim = require('../src/scoping-shim.js');

var _scopingShim2 = _interopRequireDefault(_scopingShim);

var _styleSettings = require('../src/style-settings.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @const {ScopingShim} */
var scopingShim = new _scopingShim2.default();

var ApplyShim = void 0,
    CustomStyleInterface = void 0;

if (window['ShadyCSS']) {
  ApplyShim = window['ShadyCSS']['ApplyShim'];
  CustomStyleInterface = window['ShadyCSS']['CustomStyleInterface'];
}

window.ShadyCSS = {
  ScopingShim: scopingShim,
  /**
   * @param {!HTMLTemplateElement} template
   * @param {string} elementName
   * @param {string=} elementExtends
   */
  prepareTemplate: function prepareTemplate(template, elementName, elementExtends) {
    scopingShim.flushCustomStyles();
    scopingShim.prepareTemplate(template, elementName, elementExtends);
  },


  /**
   * @param {!HTMLTemplateElement} template
   * @param {string} elementName
   */
  prepareTemplateDom: function prepareTemplateDom(template, elementName) {
    scopingShim.prepareTemplateDom(template, elementName);
  },


  /**
   * @param {!HTMLTemplateElement} template
   * @param {string} elementName
   * @param {string=} elementExtends
   */
  prepareTemplateStyles: function prepareTemplateStyles(template, elementName, elementExtends) {
    scopingShim.flushCustomStyles();
    scopingShim.prepareTemplateStyles(template, elementName, elementExtends);
  },

  /**
   * @param {!HTMLElement} element
   * @param {Object=} properties
   */
  styleSubtree: function styleSubtree(element, properties) {
    scopingShim.flushCustomStyles();
    scopingShim.styleSubtree(element, properties);
  },


  /**
   * @param {!HTMLElement} element
   */
  styleElement: function styleElement(element) {
    scopingShim.flushCustomStyles();
    scopingShim.styleElement(element);
  },


  /**
   * @param {Object=} properties
   */
  styleDocument: function styleDocument(properties) {
    scopingShim.flushCustomStyles();
    scopingShim.styleDocument(properties);
  },
  flushCustomStyles: function flushCustomStyles() {
    scopingShim.flushCustomStyles();
  },


  /**
   * @param {Element} element
   * @param {string} property
   * @return {string}
   */
  getComputedStyleValue: function getComputedStyleValue(element, property) {
    return scopingShim.getComputedStyleValue(element, property);
  },


  nativeCss: _styleSettings.nativeCssVariables,

  nativeShadow: _styleSettings.nativeShadow
};

if (ApplyShim) {
  window.ShadyCSS.ApplyShim = ApplyShim;
}

if (CustomStyleInterface) {
  window.ShadyCSS.CustomStyleInterface = CustomStyleInterface;
}