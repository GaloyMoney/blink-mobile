import React, { useEffect } from "react"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { Screen } from "@app/components/screen"
import {
  SuccessIconAnimation,
  SuccessTextAnimation,
} from "@app/components/success-animation"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { makeStyles } from "@rneui/themed"
import { Text, View } from "react-native"
import { testProps } from "../../utils/testProps"

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    flexGrow: 1,
  },
  successText: {
    color: theme.colors.darkGreyOrWhite,
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  Container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}))

const SendBitcoinSuccessScreen = () => {
  const styles = useStyles()

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
          <Text {...testProps("Success Text")} style={styles.successText}>
            {LL.SendBitcoinScreen.success()}
          </Text>
        </SuccessTextAnimation>
      </View>
    </Screen>
  )
}

export default SendBitcoinSuccessScreen
