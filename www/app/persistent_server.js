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
var uuid_1 = require("uuid");
var errors_1 = require("../model/errors");
var events = require("../model/events");
// Maintains a persisted set of servers and liaises with the core.
var PersistentServerRepository = /** @class */ (function () {
    function PersistentServerRepository(createServer, eventQueue, storage) {
        this.createServer = createServer;
        this.eventQueue = eventQueue;
        this.storage = storage;
        this.loadServers();
    }
    PersistentServerRepository.prototype.getAll = function () {
        return Array.from(this.serverById.values());
    };
    PersistentServerRepository.prototype.getById = function (serverId) {
        return this.serverById.get(serverId);
    };
    PersistentServerRepository.prototype.add = function (serverConfig) {
        var alreadyAddedServer = this.serverFromConfig(serverConfig);
        if (alreadyAddedServer) {
            throw new errors_1.ServerAlreadyAdded(alreadyAddedServer);
        }
        var server = this.createServer(uuid_1.v4(), serverConfig, this.eventQueue);
        this.serverById.set(server.id, server);
        this.storeServers();
        this.eventQueue.enqueue(new events.ServerAdded(server));
    };
    PersistentServerRepository.prototype.rename = function (serverId, newName) {
        var server = this.serverById.get(serverId);
        if (!server) {
            console.warn("Cannot rename nonexistent server " + serverId);
            return;
        }
        server.name = newName;
        this.storeServers();
        this.eventQueue.enqueue(new events.ServerRenamed(server));
    };
    PersistentServerRepository.prototype.forget = function (serverId) {
        var server = this.serverById.get(serverId);
        if (!server) {
            console.warn("Cannot remove nonexistent server " + serverId);
            return;
        }
        this.serverById.delete(serverId);
        this.lastForgottenServer = server;
        this.storeServers();
        this.eventQueue.enqueue(new events.ServerForgotten(server));
    };
    PersistentServerRepository.prototype.undoForget = function (serverId) {
        if (!this.lastForgottenServer) {
            console.warn('No forgotten server to unforget');
            return;
        }
        else if (this.lastForgottenServer.id !== serverId) {
            console.warn('id of forgotten server', this.lastForgottenServer, 'does not match', serverId);
            return;
        }
        this.serverById.set(this.lastForgottenServer.id, this.lastForgottenServer);
        this.storeServers();
        this.eventQueue.enqueue(new events.ServerForgetUndone(this.lastForgottenServer));
        this.lastForgottenServer = null;
    };
    PersistentServerRepository.prototype.containsServer = function (config) {
        return !!this.serverFromConfig(config);
    };
    PersistentServerRepository.prototype.serverFromConfig = function (config) {
        try {
            for (var _a = __values(this.getAll()), _b = _a.next(); !_b.done; _b = _a.next()) {
                var server = _b.value;
                if (configsMatch(server.config, config)) {
                    return server;
                }
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
    PersistentServerRepository.prototype.storeServers = function () {
        var configById = {};
        try {
            for (var _a = __values(this.serverById.values()), _b = _a.next(); !_b.done; _b = _a.next()) {
                var server = _b.value;
                configById[server.id] = server.config;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var json = JSON.stringify(configById);
        this.storage.setItem(PersistentServerRepository.SERVERS_STORAGE_KEY, json);
        var e_2, _c;
    };
    // Loads servers from storage,
    // raising an error if there is any problem loading.
    PersistentServerRepository.prototype.loadServers = function () {
        this.serverById = new Map();
        var serversJson = this.storage.getItem(PersistentServerRepository.SERVERS_STORAGE_KEY);
        if (!serversJson) {
            console.debug("no servers found in storage");
            return;
        }
        var configById = {};
        try {
            configById = JSON.parse(serversJson);
        }
        catch (e) {
            throw new Error("could not parse saved servers: " + e.message);
        }
        for (var serverId in configById) {
            if (configById.hasOwnProperty(serverId)) {
                var config = configById[serverId];
                try {
                    var server = this.createServer(serverId, config, this.eventQueue);
                    this.serverById.set(serverId, server);
                }
                catch (e) {
                    // Don't propagate so other stored servers can be created.
                    console.error(e);
                }
            }
        }
    };
    // Name by which servers are saved to storage.
    PersistentServerRepository.SERVERS_STORAGE_KEY = 'servers';
    return PersistentServerRepository;
}());
exports.PersistentServerRepository = PersistentServerRepository;
function configsMatch(left, right) {
    return left.host === right.host && left.port === right.port && left.method === right.method &&
        left.password === right.password;
}
