"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "ko", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    if (ord) return "other";return "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "ko-KP", "parentLocale": "ko" });