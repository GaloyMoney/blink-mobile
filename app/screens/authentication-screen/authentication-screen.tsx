import * as React from "react"
import { useFocusEffect } from "@react-navigation/native"
import { Alert, Image, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { useApolloClient } from "@apollo/client"
<<<<<<< HEAD
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store"
=======
>>>>>>> Wrap SecureKeyStore and Biometric utility functions

import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { translate } from "../../i18n"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { resetDataStore } from "../../utils/logout"
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
  },
})

type Props = {
  route: any
  navigation: any
}

export const AuthenticationScreen: ScreenType = ({ route, navigation }: Props) => {
  const client = useApolloClient()

  const { screenPurpose, pin, mPinAttempts } = route.params

  useFocusEffect(() => {
    attemptAuthentication()
  })

  const attemptAuthentication = () => {
    let description
    if (screenPurpose === "authenticate") {
      description = translate("AuthenticationScreen.authenticationDescription")
    } else {
      description = translate("AuthenticationScreen.setUpAuthenticationDescription")
    }
    BiometricWrapper.authenticate(description, handleAuthenticationSuccess, handleAuthenticationFailure)
  }

  const handleAuthenticationSuccess = () => {
    if (screenPurpose === "authenticate") {
      KeyStoreWrapper.setPinAttempts("0")
    } else if (screenPurpose === "turnOnAuthentication") {
      KeyStoreWrapper.setIsBiometricsEnabled()
    }
    navigation.replace("Primary")
  }

  const handleAuthenticationFailure = () => {
    /* This is called when a user cancels or taps out of the authentication prompt,
    so no action is necessary. */
  }

  const logout = async () => {
    await resetDataStore(client)
    Alert.alert(translate("common.loggedOut"), "", [
      {
        text: translate("common.ok"),
        onPress: () => {
          navigation.replace("Primary")
        },
      },
    ])
  }

  let pinButtonContent
  let alternateContent

  if (pin !== undefined && pin.length > 0) {
    pinButtonContent = (
      <Button
        title={translate("AuthenticationScreen.usePin")}
        buttonStyle={styles.buttonAlternate}
        titleStyle={styles.buttonAlternateTitle}
        onPress={() =>
          navigation.navigate("pin", {
            screenPurpose: "authenticatePIN",
            pin: pin,
            mPinAttempts: mPinAttempts,
          })
        }
        containerStyle={styles.buttonContainer}
      />
    )
  } else {
    pinButtonContent = null
  }

  if (screenPurpose === "authenticate") {
    alternateContent = (
      <>
        {pinButtonContent}
        <Button
          title={translate("common.logout")}
          buttonStyle={styles.buttonAlternate}
          titleStyle={styles.buttonAlternateTitle}
          onPress={() => logout()}
          containerStyle={styles.buttonContainer}
        />
      </>
    )
  } else if (screenPurpose === "turnOnAuthentication") {
    alternateContent = (
      <Button
        title={translate("AuthenticationScreen.skip")}
        buttonStyle={styles.buttonAlternate}
        titleStyle={styles.buttonAlternateTitle}
        onPress={() => navigation.replace("Primary")}
        containerStyle={styles.buttonContainer}
      />
    )
  } else {
    alternateContent = null
  }

  return (
    <Screen
      style={styles.container}
      backgroundColor={palette.lightBlue}
      statusBar="light-content"
    >
      <Image style={styles.Logo} source={BitcoinBeachLogo} resizeMode="contain" />
      <View style={styles.bottom}>
        <Button
          title={
            screenPurpose === "authenticate"
              ? translate("AuthenticationScreen.unlock")
              : translate("AuthenticationScreen.setUp")
          }
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          onPress={() => attemptAuthentication()}
          containerStyle={styles.buttonContainer}
        />
        {alternateContent}
      </View>
    </Screen>
  )
}
