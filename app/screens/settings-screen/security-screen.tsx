import * as React from "react"
import { useState } from "react"
import { RouteProp, useFocusEffect } from "@react-navigation/native"
import { Text, View } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button, Switch } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { toastShow } from "../../utils/toast"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { PinScreenPurpose } from "../../utils/enum"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import {
  HIDE_BALANCE,
  saveHideBalance,
  saveHiddenBalanceToolTip,
} from "../../graphql/client-only-query"
import { useApolloClient, useQuery } from "@apollo/client"
import { useI18nContext } from "@app/i18n/i18n-react"

const styles = EStyleSheet.create({
  button: {
    backgroundColor: palette.white,
    paddingBottom: 16,
    paddingLeft: 0,
    paddingRight: 16,
    paddingTop: 16,
  },

  buttonTitle: {
    color: palette.black,
    fontSize: 16,
    fontWeight: "normal",
  },

  container: {
    backgroundColor: palette.white,
    minHeight: "100%",
    paddingLeft: 24,
    paddingRight: 24,
  },

  description: {
    color: palette.darkGrey,
    fontSize: 14,
    marginTop: 2,
  },

  settingContainer: {
    borderBottomColor: palette.lightGrey,
    borderBottomWidth: 1,
    flexDirection: "row",
  },

  subtitle: {
    color: palette.darkGrey,
    fontSize: 16,
    marginTop: 16,
  },

  switch: {
    bottom: 18,
    position: "absolute",
    right: 0,
  },

  textContainer: {
    marginBottom: 12,
    marginRight: 60,
    marginTop: 32,
  },

  title: {
    color: palette.black,
    fontSize: 20,
    fontWeight: "bold",
  },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "security">
  route: RouteProp<RootStackParamList, "security">
}

export const SecurityScreen: ScreenType = ({ route, navigation }: Props) => {
  const client = useApolloClient()
  const { mIsBiometricsEnabled, mIsPinEnabled } = route.params
  const { data } = useQuery(HIDE_BALANCE)
  const { LL } = useI18nContext()
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(mIsBiometricsEnabled)
  const [isPinEnabled, setIsPinEnabled] = useState(mIsPinEnabled)
  const [isHideBalanceEnabled, setIsHideBalanceEnabled] = useState(
    data?.hideBalance ?? null,
  )

  useFocusEffect(() => {
    getIsBiometricsEnabled()
    getIsPinEnabled()
  })
  const getIsBiometricsEnabled = async () => {
    setIsBiometricsEnabled(await KeyStoreWrapper.getIsBiometricsEnabled())
  }

  const getIsPinEnabled = async () => {
    setIsPinEnabled(await KeyStoreWrapper.getIsPinEnabled())
  }

  const onBiometricsValueChanged = async (value) => {
    if (value) {
      try {
        if (await BiometricWrapper.isSensorAvailable()) {
          // Presents the OS specific authentication prompt
          BiometricWrapper.authenticate(
            LL.AuthenticationScreen.setUpAuthenticationDescription(),
            handleAuthenticationSuccess,
            handleAuthenticationFailure,
          )
        } else {
          toastShow({
            message: (translations) => translations.SecurityScreen.biometryNotAvailable(),
            currentTranslation: LL,
          })
        }
      } catch {
        toastShow({
          message: (translations) => translations.SecurityScreen.biometryNotEnrolled(),
          currentTranslation: LL,
        })
      }
    } else if (await KeyStoreWrapper.removeIsBiometricsEnabled()) {
      setIsBiometricsEnabled(false)
    }
  }

  const handleAuthenticationSuccess = async () => {
    if (await KeyStoreWrapper.setIsBiometricsEnabled()) {
      setIsBiometricsEnabled(true)
    }
  }

  const handleAuthenticationFailure = () => {
    // This is called when a user cancels or taps out of the authentication prompt,
    // so no action is necessary.
  }

  const onPinValueChanged = async (value) => {
    if (value) {
      navigation.navigate("pin", { screenPurpose: PinScreenPurpose.SetPin })
    } else {
      removePin()
    }
  }

  const onHideBalanceValueChanged = async (value) => {
    if (value) {
      setIsHideBalanceEnabled(await saveHideBalance(client, true))
      await saveHiddenBalanceToolTip(client, true)
    } else {
      setIsHideBalanceEnabled(await saveHideBalance(client, false))
      await saveHiddenBalanceToolTip(client, false)
    }
  }

  const removePin = async () => {
    if (await KeyStoreWrapper.removePin()) {
      KeyStoreWrapper.removePinAttempts()
      setIsPinEnabled(false)
    }
  }

  return (
    <Screen style={styles.container} preset="scroll">
      <View style={styles.settingContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{LL.SecurityScreen.biometricTitle()}</Text>
          <Text style={styles.subtitle}>{LL.SecurityScreen.biometricSubtitle()}</Text>
          <Text style={styles.description}>
            {LL.SecurityScreen.biometricDescription()}
          </Text>
        </View>
        <Switch
          style={styles.switch}
          value={isBiometricsEnabled}
          color={palette.lightBlue}
          onValueChange={(value) => onBiometricsValueChanged(value)}
        />
      </View>
      <View style={styles.settingContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{LL.SecurityScreen.pinTitle()}</Text>
          <Text style={styles.subtitle}>{LL.SecurityScreen.pinSubtitle()}</Text>
          <Text style={styles.description}>{LL.SecurityScreen.pinDescription()}</Text>
        </View>
        <Switch
          style={styles.switch}
          value={isPinEnabled}
          color={palette.lightBlue}
          onValueChange={(value) => onPinValueChanged(value)}
        />
      </View>
      <View style={styles.settingContainer}>
        <Button
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          title={LL.SecurityScreen.setPin()}
          onPress={() =>
            navigation.navigate("pin", { screenPurpose: PinScreenPurpose.SetPin })
          }
        />
      </View>
      <View style={styles.settingContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{LL.SecurityScreen.hideBalanceTitle()}</Text>
          <Text style={styles.subtitle}>{LL.SecurityScreen.hideBalanceSubtitle()}</Text>
          <Text style={styles.description}>
            {LL.SecurityScreen.hideBalanceDescription()}
          </Text>
        </View>
        <Switch
          style={styles.switch}
          value={isHideBalanceEnabled}
          color={palette.lightBlue}
          onValueChange={(value) => onHideBalanceValueChanged(value)}
        />
      </View>
    </Screen>
  )
}
