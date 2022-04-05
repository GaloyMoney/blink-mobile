import React from "react"
import { palette } from "@app/theme"
import { StyleSheet, TextInput, View } from "react-native"
import { translate } from "@app/i18n"
import { Button } from "react-native-elements"
import { isDestinationLightningPayment, isDestinationNetworkValid } from "./validation"
import { INetwork } from "@app/types/network"

const Styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
  },
  descriptionContainer: {
    flex: 4,
  },
  buttonContainer: {
    flex: 1,
  },
  input: {
    borderStyle: "solid",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.white,
    backgroundColor: palette.white,
    borderRadius: 10,
    padding: 10,
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
})

const validateDestination = (destination: string, network: INetwork) => {
  if (isDestinationLightningPayment(destination)) {
    if (isDestinationNetworkValid(destination, network)) {
      return true
    }
  }
  return false
}

const SendBitcoinDestination = ({ destination, setDestination, nextStep }) => {
  return (
    <>
      <View style={Styles.inputContainer}>
        <TextInput
          style={Styles.input}
          placeholder={translate("SendBitcoinScreen.input")}
          onChangeText={setDestination}
          value={destination}
          selectTextOnFocus
          autoCapitalize="none"
        />
      </View>
      <View style={Styles.descriptionContainer}></View>
      <View style={Styles.buttonContainer}>
        <Button
          title={
            !destination
              ? translate("SendBitcoinScreen.DestinationIsRequired")
              : translate("common.next")
          }
          buttonStyle={{ ...Styles.button, ...Styles.activeButtonStyle }}
          titleStyle={Styles.activeButtonTitleStyle}
          disabledStyle={{ ...Styles.button, ...Styles.disabledButtonStyle }}
          disabledTitleStyle={Styles.disabledButtonTitleStyle}
          disabled={!destination}
          onPress={() => nextStep()}
        />
      </View>
    </>
  )
}

export default SendBitcoinDestination
