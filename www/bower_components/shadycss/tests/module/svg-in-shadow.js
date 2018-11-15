/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ShadyCSS = window.ShadyCSS;

window.registerSVGElement = function () {
  var LOCAL_NAME = 'svg-in-shadow';
  var TEMPLATE = document.querySelector('template#' + LOCAL_NAME);
  ShadyCSS.prepareTemplate(TEMPLATE, LOCAL_NAME);

  var SVGInShadow = function (_window$HTMLElement) {
    _inherits(SVGInShadow, _window$HTMLElement);

    function SVGInShadow() {
      _classCallCheck(this, SVGInShadow);

      return _possibleConstructorReturn(this, (SVGInShadow.__proto__ || Object.getPrototypeOf(SVGInShadow)).apply(this, arguments));
    }

    _createClass(SVGInShadow, [{
      key: 'connectedCallback',
      value: function connectedCallback() {
        ShadyCSS.styleElement(this);
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(document.importNode(TEMPLATE.content, true));
      }
    }, {
      key: 'addCircle',
      value: function addCircle() {
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        var x = 10 + Math.floor(80 * Math.random());
        var y = 10 + Math.floor(80 * Math.random());
        circle.setAttribute('cx', String(x));
        circle.setAttribute('cy', String(y));
        circle.setAttribute('r', '10');
        this.svg.appendChild(circle);
        return circle;
      }
    }, {
      key: 'svg',
      get: function get() {
        return this.shadowRoot.querySelector('svg');
      }
    }]);

    return SVGInShadow;
  }(window.HTMLElement);

  window.customElements.define(LOCAL_NAME, SVGInShadow);
};