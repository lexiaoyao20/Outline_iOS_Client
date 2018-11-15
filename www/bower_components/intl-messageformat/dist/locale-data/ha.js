"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "ha", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 1 ? "one" : "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "ha-Arab", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "ha-GH", "parentLocale": "ha" });
IntlMessageFormat.__addLocaleData({ "locale": "ha-NE", "parentLocale": "ha" });