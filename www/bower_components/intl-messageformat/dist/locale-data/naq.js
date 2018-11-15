"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "naq", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 1 ? "one" : n == 2 ? "two" : "other";
  } });