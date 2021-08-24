import { useState } from "react"
import * as React from "react"
import { useNavigation } from "@react-navigation/native"
import indexOf from "lodash.indexof"
import { prefCurrencyVar } from "../graphql/client-only-query"

const units: CurrencyType[] = ["BTC", "USD"]

export const usePrefCurrency = (): [CurrencyType, () => void] => {
  const navigation = useNavigation()

  const [prefCurrency, setPrefCurrency] = useState(() => prefCurrencyVar())

  const nextPrefCurrency = () => {
    const currentIndex = indexOf(units, prefCurrency)
    setPrefCurrency(units[(currentIndex + 1) % units.length])
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      prefCurrencyVar(prefCurrency)
    })

    return unsubscribe
  }, [navigation, prefCurrency])

  return [prefCurrency, nextPrefCurrency]
}
