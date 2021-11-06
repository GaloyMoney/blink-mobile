import Toast, { ToastOptions } from "react-native-root-toast"
import { palette } from "../theme/palette"

export const toastShow = (message: string, options?: ToastOptions): void => {
  const toastShowOptions: ToastOptions = {
    duration: Toast.durations.LONG,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 0,
    position: 50,
    opacity: 1,
    backgroundColor: palette.red,
    ...options,
  }

  Toast.show(message, toastShowOptions)
}
