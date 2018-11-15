"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "zh", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "zh-Hans", "parentLocale": "zh" });
IntlMessageFormat.__addLocaleData({ "locale": "zh-Hans-HK", "parentLocale": "zh-Hans" });
IntlMessageFormat.__addLocaleData({ "locale": "zh-Hans-MO", "parentLocale": "zh-Hans" });
IntlMessageFormat.__addLocaleData({ "locale": "zh-Hans-SG", "parentLocale": "zh-Hans" });
IntlMessageFormat.__addLocaleData({ "locale": "zh-Hant", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "zh-Hant-HK", "parentLocale": "zh-Hant" });
IntlMessageFormat.__addLocaleData({ "locale": "zh-Hant-MO", "parentLocale": "zh-Hant-HK" });