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
var events = require("../model/events");
var OutlineServer = /** @class */ (function () {
    function OutlineServer(id, config, connection, eventQueue) {
        var _this = this;
        this.id = id;
        this.config = config;
        this.connection = connection;
        this.eventQueue = eventQueue;
        this.connection.onStatusChange(function (status) {
            var statusEvent;
            switch (status) {
                case 0 /* CONNECTED */:
                    statusEvent = new events.ServerConnected(_this);
                    break;
                case 1 /* DISCONNECTED */:
                    statusEvent = new events.ServerDisconnected(_this);
                    break;
                case 2 /* RECONNECTING */:
                    statusEvent = new events.ServerReconnecting(_this);
                    break;
                default:
                    console.warn("Received unknown connection status " + status);
                    return;
            }
            eventQueue.enqueue(statusEvent);
        });
    }
    Object.defineProperty(OutlineServer.prototype, "name", {
        get: function () {
            return this.config.name || this.config.host || '';
        },
        set: function (newName) {
            this.config.name = newName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OutlineServer.prototype, "host", {
        get: function () {
            return this.config.host;
        },
        enumerable: true,
        configurable: true
    });
    OutlineServer.prototype.connect = function () {
        return this.connection.start().catch(function (e) {
            // Since "instanceof OutlinePluginError" may not work for errors originating from Sentry,
            // inspect this field directly.
            if (e.errorCode) {
                throw errors.fromErrorCode(e.errorCode);
            }
            else {
                throw new Error("native code did not set errorCode");
            }
        });
    };
    OutlineServer.prototype.disconnect = function () {
        return this.connection.stop().catch(function (e) {
            // TODO: None of the plugins currently return an ErrorCode on disconnection.
            throw new errors.RegularNativeError();
        });
    };
    OutlineServer.prototype.checkRunning = function () {
        return this.connection.isRunning();
    };
    OutlineServer.prototype.checkReachable = function () {
        return this.connection.isReachable();
    };
    return OutlineServer;
}());
exports.OutlineServer = OutlineServer;
