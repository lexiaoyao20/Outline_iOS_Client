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
var ServerAdded = /** @class */ (function () {
    function ServerAdded(server) {
        this.server = server;
    }
    return ServerAdded;
}());
exports.ServerAdded = ServerAdded;
var ServerAlreadyAdded = /** @class */ (function () {
    function ServerAlreadyAdded(server) {
        this.server = server;
    }
    return ServerAlreadyAdded;
}());
exports.ServerAlreadyAdded = ServerAlreadyAdded;
var ServerForgotten = /** @class */ (function () {
    function ServerForgotten(server) {
        this.server = server;
    }
    return ServerForgotten;
}());
exports.ServerForgotten = ServerForgotten;
var ServerForgetUndone = /** @class */ (function () {
    function ServerForgetUndone(server) {
        this.server = server;
    }
    return ServerForgetUndone;
}());
exports.ServerForgetUndone = ServerForgetUndone;
var ServerRenamed = /** @class */ (function () {
    function ServerRenamed(server) {
        this.server = server;
    }
    return ServerRenamed;
}());
exports.ServerRenamed = ServerRenamed;
var ServerUrlInvalid = /** @class */ (function () {
    function ServerUrlInvalid(serverUrl) {
        this.serverUrl = serverUrl;
    }
    return ServerUrlInvalid;
}());
exports.ServerUrlInvalid = ServerUrlInvalid;
var ServerConnected = /** @class */ (function () {
    function ServerConnected(server) {
        this.server = server;
    }
    return ServerConnected;
}());
exports.ServerConnected = ServerConnected;
var ServerDisconnected = /** @class */ (function () {
    function ServerDisconnected(server) {
        this.server = server;
    }
    return ServerDisconnected;
}());
exports.ServerDisconnected = ServerDisconnected;
var ServerReconnecting = /** @class */ (function () {
    function ServerReconnecting(server) {
        this.server = server;
    }
    return ServerReconnecting;
}());
exports.ServerReconnecting = ServerReconnecting;
// Simple publisher-subscriber queue.
var EventQueue = /** @class */ (function () {
    function EventQueue() {
        this.queuedEvents = [];
        this.listenersByEventType = new Map();
        this.isStarted = false;
        this.isPublishing = false;
    }
    EventQueue.prototype.startPublishing = function () {
        this.isStarted = true;
        this.publishQueuedEvents();
    };
    // Registers a listener for events of the type of the given constructor.
    EventQueue.prototype.subscribe = function (eventType, listener) {
        var listeners = this.listenersByEventType.get(eventType);
        if (!listeners) {
            listeners = [];
            this.listenersByEventType.set(eventType, listeners);
        }
        listeners.push(listener);
    };
    // Enqueues the given event for publishing and publishes all queued events if
    // publishing is not already happening.
    //
    // The enqueue method is reentrant: it may be called by an event listener
    // during the publishing of the events. In that case the method adds the event
    // to the end of the queue and returns immediately.
    //
    // This guarantees that events are published and handled in the order that
    // they are queued.
    //
    // There's no guarantee that the subscribers for the event have been called by
    // the time this function returns.
    EventQueue.prototype.enqueue = function (event) {
        this.queuedEvents.push(event);
        if (this.isStarted) {
            this.publishQueuedEvents();
        }
    };
    // Triggers the subscribers for all the enqueued events.
    EventQueue.prototype.publishQueuedEvents = function () {
        if (this.isPublishing)
            return;
        this.isPublishing = true;
        while (this.queuedEvents.length > 0) {
            var event_1 = this.queuedEvents.shift();
            var listeners = this.listenersByEventType.get(event_1.constructor);
            if (!listeners) {
                console.warn('Dropping event with no listeners:', event_1);
                continue;
            }
            try {
                for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
                    var listener = listeners_1_1.value;
                    listener(event_1);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        this.isPublishing = false;
        var e_1, _a;
    };
    return EventQueue;
}());
exports.EventQueue = EventQueue;
