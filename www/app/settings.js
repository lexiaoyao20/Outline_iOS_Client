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
// Setting keys supported by the `Settings` class.
var SettingsKey;
(function (SettingsKey) {
    SettingsKey["VPN_WARNING_DISMISSED"] = "vpn-warning-dismissed";
    SettingsKey["AUTO_CONNECT_DIALOG_DISMISSED"] = "auto-connect-dialog-dismissed";
    SettingsKey["PRIVACY_ACK"] = "privacy-ack";
})(SettingsKey = exports.SettingsKey || (exports.SettingsKey = {}));
// Persistent storage for user settings that supports a limited set of keys.
var Settings = /** @class */ (function () {
    function Settings(storage, validKeys) {
        if (storage === void 0) { storage = window.localStorage; }
        if (validKeys === void 0) { validKeys = Object.values(SettingsKey); }
        this.storage = storage;
        this.validKeys = validKeys;
        this.settings = new Map();
        this.loadSettings();
    }
    Settings.prototype.get = function (key) {
        return this.settings.get(key);
    };
    Settings.prototype.set = function (key, value) {
        if (!this.isValidSetting(key)) {
            throw new Error("Cannot set invalid key " + key);
        }
        this.settings.set(key, value);
        this.storeSettings();
    };
    Settings.prototype.remove = function (key) {
        this.settings.delete(key);
        this.storeSettings();
    };
    Settings.prototype.isValidSetting = function (key) {
        return this.validKeys.includes(key);
    };
    Settings.prototype.loadSettings = function () {
        var settingsJson = this.storage.getItem(Settings.STORAGE_KEY);
        if (!settingsJson) {
            console.debug("No settings found in storage");
            return;
        }
        var storageSettings = JSON.parse(settingsJson);
        for (var key in storageSettings) {
            if (storageSettings.hasOwnProperty(key)) {
                this.settings.set(key, storageSettings[key]);
            }
        }
    };
    Settings.prototype.storeSettings = function () {
        var storageSettings = {};
        try {
            for (var _a = __values(this.settings), _b = _a.next(); !_b.done; _b = _a.next()) {
                var _c = __read(_b.value, 2), key = _c[0], value = _c[1];
                storageSettings[key] = value;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var storageSettingsJson = JSON.stringify(storageSettings);
        this.storage.setItem(Settings.STORAGE_KEY, storageSettingsJson);
        var e_1, _d;
    };
    Settings.STORAGE_KEY = 'settings';
    return Settings;
}());
exports.Settings = Settings;
