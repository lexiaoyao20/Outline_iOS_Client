"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "ss", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 1 ? "one" : "other";
  } });