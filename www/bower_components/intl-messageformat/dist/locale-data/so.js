"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "so", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 1 ? "one" : "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "so-DJ", "parentLocale": "so" });
IntlMessageFormat.__addLocaleData({ "locale": "so-ET", "parentLocale": "so" });
IntlMessageFormat.__addLocaleData({ "locale": "so-KE", "parentLocale": "so" });