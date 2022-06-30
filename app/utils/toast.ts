import { translateUnknown } from "@galoymoney/client"
import Toast from "react-native-toast-message"

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
      text1:
        type === "error"
          ? translateUnknown("common.error")
          : translateUnknown("common.success"),
      text2: message,
      position: "bottom",
      bottomOffset: 80,
      onHide: () => _onHide(),
    })
  } else {
    Toast.show({
      type,
      text1:
        type === "error"
          ? translateUnknown("common.error")
          : translateUnknown("common.success"),
      text2: message,
      position: "bottom",
      bottomOffset: 80,
    })
  }
}
