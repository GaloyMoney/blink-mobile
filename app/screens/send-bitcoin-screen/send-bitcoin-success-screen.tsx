import { palette } from "@app/theme"
import React, { useEffect } from "react"

import { ScrollView, StyleSheet, Text, View } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "../../../utils/testProps"
import { useApolloClient } from "@apollo/client"
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

const SendBitcoinSuccessScreen = ({
  navigation,
}: StackScreenProps<RootStackParamList, "sendBitcoinSuccess">) => {
  const client = useApolloClient()

  const { LL } = useI18nContext()
  const CALLBACK_DELAY = 2000
  useEffect(() => {
    client.refetchQueries({
      include: ["main"],
    })

    const navigateToHomeTimeout = setTimeout(() => navigation.popToTop(), CALLBACK_DELAY)
    return () => clearTimeout(navigateToHomeTimeout)
  }, [navigation, client])

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.lottieContainer}>
        <GaloyIcon name={"payment-success"} size={128} />

        <Text {...testProps("Success Text")} style={styles.successLottieText}>
          {LL.SendBitcoinScreen.success()}
        </Text>
      </View>
    </ScrollView>
  )
}

export default SendBitcoinSuccessScreen
