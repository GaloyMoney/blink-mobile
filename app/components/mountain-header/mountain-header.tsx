import * as React from "react"
import { View, Text, StyleSheet } from "react-native"
import Montain from "./mointains-cloud-01.svg"
import { palette } from "../../theme/palette"
import { useI18nContext } from "@app/i18n/i18n-react"

const styles = StyleSheet.create({
  amountContainer: {
    alignItems: "center",
    paddingBottom: 16,
  },

  headerSection: {
    color: palette.white,
    fontSize: 16,
    paddingTop: 18,
  },

  mountainView: {
    alignItems: "center",
  },

  titleSection: {
    color: palette.white,
    fontSize: 24,
    fontWeight: "bold",
    paddingTop: 6,
  },

  topView: {
    marginTop: 80,
  },
})

type Props = {
  amount: string
  color: string
}

export const MountainHeader = ({ amount, color }: Props) => {
  const { LL } = useI18nContext()
  return (
    <View style={{ backgroundColor: color }}>
      <View style={styles.topView}>
        <View style={styles.amountContainer}>
          <Text style={styles.headerSection}>{LL.EarnScreen.youEarned()}</Text>
          <Text style={styles.titleSection}>{amount} sats</Text>
        </View>
      </View>
      <View style={styles.mountainView}>
        <Montain />
      </View>
    </View>
  )
}
