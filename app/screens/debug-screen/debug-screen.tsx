import AsyncStorage from "@react-native-community/async-storage"
import crashlytics from "@react-native-firebase/crashlytics"
import request from "graphql-request"
import { observer } from "mobx-react"
import * as React from "react"
import { Alert, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { GRAPHQL_SERVER_URI } from "../../app"
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { StoreContext } from "../../models"
import { color } from "../../theme"
import { Token } from "../../utils/token"

const styles = EStyleSheet.create({
  button: { 
    marginHorizontal: "24rem",
    marginVertical: "6rem"
  },
})

export const resetDataStore = () => {
  AsyncStorage.clear() // use storage.ts wrapper
}

export const DebugScreen = observer(({}) => {
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
    <Screen preset="scroll" backgroundColor={color.transparent}>
      <Button
        title="Delete account and log out"
        onPress={async () => {
          resetDataStore()
          if (new Token().has()) {
            try { // FIXME
              const query = `mutation deleteCurrentUser($uid: String) {
                deleteCurrentUser(uid: $uid) 
              }`
        
              const result = await request(GRAPHQL_SERVER_URI, query, {uid: "1234"})
            } catch (err) {
              console.tron.log(`${err}`)
            }
          }
          await new Token().delete()
          Alert.alert("user succesfully deleted. Restart your app")
        }}
        />
      <Button
        title="Delete dataStore state"
        onPress={async () => {
          resetDataStore()
          Alert.alert("state succesfully deleted. Restart your app")
        }}
      />
      <Button
        title="Log out"
        onPress={async () => {
          await new Token().delete()
          Alert.alert("log out completed. Restart your app")
        }}
      />
      <VersionComponent />
      <View>
        <Text>UID: {new Token().uid()}</Text>
        {/* <Text>phone: {auth().currentUser?.phoneNumber}</Text> */}
        <Text>BTC price: {store.rate("BTC")}</Text>
        <Button
          title="Crash test"
          onPress={() => {
            crashlytics().log("Testing crash")
            crashlytics().crash()
          }}
        />
      </View>
    </Screen>
  )
})
