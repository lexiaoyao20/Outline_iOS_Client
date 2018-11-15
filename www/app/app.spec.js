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
var app_1 = require("./app");
describe('unwrapInvite', function () {
    it('ignores empty string', function () {
        var s = 'i am not a shadowsocks link';
        expect(app_1.unwrapInvite('')).toEqual('');
    });
    it('ignores garbage', function () {
        var s = 'i am not a shadowsocks link';
        expect(app_1.unwrapInvite(s)).toEqual(s);
    });
    it('ignores url without fragment', function () {
        var s = 'https://whatever.com/invite.html';
        expect(app_1.unwrapInvite(s)).toEqual(s);
    });
    it('ignores non-ss fragment', function () {
        var s = 'https://whatever.com/invite.html#iamjustaname';
        expect(app_1.unwrapInvite(s)).toEqual(s);
    });
    it('detects ss fragment', function () {
        var s = 'ss://myhost.com:3333';
        expect(app_1.unwrapInvite("https://whatever.com/invite.html#" + encodeURIComponent(s))).toEqual(s);
    });
    it('handles fragment after redirect', function () {
        var s = 'ss://myhost.com:3333';
        expect(app_1.unwrapInvite("https://whatever.com/invite.html#/en/invite/" + encodeURIComponent(s)))
            .toEqual(s);
    });
});
