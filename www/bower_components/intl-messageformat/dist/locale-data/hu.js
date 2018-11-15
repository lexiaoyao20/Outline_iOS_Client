"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "hu", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return n == 1 || n == 5 ? "one" : "other";return n == 1 ? "one" : "other";
  } });