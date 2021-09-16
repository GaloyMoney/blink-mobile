import { useState } from "react"
import * as React from "react"
import { useNavigation } from "@react-navigation/native"
import indexOf from "lodash.indexof"
import { prefCurrencyVar as primaryCurrencyVar } from "../graphql/client-only-query"

const units: CurrencyType[] = ["BTC", "USD"]

export const useCurrencies = (): {
  primaryCurrency: CurrencyType
  secondaryCurrency: CurrencyType
  toggleCurrency: () => void
} => {
  const navigation = useNavigation()

  const [primaryCurrency, setPrimaryCurrency] = useState(() => primaryCurrencyVar())

  const currentIndex = indexOf(units, primaryCurrency)
  const secondaryCurrency = units[(currentIndex + 1) % units.length]

  const toggleCurrency = () => {
    setPrimaryCurrency(secondaryCurrency)
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      primaryCurrencyVar(primaryCurrency)
    })

    return unsubscribe
  }, [navigation, primaryCurrency])

  return { primaryCurrency, secondaryCurrency, toggleCurrency }
}
