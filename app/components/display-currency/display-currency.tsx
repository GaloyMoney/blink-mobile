import { LocalizationContext } from "@app/store/localization-context"
import React, { useContext } from "react"
import { Text } from "react-native-elements"

export const DisplayCurrency = ({ amount }: { amount: number }) => {
  const { displayCurrency } = useContext(LocalizationContext)
  return (
    <Text>
      {Intl.NumberFormat("en-US", {
        style: "currency",
        currency: displayCurrency,
      }).format(amount)}
    </Text>
  )
}
