import * as React from "react"

import { Image } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { useEffect } from "react"
import { Image } from "react-native"
import EStyleSheet from 'react-native-extended-stylesheet'

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import BiometricWrapper from "../../utils/biometricAuthentication"
import type { ScreenType } from '../../types/screen'
import { AuthenticationScreenPurpose, PinScreenPurpose } from "../../utils/enum"

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
  useEffect(() => {
    (async () => {
      const isPinEnabled = (await KeyStoreWrapper.getIsPinEnabled())

      if (await BiometricWrapper.isSensorAvailable() && await KeyStoreWrapper.getIsBiometricsEnabled()) {
        navigation.replace("authentication", { screenPurpose: AuthenticationScreenPurpose.Authenticate, isPinEnabled })
      } else if (isPinEnabled) {
        navigation.replace("pin", { screenPurpose: PinScreenPurpose.AuthenticatePin })
      } else {
        navigation.replace("Primary")
      }
    })()
  }, [])

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
