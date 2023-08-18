import { gql, useApolloClient } from "@apollo/client"
import { GaloyInput } from "@app/components/atomic/galoy-input"
import { GALOY_INSTANCES, possibleGaloyInstanceNames } from "@app/config"
import { activateBeta } from "@app/graphql/client-only-query"
import { useBetaQuery, useDebugScreenQuery, useLevelQuery } from "@app/graphql/generated"
import { useAppConfig } from "@app/hooks/use-app-config"
import Clipboard from "@react-native-clipboard/clipboard"
import crashlytics from "@react-native-firebase/crashlytics"
import { Button, Text, makeStyles } from "@rneui/themed"
import * as React from "react"
import { Alert, DevSettings, Linking, View } from "react-native"
import { Screen } from "../../components/screen"
import { usePriceConversion } from "../../hooks"
import useLogout from "../../hooks/use-logout"
import { addDeviceToken } from "../../utils/notifications"
import { testProps } from "../../utils/testProps"
import { InAppBrowser } from "react-native-inappbrowser-reborn"

gql`
  query debugScreen {
    me {
      id
      defaultAccount {
        id
      }
    }
  }
`

const usingHermes = typeof HermesInternal === "object" && HermesInternal !== null

export const DeveloperScreen: React.FC = () => {
  const styles = useStyles()
  const client = useApolloClient()
  const { usdPerSat } = usePriceConversion()
  const { logout } = useLogout()

  const { appConfig, saveToken, saveTokenAndInstance } = useAppConfig()
  const token = appConfig.token

  const { data: dataLevel } = useLevelQuery({ fetchPolicy: "cache-only" })
  const level = String(dataLevel?.me?.defaultAccount?.level)

  const [url, setUrl] = React.useState("http://localhost:3001")

  const { data: dataDebug } = useDebugScreenQuery()
  const accountId = dataDebug?.me?.defaultAccount?.id

  const [newToken, setNewToken] = React.useState(token)
  const currentGaloyInstance = appConfig.galoyInstance

  const [newGraphqlUri, setNewGraphqlUri] = React.useState(
    currentGaloyInstance.id === "Custom" ? currentGaloyInstance.graphqlUri : "",
  )
  const [newGraphqlWslUri, setNewGraphqlWslUri] = React.useState(
    currentGaloyInstance.id === "Custom" ? currentGaloyInstance.graphqlWsUri : "",
  )
  const [newPosUrl, setNewPosUrl] = React.useState(
    currentGaloyInstance.id === "Custom" ? currentGaloyInstance.posUrl : "",
  )

  const [newRestUrl, setNewRestUrl] = React.useState(
    currentGaloyInstance.id === "Custom" ? currentGaloyInstance.authUrl : "",
  )

  const [newLnAddressHostname, setNewLnAddressHostname] = React.useState(
    currentGaloyInstance.id === "Custom" ? currentGaloyInstance.lnAddressHostname : "",
  )

  const [newGaloyInstance, setNewGaloyInstance] = React.useState(currentGaloyInstance.id)

  const dataBeta = useBetaQuery()
  const beta = dataBeta.data?.beta ?? false

  const changesHaveBeenMade =
    newToken !== token ||
    (newGaloyInstance !== currentGaloyInstance.id && newGaloyInstance !== "Custom") ||
    (newGaloyInstance === "Custom" &&
      Boolean(newGraphqlUri) &&
      Boolean(newGraphqlWslUri) &&
      Boolean(newPosUrl) &&
      Boolean(newRestUrl) &&
      (newGraphqlUri !== currentGaloyInstance.graphqlUri ||
        newGraphqlWslUri !== currentGaloyInstance.graphqlWsUri ||
        newPosUrl !== currentGaloyInstance.posUrl ||
        newRestUrl !== currentGaloyInstance.authUrl ||
        newLnAddressHostname !== currentGaloyInstance.lnAddressHostname))

  React.useEffect(() => {
    if (newGaloyInstance === currentGaloyInstance.id) {
      setNewToken(token)
    } else {
      setNewToken("")
    }
  }, [newGaloyInstance, currentGaloyInstance, token])

  const openInAppBrowser = async () => {
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: "cancel",
          preferredBarTintColor: "#453AA4",
          preferredControlTintColor: "white",
          readerMode: false,
          animated: true,
          modalPresentationStyle: "fullScreen",
          modalTransitionStyle: "coverVertical",
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: true,
          toolbarColor: "#6200EE",
          secondaryToolbarColor: "black",
          navigationBarColor: "black",
          navigationBarDividerColor: "white",
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: "slide_in_right",
            startExit: "slide_out_left",
            endEnter: "slide_in_left",
            endExit: "slide_out_right",
          },
          headers: {
            "my-custom-header": "my custom header value",
          },
          hasBackButton: true,
        })
        // await this.sleep(800)
        Alert.alert(JSON.stringify(result))
      } else Linking.openURL(url)
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    }
  }

  const handleSave = async () => {
    await logout(false)

    if (newGaloyInstance === "Custom") {
      saveTokenAndInstance({
        instance: {
          id: "Custom",
          graphqlUri: newGraphqlUri,
          graphqlWsUri: newGraphqlWslUri,
          authUrl: newRestUrl,
          posUrl: newPosUrl,
          lnAddressHostname: newLnAddressHostname,
          name: "Custom", // TODO: make configurable
          blockExplorer: "https://mempool.space/tx/", // TODO make configurable
        },
        token: newToken || "",
      })
    }

    const newGaloyInstanceObject = GALOY_INSTANCES.find(
      (instance) => instance.id === newGaloyInstance,
    )

    if (newGaloyInstanceObject) {
      saveTokenAndInstance({ instance: newGaloyInstanceObject, token: newToken || "" })
      return
    }

    saveToken(newToken || "")
  }

  return (
    <Screen preset="scroll">
      <View style={styles.screenContainer}>
        <Button
          title="Log out"
          containerStyle={styles.button}
          onPress={async () => {
            await logout()
            Alert.alert("state successfully deleted. Restart your app")
          }}
          {...testProps("logout button")}
        />
        <Button
          title="Send device token"
          containerStyle={styles.button}
          onPress={async () => {
            if (token && client) {
              addDeviceToken(client)
            }
          }}
        />
        <Button
          title={`Beta features: ${beta}`}
          containerStyle={styles.button}
          onPress={async () => activateBeta(client, !beta)}
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
        <GaloyInput
          {...testProps("Url in app browser")}
          label="Url in app browser"
          value={url}
          onChangeText={setUrl}
          selectTextOnFocus
        />
        <Button
          title="Open in app browser"
          containerStyle={styles.button}
          {...testProps("Open in app browser")}
          onPress={openInAppBrowser}
        />
        <View>
          <Text style={styles.textHeader}>Account info</Text>
          <Text>AccountId: </Text>
          <Text selectable>{accountId}</Text>
          <Text>Level: {level}</Text>
          <Text>Token Present: {String(Boolean(token))}</Text>
          <Text style={styles.textHeader}>Environment Information</Text>
          <Text selectable>Galoy Instance: {appConfig.galoyInstance.id}</Text>
          <Text selectable>GQL_URL: {appConfig.galoyInstance.graphqlUri}</Text>
          <Text selectable>GQL_WS_URL: {appConfig.galoyInstance.graphqlWsUri}</Text>
          <Text selectable>POS URL: {appConfig.galoyInstance.posUrl}</Text>
          <Text selectable>
            LN Address Hostname: {appConfig.galoyInstance.lnAddressHostname}
          </Text>
          <Text selectable>
            USD per 1 sat: {usdPerSat ? `$${usdPerSat}` : "No price data"}
          </Text>
          <Text>Hermes: {String(Boolean(usingHermes))}</Text>
          <Button
            {...testProps("Save Changes")}
            title="Save changes"
            style={styles.button}
            onPress={handleSave}
            disabled={!changesHaveBeenMade}
          />
          <Text style={styles.textHeader}>Update Environment</Text>
          {possibleGaloyInstanceNames.map((instanceName) => (
            <Button
              key={instanceName}
              title={instanceName}
              onPress={() => {
                setNewGaloyInstance(instanceName)
              }}
              {...testProps(`${instanceName} button`)}
              buttonStyle={
                instanceName === newGaloyInstance
                  ? styles.selectedInstanceButton
                  : styles.notSelectedInstanceButton
              }
              titleStyle={
                instanceName === newGaloyInstance
                  ? styles.selectedInstanceButton
                  : styles.notSelectedInstanceButton
              }
              containerStyle={
                instanceName === newGaloyInstance
                  ? styles.selectedInstanceButton
                  : styles.notSelectedInstanceButton
              }
              {...testProps(`${instanceName} Button`)}
            />
          ))}
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
              Clipboard.setString(newToken || "")
              Alert.alert("Token copied in clipboard.")
            }}
            disabled={!newToken}
          />
          {newGaloyInstance === "Custom" && (
            <>
              <GaloyInput
                label="Graphql Uri"
                placeholder={"Graphql Uri"}
                autoCapitalize="none"
                autoCorrect={false}
                value={newGraphqlUri}
                onChangeText={setNewGraphqlUri}
                selectTextOnFocus
              />
              <GaloyInput
                label="Graphql Ws Uri"
                placeholder={"Graphql Ws Uri"}
                autoCapitalize="none"
                autoCorrect={false}
                value={newGraphqlWslUri}
                onChangeText={setNewGraphqlWslUri}
                selectTextOnFocus
              />
              <GaloyInput
                label="POS Url"
                placeholder={"POS Url"}
                autoCapitalize="none"
                autoCorrect={false}
                value={newPosUrl}
                onChangeText={setNewPosUrl}
                selectTextOnFocus
              />
              <GaloyInput
                label="Rest Url"
                placeholder={"Rest Url"}
                autoCapitalize="none"
                autoCorrect={false}
                value={newRestUrl}
                onChangeText={setNewRestUrl}
                selectTextOnFocus
              />
              <GaloyInput
                label="LN Address Hostname"
                placeholder={"LN Address Hostname"}
                autoCapitalize="none"
                autoCorrect={false}
                value={newLnAddressHostname}
                onChangeText={setNewLnAddressHostname}
                selectTextOnFocus
              />
            </>
          )}
        </View>
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  button: {
    marginVertical: 6,
  },
  screenContainer: {
    marginHorizontal: 12,
    marginBottom: 40,
  },
  textHeader: {
    fontSize: 18,
    marginVertical: 12,
  },
  selectedInstanceButton: {
    backgroundColor: colors.grey5,
    color: colors.white,
  },
  notSelectedInstanceButton: {
    backgroundColor: colors.white,
    color: colors.grey3,
  },
}))
