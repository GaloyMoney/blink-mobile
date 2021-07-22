import Toast from "react-native-root-toast"
import { palette } from "../theme/palette"

export const toastShow = (message: string): void => {
  Toast.show(message, {
    duration: Toast.durations.LONG,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 0,
    position: 50,
    opacity: 1,
    backgroundColor: palette.red,
  })
}
