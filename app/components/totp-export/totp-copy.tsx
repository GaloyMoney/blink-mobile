import React from "react"
import Clipboard from "@react-native-clipboard/clipboard"
import { toastShow } from "@app/utils/toast"
import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"

type CopySecretProps = {
  secret: string
}

export const CopySecretComponent: React.FC<CopySecretProps> = ({ secret }) => {
  const copyToClipboard = () => {
    Clipboard.setString(secret)
    toastShow({
      // TODO: translation
      type: "success",
      message: "Secret copied to clipboard!",
    })
  }

  return <GaloySecondaryButton title="Copy secret" onPress={copyToClipboard} />
}
