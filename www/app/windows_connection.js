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
var electron_1 = require("electron");
var promiseIpc = require("electron-promise-ipc");
var errors = require("../model/errors");
var WindowsOutlineConnection = /** @class */ (function () {
    function WindowsOutlineConnection(config, id) {
        var _this = this;
        this.config = config;
        this.id = id;
        this.running = false;
        var serverName = this.config.name || this.config.host || '';
        // This event is received when the proxy connects. It is mainly used for signaling the UI that
        // the proxy has been automatically connected at startup (if the user was connected at shutdown)
        electron_1.ipcRenderer.once("proxy-connected-" + this.id, function (e) {
            _this.handleStatusChange(0 /* CONNECTED */);
        });
        electron_1.ipcRenderer.on("proxy-reconnecting-" + this.id, function (e) {
            _this.handleStatusChange(2 /* RECONNECTING */);
        });
    }
    WindowsOutlineConnection.prototype.start = function () {
        var _this = this;
        if (this.running) {
            return Promise.resolve();
        }
        electron_1.ipcRenderer.once("proxy-disconnected-" + this.id, function (e) {
            _this.handleStatusChange(1 /* DISCONNECTED */);
        });
        return promiseIpc.send('start-proxying', { config: this.config, id: this.id })
            .then(function () {
            _this.running = true;
        })
            .catch(function (e) {
            throw new errors.OutlinePluginError(parseInt(e.message, 10));
        });
    };
    WindowsOutlineConnection.prototype.stop = function () {
        var _this = this;
        if (!this.running) {
            return Promise.resolve();
        }
        return promiseIpc.send('stop-proxying').then(function () {
            _this.running = false;
        });
    };
    WindowsOutlineConnection.prototype.isRunning = function () {
        return Promise.resolve(this.running);
    };
    WindowsOutlineConnection.prototype.isReachable = function () {
        return promiseIpc.send('is-reachable', this.config);
    };
    WindowsOutlineConnection.prototype.onStatusChange = function (listener) {
        this.statusChangeListener = listener;
    };
    WindowsOutlineConnection.prototype.handleStatusChange = function (status) {
        this.running = status === 0 /* CONNECTED */;
        if (this.statusChangeListener) {
            this.statusChangeListener(status);
        }
        else {
            console.error(this.id + " status changed to " + status + " but no listener set");
        }
    };
    return WindowsOutlineConnection;
}());
exports.WindowsOutlineConnection = WindowsOutlineConnection;
