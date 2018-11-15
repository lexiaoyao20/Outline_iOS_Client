"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "pa", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 0 || n == 1 ? "one" : "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "pa-Arab", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "pa-Guru", "parentLocale": "pa" });