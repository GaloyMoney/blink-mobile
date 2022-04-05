import React from "react"
import { translate } from "@app/i18n"
import { palette } from "@app/theme"
import LottieView from "lottie-react-native"
import { StyleSheet, Text, View } from "react-native"
import successLottieJson from "./success_lottie.json"

const styles = StyleSheet.create({
  lottie: {
    height: 100,
    width: 100,
  },
  successLottieText: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "center",
  },
  lottieContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
const SendBitcoinSuccess = () => {
  return (
    <View style={styles.lottieContainer}>
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
    </View>
  )
}

export default SendBitcoinSuccess
