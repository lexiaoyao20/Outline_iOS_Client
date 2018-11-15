"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "ksb", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 1 ? "one" : "other";
  } });