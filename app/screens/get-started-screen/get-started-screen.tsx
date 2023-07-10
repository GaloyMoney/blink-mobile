import React, { useState } from "react"
import { useI18nContext } from "@app/i18n/i18n-react"
import { StackNavigationProp } from "@react-navigation/stack"
import { Pressable, TouchableOpacity, View } from "react-native"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import AppLogoLightMode from "../../assets/logo/app-logo-light.svg"
import AppLogoDarkMode from "../../assets/logo/app-logo-dark.svg"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useFeatureFlags } from "@app/config/feature-flags-context"
import useAppCheckToken from "./use-device-token"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { DeviceAccountModal } from "./device-account-modal"
import { logGetStartedAction } from "@app/utils/analytics"
import { useNavigation } from "@react-navigation/native"

export const GetStartedScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "getStarted">>()

  const styles = useStyles()

  const [secretMenuCounter, setSecretMenuCounter] = React.useState(0)
  React.useEffect(() => {
    if (secretMenuCounter > 2) {
      navigation.navigate("developerScreen")
      setSecretMenuCounter(0)
    }
  }, [navigation, secretMenuCounter])

  const {
    theme: { mode },
  } = useTheme()
  const AppLogo = mode === "dark" ? AppLogoDarkMode : AppLogoLightMode

  const { LL } = useI18nContext()
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false)
  const openConfirmationModal = () => setConfirmationModalVisible(true)
  const closeConfirmationModal = () => {
    setConfirmationModalVisible(false)
  }

  const { deviceAccountEnabled } = useFeatureFlags()

  const [appCheckToken] = useAppCheckToken({ skip: !deviceAccountEnabled })

  const handleCreateAccount = () => {
    logGetStartedAction({
      action: "log_in",
      createDeviceAccountEnabled: Boolean(appCheckToken),
    })
    navigation.navigate("phoneFlow")
  }

  const handleExploreWallet = () => {
    logGetStartedAction({
      action: "explore_wallet",
      createDeviceAccountEnabled: Boolean(appCheckToken),
    })
    navigation.navigate("Primary")
  }

  const handleCreateDeviceAccount = async () => {
    logGetStartedAction({
      action: "create_device_account",
      createDeviceAccountEnabled: Boolean(appCheckToken),
    })

    openConfirmationModal()
  }

  const handleLoginWithEmail = async () => {
    logGetStartedAction({
      action: "login_with_email",
      createDeviceAccountEnabled: Boolean(appCheckToken),
    })

    navigation.navigate("emailLoginInput")
  }

  return (
    <Screen>
      <Pressable
        onPress={() => setSecretMenuCounter(secretMenuCounter + 1)}
        style={styles.logoContainer}
      >
        <AppLogo width={"100%"} height={"100%"} />
      </Pressable>
      <DeviceAccountModal
        isVisible={confirmationModalVisible}
        closeModal={closeConfirmationModal}
        appCheckToken={appCheckToken}
      />
      <View style={styles.bottom}>
        <GaloyPrimaryButton
          title={LL.GetStartedScreen.createAccount()}
          onPress={handleCreateAccount}
          containerStyle={styles.buttonContainer}
        />
        {appCheckToken ? (
          <GaloySecondaryButton
            title={LL.GetStartedScreen.startTrialAccount()}
            onPress={handleCreateDeviceAccount}
          />
        ) : (
          <GaloySecondaryButton
            title={LL.GetStartedScreen.exploreWallet()}
            onPress={handleExploreWallet}
          />
        )}
        <View style={styles.container}>
          <Text style={styles.text}>{LL.GetStartedScreen.loginBackWith()} </Text>
          <TouchableOpacity activeOpacity={0.5} onPress={handleCreateAccount}>
            <Text style={styles.buttonText}>{LL.common.phone()}</Text>
          </TouchableOpacity>
          <Text style={styles.text}> {LL.common.or()} </Text>
          <TouchableOpacity activeOpacity={0.5} onPress={handleLoginWithEmail}>
            <Text style={styles.buttonText}>{LL.common.email()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  bottom: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "flex-end",
    marginBottom: 36,
  },

  buttonContainer: {
    marginVertical: 6,
  },

  logoContainer: { width: "100%", height: "50%", marginTop: 50 },

  container: {
    marginTop: 24,
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontSize: 18,
  },
  buttonText: {
    fontSize: 18,
    textDecorationLine: "underline",
  },
}))
