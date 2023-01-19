import { useAppConfig } from "@app/hooks"
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

export const PaymentDestinationDisplay = ({
  destination,
  paymentType,
}: {
  destination?: string
  paymentType?: string
}) => {
  const {
    appConfig: {
      galoyInstance: { lnAddressHostname: lnDomain },
    },
  } = useAppConfig()

  if (!destination) {
    return <ActivityIndicator />
  }

  if (destination.length < 40) {
    return (
      <Text numberOfLines={1} ellipsizeMode={"middle"}>
        <Text>
          {destination}
          {paymentType === "intraledger" ? `@${lnDomain}` : ""}
        </Text>
      </Text>
    )
  }
  const firstSix = destination.slice(0, 5)
  const lastSix = destination.slice(-5)
  const middle = destination.slice(5, -5)

  return (
    <Text numberOfLines={1} ellipsizeMode={"middle"}>
      <Text style={styles.highlight}>{firstSix}</Text>
      <Text>{middle}</Text>
      <Text style={styles.highlight}>{lastSix}</Text>
    </Text>
  )
}
