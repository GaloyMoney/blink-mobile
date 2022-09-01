import Toast from "react-native-toast-message"
import { i18nObject, detectLocale } from "@app/i18n/i18n-util"

export const toastShow = ({
  message,
  _onHide,
  type = "error",
}: {
  message: string
  _onHide?: () => void
  type?: "error" | "success" | "warning"
}): void => {
  const LL = i18nObject(detectLocale())
  if (_onHide) {
    Toast.show({
      type,
      text1: type === "error" ? LL.common.error() : LL.common.success(),
      text2: message,
      position: "bottom",
      bottomOffset: 80,
      onHide: () => _onHide(),
    })
  } else {
    Toast.show({
      type,
      text1: type === "error" ? LL.common.error() : LL.common.success(),
      text2: message,
      position: "bottom",
      bottomOffset: 80,
    })
  }
}
