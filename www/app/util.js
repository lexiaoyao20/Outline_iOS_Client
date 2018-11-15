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
var errors = require("../model/errors");
// tslint:disable-next-line:no-any
function timeoutPromise(promise, ms, name) {
    if (name === void 0) { name = ''; }
    // tslint:disable-next-line:no-any
    var winner;
    var timeout = new Promise(function (resolve, reject) {
        var timeoutId = setTimeout(function () {
            clearTimeout(timeoutId);
            if (winner) {
                console.log("Promise \"" + name + "\" resolved before " + ms + " ms.");
                resolve();
            }
            else {
                console.log("Promise \"" + name + "\" timed out after " + ms + " ms.");
                reject(new errors.OperationTimedOut(ms, name));
            }
        }, ms);
    });
    winner = Promise.race([promise, timeout]);
    return winner;
}
exports.timeoutPromise = timeoutPromise;
