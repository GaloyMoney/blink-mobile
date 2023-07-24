import React from "react"
import { useTheme } from "@rneui/themed"
import { GaloyIcon } from "../galoy-icon"
import { WalletCurrency } from "@app/graphql/generated"

export const GaloyCurrencyBubble = ({
  currency,
  iconSize: overrideIconSize,
  highlighted = true,
}: {
  currency: WalletCurrency
  iconSize?: number
  highlighted?: boolean
}) => {
  const {
    theme: { colors },
  } = useTheme()

  const iconSize = overrideIconSize || 24

  return currency === WalletCurrency.Btc ? (
    <GaloyIcon
      name="bitcoin"
      size={iconSize}
      color={highlighted ? colors.white : colors._white}
      backgroundColor={highlighted ? colors.primary : colors.grey3}
    />
  ) : (
    <GaloyIcon
      name="dollar"
      size={iconSize}
      color={colors._white}
      backgroundColor={highlighted ? colors.green : colors.grey3}
    />
  )
}
