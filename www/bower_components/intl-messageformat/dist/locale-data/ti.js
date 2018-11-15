"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "ti", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 0 || n == 1 ? "one" : "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "ti-ER", "parentLocale": "ti" });