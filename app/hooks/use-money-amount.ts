import { useCallback, useMemo, useState } from "react"
import { useCurrencyConversion } from "./use-currency-conversion"
import { usePrefCurrency } from "./use-pref-currency"

type SetAmountsInput = {
  value: number
  referenceCurrency?: CurrencyType
}

export const useMoneyAmount = (): [MoneyAmount, MoneyAmount, (SetAmountsInput) => void] => {
  const [prefCurrency] = usePrefCurrency()
  const currencyConverter = useCurrencyConversion()

  const [satAmount, setSatAmount] = useState(0)
  const [usdAmount, setUsdAmount] = useState(0)

  const setAmounts = useCallback(
    ({ value, referenceCurrency }: SetAmountsInput) => {
      const postiveValue = value >= 0 ? value : -value
      const mReferenceCurrency = referenceCurrency ?? prefCurrency

      setSatAmount(currencyConverter[mReferenceCurrency]["BTC"](postiveValue))
      setUsdAmount(currencyConverter[mReferenceCurrency]["USD"](postiveValue))
    },
    [currencyConverter, prefCurrency],
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

  return [satMoneyAmount, usdMoneyAmount, setAmounts]
}
