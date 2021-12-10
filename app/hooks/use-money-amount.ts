import { useCallback, useState } from "react"
import { useMySubscription } from "./user-hooks"

type UseMoneyAmountFunction = (
  currency: CurrencyType,
) => [
  MoneyAmount,
  (moneyAmount: MoneyAmount) => void,
  (moneyAmount: MoneyAmount) => void,
  (value: number) => void,
]

export const useMoneyAmount: UseMoneyAmountFunction = (currency) => {
  const { convertCurrencyAmount } = useMySubscription()

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

        return {
          value: convertCurrencyAmount({
            amount: postiveValue,
            from: refCurrency,
            to: pMoneyAmount.currency,
          }),
          currency: pMoneyAmount.currency,
        }
      })
    },
    [convertCurrencyAmount],
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
