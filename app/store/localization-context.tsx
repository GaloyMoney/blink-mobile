import useMainQuery from "@app/hooks/use-main-query"
import { useI18nContext } from "@app/i18n/i18n-react"
import { DisplayCurrency } from "@app/types/amounts"
import { getLanguageFromLocale } from "@app/utils/locale-detector"
import React, { createContext, useEffect, useState } from "react"

export type Locale = "de" | "en" | "es" | "fr-CA" | "pt-BR" | "cs"

type LocalizationContextType = {
  displayCurrency: DisplayCurrency
  setDisplayCurrency: React.Dispatch<React.SetStateAction<string>>
  locale: Locale
}

export const LocalizationContext = createContext<LocalizationContextType>({
  displayCurrency: DisplayCurrency.USD,
  // eslint-disable-next-line no-empty-function
  setDisplayCurrency: () => {},
  locale: "en",
})

export const LocalizationContextProvider = ({ children }) => {
  const { userPreferredLanguage } = useMainQuery()
  const { locale, setLocale } = useI18nContext()
  const [displayCurrency, setDisplayCurrency] = useState(DisplayCurrency.USD)

  useEffect(() => {
    if (userPreferredLanguage && userPreferredLanguage !== locale) {
      setLocale(getLanguageFromLocale(userPreferredLanguage))
    }
  }, [userPreferredLanguage, setLocale, locale])

  const localizationContext = {
    displayCurrency,
    setDisplayCurrency,
    locale,
  }

  return (
    <LocalizationContext.Provider value={localizationContext}>
      {children}
    </LocalizationContext.Provider>
  )
}
