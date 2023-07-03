import React from "react"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { Screen } from "@app/components/screen"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { makeStyles, Text } from "@rneui/themed"
import { View } from "react-native"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

const useStyles = makeStyles(() => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    rowGap: 20,
    marginBottom: 20,
  },
}))
type Props = {
  route: RouteProp<RootStackParamList, "sendBitcoinError">
}

const SendBitcoinErrorScreen = ({ route }: Props) => {
  const { LL } = useI18nContext()
  const { message } = route.params
  const styles = useStyles()

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinError">>()

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
      <View style={styles.container}>
        <GaloyIcon name={"payment-error"} size={128} />
        <Text type="h1">{LL.SendBitcoinErrorScreen.paymentError()}</Text>
        <Text type="p1">{message}</Text>
      </View>
      <GaloyPrimaryButton
        title={LL.SendBitcoinErrorScreen.goBackHome()}
        onPress={() => navigation.popToTop()}
      />
    </Screen>
  )
}

export default SendBitcoinErrorScreen
