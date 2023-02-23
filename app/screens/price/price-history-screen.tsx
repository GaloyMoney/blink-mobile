import * as React from "react"
import { PriceHistory } from "../../components/price-graph"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"

const style = { flex: 1 }

export const PriceHistoryScreen: React.FC = () => {
  return (
    <Screen backgroundColor={palette.white} preset="scroll" style={style}>
      <PriceHistory />
    </Screen>
  )
}
