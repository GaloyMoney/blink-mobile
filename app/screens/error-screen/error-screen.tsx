import React, { useEffect } from "react"
import { Alert, KeyboardAvoidingView, Text, View } from "react-native"
import { getReadableVersion } from "react-native-device-info"
import { SafeAreaView } from "react-native-safe-area-context"

import ContactModal from "@app/components/contact-modal/contact-modal"
import { offsets, presets } from "@app/components/screen/screen.presets"
import { useAppConfig } from "@app/hooks"
import useLogout from "@app/hooks/use-logout"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { isIos } from "@app/utils/helper"
import crashlytics from "@react-native-firebase/crashlytics"
import { Button } from "@rneui/base"
import { makeStyles } from "@rneui/themed"

import HoneyBadgerShovel from "./honey-badger-shovel-01.svg"

const useStyles = makeStyles(({ colors }) => ({
  buttonContainer: {
    alignSelf: "center",
    marginVertical: 7,
    paddingBottom: 21,
    width: "75%",
  },
  buttonStyle: {
    backgroundColor: palette.white,
    borderRadius: 24,
  },
  buttonTitle: {
    color: colors.primary,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  header: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
  image: {
    alignSelf: "center",
    margin: 20,
  },
  text: {
    color: palette.white,
    fontSize: 15,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    textAlign: "center",
  },
}))

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
    <KeyboardAvoidingView
      style={[presets.fixed.outer, { backgroundColor: palette.lightBlue }]}
      behavior={isIos ? "padding" : undefined}
      keyboardVerticalOffset={offsets.none}
    >
      <SafeAreaView style={presets.fixed.inner}>
        <Text style={styles.header}>{LL.common.error()}</Text>
        <View style={styles.container}>
          <HoneyBadgerShovel style={styles.image} />
          <Text style={styles.text}>{LL.errors.fatalError()}</Text>
          <Button
            title={LL.errors.showError()}
            onPress={() => Alert.alert(LL.common.error(), String(error))}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.buttonTitle}
          />
          <Button
            title={LL.support.contactUs()}
            onPress={() => toggleIsContactModalVisible()}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.buttonTitle}
          />
          <Button
            title={LL.common.tryAgain()}
            onPress={() => resetError()}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.buttonTitle}
          />
          <Button
            // TODO: translate this
            title={LL.errors.clearAppData()}
            onPress={() => resetApp()}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.buttonTitle}
          />
        </View>
        <ContactModal
          isVisible={isContactModalVisible}
          toggleModal={toggleIsContactModalVisible}
          messageBody={contactMessageBody}
          messageSubject={contactMessageSubject}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
