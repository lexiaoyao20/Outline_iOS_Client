'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

var _en = require('./en');

var _en2 = _interopRequireDefault(_en);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* jslint esnext: true */

_core2.default.__addLocaleData(_en2.default);
_core2.default.defaultLocale = 'en';

exports.default = _core2.default;