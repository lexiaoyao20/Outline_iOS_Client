"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "xog", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 1 ? "one" : "other";
  } });