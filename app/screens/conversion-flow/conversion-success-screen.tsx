import React, { useEffect } from "react"
import { StyleSheet, Text, View } from "react-native"

import { palette } from "@app/theme"
import { StackScreenProps } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useI18nContext } from "@app/i18n/i18n-react"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

export const ConversionSuccessScreen = ({
  navigation,
}: StackScreenProps<RootStackParamList, "conversionSuccess">) => {
  const { LL } = useI18nContext()
  const CALLBACK_DELAY = 2000
  useEffect(() => {
    const navigateToHomeTimeout = setTimeout(() => navigation.popToTop(), CALLBACK_DELAY)
    return () => clearTimeout(navigateToHomeTimeout)
  }, [navigation])

  return (
    <View style={styles.lottieContainer}>
      <GaloyIcon name={"payment-success"} size={128} />
      <Text style={styles.successLottieText}>{LL.ConversionSuccessScreen.message()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  lottie: {
    height: 100,
    width: 100,
  },
  successLottieText: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "center",
  },
  lottieContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
