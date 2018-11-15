"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path='../../types/ambient/webintents.d.ts'/>
var UrlInterceptor = /** @class */ (function () {
    function UrlInterceptor() {
        this.listeners = [];
    }
    UrlInterceptor.prototype.registerListener = function (listener) {
        this.listeners.push(listener);
        if (this.launchUrl) {
            listener(this.launchUrl);
            this.launchUrl = undefined;
        }
    };
    UrlInterceptor.prototype.executeListeners = function (url) {
        if (!url) {
            return;
        }
        if (!this.listeners.length) {
            console.log('no listeners have been added, delaying intent firing');
            this.launchUrl = url;
            return;
        }
        try {
            for (var _a = __values(this.listeners), _b = _a.next(); !_b.done; _b = _a.next()) {
                var listener = _b.value;
                listener(url);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var e_1, _c;
    };
    return UrlInterceptor;
}());
exports.UrlInterceptor = UrlInterceptor;
var AndroidUrlInterceptor = /** @class */ (function (_super) {
    __extends(AndroidUrlInterceptor, _super);
    function AndroidUrlInterceptor() {
        var _this = _super.call(this) || this;
        window.webintent.getUri(function (launchUrl) {
            window.webintent.onNewIntent(_this.executeListeners.bind(_this));
            _this.executeListeners(launchUrl);
        });
        return _this;
    }
    return AndroidUrlInterceptor;
}(UrlInterceptor));
exports.AndroidUrlInterceptor = AndroidUrlInterceptor;
var AppleUrlInterceptor = /** @class */ (function (_super) {
    __extends(AppleUrlInterceptor, _super);
    function AppleUrlInterceptor(launchUrl) {
        var _this = _super.call(this) || this;
        // cordova-[ios|osx] call a global function with this signature when a URL is intercepted.
        // We define it in |cordova_main|, redefine it to use this interceptor.
        window.handleOpenURL = function (url) {
            _this.executeListeners(url);
        };
        if (launchUrl) {
            _this.executeListeners(launchUrl);
        }
        return _this;
    }
    return AppleUrlInterceptor;
}(UrlInterceptor));
exports.AppleUrlInterceptor = AppleUrlInterceptor;
