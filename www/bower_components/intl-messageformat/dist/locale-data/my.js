"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "my", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return "other";
  } });