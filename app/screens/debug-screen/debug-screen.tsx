import * as React from "react"
import { useState } from "react"
import { ImageStyle, TextStyle, View, ViewStyle, TextInput, Clipboard, StyleSheet, Alert } from "react-native"
import { Screen } from "../../components/screen"
import { Text } from "../../components/text"
import { Button } from "../../components/button"
import { Wallpaper } from "../../components/wallpaper"
import { Header } from "../../components/header"
import { QRCode } from "../../components/qrcode"
import { color, spacing } from "../../theme"
import { observer, inject } from "mobx-react"

import crashlytics from '@react-native-firebase/crashlytics'

import auth from "@react-native-firebase/auth"
import { getSnapshot } from "mobx-state-tree"
import JSONTree from 'react-native-json-tree'
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import functions from "@react-native-firebase/functions"
import { VersionComponent } from "../../components/version"
import FileAction from "../../services/lnd/file"
import RNFS from 'react-native-fs'



const FULL: ViewStyle = { flex: 1 }
const CONTAINER: ViewStyle = {
  backgroundColor: color.transparent,
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
const HEADER: TextStyle = {
  paddingTop: spacing[3],
  paddingBottom: spacing[5] - 1,
  paddingHorizontal: 0,
}
const HEADER_TITLE: TextStyle = {
  ...BOLD,
  fontSize: 12,
  lineHeight: 15,
  textAlign: "center",
  letterSpacing: 1.5,
}
const TITLE: TextStyle = {
  ...BOLD,
  fontSize: 28,
  lineHeight: 38,
  textAlign: "center",
  marginBottom: spacing[5],
}
const TAGLINE: TextStyle = {
  color: "#BAB6C8",
  fontSize: 15,
  lineHeight: 22,
  marginBottom: spacing[4] + spacing[1],
}
const IGNITE: ImageStyle = {
  marginVertical: spacing[6],
  alignSelf: "center",
}
const LOVE_WRAPPER: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "center",
}
const LOVE: TextStyle = {
  color: "#BAB6C8",
  fontSize: 15,
  lineHeight: 22,
}
const HEART: ImageStyle = {
  marginHorizontal: spacing[2],
  width: 10,
  height: 10,
  resizeMode: "contain",
}
const HINT: TextStyle = {
  color: "#BAB6C8",
  fontSize: 12,
  lineHeight: 15,
  marginVertical: spacing[2],
}
const CAMERA: ViewStyle = {
  width: 300,
  height: 300,
}

const styles = StyleSheet.create({
  separator: {
    borderColor: palette.angry,
    borderWidth: 1,
  }  
})

const ChannelLiquidityView = ({chanId, remoteBalance, localBalance}) => { 
  
  const balanceInbound = localBalance / ( localBalance + remoteBalance)
  const balanceWidth = `${balanceInbound * 100}%`

  return (
    <View style={styles.separator}>
      <Text>chanId: {chanId}</Text>
      <Text>localBalance: {localBalance}</Text>
      <Text>remoteBalance: {remoteBalance}</Text>
      <View style={{backgroundColor: palette.darkGrey}}>
        <View style={{width: balanceWidth, height: 10, backgroundColor: palette.white}} />
      </View>
    </View>
)}

export const DebugScreen = inject("dataStore")(observer(
  ({dataStore}) => {

  const [addr, setAddr] = useState("tb1")
  const [amount, setAmount] = useState(1000)
  const [invoice, setInvoice] = useState("ln")
  const [json, setJson] = useState(getSnapshot(dataStore))

  const { navigate }  = useNavigation()
  
  React.useEffect(() => {
    const _ = async () => {
      await dataStore.lnd.listChannels()
      await dataStore.lnd.updatePendingChannels()
      setJson(getSnapshot(dataStore))
      console.tron.log('json updated')
    }

    _()
  }, [])

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

  const fileAction = new FileAction(dataStore)

  return (
    <View style={FULL}>
      <Wallpaper />
      <Screen style={CONTAINER} preset="scroll" backgroundColor={color.transparent}>
        <Header
          headerTx="debugScreen.howTo"
          leftIcon="back"
          style={HEADER}
          titleStyle={HEADER_TITLE}
        />
        <JSONTree data={json} />
        <View>
          <Text>Open channels</Text>
          {dataStore.lnd.channels.map((item) => (
            <ChannelLiquidityView 
              chanId={item.chanId}
              remoteBalance={item.remoteBalance}
              localBalance={item.localBalance}
             />
          ))}
        </View>
        <Text>Channel opening</Text>
        {dataStore.lnd.pendingChannels.map((item) => (
            <View style={styles.separator}>
              <Text>remoteNodePub</Text>
              <Text>{item.remoteNodePub}</Text>
              <Text>channelPoint</Text>
              <Text>{item.channelPoint}</Text>
              <Text>capacity</Text>
              <Text>{item.capacity}</Text>
              <Text>remoteBalance</Text>
              <Text>{item.remoteBalance}</Text>
            </View>
          ))}
        <VersionComponent />
        <View>
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="Delete account and log out"
            onPress={async () => {
              if (auth().currentUser) {
                try {
                  await functions().httpsCallable("deleteCurrentUser")({})
                } catch (err) {
                  console.tron.error(err)
                }
              }
              await auth().signOut()
              await dataStore.onboarding._reset() // do not synchronize state update
              await fileAction.deleteAllLndData()
              Alert.alert("user succesfully deleted. Delete your app to start from a clean state")
            }}
          />
          <Text>UID: {auth().currentUser?.uid}</Text>
          <Text>BTC price: {dataStore.rates.BTC}</Text>
          <Text>lnd error: {dataStore.lnd.error}</Text>
          <Text
            style={TAGLINE}
            text={dataStore.lnd.walletExist ? "Wallet exist" : "Wallet doesn't exist"}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="Delete lnd wallet"
            onPress={() => fileAction.deleteWalletDBAndChannelBackup()}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="Delete all lnd data"
            onPress={() => fileAction.deleteAllLndData()}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="print directory"
            onPress={() => console.tron.log(RNFS.DocumentDirectoryPath)}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="test functions"
            onPress={() => functions().httpsCallable("test")({})}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="InitState"
            onPress={dataStore.lnd.initState}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="Gen Seed"
            onPress={dataStore.lnd.genSeed}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="initWallet"
            onPress={dataStore.lnd.initWallet}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text={`lndReady. status: ${dataStore.lnd.lndReady ? "true" : "false"}`}
            onPress={dataStore.lnd.unlockWallet}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="send pubKey"
            onPress={dataStore.lnd.sendPubKey}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="connect Peer"
            onPress={dataStore.lnd.connectGaloyPeer}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="list peers"
            onPress={dataStore.lnd.listPeers}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="open channel"
            onPress={dataStore.lnd.openChannel}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="add invoice"
            onPress={() => Clipboard.setString(dataStore.lnd.addInvoice({ value: 1000 }))}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="update balance"
            onPress={dataStore.lnd.updateBalance}
          />
          <TextInput style={HINT} value={`balance: ${dataStore.lnd.balance}`} />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="update invoice"
            onPress={dataStore.lnd.updateInvoices}
          />
          <TextInput
            style={HINT}
            editable
            onChangeText={invoice => setInvoice(invoice)}
            value={invoice}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="list payments"
            onPress={dataStore.lnd.list_payments}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="Quote Buy BTC"
            onPress={() => dataStore.exchange.quoteBTC("buy")}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="Quote Sell BTC"
            onPress={() => dataStore.exchange.quoteBTC("sell")}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="Buy BTC"
            onPress={dataStore.exchange.buyBTC}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="Sell BTC"
            onPress={dataStore.exchange.sellBTC}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="newAddress"
            onPress={dataStore.lnd.newAddress}
          />
          <QRCode>{dataStore.lnd.onChainAddress}</QRCode>
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="update_transactions"
            onPress={dataStore.lnd.update_transactions}
          />
          <TextInput
            style={HINT}
            editable
            onChangeText={addr => setAddr(addr)}
            value={addr}
          />
          <TextInput
            style={HINT}
            editable
            onChangeText={amount => setAmount(amount)}
            value={amount.toString()}
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="sendCoins"
            onPress={() =>
              dataStore.lnd.sendTransaction(addr, amount)
            }
          />
          <Button
            style={DEMO}
            textStyle={DEMO_TEXT}
            text="Crash"
            onPress={() => {
              crashlytics().log('Testing crash');
              crashlytics().crash();
            }}
          />
        </View>
      </Screen>
    </View>
  )
}))