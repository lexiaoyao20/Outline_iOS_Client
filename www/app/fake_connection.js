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
/// <reference path='../../types/ambient/outlinePlugin.d.ts'/>
var errors = require("../model/errors");
// Note that because this implementation does not emit disconnection events, "switching" between
// servers in the server list will not work as expected.
var FakeOutlineConnection = /** @class */ (function () {
    function FakeOutlineConnection(config, id) {
        this.config = config;
        this.id = id;
        this.running = false;
    }
    FakeOutlineConnection.prototype.playBroken = function () {
        return this.config.name && this.config.name.toLowerCase().includes('broken');
    };
    FakeOutlineConnection.prototype.playUnreachable = function () {
        return !(this.config.name && this.config.name.toLowerCase().includes('unreachable'));
    };
    FakeOutlineConnection.prototype.start = function () {
        if (this.running) {
            return Promise.resolve();
        }
        if (!this.playUnreachable()) {
            return Promise.reject(new errors.OutlinePluginError(5 /* SERVER_UNREACHABLE */));
        }
        else if (this.playBroken()) {
            return Promise.reject(new errors.OutlinePluginError(8 /* SHADOWSOCKS_START_FAILURE */));
        }
        else {
            this.running = true;
            return Promise.resolve();
        }
    };
    FakeOutlineConnection.prototype.stop = function () {
        if (!this.running) {
            return Promise.resolve();
        }
        this.running = false;
        return Promise.resolve();
    };
    FakeOutlineConnection.prototype.isRunning = function () {
        return Promise.resolve(this.running);
    };
    FakeOutlineConnection.prototype.isReachable = function () {
        return Promise.resolve(!this.playUnreachable());
    };
    FakeOutlineConnection.prototype.onStatusChange = function (listener) {
        // NOOP
    };
    return FakeOutlineConnection;
}());
exports.FakeOutlineConnection = FakeOutlineConnection;
