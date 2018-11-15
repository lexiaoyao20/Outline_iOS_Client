"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "ja", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return "other";
  } });