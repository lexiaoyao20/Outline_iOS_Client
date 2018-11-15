'use strict';

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
function makeLookUpLanguage(availableLanguages) {
    return function (languageId) {
        languageId = languageId.toLowerCase();
        for (var _i = 0, availableLanguages_1 = availableLanguages; _i < availableLanguages_1.length; _i++) {
            var availableLanguage = availableLanguages_1[_i];
            var parts = availableLanguage.toLowerCase().split('-');
            while (parts.length) {
                var joined = parts.join('-');
                if (languageId === joined) {
                    return availableLanguage;
                }
                parts.pop();
            }
        }
    };
}
function getBrowserLanguages() {
    // Ensure that navigator.languages is defined and not empty, as can be the case with some browsers
    // (i.e. Chrome 59 on Electron).
    var languages = navigator.languages;
    if (languages && languages.length > 0) {
        return languages;
    }
    return [navigator.language];
}
// tslint:disable-next-line:no-any
window.OutlineI18n = {
    getBestMatchingLanguage: function getBestMatchingLanguage(available) {
        var lookUpAvailable = makeLookUpLanguage(available);
        for (var _i = 0, _a = getBrowserLanguages(); _i < _a.length; _i++) {
            var candidate = _a[_i];
            var parts = candidate.split('-');
            while (parts.length) {
                var joined = parts.join('-');
                var closest = lookUpAvailable(joined);
                if (closest) {
                    return closest;
                }
                parts.pop();
            }
        }
    }
};