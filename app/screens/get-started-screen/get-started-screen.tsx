import React, { useState } from "react"
import { useI18nContext } from "@app/i18n/i18n-react"
import { StackNavigationProp } from "@react-navigation/stack"
import { View } from "react-native"
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { testProps } from "../../utils/testProps"
import AppLogoLightMode from "../../assets/logo/app-logo-light.svg"
import AppLogoDarkMode from "../../assets/logo/app-logo-dark.svg"
import { makeStyles, useTheme } from "@rneui/themed"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useFeatureFlags } from "@app/config/feature-flags-context"
import useAppCheckToken from "./use-device-token"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { DeviceAccountModal } from "./device-account-modal"
import { logGetStartedAction } from "@app/utils/analytics"

const useStyles = makeStyles(() => ({
  bottom: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "flex-end",
    marginBottom: 36,
    width: "100%",
  },

  buttonContainer: {
    marginVertical: 12,
  },

  screen: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  version: { paddingTop: 18 },
}))

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "getStarted">
}

export const GetStartedScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useStyles()

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

  const handleCreateDeviceAccount = () => {
    logGetStartedAction({
      action: "create_device_account",
      createDeviceAccountEnabled: Boolean(appCheckToken),
    })
    openConfirmationModal()
  }

  return (
    <Screen style={styles.screen}>
      <AppLogo width={"100%"} height={"60%"} />
      {appCheckToken ? (
        <DeviceAccountModal
          isVisible={confirmationModalVisible}
          closeModal={closeConfirmationModal}
          appCheckToken={appCheckToken}
        />
      ) : null}
      <VersionComponent style={styles.version} />
      <View style={styles.bottom}>
        <GaloyPrimaryButton
          title={LL.GetStartedScreen.logInCreateAccount()}
          onPress={handleCreateAccount}
          containerStyle={styles.buttonContainer}
          {...testProps(LL.GetStartedScreen.logInCreateAccount())}
        />
        {appCheckToken ? (
          <GaloySecondaryButton
            title={LL.GetStartedScreen.startTrialAccount()}
            onPress={handleCreateDeviceAccount}
            {...testProps(LL.GetStartedScreen.startTrialAccount())}
          />
        ) : (
          <GaloySecondaryButton
            title={LL.GetStartedScreen.exploreWalletInstead()}
            onPress={handleExploreWallet}
            {...testProps(LL.GetStartedScreen.exploreWalletInstead())}
          />
        )}
      </View>
    </Screen>
  )
}
