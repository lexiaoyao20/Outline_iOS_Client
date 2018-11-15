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
var settings_1 = require("./settings");
describe('Settings', function () {
    it('sets and gets settings', function () {
        var key = 'key';
        var value = 'value';
        var settings = new settings_1.Settings(new InMemoryStorage(), FAKE_SETTINGS_KEYS);
        settings.set(key, value);
        expect(settings.get(key)).toEqual(value);
    });
    it('loads existing settings', function () {
        var store = new Map([[settings_1.Settings.STORAGE_KEY, '{"key1": "value1", "key2": "value2"}']]);
        var settings = new settings_1.Settings(new InMemoryStorage(store), FAKE_SETTINGS_KEYS);
        expect(settings.get('key1')).toEqual('value1');
        expect(settings.get('key2')).toEqual('value2');
    });
    it('removes settings', function () {
        var key = 'key';
        var value = 'value';
        var settings = new settings_1.Settings(new InMemoryStorage(), FAKE_SETTINGS_KEYS);
        settings.set(key, value);
        expect(settings.get(key)).toEqual(value);
        settings.remove(key);
        expect(settings.get(key)).toBeUndefined();
    });
    it('persists settings', function () {
        var key = 'key';
        var value = 'value';
        var storage = new InMemoryStorage();
        var settings = new settings_1.Settings(storage, FAKE_SETTINGS_KEYS);
        settings.set(key, value);
        // Instantiate a new settings object to validate that settings have been persisted to storage.
        settings = new settings_1.Settings(storage);
        expect(settings.get(key)).toEqual(value);
    });
    it('returns valid keys', function () {
        var settings = new settings_1.Settings(new InMemoryStorage(), FAKE_SETTINGS_KEYS);
        expect(settings.isValidSetting('key')).toBeTruthy();
    });
    it('returns invalid keys', function () {
        var settings = new settings_1.Settings(new InMemoryStorage(), FAKE_SETTINGS_KEYS);
        expect(settings.isValidSetting('invalidKey')).toBeFalsy();
    });
    it('is initialized with default valid keys', function () {
        // Constructor uses SettingKeys as the default value for valid keys.
        var settings = new settings_1.Settings(new InMemoryStorage());
        expect(settings.isValidSetting(settings_1.SettingsKey.VPN_WARNING_DISMISSED)).toBeTruthy();
    });
    it('throws when setting an invalid key', function () {
        var settings = new settings_1.Settings(new InMemoryStorage(), FAKE_SETTINGS_KEYS);
        expect(function () {
            settings.set('invalidSetting', 'value');
        }).toThrowError();
    });
    it('throws when storage is corrupted', function () {
        var storage = new InMemoryStorage(new Map([[settings_1.Settings.STORAGE_KEY, '"malformed": "json"']]));
        expect(function () {
            var settings = new settings_1.Settings(storage, FAKE_SETTINGS_KEYS);
        }).toThrowError(SyntaxError);
    });
});
var FAKE_SETTINGS_KEYS = ['key', 'key1', 'key2'];
var InMemoryStorage = /** @class */ (function () {
    function InMemoryStorage(store) {
        if (store === void 0) { store = new Map(); }
        this.store = store;
    }
    InMemoryStorage.prototype.clear = function () {
        throw new Error('InMemoryStorage.clear not implemented');
    };
    InMemoryStorage.prototype.getItem = function (key) {
        return this.store.get(key) || null;
    };
    InMemoryStorage.prototype.key = function (index) {
        throw new Error('InMemoryStorage.key not implemented');
    };
    InMemoryStorage.prototype.removeItem = function (key) {
        throw new Error('InMemoryStorage.removeItem not implemented');
    };
    InMemoryStorage.prototype.setItem = function (key, data) {
        this.store.set(key, data);
    };
    return InMemoryStorage;
}());
