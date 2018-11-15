"use strict";

IntlMessageFormat.__addLocaleData({ "locale": "ar", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    var s = String(n).split("."),
        t0 = Number(s[0]) == n,
        n100 = t0 && s[0].slice(-2);if (ord) return "other";return n == 0 ? "zero" : n == 1 ? "one" : n == 2 ? "two" : n100 >= 3 && n100 <= 10 ? "few" : n100 >= 11 && n100 <= 99 ? "many" : "other";
  } });
IntlMessageFormat.__addLocaleData({ "locale": "ar-AE", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-BH", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-DJ", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-DZ", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-EG", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-EH", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-ER", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-IL", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-IQ", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-JO", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-KM", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-KW", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-LB", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-LY", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-MA", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-MR", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-OM", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-PS", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-QA", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-SA", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-SD", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-SO", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-SS", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-SY", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-TD", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-TN", "parentLocale": "ar" });
IntlMessageFormat.__addLocaleData({ "locale": "ar-YE", "parentLocale": "ar" });