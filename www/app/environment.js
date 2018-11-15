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
// Keep these in sync with the EnvironmentVariables interface above.
var ENV_KEYS = {
    APP_VERSION: 'APP_VERSION',
    APP_BUILD_NUMBER: 'APP_BUILD_NUMBER',
    SENTRY_DSN: 'SENTRY_DSN',
    SENTRY_NATIVE_DSN: 'SENTRY_NATIVE_DSN'
};
function validateEnvVars(json) {
    for (var key in ENV_KEYS) {
        if (!json.hasOwnProperty(key)) {
            throw new Error("Missing environment variable: " + key);
        }
    }
}
// According to http://caniuse.com/#feat=fetch fetch didn't hit iOS Safari
// until v10.3 released 3/26/17, so use XMLHttpRequest instead.
exports.onceEnvVars = new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        try {
            var json = JSON.parse(xhr.responseText);
            validateEnvVars(json);
            console.debug('Resolving with envVars:', json);
            resolve(json);
        }
        catch (err) {
            reject(err);
        }
    };
    xhr.open('GET', 'environment.json', true);
    xhr.send();
});
