import * as React from "react"
import { View, Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import Montain from "./mointains-cloud-01.svg"
import { palette } from "../../theme/palette"
import type { ComponentType } from "../../types/jsx"
import { useI18nContext } from "@app/i18n/i18n-react"

const styles = EStyleSheet.create({
  amountContainer: {
    alignItems: "center",
    paddingBottom: 16,
  },

  headerSection: {
    color: palette.white,
    fontSize: "16rem",
    paddingTop: "18rem",
  },

  mountainView: {
    alignItems: "center",
  },

  titleSection: {
    color: palette.white,
    fontSize: "24rem",
    fontWeight: "bold",
    paddingTop: "6rem",
  },

  topView: {
    marginTop: "80rem",
  },
})

type Props = {
  amount: string
  color: string
}

export const MountainHeader: ComponentType = ({ amount, color }: Props) => {
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
