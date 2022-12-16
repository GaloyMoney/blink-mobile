/* eslint-disable react-native/no-inline-styles */
import * as React from "react"
import { RouteProp } from "@react-navigation/native"
import { Linking, Pressable, View } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"

import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { GALOY_PAY_DOMAIN } from "../../config/support"

import { bech32 } from "bech32"
import QRCode from "react-native-qrcode-svg"
import { Button, Text } from "@rneui/themed"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { color } from "@app/theme"
import { toastShow } from "@app/utils/toast"

import { copyPaymentInfoToClipboard } from "@app/utils/clipboard"
import { useI18nContext } from "@app/i18n/i18n-react"

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
    marginBottom: "32rem",
    marginHorizontal: "24rem",
    marginTop: "32rem",
  },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "lnurl">
  route: RouteProp<RootStackParamList, "lnurl">
}

export const LnurlScreen: ScreenType = ({ route }: Props) => {
  const { username } = route.params
  const { LL } = useI18nContext()
  const lnurl = bech32.encode(
    "lnurl",
    bech32.toWords(
      Buffer.from(`${GALOY_PAY_DOMAIN}.well-known/lnurlp/${username}`, "utf8"),
    ),
    1500,
  )
  const lnurlAddress = `${username}@${GALOY_PAY_DOMAIN.replace("https://", "").replace(
    "/",
    "",
  )}`
  const viewPrintableVersion = (): Promise<Linking> =>
    Linking.openURL(`${GALOY_PAY_DOMAIN}${username}/print`)

  const copyToClipboard = (str) => {
    copyPaymentInfoToClipboard(str)
    toastShow({
      message: LL.SettingsScreen.copyClipboardLnurl(),
      type: "success",
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
