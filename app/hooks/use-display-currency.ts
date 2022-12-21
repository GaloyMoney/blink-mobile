import { LocalizationContext } from "@app/store/localization-context"
import { useCallback, useContext } from "react"

export const useDisplayCurrency = () => {
  const { displayCurrency, setDisplayCurrency } = useContext(LocalizationContext)

  const formatToDisplayCurrency = useCallback(
    (amount: number) => {
      return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: displayCurrency,
      }).format(amount)
    },
    [displayCurrency],
  )

  return {
    displayCurrency,
    setDisplayCurrency,
    formatToDisplayCurrency,
  }
}
