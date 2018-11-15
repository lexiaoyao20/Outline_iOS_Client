"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "hy", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return n == 1 ? "one" : "other";return n >= 0 && n < 2 ? "one" : "other";
  } });