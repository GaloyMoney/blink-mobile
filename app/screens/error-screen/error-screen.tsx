import React, { useEffect } from "react"
import { Alert, View } from "react-native"
import { getReadableVersion } from "react-native-device-info"

import ContactModal from "@app/components/contact-modal/contact-modal"
import { useAppConfig } from "@app/hooks"
import useLogout from "@app/hooks/use-logout"
import { useI18nContext } from "@app/i18n/i18n-react"
import { isIos } from "@app/utils/helper"
import crashlytics from "@react-native-firebase/crashlytics"
import { makeStyles, Text } from "@rneui/themed"

import HoneyBadgerShovel from "./honey-badger-shovel-01.svg"
import { Screen } from "@app/components/screen"
import { GaloyTertiaryButton } from "@app/components/atomic/galoy-tertiary-button"

export const ErrorScreen = ({
  error,
  resetError,
}: {
  error: Error
  resetError: () => void
}) => {
  const [isContactModalVisible, setIsContactModalVisible] = React.useState(false)
  const { logout } = useLogout()
  const { LL } = useI18nContext()
  const { appConfig } = useAppConfig()
  const { name: bankName } = appConfig.galoyInstance
  const styles = useStyles()

  useEffect(() => crashlytics().recordError(error), [error])

  const resetApp = async () => {
    await logout()
    resetError()
  }

  const toggleIsContactModalVisible = () => {
    setIsContactModalVisible(!isContactModalVisible)
  }

  const contactMessageBody = LL.support.defaultSupportMessage({
    os: isIos ? "iOS" : "Android",
    version: getReadableVersion(),
    bankName,
  })

  const contactMessageSubject = LL.support.defaultEmailSubject({
    bankName,
  })

  return (
    <Screen preset="scroll">
      <View style={styles.container}>
        <HoneyBadgerShovel style={styles.image} />
        <Text type="p1">{LL.errors.fatalError()}</Text>
        <GaloyTertiaryButton
          title={LL.errors.showError()}
          onPress={() => Alert.alert(LL.common.error(), String(error))}
          containerStyle={styles.buttonContainer}
        />
        <GaloyTertiaryButton
          title={LL.support.contactUs()}
          onPress={() => toggleIsContactModalVisible()}
          containerStyle={styles.buttonContainer}
        />
        <GaloyTertiaryButton
          title={LL.common.tryAgain()}
          onPress={() => resetError()}
          containerStyle={styles.buttonContainer}
        />
        <GaloyTertiaryButton
          title={LL.errors.clearAppData()}
          onPress={() => resetApp()}
          containerStyle={styles.buttonContainer}
        />
      </View>
      <ContactModal
        isVisible={isContactModalVisible}
        toggleModal={toggleIsContactModalVisible}
        messageBody={contactMessageBody}
        messageSubject={contactMessageSubject}
      />
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  buttonContainer: {
    alignSelf: "center",
    paddingBottom: 8,
    width: "80%",
    marginHorizontal: 20,
    marginVertical: 12,
  },
  container: {
    marginHorizontal: 20,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  image: {
    alignSelf: "center",
    margin: 12,
  },
}))
