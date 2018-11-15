"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "ksh", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 0 ? "zero" : n == 1 ? "one" : "other";
  } });