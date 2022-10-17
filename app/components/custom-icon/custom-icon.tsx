import React from "react"
import ReceiveBitcoinIcon from "@app/assets/icons/receive-bitcoin.svg"
import InfoIcon from "@app/assets/icons/info.svg"
import CopyIcon from "@app/assets/icons/copy.svg"
import ShareIcon from "@app/assets/icons/share.svg"
import ErrorIcon from "@app/assets/icons/error.svg"
import MerchantIcon from "@app/assets/icons/merchant.svg"
import ChevronDownIcon from "@app/assets/icons/chevron-down.svg"
import WebLink from "@app/assets/icons/web-link.svg"
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
  if (name === "custom-error-icon") {
    return <ErrorIcon color={color} />
  }
  if (name === "custom-merchant-icon") {
    return <MerchantIcon color={color} />
  }
  if (name === "custom-chevron-down-icon") {
    return <ChevronDownIcon color={color} />
  }
  if (name === "custom-web-link-icon") {
    return <WebLink color={color} />
  }
  return <View />
}
