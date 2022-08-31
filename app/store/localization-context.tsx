import useMainQuery from "@app/hooks/use-main-query"
import { useI18nContext } from "@app/i18n/i18n-react"
import { getLanguageFromLocale } from "@app/utils/locale-detector"
import { useEffect } from "react"

export const LocalizationContextProvider = ({ children }) => {
  const { userPreferredLanguage } = useMainQuery()
  const { locale, setLocale } = useI18nContext()

  useEffect(() => {
    if (userPreferredLanguage && userPreferredLanguage !== locale) {
      setLocale(getLanguageFromLocale(userPreferredLanguage))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPreferredLanguage])

  return children
}
