import * as React from "react"
import { useEffect, useState } from "react"
import { Alert, StyleSheet, Text, View } from "react-native"
import { Button } from "@rneui/base"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import { PinScreenPurpose } from "../../utils/enum"
import { sleep } from "../../utils/sleep"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import { RouteProp } from "@react-navigation/native"
import useLogout from "../../hooks/use-logout"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useAuthenticationContext } from "@app/navigation/navigation-container-wrapper"

const styles = StyleSheet.create({
  bottomSpacer: {
    flex: 1,
  },

  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
  },

  circles: {
    flex: 2,
    flexDirection: "row",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  emptyCircle: {
    backgroundColor: palette.lightBlue,
    borderColor: palette.white,
    borderRadius: 16 / 2,
    borderWidth: 2,
    height: 16,
    width: 16,
  },

  filledCircle: {
    backgroundColor: palette.white,
    borderRadius: 16 / 2,
    height: 16,
    width: 16,
  },

  helperText: {
    color: palette.white,
    fontSize: 20,
  },

  helperTextContainer: {
    flex: 1,
  },

  pinPad: {
    alignItems: "center",
    flexDirection: "column",
    flex: 6,
  },

  pinPadButton: {
    backgroundColor: palette.lightBlue,
    flex: 1,
    height: "95%",
    width: "95%",
  },

  pinPadButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
  },

  pinPadButtonIcon: {
    color: palette.white,
    fontSize: 32,
    marginRight: "20%",
  },

  pinPadButtonTitle: {
    color: palette.white,
    fontSize: 26,
    fontWeight: "bold",
    marginLeft: "40%",
    marginRight: "40%",
  },

  pinPadRow: {
    flex: 1,
    flexDirection: "row",
    marginLeft: 32,
    marginRight: 32,
  },

  topSpacer: {
    flex: 1,
  },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "pin">
  route: RouteProp<RootStackParamList, "pin">
}

export const PinScreen: React.FC<Props> = ({ route, navigation }) => {
  const { logout } = useLogout()
  const { screenPurpose } = route.params
  const { setAppUnlocked } = useAuthenticationContext()
  const { LL } = useI18nContext()
  const [enteredPIN, setEnteredPIN] = useState("")
  const [helperText, setHelperText] = useState(
    screenPurpose === PinScreenPurpose.SetPin ? LL.PinScreen.setPin() : "",
  )
  const [previousPIN, setPreviousPIN] = useState("")
  const [pinAttempts, setPinAttempts] = useState(0)

  const MAX_PIN_ATTEMPTS = 3

  useEffect(() => {
    ;(async () => {
      setPinAttempts(await KeyStoreWrapper.getPinAttemptsOrZero())
    })()
  }, [])

  const handleCompletedPinForAuthenticatePin = async (newEnteredPIN: string) => {
    if (newEnteredPIN === (await KeyStoreWrapper.getPinOrEmptyString())) {
      KeyStoreWrapper.resetPinAttempts()
      setAppUnlocked()
      navigation.reset({
        index: 0,
        routes: [{ name: "Primary" }],
      })
    } else if (pinAttempts < MAX_PIN_ATTEMPTS - 1) {
      const newPinAttempts = pinAttempts + 1
      KeyStoreWrapper.setPinAttempts(newPinAttempts.toString())
      setPinAttempts(newPinAttempts)
      setEnteredPIN("")
      if (newPinAttempts === MAX_PIN_ATTEMPTS - 1) {
        setHelperText(LL.PinScreen.oneAttemptRemaining())
      } else {
        const attemptsRemaining = MAX_PIN_ATTEMPTS - newPinAttempts
        setHelperText(LL.PinScreen.attemptsRemaining({ attemptsRemaining }))
      }
    } else {
      setHelperText(LL.PinScreen.tooManyAttempts())
      await logout()
      await sleep(1000)
      navigation.reset({
        index: 0,
        routes: [{ name: "Primary" }],
      })
    }
  }

  const handleCompletedPinForSetPin = (newEnteredPIN: string) => {
    if (previousPIN.length === 0) {
      setPreviousPIN(newEnteredPIN)
      setHelperText(LL.PinScreen.verifyPin())
      setEnteredPIN("")
    } else {
      verifyPINCodeMatches(newEnteredPIN)
    }
  }

  const addDigit = (digit: string) => {
    if (enteredPIN.length < 4) {
      const newEnteredPIN = enteredPIN + digit
      setEnteredPIN(newEnteredPIN)

      if (newEnteredPIN.length === 4) {
        if (screenPurpose === PinScreenPurpose.AuthenticatePin) {
          handleCompletedPinForAuthenticatePin(newEnteredPIN)
        } else if (screenPurpose === PinScreenPurpose.SetPin) {
          handleCompletedPinForSetPin(newEnteredPIN)
        }
      }
    }
  }

  const verifyPINCodeMatches = async (newEnteredPIN: string) => {
    if (previousPIN === newEnteredPIN) {
      if (await KeyStoreWrapper.setPin(previousPIN)) {
        KeyStoreWrapper.resetPinAttempts()
        navigation.goBack()
      } else {
        returnToSetPin()
        Alert.alert(LL.PinScreen.storePinFailed())
      }
    } else {
      returnToSetPin()
    }
  }

  const returnToSetPin = () => {
    setPreviousPIN("")
    setHelperText(LL.PinScreen.setPinFailedMatch())
    setEnteredPIN("")
  }

  const circleComponentForDigit = (digit: number) => {
    return (
      <View style={styles.circleContainer}>
        <View
          style={enteredPIN.length > digit ? styles.filledCircle : styles.emptyCircle}
        />
      </View>
    )
  }

  const buttonComponentForDigit = (digit: string) => {
    return (
      <View style={styles.pinPadButtonContainer}>
        <Button
          buttonStyle={styles.pinPadButton}
          titleStyle={styles.pinPadButtonTitle}
          title={digit}
          onPress={() => addDigit(digit)}
        />
      </View>
    )
  }

  return (
    <Screen style={styles.container} backgroundColor={palette.lightBlue}>
      <View style={styles.topSpacer} />
      <View style={styles.circles}>
        {circleComponentForDigit(0)}
        {circleComponentForDigit(1)}
        {circleComponentForDigit(2)}
        {circleComponentForDigit(3)}
      </View>
      <View style={styles.helperTextContainer}>
        <Text style={styles.helperText}>{helperText}</Text>
      </View>
      <View style={styles.pinPad}>
        <View style={styles.pinPadRow}>
          {buttonComponentForDigit("1")}
          {buttonComponentForDigit("2")}
          {buttonComponentForDigit("3")}
        </View>
        <View style={styles.pinPadRow}>
          {buttonComponentForDigit("4")}
          {buttonComponentForDigit("5")}
          {buttonComponentForDigit("6")}
        </View>
        <View style={styles.pinPadRow}>
          {buttonComponentForDigit("7")}
          {buttonComponentForDigit("8")}
          {buttonComponentForDigit("9")}
        </View>
        <View style={styles.pinPadRow}>
          <View style={styles.pinPadButtonContainer} />
          {buttonComponentForDigit("0")}
          <View style={styles.pinPadButtonContainer}>
            <Button
              buttonStyle={styles.pinPadButton}
              icon={<Icon style={styles.pinPadButtonIcon} name="arrow-back" />}
              onPress={() => setEnteredPIN(enteredPIN.slice(0, -1))}
            />
          </View>
        </View>
      </View>
      <View style={styles.bottomSpacer} />
    </Screen>
  )
}
