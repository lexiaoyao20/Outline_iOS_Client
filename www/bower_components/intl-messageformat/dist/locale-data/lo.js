"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "lo", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return n == 1 ? "one" : "other";return "other";
  } });