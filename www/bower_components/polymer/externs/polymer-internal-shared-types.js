"use strict";

/**
 * @fileoverview Internal shared types for Polymer
 *
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/* eslint-disable no-unused-vars, strict, valid-jsdoc */

/**
 * @constructor
 * @extends {DocumentFragment}
 */
function StampedTemplate() {}
/** @type {boolean} */
StampedTemplate.prototype.__noInsertionPoint;
/** @type {!Array<!Node>} */
StampedTemplate.prototype.nodeList;
/** @type {!Object<string, !Element>} */
StampedTemplate.prototype.$;
/** @type {!TemplateInfo | undefined} */
StampedTemplate.prototype.templateInfo;

/** @interface */
function NodeInfo() {}
/** @type {string} */
NodeInfo.prototype.id;
/** @type {!Array<{name: string, value: string}>}*/
NodeInfo.prototype.events;
/** @type {boolean} */
NodeInfo.prototype.hasInsertionPoint;
/** @type {!TemplateInfo} */
NodeInfo.prototype.templateInfo;
/** @type {!NodeInfo} */
NodeInfo.prototype.parentInfo;
/** @type {number} */
NodeInfo.prototype.parentIndex;
/** @type {number} */
NodeInfo.prototype.infoIndex;
/** @type {!Array<!Binding>} */
NodeInfo.prototype.bindings;

/** @interface */
function TemplateInfo() {}
/** @type {!Array<!NodeInfo>} */
TemplateInfo.prototype.nodeInfoList;
/** @type {!Array<!Node>} */
TemplateInfo.prototype.nodeList;
/** @type {boolean} */
TemplateInfo.prototype.stripWhitespace;
/** @type {boolean | undefined} */
TemplateInfo.prototype.hasInsertionPoint;
/** @type {!Object} */
TemplateInfo.prototype.hostProps;
/** @type {!Object} */
TemplateInfo.prototype.propertyEffects;
/** @type {TemplateInfo | undefined} */
TemplateInfo.prototype.nextTemplateInfo;
/** @type {TemplateInfo | undefined} */
TemplateInfo.prototype.previousTemplateInfo;
/** @type {!Array<!Node>} */
TemplateInfo.prototype.childNodes;
/** @type {boolean} */
TemplateInfo.prototype.wasPreBound;

/**
 * type for HTMLTemplateElement with `_templateInfo`
 *
 * @constructor
 * @extends {HTMLTemplateElement}
 */
function HTMLTemplateElementWithInfo() {}
/** @type {TemplateInfo} */
HTMLTemplateElementWithInfo.prototype._templateInfo;

/**
 * @typedef {{
 * literal: string,
 * compoundIndex: (number | undefined)
 * }}
 */
var LiteralBindingPart = void 0;

/**
 * @typedef {{
 * literal: boolean,
 * name: string,
 * value: (string | number),
 * rootProperty: (string | undefined),
 * structured: (boolean | undefined),
 * wildcard: (boolean | undefined)
 * }}
 */
var MethodArg = void 0;

/**
 * @typedef {{
 * methodName: string,
 * static: boolean,
 * args: !Array<!MethodArg>,
 * dynamicFn: (boolean | undefined),
 * }}
 */
var MethodSignature = void 0;

/**
 * @typedef {{
 * mode: string,
 * negate: boolean,
 * source: string,
 * dependencies: !Array<(!MethodArg|string)>,
 * customEvent: boolean,
 * signature: Object,
 * event: string
 * }}
 */
var ExpressionBindingPart = void 0;

/**
 * @typedef {LiteralBindingPart | ExpressionBindingPart}
 */
var BindingPart = void 0;

/**
 * @typedef {{
 * kind: string,
 * target: string,
 * parts: Array<!BindingPart>,
 * literal: (string | undefined),
 * isCompound: boolean,
 * listenerEvent: (string | undefined),
 * listenerNegate: (boolean | undefined)
 * }}
 */
var Binding = void 0;

/**
 * @typedef {{
 * path: string
 * }}
 */
var PathInfo = void 0;

/**
 * @typedef {{
 * forwardHostProp: (function(string, *) | undefined),
 * instanceProps: (Object | undefined),
 * mutableData: (boolean | undefined),
 * notifyInstanceProp: (function(*, string, *) | undefined),
 * parentModel: (boolean | undefined)
 * }}
 */
var TemplatizeOptions = void 0;

/** @record */
function AsyncInterface() {}
/** @type {function(!Function, number=): number} */
AsyncInterface.prototype.run;
/** @type {function(number): void} */
AsyncInterface.prototype.cancel;