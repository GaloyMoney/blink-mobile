import auth from "@react-native-firebase/auth"
import crashlytics from "@react-native-firebase/crashlytics"
import request from "graphql-request"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { Alert, Text, TextInput, TextStyle, View, ViewStyle } from "react-native"
import { Button } from "react-native-elements"
import { GRAPHQL_SERVER_URI } from "../../app"
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { color, spacing } from "../../theme"
import AsyncStorage from "@react-native-community/async-storage"
import { StoreContext } from "../../models"



const FULL: ViewStyle = { flex: 1 }
const CONTAINER: ViewStyle = {
  backgroundColor: color.background,
  paddingHorizontal: spacing[4],
}
const DEMO: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
  backgroundColor: "#5D2555",
}
const BOLD: TextStyle = { fontWeight: "bold" }
const DEMO_TEXT: TextStyle = {
  ...BOLD,
  fontSize: 13,
  letterSpacing: 2,
}
const TAGLINE: TextStyle = {
  color: "#BAB6C8",
  fontSize: 15,
  lineHeight: 22,
  marginBottom: spacing[4] + spacing[1],
}
const HINT: TextStyle = {
  color: "#BAB6C8",
  fontSize: 12,
  lineHeight: 15,
  marginVertical: spacing[2],
}

export const resetDataStore = () => {
  AsyncStorage.clear()
}

export const DebugScreen = observer(({ }) => {
  const store = React.useContext(StoreContext)

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

  return (
    <View style={FULL}>
      <Screen style={CONTAINER} preset="scroll" backgroundColor={color.transparent}>
        <Button
          style={DEMO}
          title="Delete account and log out"
          onPress={async () => {
            resetDataStore()
            if (auth().currentUser) {
              try {
                const query = `mutation deleteCurrentUser($uid: String) {
                  deleteCurrentUser(uid: $uid) 
                }`
          
                const result = await request(GRAPHQL_SERVER_URI, query, {uid: "1234"})
              } catch (err) {
                console.tron.log(`${err}`)
              }
            }
            await auth().signOut()
            Alert.alert("user succesfully deleted. Restart your app")
          }}
          />
        <Button
          style={DEMO}
          title="Delete dataStore state"
          onPress={async () => {
            resetDataStore()
            Alert.alert("state succesfully deleted. Restart your app")
          }}
        />
        <Button
          style={DEMO}
          title="Log out"
          onPress={async () => {
            await auth().signOut()
            Alert.alert("log out completed. Restart your app")
          }}
        />
        <VersionComponent />
        <View>
          <Text>UID: {auth().currentUser?.uid}</Text>
          <Text>phone: {auth().currentUser?.phoneNumber}</Text>
          <Text>BTC price: {store.rate("BTC")}</Text>
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            title="Crash test"
            onPress={() => {
              crashlytics().log("Testing crash")
              crashlytics().crash()
            }}
          />
        </View>
      </Screen>
    </View>
  )
})