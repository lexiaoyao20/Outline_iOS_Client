"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "or", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 1 ? "one" : "other";
  } });