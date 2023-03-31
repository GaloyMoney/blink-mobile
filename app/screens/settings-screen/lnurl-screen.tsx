/* eslint-disable react-native/no-inline-styles */
import * as React from "react"
import { RouteProp } from "@react-navigation/native"
import { Linking, Pressable, StyleSheet, View } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"

import type { RootStackParamList } from "../../navigation/stack-param-lists"

import { bech32 } from "bech32"
import QRCode from "react-native-qrcode-svg"
import { Button, Text } from "@rneui/base"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { color } from "@app/theme"
import { toastShow } from "@app/utils/toast"

import Clipboard from "@react-native-clipboard/clipboard"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useAppConfig } from "@app/hooks"

const styles = StyleSheet.create({
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
  lightningAddressContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "bold",
    fontSize: 50,
  },
  buttonStyle: {
    backgroundColor: color.primary,
    marginBottom: 32,
    marginHorizontal: 24,
    marginTop: 32,
  },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "lnurl">
  route: RouteProp<RootStackParamList, "lnurl">
}

export const LnurlScreen: React.FC<Props> = ({ route }) => {
  const { appConfig } = useAppConfig()
  const { posUrl } = appConfig.galoyInstance

  const { username } = route.params
  const { LL } = useI18nContext()
  const lnurl = bech32.encode(
    "lnurl",
    bech32.toWords(Buffer.from(`${posUrl}.well-known/lnurlp/${username}`, "utf8")),
    1500,
  )
  const lnurlAddress = `${username}@${posUrl.replace("https://", "").replace("/", "")}`
  const viewPrintableVersion = (): Promise<Linking> =>
    Linking.openURL(`${posUrl}${username}/print`)

  const copyToClipboard = (str: string) => {
    Clipboard.setString(str)
    toastShow({
      message: (translations) => translations.SettingsScreen.copyClipboardLnurl(),
      type: "success",
      currentTranslation: LL,
    })
  }

  return (
    <Screen style={styles.container} preset="scroll">
      <View style={styles.settingContainer}>
        <QRCode size={280} value={lnurl} logoBackgroundColor="white" ecl={"H"} />
      </View>
      <View style={styles.lightningAddressContainer}>
        <Pressable onPress={() => copyToClipboard(lnurlAddress)}>
          <Text style={styles.text} adjustsFontSizeToFit={true} numberOfLines={1}>
            <Icon name="content-copy" size={40} />
            {`  `}
            {lnurlAddress}
          </Text>
        </Pressable>
      </View>
      <View>
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={{ flex: 1 }}
          title={LL.lnurl.viewPrintable()}
          onPress={viewPrintableVersion}
        />
      </View>
    </Screen>
  )
}
