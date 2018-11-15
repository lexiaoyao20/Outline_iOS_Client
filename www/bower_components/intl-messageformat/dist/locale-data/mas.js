"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "mas", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return n == 1 ? "one" : "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "mas-TZ", "parentLocale": "mas" });