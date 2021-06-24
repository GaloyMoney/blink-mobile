import * as React from "react"
import { useState } from "react"
import { Alert, StatusBar, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Feather"
import { useApolloClient } from "@apollo/client"
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store"

import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { translate } from "../../i18n"
import { resetDataStore } from "../../utils/logout"

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
    // backgroundColor: palette.orange,
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
      RNSecureKeyStore.set("pinAttempts", "0", {
        accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
      })
      navigation.reset({
        index: 0,
        routes: [{ name: "Primary" }],
      })
    } else {
      if (pinAttempts < 2) {
        let newPinAttempts = pinAttempts + 1
        RNSecureKeyStore.set("pinAttempts", newPinAttempts.toString(), {
          accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
        })
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

  const verifyPINCodeMathes = (newEnteredPIN: string) => {
    if (previousPIN === newEnteredPIN) {
      RNSecureKeyStore.set("PIN", previousPIN, {
        accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
      }).then(
        (res) => {
          RNSecureKeyStore.set("pinAttempts", "0", {
            accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
          })
          navigation.goBack()
        },
        (err) => {
          returnToSetPin()
          Alert.alert("Unable to store your pin.")
        },
      )
    } else {
      returnToSetPin()
    }
  }

  const returnToSetPin = () => {
    setPreviousPIN("")
    setHelperText(translate("PinScreen.setPinFailedMatch"))
    setEnteredPIN("")
  }

  const authenticatePINCode = () => {}

  return (
    <Screen style={styles.container} backgroundColor={palette.lightBlue}>
      <StatusBar backgroundColor={palette.lightBlue} barStyle="light-content" />
      <View style={styles.topSpacer} />
      <View style={styles.circles}>
        <View style={styles.circleContainer}>
          <View
            style={enteredPIN.length > 0 ? styles.filledCircle : styles.emptyCircle}
          />
        </View>
        <View style={styles.circleContainer}>
          <View
            style={enteredPIN.length > 1 ? styles.filledCircle : styles.emptyCircle}
          />
        </View>
        <View style={styles.circleContainer}>
          <View
            style={enteredPIN.length > 2 ? styles.filledCircle : styles.emptyCircle}
          />
        </View>
        <View style={styles.circleContainer}>
          <View
            style={enteredPIN.length > 3 ? styles.filledCircle : styles.emptyCircle}
          />
        </View>
      </View>
      <View style={styles.helperTextContainer}>
        <Text style={styles.helperText}>{helperText}</Text>
      </View>
      <View style={styles.pinPad}>
        <View style={styles.pinPadRow}>
          <View style={styles.pinPadButtonContainer}>
            <Button
              buttonStyle={styles.pinPadButton}
              titleStyle={styles.pinPadButtonTitle}
              title="1"
              onPress={() => addDigit("1")}
            />
          </View>
          <View style={styles.pinPadButtonContainer}>
            <Button
              buttonStyle={styles.pinPadButton}
              titleStyle={styles.pinPadButtonTitle}
              title="2"
              onPress={() => addDigit("2")}
            />
          </View>
          <View style={styles.pinPadButtonContainer}>
            <Button
              buttonStyle={styles.pinPadButton}
              titleStyle={styles.pinPadButtonTitle}
              title="3"
              onPress={() => addDigit("3")}
            />
          </View>
        </View>
        <View style={styles.pinPadRow}>
          <View style={styles.pinPadButtonContainer}>
            <Button
              buttonStyle={styles.pinPadButton}
              titleStyle={styles.pinPadButtonTitle}
              title="4"
              onPress={() => addDigit("4")}
            />
          </View>
          <View style={styles.pinPadButtonContainer}>
            <Button
              buttonStyle={styles.pinPadButton}
              titleStyle={styles.pinPadButtonTitle}
              title="5"
              onPress={() => addDigit("5")}
            />
          </View>
          <View style={styles.pinPadButtonContainer}>
            <Button
              buttonStyle={styles.pinPadButton}
              titleStyle={styles.pinPadButtonTitle}
              title="6"
              onPress={() => addDigit("6")}
            />
          </View>
        </View>
        <View style={styles.pinPadRow}>
          <View style={styles.pinPadButtonContainer}>
            <Button
              buttonStyle={styles.pinPadButton}
              titleStyle={styles.pinPadButtonTitle}
              title="7"
              onPress={() => addDigit("7")}
            />
          </View>
          <View style={styles.pinPadButtonContainer}>
            <Button
              buttonStyle={styles.pinPadButton}
              titleStyle={styles.pinPadButtonTitle}
              title="8"
              onPress={() => addDigit("8")}
            />
          </View>
          <View style={styles.pinPadButtonContainer}>
            <Button
              buttonStyle={styles.pinPadButton}
              titleStyle={styles.pinPadButtonTitle}
              title="9"
              onPress={() => addDigit("9")}
            />
          </View>
        </View>
        <View style={styles.pinPadRow}>
          <View style={styles.pinPadButtonContainer} />
          <View style={styles.pinPadButtonContainer}>
            <Button
              buttonStyle={styles.pinPadButton}
              titleStyle={styles.pinPadButtonTitle}
              title="0"
              onPress={() => addDigit("0")}
            />
          </View>
          <View style={styles.pinPadButtonContainer}>
            {/* <Icon.Button
              name="delete"
              size={30}
              color="white" /> */}
            <Button
              buttonStyle={styles.pinPadButton}
              icon={<Icon style={styles.pinPadButtonIcon} name="delete" />}
              onPress={() => setEnteredPIN(enteredPIN.slice(0, -1))}
            />
          </View>
        </View>
      </View>
      <View style={styles.bottomSpacer} />
    </Screen>
  )
}
