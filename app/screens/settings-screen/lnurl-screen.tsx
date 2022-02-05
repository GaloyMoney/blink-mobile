import * as React from "react"
import { useState } from "react"
import { RouteProp, useFocusEffect } from "@react-navigation/native"
import { Text, View } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button, Switch } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import { translate } from "../../i18n"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { toastShow } from "../../utils/toast"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { PinScreenPurpose } from "../../utils/enum"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import {
  HIDE_BALANCE,
  saveHideBalance,
  saveHiddenBalanceToolTip,
} from "../../graphql/client-only-query"
import { useApolloClient, useQuery } from "@apollo/client"

const styles = EStyleSheet.create({
  button: {
    backgroundColor: palette.white,
    paddingBottom: 16,
    paddingLeft: 0,
    paddingRight: 16,
    paddingTop: 16,
  },

  buttonTitle: {
    color: palette.black,
    fontSize: 16,
    fontWeight: "normal",
  },

  container: {
    backgroundColor: palette.white,
    minHeight: "100%",
    paddingLeft: 24,
    paddingRight: 24,
  },

  description: {
    color: palette.darkGrey,
    fontSize: 14,
    marginTop: 2,
  },

  settingContainer: {
    borderBottomColor: palette.lightGrey,
    borderBottomWidth: 1,
    flexDirection: "row",
  },

  subtitle: {
    color: palette.darkGrey,
    fontSize: 16,
    marginTop: 16,
  },

  switch: {
    bottom: 18,
    position: "absolute",
    right: 0,
  },

  textContainer: {
    marginBottom: 12,
    marginRight: 60,
    marginTop: 32,
  },

  title: {
    color: palette.black,
    fontSize: 20,
    fontWeight: "bold",
  },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "security">
  route: RouteProp<RootStackParamList, "security">
}

export const LnurlScreen: ScreenType = ({ navigation }: Props) => {
  return (
    <Screen style={styles.container} preset="scroll">
      <View style={styles.settingContainer}></View>
    </Screen>
  )
}
