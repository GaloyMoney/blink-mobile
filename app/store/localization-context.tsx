import { useI18nContext } from "@app/i18n/i18n-react"
import { getLanguageFromLocale } from "@app/utils/locale-detector"
import React, { createContext, useEffect, useState } from "react"
import { useLanguageQuery } from "@app/graphql/generated"
import useToken from "@app/hooks/use-token"

type LocalizationContextType = {
  displayCurrency: string
  setDisplayCurrency: React.Dispatch<React.SetStateAction<string>>
}

export const LocalizationContext = createContext<LocalizationContextType>({
  displayCurrency: "USD",
  // eslint-disable-next-line no-empty-function
  setDisplayCurrency: () => {},
})

type LocalizationContextProviderProps = {
  children: React.ReactNode
}

export const LocalizationContextProvider = ({
  children,
}: LocalizationContextProviderProps) => {
  const { hasToken } = useToken()

  const { data } = useLanguageQuery({ fetchPolicy: "cache-first", skip: !hasToken })

  const userPreferredLanguage = data?.me?.language

  const { locale, setLocale } = useI18nContext()
  const [displayCurrency, setDisplayCurrency] = useState("USD")

  useEffect(() => {
    if (userPreferredLanguage && userPreferredLanguage !== locale) {
      setLocale(getLanguageFromLocale(userPreferredLanguage))
    }
    // setLocale is not set as a dependency because it changes every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPreferredLanguage, locale])

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
