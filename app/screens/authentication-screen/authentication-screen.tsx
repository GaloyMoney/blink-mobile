import { RouteProp, useFocusEffect, useNavigation } from "@react-navigation/native"
import { Button } from "@rneui/base"
import * as React from "react"
import { Alert, Image, View } from "react-native"

import { StackNavigationProp } from "@react-navigation/stack"
import { Screen } from "../../components/screen"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { AuthenticationScreenPurpose, PinScreenPurpose } from "../../utils/enum"
import KeyStoreWrapper from "../../utils/storage/secureStorage"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useAuthenticationContext } from "@app/navigation/navigation-container-wrapper"
import { makeStyles, useTheme } from "@rneui/themed"
import useLogout from "../../hooks/use-logout"
import AppLogoLightMode from "../../assets/logo/app-logo-light.svg"
import AppLogoDarkMode from "../../assets/logo/app-logo-dark.svg"
import AppLogoImage from '../get-started-screen/app-logo.png'

const useStyles = makeStyles((theme) => ({
  logo: {
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
    backgroundColor: theme.colors.white,
    borderRadius: 24,
  },

  buttonAlternate: {
    backgroundColor: palette.lightBlue,
    borderRadius: 24,
  },

  buttonAlternateTitle: {
    color: theme.colors.white,
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
}))

type Props = {
  route: RouteProp<RootStackParamList, "authentication">
}

export const AuthenticationScreen: React.FC<Props> = ({ route }) => {
  const { theme } = useTheme()
  const AppLogo = theme.mode === "dark" ? AppLogoDarkMode : AppLogoLightMode

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
          onPress={logoutAndNavigateToPrimary}
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

  let buttonTitle = ""
  if (screenPurpose === AuthenticationScreenPurpose.Authenticate) {
    buttonTitle = LL.AuthenticationScreen.unlock()
  } else if (screenPurpose === AuthenticationScreenPurpose.TurnOnAuthentication) {
    buttonTitle = LL.AuthenticationScreen.setUp()
  }

  return (
    <Screen style={styles.container}>
      {/* <AppLogo width={"100%"} height={"60%"} /> */}
      <Image style={{ maxHeight: "50%", maxWidth: "60%", }} source={AppLogoImage} resizeMode="contain" />
      <View style={styles.bottom}>
        <Button
          title={buttonTitle}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          onPress={attemptAuthentication}
          containerStyle={styles.buttonContainer}
        />
        {alternateContent}
      </View>
    </Screen>
  )
}
