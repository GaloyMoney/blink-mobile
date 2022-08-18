import Toast from "react-native-toast-message"

import { translate } from "@app/utils/translate"

export const toastShow = ({
  message,
  _onHide,
  type = "error",
}: {
  message: string
  _onHide?: () => void
  type?: "error" | "success" | "warning"
}): void => {
  if (_onHide) {
    Toast.show({
      type,
      text1: type === "error" ? translate("common.error") : translate("common.success"),
      text2: message,
      position: "bottom",
      bottomOffset: 80,
      onHide: () => _onHide(),
    })
  } else {
    Toast.show({
      type,
      text1: type === "error" ? translate("common.error") : translate("common.success"),
      text2: message,
      position: "bottom",
      bottomOffset: 80,
    })
  }
}
