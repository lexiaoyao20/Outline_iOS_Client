"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "ga", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    var s = String(n).split("."),
        t0 = Number(s[0]) == n;if (ord) return n == 1 ? "one" : "other";return n == 1 ? "one" : n == 2 ? "two" : t0 && n >= 3 && n <= 6 ? "few" : t0 && n >= 7 && n <= 10 ? "many" : "other";
  } });