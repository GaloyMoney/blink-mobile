import * as React from "react"
import { RouteProp } from "@react-navigation/native"
import { Platform, Pressable, View } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"

import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"

import { bech32 } from "bech32"
import QRCode from "react-native-qrcode-svg"
import { Text } from "react-native-elements"
import Clipboard from "@react-native-community/clipboard"
import Toast from "react-native-root-toast"
import { translate } from "@app/i18n"

const styles = EStyleSheet.create({
  container: {
    backgroundColor: palette.white,
    minHeight: "100%",
    paddingLeft: 24,
    paddingRight: 24,
  },
  settingContainer: {
    alignItems: "center",
    paddingTop: 40,
  },
  textContainer: {
    paddingTop: 40,
    alignItems: "center",
  },
  text: {
    fontWeight: "bold",
    fontSize: 21,
  },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "lnurl">
  route: RouteProp<RootStackParamList, "lnurl">
}

const copyToClipboard = (str) => {
  Clipboard.setString(str)

  Toast.show(translate("SettingsScreen.copyClipboardLnurl"), {
    duration: Toast.durations.LONG,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 0,
    position: -100,
    opacity: 0.5,
  })
}

export const LnurlScreen: ScreenType = ({ route }: Props) => {
  const { username } = route.params
  const lnurl = bech32.encode(
    "lnurl",
    bech32.toWords(
      Buffer.from(`https://ln.bitcoinbeach.com/.well-known/lnurlp/${username}`, "utf8"),
    ),
    1500,
  )
  const lnurlAddress = `${username}@ln.bitcoinbeach.com`

  return (
    <Screen style={styles.container} preset="scroll">
      <View style={styles.settingContainer}>
        <Pressable onPress={() => copyToClipboard(lnurl)}>
          <QRCode size={280} value={lnurl} logoBackgroundColor="white" ecl={"H"} />
        </Pressable>
      </View>
      <View style={styles.textContainer}>
        <Pressable onPress={() => copyToClipboard(lnurlAddress)}>
          <Text style={styles.text}>{lnurlAddress}</Text>
        </Pressable>
      </View>
    </Screen>
  )
}
