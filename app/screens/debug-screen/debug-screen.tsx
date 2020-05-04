import auth from "@react-native-firebase/auth"
import crashlytics from "@react-native-firebase/crashlytics"
import functions from "@react-native-firebase/functions"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { Alert, Clipboard, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from "react-native"
import { Button } from "react-native-elements"
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { color, spacing } from "../../theme"
import { palette } from "../../theme/palette"
import { resetDataStore } from "../../models/root-store"



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

const styles = StyleSheet.create({
  separator: {
    borderColor: palette.angry,
    borderWidth: 1,
  },
})

const ChannelLiquidityView = ({ chanId, remoteBalance, localBalance }) => {
  const balanceInbound = localBalance / (localBalance + remoteBalance)
  const balanceWidth = `${balanceInbound * 100}%`

  return (
    <View style={styles.separator}>
      <Text>chanId: {chanId}</Text>
      <Text>localBalance: {localBalance}</Text>
      <Text>remoteBalance: {remoteBalance}</Text>
      <View style={{ backgroundColor: palette.darkGrey }}>
        <View style={{ width: balanceWidth, height: 10, backgroundColor: palette.white }} />
      </View>
    </View>
  )
}

export const DebugScreen = inject("dataStore")(
  observer(({ dataStore }) => {
    const [addr, setAddr] = useState("tb1")
    const [amount, setAmount] = useState(1000)
    const [invoice, setInvoice] = useState("ln")

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
                  await functions().httpsCallable("deleteCurrentUser")({})
                } catch (err) {
                  console.tron.error(err)
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
            <Text>BTC price: {dataStore.rates.BTC}</Text>
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              title="Print $1,000"
              onPress={() => functions().httpsCallable("dollarFaucet")({ amount: 1000 })}
            />
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              title="test functions"
              onPress={() => functions().httpsCallable("test")({})}
            />
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              title="add invoice"
              onPress={() => Clipboard.setString(dataStore.lnd.addInvoice({ value: 1000 }))}
            />
            <TextInput
              style={HINT}
              editable
              onChangeText={(invoice) => setInvoice(invoice)}
              value={invoice}
            />
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              title="Quote Buy BTC"
              onPress={() => dataStore.exchange.quoteBTC("buy")}
            />
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              title="Quote Sell BTC"
              onPress={() => dataStore.exchange.quoteBTC("sell")}
            />
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              title="Buy BTC"
              onPress={dataStore.exchange.buyBTC}
            />
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              title="Sell BTC"
              onPress={dataStore.exchange.sellBTC}
            />
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
  }),
)
