import AsyncStorage from "@react-native-community/async-storage"
import crashlytics from "@react-native-firebase/crashlytics"
import { observer } from "mobx-react"
import * as React from "react"
import { Alert, Text, View } from "react-native"
import { Button, ButtonGroup } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { StoreContext } from "../../models"
import { color } from "../../theme"
import { Token, getGraphQlUri } from "../../utils/token"
import { ROOT_STATE_STORAGE_KEY } from "../../models/RootStore"
import { loadNetwork, saveNetwork, NETWORK_STRING } from "../../utils/network"
import { requestPermission } from "../../utils/notifications"

const styles = EStyleSheet.create({
  button: { 
    marginHorizontal: "24rem",
    marginVertical: "6rem"
  },
})

export const resetDataStore = async () => {
  try {
    await AsyncStorage.multiRemove([ROOT_STATE_STORAGE_KEY, NETWORK_STRING]) // use storage.ts wrapper
    const token = new Token()
    await token.delete()
    // TOKEN_KEY is stored at a separate location
  } catch(e) {
    console.tron.log(`error resetting RootStore: ${e}`)
  }
}

export const DebugScreen = observer(({}) => {
  const store = React.useContext(StoreContext)
  const token = new Token()

  const networks = ["regtest", "testnet", "mainnet"]
  const [changed, setChanged] = React.useState(false)
  const [network, setNetwork] = React.useState("")
  const [graphQlUri, setGraphQlUri] = React.useState("")

  React.useEffect(() => {
    (async () => {
      setNetwork(await loadNetwork())
    })()
  }, [])

  React.useEffect(() => {
    (async () => {
      setGraphQlUri(await getGraphQlUri())
    })()
  }, [network])

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
      {/* <Button
        title="Delete account and log out (TODO)"
        onPress={async () => {
          resetDataStore()
          if (token.has()) {
            try { // FIXME
              const query = `mutation deleteCurrentUser {
                deleteCurrentUser
              }`
        
              // const result = await request(getGraphQlUri(), query, {uid: "1234"})
              // FIXME
            } catch (err) {
              console.tron.log(`${err}`)
            }
          }
          await token.delete()
          Alert.alert("user succesfully deleted. Restart your app")
        }}
        /> */}
      <Button
        title="Log out"
        style={styles.button}
        onPress={async () => {
          resetDataStore()
          Alert.alert("state succesfully deleted. Restart your app")
        }}
      />
      <Button
        title="Send notifications"
        style={styles.button}
        onPress={async () => {
          store.mutateTestMessage()
        }}
      />
      <Button
        title="Request permission + send device token"
        style={styles.button}
        onPress={async () => {
          requestPermission(store)
        }}
      />
      <Button
          title="Crash test"
          style={styles.button}
          onPress={() => {
            crashlytics().log("Testing crash")
            crashlytics().crash()
          }}
        />
      <VersionComponent />
      <View>
        <Text>UID: {token.uid}</Text>
        <Text>token network: {token.network}</Text>
        <Text>GraphQlUri: {graphQlUri}</Text>
        <Text>BTC price: {store.rate("BTC")}</Text>

        <ButtonGroup
          onPress={index => {
              saveNetwork(networks[index]);
              setNetwork(networks[index]);
              setChanged(true)
            }}
          selectedIndex={networks.findIndex(value => value === network)}
          buttons={networks}
          buttonStyle={styles.button} // FIXME
          containerStyle={{marginLeft: 36, marginRight: 36, marginTop: 24}}
          />
        {changed && <Text>Restart the app to make the network change effective</Text>}
      </View>
    </Screen>
  )
})
