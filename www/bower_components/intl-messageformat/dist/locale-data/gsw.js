"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "gsw", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 1 ? "one" : "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "gsw-FR", "parentLocale": "gsw" });
IntlMessageFormat.__addLocaleData({ "locale": "gsw-LI", "parentLocale": "gsw" });