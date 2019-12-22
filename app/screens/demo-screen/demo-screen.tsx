import * as React from "react"
import {
  Image,
  ImageStyle,
  TextStyle,
  View,
  ViewStyle,
  TextInput,
  Alert,
} from "react-native"
import { NavigationScreenProps } from "react-navigation"
import { Screen } from "../../components/screen"
import { Text } from "../../components/text"
import { Button } from "../../components/button"
import { Wallpaper } from "../../components/wallpaper"
import { Header } from "../../components/header"
import { QRCode } from "../../components/qrcode"
import { color, spacing } from "../../theme"
import { logoIgnite, heart } from "./"
import { BulletItem } from "../../components/bullet-item"
import { save } from "../../utils/storage"
import { observer, inject } from "mobx-react"

import { RNCamera } from 'react-native-camera';
import { decode } from 'bip21'

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

export interface DemoScreenProps extends NavigationScreenProps<{}> {}

@inject("dataStore")
@observer
export class DemoScreen extends React.Component<DemoScreenProps, {}> {
  goBack = () => this.props.navigation.goBack(null)

  constructor(props) {
    super(props)

    this.state = {
      addr: 'tb1',
      amount: 1000
    }
  }

  demoReactotron = async () => {
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

    // Let's do some async storage stuff
    await save("Cool Name", "Boaty McBoatface")
  }

  render() {
    return (
      <View style={FULL}>
        <Wallpaper />
        <Screen
          style={CONTAINER}
          preset="scroll"
          backgroundColor={color.transparent}>
          <Header
            headerTx="demoScreen.howTo"
            leftIcon="back"
            onLeftPress={this.goBack}
            style={HEADER}
            titleStyle={HEADER_TITLE}
          />
          <Text style={TITLE} preset="header" tx="demoScreen.title" />
          <Text style={TAGLINE} tx="demoScreen.tagLine" />
          <Text>price: {this.props.dataStore.rates.BTC}</Text>
          <BulletItem text="Load up Reactotron!  You can inspect your app, view the events, interact, and so much more!" />
          <BulletItem text="Integrated here, Navigation with State, TypeScript, Storybook, Solidarity, and i18n." />
          <View>
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              text="Gen Seed"
              onPress={this.props.dataStore.lnd.genSeed}
            />
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              text="initWallet"
              onPress={this.props.dataStore.lnd.initWallet}
            />
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              text={`unlock. status: ${this.props.dataStore.lnd.walletUnlocked ? "true": "false"}`}
              onPress={this.props.dataStore.lnd.unlockWallet}
            />
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              text="nodeInfo"
              onPress={this.props.dataStore.lnd.nodeInfo}
            />
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              text="newAddress"
              onPress={this.props.dataStore.lnd.newAddress}
            />
            <QRCode>{this.props.dataStore.lnd.onChainAddress}</QRCode>
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              text="update_transactions"
              onPress={this.props.dataStore.lnd.update_transactions}
            />            
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              text="scan_QRCode"
              onPress={this.props.dataStore.lnd.update_transactions}
            />
            <RNCamera style={CAMERA}
              captureAudio={false} 
              onBarCodeRead={(event) => {
                const qr = event.data
                this.setState({qr})
                try {
                  const decoded = decode(qr)
                  this.setState({addr: decoded.address})
                  if (decoded.options.hasOwnProperty('amount')) {
                    this.setState({amount: decoded.options.amount })
                  }
                } catch (err) {
                  Alert.alert(err)
                }
              }}
            />
            <TextInput
            style={HINT}
            value={this.state.qr}
            multiline={true}
            />
            <TextInput
            style={HINT}
            editable
            onChangeText={addr => this.setState({ addr })}
            value={this.state.addr}
            />
            <TextInput
            style={HINT}
            editable
            onChangeText={amount => this.setState({ amount })}
            value={this.state.amount.toString()}
            />
            <Button
              style={DEMO}
              textStyle={DEMO_TEXT}
              text="sendCoins"
              onPress={() => this.props.dataStore.lnd.send_transaction(this.state.addr, this.state.amount)}
            />
          </View>
          <Image source={logoIgnite} style={IGNITE} />
          <View style={LOVE_WRAPPER}>
            <Text style={LOVE} text="Made with" />
            <Image source={heart} style={HEART} />
            <Text style={LOVE} text="by Infinite Red" />
          </View>
        </Screen>
      </View>
    )
  }
}
