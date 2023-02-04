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
    <View style={styles.Container}>
      <GaloyIcon name={"payment-success"} size={128} />
      <Text style={styles.successText}>{LL.ConversionSuccessScreen.message()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  successText: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "center",
  },
  Container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
