import * as React from "react"
import Toast, {
  SuccessToast,
  ErrorToast,
  BaseToastProps,
} from "react-native-toast-message"
import { light } from "../../rne-theme/colors"

const styles = {
  text1StyleSuccess: {
    fontSize: 16,
    color: light._green,
  },
  text1StyleError: {
    fontSize: 16,
    color: light.red,
  },
  text2Style: {
    fontSize: 14,
    color: light._black,
  },
}

const toastConfig = {
  success: (props: BaseToastProps) => (
    <SuccessToast
      {...props}
      text2NumberOfLines={2}
      style={{ borderLeftColor: light._green }}
      text1Style={styles.text1StyleSuccess}
      text2Style={styles.text2Style}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      text2NumberOfLines={2}
      style={{ borderLeftColor: light.red }}
      text1Style={styles.text1StyleError}
      text2Style={styles.text2Style}
    />
  ),
}

export const GaloyToast = () => {
  return <Toast config={toastConfig} />
}
