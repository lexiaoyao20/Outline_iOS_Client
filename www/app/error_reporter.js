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
Object.defineProperty(exports, "__esModule", { value: true });
var Raven = require("raven-js");
var SentryErrorReporter = /** @class */ (function () {
    function SentryErrorReporter(appVersion, dsn, tags) {
        Raven.config(dsn, { release: appVersion, 'tags': tags }).install();
        this.setUpUnhandledRejectionListener();
    }
    SentryErrorReporter.prototype.report = function (userFeedback, feedbackCategory, userEmail) {
        Raven.setUserContext({ email: userEmail || '' });
        Raven.captureMessage(userFeedback, { tags: { category: feedbackCategory } });
        Raven.setUserContext(); // Reset the user context, don't cache the email
        return Promise.resolve();
    };
    SentryErrorReporter.prototype.setUpUnhandledRejectionListener = function () {
        // Chrome is the only browser that supports the unhandledrejection event.
        // This is fine for Android, but will not work in iOS.
        var unhandledRejection = 'unhandledrejection';
        window.addEventListener(unhandledRejection, function (event) {
            var reason = event.reason;
            var msg = reason.stack ? reason.stack : reason;
            Raven.captureBreadcrumb({ message: msg, category: unhandledRejection });
        });
    };
    return SentryErrorReporter;
}());
exports.SentryErrorReporter = SentryErrorReporter;
