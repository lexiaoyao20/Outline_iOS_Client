"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "kab", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n >= 0 && n < 2 ? "one" : "other";
  } });