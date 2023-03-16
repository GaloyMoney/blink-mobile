import { useDarkMode } from "@app/hooks/use-darkmode"
import * as React from "react"
import { PriceHistory } from "../../components/price-history"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"

const style = { flex: 1 }

export const PriceHistoryScreen: React.FC = () => {
  const darkMode = useDarkMode()
  return (
    <Screen
      backgroundColor={darkMode ? palette.black : palette.white}
      preset="scroll"
      style={style}
    >
      <PriceHistory />
    </Screen>
  )
}
