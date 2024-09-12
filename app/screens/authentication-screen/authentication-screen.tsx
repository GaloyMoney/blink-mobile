import { RouteProp, useFocusEffect, useNavigation } from "@react-navigation/native"
import * as React from "react"
import { Alert, Image, View } from "react-native"

import { StackNavigationProp } from "@react-navigation/stack"
import { Screen } from "../../components/screen"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { AuthenticationScreenPurpose, PinScreenPurpose } from "../../utils/enum"
import KeyStoreWrapper from "../../utils/storage/secureStorage"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useAuthenticationContext } from "@app/navigation/navigation-container-wrapper"
import { makeStyles, useTheme } from "@rneui/themed"
import useLogout from "../../hooks/use-logout"
import AppLogoLightMode from "../../assets/logo/app-logo-light.png"
import AppLogoDarkMode from "../../assets/logo/app-logo-dark.png"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"

type Props = {
  route: RouteProp<RootStackParamList, "authentication">
}

export const AuthenticationScreen: React.FC<Props> = ({ route }) => {
  const {
    theme: { mode },
  } = useTheme()
  const AppLogo = mode === "dark" ? AppLogoDarkMode : AppLogoLightMode

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "authentication">>()

  const styles = useStyles()
  const { logout } = useLogout()
  const { screenPurpose, isPinEnabled } = route.params
  const { setAppUnlocked } = useAuthenticationContext()
  const { LL } = useI18nContext()

  useFocusEffect(() => {
    attemptAuthentication()
  })

  const attemptAuthentication = () => {
    let description = "attemptAuthentication. should not be displayed?"
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

    if (screenPurpose === AuthenticationScreenPurpose.ShowSeedPhrase) {
      navigation.replace("BackupShowSeedPhrase")
    } else {
      setAppUnlocked()
      navigation.replace("Primary")
    }
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

  let PinButtonContent
  let AlternateContent

  if (isPinEnabled) {
    PinButtonContent = (
      <GaloySecondaryButton
        title={LL.AuthenticationScreen.usePin()}
        onPress={() =>
          navigation.navigate("pin", {
            screenPurpose:
              screenPurpose === AuthenticationScreenPurpose.ShowSeedPhrase
                ? PinScreenPurpose.ShowSeedPhrase
                : PinScreenPurpose.AuthenticatePin,
          })
        }
        containerStyle={styles.buttonContainer}
      />
    )
  } else {
    PinButtonContent = null
  }

  if (
    screenPurpose === AuthenticationScreenPurpose.Authenticate ||
    screenPurpose === AuthenticationScreenPurpose.ShowSeedPhrase
  ) {
    AlternateContent = (
      <>
        {PinButtonContent}
        <GaloySecondaryButton
          title={LL.common.logout()}
          onPress={logoutAndNavigateToPrimary}
          containerStyle={styles.buttonContainer}
        />
      </>
    )
  } else if (screenPurpose === AuthenticationScreenPurpose.TurnOnAuthentication) {
    AlternateContent = (
      <GaloySecondaryButton
        title={LL.AuthenticationScreen.skip()}
        onPress={() => navigation.replace("Primary")}
        containerStyle={styles.buttonContainer}
      />
    )
  } else {
    AlternateContent = null
  }

  let buttonTitle = ""
  if (
    screenPurpose === AuthenticationScreenPurpose.Authenticate ||
    screenPurpose === AuthenticationScreenPurpose.ShowSeedPhrase
  ) {
    buttonTitle = LL.AuthenticationScreen.unlock()
  } else if (screenPurpose === AuthenticationScreenPurpose.TurnOnAuthentication) {
    buttonTitle = LL.AuthenticationScreen.setUp()
  }

  return (
    <Screen>
      <Image source={AppLogo} style={styles.logo} />
      <View style={styles.bottom}>
        <GaloyPrimaryButton
          title={buttonTitle}
          onPress={attemptAuthentication}
          containerStyle={styles.buttonContainer}
        />
        {AlternateContent}
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  logo: {
    width: "100%",
    resizeMode: "contain",
  },

  bottom: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 36,
    width: "100%",
  },

  buttonContainer: {
    marginVertical: 12,
  },
}))
