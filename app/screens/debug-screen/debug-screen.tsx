import auth from "@react-native-firebase/auth"
import crashlytics from "@react-native-firebase/crashlytics"
import functions from "@react-native-firebase/functions"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { Alert, Clipboard, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from "react-native"
import { Button, ButtonGroup } from "react-native-elements"
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { color, spacing } from "../../theme"
import { palette } from "../../theme/palette"
import EStyleSheet from "react-native-extended-stylesheet"

const styles = EStyleSheet.create({
  button: { 
    marginHorizontal: "24rem",
    marginVertical: "6rem"
  },

  text: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "left",
  },

  buttonGroup: {

  }
})

export const DebugScreen = inject("dataStore")(
  observer(({ dataStore }) => {

    const demoReactotron = async () => {
      console.tron.logImportant("I am important")
      console.tron.display({
        name: "DISPLAY",
        value: {
          numbers: 1,
          strings: "strings",
          booleans: true,
          arrays: [1, 2, 3],
          objects: {
            deeper: {
              deeper: {
                yay: "👾",
              },
            },
          },
          functionNames: function hello() {},
        },
        preview: "More control with display()",
        important: true,
        image: {
          uri:
            "https://avatars2.githubusercontent.com/u/3902527?s=200&u=a0d16b13ed719f35d95ca0f4440f5d07c32c349a&v=4",
        },
      })
    }

    const network = ["testnet", "mainnet"]

    return (
        <Screen preset="scroll" backgroundColor={color.transparent}>
          <Text style={styles.text}>UID: {"\t"}{"\t"}{auth().currentUser?.uid}</Text>
          <Text style={styles.text}>phone: {"\t"}{auth().currentUser?.phoneNumber}</Text>
          <Text style={styles.text}>BTC price: {dataStore.rates.rate("BTC")}</Text>
          <VersionComponent />
          <ButtonGroup
            onPress={index => dataStore.mode.update(network[index])}
            selectedIndex={network.findIndex(mode => mode == dataStore.mode.bitcoin)}
            buttons={network}
            // buttonStyle={styles.button}
            containerStyle={{marginLeft: 24, marginRight: 24}}
          />
          <Button 
            buttonStyle={styles.button}
            title="update Price"
            onPress={() => dataStore.rates.update()}
          />
          <Button 
            buttonStyle={styles.button}
            title="Delete dataStore state"
            onPress={async () => {
              dataStore.reset()
              Alert.alert("state succesfully deleted. Restart your app")
            }}
          />
          <Button 
            buttonStyle={styles.button}
            title="Log out"
            onPress={async () => {
              await auth().signOut()
              Alert.alert("log out completed. Restart your app")
            }}
          />
            <Button 
            buttonStyle={[styles.button, {backgroundColor: "red"}]}
            title="Delete account"
            onPress={async () => {
              dataStore.reset()
              if (auth().currentUser) {
                try {
                  await functions().httpsCallable("deleteCurrentUser")({})
                } catch (err) {
                  console.tron.error(err)
                }
              }
              await auth().signOut()
              Alert.alert("user succesfully deleted. Restart your app")
            }}
            />
          {/* <Button 
            buttonStyle={styles.button}
            title="Print $1,000"
            onPress={() => functions().httpsCallable("dollarFaucet")({ amount: 1000 })}
          /> */}

          {/* <Button 
            buttonStyle={styles.button}
            title="test functions"
            onPress={() => functions().httpsCallable("test")({})}
          /> */}
          {/* <Button 
            buttonStyle={styles.button}
            title="Crash test"
            onPress={() => {
              crashlytics().log("Testing crash")
              crashlytics().crash()
            }}
          /> */}
        </Screen>
    )
  }),
)
