import Toast, { ToastOptions } from "react-native-root-toast"
import { palette } from "../theme/palette"

export const toastShow = (message: string, options?: ToastOptions): void => {
  const toastShowOptions = {
    duration: Toast.durations.LONG,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 0,
    position: 50,
    opacity: 1,
    backgroundColor: palette.red,
  }

  if (options) {
    Object.entries(options).map(([key, value]) => {
      toastShowOptions[key] = value
    })
  }
  Toast.show(message, toastShowOptions)
}
