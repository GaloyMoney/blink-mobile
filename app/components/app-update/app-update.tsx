import { gql } from "@apollo/client"
import { useMobileUpdateQuery } from "@app/graphql/generated"

import * as React from "react"
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native"
import DeviceInfo from "react-native-device-info"

import { VersionComponent } from "@app/components/version"
import { APP_STORE_LINK, PLAY_STORE_LINK } from "@app/config"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import ReactNativeModal from "react-native-modal"
import { isIos } from "../../utils/helper"
import { Button } from "@rneui/base"
import { openWhatsAppAction } from "@app/components/contact-modal"
import { isUpdateAvailableOrRequired } from "./app-update.logic"

gql`
  query mobileUpdate {
    mobileVersions {
      platform
      currentSupported
      minSupported
    }
  }
`

const styles = StyleSheet.create({
  bottom: {
    alignItems: "center",
    marginVertical: 16,
  },

  lightningText: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: "center",
  },

  versionComponent: { flex: 1, justifyContent: "flex-end", marginVertical: 48 },
  main: { flex: 5, justifyContent: "center" },
  button: { marginVertical: 12 },
})

export const AppUpdate: React.FC = () => {
  const { LL } = useI18nContext()

  const { data } = useMobileUpdateQuery({ fetchPolicy: "no-cache" })

  const buildNumber = Number(DeviceInfo.getBuildNumber())
  const mobileVersions = data?.mobileVersions

  const { available, required } = isUpdateAvailableOrRequired({
    buildNumber,
    mobileVersions,
    OS: Platform.OS,
  })

  const openInStore = async () => {
    if (isIos) {
      Linking.openURL(APP_STORE_LINK)
    } else {
      // TODO: differentiate between PlayStore and Huawei AppGallery
      Linking.openURL(PLAY_STORE_LINK)
    }
  }

  const linkUpgrade = () =>
    openInStore().catch((err) => {
      console.log({ err }, "error app link on link")
    })

  if (required) {
    return <AppUpdateModal isVisible={required} linkUpgrade={linkUpgrade} />
  }

  if (available) {
    return (
      <View style={styles.bottom}>
        <Pressable onPress={linkUpgrade}>
          <Text style={styles.lightningText}>{LL.HomeScreen.updateAvailable()}</Text>
        </Pressable>
      </View>
    )
  }

  return null
}

export const AppUpdateModal = ({
  linkUpgrade,
  isVisible,
}: {
  linkUpgrade: () => void
  isVisible: boolean
}) => {
  const { LL } = useI18nContext()

  const message = LL.AppUpdate.needToUpdateSupportMessage({
    os: isIos ? "iOS" : "Android",
    version: DeviceInfo.getReadableVersion(),
  })

  return (
    <ReactNativeModal
      isVisible={isVisible}
      backdropColor={palette.white}
      backdropOpacity={0.92}
    >
      <View style={styles.main}>
        <Text style={styles.lightningText}>{LL.AppUpdate.versionNotSupported()}</Text>
        <Text style={styles.lightningText}>{LL.AppUpdate.updateMandatory()}</Text>
        <Button
          buttonStyle={styles.button}
          onPress={linkUpgrade}
          title={LL.AppUpdate.tapHereUpdate()}
        />
        <Button
          buttonStyle={styles.button}
          onPress={() => openWhatsAppAction(message)}
          title={LL.AppUpdate.contactSupport()}
        />
      </View>
      <View style={styles.versionComponent}>
        <VersionComponent />
      </View>
    </ReactNativeModal>
  )
}
