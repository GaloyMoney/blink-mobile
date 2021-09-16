import { useCallback, useMemo, useState } from "react"
import { useCurrencies } from "."
import { useCurrencyConverter } from "./use-currency-conversion"

type UseMoneyAmountFunction = (
  currency: CurrencyType,
) => [
  MoneyAmount,
  (moneyAmount: MoneyAmount) => void,
  (moneyAmount: MoneyAmount) => void,
  (value: number) => void,
]

export const useMoneyAmount: UseMoneyAmountFunction = (currency) => {
  const currencyConverter = useCurrencyConverter()

  const [moneyAmount, setMoneyAmount] = useState<MoneyAmount>({
    value: 0,
    currency,
  })

  const convertAmount = useCallback(
    (moneyAmount: MoneyAmount) => {
      setMoneyAmount((pMoneyAmount) => {
        if (moneyAmount.currency === pMoneyAmount.currency) {
          return pMoneyAmount
        }
        const postiveValue =
          moneyAmount.value >= 0 ? moneyAmount.value : -moneyAmount.value
        const refCurrency = moneyAmount.currency
        const refCurrenciesConverter = currencyConverter[refCurrency]
        return {
          value: refCurrenciesConverter[pMoneyAmount.currency](postiveValue),
          currency: pMoneyAmount.currency,
        }
      })
    },
    [currencyConverter],
  )

  const setAmountValue = useCallback((value: number) => {
    setMoneyAmount((pMoneyAmount) => {
      return {
        value,
        currency: pMoneyAmount.currency,
      }
    })
  }, [])

  return [moneyAmount, convertAmount, setMoneyAmount, setAmountValue]
}
