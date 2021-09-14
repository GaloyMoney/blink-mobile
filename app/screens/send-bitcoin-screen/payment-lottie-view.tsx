/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react"
import { useCallback, useMemo } from "react"
import { Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import LottieView from "lottie-react-native"

import { translate } from "../../i18n"
import { palette } from "../../theme/palette"

import successLottieJson from "./success_lottie.json"
import errorLottieJson from "./error_lottie.json"
import pendingLottieJson from "./pending_lottie.json"

type Props = {
  errs: { message: string }[]
  status: string
}

export const PaymentLottieView = ({ errs, status }: Props): JSX.Element => {
  const successLottie = useMemo(() => {
    return (
      <>
        <LottieView
          source={successLottieJson}
          loop={false}
          autoPlay
          style={styles.lottie}
          resizeMode="cover"
        />
        <Text style={styles.successLottieText}>
          {translate("SendBitcoinScreen.success")}
        </Text>
      </>
    )
  }, [])

  const errorLottie = useMemo(() => {
    return (
      <>
        <LottieView
          source={errorLottieJson}
          loop={false}
          autoPlay
          style={styles.lottie}
          resizeMode="cover"
        />
        {errs.map(({ message }, item) => (
          <Text key={`error-${item}`} style={styles.errorText}>
            {message}
          </Text>
        ))}
      </>
    )
  }, [errs])

  const pendingLottie = useMemo(() => {
    return (
      <>
        <LottieView
          source={pendingLottieJson}
          loop={false}
          autoPlay
          style={styles.lottie}
          resizeMode="cover"
        />
        <Text style={styles.pendingLottieText}>
          {translate("SendBitcoinScreen.notConfirmed")}
        </Text>
      </>
    )
  }, [])

  const paymentLottie = useCallback(() => {
    if (status === "success") {
      return successLottie
    } else if (status === "error") {
      return errorLottie
    } else if (status === "pending") {
      return pendingLottie
    }
    return null
  }, [errorLottie, pendingLottie, status, successLottie])

  return paymentLottie()
}

const styles = EStyleSheet.create({
  errorText: {
    color: palette.red,
    fontSize: 18,
  },

  lottie: {
    height: "200rem",
    width: "200rem",
  },

  pendingLottieText: {
    fontSize: 18,
    textAlign: "center",
  },

  successLottieText: {
    fontSize: 18,
  },
})
