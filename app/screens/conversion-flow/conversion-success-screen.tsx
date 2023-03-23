import React, { useEffect } from "react"
import { StyleSheet, Text, View } from "react-native"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import {
  SuccessIconAnimation,
  SuccessTextAnimation,
} from "@app/components/success-animation"
import { Screen } from "@app/components/screen"
import { useDarkMode } from "@app/hooks/use-darkmode"

const styles = StyleSheet.create({
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
  containerDark: {
    flex: 1,
    backgroundColor: palette.black,
    justifyContent: "center",
    alignItems: "center",
  },
  containerLight: {
    flex: 1,
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flexGrow: 1,
  },
})

export const ConversionSuccessScreen = () => {
  const darkMode = useDarkMode()

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "conversionSuccess">>()

  const { LL } = useI18nContext()
  const CALLBACK_DELAY = 3000
  useEffect(() => {
    const navigateToHomeTimeout = setTimeout(navigation.popToTop, CALLBACK_DELAY)
    return () => clearTimeout(navigateToHomeTimeout)
  }, [navigation])

  return (
    <Screen preset="scroll" style={styles.contentContainer}>
      <View style={darkMode ? styles.containerDark : styles.containerLight}>
        <SuccessIconAnimation>
          <GaloyIcon name={"payment-success"} size={128} />
        </SuccessIconAnimation>
        <SuccessTextAnimation>
          <Text style={darkMode ? styles.successTextDark : styles.successTextLight}>
            {LL.ConversionSuccessScreen.message()}
          </Text>
        </SuccessTextAnimation>
      </View>
    </Screen>
  )
}
