import useMainQuery from "@app/hooks/use-main-query"
import { useI18nContext } from "@app/i18n/i18n-react"
import { getLanguageFromLocale } from "@app/utils/locale-detector"
import React, { createContext, useEffect, useState } from "react"

type LocalizationContextType = {
  displayCurrency: string
  setDisplayCurrency: React.Dispatch<React.SetStateAction<string>>
}

export const LocalizationContext = createContext<LocalizationContextType>({
  displayCurrency: "USD",
  // eslint-disable-next-line no-empty-function
  setDisplayCurrency: () => {},
})

export const LocalizationContextProvider = ({ children }) => {
  const { userPreferredLanguage } = useMainQuery()
  const { locale, setLocale } = useI18nContext()
  const [displayCurrency, setDisplayCurrency] = useState("USD")

  useEffect(() => {
    if (userPreferredLanguage && userPreferredLanguage !== locale) {
      setLocale(getLanguageFromLocale(userPreferredLanguage))
    }
  }, [userPreferredLanguage, setLocale, locale])

  const localizationContext = {
    displayCurrency,
    setDisplayCurrency,
  }

  return (
    <LocalizationContext.Provider value={localizationContext}>
      {children}
    </LocalizationContext.Provider>
  )
}
