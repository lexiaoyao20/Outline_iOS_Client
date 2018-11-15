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
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path='../../types/ambient/outlinePlugin.d.ts'/>
/// <reference path='../../types/ambient/webintents.d.ts'/>
var Raven = require("raven-js");
var clipboard_1 = require("./clipboard");
var error_reporter_1 = require("./error_reporter");
var fake_connection_1 = require("./fake_connection");
var main_1 = require("./main");
var outline_server_1 = require("./outline_server");
var updater_1 = require("./updater");
var interceptors = require("./url_interceptor");
// Pushes a clipboard event whenever the app is brought to the foreground.
var CordovaClipboard = /** @class */ (function (_super) {
    __extends(CordovaClipboard, _super);
    function CordovaClipboard() {
        var _this = _super.call(this) || this;
        document.addEventListener('resume', _this.emitEvent.bind(_this));
        return _this;
    }
    CordovaClipboard.prototype.getContents = function () {
        return new Promise(function (resolve, reject) {
            cordova.plugins.clipboard.paste(resolve, reject);
        });
    };
    return CordovaClipboard;
}(clipboard_1.AbstractClipboard));
// Adds reports from the (native) Cordova plugin.
var CordovaErrorReporter = /** @class */ (function (_super) {
    __extends(CordovaErrorReporter, _super);
    function CordovaErrorReporter(appVersion, appBuildNumber, dsn, nativeDsn) {
        var _this = _super.call(this, appVersion, dsn, { 'build.number': appBuildNumber }) || this;
        cordova.plugins.outline.log.initialize(nativeDsn).catch(console.error);
        return _this;
    }
    CordovaErrorReporter.prototype.report = function (userFeedback, feedbackCategory, userEmail) {
        return _super.prototype.report.call(this, userFeedback, feedbackCategory, userEmail).then(function () {
            return cordova.plugins.outline.log.send(Raven.lastEventId());
        });
    };
    return CordovaErrorReporter;
}(error_reporter_1.SentryErrorReporter));
exports.CordovaErrorReporter = CordovaErrorReporter;
// This class should only be instantiated after Cordova fires the deviceready event.
var CordovaPlatform = /** @class */ (function () {
    function CordovaPlatform() {
    }
    CordovaPlatform.isBrowser = function () {
        return device.platform === 'browser';
    };
    CordovaPlatform.prototype.hasDeviceSupport = function () {
        return !CordovaPlatform.isBrowser();
    };
    CordovaPlatform.prototype.getPersistentServerFactory = function () {
        var _this = this;
        return function (serverId, config, eventQueue) {
            return new outline_server_1.OutlineServer(serverId, config, _this.hasDeviceSupport() ? new cordova.plugins.outline.Connection(config, serverId) :
                new fake_connection_1.FakeOutlineConnection(config, serverId), eventQueue);
        };
    };
    CordovaPlatform.prototype.getUrlInterceptor = function () {
        if (device.platform === 'iOS' || device.platform === 'Mac OS X') {
            return new interceptors.AppleUrlInterceptor(appleLaunchUrl);
        }
        else if (device.platform === 'Android') {
            return new interceptors.AndroidUrlInterceptor();
        }
        console.warn('no intent interceptor available');
        return new interceptors.UrlInterceptor();
    };
    CordovaPlatform.prototype.getClipboard = function () {
        return new CordovaClipboard();
    };
    CordovaPlatform.prototype.getErrorReporter = function (env) {
        return this.hasDeviceSupport() ?
            new CordovaErrorReporter(env.APP_VERSION, env.APP_BUILD_NUMBER, env.SENTRY_DSN, env.SENTRY_NATIVE_DSN) :
            new error_reporter_1.SentryErrorReporter(env.APP_VERSION, env.SENTRY_DSN, {});
    };
    CordovaPlatform.prototype.getUpdater = function () {
        return new updater_1.AbstractUpdater();
    };
    CordovaPlatform.prototype.quitApplication = function () {
        // Only used in macOS because menu bar apps provide no alternative way of quitting.
        cordova.plugins.outline.quitApplication();
    };
    return CordovaPlatform;
}());
// https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
var onceDeviceReady = new Promise(function (resolve) {
    document.addEventListener('deviceready', resolve);
});
// cordova-[ios|osx] call a global function with this signature when a URL is
// intercepted. We handle URL interceptions with an intent interceptor; however,
// when the app is launched via URL our start up sequence misses the call due to
// a race. Define the function temporarily here, and set a global variable.
var appleLaunchUrl;
window.handleOpenURL = function (url) {
    appleLaunchUrl = url;
};
onceDeviceReady.then(function () {
    main_1.main(new CordovaPlatform());
});
