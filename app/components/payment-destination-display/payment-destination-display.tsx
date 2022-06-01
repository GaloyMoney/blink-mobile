import { palette } from "@app/theme"
import React from "react"
import { ActivityIndicator, Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

const styles = EStyleSheet.create({
  highlight: {
    fontWeight: "800",
    color: palette.darkGrey,
    fontSize: "15rem",
  },
})

export const PaymentDestinationDisplay = ({ data }: { data: string }) => {
  if (!data) {
    return <ActivityIndicator />
  }
  const firstSix = data.slice(0, 6)
  const lastSix = data.slice(-6)
  const middle = data.slice(6, -6)

  return (
    <Text numberOfLines={1} ellipsizeMode={"middle"}>
      <Text style={styles.highlight}>{firstSix}</Text>
      <Text>{middle}</Text>
      <Text style={styles.highlight}>{lastSix}</Text>
    </Text>
  )
}
