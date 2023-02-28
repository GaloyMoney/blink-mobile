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

const styles = StyleSheet.create({
  successText: {
    color: palette.darkGrey,
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

export const ConversionSuccessScreen = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "conversionSuccess">>()

  const { LL } = useI18nContext()
  const CALLBACK_DELAY = 3000
  useEffect(() => {
    const navigateToHomeTimeout = setTimeout(() => navigation.popToTop(), CALLBACK_DELAY)
    return () => clearTimeout(navigateToHomeTimeout)
  }, [navigation])

  return (
    <View style={styles.Container}>
      <SuccessIconAnimation>
        <GaloyIcon name={"payment-success"} size={128} />
      </SuccessIconAnimation>
      <SuccessTextAnimation>
        <Text style={styles.successText}>{LL.ConversionSuccessScreen.message()}</Text>
      </SuccessTextAnimation>
    </View>
  )
}
