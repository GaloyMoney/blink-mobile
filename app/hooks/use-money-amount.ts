import { useCallback, useMemo, useState } from "react"
import { useCurrencyConversion } from "./use-currency-conversion"
import { usePrefCurrency } from "./use-pref-currency"

type UseMoneyAmountReturn = {
  nextPrefCurrency: () => void
  prefCurrency: CurrencyType
  primaryAmount: MoneyAmount
  satAmount: number
  secondaryAmount: MoneyAmount
  setAmounts: (SetAmountsInput) => void
}

export const useMoneyAmount = (): UseMoneyAmountReturn => {
  const [prefCurrency, nextPrefCurrency] = usePrefCurrency()
  const currencyConverter = useCurrencyConversion()

  const [amounts, setAmmounts] = useState({
    sat: 0,
    usd: 0,
  })

  const setAmounts = useCallback(
    ({ moneyAmount }: SetAmountsInput) => {
      const postiveValue = moneyAmount.value >= 0 ? moneyAmount.value : -moneyAmount.value
      const referenceCurrency = moneyAmount.currency
      const refCurrenciesConverter = currencyConverter[referenceCurrency]

      setAmmounts({
        sat: refCurrenciesConverter["BTC"](postiveValue),
        usd: refCurrenciesConverter["USD"](postiveValue),
      })
    },
    [currencyConverter],
  )

  const { primaryAmount, secondaryAmount } = useMemo((): {
    primaryAmount: MoneyAmount
    secondaryAmount: MoneyAmount
  } => {
    const satMoneyAmount: MoneyAmount = {
      value: amounts.sat,
      currency: "BTC",
    }
    const usdMoneyAmount: MoneyAmount = {
      value: amounts.usd,
      currency: "USD",
    }
    return {
      primaryAmount: prefCurrency === "USD" ? usdMoneyAmount : satMoneyAmount,
      secondaryAmount: prefCurrency === "BTC" ? usdMoneyAmount : satMoneyAmount,
    }
  }, [amounts, prefCurrency])

  return {
    nextPrefCurrency,
    prefCurrency,
    satAmount: amounts.sat,
    primaryAmount,
    secondaryAmount,
    setAmounts,
  }
}
