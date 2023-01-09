/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-unused-styles */
import React, { useEffect } from "react"
import { color, palette } from "@app/theme"
import { Alert, KeyboardAvoidingView, StatusBar, Text, View } from "react-native"
import { Button } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import HoneyBadgerShovel from "./honey-badger-shovel-01.svg"
import { SafeAreaView } from "react-native-safe-area-context"
import { isIos } from "@app/utils/helper"
import { offsets, presets } from "@app/components/screen/screen.presets"
import crashlytics from "@react-native-firebase/crashlytics"
import AsyncStorage from "@react-native-async-storage/async-storage"
import useLogout from "@app/hooks/use-logout"
import ContactModal from "@app/components/contact-modal/contact-modal"
import { useI18nContext } from "@app/i18n/i18n-react"

const styles = EStyleSheet.create({
  $color: palette.white,
  $paddingHorizontal: "20rem",
  $textAlign: "center",
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
    color: color.primary,
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
    color: "$color",
    fontSize: "15rem",
    paddingHorizontal: "$paddingHorizontal",
    paddingTop: "24rem",
    paddingBottom: "24rem",
    textAlign: "$textAlign",
  },
})
export const ErrorScreen = ({ error, resetError }) => {
  const [isContactModalVisible, setIsContactModalVisible] = React.useState(false)
  const { logout } = useLogout()
  const { LL } = useI18nContext()
  useEffect(() => crashlytics().recordError(error), [error])

  const resetApp = async () => {
    await logout()
    await AsyncStorage.removeItem("apollo-cache-persist")
    resetError()
  }

  const toggleIsContactModalVisible = () => {
    setIsContactModalVisible(!isContactModalVisible)
  }

  return (
    <KeyboardAvoidingView
      style={[presets.fixed.outer, { backgroundColor: palette.lightBlue }]}
      behavior={isIos ? "padding" : null}
      keyboardVerticalOffset={offsets.none}
    >
      <StatusBar barStyle={"dark-content"} backgroundColor={palette.lightBlue} />
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
            title={"Clear App Cache and Logout"}
            onPress={() => resetApp()}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.buttonTitle}
          />
        </View>
        <ContactModal
          isVisble={isContactModalVisible}
          toggleModal={toggleIsContactModalVisible}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
