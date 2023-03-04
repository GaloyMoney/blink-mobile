import React from "react"
import { Text } from "react-native"
import moment from "moment"
import { toMomentLocale } from "@app/utils/date"
import { useI18nContext } from "@app/i18n/i18n-react"
import { TxStatus } from "@app/graphql/generated"

type TransactionDateProps = {
  createdAt: number
  status: TxStatus
  friendly?: boolean
  diffDate?: boolean
}

export const TransactionDate = ({
  createdAt,
  status,
  friendly = false,
  diffDate = false,
}: TransactionDateProps) => {
  const { LL, locale } = useI18nContext()
  moment.locale(toMomentLocale(locale))
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
