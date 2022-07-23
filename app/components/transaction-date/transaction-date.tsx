import React from "react"
import { Text } from "react-native"
import moment from "moment"
import { GaloyGQL, getLocale, translateUnknown as translate } from "@galoymoney/client"
import { toMomentLocale } from "@app/utils/date"

type TransactionDateProps = {
  tx: GaloyGQL.Transaction
  friendly?: boolean
  diffDate?: boolean
}

export const TransactionDate = ({
  tx,
  friendly = false,
  diffDate = false,
}: TransactionDateProps) => {
  const { status, createdAt } = tx
  moment.locale(toMomentLocale(getLocale()))
  if (status === "PENDING") {
    return <Text>{translate("common.pending")?.toUpperCase()}</Text>
  }
  if (diffDate) {
    return (
      <Text>
        {moment
          .duration(Math.min(0, moment.unix(createdAt).diff(moment())))
          .humanize(friendly)}
      </Text>
    )
  }
  return <Text>{moment.unix(createdAt).format("LLL")}</Text>
}
