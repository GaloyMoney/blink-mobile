import React from "react"
import Clipboard from "@react-native-clipboard/clipboard"
import { toastShow } from "@app/utils/toast"
import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"
import { useI18nContext } from "@app/i18n/i18n-react"

type Props = {
  secret: string
}

export const CopySecretComponent: React.FC<Props> = ({ secret }) => {
  const { LL } = useI18nContext()

  const copyToClipboard = () => {
    Clipboard.setString(secret)
    toastShow({
      type: "success",
      message: LL.CopySecretComponent.toastMessage(),
      LL,
    })
  }

  return (
    <GaloySecondaryButton
      title={LL.CopySecretComponent.button()}
      onPress={copyToClipboard}
    />
  )
}
