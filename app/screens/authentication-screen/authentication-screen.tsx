import * as React from "react"
import { Alert, Image, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from 'react-native-extended-stylesheet'
import { useApolloClient } from "@apollo/client"

// Components
import { Screen } from "../../components/screen"

// Constants
import { color } from "../../theme"
import { palette } from "../../theme/palette"

// Functions
import { translate } from "../../i18n"

// Utils
import { authenticate } from "../../utils/biometricAuthentication"
import { resetDataStore } from "../../utils/logout"

// Types
import type { ScreenType } from '../../types/screen'

const BitcoinBeachLogo = require("../get-started-screen/bitcoinBeach3.png")

const styles = EStyleSheet.create({
  bottom: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 36,
    width: "100%",
  },

  button: {
    backgroundColor: palette.white,
    borderRadius: 24,
  },

  buttonAlternate: {
    backgroundColor: palette.lightBlue,
    borderRadius: 24,
  },

  buttonContainer: {
    marginVertical: 12,
    width: "80%",
  },

  buttonTitle: {
    color: color.primary,
    fontWeight: "bold",
  },

  buttonAlternateTitle: {
    color: palette.white,
    fontWeight: "bold",
  },

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

export const AuthenticationScreen: ScreenType = ({ navigation }: Props) => {
  const client = useApolloClient()

  React.useEffect(() => {
    authenticate(handleAuthenticationSuccess, handleAuthenticationFailure)
  })

  const handleAuthenticationSuccess = () => {
    navigation.replace("Primary")
  }

  const handleAuthenticationFailure = () => {
    // Failed to Authenticate
  }

  const logout = async () => {
    await resetDataStore(client)
    Alert.alert(translate("common.loggedOut"), "",
      [
        {
          text: translate("common.ok"),
          onPress: () => {
            navigation.replace("Primary")
          }
        }
      ]
    )
  }

  return (
    <Screen style={styles.container} backgroundColor={palette.lightBlue} statusBar="light-content">
      <Image
        style={styles.Logo}
        source={BitcoinBeachLogo}
        resizeMode="contain"
      />
      <View style={styles.bottom}>
        <Button
          title={translate("AuthenticationScreen.unlock")}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          onPress={() => authenticate(handleAuthenticationSuccess, handleAuthenticationFailure)}
          containerStyle={styles.buttonContainer}
          testID={"getStarted"}
        />
        <Button
          title={translate("common.logout")}
          buttonStyle={styles.buttonAlternate}
          titleStyle={styles.buttonAlternateTitle}
          onPress={() => logout()}
          containerStyle={styles.buttonContainer}
          testID={"getStarted"}
        />
      </View>
    </Screen>
  )
}