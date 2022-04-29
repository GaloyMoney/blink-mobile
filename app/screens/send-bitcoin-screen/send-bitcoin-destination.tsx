import React from "react"
import { palette } from "@app/theme"
import { StyleSheet, Text, TextInput, View } from "react-native"
import { translateUnknown as translate } from "@galoymoney/client"
import { Button } from "react-native-elements"
import { isDestinationLightningPayment, isDestinationNetworkValid } from "./validation"
import { INetwork } from "@app/types/network"
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
})

const validateDestination = (destination: string, network: INetwork) => {
  if (isDestinationLightningPayment(destination)) {
    if (isDestinationNetworkValid(destination, network)) {
      return true
    }
  }
  return false
}

const SendBitcoinDestination = ({
  destination,
  setDestination,
  nextStep,
  navigation,
}) => {
  return (
    <>
      <Text style={Styles.fieldTitleText}>
        {translate("SendBitcoinScreen.destination")}
      </Text>
      <View style={Styles.fieldBackground}>
        <TextInput
          style={Styles.input}
          placeholder={translate("SendBitcoinScreen.input")}
          onChangeText={setDestination}
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
