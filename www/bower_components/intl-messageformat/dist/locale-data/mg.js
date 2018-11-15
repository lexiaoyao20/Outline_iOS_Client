"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "mg", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 0 || n == 1 ? "one" : "other";
  } });