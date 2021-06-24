import * as React from "react"
import { useState } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { Image } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import RNSecureKeyStore from "react-native-secure-key-store"

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import { isSensorAvailable } from "../../utils/biometricAuthentication"
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
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(null)
  const [isPinEnabled, setIsPinEnabled] = useState(null)
  const [isBiometryAvailable, setIsBiometryAvailable] = useState(null)

  useFocusEffect(() => {
    checkForAuthentication()
  })

  const checkForAuthentication = async () => {
    let isBiometricsEnabled
    let pin
    let isBiometryAvailable
    let pinAttempts

    try {
      await RNSecureKeyStore.get("isBiometricsEnabled")
      isBiometricsEnabled = true
    } catch (error) {
      isBiometricsEnabled = false
    }

    try {
      pin = await RNSecureKeyStore.get("PIN")
    } catch (error) {
      pin = ""
    }

    const handleBiometryAvailabilitySuccess = (mIsBiometryAvailable: Boolean) => {
      isBiometryAvailable = mIsBiometryAvailable
    }

    const handleBiometryAvailabilityFailure = () => {
      isBiometryAvailable = false
    }

    try {
      await isSensorAvailable(
        handleBiometryAvailabilitySuccess,
        handleBiometryAvailabilityFailure,
      )
    } catch (error) {
      isBiometricsEnabled = false
    }

    try {
      pinAttempts = Number(await RNSecureKeyStore.get("pinAttempts"))
    } catch (error) {
      pinAttempts = 0
    }

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
