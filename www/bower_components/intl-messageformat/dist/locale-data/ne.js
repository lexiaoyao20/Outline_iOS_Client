"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "ne", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    var s = String(n).split("."),
        t0 = Number(s[0]) == n;if (ord) return t0 && n >= 1 && n <= 4 ? "one" : "other";return n == 1 ? "one" : "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "ne-IN", "parentLocale": "ne" });