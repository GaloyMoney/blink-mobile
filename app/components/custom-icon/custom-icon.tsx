import React from "react"
import ReceiveBitcoinIcon from "@app/assets/icons/receive-bitcoin.svg"
import InfoIcon from "@app/assets/icons/info.svg"
import CopyIcon from "@app/assets/icons/copy.svg"
import ShareIcon from "@app/assets/icons/share.svg"
import { View } from "react-native"

export const CustomIcon = ({ name, color }: { name: string; color: string }) => {
  if (name === "custom-receive-bitcoin") {
    return <ReceiveBitcoinIcon color={color} />
  }
  if (name === "custom-info-icon") {
    return <InfoIcon color={color} />
  }
  if (name === "custom-copy-icon") {
    return <CopyIcon color={color} />
  }
  if (name === "custom-share-icon") {
    return <ShareIcon color={color} />
  }
  return <View />
}
