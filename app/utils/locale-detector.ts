import * as RNLocalize from "react-native-localize"

export const customLocaleDetector = () => {
  if (RNLocalize.getLocales()) {
    return RNLocalize.getLocales()?.map((locale) => {
      return getLanguageFromLocale(locale.languageCode)
    })
  }
  return ["es"]
}

export const getLanguageFromLocale = (locale: string) => {
  if (locale.startsWith("es")) {
    return "es"
  }
  if (locale.startsWith("pt")) {
    return "pt-BR"
  }
  if (locale.startsWith("fr")) {
    return "fr-CA"
  }
  return "en"
}
