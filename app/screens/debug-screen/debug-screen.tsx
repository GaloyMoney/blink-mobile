import * as React from "react"
import { useCallback, useMemo } from "react"
import { Alert, DevSettings, Text, View } from "react-native"
import { Button, ButtonGroup } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { useApolloClient } from "@apollo/client"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { resetDataStore } from "../../utils/logout"
import { loadNetwork, saveNetwork } from "../../utils/network"
import { requestPermission } from "../../utils/notifications"
import { getGraphQLUri, Token } from "../../utils/token"
import { walletIsActive } from "../../graphql/query"

import type { ScreenType } from "../../types/jsx"
import type { INetwork } from "../../types/network"
import { useBTCPrice } from "../../hooks"

const styles = EStyleSheet.create({
  button: {
    marginHorizontal: "24rem",
    marginVertical: "6rem",
  },

  container: { marginLeft: 36, marginRight: 36, marginTop: 24 },
})

const usingHermes = typeof HermesInternal === "object" && HermesInternal !== null

export const DebugScreen: ScreenType = () => {
  const client = useApolloClient()
  const btcPrice = useBTCPrice()
  const token = useMemo(() => {
    return Token.getInstance()
  }, [])

  const networks: INetwork[] = ["regtest", "testnet", "mainnet"]
  const [networkState, setNetworkState] = React.useState("")
  const [graphQLUri, setGraphQLUri] = React.useState("")

  const setNetwork = useCallback(
    async (network?) => {
      let n

      if (token.network) {
        n = token.network
      } else if (!network) {
        n = await loadNetwork()
      } else {
        n = network
      }

      setGraphQLUri(await getGraphQLUri())
      setNetworkState(n)
    },
    [token],
  )

  React.useEffect(() => {
    ;(async () => {
      setNetwork()
    })()
  }, [setNetwork])

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

              // const result = await request(getGraphQLUri(), query, {uid: "1234"})
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
          GraphQLUri:
          {graphQLUri}
        </Text>
        <Text>
          BTC price:
          {btcPrice}
        </Text>
        <Text>
          Hermes:
          {String(!!usingHermes)}
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
