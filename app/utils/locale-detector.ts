import { Locales } from "@app/i18n/i18n-types"
import { locales } from "@app/i18n/i18n-util"
import * as RNLocalize from "react-native-localize"

export const matchOsLocaleToSupportedLocale = (
  localesFromOs: ReturnType<typeof RNLocalize.getLocales>,
): Locales => {
  // first check for a supported locale with an exact match of the os locale using the languageTag (ex "en-GB")
  const languageTagsFromOs = localesFromOs.map((osLocale) => osLocale.languageTag)
  const localeFromLanguageTag = locales.find((locale) =>
    languageTagsFromOs.includes(locale),
  )
  if (localeFromLanguageTag) {
    return localeFromLanguageTag
  }

  // if no exact match, check for a supported locale with a match of the os locale using the languageCode (ex "en")
  const languageCodeFromOs = localesFromOs.map((osLocale) => osLocale.languageCode)
  const localeFromLanguageCode = locales.find((locale) =>
    languageCodeFromOs.some((languageCode) => locale.startsWith(languageCode)),
  )
  if (localeFromLanguageCode) {
    return localeFromLanguageCode
  }

  return "en"
}

export const detectDefaultLocale = (): Locales => {
  const localesFromOs = RNLocalize.getLocales()
  return matchOsLocaleToSupportedLocale(localesFromOs)
}

export const Languages = ["DEFAULT", ...locales] as const

export type Language = (typeof Languages)[number]

export const getLanguageFromString = (language?: string): Language => {
  if (!language) {
    return "DEFAULT"
  }

  const exactMatchLanguage = locales.find((locale) => locale === language)

  if (exactMatchLanguage) {
    return exactMatchLanguage
  }

  // previously we used the following values for setting the language sever side
  // ["DEFAULT", "en-US", "es-SV", "pt-BR", "fr-CA", "de-DE", "cs"]
  const approximateMatchLocale = locales.find((locale) =>
    locale.startsWith(language.split("-")[0]),
  )

  return approximateMatchLocale || "DEFAULT"
}

export const getLocaleFromLanguage = (language: Language): Locales => {
  if (language === "DEFAULT") {
    return detectDefaultLocale()
  }
  return language
}
