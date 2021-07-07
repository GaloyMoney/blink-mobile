import crashlytics from "@react-native-firebase/crashlytics"
import * as React from "react"
import { Alert, DevSettings, Text, View } from "react-native"
import { Button, ButtonGroup } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Clipboard from "@react-native-community/clipboard"
import { useApolloClient, useQuery } from "@apollo/client"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { resetDataStore } from "../../utils/logout"
import { loadNetwork, saveNetwork } from "../../utils/network"
import { requestPermission } from "../../utils/notifications"
import { getGraphQlUri, Token } from "../../utils/token"
import { btc_price, QUERY_PRICE, walletIsActive } from "../../graphql/query"

const styles = EStyleSheet.create({
  button: {
    marginHorizontal: "24rem",
    marginVertical: "6rem",
  },

  container: { marginLeft: 36, marginRight: 36, marginTop: 24 },
})

export const DebugScreen = () => {
  const client = useApolloClient()
  const token = new Token()

  const networks = ["regtest", "testnet", "mainnet"]
  const [networkState, setNetworkState] = React.useState("")
  const [graphQlUri, setGraphQlUri] = React.useState("")

  const setNetwork = async (network?) => {
    let n

    if (token.network) {
      n = token.network
    } else if (!network) {
      n = await loadNetwork()
    } else {
      n = network
    }

    setGraphQlUri(await getGraphQlUri())
    setNetworkState(n)
  }

  React.useEffect(() => {
    ;(async () => {
      setNetwork()
    })()
  }, [])

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
              console.log(`${err}`)
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
          await resetDataStore(client)
          Alert.alert("state succesfully deleted. Restart your app")
        }}
      />
      <Button
        title="Send notifications"
        style={styles.button}
        onPress={async () => {
          // TODO
          // mutateTestMessage()
        }}
      />
      <Button
        title="Copy store"
        style={styles.button}
        onPress={() => {
          // Clipboard.setString(JSON.stringify(store))
          // Alert.alert("Store copied in clipboard. send it over whatsapp or email")
        }}
      />
      <Button
        title="Request permission + send device token"
        style={styles.button}
        onPress={async () => {
          walletIsActive(client) && requestPermission(client)
        }}
      />
      {__DEV__ && (
        <Button
          title="Reload"
          style={styles.button}
          onPress={() => DevSettings.reload()}
        />
      )}
      {/* <Button
          title="Crash test"
          style={styles.button}
          onPress={() => {
            crashlytics().log("Testing crash")
            crashlytics().crash()
          }}
        /> */}
      <View>
        <Text>
          UID:
          {token.uid}
        </Text>
        <Text>
          token network:
          {token.network}
        </Text>
        <Text>
          GraphQlUri:
          {graphQlUri}
        </Text>
        <Text>
          BTC price:
          {btc_price(client)}
        </Text>
        <Text>
          Hermes:
          {String(!!global.HermesInternal)}
        </Text>

        <ButtonGroup
          onPress={(index) => {
            saveNetwork(networks[index])
            setNetwork(networks[index])
          }}
          selectedIndex={networks.findIndex((value) => value === networkState)}
          buttons={networks}
          buttonStyle={styles.button} // FIXME
          containerStyle={styles.container}
        />
      </View>
    </Screen>
  )
}
