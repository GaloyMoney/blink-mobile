import { useAppConfig } from "@app/hooks"
import { Text, makeStyles } from "@rneui/themed"
import React from "react"
import { ActivityIndicator } from "react-native"

const useStyles = makeStyles(() => ({
  highlight: {
    fontWeight: "800",
    fontSize: 15,
  },
}))

export const PaymentDestinationDisplay = ({
  destination,
  paymentType,
}: {
  destination?: string
  paymentType?: string
}) => {
  const styles = useStyles()

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
      <Text type="p1" numberOfLines={1} ellipsizeMode={"middle"}>
        {destination}
        {paymentType === "intraledger" ? `@${lnDomain}` : ""}
      </Text>
    )
  }

  // we assume this is a bitcoin address or lightning invoice
  // not a username
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
