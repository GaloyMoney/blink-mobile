import * as React from "react"
import { View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { BalanceHeader } from "../../components/balance-header"
import { PriceGraphDataInjected } from "../../components/price-graph"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"

const styles = EStyleSheet.create({
  header: {
    marginVertical: "12rem",
  },
})

export const PriceScreen: ScreenType = () => {
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <Screen backgroundColor={palette.white} preset="scroll" style={{ flex: 1 }}>
      <View style={styles.header}>
        <BalanceHeader showSecondaryCurrency={false} />
      </View>
      <PriceGraphDataInjected />
    </Screen>
  )
}
