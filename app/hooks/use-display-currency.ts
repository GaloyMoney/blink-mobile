import { useState } from "react"

export const useDisplayCurrency = () => {
  const [displayCurrency, setDisplayCurrency] = useState("USD")

  return {
    displayCurrency,
    setDisplayCurrency,
  }
}
