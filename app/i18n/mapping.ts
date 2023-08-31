import "@formatjs/intl-getcanonicallocales/polyfill"
import "@formatjs/intl-locale/polyfill"
import "@formatjs/intl-relativetimeformat/polyfill"

import "@formatjs/intl-relativetimeformat/locale-data/af"
import "@formatjs/intl-relativetimeformat/locale-data/ar"
import "@formatjs/intl-relativetimeformat/locale-data/ca"
import "@formatjs/intl-relativetimeformat/locale-data/cs"
import "@formatjs/intl-relativetimeformat/locale-data/de"
import "@formatjs/intl-relativetimeformat/locale-data/en"
import "@formatjs/intl-relativetimeformat/locale-data/el"
import "@formatjs/intl-relativetimeformat/locale-data/es"
import "@formatjs/intl-relativetimeformat/locale-data/fr"
import "@formatjs/intl-relativetimeformat/locale-data/ja"
import "@formatjs/intl-relativetimeformat/locale-data/hr"
import "@formatjs/intl-relativetimeformat/locale-data/hy"
import "@formatjs/intl-relativetimeformat/locale-data/it"
import "@formatjs/intl-relativetimeformat/locale-data/nl"
import "@formatjs/intl-relativetimeformat/locale-data/ms"
import "@formatjs/intl-relativetimeformat/locale-data/pt"
import "@formatjs/intl-relativetimeformat/locale-data/qu"
import "@formatjs/intl-relativetimeformat/locale-data/sr"
import "@formatjs/intl-relativetimeformat/locale-data/sw"
import "@formatjs/intl-relativetimeformat/locale-data/th"
import "@formatjs/intl-relativetimeformat/locale-data/tr"
import "@formatjs/intl-relativetimeformat/locale-data/vi"

// we don't use transfiex for this because we don't want the language to be translated.
// for instance, for French we want "Francais", not "French" or "ภาษาฝรั่งเศส"
export const LocaleToTranslateLanguageSelector = {
  af: "Afrikaans",
  ar: "العربية",
  ca: "Catalan",
  cs: "Česky",
  de: "Deutsch",
  en: "English",
  el: "Ελληνικά",
  es: "Español",
  fr: "Français",
  ja: "日本語",
  hr: "Hrvatski",
  hy: "Հայերեն",
  it: "Italiano",
  nl: "Nederlands",
  ms: "Bahasa Melayu",
  pt: "Português",
  qu: "Quechua",
  sr: "Српски", 
  sw: "KiSwahili", 
  th: "ไทย",
  tr: "Türkçe",
  vi: "Tiếng Việt",
} as const