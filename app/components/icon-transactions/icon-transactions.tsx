import * as React from "react"
import DollarIcon from "@app/assets/icons/dollar.svg"
import LightningIcon from "@app/assets/icons/lightning.svg"
import OnchainIcon from "@app/assets/icons/onchain.svg"
import { palette } from "@app/theme"
import { WalletType } from "@app/utils/enum"
import { View } from "react-native"

type Props = {
  isReceive: boolean
  pending?: boolean
  walletType: WalletType
  onChain: boolean
}

export const IconTransaction: React.FC<Props> = ({
  walletType,
  onChain = false,
  pending = false,
}) => {
  switch (walletType) {
    case WalletType.BTC:
      if (onChain && pending) return <OnchainIcon color={palette.midGrey} />
      if (onChain && !pending) return <OnchainIcon color={palette.orangePill} />
      return <LightningIcon />
    case WalletType.USD:
      return <DollarIcon />
    default:
      return <View />
  }
}
