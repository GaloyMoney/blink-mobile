import * as React from "react"
import { Image } from "react-native"
import EStyleSheet from 'react-native-extended-stylesheet'

// Components
import { Screen } from "../../components/screen"

// Constants
import { palette } from "../../theme/palette"

// Utils
import { isSensorAvailable } from "../../utils/biometricAuthentication"

// Types
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
  }
})

type Props = {
  navigation: any,
}

export const BiometryCheckScreen: ScreenType = ({ navigation }: Props) => {

  React.useEffect(() => isSensorAvailable(handleBiometryAvailabilitySuccess, handleBiometryAvailabilityFailure))

  const handleBiometryAvailabilitySuccess = (isBiometryAvailable: Boolean) => {
    if (isBiometryAvailable) {
      navigation.replace("authentication")
    } else {
      navigation.replace("Primary")
    }
  }

  const handleBiometryAvailabilityFailure = () => {
    navigation.replace("Primary")
  }

  return (
    <Screen style={styles.container} backgroundColor={palette.lightBlue} statusBar="light-content">
      <Image
        style={styles.Logo}
        source={BitcoinBeachLogo}
        resizeMode="contain"
      />
    </Screen>
  )
}