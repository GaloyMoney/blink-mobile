import * as React from "react"
import Toast, { SuccessToast, ErrorToast } from "react-native-toast-message"

const toastConfig = {
  success: (props) => <SuccessToast {...props} text2NumberOfLines={2} />,
  error: (props) => <ErrorToast {...props} text2NumberOfLines={2} />,
}

export const GaloyToast = () => {
  return <Toast config={toastConfig} />
}
