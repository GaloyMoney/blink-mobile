import * as React from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"

export const TwoFactorAuthenticationScreen = (): JSX.Element => {

  return (
    <Screen style={styles.container} preset="fixed">
      <View style={styles.settingContainer}>

      </View>
    </Screen>
  )
}

const styles = EStyleSheet.create({
})
