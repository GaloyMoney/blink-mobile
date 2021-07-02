import * as React from "react"
import { useEffect, useState } from "react"
import { Alert, StatusBar, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Feather"
import { useApolloClient } from "@apollo/client"

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import { translate } from "../../i18n"
import { resetDataStore } from "../../utils/logout"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import type { ScreenType } from '../../types/screen'
import { PinScreenPurpose } from "../../utils/enum"

const styles = EStyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  topSpacer: {
    flex: 1,
  },

  bottomSpacer: {
    flex: 1,
  },

  circles: {
    flex: 2,
    flexDirection: "row",
  },

  circleContainer: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCircle: {
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    backgroundColor: palette.lightBlue,
    borderColor: palette.white,
    borderWidth: 2,
  },

  filledCircle: {
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    backgroundColor: palette.white,
  },

  helperTextContainer: {
    flex: 1,
  },

  helperText: {
    fontSize: 20,
    color: palette.white,
  },

  pinPad: {
    flex: 6,
    alignItems: "center",
    flexDirection: "column",
  },

  pinPadRow: {
    marginLeft: 32,
    marginRight: 32,
    flex: 1,
    flexDirection: "row",
  },

  pinPadButtonContainer: {
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  pinPadButton: {
    flex: 1,
    width: "95%",
    height: "95%",
    backgroundColor: palette.lightBlue,
  },

  pinPadButtonTitle: {
    marginLeft: "40%",
    marginRight: "40%",
    color: palette.white,
    fontSize: 26,
    fontWeight: "bold",
  },

  pinPadButtonIcon: {
    marginRight: "20%",
    color: palette.white,
    fontSize: 32,
  },
})

type Props = {
  route: {
    params: {
      screenPurpose: PinScreenPurpose
    }
  },
  navigation: any,
}

export const PinScreen: ScreenType = ({ route, navigation }: Props) => {
  const client = useApolloClient()

  const { screenPurpose } = route.params

  const [enteredPIN, setEnteredPIN] = useState("")
  const [helperText, setHelperText] = useState(
    screenPurpose === PinScreenPurpose.SetPin ? translate("PinScreen.setPin") : ""
  )
  const [previousPIN, setPreviousPIN] = useState("")
  const [pinAttempts, setPinAttempts] = useState(0)

  const MAX_PIN_ATTEMPTS = 3

  useEffect(() => {
    (async () => {
      setPinAttempts(await KeyStoreWrapper.getPinAttemptsOrZero())
    })()
  }, [])

  const handleCompletedPinForAuthenticatePin = async (newEnteredPIN: string) => {
    KeyStoreWrapper.setPinAttempts("0")
    if (newEnteredPIN === await KeyStoreWrapper.getPinOrEmptyString()) {
      KeyStoreWrapper.resetPinAttempts()
      navigation.reset({
        index: 0,
        routes: [{ name: "Primary" }],
      })
    } else {
      if (pinAttempts < (MAX_PIN_ATTEMPTS - 1)) {
        const newPinAttempts = pinAttempts + 1
        KeyStoreWrapper.setPinAttempts(newPinAttempts.toString())
        setPinAttempts(newPinAttempts)
        setEnteredPIN("")
        if (newPinAttempts === (MAX_PIN_ATTEMPTS - 1)) {
          setHelperText(translate("PinScreen.oneAttemptRemaining"))
        } else {
          const attemptsRemaining = MAX_PIN_ATTEMPTS - newPinAttempts
          setHelperText(translate("PinScreen.attemptsRemaining", { attemptsRemaining }))
        }
      } else {
        setHelperText(translate("PinScreen.tooManyAttempts"))
        await resetDataStore(client)
        navigation.reset({
          index: 0,
          routes: [{ name: "Primary" }],
        })
      }
    }
  }

  const handleCompletedPinForSetPin = (newEnteredPIN: string) => {
    if (previousPIN.length === 0) {
      setPreviousPIN(newEnteredPIN)
      setHelperText(translate("PinScreen.verifyPin"))
      setEnteredPIN("")
    } else {
      verifyPINCodeMathes(newEnteredPIN)
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

  const verifyPINCodeMathes = async (newEnteredPIN: string) => {
    if (previousPIN === newEnteredPIN) {
      if (await KeyStoreWrapper.setPin(previousPIN)) {
        KeyStoreWrapper.resetPinAttempts()
        navigation.goBack()
      } else {
        returnToSetPin()
        Alert.alert(translate("PinScreen.storePinFailed"))
      }
    } else {
      returnToSetPin()
    }
  }

  const returnToSetPin = () => {
    setPreviousPIN("")
    setHelperText(translate("PinScreen.setPinFailedMatch"))
    setEnteredPIN("")
  }

  const circleComponentForDigit = (digit: number) => {
    return (
      <View style={styles.circleContainer}>
        <View style={enteredPIN.length > digit ? styles.filledCircle : styles.emptyCircle} />
      </View>
    )
  }

  const buttonComponentForDigit = (digit: string) => {
    return (
      <View style={styles.pinPadButtonContainer}>
        <Button buttonStyle={styles.pinPadButton} titleStyle={styles.pinPadButtonTitle} title={digit} onPress={() => addDigit(digit)} />
      </View>
    )
  }

  return (
    <Screen style={styles.container} backgroundColor={palette.lightBlue}>
      <StatusBar backgroundColor={palette.lightBlue} barStyle="light-content" />
      <View style={styles.topSpacer} />
      <View style={styles.circles}>
        { circleComponentForDigit(0) }
        { circleComponentForDigit(1) }
        { circleComponentForDigit(2) }
        { circleComponentForDigit(3) }
      </View>
      <View style={styles.helperTextContainer}>
        <Text style={styles.helperText}>{helperText}</Text>
      </View>
      <View style={styles.pinPad}>
        <View style={styles.pinPadRow}>
          { buttonComponentForDigit("1") }
          { buttonComponentForDigit("2") }
          { buttonComponentForDigit("3") }
        </View>
        <View style={styles.pinPadRow}>
          { buttonComponentForDigit("4") }
          { buttonComponentForDigit("5") }
          { buttonComponentForDigit("6") }
        </View>
        <View style={styles.pinPadRow}>
          { buttonComponentForDigit("7") }
          { buttonComponentForDigit("8") }
          { buttonComponentForDigit("9") }
        </View>
        <View style={styles.pinPadRow}>
          <View style={styles.pinPadButtonContainer} />
          { buttonComponentForDigit("0") }
          <View style={styles.pinPadButtonContainer}>
            <Button 
              buttonStyle={styles.pinPadButton}
              icon={
                <Icon
                  style={styles.pinPadButtonIcon}
                  name="delete" />
              }
              onPress={() => setEnteredPIN(enteredPIN.slice(0, -1))}
            />
          </View>
        </View>
      </View>
      <View style={styles.bottomSpacer} />
    </Screen>
  )
}
