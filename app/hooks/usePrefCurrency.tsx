import { useState } from "react";
import * as React from "react"
import { prefCurrencyVar } from "../graphql/query";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as _ from "lodash"

const units = ["sats", "USD"] // "BTC"

export function usePrefCurrency() {
  const navigation = useNavigation()

  const [prefCurrency, setPrefCurrency] = useState(() => prefCurrencyVar())
  const nextPrefCurrency = () => {
    const currentIndex = _.indexOf(units, prefCurrency)
    setPrefCurrency(units[(currentIndex + 1) % units.length])
  }
    
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.log({prefCurrency},"onblur")
      prefCurrencyVar(prefCurrency)
    });

    return unsubscribe;
  }, [prefCurrency]);

  return [prefCurrency, nextPrefCurrency]
}