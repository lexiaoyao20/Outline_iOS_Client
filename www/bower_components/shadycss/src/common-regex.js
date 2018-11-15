'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var VAR_ASSIGN = exports.VAR_ASSIGN = /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gi;
var MIXIN_MATCH = exports.MIXIN_MATCH = /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi;
var VAR_CONSUMED = exports.VAR_CONSUMED = /(--[\w-]+)\s*([:,;)]|$)/gi;
var ANIMATION_MATCH = exports.ANIMATION_MATCH = /(animation\s*:)|(animation-name\s*:)/;
var MEDIA_MATCH = exports.MEDIA_MATCH = /@media\s(.*)/;
var IS_VAR = exports.IS_VAR = /^--/;
var BRACKETED = exports.BRACKETED = /\{[^}]*\}/g;
var HOST_PREFIX = exports.HOST_PREFIX = '(?:^|[^.#[:])';
var HOST_SUFFIX = exports.HOST_SUFFIX = '($|[.:[\\s>+~])';