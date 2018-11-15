"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "iu", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 1 ? "one" : n == 2 ? "two" : "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "iu-Latn", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return "other";
  } });