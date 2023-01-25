import * as React from "react"
import { PriceGraphDataInjected } from "../../components/price-graph"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"

export const PriceScreen: React.FC = () => {
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <Screen backgroundColor={palette.white} preset="scroll" style={{ flex: 1 }}>
      <PriceGraphDataInjected />
    </Screen>
  )
}
