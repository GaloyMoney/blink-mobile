import * as React from "react"
import { Alert, DevSettings, Text, View } from "react-native"
import { Button, ButtonGroup } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { useApolloClient } from "@apollo/client"

import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { addDeviceToken, requestPermission } from "../../utils/notifications"
import useToken from "../../hooks/use-token"
import type { ScreenType } from "../../types/jsx"
import { usePriceConversion } from "../../hooks"
import useLogout from "../../hooks/use-logout"
import { GaloyInput } from "@app/components/galoy-input"
import { useAppConfig } from "@app/hooks/use-app-config"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { GALOY_INSTANCES } from "@app/config/galoy-instances"
import { useEffect } from "react"
import { testProps } from "../../../utils/testProps"
import Clipboard from "@react-native-community/clipboard"

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
  const { usdPerSat } = usePriceConversion()
  const { token, hasToken, saveToken } = useToken()
  const [tempToken, setTempToken] = React.useState(token)
  useEffect(() => {
    setTempToken(token)
  }, [token])
  const { logout } = useLogout()
  const persistentState = usePersistentStateContext()
  const { appConfig, toggleUsdDisabled, setGaloyInstance } = useAppConfig()

  return (
    <Screen preset="scroll" backgroundColor={color.transparent}>
      <Button
        title="Log out"
        style={styles.button}
        onPress={async () => {
          await logout()
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
        title={appConfig.isUsdDisabled ? "Enable USD" : "Disable USD"}
        style={styles.button}
        onPress={toggleUsdDisabled}
      />
      <Button
        title="Reset persistent state"
        style={styles.button}
        onPress={persistentState.resetState}
      />
      <Button
        title="Request permission + send device token"
        style={styles.button}
        onPress={async () => {
          if (hasToken) {
            requestPermission(client)
          }
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
        <Text>Token network: {appConfig.galoyInstance.network}</Text>
        <Text>GRAPHQL_URL: {appConfig.galoyInstance.graphqlUri}</Text>
        <Text>GRAPHQL_WS_URL: {appConfig.galoyInstance.graphqlWsUri}</Text>
        <Text>USD per 1 sat: {usdPerSat ? `$${usdPerSat}` : "No price data"}</Text>
        <Text>Hermes: {String(Boolean(usingHermes))}</Text>
        <ButtonGroup
          {...testProps("Galoy Instance Button")}
          onPress={(index) => {
            setGaloyInstance(GALOY_INSTANCES[index])
            logout()
          }}
          selectedIndex={GALOY_INSTANCES.findIndex(
            (value) => value.name === appConfig.galoyInstance.name,
          )}
          buttons={GALOY_INSTANCES.map((instance) => instance.name)}
          buttonStyle={styles.button} // FIXME
          containerStyle={styles.container}
        />
        <GaloyInput
          {...testProps("Input access token")}
          placeholder={"Input access token"}
          value={tempToken}
          onChangeText={setTempToken}
          selectTextOnFocus
          secureTextEntry={true}
        />
        <Button
          {...testProps("Change Token Button")}
          title="Change token"
          style={styles.button}
          onPress={async () => {
            await saveToken(tempToken)
            await addDeviceToken(client)
          }}
        />
        <Button
          {...testProps("Copy access token")}
          title="Copy access token"
          style={styles.button}
          onPress={async () => {
            Clipboard.setString(tempToken)
            Alert.alert("Token copied in clipboard.")
          }}
          disabled={!tempToken}
        />
      </View>
    </Screen>
  )
}
