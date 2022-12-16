import * as React from "react"
import { RouteProp, useFocusEffect } from "@react-navigation/native"
import { Alert, Image, View } from "react-native"
import { Button } from "@rneui/themed"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import BiometricWrapper from "../../utils/biometricAuthentication"
import type { ScreenType } from "../../types/jsx"
import { AuthenticationScreenPurpose, PinScreenPurpose } from "../../utils/enum"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"

import BitcoinBeachLogo from "../get-started-screen/bitcoin-beach-logo.png"
import useLogout from "../../hooks/use-logout"
import { useAuthenticationContext } from "@app/store/authentication-context"
import { useI18nContext } from "@app/i18n/i18n-react"

const styles = EStyleSheet.create({
  Logo: {
    marginTop: 24,
    maxHeight: "50%",
    maxWidth: "50%",
  },

  bottom: {
    alignItems: "center",
    flex: 1,
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

  buttonAlternateTitle: {
    color: palette.white,
  },

  buttonContainer: {
    marginVertical: 12,
    width: "80%",
  },

  buttonTitle: {
    color: color.primary,
    fontWeight: "bold",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "authentication">
  route: RouteProp<RootStackParamList, "authentication">
}

export const AuthenticationScreen: ScreenType = ({ route, navigation }: Props) => {
  const { logout } = useLogout()
  const { screenPurpose, isPinEnabled } = route.params
  const { setAppUnlocked } = useAuthenticationContext()
  const { LL } = useI18nContext()

  useFocusEffect(() => {
    attemptAuthentication()
  })

  const attemptAuthentication = () => {
    let description
    if (screenPurpose === AuthenticationScreenPurpose.Authenticate) {
      description = LL.AuthenticationScreen.authenticationDescription()
    } else if (screenPurpose === AuthenticationScreenPurpose.TurnOnAuthentication) {
      description = LL.AuthenticationScreen.setUpAuthenticationDescription()
    }
    // Presents the OS specific authentication prompt
    BiometricWrapper.authenticate(
      description,
      handleAuthenticationSuccess,
      handleAuthenticationFailure,
    )
  }

  const handleAuthenticationSuccess = async () => {
    if (screenPurpose === AuthenticationScreenPurpose.Authenticate) {
      KeyStoreWrapper.resetPinAttempts()
    } else if (screenPurpose === AuthenticationScreenPurpose.TurnOnAuthentication) {
      KeyStoreWrapper.setIsBiometricsEnabled()
    }
    setAppUnlocked()
    navigation.replace("Primary")
  }

  const handleAuthenticationFailure = () => {
    // This is called when a user cancels or taps out of the authentication prompt,
    // so no action is necessary.
  }

  const logoutAndNavigateToPrimary = async () => {
    await logout()
    Alert.alert(LL.common.loggedOut(), "", [
      {
        text: LL.common.ok(),
        onPress: () => {
          navigation.replace("Primary")
        },
      },
    ])
  }

  let pinButtonContent
  let alternateContent

  if (isPinEnabled) {
    pinButtonContent = (
      <Button
        title={LL.AuthenticationScreen.usePin()}
        buttonStyle={styles.buttonAlternate}
        titleStyle={styles.buttonAlternateTitle}
        onPress={() =>
          navigation.navigate("pin", { screenPurpose: PinScreenPurpose.AuthenticatePin })
        }
        containerStyle={styles.buttonContainer}
      />
    )
  } else {
    pinButtonContent = null
  }

  if (screenPurpose === AuthenticationScreenPurpose.Authenticate) {
    alternateContent = (
      <>
        {pinButtonContent}
        <Button
          title={LL.common.logout()}
          buttonStyle={styles.buttonAlternate}
          titleStyle={styles.buttonAlternateTitle}
          onPress={() => logoutAndNavigateToPrimary()}
          containerStyle={styles.buttonContainer}
        />
      </>
    )
  } else if (screenPurpose === AuthenticationScreenPurpose.TurnOnAuthentication) {
    alternateContent = (
      <Button
        title={LL.AuthenticationScreen.skip()}
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
      backgroundColor={palette.white}
      statusBar="light-content"
    >
      <Image style={styles.Logo} source={BitcoinBeachLogo} resizeMode="contain" />
      <View style={styles.bottom}>
        <Button
          title={(() => {
            if (screenPurpose === AuthenticationScreenPurpose.Authenticate) {
              return LL.AuthenticationScreen.unlock()
            } else if (
              screenPurpose === AuthenticationScreenPurpose.TurnOnAuthentication
            ) {
              return LL.AuthenticationScreen.setUp()
            }
            return ""
          })()}
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
