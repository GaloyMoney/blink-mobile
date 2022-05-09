import * as React from "react"
import DollarIcon from "@app/assets/icons/dollar.svg"
import LightningIcon from "@app/assets/icons/lightning.svg"
import OnchainIcon from "@app/assets/icons/onchain.svg"
import { palette } from "@app/theme"
import { WalletType } from "@app/utils/enum"
import { View } from "react-native"

export const IconTransaction = ({
  size,
  walletType,
  onChain = false,
  pending = false,
}: {
  isReceive: boolean
  size: number
  pending?: boolean
  walletType: WalletType
  onChain: boolean
}): JSX.Element => {
  switch (walletType) {
    case WalletType.BTC:
      if (onChain && pending) return <OnchainIcon color={palette.midGrey} />
      if (onChain && !pending) return <OnchainIcon color={palette.orangePill} />
      return <LightningIcon />
    case WalletType.USD:
      return <DollarIcon/>
    default:
      return <View />
  }
}
