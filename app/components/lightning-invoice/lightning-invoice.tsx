import { palette } from "@app/theme"
import React from "react"
import { Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

const styles = EStyleSheet.create({
  highlight: {
    fontWeight: "800",
    color: palette.darkGrey,
  },
})

const LightningInvoice = ({ invoice }: { invoice: string }) => {
  if (!invoice) {
    return <LoadingSpinner />
  }
  const firstSix = invoice.slice(0, 6)
  const lastSix = invoice.slice(-6)
  const middle = invoice.slice(6, -6)

  return (
    <Text numberOfLines={1} ellipsizeMode={"middle"}>
      <Text style={styles.highlight}>{firstSix}</Text>
      <Text>{middle}</Text>
      <Text style={styles.highlight}>{lastSix}</Text>
    </Text>
  )
}

export default LightningInvoice
