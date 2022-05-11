/* eslint-disable react-native/no-inline-styles */
import React from "react"
import Toast, { ErrorToast as ReactNativeErrorToast } from "react-native-toast-message"

const ErrorToast = () => {
  const toastConfig = {
    error: (props) => (
      <ReactNativeErrorToast
        {...props}
        text1Style={{
          fontSize: 17,
        }}
        text2Style={{
          fontSize: 15,
        }}
      />
    ),
  }

  return <Toast config={toastConfig} />
}

export default ErrorToast
