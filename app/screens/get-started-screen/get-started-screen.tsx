import React, { useEffect, useState } from "react"
import { StackScreenProps } from "@react-navigation/stack"
import { ActivityIndicator, Pressable, TouchableOpacity, View } from "react-native"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { RootStackParamList } from "../../navigation/stack-param-lists"

// components
import { Screen } from "../../components/screen"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"
import { useAppConfig, useCreateAccount } from "@app/hooks"

// assets
import AppLogoLightMode from "../../assets/logo/app-logo-light.svg"
import AppLogoDarkMode from "../../assets/logo/app-logo-dark.svg"

// utils
import { logGetStartedAction } from "@app/utils/analytics"
import { testProps } from "@app/utils/testProps"

type Props = StackScreenProps<RootStackParamList, "getStarted">

export const GetStartedScreen: React.FC<Props> = ({ navigation }) => {
  const {
    theme: { mode },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { saveToken } = useAppConfig()
  const { createDeviceAccountAndLogin } = useCreateAccount()
  const [loading, setLoading] = useState(false)
  const [secretMenuCounter, setSecretMenuCounter] = useState(0)

  const AppLogo = mode === "dark" ? AppLogoDarkMode : AppLogoLightMode

  useEffect(() => {
    if (secretMenuCounter > 2) {
      navigation.navigate("developerScreen")
      setSecretMenuCounter(0)
    }
  }, [navigation, secretMenuCounter])

  const handleCreateDeviceAccount = async () => {
    logGetStartedAction({
      action: "create_device_account",
      createDeviceAccountEnabled: Boolean(true),
    })
    setLoading(true)
    const token = await createDeviceAccountAndLogin()
    setLoading(false)
    if (token) {
      saveToken(token)
      navigation.navigate("Primary")
    }
  }

  const onRestoreWallet = () => {
    navigation.navigate("ImportWalletOptions")
  }

  return (
    <Screen>
      <Pressable
        onPress={() => setSecretMenuCounter(secretMenuCounter + 1)}
        style={styles.logoContainer}
        {...testProps("logo-button")}
      >
        <AppLogo width={"100%"} height={"100%"} />
      </Pressable>
      <View style={styles.bottom}>
        <GaloyPrimaryButton
          title={LL.GetStartedScreen.quickStart()}
          onPress={handleCreateDeviceAccount}
          containerStyle={styles.buttonContainer}
        />
        <View style={styles.loginFooterContainer}>
          <TouchableOpacity activeOpacity={0.5} onPress={onRestoreWallet}>
            <Text type="p2" style={styles.buttonText}>
              {LL.GetStartedScreen.restoreWallet()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size={"large"} color={"#60aa55"} />
        </View>
      )}
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
  loginFooterContainer: {
    marginTop: 24,
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonText: {
    textDecorationLine: "underline",
  },
  loading: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
}))
