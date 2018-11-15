"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "lag", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    var s = String(n).split("."),
        i = s[0];if (ord) return "other";return n == 0 ? "zero" : (i == 0 || i == 1) && n != 0 ? "one" : "other";
  } });