import { translateUnknown } from "@galoymoney/client"
import Toast from "react-native-toast-message"

export const toastShow = (message: string, _onHide?: () => void): void => {
  if (_onHide) {
    Toast.show({
      type: "error",
      text1: translateUnknown("common.error"),
      text2: message,
      position: "bottom",
      bottomOffset: 80,
      onHide: () => _onHide(),
    })
  } else {
    Toast.show({
      type: "error",
      text1: translateUnknown("common.error"),
      text2: message,
      position: "bottom",
      bottomOffset: 80,
    })
  }
}
