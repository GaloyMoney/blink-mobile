import * as React from "react"
import { useState } from "react"
import { Alert, StatusBar, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Feather"
import { useApolloClient } from "@apollo/client"
<<<<<<< HEAD
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store"
=======
>>>>>>> Wrap SecureKeyStore and Biometric utility functions

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import { translate } from "../../i18n"
import { resetDataStore } from "../../utils/logout"
import KeyStoreWrapper from "../../utils/storage/secureStorage"

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
  route: any
  navigation: any
}

export const PinScreen = ({ route, navigation }: Props) => {
  const client = useApolloClient()

  const { screenPurpose, pin, mPinAttempts } = route.params

  const [enteredPIN, setEnteredPIN] = useState("")
  const [helperText, setHelperText] = useState(
    screenPurpose === "setPIN" ? translate("PinScreen.setPin") : "",
  )
  const [previousPIN, setPreviousPIN] = useState("")
  const [pinAttempts, setPinAttempts] = useState(mPinAttempts)

  const handleCompletedPinForAuthenticatePin = async (newEnteredPIN: string) => {
    if (newEnteredPIN === pin) {
<<<<<<< HEAD
      RNSecureKeyStore.set("pinAttempts", "0", {
        accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
      })
=======
      KeyStoreWrapper.setPinAttempts("0")
>>>>>>> Wrap SecureKeyStore and Biometric utility functions
      navigation.reset({
        index: 0,
        routes: [{ name: "Primary" }],
      })
    } else {
      if (pinAttempts < 2) {
        let newPinAttempts = pinAttempts + 1
<<<<<<< HEAD
        RNSecureKeyStore.set("pinAttempts", newPinAttempts.toString(), {
          accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
        })
=======
        KeyStoreWrapper.setPinAttempts(newPinAttempts.toString())
>>>>>>> Wrap SecureKeyStore and Biometric utility functions
        setPinAttempts(newPinAttempts)
        setEnteredPIN("")
        if (newPinAttempts === 2) {
          setHelperText(translate("PinScreen.oneAttemptRemaining"))
        } else {
          let attemptsRemaining = 3 - newPinAttempts
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
      let newEnteredPIN = enteredPIN + digit

      setEnteredPIN(newEnteredPIN)
      console.log(pinAttempts)
      if (newEnteredPIN.length === 4) {
        switch (screenPurpose) {
          case "authenticatePIN": {
            handleCompletedPinForAuthenticatePin(newEnteredPIN)
            break
          }
          case "setPIN": {
            handleCompletedPinForSetPin(newEnteredPIN)
          }
        }
      }
    }
  }

  const verifyPINCodeMathes = async (newEnteredPIN: string) => {
    if (previousPIN === newEnteredPIN) {
      if (await KeyStoreWrapper.setPin(previousPIN)) {
        KeyStoreWrapper.setPinAttempts("0")
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

  const circleComponentForDigit = (digit: Number) => {
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
