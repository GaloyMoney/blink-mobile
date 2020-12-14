import crashlytics from "@react-native-firebase/crashlytics"
import { observer } from "mobx-react"
import * as React from "react"
import { Alert, DevSettings, Text, View } from "react-native"
import { Button, ButtonGroup } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { Screen } from "../../components/screen"
import { StoreContext } from "../../models"
import { color } from "../../theme"
import { resetDataStore } from "../../utils/logout"
import { loadNetwork, saveNetwork } from "../../utils/network"
import { requestPermission } from "../../utils/notifications"
import { getGraphQlUri, Token } from "../../utils/token"
import Clipboard from "@react-native-community/clipboard";

const styles = EStyleSheet.create({
  button: { 
    marginHorizontal: "24rem",
    marginVertical: "6rem"
  },
})

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
          await resetDataStore()
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
        title="Copy store"
        style={styles.button}
        onPress={() => {
          Clipboard.setString(JSON.stringify(store))
          Alert.alert("Store copied in clipboard. send it over whatsapp or email")
        }}
      />
      {
        store.walletIsActive && <Button
          title="Request permission + send device token"
          style={styles.button}
          onPress={async () => {
            requestPermission(store)
          }}
        />
      }
      {__DEV__ && <Button title="Reload" 
        style={styles.button}
        onPress={() => DevSettings.reload()} />
      }
      {/* <Button
          title="Crash test"
          style={styles.button}
          onPress={() => {
            crashlytics().log("Testing crash")
            crashlytics().crash()
          }}
        /> */}
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
