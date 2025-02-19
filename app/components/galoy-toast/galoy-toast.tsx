import * as React from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Toast, {
  SuccessToast,
  ErrorToast,
  BaseToastProps,
} from "react-native-toast-message"

const toastConfig = {
  success: (props: BaseToastProps) => (
    <SuccessToast
      {...props}
      text2NumberOfLines={2}
      text1Style={{ fontSize: 16 }}
      text2Style={{ fontSize: 14, color: "#2a2a2a" }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      text2NumberOfLines={2}
      text1Style={{ fontSize: 16 }}
      text2Style={{ fontSize: 14, color: "#2a2a2a" }}
    />
  ),
}

export const GaloyToast = () => {
  const { top, bottom } = useSafeAreaInsets()

  return <Toast config={toastConfig} topOffset={top + 10} bottomOffset={bottom + 50} />
}
