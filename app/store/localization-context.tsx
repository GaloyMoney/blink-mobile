import useMainQuery from "@app/hooks/use-main-query"
import { useEffect, useState } from "react"
import TypesafeI18n from "../i18n/i18n-react"
import { detectLocale } from "../i18n/i18n-util"
import * as RNLocalize from "react-native-localize"
import { Locales } from "@app/i18n/i18n-types"

const customLocaleDetector = () => {
  if (RNLocalize.getLocales()?.[0]?.languageCode) {
    return RNLocalize.getLocales().map(locale => locale?.languageCode)
  }
  return ["es"]
}

export const LocalizationContextProvider = ({ children }) => {
  const { userPreferredLanguage } = useMainQuery()
  const [locale, setLocale] = useState<Locales>(() => {
    if (userPreferredLanguage) {
      return userPreferredLanguage as Locales
    }
    return detectLocale(customLocaleDetector)
  })

  useEffect(() => {
    if (userPreferredLanguage && userPreferredLanguage !== locale) {
      setLocale(userPreferredLanguage as Locales)
    }
  }, [userPreferredLanguage, locale])

  return <TypesafeI18n locale={locale}>{children}</TypesafeI18n>
}
