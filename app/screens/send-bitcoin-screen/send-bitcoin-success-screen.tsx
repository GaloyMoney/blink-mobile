import { palette } from "@app/theme"
import React, { useEffect } from "react"

import { StyleSheet, Text, View } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "../../utils/testProps"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import {
  SuccessIconAnimation,
  SuccessTextAnimation,
} from "@app/components/success-animation"
import { useNavigation } from "@react-navigation/native"
import { useDarkMode } from "@app/hooks/use-darkmode"
import { Screen } from "@app/components/screen"

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  successTextLight: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  successTextDark: {
    color: palette.white,
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  Container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

const SendBitcoinSuccessScreen = () => {
  const darkMode = useDarkMode()

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinSuccess">>()

  const { LL } = useI18nContext()
  const CALLBACK_DELAY = 3000
  useEffect(() => {
    const navigateToHomeTimeout = setTimeout(navigation.popToTop, CALLBACK_DELAY)
    return () => clearTimeout(navigateToHomeTimeout)
  }, [navigation])

  return (
    <Screen preset="scroll" style={styles.contentContainer}>
      <View style={styles.Container}>
        <SuccessIconAnimation>
          <GaloyIcon name={"payment-success"} size={128} />
        </SuccessIconAnimation>
        <SuccessTextAnimation>
          <Text
            {...testProps("Success Text")}
            style={darkMode ? styles.successTextDark : styles.successTextLight}
          >
            {LL.SendBitcoinScreen.success()}
          </Text>
        </SuccessTextAnimation>
      </View>
    </Screen>
  )
}

export default SendBitcoinSuccessScreen
