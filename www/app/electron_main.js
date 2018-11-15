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
var sentry = require("@sentry/electron");
var electron_1 = require("electron");
var os = require("os");
var clipboard_1 = require("./clipboard");
var fake_connection_1 = require("./fake_connection");
var main_1 = require("./main");
var outline_server_1 = require("./outline_server");
var updater_1 = require("./updater");
var url_interceptor_1 = require("./url_interceptor");
var windows_connection_1 = require("./windows_connection");
// Currently, proxying is only supported on Windows.
var isWindows = os.platform() === 'win32';
var interceptor = new url_interceptor_1.UrlInterceptor();
electron_1.ipcRenderer.on('add-server', function (e, url) {
    interceptor.executeListeners(url);
});
electron_1.ipcRenderer.on('localizationRequest', function (e, localizationKeys) {
    var localize = main_1.getLocalizationFunction();
    if (!localize) {
        console.error('Localization function not available.');
        electron_1.ipcRenderer.send('localizationResponse', null);
        return;
    }
    var localizationResult = {};
    try {
        for (var localizationKeys_1 = __values(localizationKeys), localizationKeys_1_1 = localizationKeys_1.next(); !localizationKeys_1_1.done; localizationKeys_1_1 = localizationKeys_1.next()) {
            var key = localizationKeys_1_1.value;
            localizationResult[key] = localize(key);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (localizationKeys_1_1 && !localizationKeys_1_1.done && (_a = localizationKeys_1.return)) _a.call(localizationKeys_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    electron_1.ipcRenderer.send('localizationResponse', localizationResult);
    var e_1, _a;
});
// Pushes a clipboard event whenever the app window receives focus.
var ElectronClipboard = /** @class */ (function (_super) {
    __extends(ElectronClipboard, _super);
    function ElectronClipboard() {
        var _this = _super.call(this) || this;
        electron_1.ipcRenderer.on('push-clipboard', _this.emitEvent.bind(_this));
        return _this;
    }
    ElectronClipboard.prototype.getContents = function () {
        return Promise.resolve(electron_1.clipboard.readText());
    };
    return ElectronClipboard;
}(clipboard_1.AbstractClipboard));
var ElectronUpdater = /** @class */ (function (_super) {
    __extends(ElectronUpdater, _super);
    function ElectronUpdater() {
        var _this = _super.call(this) || this;
        electron_1.ipcRenderer.on('update-downloaded', _this.emitEvent.bind(_this));
        return _this;
    }
    return ElectronUpdater;
}(updater_1.AbstractUpdater));
var ElectronErrorReporter = /** @class */ (function () {
    function ElectronErrorReporter(appVersion, privateDsn) {
        sentry.init({ dsn: privateDsn, release: appVersion });
    }
    ElectronErrorReporter.prototype.report = function (userFeedback, feedbackCategory, userEmail) {
        sentry.captureEvent({ message: userFeedback, user: { email: userEmail }, tags: { category: feedbackCategory } });
        return Promise.resolve();
    };
    return ElectronErrorReporter;
}());
main_1.main({
    hasDeviceSupport: function () {
        return isWindows;
    },
    getPersistentServerFactory: function () {
        return function (serverId, config, eventQueue) {
            return new outline_server_1.OutlineServer(serverId, config, isWindows ? new windows_connection_1.WindowsOutlineConnection(config, serverId) :
                new fake_connection_1.FakeOutlineConnection(config, serverId), eventQueue);
        };
    },
    getUrlInterceptor: function () {
        return interceptor;
    },
    getClipboard: function () {
        return new ElectronClipboard();
    },
    getErrorReporter: function (env) {
        // Initialise error reporting in the main process.
        electron_1.ipcRenderer.send('environment-info', { 'appVersion': env.APP_VERSION, 'dsn': env.SENTRY_DSN });
        return new ElectronErrorReporter(env.APP_VERSION, env.SENTRY_DSN);
    },
    getUpdater: function () {
        return new ElectronUpdater();
    },
    quitApplication: function () {
        electron_1.ipcRenderer.send('quit-app');
    }
});
