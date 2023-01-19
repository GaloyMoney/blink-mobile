import React from "react"
import { useTheme } from "@rneui/themed"
import { GaloyIcon } from "../galoy-icon"
import { WalletCurrency } from "@app/graphql/generated"

export const GaloyCurrencyBubble = ({
  currency,
  size,
}: {
  currency: WalletCurrency
  size?: "medium" | "large" | number
}) => {
  const { theme } = useTheme()

  let iconSize
  switch (size) {
    case "medium":
      iconSize = 24
      break
    case "large":
      iconSize = 32
      break
    default:
      iconSize = size || 24
  }

  return currency === WalletCurrency.Btc ? (
    <GaloyIcon
      name="bitcoin"
      size={iconSize}
      color={theme.colors.secondary5}
      backgroundColor={theme.colors.secondary8}
    />
  ) : (
    <GaloyIcon
      name="dollar"
      size={iconSize}
      color={theme.colors.success5}
      backgroundColor={theme.colors.success9}
    />
  )
}
