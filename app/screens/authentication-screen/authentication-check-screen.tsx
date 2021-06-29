import * as React from "react"
<<<<<<< HEAD
import { useState } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { Image } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import RNSecureKeyStore from "react-native-secure-key-store"
=======
import { useFocusEffect } from '@react-navigation/native'
import { Image } from "react-native"
import EStyleSheet from 'react-native-extended-stylesheet'
>>>>>>> Wrap SecureKeyStore and Biometric utility functions

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import BiometricWrapper from "../../utils/biometricAuthentication"
import type { ScreenType } from '../../types/screen'

const BitcoinBeachLogo = require("../get-started-screen/bitcoinBeach3.png")

const styles = EStyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  Logo: {
    maxHeight: "50%",
    maxWidth: "50%",
    marginTop: 24,
  },
})

type Props = {
  navigation: any
}

export const AuthenticationCheckScreen: ScreenType = ({ navigation }: Props) => {
  useFocusEffect(() => {
    checkForAuthentication()
  })

  const checkForAuthentication = async () => {
    const isBiometricsEnabled = await KeyStoreWrapper.getIsBiometricsEnabled()
    const pin = await KeyStoreWrapper.getPinOrEmptyString()
    const pinAttempts = await KeyStoreWrapper.getPinAttemptsOrZero()
    const isBiometryAvailable = await BiometricWrapper.isSensorAvailable()

    if (isBiometricsEnabled && isBiometryAvailable) {
      navigation.replace("authentication", {
        screenPurpose: "authenticate",
        pin: pin,
        mPinAttempts: pinAttempts,
      })
    } else if (pin.length > 0) {
      navigation.replace("pin", {
        screenPurpose: "authenticatePIN",
        pin: pin,
        mPinAttempts: pinAttempts,
      })
    } else {
      navigation.replace("Primary")
    }
  }

  return (
    <Screen
      style={styles.container}
      backgroundColor={palette.lightBlue}
      statusBar="light-content"
    >
      <Image style={styles.Logo} source={BitcoinBeachLogo} resizeMode="contain" />
    </Screen>
  )
}
