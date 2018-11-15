"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "vi", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return n == 1 ? "one" : "other";return "other";
  } });