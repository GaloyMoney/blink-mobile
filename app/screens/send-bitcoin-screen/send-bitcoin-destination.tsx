import React from "react"
import { palette } from "@app/theme"
import { StyleSheet, Text, TextInput, View } from "react-native"
import { translateUnknown as translate } from "@galoymoney/client"
import { Button } from "react-native-elements"
import ScanIcon from "@app/assets/icons/scan.svg"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"

const Styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
  },
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: palette.white,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
  },
  descriptionContainer: {
    flex: 4,
  },
  buttonContainer: {
    flex: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
  },
  button: {
    height: 50,
    borderRadius: 10,
  },
  disabledButtonStyle: {
    backgroundColor: "rgba(83, 111, 242, 0.1)",
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
  activeButtonStyle: {
    backgroundColor: palette.lightBlue,
  },
  activeButtonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },
  fieldTitleText: {
    fontWeight: "bold",
    color: palette.lapisLazuli,
  },
  iconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
  },
  errorText: {
    color: palette.red,
    textAlign: "center",
  },
})

const SendBitcoinDestination = ({
  destination,
  setDestination,
  validateDestination,
  nextStep,
  navigation,
}) => {
  const [validDestination, setValidDestination] = React.useState<boolean | undefined>(
    undefined,
  )

  const handleChangeText = (newDestination) => {
    setValidDestination(undefined)
    setDestination(newDestination)
  }

  const handlePress = async () => {
    const valid = await validateDestination()
    if (valid) {
      return nextStep()
    }
    setValidDestination(valid)
  }

  const showError = Boolean(destination && validDestination === false)

  return (
    <>
      <Text style={Styles.fieldTitleText}>
        {translate("SendBitcoinScreen.destination")}
      </Text>
      <View style={Styles.fieldBackground}>
        <TextInput
          style={Styles.input}
          placeholder={translate("SendBitcoinScreen.input")}
          onChangeText={handleChangeText}
          value={destination}
          selectTextOnFocus
          autoCapitalize="none"
        />
        <TouchableWithoutFeedback onPress={() => navigation?.navigate("scanningQRCode")}>
          <View style={Styles.iconContainer}>
            <ScanIcon />
          </View>
        </TouchableWithoutFeedback>
      </View>

      <View style={Styles.descriptionContainer}></View>

      {showError && (
        <View style={Styles.errorContainer}>
          <Text style={Styles.errorText}>{translate("Invalid Payment Destination")}</Text>
        </View>
      )}

      <View style={Styles.buttonContainer}>
        <Button
          title={
            destination
              ? translate("common.next")
              : translate("SendBitcoinScreen.destinationIsRequired")
          }
          buttonStyle={{ ...Styles.button, ...Styles.activeButtonStyle }}
          titleStyle={Styles.activeButtonTitleStyle}
          disabledStyle={{ ...Styles.button, ...Styles.disabledButtonStyle }}
          disabledTitleStyle={Styles.disabledButtonTitleStyle}
          disabled={!destination || validDestination === false}
          onPress={handlePress}
        />
      </View>
    </>
  )
}

export default SendBitcoinDestination
