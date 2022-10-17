import * as React from "react"
import { Alert, DevSettings, Text, View } from "react-native"
import { Button, ButtonGroup } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { useApolloClient } from "@apollo/client"
import crashlytics from "@react-native-firebase/crashlytics"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { addDeviceToken } from "../../utils/notifications"
import useToken from "../../hooks/use-token"
import type { ScreenType } from "../../types/jsx"
import { usePriceConversion } from "../../hooks"
import useLogout from "../../hooks/use-logout"
import { GaloyInput } from "@app/components/galoy-input"
import { useAppConfig } from "@app/hooks/use-app-config"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { testProps } from "../../../utils/testProps"
import Clipboard from "@react-native-community/clipboard"
import { GaloyInstanceNames, GALOY_INSTANCES } from "@app/config/galoy-instances"

const styles = EStyleSheet.create({
  button: {
    marginVertical: "6rem",
  },
  screenContainer: {
    marginHorizontal: "12rem",
    marginBottom: "40rem",
  },
  container: {},
  textHeader: {
    fontSize: "18rem",
    marginVertical: "12rem",
  },
})

const usingHermes = typeof HermesInternal === "object" && HermesInternal !== null

export const DebugScreen: ScreenType = () => {
  const client = useApolloClient()
  const { usdPerSat } = usePriceConversion()
  const { token, hasToken, saveToken } = useToken()
  const { logout } = useLogout()
  const persistentState = usePersistentStateContext()
  const { appConfig, toggleUsdDisabled, setGaloyInstance } = useAppConfig()
  const [newToken, setNewToken] = React.useState(token)
  const currentGaloyInstance = appConfig.galoyInstance

  const [newGraphqlUri, setNewGraphqlUri] = React.useState(
    currentGaloyInstance.name === "Custom" ? currentGaloyInstance.graphqlUri : "",
  )
  const [newGraphqlWslUri, setNewGraphqlWslUri] = React.useState(
    currentGaloyInstance.name === "Custom" ? currentGaloyInstance.graphqlWsUri : "",
  )
  const galoyInstances: GaloyInstanceNames[] = [
    ...GALOY_INSTANCES.map((instance) => instance.name),
    "Custom",
  ]

  const [newGaloyInstance, setNewGaloyInstance] = React.useState(
    currentGaloyInstance.name,
  )

  const changesHaveBeenMade =
    newToken !== token ||
    newGaloyInstance !== currentGaloyInstance.name ||
    (currentGaloyInstance.name === "Custom" &&
      (newGraphqlUri !== currentGaloyInstance.graphqlUri ||
        newGraphqlWslUri !== currentGaloyInstance.graphqlWsUri))

  const handleSave = async () => {
    await logout(false)

    saveToken(newToken)

    if (newGaloyInstance === "Custom") {
      setGaloyInstance({
        name: "Custom",
        graphqlUri: newGraphqlUri,
        graphqlWsUri: newGraphqlWslUri,
      })
      return
    }

    setGaloyInstance(
      GALOY_INSTANCES.find((instance) => instance.name === newGaloyInstance),
    )
  }

  return (
    <Screen preset="scroll" backgroundColor={color.transparent}>
      <View style={styles.screenContainer}>
        <Button
          title="Log out"
          containerStyle={styles.button}
          onPress={async () => {
            await logout()
            Alert.alert("state succesfully deleted. Restart your app")
          }}
        />
        <Button
          title="Send notifications"
          containerStyle={styles.button}
          onPress={async () => {
            // TODO
            // mutateTestMessage()
          }}
        />
        <Button
          title="Copy store"
          containerStyle={styles.button}
          onPress={() => {
            // Clipboard.setString(JSON.stringify(store))
            // Alert.alert("Store copied in clipboard. send it over whatsapp or email")
          }}
        />
        <Button
          title={appConfig.isUsdDisabled ? "Enable USD" : "Disable USD"}
          containerStyle={styles.button}
          onPress={toggleUsdDisabled}
        />
        <Button
          title="Reset persistent state"
          containerStyle={styles.button}
          onPress={persistentState.resetState}
        />
        <Button
          title="Send device token"
          containerStyle={styles.button}
          onPress={async () => {
            if (hasToken && client) {
              addDeviceToken(client)
            }
          }}
        />
        {__DEV__ && (
          <>
            <Button
              title="Reload"
              containerStyle={styles.button}
              onPress={() => DevSettings.reload()}
            />
            <Button
              title="Crash test"
              containerStyle={styles.button}
              onPress={() => {
                crashlytics().log("Testing crash")
                crashlytics().crash()
              }}
            />
          </>
        )}
        <View>
          <Text style={styles.textHeader}>Environment Information</Text>
          <Text selectable>Galoy Instance: {appConfig.galoyInstance.name}</Text>
          <Text selectable>GQL_URL: {appConfig.galoyInstance.graphqlUri}</Text>
          <Text selectable>GQL_WS_URL: {appConfig.galoyInstance.graphqlWsUri}</Text>
          <Text selectable>
            USD per 1 sat: {usdPerSat ? `$${usdPerSat}` : "No price data"}
          </Text>
          <Text>Token Present: {String(Boolean(hasToken))}</Text>
          <Text>Hermes: {String(Boolean(usingHermes))}</Text>
          <Text style={styles.textHeader}>Update Environment</Text>
          <ButtonGroup
            {...testProps("Galoy Instance Button")}
            onPress={(index) => {
              const nextGaloyInstance = galoyInstances[index]
              if (nextGaloyInstance !== newGaloyInstance) {
                setNewToken(
                  nextGaloyInstance === appConfig.galoyInstance.name ? token : "",
                )
                setNewGaloyInstance(nextGaloyInstance)
              }
            }}
            selectedIndex={galoyInstances.findIndex(
              (value) => value === newGaloyInstance,
            )}
            buttons={galoyInstances}
            containerStyle={styles.container}
          />
          <GaloyInput
            {...testProps("Input access token")}
            label="Access Token"
            placeholder={"Access token"}
            value={newToken}
            secureTextEntry={true}
            onChangeText={setNewToken}
            selectTextOnFocus
          />
          <Button
            {...testProps("Copy access token")}
            title="Copy access token"
            containerStyle={styles.button}
            onPress={async () => {
              Clipboard.setString(newToken)
              Alert.alert("Token copied in clipboard.")
            }}
            disabled={!newToken}
          />
          {newGaloyInstance === "Custom" && (
            <>
              <GaloyInput
                label="Graphql Uri"
                placeholder={"Graphql Uri"}
                value={newGraphqlUri}
                onChangeText={setNewGraphqlUri}
                selectTextOnFocus
              />
              <GaloyInput
                label="Graphql Ws Uri"
                placeholder={"Graphql Ws Uri"}
                value={newGraphqlWslUri}
                onChangeText={setNewGraphqlWslUri}
                selectTextOnFocus
              />
            </>
          )}

          {changesHaveBeenMade && (
            <Button
              {...testProps("Save Changes")}
              title="Save changes"
              style={styles.button}
              onPress={handleSave}
            />
          )}
        </View>
      </View>
    </Screen>
  )
}
