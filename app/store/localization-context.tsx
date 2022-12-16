import useMainQuery from "@app/hooks/use-main-query"
import { useI18nContext } from "@app/i18n/i18n-react"
import { getLanguageFromLocale } from "@app/utils/locale-detector"
import React, { createContext, useCallback, useEffect, useState } from "react"

type LocalizationContextType = {
  displayCurrency: string
  setDisplayCurrency: React.Dispatch<React.SetStateAction<string>>
  convertUsdToDisplayCurrency: (usdAmount: number) => string
}

export const LocalizationContext = createContext<LocalizationContextType>(null)

export const LocalizationContextProvider = ({ children }) => {
  const { userPreferredLanguage } = useMainQuery()
  const { locale, setLocale } = useI18nContext()
  const [displayCurrency, setDisplayCurrency] = useState("USD")

  const convertUsdToDisplayCurrency = useCallback(
    (usdAmount: number) => {
      return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: displayCurrency,
      }).format(usdAmount)
    },
    [displayCurrency],
  )

  const localizationContext = {
    displayCurrency,
    setDisplayCurrency,
    convertUsdToDisplayCurrency,
  }

  useEffect(() => {
    if (userPreferredLanguage && userPreferredLanguage !== locale) {
      setLocale(getLanguageFromLocale(userPreferredLanguage))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPreferredLanguage])

  return (
    <LocalizationContext.Provider value={localizationContext}>
      {children}
    </LocalizationContext.Provider>
  )
}
