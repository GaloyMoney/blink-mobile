import * as RNLocalize from "react-native-localize"

export const customLocaleDetector = () => {
  if (
    RNLocalize.getLocales() &&
    RNLocalize.getLocales().some(
      (locale) =>
        locale.languageCode?.startsWith("en") ||
        locale.languageCode?.startsWith("es") ||
        locale.languageCode?.startsWith("fr") ||
        locale.languageCode?.startsWith("pt"),
    )
  ) {
    return getLanguageFromLocale(RNLocalize.getLocales()[0].languageCode)
  }
  return "en"
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
