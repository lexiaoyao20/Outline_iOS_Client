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
exports.flush = undefined;
exports.getCurrentScope = getCurrentScope;
exports.getOwnerScope = getOwnerScope;
exports.ensureCorrectScope = ensureCorrectScope;
exports.ensureCorrectSubtreeScoping = ensureCorrectSubtreeScoping;

var _styleSettings = require('./style-settings.js');

var _styleTransformer = require('./style-transformer.js');

var _styleTransformer2 = _interopRequireDefault(_styleTransformer);

var _styleUtil = require('./style-util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var flush = exports.flush = function flush() {};

/**
 * @param {!Element} element
 * @return {!Array<string>}
 */
function getClasses(element) {
  var classes = [];
  if (element.classList) {
    classes = Array.from(element.classList);
  } else if (element instanceof window['SVGElement'] && element.hasAttribute('class')) {
    classes = element.getAttribute('class').split(/\s+/);
  }
  return classes;
}

/**
 * @param {!Element} element
 * @return {string}
 */
function getCurrentScope(element) {
  var classes = getClasses(element);
  var idx = classes.indexOf(_styleTransformer2.default.SCOPE_NAME);
  if (idx > -1) {
    return classes[idx + 1];
  }
  return '';
}

/**
 * @param {!Node} node
 */
function getOwnerScope(node) {
  var ownerRoot = node.getRootNode();
  if (ownerRoot === node || ownerRoot === node.ownerDocument) {
    return '';
  }
  var host = /** @type {!ShadowRoot} */ownerRoot.host;
  if (!host) {
    // this may actually be a document fragment
    return '';
  }
  return (0, _styleUtil.getIsExtends)(host).is;
}

/**
 * @param {!Element} element
 */
function ensureCorrectScope(element) {
  var currentScope = getCurrentScope(element);
  var ownerRoot = element.getRootNode();
  if (ownerRoot === element) {
    return;
  }
  if (currentScope && ownerRoot === element.ownerDocument) {
    // node was scoped, but now is in document
    _styleTransformer2.default.domRemoveScope(element, currentScope);
  } else if (ownerRoot instanceof ShadowRoot) {
    var ownerScope = getOwnerScope(element);
    if (ownerScope !== currentScope) {
      // node was scoped, but not by its current owner
      _styleTransformer2.default.domReplaceScope(element, currentScope, ownerScope);
    }
  }
}

/**
 * @param {!HTMLElement|!HTMLDocument} element
 */
function ensureCorrectSubtreeScoping(element) {
  // find unscoped subtree nodes
  var unscopedNodes = window['ShadyDOM']['nativeMethods']['querySelectorAll'].call(element, ':not(.' + _styleTransformer2.default.SCOPE_NAME + ')');

  for (var j = 0; j < unscopedNodes.length; j++) {
    // it's possible, during large batch inserts, that nodes that aren't
    // scoped within the current scope were added.
    // To make sure that any unscoped nodes that were inserted in the current batch are correctly styled,
    // query all unscoped nodes and force their style-scope to be applied.
    // This could happen if a sub-element appended an unscoped node in its shadowroot and this function
    // runs on a parent element of the host of that unscoped node:
    // parent-element -> element -> unscoped node
    // Here unscoped node should have the style-scope element, not parent-element.
    var unscopedNode = unscopedNodes[j];
    var scopeForPreviouslyUnscopedNode = getOwnerScope(unscopedNode);
    if (scopeForPreviouslyUnscopedNode) {
      _styleTransformer2.default.element(unscopedNode, scopeForPreviouslyUnscopedNode);
    }
  }
}

/**
 * @param {HTMLElement} el
 * @return {boolean}
 */
function isElementWithBuiltCss(el) {
  if (el.localName === 'style' || el.localName === 'template') {
    return (0, _styleUtil.elementHasBuiltCss)(el);
  }
  return false;
}

/**
 * @param {Array<MutationRecord|null>|null} mxns
 */
function handler(mxns) {
  for (var x = 0; x < mxns.length; x++) {
    var mxn = mxns[x];
    if (mxn.target === document.documentElement || mxn.target === document.head) {
      continue;
    }
    for (var i = 0; i < mxn.addedNodes.length; i++) {
      var n = mxn.addedNodes[i];
      if (n.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }
      n = /** @type {HTMLElement} */n; // eslint-disable-line no-self-assign
      var root = n.getRootNode();
      var currentScope = getCurrentScope(n);
      // node was scoped, but now is in document
      // If this element has built css, we must not remove scoping as this node
      // will be used as a template or style without re - applying scoping as an optimization
      if (currentScope && root === n.ownerDocument && !isElementWithBuiltCss(n)) {
        _styleTransformer2.default.domRemoveScope(n, currentScope);
      } else if (root instanceof ShadowRoot) {
        var newScope = getOwnerScope(n);
        // rescope current node and subtree if necessary
        if (newScope !== currentScope) {
          _styleTransformer2.default.domReplaceScope(n, currentScope, newScope);
        }
        // make sure all the subtree elements are scoped correctly
        ensureCorrectSubtreeScoping(n);
      }
    }
  }
}

// if native Shadow DOM is being used, or ShadyDOM handles dynamic scoiping, do not activate the MutationObserver
if (!_styleSettings.nativeShadow && !(window['ShadyDOM'] && window['ShadyDOM']['handlesDynamicScoping'])) {
  var observer = new MutationObserver(handler);
  var start = function start(node) {
    observer.observe(node, { childList: true, subtree: true });
  };
  var nativeCustomElements = window['customElements'] && !window['customElements']['polyfillWrapFlushCallback'];
  // need to start immediately with native custom elements
  // TODO(dfreedm): with polyfilled HTMLImports and native custom elements
  // excessive mutations may be observed; this can be optimized via cooperation
  // with the HTMLImports polyfill.
  if (nativeCustomElements) {
    start(document);
  } else {
    var delayedStart = function delayedStart() {
      start(document.body);
    };
    // use polyfill timing if it's available
    if (window['HTMLImports']) {
      window['HTMLImports']['whenReady'](delayedStart);
      // otherwise push beyond native imports being ready
      // which requires RAF + readystate interactive.
    } else {
      requestAnimationFrame(function () {
        if (document.readyState === 'loading') {
          var listener = function listener() {
            delayedStart();
            document.removeEventListener('readystatechange', listener);
          };
          document.addEventListener('readystatechange', listener);
        } else {
          delayedStart();
        }
      });
    }
  }

  exports.flush = flush = function flush() {
    handler(observer.takeRecords());
  };
}