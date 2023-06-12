import React from "react"
import { useTheme } from "@rneui/themed"
import { GaloyIcon } from "../galoy-icon"
import { WalletCurrency } from "@app/graphql/generated"

export const GaloyCurrencyBubble = ({ currency }: { currency: WalletCurrency }) => {
  const {
    theme: { colors },
  } = useTheme()

  const iconSize = 24

  return currency === WalletCurrency.Btc ? (
    <GaloyIcon
      name="bitcoin"
      size={iconSize}
      color={colors.white}
      backgroundColor={colors.primary}
    />
  ) : (
    <GaloyIcon
      name="dollar"
      size={iconSize}
      color={colors._white}
      backgroundColor={colors.green}
    />
  )
}
