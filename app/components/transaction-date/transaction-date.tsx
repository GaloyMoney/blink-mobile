import React from "react"
import { Text } from "react-native"
import moment from "moment"
import { GaloyGQL } from "@galoymoney/client"
import { toMomentLocale } from "@app/utils/date"
import { useI18nContext } from "@app/i18n/i18n-react"
import { detectLocale } from "@app/i18n/i18n-util"

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
  const { LL } = useI18nContext()
  const { status, createdAt } = tx
  moment.locale(toMomentLocale(detectLocale()))
  if (status === "PENDING") {
    return <Text>{LL.common.pending()?.toUpperCase()}</Text>
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
