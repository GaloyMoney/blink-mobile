import React, { useEffect } from "react"
import { Image } from "react-native"

import { Screen } from "../../components/screen"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { AuthenticationScreenPurpose, PinScreenPurpose } from "../../utils/enum"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"

import AppLogoLightMode from "../../assets/logo/app-logo-light.png"
import AppLogoDarkMode from "../../assets/logo/app-logo-dark.png"
import { makeStyles, useTheme } from "@rneui/themed"

import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useAuthenticationContext } from "@app/navigation/navigation-container-wrapper"
import { useNavigation } from "@react-navigation/native"

export const AuthenticationCheckScreen: React.FC = () => {
  const styles = useStyles()
  const {
    theme: { mode },
  } = useTheme()
  const AppLogo = mode === "dark" ? AppLogoDarkMode : AppLogoLightMode

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "authenticationCheck">>()

  const isAuthed = useIsAuthed()
  const { setAppUnlocked } = useAuthenticationContext()

  useEffect(() => {
    ;(async () => {
      const isPinEnabled = await KeyStoreWrapper.getIsPinEnabled()

      if (
        (await BiometricWrapper.isSensorAvailable()) &&
        (await KeyStoreWrapper.getIsBiometricsEnabled())
      ) {
        navigation.replace("authentication", {
          screenPurpose: AuthenticationScreenPurpose.Authenticate,
          isPinEnabled,
        })
      } else if (isPinEnabled) {
        navigation.replace("pin", { screenPurpose: PinScreenPurpose.AuthenticatePin })
      } else {
        setAppUnlocked()
        navigation.replace("Primary")
      }
    })()
  }, [isAuthed, navigation, setAppUnlocked])

  return (
    <Screen style={styles.container}>
      <Image source={AppLogo} style={styles.logo} />
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    resizeMode: "contain",
  },
}))
