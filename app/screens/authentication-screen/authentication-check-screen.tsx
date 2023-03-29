import * as React from "react"
import { useEffect } from "react"
import { Image, StyleSheet } from "react-native"

import { Screen } from "../../components/screen"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { AuthenticationScreenPurpose, PinScreenPurpose } from "../../utils/enum"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"

import AppLogo from "../get-started-screen/app-logo.png"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useAuthenticationContext } from "@app/navigation/navigation-container-wrapper"
import { useNavigation } from "@react-navigation/native"

const styles = StyleSheet.create({
  logo: {
    marginTop: 24,
    maxHeight: "50%",
    maxWidth: "50%",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
})

export const AuthenticationCheckScreen: React.FC = () => {
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
      <Image style={styles.logo} source={AppLogo} resizeMode="contain" />
    </Screen>
  )
}
