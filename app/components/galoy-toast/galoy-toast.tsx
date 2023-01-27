import * as React from "react"
import Toast, {
  SuccessToast,
  ErrorToast,
  BaseToastProps,
} from "react-native-toast-message"

const toastConfig = {
  success: (props: BaseToastProps) => <SuccessToast {...props} text2NumberOfLines={2} />,
  error: (props: BaseToastProps) => <ErrorToast {...props} text2NumberOfLines={2} />,
}

export const GaloyToast = () => {
  return <Toast config={toastConfig} />
}
