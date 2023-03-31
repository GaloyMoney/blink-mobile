import { makeStyles } from "@rneui/themed"
import * as React from "react"
import { PriceHistory } from "../../components/price-history"
import { Screen } from "../../components/screen"

const useStyles = makeStyles((theme) => ({
  container: { flex: 1 },
  background: {
    color: theme.colors.black,
  },
}))

export const PriceHistoryScreen: React.FC = () => {
  const styles = useStyles()
  return (
    <Screen
      backgroundColor={styles.background.color}
      preset="scroll"
      style={styles.container}
    >
      <PriceHistory />
    </Screen>
  )
}
