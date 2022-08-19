/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react"
import { Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import LottieView from "lottie-react-native"

import { palette } from "../../theme/palette"
import { translate } from "@app/utils/translate"

import successLottieJson from "./success_lottie.json"
import errorLottieJson from "./error_lottie.json"
import pendingLottieJson from "./pending_lottie.json"

type Props = {
  errs: { message: string }[]
  status: string
}

export const PaymentStatusIndicator = ({ errs, status }: Props): JSX.Element => {
  if (status === "success") {
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
  }

  if (status === "error") {
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
  }

  if (status === "pending") {
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
  }

  return null
}

const styles = EStyleSheet.create({
  errorText: {
    color: palette.red,
    fontSize: 18,
    textAlign: "center",
  },

  lottie: {
    height: "150rem",
    width: "150rem",
  },

  pendingLottieText: {
    fontSize: 18,
    textAlign: "center",
  },

  successLottieText: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "center",
  },
})
