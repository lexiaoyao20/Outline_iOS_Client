"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "tzm", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    var s = String(n).split("."),
        t0 = Number(s[0]) == n;if (ord) return "other";return n == 0 || n == 1 || t0 && n >= 11 && n <= 99 ? "one" : "other";
  } });