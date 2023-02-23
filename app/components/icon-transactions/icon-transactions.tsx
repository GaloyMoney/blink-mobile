import * as React from "react"
import DollarIcon from "@app/assets/icons/dollar.svg"
import LightningIcon from "@app/assets/icons/lightning.svg"
import OnchainIcon from "@app/assets/icons/onchain.svg"
import { palette } from "@app/theme"
import { View } from "react-native"
import { WalletCurrency } from "@app/graphql/generated"

type Props = {
  isReceive: boolean
  pending?: boolean
  walletCurrency: WalletCurrency
  onChain: boolean
}

export const IconTransaction: React.FC<Props> = ({
  walletCurrency,
  onChain = false,
  pending = false,
}) => {
  switch (walletCurrency) {
    case WalletCurrency.Btc:
      if (onChain && pending) return <OnchainIcon color={palette.midGrey} />
      if (onChain && !pending) return <OnchainIcon color={palette.orangePill} />
      return <LightningIcon />
    case WalletCurrency.Usd:
      return <DollarIcon />
    default:
      return <View />
  }
}
