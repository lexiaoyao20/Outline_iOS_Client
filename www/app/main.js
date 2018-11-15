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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("url");
var events_1 = require("../model/events");
var app_1 = require("./app");
var environment_1 = require("./environment");
var persistent_server_1 = require("./persistent_server");
var settings_1 = require("./settings");
// Used to determine whether to use Polymer functionality on app initialization failure.
var webComponentsAreReady = false;
document.addEventListener('WebComponentsReady', function () {
    console.debug('received WebComponentsReady event');
    webComponentsAreReady = true;
});
// Used to delay loading the app until (translation) resources have been loaded. This can happen a
// little later than WebComponentsReady.
var oncePolymerIsReady = new Promise(function (resolve) {
    document.addEventListener('app-localize-resources-loaded', function () {
        console.debug('received app-localize-resources-loaded event');
        resolve();
    });
});
// Helpers
// Do not call until WebComponentsReady has fired!
function getRootEl() {
    return document.querySelector('app-root');
}
function createServerRepo(eventQueue, storage, deviceSupport, connectionType) {
    var repo = new persistent_server_1.PersistentServerRepository(connectionType, eventQueue, storage);
    if (!deviceSupport) {
        console.debug('Detected development environment, using fake servers.');
        if (repo.getAll().length === 0) {
            repo.add({ name: 'Fake Working Server', host: '127.0.0.1' });
            repo.add({ name: 'Fake Broken Server', host: '192.0.2.1' });
            repo.add({ name: 'Fake Unreachable Server', host: '10.0.0.24' });
        }
    }
    return repo;
}
function main(platform) {
    return Promise.all([environment_1.onceEnvVars, oncePolymerIsReady])
        .then(function (_a) {
        var _b = __read(_a, 1), environmentVars = _b[0];
        console.debug('running main() function');
        var queryParams = url.parse(document.URL, true).query;
        var debugMode = queryParams.debug === 'true';
        var eventQueue = new events_1.EventQueue();
        var serverRepo = createServerRepo(eventQueue, window.localStorage, platform.hasDeviceSupport(), platform.getPersistentServerFactory());
        var settings = new settings_1.Settings();
        var app = new app_1.App(eventQueue, serverRepo, getRootEl(), debugMode, platform.getUrlInterceptor(), platform.getClipboard(), platform.getErrorReporter(environmentVars), settings, environmentVars, platform.getUpdater(), platform.quitApplication);
    }, function (e) {
        onUnexpectedError(e);
        throw e;
    });
}
exports.main = main;
function onUnexpectedError(error) {
    var rootEl = getRootEl();
    if (webComponentsAreReady && rootEl && rootEl.localize) {
        var localize = rootEl.localize.bind(rootEl);
        rootEl.showToast(localize('error-unexpected'), 120000);
    }
    else {
        // Something went terribly wrong (i.e. Polymer failed to initialize). Provide some messaging to
        // the user, even if we are not able to display it in a toast or localize it.
        // TODO: provide an help email once we have a domain.
        alert("An unexpected error occurred.");
    }
    console.error(error);
}
// Returns Polymer's localization function. Must be called after WebComponentsReady has fired.
function getLocalizationFunction() {
    var rootEl = getRootEl();
    if (!rootEl) {
        return null;
    }
    return rootEl.localize;
}
exports.getLocalizationFunction = getLocalizationFunction;
