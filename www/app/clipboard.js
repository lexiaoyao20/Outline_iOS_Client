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
// Generic clipboard. Implementations should only have to implement getContents().
var AbstractClipboard = /** @class */ (function () {
    function AbstractClipboard() {
    }
    AbstractClipboard.prototype.getContents = function () {
        return Promise.reject(new Error('unimplemented skeleton method'));
    };
    AbstractClipboard.prototype.setListener = function (listener) {
        this.listener = listener;
    };
    AbstractClipboard.prototype.emitEvent = function () {
        if (this.listener) {
            this.getContents().then(this.listener);
        }
    };
    return AbstractClipboard;
}());
exports.AbstractClipboard = AbstractClipboard;
