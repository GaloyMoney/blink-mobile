import * as React from "react"
import { Alert, DevSettings, Text, View } from "react-native"
import { Button } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import { gql, useApolloClient } from "@apollo/client"
import crashlytics from "@react-native-firebase/crashlytics"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { addDeviceToken } from "../../utils/notifications"
import useToken from "../../hooks/use-token"
import { usePriceConversion } from "../../hooks"
import useLogout from "../../hooks/use-logout"
import { GaloyInput } from "@app/components/atomic/galoy-input"
import { useAppConfig } from "@app/hooks/use-app-config"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { testProps } from "../../utils/testProps"
import Clipboard from "@react-native-clipboard/clipboard"
import { possibleGaloyInstanceNames, GALOY_INSTANCES } from "@app/config"
import CurrencyPicker from "react-native-currency-picker"
import { toastShow } from "@app/utils/toast"
import { i18nObject } from "@app/i18n/i18n-util"
import {
  useAccountUpdateDisplayCurrencyMutation,
  useDisplayCurrencyQuery,
} from "@app/graphql/generated"
import theme from "@app/rne-theme/theme"

const styles = EStyleSheet.create({
  button: {
    marginVertical: "6rem",
  },
  screenContainer: {
    marginHorizontal: "12rem",
    marginBottom: "40rem",
  },
  textHeader: {
    fontSize: "18rem",
    marginVertical: "12rem",
  },
  selectedInstanceButton: {
    backgroundColor: theme.lightColors?.primary,
    color: theme.lightColors?.white,
  },
  notSelectedInstanceButton: {
    backgroundColor: theme.lightColors?.background,
    color: theme.lightColors?.grey8,
  },
})

const usingHermes = typeof HermesInternal === "object" && HermesInternal !== null

gql`
  mutation accountUpdateDisplayCurrency($input: AccountUpdateDisplayCurrencyInput!) {
    accountUpdateDisplayCurrency(input: $input) {
      errors {
        message
      }
      account {
        id
        displayCurrency
      }
    }
  }
`

export const DebugScreen: React.FC = () => {
  const { data } = useDisplayCurrencyQuery()
  const displayCurrency = data?.me?.defaultAccount?.displayCurrency || "USD"

  const client = useApolloClient()
  const { usdPerSat } = usePriceConversion()
  const { token, saveToken } = useToken()
  const { logout } = useLogout()
  const [setDisplayCurrency] = useAccountUpdateDisplayCurrencyMutation()
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
  const [newPosUrl, setNewPosUrl] = React.useState(
    currentGaloyInstance.name === "Custom" ? currentGaloyInstance.posUrl : "",
  )
  const [newLnAddressHostname, setNewLnAddressHostname] = React.useState(
    currentGaloyInstance.name === "Custom" ? currentGaloyInstance.lnAddressHostname : "",
  )

  const [newGaloyInstance, setNewGaloyInstance] = React.useState(
    currentGaloyInstance.name,
  )

  const changesHaveBeenMade =
    newToken !== token ||
    (newGaloyInstance !== currentGaloyInstance.name && newGaloyInstance !== "Custom") ||
    (newGaloyInstance === "Custom" &&
      Boolean(newGraphqlUri) &&
      Boolean(newGraphqlWslUri) &&
      (newGraphqlUri !== currentGaloyInstance.graphqlUri ||
        newGraphqlWslUri !== currentGaloyInstance.graphqlWsUri ||
        newPosUrl !== currentGaloyInstance.posUrl ||
        newLnAddressHostname !== currentGaloyInstance.lnAddressHostname))

  React.useEffect(() => {
    if (newGaloyInstance === currentGaloyInstance.name) {
      setNewToken(token)
    } else {
      setNewToken("")
    }
  }, [newGaloyInstance, currentGaloyInstance, token])

  const handleSave = () => {
    logout(false)

    saveToken(newToken || "")

    if (newGaloyInstance === "Custom") {
      setGaloyInstance({
        name: "Custom",
        graphqlUri: newGraphqlUri,
        graphqlWsUri: newGraphqlWslUri,
        posUrl: newPosUrl,
        lnAddressHostname: newLnAddressHostname,
      })
      return
    }

    const newGaloyInstanceObject = GALOY_INSTANCES.find(
      (instance) => instance.name === newGaloyInstance,
    )

    newGaloyInstanceObject && setGaloyInstance(newGaloyInstanceObject)
  }

  return (
    <Screen preset="scroll" backgroundColor={color.transparent}>
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
            if (token && client) {
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
            <Button
              title="Error toast with translation"
              containerStyle={styles.button}
              {...testProps("Error Toast")}
              onPress={() => {
                toastShow({
                  message: (translations) => translations.errors.generic(),
                  currentTranslation: i18nObject("es"),
                })
              }}
            />
          </>
        )}
        <CurrencyPicker
          enable={true}
          darkMode={false}
          currencyCode={displayCurrency}
          showFlag={true}
          showCurrencyName={false}
          showCurrencyCode={true}
          onSelectCurrency={(data: { code: string }) => {
            setDisplayCurrency({ variables: { input: { currency: data.code } } })
          }}
          showNativeSymbol={false}
          // eslint-disable-next-line react-native/no-inline-styles
          containerStyle={{
            container: {
              borderWidth: 1,
              borderRadius: 5,
              justifyContent: "center",
              height: 50,
              marginTop: 5,
            },
            flagWidth: 25,
            currencyCodeStyle: {},
            currencyNameStyle: {},
            symbolStyle: {},
            symbolNativeStyle: {},
          }}
          modalStyle={{
            container: {},
            searchStyle: {},
            tileStyle: {},
            itemStyle: {
              itemContainer: {},
              flagWidth: 25,
              currencyCodeStyle: {},
              currencyNameStyle: {},
              symbolStyle: {},
              symbolNativeStyle: {},
            },
          }}
          title={"Currency"}
          searchPlaceholder={"Search"}
          showCloseButton={true}
          showModalTitle={true}
        />
        <View>
          <Text style={styles.textHeader}>Environment Information</Text>
          <Text selectable>Galoy Instance: {appConfig.galoyInstance.name}</Text>
          <Text selectable>GQL_URL: {appConfig.galoyInstance.graphqlUri}</Text>
          <Text selectable>GQL_WS_URL: {appConfig.galoyInstance.graphqlWsUri}</Text>
          <Text selectable>POS URL: {appConfig.galoyInstance.posUrl}</Text>
          <Text selectable>
            LN Address Hostname: {appConfig.galoyInstance.lnAddressHostname}
          </Text>
          <Text selectable>
            USD per 1 sat: {usdPerSat ? `$${usdPerSat}` : "No price data"}
          </Text>
          <Text {...testProps("Token Present")}>
            Token Present: {String(Boolean(token))}
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
