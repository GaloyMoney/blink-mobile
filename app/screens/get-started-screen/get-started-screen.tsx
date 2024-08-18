import React, { useEffect, useRef, useState } from "react"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"
import { RootStackParamList } from "../../navigation/stack-param-lists"

// components
import { Screen } from "../../components/screen"
import { DeviceAccountFailModal } from "./device-account-fail-modal"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"
import { useAppConfig } from "@app/hooks"
import { useCreateAccount } from "@app/hooks/useCreateAccount"

// assets
import AppLogoLightMode from "../../assets/logo/app-logo-light.svg"
import AppLogoDarkMode from "../../assets/logo/app-logo-dark.svg"

// utils
import { logGetStartedAction } from "@app/utils/analytics"
import { testProps } from "@app/utils/testProps"
import { useNavigation } from "@react-navigation/native"

type Props = StackScreenProps<RootStackParamList, "getStarted">

export const GetStartedScreen: React.FC<Props> = ({ navigation }) => {
  const welcomeNavigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const {
    theme: { mode },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { saveToken } = useAppConfig()
  const { createDeviceAccountAndLogin, appcheckTokenLoading } = useCreateAccount()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [secretMenuCounter, setSecretMenuCounter] = useState(0)
  const {
    theme: { colors },
  } = useTheme()
  const AppLogo = mode === "dark" ? AppLogoDarkMode : AppLogoLightMode

  useEffect(() => {
    if (secretMenuCounter > 2) {
      setError(false)
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
      onCompleteLogin(token)
    } else {
      navigation.replace("phoneFlow", {
        onComplete: onCompleteLogin,
      })
    }
  }

  const onCompleteLogin = (token?: string) => {
    if (token) {
      setError(false)
      saveToken(token)
      navigation.replace("Primary")
    } else {
      setError(true)
    }
  }

  const onRestoreWallet = () => {
    setError(false)
    navigation.navigate("ImportWalletOptions")
  }

  const navigateToHomeScreen = () => {
    setError(false)
    navigation.replace("Primary")
  }

  const pulseAnim = useRef(new Animated.Value(1)).current // Initial scale value

  useEffect(() => {
    const pulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1, // Scale up
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1, // Scale down
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }

    pulse()
  }, [pulseAnim])

  const handleHelpPress = () => {
    welcomeNavigation.navigate("welcomeFirst")
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
        {/* Help Icon */}
        <View style={styles.helpIconContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity onPress={handleHelpPress}>
              <Icon name="help-circle-outline" size={40} color={colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        </View>
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
      {(loading || appcheckTokenLoading) && (
        <View style={styles.loading}>
          <ActivityIndicator size={"large"} color={"#60aa55"} />
        </View>
      )}
      <DeviceAccountFailModal
        isVisible={error}
        closeModal={() => setError(false)}
        navigateToHomeScreen={navigateToHomeScreen}
      />
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
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
    zIndex: 1,
  },
  helpIconContainer: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    color: colors.primary,
  },
}))
