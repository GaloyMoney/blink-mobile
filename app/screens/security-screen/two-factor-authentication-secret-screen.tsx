import * as React from "react"
import { Platform, Pressable, SafeAreaView, Text, View } from "react-native"
import { Button } from "react-native-elements"
import { RouteProp } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import QRCode from "react-native-qrcode-svg"
import EStyleSheet from "react-native-extended-stylesheet"
import Clipboard from "@react-native-community/clipboard"
import Toast from "react-native-root-toast"

import { Screen } from "../../components/screen"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { translate } from "../../i18n/translate"
import { color } from "../../theme/color"
import { TwoFAVerificationType } from "."

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "twoFAVerification">
  route: RouteProp<RootStackParamList, "twoFAVerification">
}

export const TwoFactorAuthenticationSecretScreen = ({
  route,
  navigation,
}: Props): JSX.Element => {
  const { twoFASecret, twoFAUri, verificationType } = route.params

  const copyToClipboard = () => {
    Clipboard.setString(twoFASecret)

    if (Platform.OS === "ios") {
      Toast.show(translate("TwoFASecretScreen.copyClipboard"), {
        duration: Toast.durations.LONG,
        shadow: false,
        animation: true,
        hideOnPress: true,
        delay: 0,
        position: -100,
        opacity: 0.5,
      })
    }
  }

  const title =
    verificationType === TwoFAVerificationType.QR
      ? translate("TwoFASecretScreen.titleQR")
      : translate("TwoFASecretScreen.titleCopy")
  const subtitle =
    verificationType === TwoFAVerificationType.QR
      ? translate("TwoFASecretScreen.subtitleQR")
      : translate("TwoFASecretScreen.subtitleCopy")

  return (
    <Screen preset="fixed">
      <SafeAreaView style={styles.container}>
        <View style={styles.titleTextContainer}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>
        </View>
        {verificationType === TwoFAVerificationType.CopySecret && (
          <View style={styles.secretContainer}>
            <Pressable onPress={copyToClipboard}>
              <Text style={styles.secretText}>{twoFASecret}</Text>
              <Text style={styles.copySecretText}>
                {translate("TwoFASecretScreen.copySecret")}
              </Text>
            </Pressable>
          </View>
        )}
        {verificationType === TwoFAVerificationType.QR && (
          <View style={styles.qrContainer}>
            <QRCode ecl="M" size={280} value={twoFAUri} />
          </View>
        )}
        <View style={styles.bottomContainer}>
          <Button
            buttonStyle={styles.buttonStyle}
            onPress={() =>
              navigation.navigate("twoFAVerification", {
                twoFASecret,
                twoFAUri,
                verificationType,
              })
            }
            title={translate("common.continue")}
          />
        </View>
      </SafeAreaView>
    </Screen>
  )
}

const styles = EStyleSheet.create({
  bottomContainer: {
    flex: 2,
    justifyContent: "flex-end",
  },

  buttonStyle: {
    backgroundColor: color.primary,
    marginBottom: "64rem",
    marginHorizontal: "12rem",
    marginTop: "32rem",
  },

  container: {
    backgroundColor: color.palette.lighterGrey,
    minHeight: "100%",
  },

  copySecretText: {
    color: color.primary,
    fontSize: "17rem",
    fontWeight: "bold",
    marginTop: "12rem",
    textAlign: "center",
  },

  qrContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
  },

  secretContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
  },

  secretText: {
    color: color.palette.darkGrey,
    fontSize: "15rem",
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitleText: {
    color: color.palette.darkGrey,
    fontSize: "14rem",
    marginHorizontal: "32rem",
    marginTop: "8rem",
    textAlign: "center",
  },

  titleText: {
    color: color.palette.darkGrey,
    fontSize: "20rem",
    fontWeight: "bold",
  },

  titleTextContainer: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: "16rem",
    marginTop: "16rem",
  },
})
