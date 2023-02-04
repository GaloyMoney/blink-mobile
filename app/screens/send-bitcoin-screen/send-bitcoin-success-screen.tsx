import { palette } from "@app/theme"
import React, { useEffect } from "react"

import { ScrollView, StyleSheet, Text, View } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "../../../utils/testProps"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

const styles = StyleSheet.create({
  scrollView: {
    flexDirection: "column",
    padding: 20,
    flex: 6,
  },
  contentContainer: {
    flexGrow: 1,
  },
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

const SendBitcoinSuccessScreen = ({
  navigation,
}: StackScreenProps<RootStackParamList, "sendBitcoinSuccess">) => {
  const { LL } = useI18nContext()
  const CALLBACK_DELAY = 2000
  useEffect(() => {
    const navigateToHomeTimeout = setTimeout(() => navigation.popToTop(), CALLBACK_DELAY)
    return () => clearTimeout(navigateToHomeTimeout)
  }, [navigation])

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.Container}>
        <GaloyIcon name={"payment-success"} size={128} />

        <Text {...testProps("Success Text")} style={styles.successText}>
          {LL.SendBitcoinScreen.success()}
        </Text>
      </View>
    </ScrollView>
  )
}

export default SendBitcoinSuccessScreen
