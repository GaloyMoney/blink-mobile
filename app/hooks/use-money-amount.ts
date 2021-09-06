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

  const [satAmount, setSatAmount] = useState(0)
  const [usdAmount, setUsdAmount] = useState(0)

  const setAmounts = useCallback(
    ({ moneyAmount }: SetAmountsInput) => {
      const postiveValue = moneyAmount.value >= 0 ? moneyAmount.value : -moneyAmount.value
      const mReferenceCurrency = moneyAmount.currency

      setSatAmount(currencyConverter[mReferenceCurrency]["BTC"](postiveValue))
      setUsdAmount(currencyConverter[mReferenceCurrency]["USD"](postiveValue))
    },
    [currencyConverter],
  )

  const satMoneyAmount = useMemo((): MoneyAmount => {
    return {
      value: satAmount,
      currency: "BTC",
    }
  }, [satAmount])

  const usdMoneyAmount = useMemo((): MoneyAmount => {
    return {
      value: usdAmount,
      currency: "USD",
    }
  }, [usdAmount])

  const primaryAmount = useMemo((): MoneyAmount => {
    if (prefCurrency === "USD") {
      return usdMoneyAmount
    }
    return satMoneyAmount
  }, [prefCurrency, satMoneyAmount, usdMoneyAmount])

  const secondaryAmount = useMemo((): MoneyAmount => {
    if (prefCurrency === "BTC") {
      return usdMoneyAmount
    }
    return satMoneyAmount
  }, [prefCurrency, satMoneyAmount, usdMoneyAmount])

  return {
    nextPrefCurrency,
    prefCurrency,
    primaryAmount,
    satAmount,
    secondaryAmount,
    setAmounts,
  }
}
