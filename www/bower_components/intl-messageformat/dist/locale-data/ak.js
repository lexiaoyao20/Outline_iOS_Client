"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "ak", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 0 || n == 1 ? "one" : "other";
  } });